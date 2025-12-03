from __future__ import annotations

from typing import Any, Dict, List, Optional

from services.companion.style_controller import StyleController
from services.template_service import TemplateService

try:
    # 风险检测用于感知安全风险，便于注入安全风格
    from services.risk_detection import RiskDetectionService
except Exception:  # pragma: no cover - 兜底导入
    RiskDetectionService = None  # type: ignore


_prompt_compiler_instance: Optional["PromptCompiler"] = None


class PromptCompiler:
    """
    Prompt Compiler：根据用户状态 / 场景 / 记忆，对基础模板进行增强。

    对外暴露统一接口：
        prompt = compiler.compile(template, user_state, context, memory)

    典型注入逻辑：
    - 如果用户最近情绪低 / 敏感度高 -> 自动注入更温柔的语气
    - 如果是“冲突场景” -> 自动加入 ASD 解释模板
    - 如果存在风险 -> 注入安全风格与注意事项
    """

    def __init__(self) -> None:
        self.style_controller = StyleController()
        self.template_service = TemplateService()
        self.risk_detection = RiskDetectionService() if RiskDetectionService else None

    def compile(
        self,
        template: str,
        user_state: Optional[Dict[str, Any]] = None,
        context: Optional[Dict[str, Any]] = None,
        memory: Optional[List[Dict[str, Any]]] = None,
    ) -> str:
        """
        编译 Prompt：

        Args:
            template: 基础 prompt 文本（例如 persona + 基本指令）
            user_state: 用户状态，如：
                {
                    "profile": {...EmotionProfile...},
                    "recent_emotion": "难过",
                    "recent_trend": "declining",
                    "risk_level": "low/medium/high",
                }
            context: 当前对话/场景上下文，如：
                {
                    "scene": "冲突",
                    "scene_analysis": {...},
                    "risk": {...},
                }
            memory: 历史对话或长期记忆列表（可选，用于少量摘要）
        """
        enhanced = template

        # 1. 情绪 & Profile 驱动的语气调整（更温柔）
        tone_block = self._build_tone_block(user_state)
        if tone_block:
            enhanced += f"\n\n[Tone adjustment]\n{tone_block}"

        # 2. 场景为“冲突”等时，自动注入 ASD 解释模板
        asd_block = self._build_asd_block(context)
        if asd_block:
            enhanced += f"\n\n[ASD-friendly explanation]\n{asd_block}"

        # 3. 风险相关的安全指令
        safety_block = self._build_safety_block(user_state, context)
        if safety_block:
            enhanced += f"\n\n[Safety style]\n{safety_block}"

        # 4. 如有需要，可基于 memory 做极简摘要指令
        memory_hint = self._build_memory_hint(memory)
        if memory_hint:
            enhanced += f"\n\n[Memory hint]\n{memory_hint}"

        return enhanced

    # ===== 内部构建块 =====

    def _build_tone_block(self, user_state: Optional[Dict[str, Any]]) -> str:
        if not user_state:
            return ""

        profile = user_state.get("profile") or {}
        recent_emotion = user_state.get("recent_emotion")
        recent_trend = user_state.get("recent_trend") or profile.get("recent_trend")
        sensitivity = profile.get("sensitivity", 0.5)

        # 条件：最近情绪偏负面 / 趋势下降 / 敏感度较高
        low_mood = recent_emotion in ["难过", "生气", "焦虑", "失望", "疲惫"]
        declining = recent_trend in ["declining", "slightly_negative"]
        high_sensitivity = sensitivity > 0.7

        if not (low_mood or declining or high_sensitivity):
            return ""

        # 复用 StyleController 的 gentle 风格说明
        base_instruction = self.style_controller.STYLE_MAP.get(
            "gentle", "Use a warm, gentle, and validating tone."
        )

        extra = []
        if high_sensitivity:
            extra.append("User is highly sensitive; avoid harsh wording and sudden topic shifts.")
        if declining:
            extra.append("Recent emotional trend is declining; add more reassurance and validation.")
        if low_mood:
            extra.append("User currently experiences negative emotions; prioritize comfort over problem-solving.")

        if extra:
            base_instruction += " " + " ".join(extra)

        return base_instruction

    def _build_asd_block(self, context: Optional[Dict[str, Any]]) -> str:
        if not context:
            return ""

        scene = context.get("scene") or context.get("scene_category")
        if scene != "冲突":
            return ""

        # 使用 TemplateService 的“冲突”场景模板，注入 ASD 友好解释
        tmpl = self.template_service.get_template("冲突")
        simple_explanation = tmpl.get("simple_explanation", "")
        why = tmpl.get("why", "")
        suggestions = tmpl.get("suggestions", [])[:4]

        block_parts: List[str] = []
        if simple_explanation:
            block_parts.append(f"- Explain the social situation in very simple terms: {simple_explanation}")
        if why:
            block_parts.append(f"- Briefly explain why the other person might react this way: {why}")
        if suggestions:
            block_parts.append(
                "- Offer 2-3 concrete, ASD-friendly steps the user can take, inspired by:\n  "
                + "\n  ".join(f"* {s}" for s in suggestions)
            )

        return "\n".join(block_parts)

    def _build_safety_block(
        self,
        user_state: Optional[Dict[str, Any]],
        context: Optional[Dict[str, Any]],
    ) -> str:
        risk_level = "low"

        if user_state and user_state.get("risk_level"):
            risk_level = user_state["risk_level"]

        if context:
            risk = context.get("risk") or {}
            risk_level = risk.get("risk_level", risk_level)

        if risk_level not in ("medium", "high"):
            return ""

        parts = [
            "If the user expresses severe distress, self-harm, or suicide ideation, respond with high safety priority.",
            "Avoid giving medical or legal advice. Encourage seeking help from trusted people or professionals.",
            "Use non-triggering, non-judgmental language. Do not describe methods of self-harm.",
        ]

        if risk_level == "high":
            parts.append(
                "Clearly suggest that if the user is in immediate danger, they should contact local emergency services or crisis hotlines."
            )

        return " ".join(parts)

    def _build_memory_hint(self, memory: Optional[List[Dict[str, Any]]]) -> str:
        if not memory:
            return ""

        # 只给模型一个简短提示：历史已经在上文给出，不需要重复。
        last_user = next(
            (m for m in reversed(memory) if m.get("role") == "user"), None
        )
        if not last_user:
            return "You already saw recent conversation history above; avoid repeating long summaries."

        return (
            "You already saw recent conversation history above; "
            "avoid repeating full summaries. Focus on moving the conversation forward "
            "based on the latest user message."
        )


def get_prompt_compiler() -> PromptCompiler:
    global _prompt_compiler_instance
    if _prompt_compiler_instance is None:
        _prompt_compiler_instance = PromptCompiler()
    return _prompt_compiler_instance



