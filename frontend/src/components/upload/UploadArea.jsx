import React, { useCallback, useState } from "react";
import { uploadDataset } from "../../services/api.js";
import { useDataset } from "../../context/DatasetContext.jsx";
import { toast } from "react-toastify";
import { UploadCloud } from "lucide-react";

const ACCEPTED = ".csv,.xlsx,.xls,.db,.sqlite,.sql";

export default function UploadArea() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { setDataset } = useDataset();

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;
      setIsUploading(true);
      try {
        const { data } = await uploadDataset(file);
        setDataset(data);
        toast.success("Dataset uploaded successfully!");
      } catch (err) {
        const errMsg = err?.response?.data?.detail || "Upload failed. Please try again.";
        toast.error(errMsg);
      } finally {
        setIsUploading(false);
      }
    },
    [setDataset]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFile(e.dataTransfer.files?.[0]);
      }}
      className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 glass-panel flex flex-col items-center justify-center min-h-[300px] ${
        isDragging
          ? "border-brand-500 bg-brand-50/50 dark:bg-brand-700/20 scale-[1.02] shadow-brand-500/20 shadow-lg"
          : "border-gray-300 dark:border-gray-700 hover:border-brand-400 hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
      }`}
    >
      <div className={`mb-4 text-brand-500 transition-transform duration-500 ${isDragging ? 'scale-125' : 'animate-float'}`}>
        <UploadCloud size={64} strokeWidth={1.5} />
      </div>
      <p className="font-semibold text-lg mb-1 tracking-wide text-gray-800 dark:text-gray-200">
        Drag & drop a dataset here
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
        CSV, Excel (.xlsx/.xls), SQLite (.db/.sqlite), or SQL dump (.sql)
      </p>

      <label className="inline-block px-6 py-2.5 rounded-lg bg-gradient-to-r from-brand-500 to-indigo-600 text-white text-sm font-semibold cursor-pointer hover:shadow-lg hover:shadow-brand-500/30 transition-all active:scale-95">
        {isUploading ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Uploading…
          </span>
        ) : (
          "Browse files"
        )}
        <input
          type="file"
          accept={ACCEPTED}
          className="hidden"
          disabled={isUploading}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </label>
    </div>
  );
}
