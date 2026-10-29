"""Whitelist-based SQL validation, table authorization, and SQL identifier escaping.

Only read-only analytical queries are allowed. Anything that could
mutate data or schema, access external files, read environment variables,
or call dangerous DuckDB functions is rejected before reaching the database.
"""
from __future__ import annotations

import re
from typing import Iterable

import sqlparse
from sqlparse.sql import (
    Function,
    Identifier,
    IdentifierList,
    Parenthesis,
    Statement,
    Token,
    TokenList,
)
from sqlparse.tokens import DDL, DML, Keyword, Name

ALLOWED_STATEMENT_TYPES = {"SELECT"}
ALLOWED_LEADING_KEYWORDS = {"SELECT", "WITH"}

FORBIDDEN_KEYWORDS = {
    # DDL / DML mutations
    "DROP", "DELETE", "INSERT", "UPDATE", "ALTER", "CREATE",
    "TRUNCATE", "ATTACH", "DETACH", "COPY", "PRAGMA", "EXPORT",
    "IMPORT", "INSTALL", "LOAD", "CALL", "GRANT", "REVOKE",
    "VACUUM", "REPLACE", "CHECKPOINT", "EXECUTE", "PREPARE", "DEALLOCATE",
    # DuckDB file & external scans (prevent LFI / arbitrary file read)
    "READ_CSV", "READ_CSV_AUTO", "READ_PARQUET", "READ_JSON", "READ_JSON_AUTO",
    "READ_TEXT", "READ_BLOB", "SCAN_CSV", "SCAN_PARQUET", "GLOB",
    "SQLITE_SCAN", "POSTGRES_SCAN", "MYSQL_SCAN", "ICEBERG_SCAN", "DELTA_SCAN",
    # Environment variables, OS command execution & system info (prevent secret leakage & command injection)
    "GETENV", "CURRENT_SETTING", "SET_VARIABLE", "SYSTEM", "SYS_CMD", "SYSTEM_EXEC",
    "SHELL", "CMD", "EXEC",
    "QUERY", "QUERY_TABLE", "SQL",
}

# Forbidden system schemas and tables
FORBIDDEN_TABLE_PREFIXES = (
    "information_schema",
    "pg_catalog",
    "duckdb_",
    "sqlite_",
)

# Extra defense against stacked/chained statements.
_MULTI_STATEMENT_PATTERN = re.compile(r";\s*\S")


class SQLValidationError(Exception):
    pass


def escape_sql_identifier(identifier: str) -> str:
    """Safely escape a SQL identifier (table or column name) with double quotes.

    Escapes existing double quotes by doubling them according to SQL standards.
    """
    if not identifier:
        return '""'
    escaped = identifier.replace('"', '""')
    return f'"{escaped}"'


def _clean_identifier_name(val: str) -> str:
    """Strip quotes and leading/trailing whitespace from an identifier."""
    val = val.strip()
    if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
        return val[1:-1].strip()
    return val


