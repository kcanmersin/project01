from fastapi import APIRouter, Query, HTTPException
from typing import Optional

import httpx
from bs4 import BeautifulSoup

from services.cache_service import cache

CACHE_TTL_OGIMAGE = 86400  # 24 saat
DESKTOP_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)

router = APIRouter()


async def _fetch_og_image(url: str) -> Optional[str]:
    try:
        async with httpx.AsyncClient(follow_redirects=True) as client:
            resp = await client.get(
                url,
                timeout=5,
                headers={"User-Agent": DESKTOP_UA},
            )
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")

            # og:image
            tag = soup.find("meta", property="og:image")
            if tag and tag.get("content"):
                return tag["content"]

            # twitter:image fallback
            tag = soup.find("meta", attrs={"name": "twitter:image"})
            if tag and tag.get("content"):
                return tag["content"]

    except Exception:
        pass
    return None


@router.get("/ogimage")
async def ogimage(url: str = Query(..., description="Article URL to extract og:image from")):
    if not url.startswith("http"):
        raise HTTPException(status_code=400, detail="Invalid URL")

    cache_key = f"ogimage:{url}"
    cached = cache.get(cache_key)
    if cached is not None:
        return {"image_url": cached if cached != "__null__" else None}

    image_url = await _fetch_og_image(url)
    # Cache null results too so we don't re-fetch failing URLs
    cache.set(cache_key, image_url if image_url else "__null__", CACHE_TTL_OGIMAGE)
    return {"image_url": image_url}
