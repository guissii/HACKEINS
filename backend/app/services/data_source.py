"""Loads farm data from mock JSON or (later) real satellite/weather APIs.

Behind a single interface so swapping mock → real is a config flip.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from app.config import settings

DATA_FILE = Path(__file__).resolve().parents[3] / "data" / "sample_farms.json"


def _load_mock() -> list[dict[str, Any]]:
    with open(DATA_FILE) as f:
        return json.load(f)


def list_farms() -> list[dict[str, Any]]:
    return _load_mock()


def get_farm(farm_id: int) -> dict[str, Any] | None:
    return next((f for f in _load_mock() if f["id"] == farm_id), None)


async def fetch_satellite(farm: dict[str, Any]) -> dict[str, Any]:
    if settings.use_mock_satellite:
        return farm["satellite"]
    raise NotImplementedError("Real GEE satellite fetch not wired yet")


async def fetch_weather(farm: dict[str, Any]) -> dict[str, Any]:
    if settings.use_mock_weather:
        return farm["weather"]
    raise NotImplementedError("Real Open-Meteo fetch not wired yet")
