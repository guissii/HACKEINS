# ZiraIA

> AI-powered irrigation intelligence for Moroccan farmers.
> Free satellite + weather data → deterministic decision engine → Gemini explains it in Darija → reaches the farmer on WhatsApp or a cooperative dashboard.

Complete project document: [ZIRAIA_PROJECT_DOCUMENT.md](ZIRAIA_PROJECT_DOCUMENT.md)

**Hack AI · Rural World 2026**

---

## The problem

- Morocco's agriculture consumes **87% of the country's water**.
- The country just emerged from a **7-year drought** that devastated rural communities.
- **3.5 million small farmers** irrigate by habit, not data — wasting water and losing yield.
- **Rural poverty is 13.1%**, four times the urban rate.
- **60% of rural women are illiterate**, so traditional digital tools don't reach them.

Existing precision-agriculture tools require IoT sensors, paid satellite licenses, and a smartphone — none of which the average Moroccan small farmer has.

## The solution

ZiraIA answers one question per farm, every day:

> _Should I irrigate today, how much, and when?_

The answer is delivered two ways:

| Channel | Who | Format |
|---|---|---|
| **WhatsApp** | Small farmers (free) | One warm message per day, in Moroccan Darija |
| **Dashboard** | Cooperatives, agribusinesses (paid SaaS) | Map view, KPIs, decision widget, trend chart, audit log |

The farmer can reply at any time — ask a question, correct the AI, or share new ground truth. The system listens, updates, and explains itself in their dialect.

---

## How it works

```
NASA + ESA Satellites
(soil moisture / NDVI / surface temperature)
              +
Open-Meteo API
(rain probability / temperature / wind — 72h forecast)
              +
NASA POWER API
(solar radiation → ET₀ calculation)
              ↓
    ─────────────────────────────
    DECISION ENGINE (pure Python)
    Scientific rules + agricultural formulas
    ET₀ × crop water coefficient
    Soil moisture thresholds per crop
    → IRRIGATE / WAIT / SKIP
    → exact minutes + liters
    → alerts
    ─────────────────────────────
              ↓
    GEMINI 2.5 FLASH (AI layer)
    3 specialized agents:
    [1] Explainer → Darija WhatsApp message
    [2] Q&A → answers farmer questions
    [3] Intent Parser → understands farmer corrections
              ↓
    WhatsApp message → farmer
              ↓
    Farmer replies → Gemini Q&A → WhatsApp response
```

### Architecture principles

1. **Deterministic core, AI at the edge.** Irrigation math is pure Python — no LLM hallucinates how much water to apply. The AI only translates decisions into language the farmer understands.
2. **Self-validating AI.** Every Gemini call that affects a decision echoes the decision back; if the model contradicts the rule engine, we trust the rules and fall back to templates.
3. **Mock fallback at every external boundary.** If Open-Meteo or Gemini fails live on stage, the demo degrades gracefully instead of crashing.
4. **Safety carve-outs.** Farmer corrections can override soil-moisture or rain data, but **frost alerts always fire** from raw weather — the system never gets argued out of warning about a freeze.
5. **TTL on overrides.** Farmer-reported facts win for 24 hours, then satellite/weather data takes over again.

---

## Tech stack

| Layer | Technology | Why |
|---|---|---|
| Backend | **Python 3.11 · FastAPI · SQLAlchemy 2 (async) · SQLite** | Async-first, fast to build, type-safe |
| AI | **Google Gemini 2.5 Flash** (`google-generativeai`) | Free tier, native multimodal, fluent Darija |
| Weather | **Open-Meteo** (free, no API key) | 72-hour forecast for any GPS coordinate |
| Satellite | Mocked for hackathon; **Google Earth Engine** wiring planned (Sentinel-2 NDVI, SMAP soil moisture) | Free for research; the only hard part of the architecture, scoped to v2 |
| ET₀ | Hargreaves formula in pure Python | Penman-Monteith via `pyeto` planned when Open-Meteo gives full radiation data |
| Frontend | **React 18 · Vite · Tailwind CSS · Leaflet · Recharts** | Component-based, mobile-friendly, no UI framework lock-in |
| i18n | Tiny in-house module (no library) | Saves bundle weight; only 2 languages needed |
| Persistence | SQLite via `aiosqlite` | Zero setup, sufficient for hackathon scale |
| Testing | `pytest` + `pytest-asyncio` | 7 tests covering decision engine + override safety |

---

## Features

### Already working

