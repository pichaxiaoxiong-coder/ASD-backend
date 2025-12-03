"""
工具函数
"""
from datetime import datetime, timezone


def utc_now_iso() -> str:
    """获取当前UTC时间的ISO格式字符串"""
    return datetime.now(timezone.utc).isoformat()


def parse_iso_date(date_str: str) -> datetime:
    """解析ISO格式日期字符串"""
    try:
        # 处理带Z的格式
        if date_str.endswith("Z"):
            date_str = date_str[:-1] + "+00:00"
        return datetime.fromisoformat(date_str)
    except Exception:
        return datetime.now(timezone.utc)
