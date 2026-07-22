import React, { useState, useEffect, useRef } from "react";
import { askQuestion } from "../../services/api.js";
import { useDataset } from "../../context/DatasetContext.jsx";
import ResultChart from "../charts/ResultChart.jsx";
import ResultTable from "../charts/ResultTable.jsx";
import SqlViewer from "../charts/SqlViewer.jsx";
import { exportChatAsHtml } from "../../utils/exportChat.js";
import { toast } from "react-toastify";
import { AlertTriangle, Download, Trash2, Send, MessageSquare } from "lucide-react";

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

  // Show toast when no dataset
  useEffect(() => {
    if (!dataset) {
      toast.warning("Please upload a valid file", { toastId: "no-dataset-chat" });
    }
  }, [dataset]);

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
        const warnMsg = "I can only help with questions about your uploaded data.";
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
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/20 to-indigo-500/20 flex items-center justify-center">
          <MessageSquare size={32} className="text-brand-500" />
        </div>
        <div>
          <p className="font-semibold text-lg text-gray-800 dark:text-gray-200">
            No Dataset Loaded
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Upload a file to start asking AI questions about your data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[70vh] relative">
      {/* Off-topic popup */}
      {popup && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg bg-yellow-50/90 dark:bg-yellow-900/90 backdrop-blur-md border border-yellow-300 dark:border-yellow-600 text-yellow-800 dark:text-yellow-200 text-sm font-medium animate-fade-in">
          <AlertTriangle size={16} />
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
              className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-semibold"
              title="Download entire chat as HTML report"
            >
              <Download size={14} /> Export Chat
            </button>
          )}
          {chatMessages.length > 0 && (
            <button
              onClick={clearChat}
              className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold"
              title="Clear chat history"
            >
              <Trash2 size={14} /> Clear chat
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="chat-panel-messages flex-1 overflow-y-auto space-y-5 pr-2 custom-scrollbar">
        {chatMessages.length === 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {EXAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 hover:border-brand-400 dark:hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 text-gray-600 dark:text-gray-300 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {chatMessages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            {m.role === "user" ? (
              <div className="chat-user-bubble bg-gradient-to-br from-brand-500 to-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%] shadow-md">
                {m.content}
              </div>
            ) : (
              <div className="chat-ai-bubble w-full max-w-[90%] space-y-3">
                <div
                  className={`rounded-2xl rounded-tl-sm px-5 py-3.5 shadow-sm border ${
                    m.warning
                      ? "bg-yellow-50/80 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300"
                      : "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="prose dark:prose-invert max-w-none text-sm">
                    {m.answer || m.content}
                  </div>
                  {m.warning && typeof m.warning === "string" && (
                    <p className="text-xs mt-2 text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                      <AlertTriangle size={12} /> {m.warning}
                    </p>
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
          <div className="flex justify-start">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-sm px-5 py-3 shadow-sm flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} className="h-1" />
      </div>

      {/* Input form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="mt-4 relative"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your data…"
          className="chat-input w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md pl-4 pr-12 py-3.5 text-sm outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all shadow-sm"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 disabled:hover:bg-brand-500 transition-colors"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
