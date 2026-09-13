import React from "react";
import { Database, ChevronDown } from "lucide-react";
import { useDataset } from "../../context/DatasetContext.jsx";

/**
 * DatasetSelector
 * Renders a styled dropdown to pick which uploaded file is "active".
 * Shown only when 2+ files have been uploaded.
 */
export default function DatasetSelector({ allowAll = false }) {
  const { dataset, activeFileIndex, setActiveFileIndex } = useDataset();
  const files = dataset?.files ?? [];

  if (files.length <= 1) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 glass-panel rounded-xl border border-brand-200/40 dark:border-brand-700/30 bg-brand-50/30 dark:bg-brand-900/10">
      {/* Icon + label */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider shrink-0 select-none">
        <Database size={13} />
        Dataset
      </div>

      {/* Dropdown wrapper */}
      <div className="relative flex-1">
        <select
          value={activeFileIndex}
          onChange={(e) => setActiveFileIndex(Number(e.target.value))}
          className="w-full appearance-none rounded-lg border border-stone-300/70 dark:border-gray-700 bg-[#fcfaf5] dark:bg-gray-900 px-3 py-1.5 pr-7 text-sm font-medium text-[#262422] dark:text-gray-200 outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all cursor-pointer"
        >
          {allowAll && (
            <option value={-1}>
              All Datasets (Combined — {files.length} tables)
            </option>
          )}
          {files.map((f, idx) => (
            <option key={`${f.table_name}-${idx}`} value={idx}>
              {f.filename}
              {f.schema?.row_count != null
                ? `  —  ${f.schema.row_count.toLocaleString()} rows, ${f.schema.column_count} cols`
                : ""}
            </option>
          ))}
        </select>
        {/* Custom chevron */}
        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>

      {/* Badge: total files count */}
      <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-300 border border-brand-200 dark:border-brand-700">
        {files.length} files
      </span>
    </div>
  );
}
