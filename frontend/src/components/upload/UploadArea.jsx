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
  const [entries, setEntries] = useState([]);       // { file, status, error }[]
  const [uploadingAll, setUploadingAll] = useState(false);
  const { dataset, appendDataset } = useDataset();
  const inputRef = useRef(null);

  // ── helpers ──────────────────────────────────────────────────────────
  const updateEntry = useCallback((index, patch) =>
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, ...patch } : e))
    ), []);

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
  }, []);

  const removeEntry = useCallback(
    (index) => setEntries((prev) => prev.filter((_, i) => i !== index)),
    []
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
    <div className="space-y-4">
      {/* ── Drop zone ── */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`upload-zone border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 glass-panel flex flex-col items-center justify-center min-h-[240px] ${
          isDragging
            ? "border-brand-500 bg-brand-50/50 dark:bg-brand-700/20 scale-[1.02] shadow-brand-500/20 shadow-lg"
            : "border-gray-300 dark:border-gray-700 hover:border-brand-400 hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
        }`}
      >
        <div className={`mb-4 text-brand-500 transition-transform duration-500 ${isDragging ? "scale-125" : "animate-float"}`}>
          <UploadCloud size={56} strokeWidth={1.5} />
        </div>
        <p className="upload-zone-title font-semibold text-lg mb-1 tracking-wide text-gray-800 dark:text-gray-200">
          Drag &amp; drop your datasets here
        </p>
        <p className="upload-zone-subtitle text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">
          CSV, Excel (.xlsx/.xls), SQLite (.db/.sqlite), or SQL dump (.sql)
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">
          Up to {MAX_FILES} files — upload each individually or all at once
        </p>

        <label className="inline-block px-6 py-2.5 rounded-lg bg-gradient-to-r from-brand-500 to-indigo-600 text-white text-sm font-semibold cursor-pointer hover:shadow-lg hover:shadow-brand-500/30 transition-all active:scale-95">
          Browse files
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

      {/* ── File list ── */}
      {entries.length > 0 && (
        <div className="glass-panel rounded-xl p-4 space-y-3">

          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Selected Files ({entries.length}/{MAX_FILES})
            </h3>
            {!anyUploading && (
              <button
                onClick={() => setEntries([])}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          {/* File rows */}
          <div className="space-y-2 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
            {entries.map((entry, idx) => {
              const Icon = getFileIcon(entry.file.name);
              const isPending = entry.status === "pending";
              const isUploading = entry.status === "uploading";
              const isDone = entry.status === "done";
              const isError = entry.status === "error";

              return (
                <div
                  key={`${entry.file.name}-${idx}`}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    isDone
                      ? "bg-emerald-50/60 dark:bg-emerald-900/20 border-emerald-200/60 dark:border-emerald-800/40"
                      : isError
                      ? "bg-red-50/60 dark:bg-red-900/20 border-red-200/60 dark:border-red-800/40"
                      : isUploading
                      ? "bg-brand-50/60 dark:bg-brand-900/20 border-brand-200/60 dark:border-brand-700/40"
                      : "bg-gray-50/80 dark:bg-gray-800/60 border-gray-200/50 dark:border-gray-700/50"
                  }`}
                >
                  {/* File type icon */}
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isDone
                      ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-500"
                      : isError
                      ? "bg-red-100 dark:bg-red-900/40 text-red-500"
                      : "bg-brand-50 dark:bg-brand-900/30 text-brand-500"
                  }`}>
                    <Icon size={17} />
                  </div>

                  {/* Name + size */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                      {entry.file.name}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {formatFileSize(entry.file.size)}
                      {isError && (
                        <span className="ml-1 text-red-400">— {entry.error}</span>
                      )}
                    </p>
                  </div>

                  {/* Right side controls */}
                  <div className="flex items-center gap-2 shrink-0">

                    {/* Status icon */}
                    {isUploading && (
                      <Loader2 size={16} className="text-brand-500 animate-spin" />
                    )}
                    {isDone && (
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    )}
                    {isError && (
                      <AlertCircle size={16} className="text-red-500" />
                    )}

                    {/* Per-file Upload button (only when pending or errored, not while uploadingAll) */}
                    {(isPending || isError) && !uploadingAll && (
                      <button
                        onClick={() => uploadOne(idx)}
                        disabled={anyUploading}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-brand-500 to-indigo-600 text-white text-xs font-semibold hover:shadow-md hover:shadow-brand-500/30 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                      >
                        <UploadCloud size={12} />
                        {isError ? "Retry" : "Upload"}
                      </button>
                    )}

                    {/* Remove button (only pending files when not uploading) */}
                    {isPending && !anyUploading && (
                      <button
                        onClick={() => removeEntry(idx)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        title="Remove"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Upload All button ── */}
          {!allDone && (
            <button
              onClick={handleUploadAll}
              disabled={anyUploading || pendingCount === 0}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-brand-500/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploadingAll ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Uploading files one by one…
                </>
              ) : (
                <>
                  <UploadCloud size={15} />
                  Upload All ({pendingCount} file{pendingCount !== 1 ? "s" : ""})
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
