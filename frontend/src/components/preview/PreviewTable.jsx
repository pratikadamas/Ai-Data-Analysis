import React, { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { useDataset } from "../../context/DatasetContext.jsx";

export default function PreviewTable() {
  const { dataset } = useDataset();

  const columnDefs = useMemo(
    () =>
      (dataset?.schema?.columns || []).map((col) => ({
        field: col.name,
        headerName: col.name,
        sortable: true,
        filter: true,
        resizable: true,
      })),
    [dataset]
  );

  if (!dataset) return null;

  const { schema } = dataset;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Rows" value={schema.row_count.toLocaleString()} />
        <StatCard label="Columns" value={schema.column_count} />
        <StatCard
          label="Missing values"
          value={schema.columns.reduce((sum, c) => sum + c.missing_count, 0).toLocaleString()}
        />
        <StatCard label="Duplicate rows" value={schema.duplicate_row_count.toLocaleString()} />
      </div>

      <div className="ag-theme-quartz dark:ag-theme-quartz-dark" style={{ height: 420, width: "100%" }}>
        <AgGridReact
          rowData={dataset.preview_rows}
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
