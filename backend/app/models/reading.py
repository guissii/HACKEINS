from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from sqlalchemy import JSON, Date, DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Reading(Base):
    __tablename__ = "readings"

    id: Mapped[int] = mapped_column(primary_key=True)
    parcel_id: Mapped[int] = mapped_column(ForeignKey("parcels.id"))
    reading_date: Mapped[date] = mapped_column(Date, index=True)

    ndvi: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    soil_moisture_pct: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    surface_temp_c: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    et0_mm: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    rain_prob_24h: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    rain_prob_48h: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    temp_min_c: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    temp_max_c: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    action: Mapped[str] = mapped_column(String(20))
    irrigation_minutes: Mapped[int] = mapped_column(Integer, default=0)
    irrigation_liters: Mapped[float] = mapped_column(Float, default=0.0)
    alerts: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)

    ai_reasoning: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    darija_message: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    ai_source: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(),
    )

    parcel: Mapped["Parcel"] = relationship(back_populates="readings")
