"""Gemini Call #3 — parse a free-text farmer message into structured intent.

Routes farmer messages to the right backend behavior:
- 'question' → existing Q&A
- 'correction' → update an override (e.g. "soil isn't dry")
- 'observation' → append to observations log (e.g. "my olives are flowering")
- 'crop_update' → change the crop or growth stage
- 'unknown' → fall back to Q&A
"""
from __future__ import annotations

import json
import logging
from typing import Any

import google.generativeai as genai

from app.config import settings

logger = logging.getLogger(__name__)

# Fields the engine knows how to override. Anything else is just an observation.
KNOWN_FIELDS = {
    "soil_moisture_pct",   # numeric, %
    "rain_today",          # boolean → maps to high rain_prob_24h
    "crop",                # string
    "growth_stage",        # string
    "frost_tonight",       # boolean → triggers frost alert
}

_SYSTEM_PROMPT = """You parse short messages from Moroccan farmers about their farm.

Output STRICT JSON with this shape:
{
  "intent": "question" | "correction" | "observation" | "crop_update" | "unknown",
  "field": "soil_moisture_pct" | "rain_today" | "crop" | "growth_stage" | "frost_tonight" | null,
  "value_text": string | null,
  "value_num": number | null,
  "confidence": 0.0 to 1.0,
  "rationale": short string in English
}

Rules:
- Messages can be in Darija (Arabic OR Latin script), French, Arabic, or English.
- "question" = farmer is asking something ("3lash ma...", "wach...", "pourquoi...").
- "correction" = farmer DISPUTES a current AI claim ("soil isn't dry", "it rained yesterday").
- "observation" = farmer reports a new fact ("my olives are flowering", "I see yellow leaves").
- "crop_update" = farmer changed what they're growing.
- "unknown" = ambiguous or unrelated to the farm.

Field mappings:
- soil moisture/dryness/wetness comments → field "soil_moisture_pct"
  - if farmer says wet/moist/fine → value_num ~45, value_text "wet"
  - if farmer says dry/cracked → value_num ~15, value_text "dry"
- rain reports ("it rained", "shta tahit", "il a plu") → field "rain_today", value_text "yes"
- frost concern ("it'll freeze", "kayn lberd") → field "frost_tonight", value_text "yes"
- crop change ("I planted tomatoes", "switched to argan") → field "crop", value_text the new crop
- growth stage updates ("flowering", "fruiting") → field "growth_stage"

If confidence < 0.6, set intent = "unknown" so we fall back to Q&A.
Respond with JSON only, no preamble, no markdown."""


def _heuristic_fallback(text: str) -> dict[str, Any]:
    """Tiny rule-based parser used when no Gemini key is configured."""
    t = text.lower()
    if any(w in t for w in ["?", "wach", "wash", "3lash", "kifash", "pourquoi", "why", "how", "اشحال", "علاش"]):
        return {"intent": "question", "field": None, "value_text": None,
                "value_num": None, "confidence": 0.7, "rationale": "heuristic question"}
    if any(w in t for w in ["wet", "moist", "fine", "mzyana", "soil isn't dry", "ratba"]):
        return {"intent": "correction", "field": "soil_moisture_pct",
                "value_text": "wet", "value_num": 45.0, "confidence": 0.7,
                "rationale": "heuristic wet-soil correction"}
    if any(w in t for w in ["dry", "cracked", "nachfa", "ardha nachfa"]):
        return {"intent": "correction", "field": "soil_moisture_pct",
                "value_text": "dry", "value_num": 15.0, "confidence": 0.7,
                "rationale": "heuristic dry-soil correction"}
    if any(w in t for w in ["rained", "shta", "il a plu", "kayna shta"]):
        return {"intent": "correction", "field": "rain_today",
                "value_text": "yes", "value_num": None, "confidence": 0.7,
                "rationale": "heuristic rain report"}
    return {"intent": "unknown", "field": None, "value_text": None,
            "value_num": None, "confidence": 0.3, "rationale": "heuristic fallback"}


async def parse_intent(text: str, farm_context: str) -> dict[str, Any]:
    """Return a parsed-intent dict. Always safe — never raises."""
    text = (text or "").strip()
    if not text:
        return {"intent": "unknown", "field": None, "value_text": None,
                "value_num": None, "confidence": 0.0, "rationale": "empty input",
                "_source": "empty"}

    if not settings.gemini_api_key:
        out = _heuristic_fallback(text)
        out["_source"] = "heuristic"
        return out

    try:
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel(
            settings.gemini_model,
            system_instruction=_SYSTEM_PROMPT,
            generation_config={"response_mime_type": "application/json"},
        )
        prompt = f"Farm context: {farm_context}\n\nFarmer message: {text}"
        resp = await model.generate_content_async(prompt)
        data = json.loads(resp.text)
        # Whitelist the field
        if data.get("field") and data["field"] not in KNOWN_FIELDS:
            data["intent"] = "observation"
            data["field"] = None
        data["_source"] = "gemini"
        return data
    except Exception as e:
        logger.warning("Intent parser failed (%s) — using heuristic", e)
        out = _heuristic_fallback(text)
        out["_source"] = "heuristic-after-error"
        return out
