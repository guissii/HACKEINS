import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import SiteHeader from "../components/SiteHeader";
import { useI18n } from "../i18n";

export default function ProjectPage() {
  const { t } = useI18n();
  const [aiStatus, setAiStatus] = useState(null);
  const [aiErr, setAiErr] = useState("");
  const [aiTest, setAiTest] = useState({ status: "idle", source: "", error: "" });

  useEffect(() => {
    api.aiStatus()
      .then((r) => {
        setAiStatus(r.data);
        setAiErr("");
      })
      .catch((e) => {
        setAiStatus(null);
        setAiErr(e.message);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteHeader />
      <main className="flex-1 py-12">
        <div className="container-page max-w-5xl">
          <div className="text-xs uppercase tracking-widest text-slate-500">
            {t("project.kicker")}
          </div>
          <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
            {t("project.title")}
          </h1>
          <p className="mt-4 text-slate-600 leading-relaxed">
            {t("project.subtitle")}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/dashboard" className="btn btn-primary">
              {t("project.cta_dashboard")}
            </Link>
            <Link to="/contact" className="btn btn-secondary">
              {t("project.cta_contact")}
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4">
            <div className="card p-6">
              <div className="text-sm font-semibold text-slate-900">{t("project.ai_status_title")}</div>
              {aiStatus ? (
                <div className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {aiStatus.gemini_configured ? t("project.ai_ok") : t("project.ai_missing")}
                  <span className="ms-2 text-xs text-slate-500">
                    {t("project.ai_model")}: {aiStatus.gemini_model}
                  </span>
                </div>
              ) : (
                <div className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {t("project.ai_unknown")}
                  {aiErr ? <span className="ms-2 text-xs text-red-700">{aiErr}</span> : null}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={aiTest.status === "loading"}
                  onClick={() => {
                    setAiTest({ status: "loading", source: "", error: "" });
                    api.analyze(1)
                      .then((r) => {
                        setAiTest({ status: "done", source: r.data?.ai?._source || "", error: "" });
                      })
                      .catch((e) => {
                        setAiTest({ status: "error", source: "", error: e.message });
                      });
                  }}
                >
                  {aiTest.status === "loading" ? t("project.ai_testing") : t("project.ai_test")}
                </button>
                {aiTest.status === "done" ? (
                  <div className="text-xs text-slate-600">
                    {t("project.ai_test_result")}:{" "}
                    <span className="font-semibold text-slate-900">{aiTest.source || "unknown"}</span>
                  </div>
                ) : null}
                {aiTest.status === "error" ? (
                  <div className="text-xs text-red-700">{aiTest.error}</div>
                ) : null}
              </div>
            </div>

            <DocBlock title="1. THE PROBLEM">
              <p>
                <strong>Moroccan rural farmers are making irreversible agricultural decisions every day completely blind — and every wrong decision costs them their water, their harvest, and their livelihood.</strong>
              </p>
              <h3>Why it is serious</h3>
              <p>
                Agricultural decisions are not reversible. Once a farmer over-irrigates, the water is gone. Once the wrong crop is planted, the farmer waits a full year to try again. Once a frost hits without warning, the harvest is lost. These mistakes compound season after season, keeping farmers exactly where they are.
              </p>
              <h3>The root causes</h3>
              <ul>
                <li><strong>No data</strong> — farmers have no visibility into what is happening in their soil</li>
                <li><strong>No guidance</strong> — no agronomist, no tool, no system gives them a daily recommendation</li>
                <li><strong>No language</strong> — existing digital tools speak French or standard Arabic, not Darija</li>
                <li><strong>No hardware</strong> — every precision agriculture solution requires IoT sensors, paid licenses, or smartphones that small farmers do not have</li>
              </ul>
            </DocBlock>

            <DocBlock title="2. THE SOLUTION">
              <p>
                <strong>ZiraIA gives every Moroccan rural farmer an AI agronomist in their pocket — one that reads their land, combines it with weather and agricultural data, and tells them exactly what to do, every morning, in their own language.</strong>
              </p>
              <h3>What makes it different</h3>
              <ul>
                <li><strong>No IoT. No sensors. No hardware.</strong> ZiraIA runs entirely on free satellite data from NASA and ESA. The only physical thing a farmer needs is a basic phone with WhatsApp.</li>
                <li><strong>The farmer is never blind again.</strong> Every morning, before they start their day, the answer is already in their pocket.</li>
                <li><strong>It is a conversation, not a notification.</strong> The farmer can reply, correct the system, and get an instant answer in Darija.</li>
                <li><strong>It covers real farming.</strong> A farmer does not grow one crop. ZiraIA handles multiple crops on the same land — each with its own daily decision.</li>
              </ul>
            </DocBlock>

            <DocBlock title="3. THE 3 FEATURES">
              <h3>Feature 1 — Soil Intelligence</h3>
              <p><em>Know your land</em></p>
              <p>
                ZiraIA reads the farmer&apos;s land daily through free NASA and ESA satellite data. No sensor, no visit, no cost. The farmer finally sees what is happening underground.
              </p>
              <p><strong>What it extracts:</strong></p>
              <ul>
                <li>Soil moisture % — does the land need water?</li>
                <li>NDVI vegetation index — how healthy are the crops?</li>
                <li>Land surface temperature — is there heat stress?</li>
                <li>ET₀ evapotranspiration — exactly how much water does the land need today?</li>
                <li>Historical soil trend — is the land improving or degrading over time?</li>
              </ul>

              <h3>Feature 2 — Irrigation &amp; Weather Intelligence</h3>
              <p><em>Make the right daily decision</em></p>
              <p>
                ZiraIA combines the soil data with live weather forecasts and agricultural science to produce one clear daily action per crop. This is not a weather app. Any farmer can check the weather. What no farmer can do alone is combine their soil moisture level, the rain forecast for the next 72 hours, their specific crop&apos;s water coefficient, and the ET₀ calculation — and turn all of that into one precise recommendation.
              </p>
              <p><strong>What it produces:</strong></p>
              <ul>
                <li><strong>IRRIGATE</strong> — with exact minutes and liters per crop</li>
                <li><strong>WAIT</strong> — rain is coming, save your water</li>
                <li><strong>SKIP</strong> — soil is already healthy, no action needed</li>
                <li><strong>Alerts</strong> — frost incoming, drought stress building, heavy rain expected</li>
              </ul>
              <p><strong>Multi-crop logic:</strong></p>
              <p>
                Each crop on the farm gets its own decision based on its specific water needs and sensitivity. A farm with olive trees, tomatoes, and onions gets three separate recommendations in one morning message.
              </p>
              <div className="border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 whitespace-pre-line">
                {`"Salam Ahmed —
🫒 Zitoune: Skip — lard mezyana
🍅 Tomatich: Irrigate 25 dqiqa
🧅 Besla: Wait — shta jayya ghda"`}
              </div>

              <h3>Feature 3 — Crop Intelligence</h3>
              <p><em>Plan the right season</em></p>
              <p>
                Based on the soil profile, the region, and the seasonal climate, ZiraIA recommends the most suitable crops for the farmer&apos;s land. Not generic advice — recommendations grounded in real FAO agronomic data specific to Moroccan regions and soil types, reasoned over by the AI with the farm&apos;s actual data as context.
              </p>
              <p><strong>What it produces:</strong></p>
              <ul>
                <li>Top crop recommendations ranked by suitability score</li>
                <li>Optimal planting window per recommended crop</li>
                <li>Water requirements per crop per week</li>
                <li>Drought tolerance rating per crop</li>
              </ul>
            </DocBlock>

            <DocBlock title="4. THE SERVICES & OUTPUT">
              <div className="overflow-x-auto">
                <table className="w-full border border-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left p-3 border-b border-slate-200">#</th>
                      <th className="text-left p-3 border-b border-slate-200">Service</th>
                      <th className="text-left p-3 border-b border-slate-200">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <Row n="1" s="Daily Irrigation Decision" d="Every morning, automatically — irrigate/wait/skip with exact minutes and liters per crop" />
                    <Row n="2" s="Multi-Crop Management" d="Each crop on the farm gets its own personalized decision" />
                    <Row n="3" s="Smart Alerts" d="Proactive warnings before frost, drought stress, or heavy rain" />
                    <Row n="4" s="Crop Recommendation" d="Right crop, right land, right season — based on real agronomic data" />
                    <Row n="5" s="Two-Way Conversation" d="Farmer replies in Darija, system listens, updates decisions in real time" />
                    <Row n="6" s="Cooperative Dashboard" d="Full web platform for managers overseeing multiple farms" />
                  </tbody>
                </table>
              </div>
            </DocBlock>

            <DocBlock title="5. THE TWO INTERFACES">
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-900">WhatsApp</div>
                  <div className="mt-2 text-sm text-slate-600 leading-relaxed">
                    Small farmers, basic phone: daily decision, multi-crop alerts, smart warnings, two-way conversation in Darija. Arrives every morning automatically — the farmer never has to open an app.
                  </div>
                </div>
                <div className="border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-900">Web Dashboard</div>
                  <div className="mt-2 text-sm text-slate-600 leading-relaxed">
                    Cooperatives, large farm managers: full map view of all parcels, soil KPI cards, trend charts, decision history, alerts, audit trail of every recommendation.
                  </div>
                </div>
              </div>
            </DocBlock>

            <DocBlock title="6. THE DATA WORKFLOW">
              <pre className="mt-2 border border-slate-200 bg-slate-50 p-4 text-xs text-slate-800 overflow-x-auto whitespace-pre">
{`NASA + ESA Satellites
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
    Farmer replies → Gemini Q&A → WhatsApp response`}
              </pre>
              <div className="mt-3 text-sm text-slate-600 leading-relaxed">
                <strong>Zero IoT. Zero sensors. Zero hardware.</strong> The only physical object in this entire pipeline is the farmer&apos;s basic phone receiving a WhatsApp message.
              </div>
            </DocBlock>

            <DocBlock title="7. THE AI LAYER — WHERE AND WHY">
              <h3>Where AI sits</h3>
              <p>
                AI enters only at the human interface — after the decision engine has already produced a precise, science-based result. The decision itself is never made by the AI.
              </p>

              <h3>The 3 Gemini agents</h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left p-3 border-b border-slate-200">Agent</th>
                      <th className="text-left p-3 border-b border-slate-200">Job</th>
                      <th className="text-left p-3 border-b border-slate-200">Why AI and not code</th>
                    </tr>
                  </thead>
                  <tbody>
                    <Row3 a="Explainer" b="Turns the decision + numbers into a warm Darija WhatsApp message" c="No template writes natural, contextual Moroccan Darija" />
                    <Row3 a="Q&A" b="Answers unexpected farmer questions at any time" c="No rule set covers every possible question a farmer might ask" />
                    <Row3 a="Intent Parser" b="Understands farmer corrections and updates the decision" c="Only an LLM can parse intent from free text" />
                  </tbody>
                </table>
              </div>

              <h3>Why AI is necessary — not optional</h3>
              <p>
                Without AI, ZiraIA outputs numbers that never reach the farmer. A dashboard that a small farmer with low literacy cannot read is not a solution — it is a tool that exists only for the people who already have access to agronomists.
              </p>
              <p>
                The AI is not used because the hackathon theme requires it. It is used because without it the data never becomes a decision, and the decision never becomes a conversation, and the conversation never happens in the farmer&apos;s own language.
              </p>
              <div className="border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                We use AI not because the theme requires it — but because without it the data never reaches the farmer, and a system that cannot communicate is a system that does not exist.
              </div>

              <h3>Why the decision engine is NOT AI</h3>
              <p>
                The irrigation calculation — ET₀, crop water coefficients, soil moisture thresholds — is pure deterministic Python. You never want an LLM deciding how many liters of water a crop needs. That number comes from agricultural science, not a language model. The engine is fully tested, fully auditable, and a farmer can trust it.
              </p>
              <p><strong>Deterministic core. AI at the edge. That is the architecture.</strong></p>
            </DocBlock>

            <DocBlock title="8. THE PROBLEM STATEMENT → SOLUTION MAP">
              <div className="overflow-x-auto">
                <table className="w-full border border-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left p-3 border-b border-slate-200">Problem</th>
                      <th className="text-left p-3 border-b border-slate-200">How ZiraIA solves it</th>
                    </tr>
                  </thead>
                  <tbody>
                    <Row2 a="No data about the land" b="Satellite Intelligence — NASA + ESA data daily, no sensor needed" />
                    <Row2 a="No guidance on what to do" b="Decision Engine — scientific rules produce one clear daily action" />
                    <Row2 a="No tool in their language" b="Gemini Explainer — natural Darija, warm tone, every morning" />
                    <Row2 a="Cannot afford an agronomist" b="Crop Intelligence — AI agronomist grounded in FAO data" />
                    <Row2 a="Mistakes happen before warnings" b="Smart Alerts — frost, drought, rain warnings sent before the event" />
                    <Row2 a="System does not listen" b="Two-way conversation — farmer corrections update decisions in real time" />
                  </tbody>
                </table>
              </div>
            </DocBlock>
          </div>
        </div>
      </main>
    </div>
  );
}

function DocBlock({ title, children }) {
  return (
    <div className="card p-6">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-3 space-y-3 text-sm text-slate-600 leading-relaxed [&_h3]:mt-4 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:tracking-tight [&_h3]:text-slate-900 [&_ul]:list-disc [&_ul]:ps-5 [&_ul]:space-y-1 [&_li]:text-slate-600 [&_strong]:text-slate-900">
        {children}
      </div>
    </div>
  );
}

function Row({ n, s, d }) {
  return (
    <tr className="border-t border-slate-200">
      <td className="p-3 align-top text-slate-700">{n}</td>
      <td className="p-3 align-top text-slate-900 font-semibold">{s}</td>
      <td className="p-3 align-top text-slate-600">{d}</td>
    </tr>
  );
}

function Row2({ a, b }) {
  return (
    <tr className="border-t border-slate-200">
      <td className="p-3 align-top text-slate-900 font-semibold">{a}</td>
      <td className="p-3 align-top text-slate-600">{b}</td>
    </tr>
  );
}

function Row3({ a, b, c }) {
  return (
    <tr className="border-t border-slate-200">
      <td className="p-3 align-top text-slate-900 font-semibold">{a}</td>
      <td className="p-3 align-top text-slate-600">{b}</td>
      <td className="p-3 align-top text-slate-600">{c}</td>
    </tr>
  );
}
