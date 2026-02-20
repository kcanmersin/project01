from fastapi import APIRouter, Query
from typing import Optional

from services.rss_service import get_news

router = APIRouter()


@router.get("/feed")
async def feed(
    categories: Optional[str] = Query(
        default=None,
        description="Comma-separated category list, e.g. gundem,spor. Empty = all.",
    ),
    countries: Optional[str] = Query(
        default=None,
        description="Comma-separated country codes, e.g. TR,US,GB. Empty = all.",
    ),
):
    cat_list     = [c.strip() for c in categories.split(",")] if categories else []
    country_list = [c.strip() for c in countries.split(",")]  if countries  else []
    items = await get_news(cat_list, country_list)
    return {"items": items, "count": len(items)}
