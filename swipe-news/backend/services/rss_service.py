import asyncio
import hashlib
import re
import uuid
from datetime import datetime, timezone
from typing import Optional

import feedparser
import httpx

from constants.rss_sources import RSS_SOURCES
from services.cache_service import cache

CACHE_TTL_RSS = 1800  # 30 dakika


def _extract_image(entry) -> Optional[str]:
    # 1. media:content
    media = getattr(entry, "media_content", None)
    if media and isinstance(media, list) and media[0].get("url"):
        return media[0]["url"]

    # 2. media:thumbnail
    thumb = getattr(entry, "media_thumbnail", None)
    if thumb and isinstance(thumb, list) and thumb[0].get("url"):
        return thumb[0]["url"]

    # 3. enclosure
    enclosures = getattr(entry, "enclosures", [])
    for enc in enclosures:
        if enc.get("type", "").startswith("image") and enc.get("href"):
            return enc["href"]

    # 4. img tag inside summary/content
    summary = entry.get("summary", "") or ""
    content_list = entry.get("content", [])
    content_html = content_list[0].get("value", "") if content_list else ""
    html = content_html or summary
    match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', html)
    if match:
        return match.group(1)

    return None


def _clean_summary(entry) -> str:
    summary = entry.get("summary", "") or ""
    # strip HTML tags
    clean = re.sub(r"<[^>]+>", "", summary)
    clean = re.sub(r"\s+", " ", clean).strip()
    return clean[:200]


def _parse_date(entry) -> str:
    published = entry.get("published_parsed") or entry.get("updated_parsed")
    if published:
        dt = datetime(*published[:6], tzinfo=timezone.utc)
        return dt.isoformat()
    return datetime.now(timezone.utc).isoformat()


def _parse_feed(raw_content: str, source_meta: dict) -> list[dict]:
    feed = feedparser.parse(raw_content)
    items = []
    for entry in feed.entries:
        url = entry.get("link", "")
        if not url:
            continue
        item_id = hashlib.md5(url.encode()).hexdigest()
        items.append(
            {
                "id": item_id,
                "title": entry.get("title", "").strip(),
                "summary": _clean_summary(entry),
                "url": url,
                "image_url": _extract_image(entry),
                "source": source_meta["source"],
                "category": source_meta["category"],
                "country": source_meta["country"],
                "published_at": _parse_date(entry),
            }
        )
    return items


async def _fetch_one(client: httpx.AsyncClient, source: dict) -> list[dict]:
    try:
        resp = await client.get(
            source["url"],
            timeout=10,
            headers={
                "User-Agent": "Mozilla/5.0 (compatible; SwipeNews/1.0; +https://swipenews.app)"
            },
            follow_redirects=True,
        )
        resp.raise_for_status()
        return _parse_feed(resp.text, source)
    except Exception:
        return []


async def get_news(categories: list[str], countries: list[str]) -> list[dict]:
    cache_key = "feed:" + ",".join(sorted(categories)) + "|" + ",".join(sorted(countries))
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    sources = RSS_SOURCES
    if categories:
        sources = [s for s in sources if s["category"] in categories]
    if countries:
        sources = [s for s in sources if s["country"] in countries]

    async with httpx.AsyncClient() as client:
        results = await asyncio.gather(*[_fetch_one(client, s) for s in sources])

    all_items: list[dict] = []
    seen_ids: set[str] = set()
    for batch in results:
        for item in batch:
            if item["id"] not in seen_ids:
                seen_ids.add(item["id"])
                all_items.append(item)

    # Tarihe göre sırala (yeniden eskiye)
    all_items.sort(key=lambda x: x["published_at"], reverse=True)

    cache.set(cache_key, all_items, CACHE_TTL_RSS)
    return all_items
