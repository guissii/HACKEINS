"""Open-Meteo live weather adapter.

Free, keyless. Returns the same shape as our mock so the decision engine
doesn't care whether weather is live or mocked.
"""
from __future__ import annotations

import logging
import time
from typing import Any

import httpx

logger = logging.getLogger(__name__)

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"
CACHE_TTL_SECONDS = 30 * 60  # 30 min — Open-Meteo updates hourly anyway

# {(lat, lon) → (fetched_at, weather_dict)}
_cache: dict[tuple[float, float], tuple[float, dict[str, Any]]] = {}


def _cache_key(lat: float, lon: float) -> tuple[float, float]:
    # Round to 3 decimals (~100m) — coords within the same parcel share a cache slot
    return (round(lat, 3), round(lon, 3))


def _parse(data: dict[str, Any]) -> dict[str, Any]:
    """Translate Open-Meteo daily JSON to our internal weather schema."""
    daily = data["daily"]
    # Today, tomorrow, day-after — Open-Meteo gives daily values, we approximate
    # 24h/48h/72h rain probability as max-prob for day index 0/1/2.
    rain = daily["precipitation_probability_max"]
    return {
        "rain_prob_24h": float(rain[0] or 0),
        "rain_prob_48h": float(rain[1] if len(rain) > 1 else rain[0] or 0),
        "rain_prob_72h": float(rain[2] if len(rain) > 2 else rain[0] or 0),
        "temp_min_c": float(daily["temperature_2m_min"][0]),
        "temp_max_c": float(daily["temperature_2m_max"][0]),
        "wind_kmh": float(daily["wind_speed_10m_max"][0]),
        "humidity_pct": float(daily["relative_humidity_2m_mean"][0]),
        "solar_radiation_mj": float(daily["shortwave_radiation_sum"][0]),
        "_source": "open-meteo",
        "_fetched_at": time.time(),
    }


async def fetch_weather(lat: float, lon: float) -> dict[str, Any]:
    """Return parsed weather for (lat, lon). Raises on network/HTTP error."""
    key = _cache_key(lat, lon)
    cached = _cache.get(key)
    if cached and (time.time() - cached[0]) < CACHE_TTL_SECONDS:
        return cached[1]

    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": ",".join([
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_probability_max",
            "wind_speed_10m_max",
            "relative_humidity_2m_mean",
            "shortwave_radiation_sum",
        ]),
        "forecast_days": 3,
        "timezone": "Africa/Casablanca",
    }
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(OPEN_METEO_URL, params=params)
        resp.raise_for_status()
        parsed = _parse(resp.json())

    _cache[key] = (time.time(), parsed)
    logger.info("Open-Meteo fetched for (%s, %s)", lat, lon)
    return parsed
