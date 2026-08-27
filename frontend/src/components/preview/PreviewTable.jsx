import React, { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { useDataset } from "../../context/DatasetContext.jsx";
import DatasetSelector from "../shared/DatasetSelector.jsx";

export default function PreviewTable() {
  const { dataset, activeFile } = useDataset();

  const schema = activeFile?.schema ?? dataset?.schema;
  const previewRows = activeFile?.preview_rows ?? dataset?.preview_rows ?? [];

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
      {/* Dataset selector — shown when multiple files are loaded */}
      <DatasetSelector />

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
      <div className="macos-card p-4 overflow-hidden">
        <div className="ag-theme-quartz dark:ag-theme-quartz-dark rounded-xl overflow-hidden" style={{ height: 440, width: "100%" }}>
          <AgGridReact
            rowData={previewRows}
            columnDefs={columnDefs}
            pagination
            paginationPageSize={25}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="macos-card p-4 transition-transform hover:-translate-y-1 duration-200">
      <p className="text-xs font-medium text-[#6e6e73] dark:text-[#a1a1a6] mb-1">{label}</p>
      <p className="text-2xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">{value}</p>
    </div>
  );
}
