from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class Override(Base):
    """Farmer-reported correction that temporarily wins over satellite/weather.

    Example: farmer says "the soil is actually wet" → store with field
    'soil_moisture_pct', farmer_value 45.0, expires in 24h. The decision
    engine reads active overrides and uses them instead of the sensor data.
    """
    __tablename__ = "overrides"

    id: Mapped[int] = mapped_column(primary_key=True)
    parcel_id: Mapped[int] = mapped_column(ForeignKey("parcels.id"), index=True)
    field: Mapped[str] = mapped_column(String(50))  # soil_moisture_pct, crop, growth_stage, rain_today
    farmer_value_text: Mapped[str] = mapped_column(String(200))  # human-readable
    farmer_value_num: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    source: Mapped[str] = mapped_column(String(20), default="whatsapp")  # whatsapp, dashboard, thumb
    confidence: Mapped[float] = mapped_column(Float, default=1.0)
    expires_at: Mapped[datetime] = mapped_column(DateTime, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class Feedback(Base):
    """Thumbs up/down on AI messages — closes the outcome loop."""
    __tablename__ = "feedback"

    id: Mapped[int] = mapped_column(primary_key=True)
    parcel_id: Mapped[int] = mapped_column(ForeignKey("parcels.id"), index=True)
    vote: Mapped[str] = mapped_column(String(10))  # up | down
    message_excerpt: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    note: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
