import React from "react";
import { useDarkMode } from "../../hooks/useDarkMode.js";
import { useDataset } from "../../context/DatasetContext.jsx";

export default function Header() {
  const [isDark, setIsDark] = useDarkMode();
  const { dataset } = useDataset();

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold">AI Data Analyst</span>
        {dataset && (
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-3">
            {dataset.filename} · {dataset.schema?.row_count?.toLocaleString()} rows
          </span>
        )}
      </div>
      <button
        onClick={() => setIsDark((d) => !d)}
        className="text-sm px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        {isDark ? "☀️ Light" : "🌙 Dark"}
      </button>
    </header>
  );
}
