from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import feed, ogimage

app = FastAPI(title="SwipeNews API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(feed.router)
app.include_router(ogimage.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
