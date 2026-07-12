import React, { useState } from "react";
import { useDataset } from "../../context/DatasetContext.jsx";
import { explore } from "../../services/api.js";
import ResultChart from "../charts/ResultChart.jsx";
import ResultTable from "../charts/ResultTable.jsx";
import SqlViewer from "../charts/SqlViewer.jsx";
import DownloadButtons from "../charts/DownloadButtons.jsx";

const CHART_TYPES = ["bar", "line", "pie", "scatter", "histogram", "box", "area"];
const AGGREGATIONS = ["none", "sum", "avg", "count", "min", "max"];

export default function ExplorePanel() {
  const { dataset } = useDataset();
  const [xColumn, setXColumn] = useState("");
  const [yColumn, setYColumn] = useState("");
  const [aggregation, setAggregation] = useState("sum");
  const [chartType, setChartType] = useState("bar");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!dataset) {
    return <p className="text-sm text-gray-500">Upload a dataset to start exploring.</p>;
  }

  const columns = dataset.schema.columns.map((c) => c.name);

  const runQuery = async () => {
    if (!xColumn) {
      setError("Please select an X-axis column.");
      return;
    }
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const { data } = await explore({
        dataset_id: dataset.dataset_id,
        x_column: xColumn,
        y_column: yColumn || null,
        aggregation,
        chart_type: chartType,
      });
      setResult(data);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) {
        setError("Dataset session expired. Please re-upload your file.");
      } else {
        setError(err?.response?.data?.detail || "Query failed. Please try different columns.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Determine what to render: chart and/or table
  const showChart = result && result.chart_spec && result.chart_type !== "table";
  const showTable = result && result.rows?.length > 0 && (!showChart || result.chart_type === "table");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Select label="X-axis" value={xColumn} onChange={setXColumn} options={["", ...columns]} />
        <Select label="Y-axis (optional)" value={yColumn} onChange={setYColumn} options={["", ...columns]} />
        <Select label="Aggregation" value={aggregation} onChange={setAggregation} options={AGGREGATIONS} />
        <Select label="Chart type" value={chartType} onChange={setChartType} options={CHART_TYPES} />
      </div>

      <button
        onClick={runQuery}
        disabled={loading || !xColumn}
        className="px-4 py-2 rounded-md bg-brand-500 text-white text-sm hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
            Generating…
          </>
        ) : (
          "Generate Chart"
        )}
      </button>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">⚠️ {error}</p>
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
    <label className="text-xs text-gray-500 dark:text-gray-400 flex flex-col gap-1">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100"
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
