import os
import sys
import pickle
import logging
import argparse
import numpy as np
import psycopg2
import faiss
from pathlib import Path
from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
import uvicorn

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
ENV_PATH = PROJECT_ROOT / "infrastructure" / ".env"
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

PLOT_INDEX_PATH = DATA_DIR / "plot.index"
STYLE_INDEX_PATH = DATA_DIR / "style.index"
METADATA_PATH = DATA_DIR / "metadata.pkl"

# Database connection

def get_db_connection():
    load_dotenv(ENV_PATH)
    db_url = os.getenv('DATABASE_URL')
    if db_url:
        return psycopg2.connect(db_url, sslmode='require')
    return psycopg2.connect(
        host=os.getenv('DATABASE_HOST', 'localhost'),
        port=os.getenv('DATABASE_PORT', 5432),
        database=os.getenv('DATABASE_NAME', 'CINE'),
        user=os.getenv('DATABASE_USER', 'cinesocial'),
        password=os.getenv('DATABASE_PASSWORD', 'cinesocial123')
    )

SQL_QUERY = """
WITH MovieData AS (
    SELECT 
        m."Id",
        m."TmdbId",
        m."Title",
        m."Popularity",
        m."VoteAverage",
        m."ReleaseDate",
        CONCAT(
            m."Title", '. ', 
            COALESCE(m."Overview", ''), '. ', 
            COALESCE(m."Tagline", ''), '. ',
            (SELECT STRING_AGG(k."Name", ' ') FROM "MovieKeywords" mk JOIN "Keywords" k ON mk."KeywordId" = k."Id" WHERE mk."MovieId" = m."Id")
        ) as PlotText,
        CONCAT(
            'Genres: ', (SELECT STRING_AGG(g."Name", ', ') FROM "MovieGenres" mg JOIN "Genres" g ON mg."GenreId" = g."Id" WHERE mg."MovieId" = m."Id"), '. ',
            'Director: ', (SELECT STRING_AGG(p."Name", ', ') FROM "MovieCrews" mc JOIN "People" p ON mc."PersonId" = p."Id" WHERE mc."MovieId" = m."Id" AND mc."Job" = 'Director'), '. ',
            'Cast: ', (SELECT STRING_AGG(p."Name", ', ') FROM "MovieCasts" mca JOIN "People" p ON mca."PersonId" = p."Id" WHERE mca."MovieId" = m."Id" AND mca."CastOrder" < 5), '. ',
            'Studio: ', (SELECT STRING_AGG(pc."Name", ', ') FROM "MovieProductionCompanies" mpc JOIN "ProductionCompanies" pc ON mpc."ProductionCompanyId" = pc."Id" WHERE mpc."MovieId" = m."Id")
        ) as StyleText
    FROM "Movies" m
    WHERE m."IsDeleted" = FALSE
)
SELECT "TmdbId", "PlotText", "StyleText", "Popularity", "VoteAverage", "ReleaseDate", "Title" FROM MovieData;
"""

def train_model():
    logger.info("Training started...")
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        logger.info("Fetching data from database...")
        cursor.execute(SQL_QUERY)
        results = cursor.fetchall()
        conn.close()
    except Exception as e:
        logger.error(f"DB error: {e}")
        return
    if not results:
        logger.warning("No data found!")
        return
    logger.info(f"Processing {len(results)} movies.")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    tmdb_ids = []
    plot_texts = []
    style_texts = []
    metadata_list = []
    for row in results:
        t_id, plot, style, pop, vote, date, title = row
        tmdb_ids.append(t_id)
        plot_texts.append(plot if plot else "")
        style_texts.append(style if style else "")
        year = date.year if date else 1900
        metadata_list.append({
            "tmdbId": t_id,
            "popularity": float(pop) if pop else 0,
            "voteAverage": float(vote) if vote else 0,
            "year": year
        })
    logger.info("Encoding vectors...")
    plot_embeddings = model.encode(plot_texts, batch_size=64, convert_to_numpy=True, show_progress_bar=True)
    style_embeddings = model.encode(style_texts, batch_size=64, convert_to_numpy=True, show_progress_bar=True)
    dimension = 384
    faiss.normalize_L2(plot_embeddings)
    faiss.normalize_L2(style_embeddings)
    plot_index = faiss.IndexFlatIP(dimension)
    style_index = faiss.IndexFlatIP(dimension)
    plot_index.add(plot_embeddings)
    style_index.add(style_embeddings)
    faiss.write_index(plot_index, str(PLOT_INDEX_PATH))
    faiss.write_index(style_index, str(STYLE_INDEX_PATH))
    id_map = {i: tmdb_id for i, tmdb_id in enumerate(tmdb_ids)}
    reverse_id_map = {tmdb_id: i for i, tmdb_id in enumerate(tmdb_ids)}
    save_data = {
        "metadata": metadata_list,
        "id_map": id_map,
        "reverse_id_map": reverse_id_map
    }
    with open(METADATA_PATH, "wb") as f:
        pickle.dump(save_data, f)
    logger.info(f"Training completed! Files saved in: {DATA_DIR}")

