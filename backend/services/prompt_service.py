from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import List, Dict, Any

_prompt_service_instance = None


class PromptService:
    def __init__(self, base_path: Path | None = None):
        default_path = Path(__file__).resolve().parents[1] / "prompt"
        self.base_path = base_path or default_path

    def _all_files(self) -> List[Path]:
        if not self.base_path.exists():
            return []
        return sorted(self.base_path.glob("*.json"))

    @lru_cache(maxsize=128)
    def load_template(self, name: str) -> Dict[str, Any]:
        file_path = self.base_path / f"{name}.json"
        if not file_path.exists():
            raise FileNotFoundError(name)
        with file_path.open("r", encoding="utf-8") as f:
            return json.load(f)

    def list_templates(self) -> List[Dict[str, Any]]:
        templates = []
        for file in self._all_files():
            templates.append(
                {
                    "name": file.stem,
                    "filename": file.name,
                    "size": file.stat().st_size,
                }
            )
        return templates

    def export_all(self) -> Dict[str, Any]:
        data = {}
        for file in self._all_files():
            with file.open("r", encoding="utf-8") as f:
                data[file.stem] = json.load(f)
        return data

    def export_markdown(self) -> str:
        data = self.export_all()
        lines: List[str] = []
        for name, body in data.items():
            lines.append(f"## {name}")
            if desc := body.get("description"):
                lines.append(desc)
            if subs := body.get("sub_scenes"):
                for sub in subs:
                    lines.append(f"### {sub.get('type', '')}")
                    if patterns := sub.get("patterns"):
                        lines.append(f"- 常见表达：{', '.join(patterns)}")
                    if exp := sub.get("simple_explanation"):
                        lines.append(f"- 解释：{exp}")
                    if why := sub.get("why"):
                        lines.append(f"- 原因：{why}")
                    if steps := sub.get("suggestion_steps"):
                        lines.append("- 建议：")
                        for step in steps:
                            lines.append(f"  - {step}")
            lines.append("")
        return "\n".join(lines).strip()


def get_prompt_service() -> PromptService:
    global _prompt_service_instance
    if _prompt_service_instance is None:
        _prompt_service_instance = PromptService()
    return _prompt_service_instance



