import { useEffect, useState } from "react";
import { api } from "./api";
import FarmMap from "./components/FarmMap";
import DecisionWidget from "./components/DecisionWidget";
import KPICards from "./components/KPICards";
import AlertBanner from "./components/AlertBanner";
import TrendChart from "./components/TrendChart";
import WhatsAppPanel from "./components/WhatsAppPanel";

export default function App() {
  const [farms, setFarms] = useState([]);
  const [analyses, setAnalyses] = useState({}); // {id: analyze response}
  const [selectedId, setSelectedId] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  // Load farms + run analysis on all of them in parallel (so the map shows colors)
  useEffect(() => {
    (async () => {
      try {
        const list = await api.listFarms();
        setFarms(list.data);
        if (list.data.length) setSelectedId(list.data[0].id);

        const results = await Promise.all(
          list.data.map((f) => api.analyze(f.id).then((r) => [f.id, r.data]))
        );
        setAnalyses(Object.fromEntries(results));
      } catch (e) {
        setError(e.message);
      }
    })();
  }, []);

  // Load history when selection changes
  useEffect(() => {
    if (!selectedId) return;
    api.history(selectedId).then((r) => setHistory(r.data)).catch(() => {});
  }, [selectedId]);

  // Re-run /analyze for the selected farm (e.g. after a farmer correction
  // applied an override and we want the dashboard to reflect the new decision).
  async function refreshAnalysis(id) {
    try {
      const r = await api.analyze(id);
      setAnalyses((prev) => ({ ...prev, [id]: r.data }));
    } catch {
      /* silent */
    }
  }

  const selectedFarm = farms.find((f) => f.id === selectedId);
  const selectedAnalysis = analyses[selectedId];

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <Header />
      {error && (
        <div className="bg-red-100 text-red-800 px-4 py-2 text-sm">
          Backend error: {error}. Is FastAPI running on :8765?
        </div>
      )}
      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Left: Map + farm list */}
        <div className="col-span-7 flex flex-col gap-4 overflow-hidden">
          <div className="flex-1 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
            {farms.length > 0 ? (
              <FarmMap
                farms={farms}
                decisions={analyses}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                Loading farms…
              </div>
            )}
          </div>
          <FarmList
            farms={farms}
            analyses={analyses}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {/* Right: Detail panel */}
        <div className="col-span-5 overflow-y-auto pr-2 space-y-4">
          {selectedFarm && selectedAnalysis ? (
            <>
              <FarmHeader farm={selectedFarm} />
              <OverrideBanner overrides={selectedAnalysis.overrides} />
              <DecisionWidget decision={selectedAnalysis.decision} />
              <AlertBanner alerts={selectedAnalysis.decision.alerts} />
              <KPICards decision={selectedAnalysis.decision} />
              <WaterSavings decision={selectedAnalysis.decision} farm={selectedFarm} />
              <TrendChart history={history} fallbackHistory={null} />
              <WhatsAppPanel
                farmId={selectedFarm.id}
                farmer={selectedFarm.farmer_name}
                dailyMessage={selectedAnalysis.ai?.darija_message}
                aiSource={selectedAnalysis.ai?._source}
                onOverrideApplied={() => refreshAnalysis(selectedFarm.id)}
              />
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              Select a farm on the map
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-filaha-green text-white flex items-center justify-center text-xl">
        🌿
      </div>
      <div>
        <div className="font-bold text-slate-900">Filaha AI</div>
        <div className="text-xs text-slate-500">
          Irrigation intelligence for Moroccan farmers
        </div>
      </div>
      <div className="ml-auto text-xs text-slate-500">
        Hack AI · Rural World 2026
      </div>
    </header>
  );
}

function FarmHeader({ farm }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">
            {farm.region}
          </div>
          <div className="text-lg font-bold text-slate-900">
            {farm.parcel_name}
          </div>
          <div className="text-sm text-slate-600">
            {farm.farmer_name} · {farm.area_hectares} ha · {farm.crop}
          </div>
        </div>
      </div>
    </div>
  );
}

function FarmList({ farms, analyses, selectedId, onSelect }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {farms.map((f) => {
        const action = analyses[f.id]?.decision?.action;
        const dotColor = {
          IRRIGATE: "bg-red-500",
          WAIT: "bg-amber-500",
          SKIP: "bg-green-500",
        }[action] || "bg-slate-300";
        const isSelected = selectedId === f.id;
        return (
          <button
            key={f.id}
            onClick={() => onSelect(f.id)}
            className={`text-left rounded-xl border p-3 transition ${
              isSelected
                ? "border-filaha-green bg-white shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
              <span className="text-xs uppercase tracking-wide text-slate-500">
                {f.region}
              </span>
            </div>
            <div className="font-semibold text-slate-900 mt-1 text-sm">
              {f.parcel_name}
            </div>
            <div className="text-xs text-slate-500">{f.crop} · {f.area_hectares} ha</div>
            <div className="text-xs font-semibold mt-1 text-slate-700">
              {action || "…"}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function OverrideBanner({ overrides }) {
  const entries = Object.entries(overrides || {});
  if (entries.length === 0) return null;
  return (
    <div className="rounded-xl border border-sky-300 bg-sky-50 px-4 py-3 flex items-start gap-3">
      <span className="text-xl">🧑‍🌾</span>
      <div className="flex-1">
        <div className="text-xs uppercase tracking-wide text-sky-700 font-semibold">
          Farmer overrides active
        </div>
        <ul className="mt-1 text-sm text-sky-900 space-y-0.5">
          {entries.map(([field, info]) => (
            <li key={field}>
              <span className="font-mono text-xs bg-sky-100 px-1.5 py-0.5 rounded">
                {field}
              </span>{" "}
              <span className="font-medium">→ {info.text}</span>
              <span className="text-xs text-sky-600 ml-2">
                {info.hours_left}h left
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function WaterSavings({ decision, farm }) {
  // Crude "vs traditional" comparison: traditional schedule waters every 3 days
  // at a default 5mm depth regardless of weather/soil. Filaha applies only what
  // the deterministic engine prescribed.
  const traditionalLiters = 5 * 10000 * farm.area_hectares;
  const actualLiters = decision.irrigation_liters;
  const saved = Math.max(0, traditionalLiters - actualLiters);
  const savedPct = traditionalLiters > 0
    ? Math.round((saved / traditionalLiters) * 100)
    : 0;
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="text-xs uppercase tracking-wide text-emerald-700 font-semibold">
        Water saved today
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-emerald-700">
          {(saved / 1000).toFixed(1)}
        </span>
        <span className="text-sm text-emerald-700">m³</span>
        <span className="ml-auto text-xs font-semibold text-emerald-700">
          {savedPct}% less than scheduled irrigation
        </span>
      </div>
    </div>
  );
}
