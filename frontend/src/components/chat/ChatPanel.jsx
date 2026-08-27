import React, { useState, useEffect, useRef } from "react";
import { askQuestion } from "../../services/api.js";
import { useDataset } from "../../context/DatasetContext.jsx";
import DatasetSelector from "../shared/DatasetSelector.jsx";
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
  const { dataset, activeFile, chatMessages, setChatMessages, clearChat } = useDataset();
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

    const targetDatasetId = dataset.dataset_id;
    const targetTableName = activeFile?.table_name || null;

    setChatMessages((prev) => [...prev, { role: "user", content: q }]);
    setInput("");
    setIsLoading(true);

    try {
      const { data } = await askQuestion(targetDatasetId, q, null, targetTableName);

      // Off-topic without specific answer: show popup
      if (data.off_topic && !data.answer) {
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
        errMsg = err?.response?.data?.detail || "AI service is temporarily unavailable. Please try again in a moment.";
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
      <div className="flex flex-col items-center justify-center min-h-[420px] text-center space-y-4 max-w-md mx-auto py-12 px-6 rounded-3xl bg-white/70 dark:bg-[#1c1c1e]/70 border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-2xl shadow-xl animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-[#0071e3]/10 dark:bg-[#0071e3]/20 flex items-center justify-center text-[#0071e3] dark:text-blue-400">
          <MessageSquare size={32} />
        </div>
        <div>
          <h3 className="font-semibold text-lg text-[#1d1d1f] dark:text-[#f5f5f7]">
            No Dataset Loaded
          </h3>
          <p className="text-sm text-[#86868b] dark:text-[#a1a1a6] mt-1.5 leading-relaxed">
            Import a dataset to start asking AI questions, generating statistical summaries, and rendering automatic charts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] relative max-w-5xl mx-auto space-y-2.5 animate-fade-in">
      {/* Dataset selector + Header Row */}
      <div className="flex items-center justify-between shrink-0">
        <DatasetSelector allowAll />

        <div className="flex items-center gap-2">
          {chatMessages.some((m) => m.role === "assistant" && m.sql) && (
            <button
              onClick={() => exportChatAsHtml(chatMessages, dataset.filename)}
              className="flex items-center gap-1.5 text-xs text-[#0071e3] hover:text-[#0077ed] transition-colors px-2.5 py-1 rounded-xl bg-[#0071e3]/10 dark:bg-[#0071e3]/20 font-semibold"
              title="Download entire chat as HTML report"
            >
              <Download size={13} /> Export Report
            </button>
          )}
          {chatMessages.length > 0 && (
            <button
              onClick={clearChat}
              className="flex items-center gap-1.5 text-xs text-[#86868b] hover:text-red-500 transition-colors px-2.5 py-1 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] font-medium"
              title="Clear chat history"
            >
              <Trash2 size={13} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Off-topic popup */}
      {popup && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2 rounded-2xl shadow-lg bg-yellow-500/10 dark:bg-yellow-500/20 backdrop-blur-xl border border-yellow-500/30 text-yellow-800 dark:text-yellow-200 text-xs font-semibold animate-fade-in">
          <AlertTriangle size={14} />
          <span>{popup}</span>
          <button
            onClick={() => setPopup(null)}
            className="ml-1 text-yellow-600 hover:text-yellow-800 dark:hover:text-yellow-300 font-bold text-sm leading-none"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Messages area */}
      <div className="chat-panel-messages flex-1 overflow-y-auto space-y-4 pr-1.5 custom-scrollbar">
        {chatMessages.length === 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {EXAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="text-xs px-3 py-1.5 rounded-full bg-white/70 dark:bg-[#1c1c1e]/70 border border-black/[0.06] dark:border-white/[0.08] hover:border-[#0071e3] text-[#515154] dark:text-[#a1a1a6] hover:text-[#0071e3] transition-all cursor-pointer shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {chatMessages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            {m.role === "user" ? (
              <div className="chat-user-bubble bg-[#0071e3] text-white rounded-2xl rounded-tr-xs px-4 py-2 text-sm max-w-[80%] shadow-sm">
                {m.content}
              </div>
            ) : (
              <div className="chat-ai-bubble w-full max-w-[95%] space-y-2.5">
                <div
                  className={`rounded-2xl rounded-tl-xs p-4 shadow-2xs border ${
                    m.warning
                      ? "bg-amber-500/[0.08] border-amber-500/30 text-amber-900 dark:text-amber-200"
                      : "bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl border-black/[0.06] dark:border-white/[0.08]"
                  }`}
                >
                  <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-[#1d1d1f] dark:text-[#f5f5f7]">
                    {m.answer || m.content}
                  </div>
                  {m.warning && typeof m.warning === "string" && (
                    <p className="text-xs mt-2 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <AlertTriangle size={12} /> {m.warning}
                    </p>
                  )}
                </div>
                {m.sql && <SqlViewer sql={m.sql} />}
                {m.columns?.length > 0 && m.rows?.length > 0 && (
                  <div className="max-h-64 overflow-y-auto rounded-xl">
                    <ResultTable columns={m.columns} rows={m.rows} />
                  </div>
                )}
                {m.chart_spec && <ResultChart chartType={m.chart_type} chartSpec={m.chart_spec} />}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] rounded-2xl rounded-tl-xs px-4 py-2.5 shadow-xs flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0071e3] animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#0071e3] animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#0071e3] animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-xs text-[#86868b] dark:text-[#a1a1a6]">AI Analyzing dataset…</span>
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
        className="relative shrink-0 pt-1"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about your data… (e.g. Total revenue by region)"
          className="chat-input w-full rounded-full border border-black/[0.08] dark:border-white/[0.12] bg-white/70 dark:bg-[#1c1c1e]/70 backdrop-blur-2xl pl-5 pr-12 py-3 text-sm text-[#1d1d1f] dark:text-[#f5f5f7] outline-none focus:ring-2 focus:ring-[#0071e3]/40 focus:border-[#0071e3] transition-all shadow-xs"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#0071e3] text-white hover:bg-[#0077ed] disabled:opacity-40 transition-all cursor-pointer"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
