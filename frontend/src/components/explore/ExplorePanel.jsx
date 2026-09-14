import React, { useState, useEffect } from "react";
import { useDataset } from "../../context/DatasetContext.jsx";
import { explore } from "../../services/api.js";
import ResultChart from "../charts/ResultChart.jsx";
import ResultTable from "../charts/ResultTable.jsx";
import SqlViewer from "../charts/SqlViewer.jsx";
import DownloadButtons from "../charts/DownloadButtons.jsx";
import { ChartSkeleton } from "../shared/CardSkeleton.jsx";
import { useNetworkStatus } from "../../hooks/useNetworkStatus.js";
import { toast } from "react-toastify";
import { LineChart, Database, CloudRain } from "lucide-react";

const CHART_TYPES = ["bar", "line", "pie", "scatter", "histogram", "box", "area"];
const AGGREGATIONS = ["none", "sum", "avg", "count", "min", "max"];

export default function ExplorePanel() {
  const { dataset } = useDataset();
  const { isSlowNetwork } = useNetworkStatus();
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [xColumn, setXColumn] = useState("");
  const [yColumn, setYColumn] = useState("");
  const [aggregation, setAggregation] = useState("sum");
  const [chartType, setChartType] = useState("bar");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Show toast when no dataset
  useEffect(() => {
    if (!dataset) {
      toast.warning("Please upload a valid file", { toastId: "no-dataset-explore" });
    }
  }, [dataset]);

  // Reset columns if dataset/file changes
  useEffect(() => {
    setXColumn("");
    setYColumn("");
    setResult(null);
  }, [dataset, selectedFileIndex]);

  if (!dataset) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 max-w-md mx-auto py-8 px-4 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-[#0071e3]/10 dark:bg-[#0071e3]/20 flex items-center justify-center text-[#0071e3] dark:text-blue-400">
          <LineChart size={32} />
        </div>
        <div>
          <h3 className="font-semibold text-lg text-[#1d1d1f] dark:text-[#f5f5f7]">
            No Dataset Loaded
          </h3>
          <p className="text-sm text-[#86868b] dark:text-[#a1a1a6] mt-1.5 leading-relaxed">
            Import a dataset to visually plot distributions, categories, and time series trends.
          </p>
        </div>
      </div>
    );
  }

  const files = dataset.files || [];
  const hasMultipleFiles = files.length > 1;
  const activeFile = files[selectedFileIndex] || files[0];
  const schema = activeFile?.schema || dataset.schema;

  const columns = schema?.columns?.map((c) => c.name) || [];

  const runQuery = async () => {
    if (!xColumn) {
      const msg = "Please select an X-axis column.";
      toast.warning(msg);
      return;
    }
    setResult(null);
    setLoading(true);
    try {
      const { data } = await explore({
        dataset_id: dataset.dataset_id,
        table_name: activeFile?.table_name,
        x_column: xColumn,
        y_column: yColumn || null,
        aggregation,
        chart_type: chartType,
      });
      setResult(data);
      toast.success("Chart generated successfully!");
    } catch (err) {
      const status = err?.response?.status;
      let msg;
      if (status === 404) {
        msg = "Dataset session expired. Please re-upload your file.";
      } else {
        msg = err?.response?.data?.detail || "Query failed. Please try different columns.";
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Determine what to render: chart and/or table
  const showChart = result && result.chart_spec && result.chart_type !== "table";
  const showTable = result && result.rows?.length > 0 && (!showChart || result.chart_type === "table");

  return (
    <div className="space-y-4 max-w-5xl mx-auto animate-fade-in pb-4">
      {/* Header Banner */}
      <div>
        <h2 className="font-outfit font-bold text-xl sm:text-2xl bg-gradient-to-r from-[#262422] via-[#0071e3] to-[#06b6d4] dark:from-[#f5f5f7] dark:via-[#38bdf8] dark:to-[#06b6d4] bg-clip-text text-transparent tracking-tight">
          Explore & Visualize
        </h2>
        <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-0.5 font-sans">
          Build interactive charts, aggregate columns with DuckDB, and export presentation-ready graphs.
        </p>
      </div>

      {/* Controls Container */}
      {hasMultipleFiles && (
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#fcfaf5]/85 dark:bg-[#1c1c1e]/75 border border-stone-200/80 dark:border-white/[0.08] backdrop-blur-2xl">
          <div className="flex items-center gap-2 text-xs font-bold text-[#6e6e73] dark:text-[#a1a1a6] uppercase tracking-wider shrink-0">
            <Database size={14} className="text-[#0071e3]" />
            Select Dataset
          </div>
          <select
            value={selectedFileIndex}
            onChange={(e) => setSelectedFileIndex(Number(e.target.value))}
            className="flex-1 rounded-xl border border-stone-300/60 dark:border-white/[0.12] bg-[#f8f5ee] dark:bg-white/[0.04] px-3.5 py-2 text-sm font-medium text-[#262422] dark:text-[#f5f5f7] outline-none focus:ring-2 focus:ring-[#0071e3]/40 focus:border-[#0071e3] transition-all cursor-pointer"
          >
            {files.map((f, idx) => (
              <option key={f.table_name} value={idx}>
                {f.filename} — {f.table_name} ({f.schema?.row_count?.toLocaleString()} rows, {f.schema?.column_count} cols)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Control Grid in Apple Frosted Glass Box */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#fcfaf5]/85 dark:bg-[#1c1c1e]/75 border border-stone-200/80 dark:border-white/[0.08] backdrop-blur-2xl shadow-sm space-y-5">
        <div className="explore-controls-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Select label="X-axis" value={xColumn} onChange={setXColumn} options={["", ...columns]} />
          <Select label="Y-axis (optional)" value={yColumn} onChange={setYColumn} options={["", ...columns]} />
          <Select label="Aggregation" value={aggregation} onChange={setAggregation} options={AGGREGATIONS} />
          <Select label="Chart Type" value={chartType} onChange={setChartType} options={CHART_TYPES} />
        </div>

        <div className="flex justify-end pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
          <button
            onClick={runQuery}
            disabled={loading || !xColumn}
            className="px-5 py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-sm font-semibold shadow-[0_4px_14px_rgba(0,113,227,0.35)] hover:shadow-[0_6px_20px_rgba(0,113,227,0.45)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                Generating Plot…
              </>
            ) : (
              "Generate Chart"
            )}
          </button>
        </div>
      </div>

      {/* Loading Skeleton during query / rendering or low network */}
      {loading && (
        <div className="space-y-2">
          {isSlowNetwork && (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-200 text-xs font-semibold animate-fade-in">
              <CloudRain size={14} className="text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />
              <span>Low network connection detected — running aggregations in background…</span>
            </div>
          )}
          <ChartSkeleton 
            title={`Generating ${chartType.toUpperCase()} Chart…`} 
            message={
              yColumn 
                ? `Calculating ${aggregation.toUpperCase()}(${yColumn}) grouped by ${xColumn} in DuckDB` 
                : `Computing distribution of ${xColumn} in background`
            } 
          />
        </div>
      )}

      {result && (
        <div className="space-y-3">
          {showChart && (
            <ResultChart chartType={result.chart_type} chartSpec={result.chart_spec} />
          )}
          {showTable && (
            <ResultTable columns={result.columns} rows={result.rows} />
          )}
          {!showChart && !showTable && (
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
              No data returned for this query.
            </div>
          )}
          <SqlViewer sql={result.sql} />
          <DownloadButtons datasetId={dataset.dataset_id} sql={result.sql} />
        </div>
      )}
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="text-xs text-[#6e6e73] dark:text-gray-400 flex flex-col gap-1">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-stone-300/60 dark:border-gray-700 bg-[#fcfaf5] dark:bg-gray-900 px-2.5 py-1.5 text-sm text-[#262422] dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#0071e3]/40"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt || "—"}
          </option>
        ))}
      </select>
    </label>
  );
}
