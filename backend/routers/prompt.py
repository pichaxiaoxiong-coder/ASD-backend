from fastapi import APIRouter, Query

router = APIRouter()


@router.get("/template/{scene}")
async def get_prompt_template(scene: str):
    """获取场景提示模板"""
    from services.prompt_service import get_prompt_service
    
    service = get_prompt_service()
    try:
        template = service.load_template(scene)
        return template
    except FileNotFoundError:
        return {"error": f"Template not found: {scene}"}


@router.get("/templates")
async def list_prompt_templates():
    """列出所有可用的提示模板"""
    from services.prompt_service import get_prompt_service
    import os
    
    service = get_prompt_service()
    prompt_dir = "prompt"
    templates = []
    
    if os.path.exists(prompt_dir):
        for file in os.listdir(prompt_dir):
            if file.endswith(".json"):
                template_name = file.replace(".json", "")
                templates.append(template_name)
    
    return {
        "count": len(templates),
        "templates": templates
    }