api_state = {"plot_index": None, "style_index": None, "metadata": [], "id_map": {}, "reverse_id_map": {}}

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("API starting: loading models...")
    if PLOT_INDEX_PATH.exists():
        api_state["plot_index"] = faiss.read_index(str(PLOT_INDEX_PATH))
        api_state["style_index"] = faiss.read_index(str(STYLE_INDEX_PATH))
        with open(METADATA_PATH, "rb") as f:
            data = pickle.load(f)
            api_state["metadata"] = data["metadata"]
            api_state["id_map"] = data["id_map"]
            api_state["reverse_id_map"] = data["reverse_id_map"]
        logger.info(f"Ready! {len(api_state['metadata'])} movies loaded.")
    else:
        logger.warning("Model files not found! Run with '--train' first.")
    yield

app = FastAPI(lifespan=lifespan)

class RecRequest(BaseModel):
    tmdb_id: int
    count: int = 10
    plot_weight: float = 0.7
    style_weight: float = 0.3

class RecItem(BaseModel):
    tmdb_id: int
    score: float
    debug_info: str

class RecResponse(BaseModel):
    source_movie: int
    recommendations: List[RecItem]

@app.post("/recommend/movie-to-movie", response_model=RecResponse)
async def recommend(req: RecRequest):
    if not api_state["plot_index"]:
        raise HTTPException(status_code=503, detail="AI model not ready.")
    if req.tmdb_id not in api_state["reverse_id_map"]:
        # If ID not found, return empty list
        return {"source_movie": req.tmdb_id, "recommendations": []}
    internal_id = api_state["reverse_id_map"][req.tmdb_id]
    # Plot similarity
    p_vec = api_state["plot_index"].reconstruct(internal_id).reshape(1, -1)
    p_dists, p_indices = api_state["plot_index"].search(p_vec, 50)
    # Style similarity
    s_vec = api_state["style_index"].reconstruct(internal_id).reshape(1, -1)
    s_dists, s_indices = api_state["style_index"].search(s_vec, 50)
    # Score aggregation
    scores = {}
    for score, idx in zip(p_dists[0], p_indices[0]):
        if idx == internal_id or idx == -1: continue
        scores[idx] = scores.get(idx, 0) + (score * req.plot_weight)
    for score, idx in zip(s_dists[0], s_indices[0]):
        if idx == internal_id or idx == -1: continue
        scores[idx] = scores.get(idx, 0) + (score * req.style_weight)
    # Business logic
    final_res = []
    source_meta = api_state["metadata"][internal_id]
    for idx, raw_score in scores.items():
        meta = api_state["metadata"][idx]
        final = raw_score
        info = f"Base:{raw_score:.2f}"
        # Penalize low rating
        if meta['voteAverage'] < 5.0:
            final *= 0.8
            info += "|LowRating"
        # Penalize large year difference
        diff = abs(source_meta['year'] - meta['year'])
        if diff > 20:
            final -= 0.05
            info += f"|YearDiff:{diff}"
        # Bonus for popularity
        final += np.log1p(meta['popularity']) * 0.01
        final_res.append({"tmdb_id": api_state["id_map"][idx], "score": final, "debug_info": info})
    final_res.sort(key=lambda x: x["score"], reverse=True)
    return {"source_movie": req.tmdb_id, "recommendations": final_res[:req.count]}

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--train', action='store_true')
    parser.add_argument('--server', action='store_true')
    parser.add_argument('--port', type=int, default=8000)
    args = parser.parse_args()
    if args.train:
        train_model()
    elif args.server:
        uvicorn.run(app, host="0.0.0.0", port=args.port)
    else:
        print("Usage: python ai_service.py --train OR --server")
