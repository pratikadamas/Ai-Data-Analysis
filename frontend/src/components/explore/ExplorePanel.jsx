import React, { useState } from "react";
import { useDataset } from "../../context/DatasetContext.jsx";
import { explore } from "../../services/api.js";
import ResultChart from "../charts/ResultChart.jsx";
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

  if (!dataset) {
    return <p className="text-sm text-gray-500">Upload a dataset to start exploring.</p>;
  }

  const columns = dataset.schema.columns.map((c) => c.name);

  const runQuery = async () => {
    if (!xColumn) return;
    setError(null);
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
      setError(err?.response?.data?.detail || "Query failed.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Select label="X-axis" value={xColumn} onChange={setXColumn} options={["", ...columns]} />
        <Select label="Y-axis" value={yColumn} onChange={setYColumn} options={["", ...columns]} />
        <Select label="Aggregation" value={aggregation} onChange={setAggregation} options={AGGREGATIONS} />
        <Select label="Chart type" value={chartType} onChange={setChartType} options={CHART_TYPES} />
      </div>

      <button
        onClick={runQuery}
        className="px-4 py-2 rounded-md bg-brand-500 text-white text-sm hover:bg-brand-600"
      >
        Generate chart
      </button>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {result && (
        <div className="space-y-3">
          <ResultChart chartType={result.chart_type} chartSpec={result.chart_spec} />
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
