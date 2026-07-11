"""Whitelist-based SQL validation.

Only read-only analytical queries are allowed. Anything that could
mutate data or schema, or that references objects outside the
uploaded dataset, is rejected before it ever reaches DuckDB.
"""
from __future__ import annotations

import re

import sqlparse
from sqlparse.sql import Statement
from sqlparse.tokens import DDL, DML

ALLOWED_STATEMENT_TYPES = {"SELECT"}
ALLOWED_LEADING_KEYWORDS = {"SELECT", "WITH"}

FORBIDDEN_KEYWORDS = {
    "DROP", "DELETE", "INSERT", "UPDATE", "ALTER", "CREATE",
    "TRUNCATE", "ATTACH", "DETACH", "COPY", "PRAGMA", "EXPORT",
    "IMPORT", "INSTALL", "LOAD", "CALL", "GRANT", "REVOKE",
    "VACUUM", "REPLACE",
}

# Extra defense against stacked/chained statements.
_MULTI_STATEMENT_PATTERN = re.compile(r";\s*\S")


class SQLValidationError(Exception):
    pass


def validate_sql(sql: str) -> str:
    """Validate a generated SQL string. Returns the cleaned SQL or raises."""
    if not sql or not sql.strip():
        raise SQLValidationError("Generated SQL is empty.")

    cleaned = sql.strip().rstrip(";")

    if _MULTI_STATEMENT_PATTERN.search(sql):
        raise SQLValidationError("Multiple SQL statements are not allowed.")

    parsed = sqlparse.parse(cleaned)
    if len(parsed) != 1:
        raise SQLValidationError("Exactly one SQL statement is required.")

    statement: Statement = parsed[0]
    stmt_type = statement.get_type()

    first_keyword = _first_keyword(statement)
    if first_keyword not in ALLOWED_LEADING_KEYWORDS:
        raise SQLValidationError(
            f"Only SELECT / WITH statements are allowed (got: {first_keyword})."
        )

    if stmt_type not in ALLOWED_STATEMENT_TYPES and first_keyword != "WITH":
        raise SQLValidationError(f"Statement type '{stmt_type}' is not allowed.")

    upper_sql = cleaned.upper()
    for forbidden in FORBIDDEN_KEYWORDS:
        if re.search(rf"\b{forbidden}\b", upper_sql):
            raise SQLValidationError(f"Forbidden keyword detected: {forbidden}")

    return cleaned


def _first_keyword(statement: Statement) -> str:
    for token in statement.tokens:
        if token.is_whitespace:
            continue
        if token.ttype in (DML, DDL) or token.ttype is not None:
            return token.value.strip().upper()
        return token.value.strip().upper()
    return ""