- **Per-farm daily decision** in 3 categories: IRRIGATE (with minutes + liters), WAIT (rain coming), SKIP (soil already moist)
- **Live weather** from Open-Meteo for each parcel's GPS, with a 30-minute in-memory cache
- **Live Gemini Darija** — culturally appropriate addresses (الحاج / أ للا / عمي), specific numbers in every message, warm closings
- **Bilingual dashboard** — English / Arabic with full RTL support, language preference persisted
- **Farmer-friendly metric interpretations** — NDVI 0.42 reads as "Moderate growth" with a one-line explanation in Darija or English
- **Conversational Q&A** — farmer asks anything in Darija / Latin-Darija / French / Arabic, gets an answer that matches their script
- **Human-in-the-loop corrections** — farmer says "the soil is actually wet, I checked" → Gemini parses → 24h override stored → decision flips → new Darija ack message
- **Thumbs up/down feedback** on every AI message
- **Water savings** computed vs. a traditional fixed schedule
- **Alerts** — frost, drought stress, crop stress, heavy rain, farmer-override active
- **7-day soil-moisture trend chart**
- **Multi-farm map** of Morocco with color-coded decision pins

### Designed but deferred (v2)

- **Twilio WhatsApp** delivery (currently simulated in the dashboard with a phone-style chat panel)
- **Real Google Earth Engine satellite data** (NDVI from Sentinel-2, soil moisture from SMAP)
- **Multimodal input** — voice notes for illiterate farmers, photo-based plant diagnosis (Gemini already supports both; icons are visible in the WhatsApp input as a v2 preview)
- **Cooperative aggregate view** — sells the B2B revenue story
- **Water + carbon credits** — every saved liter is satellite-measurable

---

## Getting started

### Requirements

- Python 3.11+ (project uses `from __future__ import annotations`, runs on 3.9+ with `typing.Optional`)
- Node.js 18+
- A free Gemini API key from https://aistudio.google.com

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env and paste your GEMINI_API_KEY

PYTHONPATH=. uvicorn app.main:app --reload --port 8765
```

Backend will be live at `http://127.0.0.1:8765`. Swagger UI at `/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Dashboard at **http://localhost:5173**. Vite proxies `/api/*` to the FastAPI backend automatically.

### Verify everything works

```bash
curl http://127.0.0.1:8765/health
# → {"status":"ok"}

curl http://127.0.0.1:8765/api/farms/1/analyze | jq '.data.ai._source'
# → "gemini"  (if you see "fallback", check your GEMINI_API_KEY)
```

---

## Demo flow

The dashboard ships with 3 demo farms designed to hit every decision branch:

| Farm | Region | Crop | Today's typical decision | Why |
|---|---|---|---|---|
| Ahmed Ait Brahim | Souss-Massa | Citrus | **IRRIGATE** | Dry soil (21.5%), no rain forecast |
| Fatima El Haddad | Doukkala-Abda | Wheat | **SKIP** | Soil already moist (42%) |
| Hassan Ou Moha | Haouz | Olive | **WAIT** | Heavy rain (~98%) incoming in 24h |

Try this sequence:

1. **Open the dashboard** — click each pin on the map. Right panel updates with KPIs, decision widget, alerts, and a Darija WhatsApp message generated live by Gemini.
2. **Switch to Arabic** — click `العربية` in the top-right header. The whole UI flips to RTL.
3. **Read the KPIs** — each card shows the raw number, a categorical label (Excellent / Good / Fair / Poor / Critical), and a one-line agricultural interpretation.
4. **Use the WhatsApp panel** — type a question in Darija, Arabic, French, or English. Gemini answers in the same script.
5. **Try a correction** — type something like `الأرض ديالي رطبة شفتها هاد الصباح` ("soil is actually wet, I checked this morning"). The system:
   - Parses the intent with Gemini (extracts `field: soil_moisture_pct, value: 45, confidence: 0.95`)
   - Stores a 24-hour override
   - Re-runs the decision engine → the action may flip (IRRIGATE → SKIP)
   - Sends a new Darija message acknowledging the update
   - Shows an override banner in the dashboard with hours-left countdown
6. **Verify safety** — even with a farmer override active, frost alerts still fire from raw weather data (test enforced).

---

## Repository structure

