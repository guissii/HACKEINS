import { useI18n } from "../i18n";
import {
  interpretNDVI,
  interpretSoilMoisture,
  interpretET0,
  interpretTemp,
  interpretRain,
  TIER_TONE,
} from "../utils/interpret";

function Card({ title, value, unit, sub, interpretation, lang }) {
  const tone = interpretation ? TIER_TONE[interpretation.tier] : "default";
  const toneClass = {
    default: "bg-white",
    warn: "bg-amber-50 border-amber-200",
    bad: "bg-red-50 border-red-200",
    good: "bg-green-50 border-green-200",
  }[tone];
  const badgeClass = {
    excellent: "bg-green-600 text-white",
    good: "bg-green-500 text-white",
    fair: "bg-slate-300 text-slate-700",
    poor: "bg-amber-500 text-white",
    critical: "bg-red-600 text-white",
  }[interpretation?.tier];
  return (
    <div className={`rounded-xl border border-slate-200 ${toneClass} p-4`}>
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs uppercase tracking-wide text-slate-500 leading-tight">
          {title}
        </div>
        {interpretation && (
          <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${badgeClass} whitespace-nowrap`}>
            {interpretation.label[lang]}
          </span>
        )}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-slate-900">{value}</span>
        {unit && <span className="text-sm text-slate-500">{unit}</span>}
      </div>
      {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
      {interpretation && (
        <div className="text-xs text-slate-600 mt-2 leading-snug border-t border-slate-200/60 pt-2">
          {interpretation.hint[lang]}
        </div>
      )}
    </div>
  );
}

export default function KPICards({ decision }) {
  const { t, lang } = useI18n();
  if (!decision) return null;
  const f = decision.rationale_facts;

  const ndviInterp = interpretNDVI(f.ndvi);
  const soilInterp = interpretSoilMoisture(f.soil_moisture_pct, f.moisture_threshold);
  const rainInterp = interpretRain(f.rain_prob_24h, f.rain_prob_48h);
  const tempInterp = interpretTemp(f.temp_min_c, f.temp_max_c);
  const et0Interp = interpretET0(f.et0_mm);

  const ndviSub = f.ndvi_7d_ago
    ? t("kpi.was_week_ago", { value: f.ndvi_7d_ago.toFixed(2) })
    : t("kpi.ndvi.explain");

  return (
    <div className="grid grid-cols-2 gap-3">
      <Card
        title={t("kpi.soil.title")}
        value={f.soil_moisture_pct.toFixed(1)}
        unit="%"
        sub={`${t("kpi.soil.threshold")}: ${f.moisture_threshold}%`}
        interpretation={soilInterp}
        lang={lang}
      />
      <Card
        title={t("kpi.ndvi.title")}
        value={f.ndvi.toFixed(2)}
        sub={ndviSub}
        interpretation={ndviInterp}
        lang={lang}
      />
      <Card
        title={t("kpi.rain.title")}
        value={f.rain_prob_48h}
        unit="%"
        interpretation={rainInterp}
        lang={lang}
      />
      <Card
        title={t("kpi.temp.title")}
        value={`${f.temp_min_c}° / ${f.temp_max_c}°`}
        unit="C"
        sub={t("kpi.temp.range")}
        interpretation={tempInterp}
        lang={lang}
      />
      <Card
        title={t("kpi.et0.title")}
        value={f.et0_mm}
        unit="mm/day"
        interpretation={et0Interp}
        lang={lang}
      />
    </div>
  );
}
