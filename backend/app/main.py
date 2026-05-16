"""ZiraIA — FastAPI entrypoint."""
from __future__ import annotations

from contextlib import asynccontextmanager
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import SessionLocal, init_db
from app.services import (
    ai_explainer,
    ai_intent,
    ai_qa,
    data_source,
    override_repo,
    reading_repo,
    seed,
)
from app.services.decision_engine import decide


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    async with SessionLocal() as session:
        await seed.seed_if_empty(session)
    yield


app = FastAPI(title="ZiraIA", version="0.1.0", lifespan=lifespan)

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


class CorrectionRequest(BaseModel):
    text: str


class FeedbackRequest(BaseModel):
    vote: str  # "up" | "down"
    message_excerpt: Optional[str] = None
    note: Optional[str] = None


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


@app.get("/api/farms/{farm_id}/weather-debug")
async def weather_debug(farm_id: int):
    farm = data_source.get_farm(farm_id)
    if not farm:
        raise HTTPException(404, "Farm not found")
    weather = await data_source.fetch_weather(farm)
    return {"status": "ok", "data": weather}


@app.get("/api/farms/{farm_id}/analyze")
async def analyze_farm(
    farm_id: int, session: AsyncSession = Depends(get_session),
):
    """Full pipeline: data → decision engine (with active overrides) → AI explainer → persist."""
    farm = data_source.get_farm(farm_id)
    if not farm:
        raise HTTPException(404, "Farm not found")

    satellite = await data_source.fetch_satellite(farm)
    weather = await data_source.fetch_weather(farm)
    farm_with_live = {**farm, "satellite": satellite, "weather": weather}

    overrides = await override_repo.overrides_as_dict(session, farm_id)
    decision = decide(farm_with_live, overrides=overrides)
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
            "overrides": overrides,
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
async def ask_farm(
    farm_id: int,
    body: AskRequest,
    session: AsyncSession = Depends(get_session),
):
    farm = data_source.get_farm(farm_id)
    if not farm:
        raise HTTPException(404, "Farm not found")
    satellite = await data_source.fetch_satellite(farm)
    weather = await data_source.fetch_weather(farm)
    farm_with_live = {**farm, "satellite": satellite, "weather": weather}
    overrides = await override_repo.overrides_as_dict(session, farm_id)
    decision = decide(farm_with_live, overrides=overrides)
    reply = await ai_qa.answer(farm_with_live, decision, body.question)
    return {"status": "ok", "data": {"question": body.question, "reply": reply}}


@app.get("/api/farms/{farm_id}/overrides")
async def list_overrides(
    farm_id: int, session: AsyncSession = Depends(get_session),
):
    farm = data_source.get_farm(farm_id)
    if not farm:
        raise HTTPException(404, "Farm not found")
    return {"status": "ok", "data": await override_repo.overrides_as_dict(session, farm_id)}


@app.post("/api/farms/{farm_id}/correction")
async def submit_correction(
    farm_id: int,
    body: CorrectionRequest,
    session: AsyncSession = Depends(get_session),
):
    """Farmer message → intent parser → maybe override → re-run decision."""
    farm = data_source.get_farm(farm_id)
    if not farm:
        raise HTTPException(404, "Farm not found")

    # Need farm context for the intent parser
    satellite = await data_source.fetch_satellite(farm)
    weather = await data_source.fetch_weather(farm)
    context = (
        f"crop={farm['crop']} stage={farm.get('growth_stage','')} "
        f"soil_moisture={satellite['soil_moisture_pct']}% "
        f"rain_24h={weather['rain_prob_24h']}% temp_min={weather['temp_min_c']}°C"
    )
    parsed = await ai_intent.parse_intent(body.text, context)

    # If it's a question, route to Q&A and skip override
    if parsed["intent"] == "question" or parsed["intent"] == "unknown":
        farm_with_live = {**farm, "satellite": satellite, "weather": weather}
        overrides = await override_repo.overrides_as_dict(session, farm_id)
        decision = decide(farm_with_live, overrides=overrides)
        reply = await ai_qa.answer(farm_with_live, decision, body.text)
        return {
            "status": "ok",
            "data": {
                "kind": "qa",
                "intent": parsed,
                "reply": reply,
            },
        }

    # Apply override if Gemini extracted a known field with reasonable confidence,
    # regardless of whether it labeled it 'correction' or 'observation' — a
    # farmer reporting "soil is wet" IS a correction in our system.
    applied_field = None
    if (
        parsed["intent"] in {"correction", "observation", "crop_update"}
        and parsed.get("field")
        and parsed.get("confidence", 0) >= 0.6
    ):
        await override_repo.add_override(
            session,
            parcel_id=farm_id,
            field=parsed["field"],
            text_value=parsed.get("value_text") or parsed["field"],
            num_value=parsed.get("value_num"),
            source="whatsapp",
            confidence=parsed["confidence"],
        )
        applied_field = parsed["field"]

    # Re-run analysis with the new override in place
    farm_with_live = {**farm, "satellite": satellite, "weather": weather}
    overrides = await override_repo.overrides_as_dict(session, farm_id)
    decision = decide(farm_with_live, overrides=overrides)
    explanation = await ai_explainer.explain(farm_with_live, decision)

    return {
        "status": "ok",
        "data": {
            "kind": "override_applied" if applied_field else "logged",
            "applied_field": applied_field,
            "intent": parsed,
            "decision": decision.to_dict(),
            "ai": explanation,
            "overrides": overrides,
        },
    }


@app.post("/api/farms/{farm_id}/feedback")
async def submit_feedback(
    farm_id: int,
    body: FeedbackRequest,
    session: AsyncSession = Depends(get_session),
):
    farm = data_source.get_farm(farm_id)
    if not farm:
        raise HTTPException(404, "Farm not found")
    if body.vote not in {"up", "down"}:
        raise HTTPException(400, "vote must be 'up' or 'down'")
    row = await override_repo.add_feedback(
        session,
        parcel_id=farm_id,
        vote=body.vote,
        message_excerpt=body.message_excerpt,
        note=body.note,
    )
    return {"status": "ok", "data": {"id": row.id, "vote": row.vote}}
