"""OS Command Injection Protection and Detection Guard.

Provides proactive defense against OS command injection (CWE-78), shell
metacharacter manipulation, and unauthorized system command execution.
"""
from __future__ import annotations

import re
from typing import Tuple

class CommandInjectionError(Exception):
    """Raised when an OS command injection payload or dangerous shell pattern is detected."""
    pass

# Shell metacharacters often used in command injection chains or substitutions
_CHAINING_OR_SUBSTITUTION = re.compile(
    r"(?:;\s*(?:ls|cat|rm|curl|wget|bash|sh|powershell|cmd|whoami|id|echo|nc|kill)\b)"
    r"|(?:\|\s*(?:bash|sh|powershell|cmd|python|perl|ruby)\b)"
    r"|(?:\$\([^)]+\))"              # $(cmd)
    r"|(?:`[^`]+`)"                  # `cmd`
    r"|(?:\b(?:&&|\|\|)\s*(?:ls|cat|rm|curl|wget|bash|sh|whoami)\b)",
    re.IGNORECASE,
)

# Explicit OS commands, system binary execution, and shell invocations
_COMMAND_INJECTION_PATTERNS = [
    # Shell binary invocations
    r"\b(powershell(?:\.exe)?|cmd(?:\.exe)?|/bin/sh|/bin/bash|/bin/zsh|/usr/bin/env)\b",
    # Recon / data exfiltration commands
    r"\b(whoami|id\s+-u|uname\s+-[ar]|cat\s+/etc/(?:passwd|shadow|hosts))\b",
    # Download & execute pipelines
    r"\b(?:curl|wget)\b[^\n|;&]{0,80}\|[^\n|;&]{0,20}\b(?:sh|bash|python|perl)\b",
    # File destruction / system tampering
    r"\b(rm\s+-[rf]{1,2}|del\s+/[fFqQ]|format\s+[c-zC-Z]:)\b",
    # Python OS execution modules / functions
    r"\b(?:subprocess\.(?:Popen|run|call|check_output)|os\.(?:system|popen|spawn[a-z]*))\b",
    # Reverse shells / network listeners
    r"\b(?:nc|netcat|ncat)\b.{0,30}\b(?:-e\s+/bin/(?:sh|bash))\b",
]

_COMPILED_PATTERNS = [re.compile(p, re.IGNORECASE) for p in _COMMAND_INJECTION_PATTERNS]


def is_os_command_injection(text: str) -> Tuple[bool, str]:
    """Inspect untrusted text for OS command injection indicators.

    Returns:
        (True, reason) if a command injection pattern is found.
        (False, "") if clean.
    """
    if not text or not isinstance(text, str):
        return False, ""

    normalized = text.strip()

    # 1. Check for command chaining and substitutions
    if _CHAINING_OR_SUBSTITUTION.search(normalized):
        return True, "OS command chaining or shell substitution detected."

    # 2. Check for explicit dangerous commands / binaries
    for pattern in _COMPILED_PATTERNS:
        if pattern.search(normalized):
            return True, "System command or shell invocation pattern detected."

    return False, ""


def check_command_injection(text: str) -> None:
    """Validate that text does not contain OS command injection patterns.

    Raises:
        CommandInjectionError if an injection pattern is detected.
    """
    is_injection, reason = is_os_command_injection(text)
    if is_injection:
        raise CommandInjectionError(f"Security validation failed: {reason}")


def sanitize_alphanumeric_id(identifier: str, max_length: int = 64) -> str:
    """Strictly sanitize an identifier (e.g. dataset_id) to allow only safe alphanumeric characters,

    underscores, and hyphens. Blocks directory traversal, null bytes, and shell metacharacters.
    """
    if not identifier or not isinstance(identifier, str):
        raise CommandInjectionError("Identifier must be a non-empty string.")

    cleaned = identifier.strip()
    if not re.match(r"^[a-zA-Z0-9_-]+$", cleaned):
        raise CommandInjectionError(
            f"Invalid identifier '{identifier[:32]}': must contain only alphanumeric characters, dashes, or underscores."
        )

    if len(cleaned) > max_length:
        raise CommandInjectionError(f"Identifier exceeds maximum length of {max_length} characters.")

    return cleaned
