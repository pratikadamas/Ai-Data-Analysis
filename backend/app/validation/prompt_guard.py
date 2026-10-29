"""Prompt injection, jailbreak, and destructive query defense.

Detects and blocks:
1. Jailbreak attempts to override system instructions (e.g. "forget previous instructions", "ignore rules", "bypass").
2. Direct or indirect requests to modify or destroy data (e.g. "truncate the table", "delete the data where income > 15", "drop table").
3. Obfuscated or multi-step adversarial prompt patterns.
"""
from __future__ import annotations

import re

# Patterns indicating jailbreak / instruction override
_INJECTION_PATTERNS = [
    # Forget / ignore / bypass previous instructions or prompts
    r"\b(forget|forgot|disregard|ignore|delete|skip|override|reset|clear)\b.{0,40}\b(previous|prior|my|system|all|above|former|initial)\b.{0,40}\b(instruction|instructions|inst|rules?|prompts?|directions?|constraints?)\b",
    r"\b(previous|prior|above|my)\b.{0,40}\b(instruction|instructions|inst|rules?|prompts?)\b.{0,40}\b(forget|forgot|ignore|disregard|override|deleted?|cleared?)\b",
    # System roleplay, jailbreak, DAN, developer mode
    r"\b(you\s+are\s+now|from\s+now\s+on\s+you|act\s+as|pretend\s+to\s+be|dan\s+mode|jailbreak|developer\s+mode|unrestricted)\b",
    r"\b(system\s+override|bypass\s+(guardrails|safety|rules|restrictions|filters))\b",
    r"\b(reveal|show|print|output|display)\s+(your|the)?\s*(system\s+prompt|hidden\s+instructions|system\s+instructions)\b",
    r"\bdo\s+anything\s+now\b",
]

# Patterns indicating destructive / mutating operations in user query
_DESTRUCTIVE_PATTERNS = [
    # Truncate table (including common typos like trunkcate)
    r"\b(truncate|trunkcate|trunc)\b.{0,30}\b(table|data|all)?\b",
    # Delete data / records / rows / from
    r"\b(delete|del|erase|remove|wipe)\b.{0,30}\b(data|rows|records|table|everything|all)?\b.{0,40}\b(where|from)?\b",
    # Drop table / schema / database
    r"\b(drop)\b.{0,30}\b(table|database|schema|view|column|index)\b",
    # Alter / Update / Insert
    r"\b(alter\s+table|update\s+\S+\s+set|insert\s+into)\b",
    r"\b(shutdown|kill|format)\b.{0,20}\b(database|server|table)?\b",
]

from app.validation.command_guard import is_os_command_injection

_COMPILED_INJECTION = [re.compile(p, re.IGNORECASE | re.DOTALL) for p in _INJECTION_PATTERNS]
_COMPILED_DESTRUCTIVE = [re.compile(p, re.IGNORECASE | re.DOTALL) for p in _DESTRUCTIVE_PATTERNS]


def is_prompt_injection(prompt: str) -> tuple[bool, str]:
    """Check if the user prompt is attempting prompt injection, jailbreaking,
    destructive operations, or OS command injection.

    Returns:
        (True, reason) if blocked.
        (False, "") if clean.
    """
    if not prompt or not isinstance(prompt, str):
        return False, ""

    text = prompt.strip()
    # Normalize common evasion (tabs, multiple spaces, line breaks, zero-width chars)
    normalized = re.sub(r"[\r\n\t]+", " ", text)
    normalized = re.sub(r"\s+", " ", normalized)
    normalized = re.sub(r"[\u200B-\u200D\uFEFF]", "", normalized)

    # 1. OS Command Injection & system command defense
    is_cmd, cmd_reason = is_os_command_injection(normalized)
    if is_cmd:
        return True, f"OS command injection or system tampering attempt detected: {cmd_reason}"

    # 2. Jailbreak / instruction override
    for pattern in _COMPILED_INJECTION:
        if pattern.search(normalized):
            return True, "Instruction override or jailbreak pattern detected."

    # 3. Destructive database mutation
    for pattern in _COMPILED_DESTRUCTIVE:
        if pattern.search(normalized):
            return True, "Data modification or destruction command detected."

    return False, ""
