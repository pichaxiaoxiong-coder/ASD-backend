from typing import List, Optional, Dict, Any
from core.config import settings

try:
    import chromadb
    from chromadb.utils import embedding_functions
except Exception:
    chromadb = None  # type: ignore
    embedding_functions = None  # type: ignore


class VectorService:
    def __init__(self):
        self._client = None
        self._collection = None
        self._memory_store: Dict[str, str] = {}  # 内存降级存储
        
        if chromadb is not None:
            try:
                self._client = chromadb.PersistentClient(path=settings.CHROMA_PATH)
                # 默认为 OpenAI 嵌入，若无 Key，可换成内置 embedding 或占位
                if settings.OPENAI_API_KEY and embedding_functions is not None:
                    ef = embedding_functions.OpenAIEmbeddingFunction(
                        api_key=settings.OPENAI_API_KEY,
                        model_name="text-embedding-3-small",
                    )
                else:
                    ef = None
                self._collection = self._client.get_or_create_collection(
                    name="documents", embedding_function=ef
                )
            except Exception:
                pass  # 使用内存模式

    def add(self, ids: List[str], texts: List[str], metadatas: List[dict] | None = None):
        if self._collection is not None:
            self._collection.add(ids=ids, documents=texts, metadatas=metadatas)
        else:
            # 内存模式：简单存储
            for i, text in zip(ids, texts):
                self._memory_store[i] = text

    def query(self, text: str, k: int = 3):
        if self._collection is not None:
            return self._collection.query(query_texts=[text], n_results=k)
        else:
            # 内存模式：返回前 k 个
            items = list(self._memory_store.items())[:k]
            return {
                "ids": [id for id, _ in items],
                "documents": [[text] for _, text in items],
                "metadatas": [[] for _ in items]
            }

















