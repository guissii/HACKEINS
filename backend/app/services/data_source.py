"""Loads farm data from mock JSON or (later) real satellite/weather APIs.

Behind a single interface so swapping mock → real is a config flip.
"""
from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

from app.config import settings
from app.services import weather_live

logger = logging.getLogger(__name__)

_HERE = Path(__file__).resolve()
_DATA_FILE_CANDIDATES = [
    _HERE.parents[3] / "data" / "sample_farms.json",
    _HERE.parents[2] / "data" / "sample_farms.json",
]


def _resolve_data_file() -> Path | None:
    for p in _DATA_FILE_CANDIDATES:
        if p.exists():
            return p
    return None


def _load_mock() -> list[dict[str, Any]]:
    path = _resolve_data_file()
    if not path:
        logger.error("sample_farms.json not found in expected locations")
        return []
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error("Failed to load sample farms from %s: %s", path, e)
        return []


def list_farms() -> list[dict[str, Any]]:
    return _load_mock()


def get_farm(farm_id: int) -> dict[str, Any] | None:
    return next((f for f in _load_mock() if f["id"] == farm_id), None)


async def fetch_satellite(farm: dict[str, Any]) -> dict[str, Any]:
    if settings.use_mock_satellite:
        return farm["satellite"]
    raise NotImplementedError("Real GEE satellite fetch not wired yet")


async def fetch_weather(farm: dict[str, Any]) -> dict[str, Any]:
    """Live Open-Meteo for the farm's GPS — falls back to mock on failure."""
    if settings.use_mock_weather:
        return farm["weather"]
    try:
        return await weather_live.fetch_weather(farm["lat"], farm["lon"])
    except Exception as e:
        logger.warning("Open-Meteo failed for farm %s: %s — using mock", farm["id"], e)
        return farm["weather"]
