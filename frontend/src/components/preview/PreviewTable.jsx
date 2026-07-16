import React, { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { useDataset } from "../../context/DatasetContext.jsx";
import { Database } from "lucide-react";

export default function PreviewTable() {
  const { dataset } = useDataset();
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);

  const files = dataset?.files || [];
  const hasMultipleFiles = files.length > 1;

  // Get the active file data
  const activeFile = files[selectedFileIndex] || files[0];
  const schema = activeFile?.schema || dataset?.schema;
  const previewRows = activeFile?.preview_rows || dataset?.preview_rows || [];

  const columnDefs = useMemo(
    () =>
      (schema?.columns || []).map((col) => ({
        field: col.name,
        headerName: col.name,
        sortable: true,
        filter: true,
        resizable: true,
      })),
    [schema]
  );

  if (!dataset) return null;

  return (
    <div className="space-y-4">
      {/* Dataset selector dropdown — only shown for multi-file uploads */}
      {hasMultipleFiles && (
        <div className="flex items-center gap-3 p-3 glass-panel rounded-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider shrink-0">
            <Database size={14} className="text-brand-500" />
            Select Dataset
          </div>
          <select
            value={selectedFileIndex}
            onChange={(e) => setSelectedFileIndex(Number(e.target.value))}
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all cursor-pointer"
          >
            {files.map((f, idx) => (
              <option key={f.table_name} value={idx}>
                {f.filename} — {f.table_name} ({f.schema?.row_count?.toLocaleString()} rows, {f.schema?.column_count} cols)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Stats cards */}
      {schema && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Rows" value={schema.row_count?.toLocaleString()} />
          <StatCard label="Columns" value={schema.column_count} />
          <StatCard
            label="Missing values"
            value={schema.columns?.reduce((sum, c) => sum + c.missing_count, 0).toLocaleString()}
          />
          <StatCard label="Duplicate rows" value={schema.duplicate_row_count?.toLocaleString()} />
        </div>
      )}

      {/* Data grid */}
      <div className="ag-theme-quartz dark:ag-theme-quartz-dark" style={{ height: 420, width: "100%" }}>
        <AgGridReact
          rowData={previewRows}
          columnDefs={columnDefs}
          pagination
          paginationPageSize={25}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
