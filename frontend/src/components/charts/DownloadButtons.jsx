import React from "react";
import { downloadCsv, downloadExcel } from "../../services/api.js";

function saveBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

export default function DownloadButtons({ datasetId, sql }) {
  if (!sql) return null;

  const handleCsv = async () => {
    const { data } = await downloadCsv(datasetId, sql);
    saveBlob(data, "result.csv");
  };

  const handleExcel = async () => {
    const { data } = await downloadExcel(datasetId, sql);
    saveBlob(data, "result.xlsx");
  };

  const btnClass =
    "text-xs px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800";

  return (
    <div className="flex gap-2">
      <button onClick={handleCsv} className={btnClass}>⬇ CSV</button>
      <button onClick={handleExcel} className={btnClass}>⬇ Excel</button>
    </div>
  );
}
