"""Seed the database from data/sample_farms.json on first boot."""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Farmer, Parcel
from app.services import data_source


async def seed_if_empty(session: AsyncSession) -> None:
    existing = (await session.execute(select(Farmer))).first()
    if existing:
        return

    for f in data_source.list_farms():
        farmer = Farmer(
            id=f["id"],
            name=f["farmer_name"],
            phone=f["phone"],
            language=f.get("language", "darija"),
            region=f["region"],
        )
        parcel = Parcel(
            id=f["id"],
            farmer_id=f["id"],
            name=f["parcel_name"],
            lat=f["lat"],
            lon=f["lon"],
            area_hectares=f["area_hectares"],
            crop=f["crop"],
            growth_stage=f.get("growth_stage", ""),
            region=f["region"],
        )
        session.add_all([farmer, parcel])
    await session.commit()
