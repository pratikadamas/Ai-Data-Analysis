"""Deterministic chart-type selection.

The AI is not trusted to pick the chart type on its own; instead we
inspect the shape of the result set (column count, dtypes, cardinality)
and apply simple rules, per the project spec.
"""
from __future__ import annotations

from typing import Any

# pyrefly: ignore [missing-import]
from app.models.schemas import ChartType


def _is_numeric(value: Any) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def _is_datelike(value: Any) -> bool:
    return isinstance(value, str) and bool(
        __import__("re").match(r"^\d{4}-\d{2}-\d{2}", value)
    )


def select_chart_type(columns: list[str], rows: list[dict[str, Any]]) -> ChartType:
    """Pick a chart type based on the shape of the query result."""
    if not rows:
        return "table"

    if len(columns) == 1 and len(rows) == 1:
        return "kpi"

    sample = rows[0]
    col_types = {col: type(sample.get(col)) for col in columns}
    numeric_cols = [c for c in columns if _is_numeric(sample.get(c))]
    date_cols = [c for c in columns if _is_datelike(sample.get(c))]
    non_numeric_cols = [c for c in columns if c not in numeric_cols]

    if len(numeric_cols) == 1 and len(rows) == 1 and len(columns) == 1:
        return "kpi"

    if date_cols and numeric_cols:
        return "line"

    if len(numeric_cols) == 2 and len(non_numeric_cols) == 0:
        return "scatter"

    if len(numeric_cols) >= 1 and len(non_numeric_cols) == 1:
        if len(rows) > 12:
            return "horizontal_bar"
        return "bar"

    if len(numeric_cols) >= 3:
        return "heatmap"

    return "table"


def build_chart_spec(
    chart_type: ChartType, columns: list[str], rows: list[dict[str, Any]]
) -> dict[str, Any]:
    """Build a minimal Plotly-friendly spec the frontend can render directly."""
    if chart_type == "table" or not rows:
        return {"type": "table", "columns": columns, "rows": rows}

    non_numeric = [c for c in columns if not _is_numeric(rows[0].get(c))]
    numeric = [c for c in columns if _is_numeric(rows[0].get(c))]

    x_col = non_numeric[0] if non_numeric else columns[0]
    y_col = numeric[0] if numeric else (columns[1] if len(columns) > 1 else columns[0])

    return {
        "type": chart_type,
        "x": [row.get(x_col) for row in rows],
        "y": [row.get(y_col) for row in rows],
        "x_label": x_col,
        "y_label": y_col,
    }
