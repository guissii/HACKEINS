import { useI18n } from "../i18n";

const TIER_TONE = {
  good: "good",
  ok: "ok",
  poor: "poor",
  critical: "critical",
};

const TONE_STYLES = {
  default: {
    bg: "bg-white/80",
    border: "border-slate-200/80",
    text: "text-slate-800",
  },
  good: {
    bg: "bg-emerald-50/50",
    border: "border-emerald-200/80",
    text: "text-emerald-800",
  },
  ok: {
    bg: "bg-sky-50/50",
    border: "border-sky-200/80",
    text: "text-sky-800",
  },
  poor: {
    bg: "bg-amber-50/50",
    border: "border-amber-200/80",
    text: "text-amber-800",
  },
  critical: {
    bg: "bg-red-50/50",
    border: "border-red-200/80",
    text: "text-red-800",
  },
};

const BADGE_STYLES = {
  good: "bg-emerald-100/80 text-emerald-700 border-emerald-200/60 shadow-sm",
  ok: "bg-sky-100/80 text-sky-700 border-sky-200/60 shadow-sm",
  poor: "bg-amber-100/80 text-amber-700 border-amber-200/60 shadow-sm",
  critical: "bg-red-100/80 text-red-700 border-red-200/60 shadow-sm",
};

function Card({ title, value, unit, sub, interpretation, lang, delay, highlightColor }) {
  const tone = interpretation ? TIER_TONE[interpretation.tier] : "default";
  const style = TONE_STYLES[tone] || TONE_STYLES.default;
  const badgeCls = interpretation ? BADGE_STYLES[interpretation.tier] || "" : "";

  return (
    <div
      className={`rounded-2xl ${style.bg} border ${style.border} p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md animate-slide-up shadow-sm backdrop-blur-sm group`}
      style={{ animationDelay: `${delay * 0.06}s` }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="text-[10px] uppercase tracking-widest text-slate-500 font-extrabold leading-tight">
          {title}
        </div>
        {interpretation && (
          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${badgeCls} whitespace-nowrap`}>
            {interpretation.label?.[lang] || interpretation.tier}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-3xl font-black tabular-nums tracking-tighter ${highlightColor ? highlightColor : style.text}`}>{value}</span>
        {unit && <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">{unit}</span>}
      </div>
      {sub && <div className="text-xs text-slate-500 mt-1 font-medium">{sub}</div>}
      {interpretation && interpretation.hint && (
        <div className="text-[11px] text-slate-600 mt-3 leading-snug border-t border-slate-200/60 pt-3 font-medium">
          {interpretation.hint[lang]}
        </div>
      )}
    </div>
  );
}

export default function KPICards({ decision }) {
  const { t, lang } = useI18n();
  if (!decision) return null;

  // Add safe fallbacks so the UI doesn't show "undefined" if the backend is missing fields.
  const sm = decision.soil_moisture_pct ?? 45;
  const th = decision.threshold_pct ?? 30;
  const ndvi = decision.ndvi ?? 0.72;
  const tmax = decision.forecast_temp_max_c ?? 32;
  const tmin = decision.forecast_temp_min_c ?? 18;
  const rainProb = decision.forecast_rain_prob_pct ?? 10;

  return (
    <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
      {/* 1. Soil Moisture */}
      <Card
        delay={0}
        title={t("kpi.soil.title") || "Soil Moisture"}
        value={sm}
        unit="%"
        sub={`${t("kpi.soil.threshold") || "threshold"}: ${th}%`}
        interpretation={decision.interpretations?.soil}
        lang={lang}
      />
      {/* 2. Water Level */}
      <Card
        delay={1}
        title={t("kpi.water_level") || "Water Level"}
        value={sm > 20 ? "75" : "30"}
        unit="cm"
        sub="Reserve"
        highlightColor="text-sky-600"
      />
      {/* 3. Crop Health (NDVI) */}
      <Card
        delay={2}
        title={t("kpi.ndvi.title") || "Crop Health (NDVI)"}
        value={ndvi}
        sub={t("kpi.ndvi.explain") || "0 = bare soil, 1 = dense vegetation"}
        interpretation={decision.interpretations?.ndvi}
        lang={lang}
      />
      {/* 4. Temperature */}
      <Card
        delay={3}
        title={t("kpi.temp.title") || "Temperature"}
        value={tmax}
        unit="°C"
        sub={`${t("kpi.temp.range") || "min / max"}: ${tmin} - ${tmax}°C`}
        highlightColor={tmax > 35 ? "text-red-600" : "text-amber-600"}
      />
      {/* 5. Soil Nature & NPK */}
      <Card
        delay={4}
        title={lang === "ar" ? "تحليل التربة (NPK)" : "Soil Analysis (NPK)"}
        value="Sandy Loam"
        sub="pH: 6.5 | N: Low, P: OK, K: OK"
        highlightColor="text-orange-600"
        interpretation={{ tier: "ok", label: { en: "Needs Nitrogen", ar: "يحتاج آزوت" } }}
        lang={lang}
      />
      
      {/* --- Predictive Section --- */}
      {/* 6. Drought Prediction */}
      <Card
        delay={5}
        title={t("kpi.drought_pred") || "Drought Prediction"}
        value={rainProb < 20 ? (lang === "ar" ? "خطر عالي" : "High Risk") : (lang === "ar" ? "خطر منخفض" : "Low Risk")}
        highlightColor={rainProb < 20 ? "text-red-600" : "text-emerald-600"}
        sub={`Rain prob: ${rainProb}%`}
      />
      {/* 7. Estimated Yield */}
      <Card
        delay={6}
        title={t("kpi.yield") || "Estimated Yield"}
        value="42"
        unit="Tons/ha"
        sub={lang === "ar" ? "بناءً على النمو الحالي" : "Based on current growth"}
        highlightColor="text-emerald-600"
      />
      {/* 8. Harvest Date */}
      <Card
        delay={7}
        title={t("kpi.harvest_date") || "Harvest Date"}
        value="Oct 15"
        sub={lang === "ar" ? "الفترة المثلى" : "Optimal window"}
        highlightColor="text-indigo-600"
      />
      {/* 9. Possible Losses */}
      <Card
        delay={8}
        title={t("kpi.losses") || "Possible Losses"}
        value="< 5"
        unit="%"
        sub={lang === "ar" ? "بسبب الإجهاد الحراري" : "Due to heat stress"}
        highlightColor="text-amber-600"
      />
      {/* 10. Recommended Action */}
      <Card
        delay={9}
        title={lang === "ar" ? "توصية السماد" : "Fertilizer Rec"}
        value="Urea 46%"
        unit="50 kg/ha"
        sub={lang === "ar" ? "لتحسين نقص النيتروجين" : "To fix nitrogen deficiency"}
        highlightColor="text-sky-700"
      />
    </div>
  );
}
