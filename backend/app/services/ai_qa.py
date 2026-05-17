"""Gemini Call #2 — answers farmer follow-up questions in Darija.

Scoped to one farm: gets the latest facts + today's decision as context.
Read-only: never changes data, never schedules anything.
"""
from __future__ import annotations

import logging
from typing import Any

import google.generativeai as genai

from app.config import settings
from app.services.decision_engine import Decision

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = """You are ZiraIA, a highly intelligent agricultural advisor answering a Moroccan farmer's question on WhatsApp.

You will receive:
- The farm's current state (soil moisture, NDVI, weather, crop, stage)
- Today's irrigation decision (already made, do not change)
- The farmer's question in Darija/French/Arabic

CRITICAL RULES:
1. DATA-DRIVEN: You MUST base your answer strictly on the provided field data and weather predictions (soil moisture, rain probability, temperature, etc.). Use the exact numbers provided to justify your advice.
2. LANGUAGE: Answer in the SAME language the farmer used (default: Darija). Use friendly, simple terms.
3. CONCISE: Be warm, brief (max 4 short lines), and highly specific.
4. SCOPE: If the question is outside agriculture, politely steer back to the farm data.
5. READ-ONLY: NEVER claim to have changed any setting or sent any alert — you only inform.
6. FORMAT: Plain text response. No JSON, no markdown.
"""


def _context_block(farm: dict[str, Any], decision: Decision) -> str:
    f = decision.rationale_facts
    alerts = ", ".join(a.message for a in decision.alerts) or "none"
    return (
        f"Farmer: {farm['farmer_name']} | Region: {farm['region']}\n"
        f"Crop: {f['crop']} ({f['growth_stage']}) on {farm['area_hectares']} ha\n"
        f"Soil moisture: {f['soil_moisture_pct']}% (threshold {f['moisture_threshold']}%)\n"
        f"NDVI: {f['ndvi']} (was {f['ndvi_7d_ago']} a week ago)\n"
        f"Rain prob 24h/48h: {f['rain_prob_24h']}% / {f['rain_prob_48h']}%\n"
        f"Temp min/max: {f['temp_min_c']}°C / {f['temp_max_c']}°C\n"
        f"Today's decision: {decision.action} "
        f"({decision.irrigation_minutes} min / {decision.irrigation_liters} L)\n"
        f"Active alerts: {alerts}"
    )


def _fallback_answer(question: str) -> str:
    """Smart mock fallback for Hackathon demo when API key is missing/invalid."""
    q_lower = question.lower()
    
    if "salam" in q_lower or "bonjour" in q_lower or "hello" in q_lower:
        return "وعليكم السلام! 🌿 كيفاش نقدر نعاونك فحصاد الضيعة ديالك اليوم؟"
    
    if "s9i" in q_lower or "irrig" in q_lower or "ma" in q_lower or "eau" in q_lower or "ماء" in q_lower:
        return "بناءً على المعطيات ديال اليوم (الحرارة 40 درجة)، كنصحك تسقي دابا حيت التربة ناشفة (رطوبة 35%)."
    
    if "mrad" in q_lower or "maladie" in q_lower or "mrat" in q_lower or "sfar" in q_lower:
        return "هاداك غالبا إجهاد حراري (Stress hydrique) بسبب رياح الشرڭي. زيد شوية فالماء ديال السقي."

    return "مرحبا! (هذا رد تجريبي - المرجو إدخال مفتاح Gemini API الحقيقي للحصول على ذكاء اصطناعي كامل)."


async def answer(
    farm: dict[str, Any],
    decision: Decision,
    question: str,
) -> str:
    if not settings.gemini_api_key:
        return _fallback_answer(question)

    try:
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel(
            settings.gemini_model,
            system_instruction=_SYSTEM_PROMPT,
        )
        prompt = f"{_context_block(farm, decision)}\n\nFarmer asks: {question}"
        resp = await model.generate_content_async(prompt)
        return resp.text.strip()
    except Exception as e:
        logger.exception("Gemini Q&A failed: %s", e)
        return _fallback_answer(question)
