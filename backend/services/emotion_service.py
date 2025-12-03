from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from services.decoder_service import DecoderService
from services.db_service import DBService
from services.ai_service import AIService
from core.utils import utc_now_iso


class EmotionService:
    """情感导师服务：跟踪用户情绪状态，提供干预建议"""
    
    def __init__(self):
        self.decoder = DecoderService()  # 复用解码服务的情感分析
        self.db = DBService()
        self.ai_service = AIService()
    
    async def detect_user_emotion(self, text: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        """检测用户当前情绪状态（用户自己说的话）"""
        # 使用解码服务的情感分析
        sentiment_result = self.decoder.detect_sentiment_tendency(text)
        
        # 扩展情绪类型识别
        emotion_type = self._classify_emotion_type(text, sentiment_result)
        
        result = {
            "emotion": emotion_type,
            "sentiment": sentiment_result.get("sentiment", "neutral"),
            "confidence": sentiment_result.get("confidence", 0.5),
            "intensity": self._calculate_intensity(text, sentiment_result),
            "positive_score": sentiment_result.get("positive_score", 0),
            "negative_score": sentiment_result.get("negative_score", 0),
            "keywords": self.decoder.extract_keywords(text, top_k=5)
        }
        
        # 保存情绪记录
        if user_id:
            await self._save_emotion_record(user_id, text, result)
            # 更新 Profile（异步，不阻塞）
            try:
                # 触发 Profile 更新（延迟更新，避免频繁计算）
                pass  # 可以在后台任务中更新
            except Exception:
                pass
        
        return result
    
    def _classify_emotion_type(self, text: str, sentiment: Dict[str, Any]) -> str:
        """分类情绪类型（更细粒度）"""
        text_lower = text.lower()
        
        # 情绪关键词映射
        emotion_keywords = {
            "开心": ["开心", "高兴", "快乐", "愉快", "兴奋", "太棒了", "太好了", "真棒"],
            "难过": ["难过", "伤心", "悲伤", "沮丧", "失落", "想哭"],
            "生气": ["生气", "愤怒", "恼火", "烦躁", "讨厌", "烦死了"],
            "焦虑": ["焦虑", "担心", "不安", "紧张", "害怕", "恐惧"],
            "平静": ["平静", "放松", "舒服", "安心", "稳定"],
            "疲惫": ["累", "疲惫", "疲倦", "困", "没精神"],
            "失望": ["失望", "绝望", "无奈", "遗憾"],
            "尴尬": ["尴尬", "不好意思", "难为情"],
            "惊讶": ["惊讶", "震惊", "没想到", "居然"],
            "无聊": ["无聊", "没意思", "空虚"]
        }
        
        # 匹配情绪关键词
        for emotion, keywords in emotion_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                return emotion
        
        # 基于情感倾向推断
        sentiment_type = sentiment.get("sentiment", "neutral")
        if sentiment_type == "positive":
            return "开心"
        elif sentiment_type == "negative":
            return "难过"  # 默认负面情绪为难过
        else:
            return "平静"
    
    def _calculate_intensity(self, text: str, sentiment: Dict[str, Any]) -> float:
        """计算情绪强度（0-1）"""
        # 基于情感分数计算强度
        positive = sentiment.get("positive_score", 0)
        negative = sentiment.get("negative_score", 0)
        
        intensity = max(abs(positive), abs(negative)) / 5.0  # 归一化到 0-1
        return min(1.0, max(0.0, intensity))
    
    async def _save_emotion_record(self, user_id: str, text: str, emotion_data: Dict[str, Any]):
        """保存情绪记录到数据库"""
        record = {
            "user_id": user_id,
            "text": text,
            "emotion": emotion_data.get("emotion", "未知"),
            "sentiment": emotion_data.get("sentiment", "neutral"),
            "intensity": emotion_data.get("intensity", 0.0),
            "timestamp": utc_now_iso(),
            "keywords": emotion_data.get("keywords", [])
        }
        await self.db.add_log(record)
    
    async def get_emotion_history(
        self, 
        user_id: str, 
        days: int = 7,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """获取用户情绪历史记录"""
        # 从数据库获取记录（这里简化处理，实际应该查询专门的 emotion_records 集合）
        logs = await self.db.get_conversation_logs(user_id=user_id, limit=limit)
        
        # 过滤出情绪相关记录（简化：假设所有记录都包含情绪信息）
        emotion_records = []
        for log in logs:
            if "emotion" in log or "sentiment" in log:
                emotion_records.append(log)
        
        return emotion_records
    
    async def analyze_emotion_trend(self, user_id: str, days: int = 7) -> Dict[str, Any]:
        """分析情绪趋势"""
        records = await self.get_emotion_history(user_id, days=days)
        
        if not records:
            return {
                "trend": "stable",
                "average_emotion": "平静",
                "emotion_distribution": {},
                "recommendation": "暂无足够数据进行分析"
            }
        
        # 统计情绪分布
        emotion_counts = {}
        intensity_sum = 0.0
        positive_count = 0
        negative_count = 0
        
        for record in records:
            emotion = record.get("emotion", "平静")
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
            
            intensity = record.get("intensity", 0.0)
            intensity_sum += intensity
            
            sentiment = record.get("sentiment", "neutral")
            if sentiment == "positive":
                positive_count += 1
            elif sentiment == "negative":
                negative_count += 1
        
        # 计算平均情绪
        most_common_emotion = max(emotion_counts.items(), key=lambda x: x[1])[0] if emotion_counts else "平静"
        avg_intensity = intensity_sum / len(records) if records else 0.0
        
        # 判断趋势
        if positive_count > negative_count * 1.5:
            trend = "improving"
        elif negative_count > positive_count * 1.5:
            trend = "declining"
        else:
            trend = "stable"
        
        return {
            "trend": trend,
            "average_emotion": most_common_emotion,
            "average_intensity": avg_intensity,
            "emotion_distribution": emotion_counts,
            "positive_ratio": positive_count / len(records) if records else 0.0,
            "negative_ratio": negative_count / len(records) if records else 0.0,
            "total_records": len(records),
            "recommendation": self._generate_trend_recommendation(trend, most_common_emotion, avg_intensity)
        }
    
    def _generate_trend_recommendation(
        self, 
        trend: str, 
        emotion: str, 
        intensity: float
    ) -> str:
        """生成趋势建议"""
        if trend == "declining":
            return "你的情绪状态最近有所下降，建议多休息，做一些让自己放松的事情。"
        elif trend == "improving":
            return "你的情绪状态正在改善，继续保持！"
        elif emotion in ["难过", "生气", "焦虑"]:
            return f"你最近{emotion}的情绪较多，建议尝试深呼吸、听音乐或与朋友聊天来缓解。"
        else:
            return "你的情绪状态比较稳定，继续保持良好的生活习惯。"
    
    async def get_intervention_suggestion(
        self, 
        user_id: str, 
        current_emotion: Optional[str] = None
    ) -> Dict[str, Any]:
        """获取情绪干预建议（个性化版本）"""
        # 如果没有提供当前情绪，从最近记录获取
        if not current_emotion:
            records = await self.get_emotion_history(user_id, days=1, limit=1)
            if records:
                current_emotion = records[0].get("emotion", "平静")
            else:
                current_emotion = "平静"
        
        # 获取情绪趋势
        trend = await self.analyze_emotion_trend(user_id, days=7)
        
        # 获取用户历史数据用于个性化
        history = await self.get_emotion_history(user_id, days=30, limit=100)
        
        # 生成个性化干预建议
        suggestions = await self._generate_personalized_interventions(
            user_id, current_emotion, trend, history
        )
        
        return {
            "current_emotion": current_emotion,
            "trend": trend.get("trend", "stable"),
            "suggestions": suggestions,
            "urgency": self._calculate_urgency(current_emotion, trend),
            "personalized": True
        }
    
    async def _generate_personalized_interventions(
        self,
        user_id: str,
        current_emotion: str,
        trend: Dict[str, Any],
        history: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """生成个性化干预建议"""
        suggestions = []
        
        # 基础建议
        base_suggestions = self._generate_intervention_suggestions(current_emotion, trend)
        
        # 分析用户历史模式
        emotion_frequency = {}
        effective_interventions = {}  # 假设某些干预措施有效（基于历史）
        
        for record in history:
            emotion = record.get("emotion", "平静")
            emotion_frequency[emotion] = emotion_frequency.get(emotion, 0) + 1
        
        # 判断用户情绪模式
        most_common_emotion = max(emotion_frequency.items(), key=lambda x: x[1])[0] if emotion_frequency else "平静"
        is_recurring = current_emotion == most_common_emotion and emotion_frequency.get(current_emotion, 0) >= 5
        
        # 基于模式调整建议
        for i, suggestion_text in enumerate(base_suggestions[:3]):  # 取前3个
            suggestion = {
                "text": suggestion_text,
                "priority": i + 1,
                "reason": self._get_suggestion_reason(current_emotion, is_recurring, trend)
            }
            
            # 如果是反复出现的情绪，添加长期建议
            if is_recurring and i == 0:
                suggestion["long_term"] = f"由于你经常出现{current_emotion}情绪，建议考虑长期的情绪管理策略"
            
            suggestions.append(suggestion)
        
        # 如果趋势下降，添加额外建议
        if trend.get("trend") == "declining":
            suggestions.append({
                "text": "你的情绪状态最近有所下降，建议考虑寻求专业支持",
                "priority": 4,
                "reason": "基于情绪趋势分析",
                "urgent": True
            })
        
        return suggestions
    
    def _get_suggestion_reason(
        self,
        emotion: str,
        is_recurring: bool,
        trend: Dict[str, Any]
    ) -> str:
        """获取建议原因"""
        if is_recurring:
            return f"针对你经常出现的{emotion}情绪"
        elif trend.get("trend") == "declining":
            return "基于你最近的情绪下降趋势"
        else:
            return f"针对当前的{emotion}情绪状态"
    
    def _generate_intervention_suggestions(
        self, 
        emotion: str, 
        trend: Dict[str, Any]
    ) -> List[str]:
        """生成具体的干预建议"""
        suggestions = []
        
        # 基于情绪类型提供建议
        intervention_map = {
            "难过": [
                "尝试深呼吸，慢慢吸气、呼气，重复几次",
                "听一些轻松的音乐，或者你喜欢的歌曲",
                "可以给朋友或家人打个电话，聊聊天",
                "做一些简单的运动，比如散步",
                "写下你的感受，或者画一些简单的画"
            ],
            "生气": [
                "先离开当前环境，给自己一些空间",
                "尝试数数，从1数到10，慢慢冷静下来",
                "做几次深呼吸，专注于呼吸",
                "可以做一些体力活动，比如跑步或做家务",
                "写下让你生气的事情，然后撕掉或删除"
            ],
            "焦虑": [
                "尝试4-7-8呼吸法：吸气4秒，屏息7秒，呼气8秒",
                "列出让你焦虑的事情，逐一分析",
                "做一些简单的放松练习，比如肌肉放松",
                "听一些冥想或放松的音乐",
                "告诉自己'这只是暂时的，我会处理好的'"
            ],
            "疲惫": [
                "确保有足够的睡眠时间",
                "尝试小憩15-20分钟",
                "做一些轻松的活动，不要强迫自己",
                "多喝水，保持身体水分",
                "可以做一些简单的伸展运动"
            ],
            "无聊": [
                "尝试一个新的爱好或活动",
                "读一本书或看一部电影",
                "和朋友一起做点什么",
                "学习一些新知识或技能",
                "到户外走走，呼吸新鲜空气"
            ]
        }
        
        # 获取针对性的建议
        if emotion in intervention_map:
            suggestions.extend(intervention_map[emotion][:3])  # 取前3个
        else:
            suggestions.append("保持当前状态，继续做让你感到舒适的事情")
        
        # 如果趋势下降，添加额外建议
        if trend.get("trend") == "declining":
            suggestions.append("如果情绪持续低落，建议考虑寻求专业帮助")
        
        return suggestions
    
    def _calculate_urgency(self, emotion: str, trend: Dict[str, Any]) -> str:
        """计算干预紧急程度"""
        negative_emotions = ["难过", "生气", "焦虑", "失望"]
        
        if emotion in negative_emotions and trend.get("trend") == "declining":
            return "high"
        elif emotion in negative_emotions:
            return "medium"
        else:
            return "low"
    
    async def assess_emotion_health(self, user_id: str) -> Dict[str, Any]:
        """评估用户情绪健康状态"""
        trend = await self.analyze_emotion_trend(user_id, days=30)
        
        # 计算健康分数（0-100）
        health_score = 50  # 基础分
        
        # 基于趋势调整
        if trend.get("trend") == "improving":
            health_score += 20
        elif trend.get("trend") == "declining":
            health_score -= 20
        
        # 基于情绪分布调整
        positive_ratio = trend.get("positive_ratio", 0.0)
        negative_ratio = trend.get("negative_ratio", 0.0)
        
        health_score += int(positive_ratio * 20)
        health_score -= int(negative_ratio * 20)
        
        # 限制在 0-100 范围
        health_score = max(0, min(100, health_score))
        
        # 健康等级
        if health_score >= 80:
            level = "excellent"
            level_cn = "优秀"
        elif health_score >= 60:
            level = "good"
            level_cn = "良好"
        elif health_score >= 40:
            level = "fair"
            level_cn = "一般"
        else:
            level = "needs_attention"
            level_cn = "需要关注"
        
        return {
            "health_score": health_score,
            "health_level": level,
            "health_level_cn": level_cn,
            "trend_analysis": trend,
            "recommendations": self._generate_health_recommendations(health_score, trend)
        }
    
    def _generate_health_recommendations(
        self, 
        score: int, 
        trend: Dict[str, Any]
    ) -> List[str]:
        """生成健康建议"""
        recommendations = []
        
        if score < 40:
            recommendations.append("建议考虑寻求专业心理咨询师的帮助")
            recommendations.append("保持规律的作息和饮食习惯")
            recommendations.append("每天进行适量的运动")
        elif score < 60:
            recommendations.append("多关注自己的情绪变化")
            recommendations.append("尝试一些放松和减压的活动")
            recommendations.append("与朋友和家人保持联系")
        elif score < 80:
            recommendations.append("继续保持当前的良好状态")
            recommendations.append("可以尝试一些新的兴趣爱好")
        else:
            recommendations.append("你的情绪健康状态很好，继续保持！")
            recommendations.append("可以分享你的经验，帮助他人")
        
        return recommendations
    
    async def create_emotion_diary(
        self,
        user_id: str,
        text: str,
        emotion: Optional[str] = None,
        tags: Optional[List[str]] = None,
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """创建情绪日记条目"""
        # 如果没有提供情绪，自动检测
        if not emotion:
            emotion_data = await self.detect_user_emotion(text, user_id=user_id)
            emotion = emotion_data.get("emotion", "平静")
        else:
            emotion_data = await self.detect_user_emotion(text, user_id=user_id)
        
        diary_entry = {
            "user_id": user_id,
            "text": text,
            "emotion": emotion,
            "emotion_data": emotion_data,
            "tags": tags or [],
            "context": context,
            "timestamp": utc_now_iso(),
            "type": "diary"
        }
        
        # 保存到数据库
        await self.db.add_log(diary_entry)
        
        return {
            "id": diary_entry.get("_id"),
            "emotion": emotion,
            "timestamp": diary_entry["timestamp"],
            "message": "情绪日记已保存"
        }
    
    async def get_emotion_diary(
        self,
        user_id: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        emotion_filter: Optional[str] = None,
        limit: int = 50
    ) -> Dict[str, Any]:
        """获取情绪日记"""
        records = await self.get_emotion_history(user_id, days=30, limit=limit)
        
        # 过滤日记类型
        diary_entries = [r for r in records if r.get("type") == "diary"]
        
        # 按情绪过滤
        if emotion_filter:
            diary_entries = [e for e in diary_entries if e.get("emotion") == emotion_filter]
        
        # 按日期过滤（简化处理）
        if start_date or end_date:
            # 这里可以添加日期过滤逻辑
            pass
        
        return {
            "count": len(diary_entries),
            "entries": diary_entries
        }
    
    async def generate_emotion_report(
        self,
        user_id: str,
        period: str = "week"  # "week", "month", "custom"
    ) -> Dict[str, Any]:
        """生成情绪报告"""
        days = 7 if period == "week" else 30 if period == "month" else 7
        
        # 获取趋势分析
        trend = await self.analyze_emotion_trend(user_id, days=days)
        
        # 获取健康评估
        health = await self.assess_emotion_health(user_id)
        
        # 获取历史记录
        records = await self.get_emotion_history(user_id, days=days)
        
        # 统计信息
        total_entries = len(records)
        emotion_summary = {}
        intensity_avg = 0.0
        
        for record in records:
            emotion = record.get("emotion", "平静")
            emotion_summary[emotion] = emotion_summary.get(emotion, 0) + 1
            intensity_avg += record.get("intensity", 0.0)
        
        intensity_avg = intensity_avg / total_entries if total_entries > 0 else 0.0
        
        # 生成报告文本
        report_text = self._generate_report_text(trend, health, emotion_summary, total_entries)
        
        return {
            "period": period,
            "days": days,
            "summary": {
                "total_entries": total_entries,
                "average_intensity": round(intensity_avg, 2),
                "most_common_emotion": max(emotion_summary.items(), key=lambda x: x[1])[0] if emotion_summary else "平静",
                "emotion_distribution": emotion_summary
            },
            "trend_analysis": trend,
            "health_assessment": health,
            "report_text": report_text,
            "recommendations": health.get("recommendations", []),
            "generated_at": utc_now_iso()
        }
    
    def _generate_report_text(
        self,
        trend: Dict[str, Any],
        health: Dict[str, Any],
        emotion_summary: Dict[str, int],
        total_entries: int
    ) -> str:
        """生成报告文本"""
        lines = []
        
        lines.append(f"## 情绪报告摘要")
        lines.append(f"\n在过去的一段时间里，你记录了 {total_entries} 条情绪记录。")
        
        # 情绪分布
        if emotion_summary:
            most_common = max(emotion_summary.items(), key=lambda x: x[1])
            lines.append(f"\n最常见的情绪是「{most_common[0]}」，出现了 {most_common[1]} 次。")
        
        # 趋势
        trend_type = trend.get("trend", "stable")
        if trend_type == "improving":
            lines.append("\n你的情绪状态正在改善，这是一个积极的信号！")
        elif trend_type == "declining":
            lines.append("\n你的情绪状态有所下降，建议多关注自己的情绪变化。")
        else:
            lines.append("\n你的情绪状态相对稳定。")
        
        # 健康评估
        health_level = health.get("health_level_cn", "一般")
        health_score = health.get("health_score", 50)
        lines.append(f"\n你的情绪健康评分为 {health_score} 分，等级为「{health_level}」。")
        
        return "\n".join(lines)
    
    async def check_emotion_alert(
        self,
        user_id: str,
        current_emotion: str,
        intensity: float
    ) -> Dict[str, Any]:
        """检查情绪预警（使用可配置的阈值）"""
        # 从配置服务获取阈值
        try:
            thresholds = await self.config_service.get_alert_thresholds()
            intensity_high = thresholds.get("emotion_intensity_high", 0.7)
            intensity_critical = thresholds.get("emotion_intensity_critical", 0.9)
            consecutive_negative_count_threshold = thresholds.get("consecutive_negative_count", 3)
        except Exception:
            # 降级到默认值
            intensity_high = 0.7
            intensity_critical = 0.9
            consecutive_negative_count_threshold = 3
        
        # 获取最近的情绪记录
        recent_records = await self.get_emotion_history(user_id, days=3, limit=10)
        
        # 检查是否有连续负面情绪
        negative_emotions = ["难过", "生气", "焦虑", "失望", "疲惫"]
        recent_negative_count = sum(
            1 for r in recent_records 
            if r.get("emotion") in negative_emotions
        )
        
        alerts = []
        alert_level = "none"
        
        # 预警条件1：当前情绪负面且强度高（使用配置的阈值）
        if current_emotion in negative_emotions and intensity > intensity_high:
            alerts.append({
                "type": "high_intensity_negative",
                "message": f"你当前的{current_emotion}情绪强度较高，建议采取干预措施",
                "severity": "medium"
            })
            alert_level = "medium"
        
        # 预警条件2：连续多天负面情绪（使用配置的阈值）
        if recent_negative_count >= consecutive_negative_count_threshold:
            alerts.append({
                "type": "consecutive_negative",
                "message": "你最近连续多天出现负面情绪，建议关注情绪健康",
                "severity": "high"
            })
            alert_level = "high"
        
        # 预警条件3：情绪急剧下降
        if len(recent_records) >= 3:
            recent_intensities = [r.get("intensity", 0.0) for r in recent_records[:3]]
            if len(recent_intensities) >= 2:
                intensity_drop = recent_intensities[0] - recent_intensities[-1]
                if intensity_drop > 0.5:
                    alerts.append({
                        "type": "rapid_decline",
                        "message": "你的情绪状态出现急剧下降，建议寻求支持",
                        "severity": "high"
                    })
                    alert_level = "high"
        
        return {
            "has_alert": len(alerts) > 0,
            "alert_level": alert_level,
            "alerts": alerts,
            "recommendation": self._get_alert_recommendation(alert_level, current_emotion)
        }
    
    def _get_alert_recommendation(self, alert_level: str, emotion: str) -> str:
        """获取预警建议"""
        if alert_level == "high":
            return "建议立即采取干预措施，或考虑寻求专业心理咨询师的帮助"
        elif alert_level == "medium":
            return "建议尝试一些放松和减压的活动，关注自己的情绪变化"
        else:
            return "你的情绪状态正常，继续保持"
    
    async def get_emotion_insights(
        self,
        user_id: str,
        days: int = 7
    ) -> Dict[str, Any]:
        """获取情绪洞察（结合社交解码数据）"""
        # 获取情绪趋势
        emotion_trend = await self.analyze_emotion_trend(user_id, days=days)
        
        # 获取社交解码历史（如果存在）
        from services.db_service import DBService
        db = DBService()
        decoder_logs = await db.get_conversation_logs(user_id=user_id, limit=50)
        
        # 分析情绪与社交场景的关系
        emotion_scene_correlation = {}
        for log in decoder_logs:
            scene = log.get("scene_category", "未知")
            # 这里可以关联情绪数据（简化处理）
            emotion_scene_correlation[scene] = emotion_scene_correlation.get(scene, 0) + 1
        
        # 生成洞察
        insights = []
        
        # 洞察1：情绪趋势
        if emotion_trend.get("trend") == "improving":
            insights.append({
                "type": "positive_trend",
                "title": "情绪改善",
                "description": "你的情绪状态正在改善，继续保持良好的生活习惯"
            })
        
        # 洞察2：常见情绪
        most_common = emotion_trend.get("average_emotion", "平静")
        if most_common in ["难过", "生气", "焦虑"]:
            insights.append({
                "type": "emotion_pattern",
                "title": "情绪模式",
                "description": f"你最近{most_common}的情绪较多，建议关注并采取相应措施"
            })
        
        # 洞察3：社交场景关联（如果有数据）
        if emotion_scene_correlation:
            most_common_scene = max(emotion_scene_correlation.items(), key=lambda x: x[1])[0]
            insights.append({
                "type": "social_correlation",
                "title": "社交场景",
                "description": f"你最近遇到的「{most_common_scene}」场景较多，这可能与你的情绪状态有关"
            })
        
        return {
            "emotion_trend": emotion_trend,
            "emotion_scene_correlation": emotion_scene_correlation,
            "insights": insights,
            "recommendations": self._generate_insight_recommendations(insights, emotion_trend)
        }
    
    def _generate_insight_recommendations(
        self,
        insights: List[Dict[str, Any]],
        trend: Dict[str, Any]
    ) -> List[str]:
        """基于洞察生成建议"""
        recommendations = []
        
        for insight in insights:
            if insight["type"] == "positive_trend":
                recommendations.append("继续保持当前的良好状态，可以尝试一些新的兴趣爱好")
            elif insight["type"] == "emotion_pattern":
                recommendations.append("建议尝试一些放松活动，如深呼吸、听音乐或散步")
            elif insight["type"] == "social_correlation":
                recommendations.append("可以回顾最近的社交场景，思考如何更好地应对类似情况")
        
        return recommendations

    async def generate_emotion_summary(
        self,
        user_id: str,
        days: int = 1
    ) -> Dict[str, Any]:
        """生成面向用户的情绪摘要（提升体验）"""
        records = await self.get_emotion_history(user_id, days=days, limit=200)
        if not records:
            return {
                "summary_text": f"过去 {days} 天没有检测到情绪记录，建议补充情绪日记。",
                "highlights": [],
                "risk_level": "low"
            }

        emotion_counts: Dict[str, int] = {}
        intensity_sum = 0.0
        positive = 0
        negative = 0
        latest_record = records[0]

        for record in records:
            emotion = record.get("emotion", "平静")
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
            intensity_sum += record.get("intensity", 0.0)

            sentiment = record.get("sentiment", "neutral")
            if sentiment == "positive":
                positive += 1
            elif sentiment == "negative":
                negative += 1

        total = len(records)
        avg_intensity = intensity_sum / total if total else 0.0
        top_emotion = max(emotion_counts.items(), key=lambda x: x[1])[0]
        positive_ratio = positive / total if total else 0.0
        negative_ratio = negative / total if total else 0.0

        risk_level = "low"
        if negative_ratio > 0.6 or avg_intensity < 0.3:
            risk_level = "high"
        elif negative_ratio > 0.4:
            risk_level = "medium"

        summary_lines = [
            f"过去 {days} 天你记录了 {total} 条情绪，其中「{top_emotion}」出现最多。",
            f"平均情绪强度为 {avg_intensity:.2f}，正面情绪占比 {positive_ratio:.0%}，负面情绪占比 {negative_ratio:.0%}。"
        ]

        if risk_level == "high":
            summary_lines.append("当前负面情绪偏多，建议及时调节状态或寻求支持。")
        elif risk_level == "medium":
            summary_lines.append("最近出现一些波动，建议保持自我关怀和规律作息。")
        else:
            summary_lines.append("总体状态稳定，继续保持良好的情绪管理习惯。")

        summary_text = "\n".join(summary_lines)

        highlights = [
            {
                "title": "最常见情绪",
                "value": top_emotion,
                "details": f"出现 {emotion_counts[top_emotion]} 次"
            },
            {
                "title": "最新记录",
                "value": latest_record.get("emotion", "平静"),
                "details": latest_record.get("text", "")[:80]
            }
        ]

        return {
            "summary_text": summary_text,
            "highlights": highlights,
            "risk_level": risk_level,
            "stats": {
                "total_records": total,
                "average_intensity": round(avg_intensity, 2),
                "positive_ratio": round(positive_ratio, 2),
                "negative_ratio": round(negative_ratio, 2),
                "top_emotion": top_emotion
            }
        }

    
    async def get_emotion_visualization_data(
        self,
        user_id: str,
        days: int = 7
    ) -> Dict[str, Any]:
        """获取情绪可视化数据（用于图表展示）"""
        records = await self.get_emotion_history(user_id, days=days, limit=500)
        
        # 按日期分组
        daily_emotions = {}
        emotion_counts = {}
        intensity_by_emotion = {}
        
        for record in records:
            timestamp = record.get("timestamp", "")
            # 提取日期（简化处理）
            date_key = timestamp[:10] if len(timestamp) >= 10 else "unknown"
            
            emotion = record.get("emotion", "平静")
            intensity = record.get("intensity", 0.0)
            
            # 每日情绪统计
            if date_key not in daily_emotions:
                daily_emotions[date_key] = {
                    "emotions": {},
                    "avg_intensity": 0.0,
                    "count": 0
                }
            
            daily_emotions[date_key]["emotions"][emotion] = daily_emotions[date_key]["emotions"].get(emotion, 0) + 1
            daily_emotions[date_key]["avg_intensity"] += intensity
            daily_emotions[date_key]["count"] += 1
            
            # 情绪计数
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
            
            # 情绪强度统计
            if emotion not in intensity_by_emotion:
                intensity_by_emotion[emotion] = []
            intensity_by_emotion[emotion].append(intensity)
        
        # 计算每日平均强度
        for date_key in daily_emotions:
            count = daily_emotions[date_key]["count"]
            if count > 0:
                daily_emotions[date_key]["avg_intensity"] /= count
        
        # 计算各情绪的平均强度
        emotion_avg_intensity = {}
        for emotion, intensities in intensity_by_emotion.items():
            emotion_avg_intensity[emotion] = sum(intensities) / len(intensities) if intensities else 0.0
        
        # 生成时间序列数据
        time_series = []
        for date_key in sorted(daily_emotions.keys()):
            data = daily_emotions[date_key]
            time_series.append({
                "date": date_key,
                "emotions": data["emotions"],
                "avg_intensity": round(data["avg_intensity"], 2),
                "count": data["count"]
            })
        
        return {
            "time_series": time_series,
            "emotion_distribution": emotion_counts,
            "emotion_avg_intensity": {k: round(v, 2) for k, v in emotion_avg_intensity.items()},
            "total_records": len(records),
            "date_range": {
                "start": min(daily_emotions.keys()) if daily_emotions else None,
                "end": max(daily_emotions.keys()) if daily_emotions else None
            }
        }
    
    async def set_emotion_goal(
        self,
        user_id: str,
        goal_type: str,  # "reduce_negative", "increase_positive", "maintain_stable"
        target_emotion: Optional[str] = None,
        target_value: Optional[float] = None,
        deadline: Optional[str] = None
    ) -> Dict[str, Any]:
        """设置情绪目标"""
        goal = {
            "user_id": user_id,
            "goal_type": goal_type,
            "target_emotion": target_emotion,
            "target_value": target_value,
            "deadline": deadline,
            "created_at": utc_now_iso(),
            "status": "active",
            "progress": 0.0
        }
        
        # 保存目标（简化处理，实际应该保存到专门的 goals 集合）
        await self.db.add_log(goal)
        
        return {
            "goal_id": goal.get("_id"),
            "message": "情绪目标已设置",
            "goal": goal
        }
    
    async def track_emotion_goal(
        self,
        user_id: str,
        goal_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """追踪情绪目标进度"""
        # 获取用户的目标（简化处理）
        records = await self.get_emotion_history(user_id, days=30, limit=100)
        
        # 查找活跃目标（简化处理，实际应该从数据库查询）
        # 这里假设有一个默认目标：减少负面情绪
        
        # 计算进度
        negative_emotions = ["难过", "生气", "焦虑", "失望", "疲惫"]
        recent_negative = sum(1 for r in records if r.get("emotion") in negative_emotions)
        total_recent = len(records)
        
        if total_recent > 0:
            negative_ratio = recent_negative / total_recent
            progress = (1 - negative_ratio) * 100  # 负面情绪越少，进度越高
        else:
            progress = 0.0
        
        return {
            "goal_id": goal_id or "default",
            "progress": round(progress, 1),
            "status": "active" if progress < 80 else "completed",
            "message": f"当前进度：{progress:.1f}%",
            "recommendation": "继续努力减少负面情绪" if progress < 80 else "目标已达成，继续保持！"
        }
    
    async def compare_emotion_periods(
        self,
        user_id: str,
        period1_days: int = 7,
        period2_days: int = 7
    ) -> Dict[str, Any]:
        """对比两个时间段的情绪状态"""
        # 获取两个时间段的数据
        records1 = await self.get_emotion_history(user_id, days=period1_days, limit=100)
        records2 = await self.get_emotion_history(user_id, days=period2_days, limit=100)
        
        def analyze_period(records):
            emotion_counts = {}
            avg_intensity = 0.0
            positive_count = 0
            negative_count = 0
            
            for record in records:
                emotion = record.get("emotion", "平静")
                emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
                avg_intensity += record.get("intensity", 0.0)
                
                sentiment = record.get("sentiment", "neutral")
                if sentiment == "positive":
                    positive_count += 1
                elif sentiment == "negative":
                    negative_count += 1
            
            total = len(records)
            return {
                "total_records": total,
                "emotion_distribution": emotion_counts,
                "avg_intensity": avg_intensity / total if total > 0 else 0.0,
                "positive_ratio": positive_count / total if total > 0 else 0.0,
                "negative_ratio": negative_count / total if total > 0 else 0.0
            }
        
        period1_data = analyze_period(records1)
        period2_data = analyze_period(records2)
        
        # 计算变化
        intensity_change = period2_data["avg_intensity"] - period1_data["avg_intensity"]
        positive_change = period2_data["positive_ratio"] - period1_data["positive_ratio"]
        negative_change = period2_data["negative_ratio"] - period1_data["negative_ratio"]
        
        # 判断趋势
        if intensity_change > 0.1 and positive_change > 0.1:
            trend = "improving"
            trend_message = "情绪状态明显改善"
        elif intensity_change < -0.1 and negative_change > 0.1:
            trend = "declining"
            trend_message = "情绪状态有所下降"
        else:
            trend = "stable"
            trend_message = "情绪状态相对稳定"
        
        return {
            "period1": {
                "days": period1_days,
                "data": period1_data
            },
            "period2": {
                "days": period2_days,
                "data": period2_data
            },
            "changes": {
                "intensity_change": round(intensity_change, 2),
                "positive_change": round(positive_change, 2),
                "negative_change": round(negative_change, 2)
            },
            "trend": trend,
            "trend_message": trend_message,
            "recommendation": self._get_comparison_recommendation(trend, intensity_change)
        }
    
    def _get_comparison_recommendation(self, trend: str, intensity_change: float) -> str:
        """获取对比分析建议"""
        if trend == "improving":
            return "你的情绪状态正在改善，继续保持良好的生活习惯和情绪管理策略"
        elif trend == "declining":
            return "你的情绪状态有所下降，建议关注情绪变化，考虑调整生活方式或寻求支持"
        else:
            return "你的情绪状态相对稳定，可以尝试一些新的活动来进一步提升情绪健康"
    
    async def get_emotion_statistics(
        self,
        user_id: str,
        days: int = 30
    ) -> Dict[str, Any]:
        """获取情绪统计数据（综合）"""
        records = await self.get_emotion_history(user_id, days=days, limit=500)
        
        if not records:
            return {
                "total_records": 0,
                "message": "暂无数据"
            }
        
        # 基础统计
        emotion_counts = {}
        intensity_sum = 0.0
        positive_count = 0
        negative_count = 0
        neutral_count = 0
        
        for record in records:
            emotion = record.get("emotion", "平静")
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
            intensity_sum += record.get("intensity", 0.0)
            
            sentiment = record.get("sentiment", "neutral")
            if sentiment == "positive":
                positive_count += 1
            elif sentiment == "negative":
                negative_count += 1
            else:
                neutral_count += 1
        
        total = len(records)
        avg_intensity = intensity_sum / total if total > 0 else 0.0
        
        # 最常出现的情绪
        most_common_emotion = max(emotion_counts.items(), key=lambda x: x[1])[0] if emotion_counts else "平静"
        most_common_count = emotion_counts.get(most_common_emotion, 0)
        
        return {
            "total_records": total,
            "average_intensity": round(avg_intensity, 2),
            "emotion_distribution": emotion_counts,
            "sentiment_distribution": {
                "positive": positive_count,
                "negative": negative_count,
                "neutral": neutral_count,
                "positive_ratio": round(positive_count / total, 2) if total > 0 else 0.0,
                "negative_ratio": round(negative_count / total, 2) if total > 0 else 0.0
            },
            "most_common_emotion": {
                "emotion": most_common_emotion,
                "count": most_common_count,
                "percentage": round(most_common_count / total * 100, 1) if total > 0 else 0.0
            },
            "days_analyzed": days
        }

    async def set_emotion_reminder(
        self,
        user_id: str,
        frequency: str,
        reminder_time: str,
        channels: Optional[List[str]] = None,
        days_of_week: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """设置情绪提醒（体验优化）"""
        reminder = {
            "type": "reminder",
            "user_id": user_id,
            "frequency": frequency,  # daily / weekly / custom
            "time": reminder_time,
            "channels": channels or ["in_app"],
            "days_of_week": days_of_week or [],
            "status": "active",
            "created_at": utc_now_iso()
        }
        await self.db.add_log(reminder)
        return {
            "reminder_id": reminder.get("_id"),
            "message": "提醒已设置",
            "reminder": reminder
        }

    async def list_emotion_reminders(self, user_id: str) -> List[Dict[str, Any]]:
        """列出用户的提醒设置"""
        records = await self.get_emotion_history(user_id, days=30, limit=300)
        reminders = [r for r in records if r.get("type") == "reminder"]
        return reminders

    async def check_emotion_reminders(
        self,
        user_id: str,
        current_time: Optional[str] = None
    ) -> Dict[str, Any]:
        """检查是否需要提醒（简单实现）"""
        reminders = await self.list_emotion_reminders(user_id)
        if not reminders:
            return {
                "need_reminder": False,
                "reminders": []
            }
        # 目前简单返回所有 active 提醒，后续可根据 current_time 判断
        active = [r for r in reminders if r.get("status", "active") == "active"]
        return {
            "need_reminder": len(active) > 0,
            "reminders": active
        }

