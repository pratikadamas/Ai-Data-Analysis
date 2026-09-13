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
    <div className="space-y-3 flex flex-col h-[calc(100vh-100px)] animate-fade-in">
      {/* Tab Header Banner */}
      <div className="flex items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="font-outfit font-bold text-xl sm:text-2xl bg-gradient-to-r from-[#262422] via-[#0071e3] to-[#06b6d4] dark:from-[#f5f5f7] dark:via-[#38bdf8] dark:to-[#06b6d4] bg-clip-text text-transparent tracking-tight">
            Data Preview & Statistics
          </h2>
          <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-0.5 font-sans">
            Inspect raw schemas, check column data types, null counts, and preview table rows.
          </p>
        </div>
      </div>

      {/* Dataset selector + Compact Stats Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
        <DatasetSelector />
        
        {schema && (
          <div className="flex items-center gap-2 sm:gap-4 px-3.5 py-1.5 rounded-2xl bg-[#fcfaf5]/85 dark:bg-[#1c1c1e]/70 border border-stone-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-xs text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[#86868b] dark:text-[#a1a1a6]">Rows:</span>
              <span className="font-semibold text-[#262422] dark:text-[#f5f5f7]">{schema.row_count?.toLocaleString()}</span>
            </div>
            <span className="text-black/20 dark:text-white/20">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[#86868b] dark:text-[#a1a1a6]">Cols:</span>
              <span className="font-semibold text-[#262422] dark:text-[#f5f5f7]">{schema.column_count}</span>
            </div>
            <span className="text-black/20 dark:text-white/20">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[#86868b] dark:text-[#a1a1a6]">Missing:</span>
              <span className="font-semibold text-[#262422] dark:text-[#f5f5f7]">{schema.columns?.reduce((sum, c) => sum + c.missing_count, 0).toLocaleString()}</span>
            </div>
            <span className="text-black/20 dark:text-white/20">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[#86868b] dark:text-[#a1a1a6]">Duplicates:</span>
              <span className="font-semibold text-[#262422] dark:text-[#f5f5f7]">{schema.duplicate_row_count?.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Data grid in Full-Fitted macOS Container */}
      <div className="flex-1 rounded-2xl bg-[#fcfaf5]/85 dark:bg-[#1c1c1e]/80 border border-stone-200/80 dark:border-white/[0.08] backdrop-blur-2xl shadow-sm p-2 sm:p-3 overflow-hidden flex flex-col">
        <div className="ag-theme-quartz dark:ag-theme-quartz-dark rounded-xl overflow-hidden w-full flex-1">
          <AgGridReact
            rowData={previewRows}
            columnDefs={columnDefs}
            pagination
            paginationPageSize={20}
            defaultColDef={{
              sortable: true,
              filter: true,
              resizable: true,
              minWidth: 110,
              flex: 1,
            }}
            animateRows={true}
            rowSelection="single"
          />
        </div>
      </div>
    </div>
  );
}
