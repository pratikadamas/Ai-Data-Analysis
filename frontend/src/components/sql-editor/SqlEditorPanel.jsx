import React, { useState, useRef, useEffect, useCallback } from "react";
import { useDataset } from "../../context/DatasetContext.jsx";
import { runSqlQuery } from "../../services/api.js";
import ResultTable from "../charts/ResultTable.jsx";
import { toast } from "react-toastify";
import {
  Play,
  Database,
  Table as TableIcon,
  Copy,
  Trash2,
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

const EXAMPLE_QUERIES = [
  "SELECT * FROM table_name LIMIT 10",
  "SELECT column, COUNT(*) FROM table_name GROUP BY column",
  "SELECT * FROM table_name WHERE column > 100 ORDER BY column DESC",
];

export default function SqlEditorPanel() {
  const { dataset } = useDataset();
  const [sql, setSql] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedTables, setExpandedTables] = useState({});
  const textareaRef = useRef(null);

  // Show toast if no dataset
  useEffect(() => {
    if (!dataset) {
      toast.warning("Please upload a valid file", { toastId: "no-dataset-sql" });
    }
  }, [dataset]);

  const executeQuery = useCallback(async () => {
    if (!dataset) {
      toast.warning("Please upload a valid file", { toastId: "no-dataset-sql" });
      return;
    }
    if (!sql.trim()) {
      toast.warning("Please enter a SQL query.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { data } = await runSqlQuery(dataset.dataset_id, sql);
      if (data.error) {
        setError(data.error);
        toast.error("Query failed.");
      } else {
        setResult(data);
        toast.success(`Query returned ${data.rows?.length || 0} rows`);
      }
    } catch (err) {
      const httpStatus = err?.response?.status;
      let msg;
      if (httpStatus === 401 || httpStatus === 403) {
        msg = "Your session has expired. Please log out and log in again.";
      } else if (httpStatus === 404) {
        msg = "Dataset session expired — please re-upload your file to continue.";
      } else {
        msg = err?.response?.data?.detail || "Query execution failed.";
      }
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [dataset, sql]);

  // Ctrl+Enter to run
  const handleKeyDown = useCallback(
    (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        executeQuery();
      }
    },
    [executeQuery]
  );

  const insertTableName = useCallback((tableName) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = sql.substring(0, start);
    const after = sql.substring(end);
    const newSql = `${before}"${tableName}"${after}`;
    setSql(newSql);
    // Focus and set cursor after inserted text
    setTimeout(() => {
      textarea.focus();
      const newPos = start + tableName.length + 2;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  }, [sql]);

  const toggleTable = useCallback((tableName) => {
    setExpandedTables((prev) => ({ ...prev, [tableName]: !prev[tableName] }));
  }, []);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(sql);
    toast.success("Copied to clipboard");
  };

  const files = dataset?.files || [];

  // If no dataset, show empty state
  if (!dataset) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 max-w-md mx-auto py-8 px-4 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-[#0071e3]/10 dark:bg-[#0071e3]/20 flex items-center justify-center text-[#0071e3] dark:text-blue-400">
          <Database size={32} />
        </div>
        <div>
          <h3 className="font-semibold text-lg text-[#1d1d1f] dark:text-[#f5f5f7]">
            No Dataset Loaded
          </h3>
          <p className="text-sm text-[#86868b] dark:text-[#a1a1a6] mt-1.5 leading-relaxed">
            Import a dataset from the Data Preview tab to start executing low-latency SQL queries.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 h-[calc(100vh-100px)] flex flex-col animate-fade-in">
      {/* Header Banner */}
      <div className="shrink-0">
        <h2 className="font-outfit font-bold text-xl sm:text-2xl bg-gradient-to-r from-[#262422] via-[#0071e3] to-[#06b6d4] dark:from-[#f5f5f7] dark:via-[#38bdf8] dark:to-[#06b6d4] bg-clip-text text-transparent tracking-tight">
          SQL Studio & Schema Explorer
        </h2>
        <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-0.5 font-sans">
          Execute read-only SQL queries directly against in-memory DuckDB tables.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 overflow-hidden">
        {/* Left sidebar — Tables & Schema Inspector */}
        <div className="w-full lg:w-64 shrink-0 rounded-2xl bg-[#fcfaf5]/85 dark:bg-[#1c1c1e]/75 border border-stone-200/80 dark:border-white/[0.08] backdrop-blur-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-stone-200/60 dark:border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6e6e73] dark:text-[#a1a1a6]">
              <Database size={14} className="text-[#0071e3]" />
              Schema Explorer ({files.length})
            </div>
          </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {files.map((f) => {
            const isExpanded = expandedTables[f.table_name];
            const columns = f.schema?.columns || [];
            return (
              <div key={f.table_name}>
                <button
                  onClick={() => toggleTable(f.table_name)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-xs hover:bg-gray-100/80 dark:hover:bg-gray-800/60 transition-colors group"
                >
                  {isExpanded ? (
                    <ChevronDown size={12} className="text-gray-400 shrink-0" />
                  ) : (
                    <ChevronRight size={12} className="text-gray-400 shrink-0" />
                  )}
                  <TableIcon size={13} className="text-brand-500 shrink-0" />
                  <span
                    className="font-medium text-gray-700 dark:text-gray-300 truncate flex-1 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      insertTableName(f.table_name);
                    }}
                    title={`Click to insert "${f.table_name}" into editor`}
                  >
                    {f.table_name}
                  </span>
                </button>
                {/* Filename badge */}
                <div className="ml-7 mb-1">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                    <FileText size={9} />
                    {f.filename}
                  </span>
                </div>
                {/* Column list */}
                {isExpanded && columns.length > 0 && (
                  <div className="ml-5 pl-2 border-l border-gray-200/50 dark:border-gray-700/50 space-y-0.5 mb-1">
                    {columns.map((col) => (
                      <div
                        key={col.name}
                        className="flex items-center gap-2 px-2 py-0.5 text-[11px] rounded hover:bg-gray-100/60 dark:hover:bg-gray-800/40 cursor-pointer transition-colors"
                        onClick={() => insertTableName(col.name)}
                        title={`${col.dtype} — Click to insert`}
                      >
                        <span className="text-gray-600 dark:text-gray-400 truncate flex-1">
                          {col.name}
                        </span>
                        <span className="text-[9px] text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded font-mono shrink-0">
                          {col.dtype.split("(")[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right side — Editor + Results */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        {/* SQL Editor */}
        <div className="glass-panel rounded-xl overflow-hidden flex flex-col">
          {/* Editor toolbar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              SQL Editor
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={copyToClipboard}
                disabled={!sql.trim()}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30"
                title="Copy SQL"
              >
                <Copy size={13} />
              </button>
              <button
                onClick={() => { setSql(""); setResult(null); setError(null); }}
                disabled={!sql.trim()}
                className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-30"
                title="Clear editor"
              >
                <Trash2 size={13} />
              </button>
              <button
                onClick={executeQuery}
                disabled={loading || !sql.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Run query (Ctrl+Enter)"
              >
                {loading ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play size={12} fill="currentColor" />
                )}
                Run
              </button>
            </div>
          </div>

          {/* Editor textarea */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write your SQL query here... (Ctrl+Enter to run)"
              spellCheck={false}
              className="w-full min-h-[180px] max-h-[300px] resize-y px-4 py-3 text-sm font-mono bg-gray-950 text-gray-100 outline-none placeholder:text-gray-600 leading-relaxed"
              style={{ tabSize: 2 }}
            />
          </div>

          {/* Example queries helper */}
          {!sql.trim() && (
            <div className="px-4 py-2.5 border-t border-gray-200/50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-900/30">
              <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mb-1.5 uppercase tracking-wider">
                Example queries
              </p>
              <div className="flex flex-wrap gap-1.5">
                {EXAMPLE_QUERIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => setSql(q)}
                    className="text-[11px] px-2.5 py-1 rounded-md border border-gray-200 dark:border-gray-700 hover:border-brand-400 dark:hover:border-brand-500 text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-all font-mono bg-white/50 dark:bg-gray-800/50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error display */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50/80 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold mb-0.5">Query Error</p>
              <p className="text-xs font-mono opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && result.rows?.length > 0 && (
          <div className="flex-1 glass-panel rounded-xl overflow-hidden flex flex-col min-h-0">
            <div className="px-3 py-2 border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                Results — {result.rows.length} row{result.rows.length !== 1 ? "s" : ""}
              </span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                {result.columns?.length || 0} columns
              </span>
            </div>
            <div className="flex-1 overflow-auto p-3">
              <ResultTable columns={result.columns} rows={result.rows} />
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
  );
}
