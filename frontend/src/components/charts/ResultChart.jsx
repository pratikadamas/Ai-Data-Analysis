import React from "react";
import Plot from "react-plotly.js";

/**
 * Renders a Plotly chart from the deterministic chart_spec returned by the
 * backend (see app/services/chart_service.py::build_chart_spec).
 */
export default function ResultChart({ chartType, chartSpec }) {
  if (!chartSpec || chartSpec.type === "table") return null;

  if (chartType === "kpi") {
    const value = chartSpec.y?.[0] ?? chartSpec.x?.[0];
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">{chartSpec.y_label || chartSpec.x_label}</p>
        <p className="text-4xl font-bold mt-1">{formatValue(value)}</p>
      </div>
    );
  }

  const trace = buildTrace(chartType, chartSpec);

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-2">
      <Plot
        data={[trace]}
        layout={{
          autosize: true,
          margin: { t: 20, r: 20, b: 60, l: 60 },
          xaxis: { title: chartSpec.x_label },
          yaxis: { title: chartSpec.y_label },
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          font: { color: "inherit" },
        }}
        useResizeHandler
        style={{ width: "100%", height: "420px" }}
        config={{ displaylogo: false, toImageButtonOptions: { format: "png" } }}
      />
    </div>
  );
}

function buildTrace(chartType, spec) {
  switch (chartType) {
    case "line":
      return { x: spec.x, y: spec.y, type: "scatter", mode: "lines+markers" };
    case "pie":
      return { labels: spec.x, values: spec.y, type: "pie" };
    case "scatter":
      return { x: spec.x, y: spec.y, mode: "markers", type: "scatter" };
    case "histogram":
      return { x: spec.x, type: "histogram" };
    case "box":
      return { y: spec.y, type: "box" };
    case "area":
      return { x: spec.x, y: spec.y, fill: "tozeroy", type: "scatter" };
    case "horizontal_bar":
      return { x: spec.y, y: spec.x, type: "bar", orientation: "h" };
    case "bar":
    default:
      return { x: spec.x, y: spec.y, type: "bar" };
  }
}

function formatValue(value) {
  if (typeof value === "number") {
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  return value ?? "—";
}
