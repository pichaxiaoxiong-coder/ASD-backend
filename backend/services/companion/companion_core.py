from __future__ import annotations

from typing import Dict, Any, Optional

from services.ai_service import AIService
from services.companion.memory_manager import MemoryManager
from services.companion.style_controller import StyleController
from services.companion.template_injector import TemplateInjector
from services.companion.safety_controller import SafetyController


class CompanionCore:
    """组合各子模块，生成最终回复"""

    def __init__(self):
        self.ai = AIService()
        self.memory_manager = MemoryManager()
        self.style_controller = StyleController()
        self.template_injector = TemplateInjector()
        self.safety_controller = SafetyController()
        self.persona = (
            "You are an empathetic companion for neurodivergent users. "
            "Provide concise, supportive, actionable replies. "
            "Avoid judgment, use simple language, and offer step-by-step guidance when possible."
        )

    async def handle_chat(self, user_id: str, message: str, style: Optional[str]) -> Dict[str, Any]:
        history = await self.memory_manager.fetch_history(user_id, limit=6)
        
        # 获取用户Profile以自动调整语气
        profile = None
        try:
            from services.emotion_profile_service import EmotionProfileService
            profile_service = EmotionProfileService()
            profile_obj = await profile_service.get_profile(user_id)
            profile = profile_obj.model_dump()
        except Exception:
            pass  # 如果获取失败，使用默认风格
        
        # 使用Profile调整风格指令
        if profile:
            style_instruction = self.style_controller.get_instruction_with_profile(style, profile)
        else:
            style_instruction = self.style_controller.get_instruction(style, user_id)
        
        scene_context = self.template_injector.build_scene_context(message)
        retrieval = self.memory_manager.store_and_retrieve(user_id, message)

        prompt = self._build_prompt(history, message, style_instruction, scene_context)
        reply = self.ai.generate_reply(prompt, retrieval["documents"])

        await self.memory_manager.log_message(user_id, "user", message)
        await self.memory_manager.log_message(user_id, "assistant", reply)

        safety = self.safety_controller.review(message)

        return {
            "reply": reply,
            "context": {
                "history": history,
                "retrieval": retrieval["raw"],
                "scene": scene_context,
                "style": style_instruction,
                "safety": safety,
                "profile_used": profile is not None,  # 指示是否使用了Profile
            },
        }

    async def history(self, user_id: str, limit: int = 20) -> Dict[str, Any]:
        logs = await self.memory_manager.fetch_history(user_id, limit=limit)
        return {"count": len(logs), "messages": logs}

    def _build_prompt(
        self,
        history: list[Dict[str, Any]],
        user_message: str,
        style_instruction: str,
        scene_context: Dict[str, Any],
    ) -> str:
        history_text = ""
        for log in history:
            speaker = "User" if log.get("role") == "user" else "Companion"
            history_text += f"{speaker}: {log.get('content', '')}\n"

        prompt = (
            f"{self.persona}\n\n"
            f"{style_instruction}\n"
            f"Scene context:\n{scene_context.get('context_text', '')}\n\n"
            f"Conversation history:\n{history_text}\n"
            f"New user message: {user_message}\n"
            "Respond as the companion:"
        )
        return prompt



