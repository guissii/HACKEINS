from __future__ import annotations

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Farmer(Base):
    __tablename__ = "farmers"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    phone: Mapped[str] = mapped_column(String(20), unique=True)
    language: Mapped[str] = mapped_column(String(10), default="darija")
    region: Mapped[str] = mapped_column(String(100))

    parcels: Mapped[list["Parcel"]] = relationship(back_populates="farmer")
