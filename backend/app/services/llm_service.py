"""Wraps the Groq API for natural-language-to-SQL generation
and plain-English explanation of results.
"""
from __future__ import annotations

import json
import re

import httpx

# pyrefly: ignore [missing-import]
from groq import Groq

# pyrefly: ignore [missing-import]
from app.config import settings
# pyrefly: ignore [missing-import]
from app.models.schemas import DatasetSchema
# pyrefly: ignore [missing-import]
from app.services.schema_service import schema_to_llm_prompt, all_schemas_to_llm_prompt

# Patch httpx.Client to handle legacy 'proxies' kwarg passed by older groq SDK versions in httpx 0.28+
_orig_httpx_client_init = httpx.Client.__init__
def _patched_httpx_client_init(self, *args, **kwargs):
    if "proxies" in kwargs:
        p = kwargs.pop("proxies")
        if p and "proxy" not in kwargs:
            kwargs["proxy"] = p
    return _orig_httpx_client_init(self, *args, **kwargs)
httpx.Client.__init__ = _patched_httpx_client_init

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
            self._client = Groq(api_key=settings.groq_api_key)
        return self._client

    def _create_completion(self, messages: list[dict], temperature: float = 0.0, max_tokens: int = 512):
        client = self._get_client()
        candidate_models = [
            settings.groq_model,
            "openai/gpt-oss-120b",
            "llama-3.3-70b-versatile",
            "llama-3.1-70b-versatile",
            "llama3-70b-8192",
            "llama3-8b-8192",
            "mixtral-8x7b-32768",
        ]
        
        # Deduplicate candidates while preserving priority order
        seen = set()
        models = [m for m in candidate_models if m and not (m in seen or seen.add(m))]

        last_exc = None
        for model_name in models:
            try:
                response = client.chat.completions.create(
                    model=model_name,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
                try:
                    from app.db.mongodb import track_groq_usage
                    tokens = getattr(getattr(response, "usage", None), "total_tokens", max_tokens)
                    track_groq_usage(call_type="completion", tokens_estimated=tokens or 150)
                except Exception:
                    pass
                return response
            except Exception as exc:
                err_msg = str(exc)
                if "model_not_found" in err_msg or "404" in err_msg or "does not exist" in err_msg:
                    last_exc = exc
                    continue
                raise exc
        if last_exc:
            raise last_exc
        raise LLMServiceError("No valid Groq LLM model found.")

    def analyze_intent(self, question: str) -> tuple[str, str]:
        """Analyze user input intent.
        Returns tuple of (intent_type, message_reply)
        intent_type is one of: "GREETING", "DATA_QUERY", "OFF_TOPIC"
        """
        clean_q = question.strip().lower()

        # 1. Fast local pattern match for common greetings, compliments, and small talk
        greetings_map = {
            "hi": "Hello! 👋 How can I help you analyze your data today?",
            "hello": "Hello! 👋 Feel free to ask any question about your uploaded dataset.",
            "hey": "Hey there! 👋 What insights would you like to explore in your data?",
            "hola": "¡Hola! How can I assist with your data analysis today?",
            "good morning": "Good morning! ☀️ Ready to analyze your data?",
            "good afternoon": "Good afternoon! How can I help with your data today?",
            "good evening": "Good evening! Let me know what data questions you have.",
            "how are you": "I'm doing great, thank you! How can I assist you with your data today?",
            "how r u": "I'm doing well! How can I help you with your dataset?",
            "who are you": "I am your AI Data Analyst. I can query your data, summarize metrics, generate tables, and create charts for you!",
            "what can you do": "You can ask me questions about your uploaded dataset in natural language, and I'll generate SQL queries, fetch results, and build charts for you!",
            "thanks": "You're very welcome! Let me know if you have any more questions about your data.",
            "thank you": "You're welcome! Happy to help with your data analysis.",
            "thank u": "You're welcome! Let me know if you need anything else.",
            "thx": "You're welcome!",
            "i love u": "Thank you so much for the kind words! 😊 How can I help you analyze your dataset today?",
            "i love you": "Thank you so much! 😊 Feel free to ask any questions about your uploaded data.",
            "nice": "Thank you! What else would you like to discover in your dataset?",
            "awesome": "Thanks! Let me know what question you'd like to ask next.",
            "cool": "Glad you like it! What data would you like to analyze?",
            "great": "Thank you! Feel free to ask another question about your data.",
        }

        if clean_q in greetings_map:
            return ("GREETING", greetings_map[clean_q])

        # Check partial phrase matches for short messages (<= 25 chars)
        if len(clean_q) <= 25:
            if any(phrase in clean_q for phrase in ["love u", "love you", "love ya"]):
                return ("GREETING", "Thank you so much for the kind words! 😊 How can I help you analyze your dataset today?")
            if clean_q.startswith(("hi ", "hello ", "hey ", "good morning", "good evening", "good afternoon")):
                if not any(kw in clean_q for kw in ["select", "show", "count", "sum", "avg", "total", "top", "where", "list", "how many", "which", "find"]):
                    return ("GREETING", "Hello! 👋 How can I help you analyze your data today?")

        # 2. LLM intent classifier for complex / ambiguous queries
        try:
            response = self._create_completion(
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an intent classifier for an AI Data Analyst app.\n"
                            "Categorize the user prompt into ONE of:\n"
                            "- GREETING: greetings, compliments, small talk, or polite conversation.\n"
                            "- DATA_QUERY: questions asking about data, numbers, statistics, columns, rows, trends, aggregations, or filters.\n"
                            "- OFF_TOPIC: general knowledge, programming help, recipes, or topics completely unrelated to data analysis.\n\n"
                            "Reply in strict JSON format:\n"
                            '{"intent": "GREETING" | "DATA_QUERY" | "OFF_TOPIC", "reply": "a short polite response if GREETING or OFF_TOPIC"}'
                        ),
                    },
                    {"role": "user", "content": question},
                ],
                temperature=0.0,
                max_tokens=150,
            )
            raw = (response.choices[0].message.content or "").strip()
            match = re.search(r"\{.*\}", raw, re.DOTALL)
            if match:
                data = json.loads(match.group(0))
                intent = str(data.get("intent", "DATA_QUERY")).upper()
                reply = str(data.get("reply", "Hello! How can I help with your data analysis?"))
                return (intent, reply)
        except Exception:
            pass

        return ("DATA_QUERY", "")

    def is_off_topic(self, question: str) -> bool:
        """Backward compatibility wrapper for is_off_topic."""
        intent, _ = self.analyze_intent(question)
        return intent == "OFF_TOPIC"

    def generate_sql(
        self,
        question: str,
        schema: DatasetSchema | list[DatasetSchema],
        target_table: str | None = None,
    ) -> str:
        try:
            if isinstance(schema, list):
                schema_text = all_schemas_to_llm_prompt(schema, target_table)
            else:
                schema_text = schema_to_llm_prompt(schema)

            prompt = (
                f"{schema_text}\n\n"
                f"Question: {question}\n\nSQL:"
            )
            response = self._create_completion(
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
        try:
            preview = json.dumps(rows[:20], default=str)
            prompt = (
                f"Question: {question}\n"
                f"Columns: {columns}\n"
                f"Result rows (sample): {preview}\n\n"
                "Plain-English answer:"
            )
            response = self._create_completion(
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
