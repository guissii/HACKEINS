"""Gemini Call #1 — turns deterministic decision into a warm Darija message.

The decision is already made by `decision_engine.decide()`. Gemini does NOT
re-decide; it explains and translates. If the LLM tries to flip the action,
we trust the rule engine and fall back to a templated message.
"""
from __future__ import annotations

import json
import logging
from typing import Any

import google.generativeai as genai

from app.config import settings
from app.services.decision_engine import Decision

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = """You are ZiraIA, a warm agronomist assistant for Moroccan farmers.

You are given a FINAL irrigation decision that was made by a deterministic rule engine. Your job is NOT to re-decide. Your job is:
1. Write a 2-3 sentence reasoning that references the specific numbers.
2. Write a WhatsApp message in natural Moroccan Darija (Arabic script with light French loanwords where natural — e.g. "litre", "minute").
3. Echo back the decision so we can verify you didn't drift.

Constraints:
- Darija, NOT Modern Standard Arabic. Use farmer-friendly words.
- Lead with the action (irrigate / wait / skip). Include exact minutes and liters if irrigating.
- Mention each alert briefly with an emoji (🥶 frost, 🌧️ rain, 🌱 stress).
- Max 6 short lines. Warm, addressed by name.
- Respond ONLY with valid JSON. No markdown, no preamble."""

_USER_TEMPLATE = """Farmer: {name} ({region})
Farm: {parcel} — {area} ha — crop: {crop} ({stage})
Language: {language}

DECISION (final, do not change): {action}
Irrigation: {minutes} minutes / {liters} liters
ET0 today: {et0} mm

Facts:
- Soil moisture: {soil}% (threshold for {crop}: {threshold}%)
- NDVI: {ndvi} (last week: {ndvi_old})
- Rain probability: 24h={r24}%, 48h={r48}%
- Temp: min {tmin}°C / max {tmax}°C

Alerts: {alerts}

Return JSON with keys:
{{
  "decision_echo": "IRRIGATE" | "WAIT" | "SKIP",
  "reasoning": "...",
  "darija_message": "..."
}}"""


def _build_user_prompt(farm: dict[str, Any], decision: Decision) -> str:
    f = decision.rationale_facts
    alerts = ", ".join(f"{a.type}({a.severity})" for a in decision.alerts) or "none"
    return _USER_TEMPLATE.format(
        name=farm["farmer_name"],
        region=farm["region"],
        parcel=farm["parcel_name"],
        area=farm["area_hectares"],
        crop=f["crop"],
        stage=f["growth_stage"],
        language=farm.get("language", "darija"),
        action=decision.action,
        minutes=decision.irrigation_minutes,
        liters=decision.irrigation_liters,
        et0=f["et0_mm"],
        soil=f["soil_moisture_pct"],
        threshold=f["moisture_threshold"],
        ndvi=f["ndvi"],
        ndvi_old=f["ndvi_7d_ago"],
        r24=f["rain_prob_24h"],
        r48=f["rain_prob_48h"],
        tmin=f["temp_min_c"],
        tmax=f["temp_max_c"],
        alerts=alerts,
    )


def _fallback_message(farm: dict[str, Any], decision: Decision) -> dict[str, str]:
    """Templated Darija fallback if Gemini fails or no API key."""
    name = farm["farmer_name"].split()[0]
    if decision.action == "IRRIGATE":
        msg = (
            f"السلام {name}! 🌱\n"
            f"اليوم خاصك تسقي الأرض ديالك.\n"
            f"⏱️ {decision.irrigation_minutes} دقيقة / 💧 {decision.irrigation_liters} لتر."
        )
    elif decision.action == "WAIT":
        msg = (
            f"السلام {name}! 🌧️\n"
            f"ما تسقيش اليوم، الشتا غادي تجي.\n"
            f"عاود شوف غدا."
        )
    else:
        msg = (
            f"السلام {name}! ✅\n"
            f"الأرض ديالك مزيانة، ما خاصكش تسقي اليوم."
        )
    for a in decision.alerts:
        if a.type == "frost":
            msg += "\n🥶 احذر من البرد الليلة!"
    return {
        "decision_echo": decision.action,
        "reasoning": f"Soil moisture {decision.rationale_facts['soil_moisture_pct']}% vs threshold {decision.rationale_facts['moisture_threshold']}%, rain 48h {decision.rationale_facts['rain_prob_48h']}%.",
        "darija_message": msg,
        "_source": "fallback",
    }


async def explain(farm: dict[str, Any], decision: Decision) -> dict[str, Any]:
    """Return {decision_echo, reasoning, darija_message, _source}."""
    if not settings.gemini_api_key:
        logger.warning("No Gemini API key — using fallback template")
        return _fallback_message(farm, decision)

    try:
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel(
            settings.gemini_model,
            system_instruction=_SYSTEM_PROMPT,
            generation_config={"response_mime_type": "application/json"},
        )
        prompt = _build_user_prompt(farm, decision)
        resp = await model.generate_content_async(prompt)
        data = json.loads(resp.text)

        # Self-validation: if Gemini flipped the decision, trust the rule engine
        if data.get("decision_echo") != decision.action:
            logger.warning(
                "Gemini decision drift: said %s, rules said %s — falling back",
                data.get("decision_echo"), decision.action,
            )
            return _fallback_message(farm, decision)

        data["_source"] = "gemini"
        return data
    except Exception as e:
        logger.exception("Gemini explainer failed: %s", e)
        return _fallback_message(farm, decision)