def extract_table_names_from_sql(sql: str) -> tuple[set[str], set[str]]:
    """Extract table references and CTE names from a SQL statement.

    Returns (tables_referenced, cte_names).
    """
    cleaned = sqlparse.format(sql, strip_comments=True).strip()
    parsed = sqlparse.parse(cleaned)
    if not parsed:
        return set(), set()

    statement = parsed[0]
    cte_names: set[str] = set()
    tables_referenced: set[str] = set()

    # 1. Identify CTE names strictly defined in the WITH clause preamble
    first_tok = None
    for t in statement.tokens:
        if not t.is_whitespace:
            first_tok = t
            break

    if first_tok and first_tok.value.upper() == "WITH":
        for t in statement.tokens:
            if t.is_whitespace or t == first_tok:
                continue
            # Stop inspecting CTE definitions once the main query statement starts
            if t.ttype is DML or t.value.upper() in ("SELECT", "VALUES"):
                break

            candidates = []
            if isinstance(t, IdentifierList):
                candidates.extend(t.get_identifiers())
            elif isinstance(t, Identifier):
                candidates.append(t)

            for c in candidates:
                sub_tokens = [tok for tok in c.tokens if not tok.is_whitespace]
                for idx, stok in enumerate(sub_tokens):
                    if stok.value.upper() == "AS" and idx > 0 and idx + 1 < len(sub_tokens):
                        next_tok = sub_tokens[idx + 1]
                        if isinstance(next_tok, Parenthesis) or next_tok.value.startswith("("):
                            cte_name = _clean_identifier_name(sub_tokens[idx - 1].value).lower()
                            cte_names.add(cte_name)

    # 2. Extract table names after FROM / JOIN keywords and within subqueries/CTEs
    from_join_keywords = {"FROM", "JOIN", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL JOIN", "CROSS JOIN"}

    def _traverse(token_list: TokenList):
        nonlocal from_join_keywords, tables_referenced
        from_seen = False
        for token in token_list.tokens:
            if token.is_whitespace:
                continue

            val = token.value.strip().upper()
            if val in from_join_keywords or token.match(Keyword, ["FROM", "JOIN"]):
                from_seen = True
                continue

            if from_seen:
                # If we encounter a subquery (starts with '('), reset from_seen and recurse into it
                if token.value.startswith("("):
                    from_seen = False
                    if isinstance(token, TokenList):
                        _traverse(token)
                    continue

                if isinstance(token, IdentifierList):
                    for id_tok in token.get_identifiers():
                        raw_name = id_tok.get_real_name() or id_tok.value.split()[0]
                        parent_name = id_tok.get_parent_name()
                        full_name = f"{parent_name}.{raw_name}" if parent_name else raw_name
                        tables_referenced.add(_clean_identifier_name(full_name).lower())
                    from_seen = False
                    _traverse(token)
                elif isinstance(token, Identifier):
                    raw_name = token.get_real_name() or token.value.split()[0]
                    parent_name = token.get_parent_name()
                    full_name = f"{parent_name}.{raw_name}" if parent_name else raw_name
                    tables_referenced.add(_clean_identifier_name(full_name).lower())
                    from_seen = False
                    _traverse(token)
                elif isinstance(token, Function):
                    fn_name = token.get_real_name() or token.value.split("(")[0]
                    tables_referenced.add(_clean_identifier_name(fn_name).lower())
                    from_seen = False
                    _traverse(token)
                elif token.ttype in (Name, Keyword):
                    tables_referenced.add(_clean_identifier_name(token.value).lower())
                    from_seen = False
                elif token.is_keyword:
                    from_seen = False
            elif isinstance(token, TokenList):
                _traverse(token)

    _traverse(statement)
    return tables_referenced, cte_names


def validate_sql(sql: str, allowed_tables: Iterable[str] | None = None) -> str:
    """Validate a generated SQL string. Returns the cleaned SQL or raises SQLValidationError."""
    if not sql or not sql.strip():
        raise SQLValidationError("Generated SQL is empty.")

    cleaned = sql.strip().rstrip(";")

    if _MULTI_STATEMENT_PATTERN.search(sql):
        raise SQLValidationError("Multiple SQL statements are not allowed.")

    # Strip comments to prevent comment-based filter bypasses
    cleaned_no_comments = sqlparse.format(cleaned, strip_comments=True).strip()
    if not cleaned_no_comments:
        raise SQLValidationError("SQL statement is empty after removing comments.")

    parsed = sqlparse.parse(cleaned_no_comments)
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

    upper_sql = cleaned_no_comments.upper()
    for forbidden in FORBIDDEN_KEYWORDS:
        if re.search(rf"\b{forbidden}\b", upper_sql):
            raise SQLValidationError(f"Forbidden keyword or function detected: {forbidden}")

    # Check for unauthorized system schema access
    for prefix in FORBIDDEN_TABLE_PREFIXES:
        if re.search(rf"\b{prefix}", upper_sql, re.IGNORECASE):
            raise SQLValidationError(f"Access to system table or schema '{prefix}' is forbidden.")

    # Table authorization check (if allowed_tables provided)
    if allowed_tables is not None:
        allowed_set = {t.lower() for t in allowed_tables}
        # Also include legacy table name if needed
        allowed_set.add("uploaded_data")

        if not allowed_set:
            raise SQLValidationError("No tables are authorized for this dataset query.")

        referenced_tables, cte_names = extract_table_names_from_sql(cleaned_no_comments)
        for tbl in referenced_tables:
            # Skip if it's a CTE or known safe built-in table function
            if tbl in cte_names or tbl in ("generate_series", "range", "unnest", "values"):
                continue

            # Check schema qualification
            if "." in tbl:
                parts = tbl.split(".")
                schema_part, table_part = parts[0], parts[-1]
                if schema_part != "main" or table_part not in allowed_set:
                    raise SQLValidationError(
                        f"Access to unauthorized schema or table '{tbl}' is forbidden. "
                        f"Allowed tables: {sorted(list(allowed_set))}"
                    )
            elif tbl not in allowed_set:
                raise SQLValidationError(
                    f"Access to unauthorized or unknown table '{tbl}' is forbidden. "
                    f"Allowed tables: {sorted(list(allowed_set))}"
                )

    return cleaned


def _first_keyword(statement: Statement) -> str:
    for token in statement.tokens:
        if token.is_whitespace:
            continue
        if token.ttype in (DML, DDL) or token.ttype is not None:
            return token.value.strip().upper()
        return token.value.strip().upper()
    return ""
