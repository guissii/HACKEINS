from __future__ import annotations

from sqlalchemy import Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Parcel(Base):
    __tablename__ = "parcels"

    id: Mapped[int] = mapped_column(primary_key=True)
    farmer_id: Mapped[int] = mapped_column(ForeignKey("farmers.id"))
    name: Mapped[str] = mapped_column(String(100))
    lat: Mapped[float] = mapped_column(Float)
    lon: Mapped[float] = mapped_column(Float)
    area_hectares: Mapped[float] = mapped_column(Float)
    crop: Mapped[str] = mapped_column(String(50))
    growth_stage: Mapped[str] = mapped_column(String(50), default="")
    region: Mapped[str] = mapped_column(String(100))

    farmer: Mapped["Farmer"] = relationship(back_populates="parcels")
    readings: Mapped[list["Reading"]] = relationship(back_populates="parcel")
