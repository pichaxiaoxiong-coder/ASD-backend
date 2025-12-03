from __future__ import annotations

from typing import List, Dict, Any, Optional
from uuid import uuid4

from core.utils import utc_now_iso
from services.db_service import DBService
from services.emotion_service import EmotionService
from services.decoder_service import DecoderService
from services.prompt_service import get_prompt_service
from services.emotion_profile_service import EmotionProfileService
from services.intervention_template_service import get_intervention_template_service


class InterventionService:
    """干预计划服务：依据目标、情绪、场景生成推荐步骤。"""

    def __init__(self):
        self.db = DBService()
        self.emotion_service = EmotionService()
        self.decoder_service = DecoderService()
        self.prompt_service = get_prompt_service()
        self.profile_service = EmotionProfileService()
        self.template_service = get_intervention_template_service()

    async def generate_plan(
        self,
        user_id: str,
        goal: str,
        focus_scene: Optional[str],
        duration_days: int = 7,
        auto_match_template: bool = True,
    ) -> Dict[str, Any]:
        # 获取最近情绪趋势和社交分析
        emotion_trend = await self.emotion_service.analyze_emotion_trend(user_id, days=7)
        history = await self.emotion_service.get_emotion_history(user_id, days=7, limit=20)
        scene = focus_scene or "泛化"
        
        # 获取用户Profile（用于引用baseline和个性化）
        profile = await self.profile_service.get_profile(user_id)
        
        # 获取当前情绪状态（用于模板匹配）
        current_emotion = emotion_trend.get("average_emotion", "平静")
        current_intensity = emotion_trend.get("average_intensity", 0.5)
        
        # 获取风险等级
        risk_level = None
        if emotion_trend.get("trend") == "declining" and profile.sensitivity > 0.7:
            risk_level = "high"
        elif emotion_trend.get("trend") in ["declining", "slightly_negative"]:
            risk_level = "medium"
        else:
            risk_level = "low"

        # 自动匹配干预模板
        intervention_template = None
        if auto_match_template:
            # 获取最近的情绪记录用于匹配
            recent_records = await self.emotion_service.get_emotion_history(user_id, days=1, limit=10)
            latest_text = recent_records[0].get("text", "") if recent_records else ""
            
            intervention_template = self.template_service.match_template(
                emotion=current_emotion,
                intensity=current_intensity,
                scene=scene,
                text=latest_text,
                emotion_history=recent_records,
                risk_level=risk_level
            )

        # 获取场景模板（用于社交场景建议）
        scene_template = None
        try:
            scene_template = self.prompt_service.load_template(scene)
        except FileNotFoundError:
            scene_template = None

        steps = self._build_steps(
            goal, 
            scene_template, 
            emotion_trend, 
            profile,
            intervention_template
        )

        plan = {
            "plan_id": str(uuid4()),
            "user_id": user_id,
            "goal": goal,
            "focus_scene": scene,
            "duration_days": duration_days,
            "created_at": utc_now_iso(),
            "status": "active",
            "steps": steps,
            "emotion_trend": emotion_trend,
            # 引用Profile信息
            "profile_baseline": profile.baseline,
            "profile_sensitivity": profile.sensitivity,
            "profile_trigger_words": profile.trigger_words,
            # 使用的干预模板
            "intervention_template": intervention_template.get("template_id") if intervention_template else None,
            "intervention_template_name": intervention_template.get("name") if intervention_template else None,
            "risk_level": risk_level,
        }

        await self.db.add_log({**plan, "type": "intervention_plan"})
        return plan

    def _build_steps(
        self,
        goal: str,
        template: Optional[Dict[str, Any]],
        emotion_trend: Dict[str, Any],
        profile: Optional[Any] = None,  # EmotionProfile对象
        intervention_template: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        steps = []
        
        # 优先使用干预模板
        if intervention_template:
            # 从干预模板提取可执行动作
            executable_actions = self.template_service.get_template_actions(intervention_template)
            dialogue_scripts = self.template_service.get_template_dialogue(intervention_template)
            
            # 添加对话脚本步骤
            if dialogue_scripts:
                steps.append({
                    "title": "对话引导",
                    "type": "dialogue",
                    "scripts": dialogue_scripts,
                    "notes": "按照对话脚本进行引导"
                })
            
            # 添加可执行动作步骤
            for action in executable_actions:
                steps.append({
                    "title": action.get("name", "干预动作"),
                    "type": "action",
                    "action_type": action.get("action_type", ""),
                    "action": action.get("steps", []),
                    "duration_minutes": action.get("duration_minutes", 5),
                    "priority": action.get("priority", "normal"),
                    "notes": action.get("description", "")
                })
            
            # 添加后续动作
            follow_up_actions = intervention_template.get("follow_up_actions", [])
            if follow_up_actions:
                steps.append({
                    "title": "后续行动",
                    "type": "follow_up",
                    "actions": follow_up_actions,
                    "notes": "建议的后续行动（可选）"
                })
        
        # 如果没有匹配到干预模板，使用场景模板
        elif template and template.get("sub_scenes"):
            for sub in template["sub_scenes"][:3]:
                steps.append(
                    {
                        "title": sub.get("type", "练习"),
                        "type": "scene_based",
                        "action": sub.get("suggestion_steps", []),
                        "notes": sub.get("simple_explanation", ""),
                    }
                )
        else:
            # 默认步骤
            steps.append(
                {
                    "title": "情绪记录",
                    "type": "default",
                    "action": ["每天记录一次情绪", "反思触发因素和自我应对"],
                    "notes": "基础干预步骤（模板缺失时）",
                }
            )

        steps.append(
            {
                "title": "目标回顾",
                "action": [
                    f"在计划第 {max(1, emotion_trend.get('total_records', 1))} 天回顾目标",
                    "识别进展与困难，必要时调整策略",
                ],
                "notes": "根据情绪趋势动态调整",
            }
        )
        
        # 如果提供了Profile，添加基于baseline的个性化步骤
        if profile:
            baseline_step = self._build_baseline_step(profile)
            if baseline_step:
                steps.append(baseline_step)
        
        return steps
    
    def _build_baseline_step(self, profile: Any) -> Optional[Dict[str, Any]]:
        """基于Profile的baseline构建步骤"""
        baseline = profile.baseline
        sensitivity = profile.sensitivity
        trigger_words = profile.trigger_words
        
        actions = []
        notes = f"基于你的情绪基线（{baseline}）和敏感度（{sensitivity:.2f}）"
        
        if baseline == "negative":
            actions.append("重点关注情绪提升，每天记录至少一件积极的事情")
            actions.append("当情绪低于基线时，及时采取放松措施")
        elif baseline == "positive":
            actions.append("保持当前良好状态，继续记录积极体验")
            actions.append("当遇到挑战时，回顾你的积极基线，增强信心")
        else:  # neutral
            actions.append("保持情绪稳定，关注情绪波动的原因")
            actions.append("记录情绪变化，识别模式和触发因素")
        
        # 如果有触发词，添加避免触发的建议
        if trigger_words:
            actions.append(f"特别注意避免或减少接触以下触发因素：{', '.join(trigger_words[:3])}")
            notes += f"，触发词：{', '.join(trigger_words[:3])}"
        
        if actions:
            return {
                "title": "个性化情绪管理",
                "action": actions,
                "notes": notes
            }
        
        return None

    async def list_plans(self, user_id: str, limit: int = 10) -> Dict[str, Any]:
        plans = await self.db.fetch_logs(
            {"user_id": user_id, "type": "intervention_plan"},
            limit=limit,
            sort=[("timestamp", -1)],
        )
        plans.reverse()
        return {"count": len(plans), "plans": plans}

    async def record_progress(
        self,
        plan_id: str,
        status: str,
        note: Optional[str] = None,
    ) -> Dict[str, Any]:
        entry = {
            "plan_id": plan_id,
            "status": status,
            "note": note,
            "type": "intervention_progress",
            "timestamp": utc_now_iso(),
        }
        await self.db.add_log(entry)
        return {"message": "Progress recorded", "entry": entry}
    
    async def auto_match_intervention(
        self,
        user_id: str,
        emotion: str,
        intensity: float,
        scene: Optional[str] = None,
        text: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        自动匹配并触发干预（用于实时检测）
        
        Args:
            user_id: 用户ID
            emotion: 当前情绪
            intensity: 情绪强度
            scene: 社交场景
            text: 原始文本
        
        Returns:
            匹配的干预模板和动作，如果没有匹配则返回None
        """
        # 获取情绪历史
        recent_records = await self.emotion_service.get_emotion_history(user_id, days=1, limit=10)
        
        # 获取风险等级
        profile = await self.profile_service.get_profile(user_id)
        risk_level = None
        if intensity >= 0.9 or emotion in ["崩溃", "绝望", "失控"]:
            risk_level = "high"
        elif intensity >= 0.7 or emotion in ["焦虑", "恐惧", "生气"]:
            risk_level = "medium"
        else:
            risk_level = "low"
        
        # 匹配模板
        intervention_template = self.template_service.match_template(
            emotion=emotion,
            intensity=intensity,
            scene=scene,
            text=text,
            emotion_history=recent_records,
            risk_level=risk_level
        )
        
        if not intervention_template:
            return None
        
        # 提取动作和对话脚本
        actions = self.template_service.get_template_actions(intervention_template)
        dialogue = self.template_service.get_template_dialogue(intervention_template)
        
        return {
            "template_id": intervention_template.get("template_id"),
            "template_name": intervention_template.get("name"),
            "risk_level": intervention_template.get("risk_level"),
            "actions": actions,
            "dialogue_scripts": dialogue,
            "follow_up_actions": intervention_template.get("follow_up_actions", []),
            "success_indicators": intervention_template.get("success_indicators", []),
            "escalation_conditions": intervention_template.get("escalation_conditions", []),
            "emergency_contacts": intervention_template.get("emergency_contacts", [])
        }

