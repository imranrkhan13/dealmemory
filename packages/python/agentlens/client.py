"""A dependency-free server-side client for the AgentLens event API."""

from __future__ import annotations

import json
import platform
import re
import uuid
from datetime import datetime, timezone
from typing import Any, Mapping, Optional
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


_SENSITIVE_PROPERTY_NAMES = ("password", "token", "secret", "message", "text", "value")

_CREDENTIAL_PATTERNS = (
    re.compile(r"(?:pk_live|sk_live|whsec)_[A-Za-z0-9_]{16,}"),
    re.compile(r"\bBearer(?:\s|%20)+[A-Za-z0-9_\-\.~+/]{16,}={0,2}", re.IGNORECASE),
    re.compile(r"\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b"),
    re.compile(r"-----BEGIN[ A-Z0-9_-]*PRIVATE KEY-----"),
    re.compile(r"(?:password|token|secret)\s*=\s*['\"]?[^\s'\";&]{3,}", re.IGNORECASE),
)


def _contains_credential(value: str) -> bool:
    return any(p.search(value) is not None for p in _CREDENTIAL_PATTERNS)


class AgentLens:
    """Send explicit server-side product events to an AgentLens project.

    This client intentionally accepts only simple, non-sensitive properties.
    It never reads browser activity, form contents, or session recordings.
    """

    def __init__(self, *, project_key: str, api_url: str, timeout: float = 5.0) -> None:
        if not project_key.startswith("pk_"):
            raise ValueError("AgentLens requires a public pk_ project key")
        self.project_key = project_key
        self.api_url = api_url.rstrip("/")
        self.timeout = max(0.1, min(timeout, 30.0))
        self._user_id: Optional[str] = None
        self._anonymous_id = f"python_{uuid.uuid4()}"
        self._session_id = f"python_{uuid.uuid4()}"

    def identify(self, user_id: str) -> None:
        self._user_id = user_id
        self.track("identified")

    def set_goal(self, goal: str) -> None:
        self.track("goal_set", {"goal": goal})

    def track(self, name: str, properties: Optional[Mapping[str, Any]] = None) -> None:
        safe_properties = self._safe_properties(properties or {})
        event = {
            "id": str(uuid.uuid4()),
            "projectKey": self.project_key,
            "name": name,
            "userId": self._user_id,
            "anonymousId": self._anonymous_id,
            "sessionId": self._session_id,
            "occurredAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "properties": safe_properties,
        }
        self._send([event])

    def _send(self, events: list[dict[str, Any]]) -> None:
        request = Request(
            f"{self.api_url}/v1/events/batch",
            data=json.dumps({"events": events}).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "X-Project-Key": self.project_key,
                "User-Agent": f"agentlens-python/{platform.python_version()}",
            },
            method="POST",
        )
        try:
            with urlopen(request, timeout=self.timeout) as response:
                if not 200 <= response.status < 300:
                    raise RuntimeError(f"AgentLens ingestion failed ({response.status})")
        except HTTPError as error:
            raise RuntimeError(f"AgentLens ingestion failed ({error.code})") from error
        except URLError as error:
            raise RuntimeError("AgentLens could not reach the ingestion API") from error

    @staticmethod
    def _safe_properties(properties: Mapping[str, Any]) -> dict[str, str | int | float | bool | None]:
        safe: dict[str, str | int | float | bool | None] = {}
        for key, value in list(properties.items())[:20]:
            if len(key) > 80 or (isinstance(value, str) and len(value) > 500):
                continue
            if any(fragment in key.lower() for fragment in _SENSITIVE_PROPERTY_NAMES):
                continue
            if isinstance(value, str) and _contains_credential(value):
                continue
            if isinstance(value, (str, int, float, bool)) or value is None:
                safe[key] = value
        return safe
