"""Deterministic irrigation decision logic.

No AI here. Pure rules + agronomy formulas. Unit-testable.
The LLM only explains these decisions — it never makes them.
"""
from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import Any

# Soil moisture threshold (%) below which the crop needs water.
# Source: FAO crop water requirements, simplified for hackathon demo.
CROP_MOISTURE_THRESHOLD = {
    "citrus": 30.0,
    "wheat": 28.0,
    "olive": 22.0,
    "tomato": 35.0,
    "barley": 26.0,
}

# Crop coefficient Kc by growth stage. Multiplied with ET0 to get crop water need.
CROP_KC = {
    ("citrus", "fruit_development"): 0.85,
    ("citrus", "flowering"): 0.75,
    ("wheat", "heading"): 1.15,
    ("wheat", "tillering"): 0.7,
    ("olive", "flowering"): 0.65,
    ("olive", "fruit_set"): 0.7,
}

FROST_THRESHOLD_C = 8.0
RAIN_SKIP_THRESHOLD_PCT = 60  # if 48h rain prob >= this, skip irrigating
NDVI_STRESS_DROP = 0.05  # week-over-week NDVI drop signaling crop stress


@dataclass
class Alert:
    type: str
    severity: str
    message: str


@dataclass
class Decision:
    action: str  # IRRIGATE | WAIT | SKIP
    irrigation_minutes: int
    irrigation_liters: float
    et0_mm: float
    alerts: list[Alert]
    rationale_facts: dict[str, Any]

    def to_dict(self) -> dict[str, Any]:
        d = asdict(self)
        d["alerts"] = [asdict(a) for a in self.alerts]
        return d


def compute_et0(weather: dict[str, Any]) -> float:
    """Simplified Hargreaves ET0 (mm/day).

    ET0 = 0.0023 * (Tmean + 17.8) * sqrt(Tmax - Tmin) * Ra
    Ra approximated from solar_radiation_mj. Good enough for demo;
    swap to Penman-Monteith via `pyeto` when wiring real APIs.
    """
    t_max = weather["temp_max_c"]
    t_min = weather["temp_min_c"]
    t_mean = (t_max + t_min) / 2
    ra = weather.get("solar_radiation_mj", 20.0)
    et0 = 0.0023 * (t_mean + 17.8) * ((t_max - t_min) ** 0.5) * ra * 0.408
    return round(max(et0, 0.1), 2)


def _build_alerts(
    satellite: dict[str, Any],
    weather: dict[str, Any],
) -> list[Alert]:
    alerts: list[Alert] = []

    if weather["temp_min_c"] < FROST_THRESHOLD_C:
        alerts.append(Alert(
            type="frost",
            severity="high" if weather["temp_min_c"] < 4 else "medium",
            message=f"Frost risk: low of {weather['temp_min_c']}°C tonight",
        ))

    history = satellite.get("moisture_history_7d", [])
    if len(history) >= 5 and all(
        history[i] >= history[i + 1] for i in range(len(history) - 1)
    ):
        alerts.append(Alert(
            type="drought_stress",
            severity="medium",
            message="Soil moisture declining 7 days straight",
        ))

    ndvi_drop = satellite.get("ndvi_7d_ago", satellite["ndvi"]) - satellite["ndvi"]
    if ndvi_drop >= NDVI_STRESS_DROP:
        alerts.append(Alert(
            type="crop_stress",
            severity="medium",
            message=f"NDVI dropped {ndvi_drop:.2f} in a week — vegetation under stress",
        ))

    if weather["rain_prob_48h"] >= 80:
        alerts.append(Alert(
            type="heavy_rain",
            severity="low",
            message=f"Heavy rain expected ({weather['rain_prob_48h']}% in 48h)",
        ))

    return alerts


def decide(farm: dict[str, Any]) -> Decision:
    satellite = farm["satellite"]
    weather = farm["weather"]
    crop = farm["crop"]
    stage = farm.get("growth_stage", "")
    area_ha = farm["area_hectares"]

    et0 = compute_et0(weather)
    kc = CROP_KC.get((crop, stage), 0.8)
    crop_water_need_mm = et0 * kc

    threshold = CROP_MOISTURE_THRESHOLD.get(crop, 30.0)
    soil = satellite["soil_moisture_pct"]
    # Wait if heavy rain in EITHER the next 24h or 48h — covers both
    # imminent and incoming storms.
    rain_near = max(weather["rain_prob_24h"], weather["rain_prob_48h"])

    if soil >= threshold:
        action = "SKIP"
    elif rain_near >= RAIN_SKIP_THRESHOLD_PCT:
        action = "WAIT"
    else:
        action = "IRRIGATE"

    minutes = 0
    liters = 0.0
    if action == "IRRIGATE":
        # 1 mm of water over 1 m² = 1 liter. 1 ha = 10,000 m².
        liters = round(crop_water_need_mm * 10_000 * area_ha, 1)
        # Drip irrigation typical flow: ~12 mm/hour applied depth
        minutes = max(10, int((crop_water_need_mm / 12.0) * 60))

    alerts = _build_alerts(satellite, weather)

    facts = {
        "soil_moisture_pct": soil,
        "moisture_threshold": threshold,
        "ndvi": satellite["ndvi"],
        "ndvi_7d_ago": satellite.get("ndvi_7d_ago"),
        "et0_mm": et0,
        "kc": kc,
        "crop_water_need_mm": round(crop_water_need_mm, 2),
        "rain_prob_24h": weather["rain_prob_24h"],
        "rain_prob_48h": weather["rain_prob_48h"],
        "temp_min_c": weather["temp_min_c"],
        "temp_max_c": weather["temp_max_c"],
        "crop": crop,
        "growth_stage": stage,
    }

    return Decision(
        action=action,
        irrigation_minutes=minutes,
        irrigation_liters=liters,
        et0_mm=et0,
        alerts=alerts,
        rationale_facts=facts,
    )
