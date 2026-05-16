function Card({ label, value, unit, hint, tone = "default" }) {
  const toneClass = {
    default: "bg-white",
    warn: "bg-amber-50 border-amber-200",
    bad: "bg-red-50 border-red-200",
    good: "bg-green-50 border-green-200",
  }[tone];
  return (
    <div className={`rounded-xl border border-slate-200 ${toneClass} p-4`}>
      <div className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-slate-900">{value}</span>
        {unit && <span className="text-sm text-slate-500">{unit}</span>}
      </div>
      {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
    </div>
  );
}

export default function KPICards({ decision }) {
  if (!decision) return null;
  const f = decision.rationale_facts;
  const moistureTone =
    f.soil_moisture_pct < f.moisture_threshold ? "bad" :
    f.soil_moisture_pct > f.moisture_threshold + 10 ? "good" : "default";
  const ndviTone =
    f.ndvi < 0.3 ? "bad" : f.ndvi < 0.45 ? "warn" : "good";

  return (
    <div className="grid grid-cols-2 gap-3">
      <Card
        label="Soil moisture"
        value={f.soil_moisture_pct.toFixed(1)}
        unit="%"
        hint={`threshold: ${f.moisture_threshold}%`}
        tone={moistureTone}
      />
      <Card
        label="NDVI"
        value={f.ndvi.toFixed(2)}
        hint={f.ndvi_7d_ago ? `was ${f.ndvi_7d_ago.toFixed(2)} 7d ago` : null}
        tone={ndviTone}
      />
      <Card
        label="Rain 48h"
        value={f.rain_prob_48h}
        unit="%"
      />
      <Card
        label="Temp"
        value={`${f.temp_min_c}°/${f.temp_max_c}°`}
        unit="C"
        tone={f.temp_min_c < 8 ? "warn" : "default"}
      />
    </div>
  );
}
