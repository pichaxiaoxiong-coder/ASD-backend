from typing import Optional, List
from core.config import settings

try:
    from openai import OpenAI  # SDK v1.x
except Exception:  # 未安装 openai 时兜底
    OpenAI = None  # type: ignore

from services.config_service import get_config_service


class AIService:
    def __init__(self):
        self.config_service = get_config_service()
        self._client: Optional[OpenAI] = None
        self._provider = "openai"  # 默认provider
        self._model = "gpt-4o-mini"  # 默认模型
        
        # 初始化时使用默认配置
        if settings.OPENAI_API_KEY and OpenAI is not None:
            self._client = OpenAI(api_key=settings.OPENAI_API_KEY)
    
    async def _load_provider_config(self):
        """从配置服务加载LLM Provider配置（异步）"""
        try:
            config = await self.config_service.get_llm_provider_config()
            self._provider = config.get("default_provider", "openai")
            
            provider_config = config.get(self._provider, {})
            self._model = provider_config.get("model", "gpt-4o-mini")
            
            # 如果provider是deepseek，需要特殊处理
            if self._provider == "deepseek" and OpenAI is not None:
                api_key = provider_config.get("api_key") or settings.OPENAI_API_KEY
                base_url = provider_config.get("base_url", "https://api.deepseek.com/v1")
                if api_key:
                    try:
                        self._client = OpenAI(api_key=api_key, base_url=base_url)
                    except Exception:
                        pass
        except Exception:
            pass  # 使用默认配置

    def simple_reply(self, text: str) -> str:
        return f"AI reply: {text}"

    def generate_reply(self, prompt: str, context_chunks: Optional[List[str]] = None) -> str:
        context = "\n\n".join(context_chunks or [])
        full_prompt = (
            "You are a helpful assistant. Use provided context when relevant.\n"
            f"Context:\n{context}\n\nUser: {prompt}\nAssistant:"
        )
        # 无 OPENAI_API_KEY 或 openai 包时，降级为本地规则回复
        if self._client is None:
            return self.simple_reply(prompt)
        try:
            # 尝试加载配置（如果还没有加载）
            if not hasattr(self, '_config_loaded'):
                try:
                    import asyncio
                    loop = asyncio.get_event_loop()
                    if loop.is_running():
                        # 如果已经在事件循环中，跳过异步加载
                        pass
                    else:
                        loop.run_until_complete(self._load_provider_config())
                except Exception:
                    pass
                self._config_loaded = True
            
            resp = self._client.chat.completions.create(
                model=self._model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": full_prompt},
                ],
                temperature=0.4,
                max_tokens=256,
            )
            return resp.choices[0].message.content or ""
        except Exception:
            # 出错时兜底
            return self.simple_reply(prompt)
















