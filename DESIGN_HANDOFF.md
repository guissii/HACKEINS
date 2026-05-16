# ZiraIA — Frontend & Design Handoff

> **You are joining a hackathon project mid-flight.** Backend + AI integration are done. Your job is to make the dashboard and WhatsApp experience look and feel polished. Read this whole document before you touch anything.

---

## 1. The 60-second project pitch

**ZiraIA** is an AI-powered irrigation intelligence platform for Moroccan farmers. It uses free satellite + weather data to answer one daily question per farm:

> _"Should I irrigate today, how much, and when?"_

The answer goes to:
1. **Small farmers** via **WhatsApp** in natural **Moroccan Darija** (the hero use case)
2. **Cooperatives / large farms** via a **web dashboard** (this is what you're polishing)

Hackathon theme: **"AI in the Rural World"** — judging emphasizes real impact for rural Moroccans, especially women farmers (60% illiterate). The WhatsApp Darija output is our differentiator. **Do not lose sight of that.**

---

## 2. Repo + branch

- **GitHub**: https://github.com/adam04-D/Hack-AI-
- **Branch you'll work on**: `adam`
- **Don't push to `main`.** Open PRs into `adam`.

```bash
git clone https://github.com/adam04-D/Hack-AI-.git
cd Hack-AI-
git checkout adam
```

---

## 3. Get it running locally (10 minutes)

### Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# You need a Gemini API key. Get one free at https://aistudio.google.com
cp .env.example .env
# Edit .env, paste your GEMINI_API_KEY

# Run the API
PYTHONPATH=. uvicorn app.main:app --reload --port 8765
```
Backend lives at http://127.0.0.1:8765 (Swagger UI at `/docs`).

### Frontend
```bash
# Separate terminal
cd frontend
npm install
npm run dev
```
Dashboard at **http://localhost:5173**. Vite proxies `/api/*` to the backend automatically.

### Sanity check
Open http://localhost:5173 — you should see a map of Morocco with 3 colored pins. Click each one — the right panel updates with KPIs, decision, and a Darija WhatsApp message.

---

## 4. Current architecture (so you know what NOT to touch)

```
┌────────────────────────────────────────────────────┐
│  YOUR ZONE: Frontend (React + Vite + Tailwind)    │
│  All visual design, animations, layout, UX        │
└─────────────────────┬──────────────────────────────┘
                      │ HTTP /api/*
                      ▼
┌────────────────────────────────────────────────────┐
│  DO NOT TOUCH: Backend (FastAPI + Python)         │
│  - decision_engine.py  → pure-Python irrigation   │
│    rules (tested, working). DO NOT change logic.  │
│  - ai_explainer.py     → Gemini prompt that       │
│    produces beautiful Darija. DO NOT touch.       │
│  - ai_qa.py            → conversational Q&A       │
│  - weather_live.py     → Open-Meteo integration   │
│  - data_source.py      → 3 demo farms in JSON     │
└────────────────────────────────────────────────────┘
```

If you need a new API endpoint or new data shape, **ask Adam first**. Don't modify backend files unless you've been given the green light.

---

## 5. API contract — what the frontend calls

| Endpoint | Purpose | Notes |
|---|---|---|
| `GET /api/farms` | List all farms (id, name, region, lat/lon, crop) | Populates the map markers |
| `GET /api/farms/{id}` | Single farm details | Includes mocked satellite + weather snapshot |
| `GET /api/farms/{id}/analyze` | **Main pipeline** → decision + AI Darija message | The right panel pulls this |
| `GET /api/farms/{id}/history` | Last 30 days of saved readings | Trend chart data |
| `POST /api/farms/{id}/ask` | Send a farmer question, get a Darija reply | WhatsApp chat input → this |

The `analyze` response shape:
```js
{
  status: "ok",
  data: {
    farm: { id, farmer_name, parcel_name, region, crop },
    decision: {
      action: "IRRIGATE" | "WAIT" | "SKIP",
      irrigation_minutes: 17,
      irrigation_liters: 42228.0,
      et0_mm: 4.14,
      alerts: [{ type, severity, message }, ...],
      rationale_facts: { soil_moisture_pct, ndvi, ... }
    },
    ai: {
      decision_echo: "IRRIGATE",
      reasoning: "Soil moisture 21.5% vs threshold 30%...",
      darija_message: "السلام عليكم الحاج أحمد...",
      _source: "gemini" | "fallback"
    }
  }
}
```

---

## 6. Current frontend file structure

```
frontend/src/
├── App.jsx                       ← main layout + state
├── main.jsx                      ← React entry
├── api.js                        ← API wrapper (api.listFarms, api.analyze, api.ask, ...)
├── index.css                     ← Tailwind base + custom CSS
└── components/
    ├── FarmMap.jsx               ← Leaflet map with colored markers
    ├── DecisionWidget.jsx        ← Big "IRRIGATE / WAIT / SKIP" card
    ├── KPICards.jsx              ← 2x2 grid: soil, NDVI, rain, temp
    ├── AlertBanner.jsx           ← Frost / drought / stress alerts
    ├── TrendChart.jsx            ← 7-day soil moisture line (Recharts)
    └── WhatsAppPanel.jsx         ← Phone-style chat with live Q&A
```

Tailwind theme has custom ZiraIA colors in `tailwind.config.js`:
- `ziraia-green` (#2d8a4f) — primary brand
- `ziraia-earth` (#a87d4a) — secondary
- `ziraia-dry` (#dc2626) — IRRIGATE state
- `ziraia-wet` (#0284c7) — water / moisture
- `ziraia-wait` (#f59e0b) — WAIT state

---

## 7. Design direction — the feel we want

**Brand archetype:** _Trusted village agronomist with a tablet._

- **Warm, earthy, optimistic** — not corporate SaaS dashboard, not Apple-minimalism either
- Inspired by Moroccan visual culture: zellige patterns are too busy for UI, but the color palette (terracotta, olive green, sky blue, sand) is on-brand
- **Mobile-first thinking** even though the dashboard is desktop — cooperative managers will check it on phones in the field
- **Bilingual without being awkward** — Latin script UI, but the Darija WhatsApp message displays in proper RTL Arabic with `font-arabic` (already wired)
- **Calm by default, alarming when needed** — most days the dashboard should feel reassuring (water saved, crops healthy). When there's a frost or drought alert, it should feel urgent without being scary

**Don't:**
- ❌ Use cartoon farmers, generic stock illustrations of "Africa"
- ❌ Throw emojis everywhere — they belong in the WhatsApp panel, not headers
- ❌ Add a hero landing page — this is a tool, not a marketing site
- ❌ Use dark mode for the demo — the projector will wash it out

---

## 8. The WhatsApp panel — this is the demo money shot

`components/WhatsAppPanel.jsx` is **the most important visual element in the whole project**. During the live pitch, the demo flow is:
1. Click a farm on the map
2. Point at the WhatsApp panel
3. Say "this is the message that just went to Ahmed's phone, in his dialect"
4. Type a question in the input → live Gemini answers in Darija → judges' jaws drop

What it currently does:
- WhatsApp-green header with "ZiraIA" branding
- Cream chat background (#ECE5DD — actual WhatsApp color)
- Daily Darija message rendered in RTL with the `arabic` CSS class
- User questions → green bubbles on the right
- AI replies → white bubbles on the left
- Input box wired to `POST /api/farms/{id}/ask`

What would make it 10× better (your task):
1. **Make it look like an actual phone** — add a phone frame around it (rounded bezel, speaker notch, time/battery indicator at the top). This sells the "this goes to a real farmer's phone" story instantly.
2. **Typing indicator animation** — the three dots while waiting for Gemini, like real WhatsApp
3. **Message delivery checkmarks** (✓✓ blue ticks for "read") — small touch but adds realism
4. **Voice note button** in the input (cosmetic only — we don't have TTS yet, but it sells the "for illiterate farmers" angle)
5. **Smooth scroll-to-bottom** when new messages arrive
6. **Subtle send animation** — bubble slides in from the right when user sends
7. **The "demo mode" badge** in the header — when the AI falls back to templates (no Gemini key), keep it discreet but visible

The Darija text rendering already works (right-to-left, Noto Sans Arabic font). Don't break it.

---

## 9. The dashboard — concrete improvement targets

Listed in priority order. Pick ones you have time for; don't aim to do all.

### High priority (visible improvements judges will notice)
1. **Polish the map markers** — current `CircleMarker` is functional but ugly. Make them animated, pulse when selected, maybe drop a custom SVG icon shaped like a leaf or droplet
2. **Decision widget animation** — when the user clicks a new farm, the big colored panel should ease in (fade + slight scale), not snap-change
3. **KPI cards** — currently flat. Add small inline sparklines (last 7 days) inside each card. Recharts is already installed.
4. **Loading states** — when switching farms there's a brief blank. Add skeletons or a smooth transition.
5. **Empty state for trend chart** — currently shows a single dot if there's only one reading. Either generate fake history for the demo (use the `moisture_history_7d` field already in the farm data) or design a proper empty state.

### Medium priority
6. **Sidebar / nav** — if we add a "Cooperative" view later, we'll need nav. For now a simple top header is fine. Don't build a full sidebar unless asked.
7. **Water savings hero card** — the current `WaterSavings` block is okay but could be much more dramatic. Imagine a large number animation counting up "240 m³ saved this month" with a coin-flip / counter animation.
8. **Alert banners** — currently rectangular boxes. Could be more attention-grabbing for high-severity (frost = pulsing red border)
9. **Farmer header card** — show a small avatar (initials in a colored circle) next to the farmer's name. Adds humanity.

### Polish (do these last)
10. **Custom favicon** — `frontend/index.html` references `/leaf.svg` but the file doesn't exist yet. Create it.
11. **Loading screen** — show a ZiraIA leaf logo while the initial data loads
12. **Subtle background pattern** — VERY subtle zellige-inspired pattern in the body bg (5% opacity, easy to overdo)
13. **Footer** — "Made with ❤️ for Moroccan farmers · Hack AI 2026"
14. **Page title / meta tags** — make sure browser tab and OG share image are branded

### Out of scope for hackathon (don't waste time here)
- ❌ Auth / login
- ❌ Multi-language UI toggle (UI is English; Darija is only in the WhatsApp message)
- ❌ Mobile responsive at all breakpoints (desktop demo is enough — but check it doesn't break on a 1280px laptop)
- ❌ Accessibility audit (do basic alt text and semantic HTML, but don't deep-audit)

---

## 10. Helpful prompt to paste into Claude / ChatGPT when you're stuck

If you're using an AI assistant to help you, paste this at the start of your conversation:

```
I'm working on a hackathon project called ZiraIA — an AI-powered irrigation
platform for Moroccan farmers. The backend is built (FastAPI + Gemini + 
Open-Meteo). I'm focused on the frontend dashboard and a WhatsApp-style chat
panel.

Tech stack: React 18 + Vite + Tailwind CSS + Leaflet (react-leaflet) + Recharts.

The dashboard shows 3 farms on a map of Morocco. Clicking a farm shows:
- A big colored "IRRIGATE / WAIT / SKIP" decision card
- KPI cards (soil moisture %, NDVI, rain %, temp)
- Alert banners (frost, drought, crop stress)
- A 7-day soil moisture trend chart
- A WhatsApp-style chat panel showing a daily Darija (Moroccan Arabic) 
  message + live Q&A input

The WhatsApp panel is the demo's most important visual — it should look like
an actual phone screen because the story is "this message goes to a real
farmer's phone in their dialect."

Design feel: warm, earthy, trustworthy — like a village agronomist with a 
tablet. NOT corporate SaaS. Brand colors:
- ziraia-green #2d8a4f (primary)
- ziraia-dry #dc2626 (irrigate state)
- ziraia-wait #f59e0b (wait state)
- ziraia-wet #0284c7 (water/moisture)

API contract — the frontend calls these endpoints:
- GET /api/farms → list of farms
- GET /api/farms/{id}/analyze → decision + Darija AI message
- POST /api/farms/{id}/ask → send a Darija question, get a Darija reply
- GET /api/farms/{id}/history → 30 days of saved readings

DO NOT touch the backend logic. DO focus on visual polish, animations, UX,
and making the WhatsApp panel look like a real phone screen.

My specific task right now is: [WRITE WHAT YOU'RE WORKING ON]
```

---

## 11. Working agreement with Adam (the project lead)

- **Open a PR into `adam` branch**, don't push directly to it. He'll review and merge.
- **Don't change backend code** without explicit approval. The decision engine and AI prompts are tuned and tested.
- **Don't change the API contract** — if you need new data, ask. He can add an endpoint in 5 minutes.
- **Don't commit** `.env`, `node_modules`, `ziraia.db`, or `.venv/`. They're gitignored, but double-check before pushing.
- **Commit messages**: `feat:`, `style:`, `fix:`, `polish:` prefix — short, in present tense.
- **Test the demo flow** before pushing: open http://localhost:5173, click each of the 3 farms, send a Darija question in the WhatsApp panel, confirm nothing visually breaks.
- **Questions**: ping Adam directly. Don't guess on UX direction — better to ask for 30 seconds than rebuild for 30 minutes.

---

## 12. Files you can edit freely

```
frontend/
├── src/App.jsx                    ✅ edit
├── src/index.css                  ✅ edit
├── src/components/*.jsx           ✅ edit / add new components
├── tailwind.config.js             ✅ extend theme as needed
├── index.html                     ✅ favicon, meta tags
└── public/                        ✅ add images here (create the folder)
```

## Files NOT to edit without permission

```
frontend/
├── src/api.js                     ⚠️ shape changes will break things
└── vite.config.js                 ⚠️ proxy config is correct, don't touch

backend/                           ⛔ entire folder off-limits unless approved
data/sample_farms.json             ⚠️ ask first — schema changes break backend
```

---

## 13. Demo day plan (so you understand what you're building for)

The pitch is **3 minutes**. The visual flow is approximately:
- **0:00–0:30** — opening problem slide (87% of Morocco's water → agriculture, 3.5M small farmers, 13% rural poverty)
- **0:30–1:00** — _open http://localhost:5173 live, click Hassan's farm in Haouz, the panel shows "WAIT — 98% rain coming in 24h"_
- **1:00–1:30** — point at the WhatsApp panel, read Hassan's Darija message out loud (translated)
- **1:30–2:00** — type a question in the WhatsApp input → Gemini responds in Darija live → judges react
- **2:00–2:30** — business model: B2B2C, cooperative SaaS at 200 DH/farmer/month, OCP partnership pipeline
- **2:30–3:00** — close: water saved, farmers reached, ask for funding/feedback

**Your work makes minute 0:30 to 2:00 land.** That's where the dashboard is on screen.

---

## 14. One last thing

This is for real Moroccan farmers in a country recovering from a 7-year drought. The visual polish matters because trust matters. A dashboard that looks beautiful but inaccurate is useless; a dashboard that's accurate but ugly won't be adopted. We're going for both.

Have fun. Ship things. Ask questions. Yalla.

---

_Last updated: by Adam, May 2026 — covers state of `adam` branch as of commit `a0abd2d`_
