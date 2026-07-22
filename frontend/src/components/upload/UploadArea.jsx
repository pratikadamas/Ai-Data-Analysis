import React, { useCallback, useState, useRef } from "react";
import { uploadDataset } from "../../services/api.js";
import { useDataset } from "../../context/DatasetContext.jsx";
import { toast } from "react-toastify";
import { UploadCloud, X, FileText, FileSpreadsheet, Database, File as FileIcon } from "lucide-react";

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

export default function UploadArea() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const { setDataset } = useDataset();
  const inputRef = useRef(null);

  const addFiles = useCallback((newFiles) => {
    const fileArray = Array.from(newFiles);
    setSelectedFiles((prev) => {
      const combined = [...prev, ...fileArray];
      if (combined.length > MAX_FILES) {
        toast.warning(`Maximum ${MAX_FILES} files allowed. Only the first ${MAX_FILES} were kept.`);
        return combined.slice(0, MAX_FILES);
      }
      return combined;
    });
  }, []);

  const removeFile = useCallback((index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) {
      toast.warning("Please select at least one file.");
      return;
    }
    setIsUploading(true);
    try {
      const { data } = await uploadDataset(selectedFiles);
      setDataset(data);
      toast.success(
        selectedFiles.length === 1
          ? "Dataset uploaded successfully!"
          : `${selectedFiles.length} files uploaded successfully!`
      );
      setSelectedFiles([]);
    } catch (err) {
      const errMsg = err?.response?.data?.detail || "Upload failed. Please try again.";
      toast.error(errMsg);
    } finally {
      setIsUploading(false);
    }
  }, [selectedFiles, setDataset]);

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
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
        <div className={`mb-4 text-brand-500 transition-transform duration-500 ${isDragging ? 'scale-125' : 'animate-float'}`}>
          <UploadCloud size={56} strokeWidth={1.5} />
        </div>
        <p className="upload-zone-title font-semibold text-lg mb-1 tracking-wide text-gray-800 dark:text-gray-200">
          Drag & drop your datasets here
        </p>
        <p className="upload-zone-subtitle text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">
          CSV, Excel (.xlsx/.xls), SQLite (.db/.sqlite), or SQL dump (.sql)
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">
          Up to {MAX_FILES} files at once
        </p>

        <label className="inline-block px-6 py-2.5 rounded-lg bg-gradient-to-r from-brand-500 to-indigo-600 text-white text-sm font-semibold cursor-pointer hover:shadow-lg hover:shadow-brand-500/30 transition-all active:scale-95">
          Browse files
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            multiple
            className="hidden"
            disabled={isUploading}
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = ""; // reset to allow re-selecting same files
            }}
          />
        </label>
      </div>

      {/* Selected files list */}
      {selectedFiles.length > 0 && (
        <div className="glass-panel rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Selected Files ({selectedFiles.length}/{MAX_FILES})
            </h3>
            <button
              onClick={() => setSelectedFiles([])}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-2 max-h-[240px] overflow-y-auto custom-scrollbar pr-1">
            {selectedFiles.map((file, idx) => {
              const Icon = getFileIcon(file.name);
              return (
                <div
                  key={`${file.name}-${idx}`}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50/80 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50 group hover:border-brand-400/50 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-500 shrink-0">
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFile(idx)}
                    className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
                    title="Remove file"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={isUploading || selectedFiles.length === 0}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-brand-500 to-indigo-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-brand-500/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Uploading {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""}…
              </>
            ) : (
              <>
                <UploadCloud size={16} />
                Upload {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
