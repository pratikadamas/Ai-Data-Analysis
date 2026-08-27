import React, { useCallback, useState, useRef } from "react";
import { uploadDataset } from "../../services/api.js";
import { useDataset } from "../../context/DatasetContext.jsx";
import { toast } from "react-toastify";
import {
  UploadCloud, X, FileText, FileSpreadsheet,
  Database, File as FileIcon, CheckCircle2, AlertCircle, Loader2,
} from "lucide-react";

const ACCEPTED = ".csv,.xlsx,.xls,.db,.sqlite,.sql";
const MAX_FILES = 10;

const FILE_ICONS = {
  csv: FileText,
  xlsx: FileSpreadsheet,
  xls: FileSpreadsheet,
  db: Database,
  sqlite: Database,
  sql: FileText,
};

function getFileIcon(filename) {
  const ext = filename.split(".").pop()?.toLowerCase();
  return FILE_ICONS[ext] || FileIcon;
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// status: "pending" | "uploading" | "done" | "error"
function buildEntry(file) {
  return { file, status: "pending", error: null };
}

export default function UploadArea() {
  const [isDragging, setIsDragging] = useState(false);
  const { 
    dataset, 
    appendDataset, 
    uploadEntries: entries, 
    setUploadEntries: setEntries, 
    isUploading: uploadingAll, 
    setIsUploading: setUploadingAll 
  } = useDataset();
  const inputRef = useRef(null);

  // ── helpers ──────────────────────────────────────────────────────────
  const updateEntry = useCallback((index, patch) =>
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, ...patch } : e))
    ), [setEntries]);

  const addFiles = useCallback((newFiles) => {
    const fileArray = Array.from(newFiles);
    setEntries((prev) => {
      const combined = [...prev, ...fileArray.map(buildEntry)];
      if (combined.length > MAX_FILES) {
        toast.warning(`Maximum ${MAX_FILES} files allowed. Only the first ${MAX_FILES} were kept.`);
        return combined.slice(0, MAX_FILES);
      }
      return combined;
    });
  }, [setEntries]);

  const removeEntry = useCallback(
    (index) => setEntries((prev) => prev.filter((_, i) => i !== index)),
    [setEntries]
  );

  // ── upload a single file by index ────────────────────────────────────
  const uploadOne = useCallback(async (index) => {
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, status: "uploading", error: null } : e))
    );
    try {
      const snapshot = await new Promise((res) =>
        setEntries((prev) => { res(prev[index]); return prev; })
      );
      const { data } = await uploadDataset([snapshot.file], dataset?.dataset_id);
      setEntries((prev) =>
        prev.map((e, i) => (i === index ? { ...e, status: "done", error: null } : e))
      );
      appendDataset(data);
      toast.success(`"${snapshot.file.name}" uploaded successfully!`);
      return { success: true, data };
    } catch (err) {
      const errMsg = err?.response?.data?.detail || "Upload failed. Please try again.";
      setEntries((prev) =>
        prev.map((e, i) => (i === index ? { ...e, status: "error", error: errMsg } : e))
      );
      toast.error(`"${entries[index]?.file?.name}" — ${errMsg}`);
      return { success: false };
    }
  }, [entries, dataset, appendDataset]);

  // ── upload all pending / errored files together ────────────────────────
  const handleUploadAll = useCallback(async () => {
    const pendingEntries = entries.filter(
      (e) => e.status === "pending" || e.status === "error"
    );

    if (pendingEntries.length === 0) {
      toast.info("All files are already uploaded.");
      return;
    }

    setUploadingAll(true);
    setEntries((prev) =>
      prev.map((e) =>
        e.status === "pending" || e.status === "error"
          ? { ...e, status: "uploading", error: null }
          : e
      )
    );

    try {
      const filesToUpload = pendingEntries.map((e) => e.file);
      const { data } = await uploadDataset(filesToUpload, dataset?.dataset_id);
      setEntries((prev) =>
        prev.map((e) =>
          e.status === "uploading" ? { ...e, status: "done", error: null } : e
        )
      );
      appendDataset(data);
      toast.success(
        filesToUpload.length === 1
          ? "File uploaded successfully!"
          : `All ${filesToUpload.length} files uploaded successfully!`
      );
    } catch (err) {
      const errMsg = err?.response?.data?.detail || "Upload failed. Please try again.";
      setEntries((prev) =>
        prev.map((e) =>
          e.status === "uploading" ? { ...e, status: "error", error: errMsg } : e
        )
      );
      toast.error(`Upload failed — ${errMsg}`);
    } finally {
      setUploadingAll(false);
    }
  }, [entries, dataset, appendDataset]);

  // ── derived state ─────────────────────────────────────────────────────
  const pendingCount = entries.filter(
    (e) => e.status === "pending" || e.status === "error"
  ).length;
  const allDone = entries.length > 0 && entries.every((e) => e.status === "done");
  const anyUploading =
    uploadingAll || entries.some((e) => e.status === "uploading");

  return (
    <div className="max-w-xl mx-auto py-4 sm:py-6 px-2 animate-fade-in">
      
      {/* ── Seamless Backgroundless Upload Container ── */}
      <div className="relative">

        {/* ── Interactive Drop Zone ── */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            addFiles(e.dataTransfer.files);
          }}
          className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all duration-300 flex flex-col items-center justify-center min-h-[200px] ${
            isDragging
              ? "border-[#0071e3] bg-[#0071e3]/[0.06] dark:bg-[#0071e3]/[0.12] scale-[1.01] shadow-[0_0_30px_rgba(0,113,227,0.2)]"
              : "border-black/[0.08] dark:border-white/[0.12] hover:border-[#0071e3]/50 hover:bg-black/[0.01] dark:hover:bg-white/[0.02]"
          }`}
        >
          {/* Animated Glowing Cloud Icon */}
          <div className={`mb-3 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            isDragging 
              ? "bg-[#0071e3] text-white scale-110 shadow-[0_8px_20px_rgba(0,113,227,0.4)]" 
              : "bg-[#0071e3]/10 text-[#0071e3] dark:bg-[#0071e3]/20 dark:text-blue-400"
          }`}>
            <UploadCloud size={24} strokeWidth={1.8} className={isDragging ? "animate-bounce" : ""} />
          </div>

          <h3 className="font-semibold text-base sm:text-lg text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight mb-1">
            Drop your dataset files here
          </h3>
          <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] max-w-sm mb-4 leading-relaxed">
            Drag & drop tables or browse from your computer. DuckDB processes and joins your data with instant zero-lag memory speed.
          </p>

          {/* Supported Format Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mb-4 max-w-md">
            {["CSV", "Excel (.xlsx)", "SQLite (.db)", "SQL Dumps"].map((format) => (
              <span 
                key={format} 
                className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.04] dark:border-white/[0.06] text-[#6e6e73] dark:text-[#a1a1a6]"
              >
                {format}
              </span>
            ))}
          </div>

          {/* Browse Files Button */}
          <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold cursor-pointer shadow-[0_4px_14px_rgba(0,113,227,0.35)] hover:shadow-[0_6px_20px_rgba(0,113,227,0.45)] active:scale-95 transition-all duration-200">
            Browse Files
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED}
              multiple
              className="hidden"
              disabled={anyUploading}
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        </div>

        {/* ── Selected File Queue List ── */}
        {entries.length > 0 && (
          <div className="mt-6 pt-6 border-t border-black/[0.04] dark:border-white/[0.06] space-y-3">
            
            {/* Header */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-[#a1a1a6]">
                Ready to Process ({entries.length}/{MAX_FILES})
              </span>
              {!anyUploading && (
                <button
                  onClick={() => setEntries([])}
                  className="text-xs text-[#86868b] hover:text-red-500 transition-colors font-medium cursor-pointer"
                >
                  Clear Queue
                </button>
              )}
            </div>

            {/* File Rows */}
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {entries.map((entry, idx) => {
                const Icon = getFileIcon(entry.file.name);
                const isPending = entry.status === "pending";
                const isUploading = entry.status === "uploading";
                const isDone = entry.status === "done";
                const isError = entry.status === "error";

                return (
                  <div
                    key={`${entry.file.name}-${idx}`}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 ${
                      isDone
                        ? "bg-emerald-500/[0.06] border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                        : isError
                        ? "bg-red-500/[0.06] border-red-500/30 text-red-700 dark:text-red-300"
                        : isUploading
                        ? "bg-[#0071e3]/[0.06] border-[#0071e3]/30"
                        : "bg-black/[0.02] dark:bg-white/[0.03] border-black/[0.06] dark:border-white/[0.08]"
                    }`}
                  >
                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isDone
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : isError
                        ? "bg-red-500/10 text-red-600 dark:text-red-400"
                        : "bg-[#0071e3]/10 text-[#0071e3] dark:text-blue-400"
                    }`}>
                      <Icon size={18} />
                    </div>

                    {/* Name + Size */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                        {entry.file.name}
                      </p>
                      <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                        {formatFileSize(entry.file.size)}
                        {isError && (
                          <span className="ml-1 text-red-500 font-medium">— {entry.error}</span>
                        )}
                      </p>
                    </div>

                    {/* Action & Status */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isUploading && (
                        <Loader2 size={16} className="text-[#0071e3] animate-spin" />
                      )}
                      {isDone && (
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      )}
                      {isError && (
                        <AlertCircle size={16} className="text-red-500" />
                      )}

                      {(isPending || isError) && !uploadingAll && (
                        <button
                          onClick={() => uploadOne(idx)}
                          disabled={anyUploading}
                          className="px-3 py-1.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
                        >
                          {isError ? "Retry" : "Upload"}
                        </button>
                      )}

                      {isPending && !anyUploading && (
                        <button
                          onClick={() => removeEntry(idx)}
                          className="p-1.5 rounded-lg text-[#86868b] hover:text-red-500 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                          title="Remove file"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Upload All Action Button */}
            {!allDone && (
              <button
                onClick={handleUploadAll}
                disabled={anyUploading || pendingCount === 0}
                className="w-full py-3 rounded-2xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-sm font-semibold shadow-[0_4px_14px_rgba(0,113,227,0.35)] hover:shadow-[0_6px_20px_rgba(0,113,227,0.45)] transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                {uploadingAll ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Uploading files…
                  </>
                ) : (
                  <>
                    <UploadCloud size={16} />
                    Upload All ({pendingCount} file{pendingCount !== 1 ? "s" : ""})
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
