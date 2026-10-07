"""AI Chat endpoint: natural language question -> generated SQL ->
validated + executed query -> plain-English explanation + results.
"""
from __future__ import annotations

import logging
from fastapi import APIRouter, HTTPException, Request

from app.db.duckdb_manager import duckdb_manager
from app.models.schemas import ChatRequest, ChatResponse
from app.services.llm_service import LLMServiceError, llm_service
from app.services.schema_service import extract_all_schemas
from app.utils.rate_limit import chat_limiter
from app.validation.sql_validator import SQLValidationError, validate_sql

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest, request: Request) -> ChatResponse:
    # Apply Rate limiting (max 15 chat queries per minute per IP)
    client_ip = request.client.host if request.client else "unknown"
    chat_limiter.check_rate_limit(ip=client_ip)
    try:
        conn = duckdb_manager.get_connection(req.dataset_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Dataset not found or expired.") from exc

    schemas = extract_all_schemas(conn, req.dataset_id)

    # --- 1. Fast Intent Guard (Local Only - No LLM call) ---
    fast_match = llm_service.fast_intent_match(req.question)
    if fast_match:
        intent_type, direct_reply = fast_match
        return ChatResponse(
            answer=direct_reply,
            sql=None,
            columns=[],
            rows=[],
            chart_type=None,
            chart_spec=None,
            off_topic=(intent_type == "OFF_TOPIC"),
        )
    # -------------------------------------------------------

    raw_sql = None
    safe_sql = None
    df = None
    sql_error = None
    sql_error_msg = ""

    # --- 2. Optimistic SQL Generation & Execution ---
    try:
        raw_sql = llm_service.generate_sql(req.question, schemas, target_table=req.table_name)
        safe_sql = validate_sql(raw_sql)
        df = conn.execute(safe_sql).fetch_df()
    except LLMServiceError as exc:
        # Could be an empty response because it's not a data query, or Groq API error
        sql_error = exc
        sql_error_msg = str(exc)
    except SQLValidationError as exc:
        # Invalid SQL (or prompt injection attempt)
        sql_error = exc
        sql_error_msg = str(exc)
    except Exception as exc:  # noqa: BLE001
        # DuckDB execution error (table/column not found, etc.)
        sql_error = exc
        sql_error_msg = str(exc)

    # --- 3. Fallback Intent Analysis (Only if SQL failed) ---
    if sql_error is not None:
        try:
            intent_type, direct_reply = llm_service.analyze_intent(req.question)
        except LLMServiceError:
            intent_type, direct_reply = "DATA_QUERY", ""

        if intent_type in ("GREETING", "OFF_TOPIC"):
            return ChatResponse(
                answer=direct_reply or "Hello! 👋 How can I help you analyze your data today?",
                sql=None,
                columns=[],
                rows=[],
                chart_type=None,
                chart_spec=None,
                off_topic=(intent_type == "OFF_TOPIC"),
            )

        # If it was actually a DATA_QUERY but failed, bubble up the SQL error
        # If it failed to generate SQL entirely:
        if raw_sql is None:
            logger.error(f"SQL generation failed: {sql_error}", exc_info=True)
            raise HTTPException(status_code=503, detail=sql_error_msg)

        # If it failed validation or execution:
        answer_msg = "I couldn't safely answer that question." if isinstance(sql_error, SQLValidationError) else "The generated query failed to run against your dataset."
        return ChatResponse(
            answer=answer_msg,
            sql=safe_sql or raw_sql,
            columns=[],
            rows=[],
            warning=sql_error_msg,
        )

    # --- 4. Explain Results (Only on successful execution) ---
    columns = list(df.columns)
    rows = df.to_dict(orient="records")

    try:
        explanation = llm_service.explain_results(req.question, columns, rows)
    except Exception:  # noqa: BLE001
        explanation = "Here are the results for your question."

    return ChatResponse(
        answer=explanation,
        sql=safe_sql,
        columns=columns,
        rows=rows,
        chart_type=None,
        chart_spec=None,
    )
