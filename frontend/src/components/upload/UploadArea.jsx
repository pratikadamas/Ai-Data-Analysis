import React, { useCallback, useState } from "react";
import { uploadDataset } from "../../services/api.js";
import { useDataset } from "../../context/DatasetContext.jsx";
import { toast } from "react-toastify";

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
      className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
        isDragging
          ? "border-brand-500 bg-brand-50 dark:bg-brand-700/10"
          : "border-gray-300 dark:border-gray-700"
      }`}
    >
      <p className="text-4xl mb-2">📁</p>
      <p className="font-medium mb-1">Drag & drop a dataset here</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        CSV, Excel (.xlsx/.xls), SQLite (.db/.sqlite), or SQL dump (.sql)
      </p>

      <label className="inline-block px-4 py-2 rounded-md bg-brand-500 text-white text-sm cursor-pointer hover:bg-brand-600">
        {isUploading ? "Uploading…" : "Browse files"}
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