```
.
├── README.md                      ← this file
├── CLAUDE.md                      ← project context for AI assistants
├── DESIGN_HANDOFF.md              ← brief for frontend collaborator
├── instructions.md                ← original project blueprint
│
├── .claude/                       ← knowledge packs for AI assistants
│   ├── skills/darija-prompt.md
│   ├── skills/design-system.md
│   └── hooks/pre-commit.md
│
├── backend/
│   ├── app/
│   │   ├── main.py                ← FastAPI app + endpoints
│   │   ├── config.py              ← env settings
│   │   ├── db.py                  ← async SQLAlchemy
│   │   ├── models/
│   │   │   ├── farmer.py
│   │   │   ├── parcel.py
│   │   │   ├── reading.py         ← daily analysis row
│   │   │   └── override.py        ← farmer corrections + feedback
│   │   └── services/
│   │       ├── data_source.py     ← mock/live swap point
│   │       ├── decision_engine.py ← pure-Python rules (tested)
│   │       ├── weather_live.py    ← Open-Meteo adapter
│   │       ├── ai_explainer.py    ← Gemini call #1
│   │       ├── ai_qa.py           ← Gemini call #2
│   │       ├── ai_intent.py       ← Gemini call #3
│   │       ├── reading_repo.py
│   │       ├── override_repo.py
│   │       └── seed.py
│   ├── tests/                     ← 7 pytest tests
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                ← layout, state, language toggle
│   │   ├── api.js
│   │   ├── i18n.jsx               ← EN/AR translations + LangProvider
│   │   ├── utils/interpret.js     ← KPI → farmer-meaningful labels
│   │   └── components/
│   │       ├── FarmMap.jsx
│   │       ├── DecisionWidget.jsx
│   │       ├── KPICards.jsx
│   │       ├── AlertBanner.jsx
│   │       ├── TrendChart.jsx
│   │       └── WhatsAppPanel.jsx
│   ├── index.html
│   ├── package.json
│   └── tailwind.config.js
│
└── data/
    └── sample_farms.json          ← 3 demo farms with realistic data
```

---

## API reference

| Method + Path | What it does |
|---|---|
| `GET  /health` | Liveness check |
| `GET  /api/farms` | List all farms (id, name, region, GPS, crop) |
| `GET  /api/farms/{id}` | Single farm with mocked satellite snapshot |
| `GET  /api/farms/{id}/analyze` | **Main pipeline**: live data → decision engine → Gemini explainer → persisted reading. Includes active overrides. |
| `GET  /api/farms/{id}/history` | Last 30 days of saved readings |
| `GET  /api/farms/{id}/weather-debug` | Raw weather response (mock or live) |
| `GET  /api/farms/{id}/overrides` | List active farmer overrides with hours-left |
| `POST /api/farms/{id}/ask` | Ask a Darija question, get a Darija reply (Gemini Q&A) |
| `POST /api/farms/{id}/correction` | Farmer message → intent parser → maybe apply override → re-run decision |
| `POST /api/farms/{id}/feedback` | Thumbs up/down log on an AI message |

Response envelope: `{ status, data, message? }`.

---

## Tests

```bash
cd backend
PYTHONPATH=. python -m pytest tests/ -v
```

Current coverage (7 tests, all green):

- `test_dry_citrus_no_rain_irrigates` — IRRIGATE path
- `test_moist_wheat_with_rain_skips` — SKIP path
- `test_dry_olive_triggers_frost_alert` — frost alert correctness
- `test_et0_positive` — Hargreaves sanity check
- `test_farmer_wet_soil_override_flips_to_skip` — override changes decision
- `test_farmer_rain_override_flips_to_wait` — rain override forces WAIT
- `test_frost_alert_fires_even_with_override` — **safety carve-out** verified

---

## Business model

**B2B2C** — small farmers are free users; cooperatives and agribusinesses pay.

| Stream | Price | Scale |
|---|---|---|
| SaaS for cooperatives | ~200 DH / farmer / month | One coop contract = hundreds of farmers |
| OCP Group licensing (1.5M farmer network) | Per-farmer fee | Game-changing partnership |
| Aggregated agri-data insights | B2B sales | Seed cos, microfinance, government |
| Water + carbon credits | Long-term | Every saved liter is satellite-measurable |

Unit economics: ~3 DH/farmer/month to serve, ~200 DH revenue → **97%+ gross margin**.

---

## What makes this different

- **No IoT, no sensors, no installation.** Every other agri-tech demo asks farmers to install hardware. We don't.
- **Darija, not English / French / MSA.** The AI talks the way Moroccan farmers actually talk — Arabic script with French loanwords, or Latin-Darija (3lash, kifash, wach).
- **The farmer can correct the AI.** Most agri-tools push notifications; ours is a two-way conversation, and the system updates its decision in real time when the farmer pushes back.
- **Cooperative-grade audit trail.** Every decision, override, and feedback event is persisted. A cooperative manager can show a farmer exactly why the system recommended what it recommended.

---

## License + credits

Built for **Hack AI — AI in the Rural World** (Morocco, 2026).

Source data: Open-Meteo (CC-BY 4.0), NASA POWER (public domain), planned: Sentinel-2 via Google Earth Engine (research license).

Built by **Adam Daoudi** with assistance from Claude (Anthropic).

Open issues, PRs welcome. Code is on the `adam` branch during the hackathon.

---

*Made with care for Moroccan farmers.*
