"""Pydantic request/response models shared across the API."""
from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field

ChartType = Literal[
    "bar",
    "line",
    "pie",
    "scatter",
    "histogram",
    "box",
    "area",
    "kpi",
    "heatmap",
    "horizontal_bar",
    "table",
]


class ColumnSchema(BaseModel):
    name: str
    dtype: str
    nullable: bool = True
    missing_count: int = 0
    is_numeric: bool = False
    is_datetime: bool = False
    is_categorical: bool = False


class DatasetSchema(BaseModel):
    dataset_id: str
    table_name: str
    row_count: int
    column_count: int
    columns: list[ColumnSchema]
    duplicate_row_count: int = 0


class FileInfo(BaseModel):
    filename: str
    file_type: str
    table_name: str
    schema_: DatasetSchema = Field(alias="schema")
    preview_rows: list[dict[str, Any]]

    class Config:
        populate_by_name = True


class UploadResponse(BaseModel):
    dataset_id: str
    files: list[FileInfo]


class SqlQueryRequest(BaseModel):
    dataset_id: str
    sql: str


class SqlQueryResponse(BaseModel):
    sql: str
    columns: list[str] = []
    rows: list[dict[str, Any]] = []
    error: str | None = None


class ExploreRequest(BaseModel):
    dataset_id: str
    x_column: str
    y_column: str | None = None
    aggregation: Literal["sum", "avg", "count", "min", "max", "none"] = "none"
    chart_type: ChartType = "bar"
    table_name: str | None = None  # optional: specify which table in multi-file datasets


class ChatRequest(BaseModel):
    dataset_id: str
    question: str
    conversation_id: str | None = None
    table_name: str | None = None


class ChatResponse(BaseModel):
    answer: str
    sql: str | None = None
    columns: list[str] = []
    rows: list[dict[str, Any]] = []
    chart_type: ChartType | None = None
    chart_spec: dict[str, Any] | None = None
    warning: str | None = None
    off_topic: bool = False


class ErrorResponse(BaseModel):
    detail: str
