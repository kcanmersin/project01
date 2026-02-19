from fastapi import APIRouter, Query
from typing import Optional

from services.rss_service import get_news

router = APIRouter()


@router.get("/feed")
async def feed(
    categories: Optional[str] = Query(
        default=None,
        description="Comma-separated category list, e.g. gundem,spor. Empty = all.",
    )
):
    cat_list = [c.strip() for c in categories.split(",")] if categories else []
    items = await get_news(cat_list)
    return {"items": items, "count": len(items)}
