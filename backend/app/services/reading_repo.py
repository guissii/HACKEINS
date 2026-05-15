"""Persist and query daily Reading rows."""
from __future__ import annotations

from datetime import date as date_cls
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Reading
from app.services.decision_engine import Decision


async def save_reading(
    session: AsyncSession,
    parcel_id: int,
    decision: Decision,
    satellite: dict[str, Any],
    weather: dict[str, Any],
    ai: dict[str, Any],
    reading_date: date_cls | None = None,
) -> Reading:
    """Upsert today's reading for this parcel."""
    rd = reading_date or date_cls.today()
    stmt = select(Reading).where(
        Reading.parcel_id == parcel_id, Reading.reading_date == rd,
    )
    existing = (await session.execute(stmt)).scalar_one_or_none()

    if existing is None:
        existing = Reading(parcel_id=parcel_id, reading_date=rd)
        session.add(existing)

    existing.ndvi = satellite.get("ndvi")
    existing.soil_moisture_pct = satellite.get("soil_moisture_pct")
    existing.surface_temp_c = satellite.get("surface_temp_c")
    existing.et0_mm = decision.et0_mm
    existing.rain_prob_24h = weather.get("rain_prob_24h")
    existing.rain_prob_48h = weather.get("rain_prob_48h")
    existing.temp_min_c = weather.get("temp_min_c")
    existing.temp_max_c = weather.get("temp_max_c")
    existing.action = decision.action
    existing.irrigation_minutes = decision.irrigation_minutes
    existing.irrigation_liters = decision.irrigation_liters
    existing.alerts = [
        {"type": a.type, "severity": a.severity, "message": a.message}
        for a in decision.alerts
    ]
    existing.ai_reasoning = ai.get("reasoning")
    existing.darija_message = ai.get("darija_message")
    existing.ai_source = ai.get("_source")

    await session.commit()
    await session.refresh(existing)
    return existing


async def history(
    session: AsyncSession, parcel_id: int, limit: int = 30,
) -> list[Reading]:
    stmt = (
        select(Reading)
        .where(Reading.parcel_id == parcel_id)
        .order_by(Reading.reading_date.desc())
        .limit(limit)
    )
    rows = (await session.execute(stmt)).scalars().all()
    return list(rows)
