"""AI Chat endpoint: natural language question -> generated SQL ->
validated + executed query -> plain-English explanation + chart.
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.db.duckdb_manager import duckdb_manager
from app.models.schemas import ChatRequest, ChatResponse
from app.services.chart_service import build_chart_spec, select_chart_type
from app.services.llm_service import LLMServiceError, llm_service
from app.services.schema_service import extract_schema
from app.validation.sql_validator import SQLValidationError, validate_sql

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    try:
        conn = duckdb_manager.get_connection(req.dataset_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Dataset not found or expired.") from exc

    schema = extract_schema(conn, req.dataset_id)

    # --- Off-topic guard ---------------------------------------------------
    if llm_service.is_off_topic(req.question):
        return ChatResponse(
            answer="I can only help with questions about your uploaded data.",
            off_topic=True,
        )
    # -----------------------------------------------------------------------

    try:
        raw_sql = llm_service.generate_sql(req.question, schema)
    except LLMServiceError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001 — catch any unexpected SDK errors
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error during SQL generation: {exc}",
        ) from exc

    try:
        safe_sql = validate_sql(raw_sql)
    except SQLValidationError as exc:
        return ChatResponse(
            answer="I couldn't safely answer that question.",
            sql=raw_sql,
            columns=[],
            rows=[],
            warning=str(exc),
        )

    try:
        df = conn.execute(safe_sql).fetch_df()
    except Exception as exc:  # noqa: BLE001
        return ChatResponse(
            answer="The generated query failed to run against your dataset.",
            sql=safe_sql,
            columns=[],
            rows=[],
            warning=str(exc),
        )

    columns = list(df.columns)
    rows = df.to_dict(orient="records")

    try:
        explanation = llm_service.explain_results(req.question, columns, rows)
    except LLMServiceError:
        explanation = "Here are the results for your question."
    except Exception:  # noqa: BLE001
        explanation = "Here are the results for your question."

    chart_type = select_chart_type(columns, rows)
    chart_spec = build_chart_spec(chart_type, columns, rows)

    return ChatResponse(
        answer=explanation,
        sql=safe_sql,
        columns=columns,
        rows=rows,
        chart_type=chart_type,
        chart_spec=chart_spec,
    )
