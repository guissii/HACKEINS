# ZiraIA — Complete Project Document
 
> AI-powered agronomist for Moroccan rural farmers  
> Hack AI · Rural World 2026
 
---
 
## 1. THE PROBLEM
 
**Moroccan rural farmers are making irreversible agricultural decisions every day completely blind — and every wrong decision costs them their water, their harvest, and their livelihood.**
 
### Why it is serious
Agricultural decisions are not reversible. Once a farmer over-irrigates, the water is gone. Once the wrong crop is planted, the farmer waits a full year to try again. Once a frost hits without warning, the harvest is lost. These mistakes compound season after season, keeping farmers exactly where they are.
 
### The root causes
- **No data** — farmers have no visibility into what is happening in their soil
- **No guidance** — no agronomist, no tool, no system gives them a daily recommendation
- **No language** — existing digital tools speak French or standard Arabic, not Darija
- **No hardware** — every precision agriculture solution requires IoT sensors, paid licenses, or smartphones that small farmers do not have
 
---
 
## 2. THE SOLUTION
 
**ZiraIA gives every Moroccan rural farmer an AI agronomist in their pocket — one that reads their land, combines it with weather and agricultural data, and tells them exactly what to do, every morning, in their own language.**
 
### What makes it different
- **No IoT. No sensors. No hardware.** ZiraIA runs entirely on free satellite data from NASA and ESA. The only physical thing a farmer needs is a basic phone with WhatsApp.
- **The farmer is never blind again.** Every morning, before they start their day, the answer is already in their pocket.
- **It is a conversation, not a notification.** The farmer can reply, correct the system, and get an instant answer in Darija.
- **It covers real farming.** A farmer does not grow one crop. ZiraIA handles multiple crops on the same land — each with its own daily decision.
 
---
 
## 3. THE 3 FEATURES
 
### Feature 1 — Soil Intelligence
*Know your land*
 
ZiraIA reads the farmer's land daily through free NASA and ESA satellite data. No sensor, no visit, no cost. The farmer finally sees what is happening underground.
 
**What it extracts:**
- Soil moisture % — does the land need water?
- NDVI vegetation index — how healthy are the crops?
- Land surface temperature — is there heat stress?
- ET₀ evapotranspiration — exactly how much water does the land need today?
- Historical soil trend — is the land improving or degrading over time?
 
---
 
### Feature 2 — Irrigation & Weather Intelligence
*Make the right daily decision*
 
ZiraIA combines the soil data with live weather forecasts and agricultural science to produce one clear daily action per crop. This is not a weather app. Any farmer can check the weather. What no farmer can do alone is combine their soil moisture level, the rain forecast for the next 72 hours, their specific crop's water coefficient, and the ET₀ calculation — and turn all of that into one precise recommendation.
 
**What it produces:**
- **IRRIGATE** — with exact minutes and liters per crop
- **WAIT** — rain is coming, save your water
- **SKIP** — soil is already healthy, no action needed
- **Alerts** — frost incoming, drought stress building, heavy rain expected
 
**Multi-crop logic:**
Each crop on the farm gets its own decision based on its specific water needs and sensitivity. A farm with olive trees, tomatoes, and onions gets three separate recommendations in one morning message.
 
Example:
> *"Salam Ahmed —*  
> *🫒 Zitoune: Skip — lard mezyana*  
> *🍅 Tomatich: Irrigate 25 dqiqa*  
> *🧅 Besla: Wait — shta jayya ghda"*
 
---
 
### Feature 3 — Crop Intelligence
*Plan the right season*
 
Based on the soil profile, the region, and the seasonal climate, ZiraIA recommends the most suitable crops for the farmer's land. Not generic advice — recommendations grounded in real FAO agronomic data specific to Moroccan regions and soil types, reasoned over by the AI with the farm's actual data as context.
 
**What it produces:**
- Top crop recommendations ranked by suitability score
- Optimal planting window per recommended crop
- Water requirements per crop per week
- Drought tolerance rating per crop
 
