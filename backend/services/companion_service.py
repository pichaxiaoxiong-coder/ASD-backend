from __future__ import annotations

from __future__ import annotations

from typing import Dict, Any, Optional

from services.companion.companion_core import CompanionCore


class CompanionService:
    """Orchestrator wrapper for companion module (legacy entrypoint)."""

    def __init__(self):
        self.core = CompanionCore()

    async def chat(self, user_id: str, message: str, style: Optional[str] = None) -> Dict[str, Any]:
        return await self.core.handle_chat(user_id, message, style)

    async def list_history(self, user_id: str, limit: int = 20) -> Dict[str, Any]:
        return await self.core.history(user_id, limit)



