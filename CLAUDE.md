# ZiraIA — Project Context

## What this is
AI-powered irrigation intelligence for Moroccan farmers. Free satellite + weather data → decision engine → Gemini explains in Darija → WhatsApp/Dashboard.

## Architecture rule
- **Deterministic core**: data fetch, ET0, decision (IRRIGATE/WAIT/SKIP), minutes/liters → pure Python
- **AI lives only at the human interface**: Gemini turns facts into Darija messages and answers farmer questions
- Two Gemini calls total: Explainer (daily) + Q&A (on reply)

## Stack
- Backend: Python 3.11 + FastAPI + SQLAlchemy + SQLite
- AI: Gemini (google-generativeai), model `gemini-2.0-flash`
- Frontend: React + Vite + Tailwind + Leaflet + Recharts
- No PostGIS, no Twilio (yet), no GEE (mocked for now)

## Conventions
- Type hints everywhere, async services
- All secrets in `.env` — never hardcoded
- Mock data lives in `data/sample_farms.json` — swap to real APIs via flag in `config.py`
- Decision engine MUST be testable without any network call

## Demo data
3 farms: Souss-Massa (citrus), Doukkala (wheat), Haouz (olives).
