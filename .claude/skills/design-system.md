# Skill: Filaha AI Design System

**Purpose:** Visual + UX language reference for any AI assistant or human working on the frontend.

**When this skill applies:**
- Adding or restyling a React component in `frontend/src/`
- Picking a color, font, or spacing scale
- Deciding tone of voice for any UI string
- Designing the WhatsApp panel (which has its own sub-rules below)

---

## Brand archetype

**"Trusted village agronomist with a tablet."**

- Warm, earthy, optimistic
- NOT corporate SaaS dashboard
- NOT Apple-minimalism
- NOT generic "Africa with sunset" stock photography
- The audience is rural Moroccan farmers + the cooperatives that serve them — design for both literacy and trust

---

## Color palette

Defined in `frontend/tailwind.config.js` under `theme.extend.colors.filaha`:

| Token | Hex | Use |
|---|---|---|
| `filaha-green` | `#2d8a4f` | Primary brand. Logo, headers, primary buttons |
| `filaha-earth` | `#a87d4a` | Secondary accents. Sparingly. |
| `filaha-sky` | `#3b82f6` | Information / neutral data |
| `filaha-dry` | `#dc2626` | IRRIGATE state, urgent alerts |
| `filaha-wet` | `#0284c7` | Water, moisture, "wet" data |
| `filaha-wait` | `#f59e0b` | WAIT state, frost warnings |

Decision color mapping (must stay consistent):
- **IRRIGATE** → red (`filaha-dry` / `red-600`)
- **WAIT** → amber (`filaha-wait` / `amber-500`)
- **SKIP** → green (`filaha-green` / `green-600`)

Don't introduce new palette colors without updating `tailwind.config.js` — keep the palette tight.

---

## Typography

Loaded from Google Fonts in `frontend/index.html`:
- **Inter** — all UI text, all weights 400–700
- **Noto Sans Arabic** — Darija/Arabic text only, applied via the `.arabic` CSS class

The `.arabic` class also sets `direction: rtl` and `text-align: right`. Use it for any Arabic-script content. Do NOT use it for Latin-script Darija (Q&A replies) — that's just regular Inter.

Detecting Arabic script in JS:
```js
function isArabic(s) {
  return /[؀-ۿ]/.test(s || "");
}
```

---

## Tone of voice

For UI strings (buttons, labels, empty states):
- Direct and warm, not jargon-heavy. "Water saved today" not "Aggregate hydrology delta"
- Use Moroccan context where natural. "Soil moisture" yes; "argan-zone water deficit index" no
- Numbers > adjectives. "42 m³ saved" beats "significant water savings"
- English UI is fine — only the WhatsApp message + Q&A are in Darija

For demo-day copy (water savings, KPIs, headlines):
- Lead with the number, big and confident
- One short hint underneath, never a paragraph

---

## Component conventions

Established in `frontend/src/components/`:

- **Cards:** `rounded-xl border border-slate-200 bg-white p-4` is the baseline. Tone variations: `bg-amber-50 border-amber-200` for warn, `bg-red-50 border-red-200` for bad, `bg-green-50 border-green-200` for good
- **Decision widget:** uses bolder borders + heavier color tone (e.g. `bg-red-50 border-red-200` with a `bg-red-600 text-white` badge inside) — that's the visual anchor of the right panel
- **KPI cards:** 2x2 grid, label uppercase + tracking-wide, big value in `text-2xl font-bold`, optional `hint` line below
- **Alerts:** rounded-lg, emoji icon left, type label + message right, color by severity (high=red, medium=amber, low=sky)
- **Spacing:** `space-y-4` between panel sections, `gap-3` inside grids, `p-4` inside cards, `p-5` for the prominent decision widget
- **Radius:** `rounded-xl` for cards, `rounded-2xl` for containers (WhatsApp panel), `rounded-full` for badges/buttons

When adding a new component, match these conventions before inventing new ones.

---

## The WhatsApp panel — special rules

`components/WhatsAppPanel.jsx` has its own visual contract because it's the demo's hero element:

- **Header:** WhatsApp green (`bg-[#075E54]`) with white text. Avatar circle on the left, "Filaha AI" + farmer name. Source badge ("Gemini live" or "Demo mode") in the top-right corner.
- **Chat background:** `bg-[#ECE5DD]` — the actual WhatsApp cream color
- **Incoming bubbles (AI):** white background, left-aligned, slight shadow
- **Outgoing bubbles (farmer):** `bg-[#DCF8C6]` (WhatsApp light green), right-aligned, slight shadow
- **Bubble shape:** `rounded-2xl px-3 py-2 text-sm` — never sharp corners
- **Arabic text inside bubbles:** wrap in `<div className="arabic whitespace-pre-wrap">` — RTL + correct font
- **Input area:** white bg, rounded-full input, `bg-filaha-green` send button

Things judges will look for and you should make crisper:
- Typing indicator (3 animated dots) while waiting for Gemini
- Smooth scroll-to-bottom when new messages arrive
- Optional phone-frame around the whole panel (rounded bezel, notch, time/battery icons) — sells the "this is on the farmer's actual phone" story
- Voice-note icon in the input (cosmetic only — we don't have TTS) — visually signals "this works even for illiterate farmers"

Things to never break:
- Don't render Arabic text in left-to-right direction
- Don't lose the "Gemini live" / "Demo mode" badge — judges want to know the AI is actually wired up
- Don't replace the WhatsApp color identity with Filaha brand colors. The whole point of the panel is "this looks like real WhatsApp"

---

## Layout pattern

The dashboard is a 12-column grid:

```
┌──────────────────────────────────────────┐
│ Header (full width, 56px)               │
├───────────────────────┬──────────────────┤
│ Map (col-span-7)      │ Detail panel    │
│                       │ (col-span-5,    │
│ +                     │  scrollable):   │
│ Farm list grid        │   - Farm header │
│ below the map         │   - Decision    │
│                       │   - Alerts      │
│                       │   - KPIs        │
│                       │   - Savings     │
│                       │   - Trend       │
│                       │   - WhatsApp    │
└───────────────────────┴──────────────────┘
```

If you add new panels, slot them into the right-side scroll, not the map column. Map + farm list anchors the left half.

---

## Animation guidance

Subtle and purposeful. The dashboard should feel alive, not jumpy.

- Card hover: `transition border-slate-300` only — no scale, no shadow lift unless it's interactive
- Decision change: fade-in or fade-and-slide, ~200ms ease
- Map marker on selection: pulse or radius bump, never bouncing
- Number counts (water saved): count-up animation is fine for hero numbers, but only on first render — don't loop it

No CSS framework needed beyond Tailwind. Use `transition-all duration-200 ease-out` for most things. For more complex animations, install `framer-motion` only if you really need it (currently not installed).

---

## Don't do

- ❌ Dark mode (projector wash-out at demo)
- ❌ Cartoon farmer illustrations
- ❌ Stock "tech in Africa" imagery
- ❌ Emojis in headers, navigation, or buttons (only in WhatsApp messages and alert badges)
- ❌ More than 3 fonts on screen
- ❌ Multi-language UI toggle (this is the dashboard for English-reading coop managers; Darija is in the WhatsApp panel)
- ❌ Authentication UI (out of scope for hackathon)
- ❌ Landing/marketing page (this is a tool, not a brochure site)
