import { useEffect, useState } from "react";
import { api } from "./api";
import { useI18n } from "./i18n";
import FarmMap from "./components/FarmMap";
import DecisionWidget from "./components/DecisionWidget";
import KPICards from "./components/KPICards";
import AlertBanner from "./components/AlertBanner";
import TrendChart from "./components/TrendChart";
import WhatsAppPanel from "./components/WhatsAppPanel";

export default function App() {
  const { t } = useI18n();
  const [farms, setFarms] = useState([]);
  const [analyses, setAnalyses] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    if (!selectedId) return;
    api.history(selectedId).then((r) => setHistory(r.data)).catch(() => {});
  }, [selectedId]);

  async function refreshAnalysis(id) {
    try {
      const r = await api.analyze(id);
      setAnalyses((prev) => ({ ...prev, [id]: r.data }));
    } catch { /* silent */ }
  }

  const selectedFarm = farms.find((f) => f.id === selectedId);
  const selectedAnalysis = analyses[selectedId];

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <Header />
      {error && (
        <div className="bg-red-100 text-red-800 px-4 py-2 text-sm">
          {t("state.backend_error")}: {error}. {t("state.backend_hint")}
        </div>
      )}
      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
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
                {t("state.loading_farms")}
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
              {t("state.select_farm")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Header() {
  const { t, lang, setLang } = useI18n();
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-ziraia-green text-white flex items-center justify-center text-xl">
        🌿
      </div>
      <div>
        <div className="font-bold text-slate-900">{t("app.name")}</div>
        <div className="text-xs text-slate-500">{t("app.tagline")}</div>
      </div>
      <div className="ms-auto flex items-center gap-3">
        <span className="text-xs text-slate-500 hidden sm:inline">{t("app.event")}</span>
        <button
          onClick={() => setLang(lang === "ar" ? "en" : "ar")}
          className="text-xs px-3 py-1.5 rounded-full border border-slate-300 hover:border-ziraia-green hover:bg-ziraia-green hover:text-white transition font-medium"
        >
          {t("lang.toggle")}
        </button>
      </div>
    </header>
  );
}

function FarmHeader({ farm }) {
  const { t } = useI18n();
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">
        {farm.region}
      </div>
      <div className="text-lg font-bold text-slate-900">{farm.parcel_name}</div>
      <div className="text-sm text-slate-600">
        {farm.farmer_name} · {farm.area_hectares} {t("farm.area")} · {farm.crop}
      </div>
    </div>
  );
}

function FarmList({ farms, analyses, selectedId, onSelect }) {
  const { t } = useI18n();
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
            className={`text-start rounded-xl border p-3 transition ${
              isSelected
                ? "border-ziraia-green bg-white shadow-sm"
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
            <div className="text-xs text-slate-500">
              {f.crop} · {f.area_hectares} {t("farm.area")}
            </div>
            <div className="text-xs font-semibold mt-1 text-slate-700">
              {action ? t(`decision.${action}`) : "…"}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function OverrideBanner({ overrides }) {
  const { t } = useI18n();
  const entries = Object.entries(overrides || {});
  if (entries.length === 0) return null;
  return (
    <div className="rounded-xl border border-sky-300 bg-sky-50 px-4 py-3 flex items-start gap-3">
      <span className="text-xl">🧑‍🌾</span>
      <div className="flex-1">
        <div className="text-xs uppercase tracking-wide text-sky-700 font-semibold">
          {t("override.title")}
        </div>
        <ul className="mt-1 text-sm text-sky-900 space-y-0.5">
          {entries.map(([field, info]) => (
            <li key={field}>
              <span className="font-mono text-xs bg-sky-100 px-1.5 py-0.5 rounded">
                {field}
              </span>{" "}
              <span className="font-medium">→ {info.text}</span>
              <span className="text-xs text-sky-600 ms-2">
                {info.hours_left}{t("override.hours_left")}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function WaterSavings({ decision, farm }) {
  const { t } = useI18n();
  const traditionalLiters = 5 * 10000 * farm.area_hectares;
  const actualLiters = decision.irrigation_liters;
  const saved = Math.max(0, traditionalLiters - actualLiters);
  const savedPct = traditionalLiters > 0
    ? Math.round((saved / traditionalLiters) * 100)
    : 0;
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="text-xs uppercase tracking-wide text-emerald-700 font-semibold">
        {t("savings.title")}
      </div>
      <div className="mt-1 flex items-baseline gap-2 flex-wrap">
        <span className="text-3xl font-bold text-emerald-700">
          {(saved / 1000).toFixed(1)}
        </span>
        <span className="text-sm text-emerald-700">{t("decision.unit_m3")}</span>
        <span className="ms-auto text-xs font-semibold text-emerald-700">
          {savedPct}% {t("savings.vs")}
        </span>
      </div>
    </div>
  );
}
