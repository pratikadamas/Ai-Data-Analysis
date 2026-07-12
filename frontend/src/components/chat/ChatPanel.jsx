import React, { useState, useEffect, useRef } from "react";
import { askQuestion } from "../../services/api.js";
import { useDataset } from "../../context/DatasetContext.jsx";
import ResultChart from "../charts/ResultChart.jsx";
import ResultTable from "../charts/ResultTable.jsx";
import SqlViewer from "../charts/SqlViewer.jsx";
import { exportChatAsHtml } from "../../utils/exportChat.js";
import { toast } from "react-toastify";

const EXAMPLE_QUESTIONS = [
  "Which category has the highest total?",
  "Show the trend over time.",
  "What is the average value?",
  "Top 10 records.",
  "How many records have missing values?",
];

export default function ChatPanel() {
  const { dataset, chatMessages, setChatMessages, clearChat } = useDataset();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState(null); // off-topic popup message
  const bottomRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isLoading]);

  // Auto-dismiss popup after 4 seconds
  useEffect(() => {
    if (!popup) return;
    const t = setTimeout(() => setPopup(null), 4000);
    return () => clearTimeout(t);
  }, [popup]);

  const send = async (question) => {
    const q = question ?? input;
    if (!q.trim() || !dataset) return;

    setChatMessages((prev) => [...prev, { role: "user", content: q }]);
    setInput("");
    setIsLoading(true);

    try {
      const { data } = await askQuestion(dataset.dataset_id, q);

      // Off-topic: show popup, don't add to chat history
      if (data.off_topic) {
        // Remove the user message we just added
        setChatMessages((prev) => prev.slice(0, -1));
        const warnMsg = "🚫 I can only help with questions about your uploaded data.";
        setPopup(warnMsg);
        toast.warning(warnMsg);
        return;
      }

      setChatMessages((prev) => [...prev, { role: "assistant", ...data }]);
    } catch (err) {
      const httpStatus = err?.response?.status;
      let errMsg;
      if (httpStatus === 401 || httpStatus === 403) {
        errMsg = "Your session has expired. Please log out and log in again.";
      } else if (httpStatus === 404) {
        errMsg = "Dataset session expired — please re-upload your file to continue.";
      } else if (httpStatus === 503) {
        errMsg = "AI service is temporarily unavailable. Please try again in a moment.";
      } else {
        errMsg = err?.response?.data?.detail || "Something went wrong. Please try again.";
      }
      toast.error(errMsg);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errMsg,
          warning: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }

  };

  if (!dataset) {
    return <p className="text-sm text-gray-500">Upload a dataset to start asking questions.</p>;
  }

  return (
    <div className="flex flex-col h-[70vh] relative">
      {/* Off-topic popup */}
      {popup && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg bg-yellow-50 dark:bg-yellow-900/80 border border-yellow-300 dark:border-yellow-600 text-yellow-800 dark:text-yellow-200 text-sm font-medium animate-fade-in">
          <span>{popup}</span>
          <button
            onClick={() => setPopup(null)}
            className="ml-2 text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-300 font-bold text-base leading-none"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Chat header with Export + Clear buttons */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Ask AI about <span className="font-semibold text-gray-800 dark:text-gray-200">{dataset.filename}</span>
        </span>
        <div className="flex items-center gap-2">
          {chatMessages.some((m) => m.role === "assistant" && m.sql) && (
            <button
              onClick={() => exportChatAsHtml(chatMessages, dataset.filename)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors px-2 py-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-medium"
              title="Download entire chat as HTML report"
            >
              ⬇ Export Chat
            </button>
          )}
          {chatMessages.length > 0 && (
            <button
              onClick={clearChat}
              className="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Clear chat history"
            >
              🗑 Clear chat
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {chatMessages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="text-xs px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {chatMessages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            {m.role === "user" ? (
              <div className="bg-brand-500 text-white rounded-lg px-4 py-2 max-w-[80%]">
                {m.content}
              </div>
            ) : (
              <div className="w-full max-w-[90%] space-y-2">
                <div
                  className={`rounded-lg px-4 py-2 ${
                    m.warning
                      ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  {m.answer || m.content}
                  {m.warning && typeof m.warning === "string" && (
                    <p className="text-xs mt-1 opacity-75">{m.warning}</p>
                  )}
                </div>
                {m.sql && <SqlViewer sql={m.sql} />}
                {m.columns?.length > 0 && m.rows?.length > 0 && (
                  <ResultTable columns={m.columns} rows={m.rows} />
                )}
                {m.chart_spec && <ResultChart chartType={m.chart_type} chartSpec={m.chart_spec} />}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <p className="text-sm text-gray-400 animate-pulse">Thinking…</p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="mt-3 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your data…"
          className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 rounded-md bg-brand-500 text-white text-sm hover:bg-brand-600 disabled:opacity-50"
        >
          Ask
        </button>
      </form>
    </div>
  );
}