---
 
## 4. THE SERVICES & OUTPUT
 
| # | Service | Description |
|---|---|---|
| 1 | **Daily Irrigation Decision** | Every morning, automatically — irrigate/wait/skip with exact minutes and liters per crop |
| 2 | **Multi-Crop Management** | Each crop on the farm gets its own personalized decision |
| 3 | **Smart Alerts** | Proactive warnings before frost, drought stress, or heavy rain |
| 4 | **Crop Recommendation** | Right crop, right land, right season — based on real agronomic data |
| 5 | **Two-Way Conversation** | Farmer replies in Darija, system listens, updates decisions in real time |
| 6 | **Cooperative Dashboard** | Full web platform for managers overseeing multiple farms |
 
---
 
## 5. THE TWO INTERFACES
 
| Interface | Target user | What they get |
|---|---|---|
| **WhatsApp** | Small farmers, basic phone | Daily decision, multi-crop alerts, smart warnings, two-way conversation in Darija. Arrives every morning automatically — the farmer never has to open an app. |
| **Web Dashboard** | Cooperatives, large farm managers | Full map view of all parcels, soil KPI cards, trend charts, decision history, alerts, audit trail of every recommendation. |
 
---
 
## 6. THE DATA WORKFLOW
 
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
 
**Zero IoT. Zero sensors. Zero hardware.**  
The only physical object in this entire pipeline is the farmer's basic phone receiving a WhatsApp message.
 
---
 
## 7. THE AI LAYER — WHERE AND WHY
 
### Where AI sits
AI enters only at the human interface — after the decision engine has already produced a precise, science-based result. The decision itself is never made by the AI.
 
### The 3 Gemini agents
 
| Agent | Job | Why AI and not code |
|---|---|---|
| **Explainer** | Turns the decision + numbers into a warm Darija WhatsApp message | No template writes natural, contextual Moroccan Darija |
| **Q&A** | Answers unexpected farmer questions at any time | No rule set covers every possible question a farmer might ask |
| **Intent Parser** | Understands "I checked this morning, the soil is wet" as a correction and updates the decision | Natural language understanding — only an LLM can parse intent from free text |
 
### Why AI is necessary — not optional
 
Without AI, ZiraIA outputs numbers that never reach the farmer. A dashboard that a small farmer with low literacy cannot read is not a solution — it is a tool that exists only for the people who already have access to agronomists.
 
The AI is not used because the hackathon theme requires it. It is used because without it, the data never becomes a decision, and the decision never becomes a conversation, and the conversation never happens in the farmer's own language.
 
*"We use AI not because the theme requires it — but because without it the data never reaches the farmer, and a system that cannot communicate is a system that does not exist."*
 
### Why the decision engine is NOT AI
 
The irrigation calculation — ET₀, crop water coefficients, soil moisture thresholds — is pure deterministic Python. You never want an LLM deciding how many liters of water a crop needs. That number comes from agricultural science, not a language model. The engine is fully tested, fully auditable, and a farmer can trust it.
 
**Deterministic core. AI at the edge. That is the architecture.**
 
---
 
## 8. THE PROBLEM STATEMENT → SOLUTION MAP
 
| Problem | How ZiraIA solves it |
|---|---|
| No data about the land | Satellite Intelligence — NASA + ESA data daily, no sensor needed |
| No guidance on what to do | Decision Engine — scientific rules produce one clear daily action |
| No tool in their language | Gemini Explainer — natural Darija, warm tone, every morning |
| Cannot afford an agronomist | Crop Intelligence — AI agronomist grounded in FAO data |
| Mistakes happen before warnings | Smart Alerts — frost, drought, rain warnings sent before the event |
| System does not listen | Two-way conversation — farmer corrections update decisions in real time |
 
---
 
*ZiraIA — Built for Moroccan farmers. Hack AI · Rural World 2026*
