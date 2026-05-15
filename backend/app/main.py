"""Filaha AI — FastAPI entrypoint."""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import SessionLocal, init_db
from app.services import ai_explainer, ai_qa, data_source, reading_repo, seed
from app.services.decision_engine import decide


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    async with SessionLocal() as session:
        await seed.seed_if_empty(session)
    yield


app = FastAPI(title="Filaha AI", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


async def get_session() -> AsyncSession:
    async with SessionLocal() as session:
        yield session


class AskRequest(BaseModel):
    question: str


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/api/farms")
async def list_farms():
    farms = data_source.list_farms()
    return {
        "status": "ok",
        "data": [
            {
                "id": f["id"],
                "farmer_name": f["farmer_name"],
                "region": f["region"],
                "parcel_name": f["parcel_name"],
                "lat": f["lat"],
                "lon": f["lon"],
                "area_hectares": f["area_hectares"],
                "crop": f["crop"],
            }
            for f in farms
        ],
    }


@app.get("/api/farms/{farm_id}")
async def get_farm(farm_id: int):
    farm = data_source.get_farm(farm_id)
    if not farm:
        raise HTTPException(404, "Farm not found")
    return {"status": "ok", "data": farm}


@app.get("/api/farms/{farm_id}/analyze")
async def analyze_farm(
    farm_id: int, session: AsyncSession = Depends(get_session),
):
    """Full pipeline: data → decision engine → AI explainer → persist."""
    farm = data_source.get_farm(farm_id)
    if not farm:
        raise HTTPException(404, "Farm not found")

    satellite = await data_source.fetch_satellite(farm)
    weather = await data_source.fetch_weather(farm)
    farm_with_live = {**farm, "satellite": satellite, "weather": weather}

    decision = decide(farm_with_live)
    explanation = await ai_explainer.explain(farm_with_live, decision)

    await reading_repo.save_reading(
        session, farm_id, decision, satellite, weather, explanation,
    )

    return {
        "status": "ok",
        "data": {
            "farm": {
                "id": farm["id"],
                "farmer_name": farm["farmer_name"],
                "parcel_name": farm["parcel_name"],
                "region": farm["region"],
                "crop": farm["crop"],
            },
            "decision": decision.to_dict(),
            "ai": explanation,
        },
    }


@app.get("/api/farms/{farm_id}/history")
async def farm_history(
    farm_id: int,
    limit: int = 30,
    session: AsyncSession = Depends(get_session),
):
    rows = await reading_repo.history(session, farm_id, limit)
    return {
        "status": "ok",
        "data": [
            {
                "date": r.reading_date.isoformat(),
                "ndvi": r.ndvi,
                "soil_moisture_pct": r.soil_moisture_pct,
                "surface_temp_c": r.surface_temp_c,
                "et0_mm": r.et0_mm,
                "rain_prob_24h": r.rain_prob_24h,
                "action": r.action,
                "irrigation_minutes": r.irrigation_minutes,
                "irrigation_liters": r.irrigation_liters,
            }
            for r in rows
        ],
    }


@app.post("/api/farms/{farm_id}/ask")
async def ask_farm(farm_id: int, body: AskRequest):
    farm = data_source.get_farm(farm_id)
    if not farm:
        raise HTTPException(404, "Farm not found")
    satellite = await data_source.fetch_satellite(farm)
    weather = await data_source.fetch_weather(farm)
    farm_with_live = {**farm, "satellite": satellite, "weather": weather}
    decision = decide(farm_with_live)
    reply = await ai_qa.answer(farm_with_live, decision, body.question)
    return {"status": "ok", "data": {"question": body.question, "reply": reply}}
