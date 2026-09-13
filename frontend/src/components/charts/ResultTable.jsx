import React, { useState } from "react";

const PAGE_SIZE = 20;

export default function ResultTable({ columns, rows }) {
  const [page, setPage] = useState(0);

  if (!columns?.length || !rows?.length) return null;

  const totalPages = Math.ceil(rows.length / PAGE_SIZE);
  const pageRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="mt-2 rounded-lg border border-stone-200/80 dark:border-gray-700 overflow-hidden text-xs">
      <div className="overflow-x-auto max-h-64">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-[#f5f1ea] dark:bg-gray-800 z-10">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-3 py-2 text-left font-semibold text-stone-700 dark:text-gray-300 border-b border-stone-200/80 dark:border-gray-700 whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => (
              <tr
                key={i}
                className={
                  i % 2 === 0
                    ? "bg-[#fdfcf9] dark:bg-gray-900"
                    : "bg-[#f7f4ec] dark:bg-gray-800/60"
                }
              >
                {columns.map((col) => (
                  <td
                    key={col}
                    className="px-3 py-1.5 text-[#262422] dark:text-gray-300 border-b border-stone-200/50 dark:border-gray-800 whitespace-nowrap max-w-[200px] truncate"
                    title={String(row[col] ?? "")}
                  >
                    {row[col] === null || row[col] === undefined ? (
                      <span className="text-stone-400 italic">null</span>
                    ) : (
                      String(row[col])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer: row count + pagination */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#f5f1ea] dark:bg-gray-800 border-t border-stone-200/80 dark:border-gray-700 text-stone-600 dark:text-gray-400">
        <span>
          {rows.length} row{rows.length !== 1 ? "s" : ""}
          {rows.length > PAGE_SIZE && ` · page ${page + 1} of ${totalPages}`}
        </span>
        {totalPages > 1 && (
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-2 py-0.5 rounded border border-stone-300 dark:border-gray-600 disabled:opacity-40 hover:bg-[#eae5da] dark:hover:bg-gray-700"
            >
              ‹
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="px-2 py-0.5 rounded border border-stone-300 dark:border-gray-600 disabled:opacity-40 hover:bg-[#eae5da] dark:hover:bg-gray-700"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
