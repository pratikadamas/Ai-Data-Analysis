"""Wraps the Groq API for natural-language-to-SQL generation
and plain-English explanation of results.
"""
from __future__ import annotations

import json
import re

# pyrefly: ignore [missing-import]
from groq import Groq

# pyrefly: ignore [missing-import]
from app.config import settings
# pyrefly: ignore [missing-import]
from app.models.schemas import DatasetSchema
# pyrefly: ignore [missing-import]
from app.services.schema_service import schema_to_llm_prompt

# Model to use for both SQL generation and explanation.
# llama-3.3-70b-versatile is Groq's most capable general-purpose model.
_GROQ_MODEL = "llama-3.3-70b-versatile"

_SQL_SYSTEM_PROMPT = """You are a SQL generation assistant for a data analyst tool.
You will be given a table schema and a natural-language question.

Rules:
- Only generate a single read-only SQL statement (SELECT or WITH ... SELECT).
- Only reference the table and columns provided in the schema. Never invent columns.
- Never use DROP, DELETE, INSERT, UPDATE, ALTER, CREATE, TRUNCATE, ATTACH, DETACH, COPY, PRAGMA.
- Use DuckDB SQL syntax.
- Always use standard function calls with parentheses for all aggregate functions (e.g., write MAX("Discount") or SUM("Total") instead of MAX Discount or SUM Total).
- Always double-quote the table name and column names to ensure valid syntax regardless of spaces, special characters, or case-sensitivity (e.g. SELECT MAX("Discount") FROM "sales_data").
- Return ONLY raw SQL, no markdown fences, no commentary.
"""

_EXPLAIN_SYSTEM_PROMPT = """You are a data analyst explaining query results to a
non-technical business user. Given the user's question and the resulting rows,
write a short, plain-English answer (1-3 sentences). Do not mention SQL.
Do not mention your model name (e.g. Llama) or that you are an AI.
"""


class LLMServiceError(Exception):
    pass


class LLMService:
    def __init__(self) -> None:
        self._client: Groq | None = None

    def _get_client(self) -> Groq:
        if not settings.groq_api_key:
            raise LLMServiceError(
                "GROQ_API_KEY is not set. Add it to backend/.env to enable AI features."
            )
        if self._client is None:
            import httpx
            http_client = httpx.Client()
            self._client = Groq(api_key=settings.groq_api_key, http_client=http_client)
        return self._client

    def is_off_topic(self, question: str) -> bool:
        """Return True if the question is not related to data analysis / the uploaded dataset."""
        client = self._get_client()
        try:
            response = client.chat.completions.create(
                model=_GROQ_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a classifier. The user is using a data analyst tool "
                            "that can only answer questions about an uploaded dataset using SQL. "
                            "Classify the user's question as either DATA or OFF_TOPIC.\n"
                            "DATA = questions about the data, statistics, trends, aggregations, "
                            "filtering, or anything that could be answered with a SQL query.\n"
                            "OFF_TOPIC = anything else (greetings, general knowledge, coding "
                            "help, jokes, opinions, etc.).\n"
                            "Reply with exactly one word: DATA or OFF_TOPIC."
                        ),
                    },
                    {"role": "user", "content": question},
                ],
                temperature=0.0,
                max_tokens=10,
            )
            label = (response.choices[0].message.content or "").strip().upper()
            return label == "OFF_TOPIC"
        except Exception:  # noqa: BLE001 — on any error, assume on-topic to avoid blocking
            return False

    def generate_sql(self, question: str, schema: DatasetSchema) -> str:
        client = self._get_client()
        try:
            prompt = (
                f"{schema_to_llm_prompt(schema)}\n\n"
                f"Question: {question}\n\nSQL:"
            )
            response = client.chat.completions.create(
                model=_GROQ_MODEL,
                messages=[
                    {"role": "system", "content": _SQL_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.0,  # deterministic SQL
                max_tokens=512,
            )
            text = response.choices[0].message.content
            if not text or not text.strip():
                raise LLMServiceError("Groq returned an empty SQL response.")
            return _strip_code_fences(text)
        except LLMServiceError:
            raise
        except Exception as exc:
            raise LLMServiceError(f"Groq API error during SQL generation: {exc}") from exc

    def explain_results(self, question: str, columns: list[str], rows: list[dict]) -> str:
        client = self._get_client()
        try:
            preview = json.dumps(rows[:20], default=str)
            prompt = (
                f"Question: {question}\n"
                f"Columns: {columns}\n"
                f"Result rows (sample): {preview}\n\n"
                "Plain-English answer:"
            )
            response = client.chat.completions.create(
                model=_GROQ_MODEL,
                messages=[
                    {"role": "system", "content": _EXPLAIN_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
                max_tokens=256,
            )
            text = response.choices[0].message.content
            if not text:
                raise LLMServiceError("Groq returned an empty explanation.")
            return text.strip()
        except LLMServiceError:
            raise
        except Exception as exc:
            raise LLMServiceError(f"Groq API error during explanation: {exc}") from exc


def _strip_code_fences(text: str) -> str:
    text = text.strip()
    text = re.sub(r"^```(sql)?", "", text, flags=re.IGNORECASE).strip()
    text = re.sub(r"```$", "", text).strip()
    return text


llm_service = LLMService()
