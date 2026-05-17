import { useI18n } from "../i18n";

export default function PortfolioOverview({ farms, analyses }) {
  const { t } = useI18n();
  if (!farms.length) return null;
  const totalArea = farms.reduce((s, f) => s + f.area_hectares, 0);
  let totalSaved = 0, activeAlerts = 0;
  for (const farm of farms) {
    const a = analyses[farm.id];
    if (a?.decision) {
      totalSaved += Math.max(0, 5 * 10000 * farm.area_hectares - a.decision.irrigation_liters);
      if (a.decision.alerts?.length) activeAlerts += a.decision.alerts.length;
    }
  }
  const savedM3 = (totalSaved / 1000).toFixed(0);

  return (
    <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 shadow-sm animate-slide-up transition-shadow hover:shadow-md relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none -z-10" />
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 items-center">
        <div className="flex items-center gap-4">
          <img src="/logo-ziraia.jpg" alt="ZiraIA" className="w-12 h-12 rounded-xl object-contain border border-slate-100 shadow-sm p-0.5 bg-white" />
          <div>
            <div className="text-[9px] uppercase tracking-widest text-slate-400 font-extrabold">{t("dash.portfolio")}</div>
            <div className="text-sm font-black text-slate-800 mt-0.5 tracking-tight">ZiraIA</div>
          </div>
        </div>
        <KpiMini label={t("dash.total_farms")} value={farms.length} />
        <KpiMini label={t("dash.total_area")} value={`${totalArea.toFixed(1)}`} unit="ha" />
        <KpiMini label={t("dash.alerts")} value={activeAlerts} color={activeAlerts > 0 ? "text-amber-600" : "text-slate-800"} />
        <KpiMini label={t("dash.total_water")} value={`${savedM3}`} unit="m³" color="text-emerald-600" />
      </div>
    </div>
  );
}

function KpiMini({ label, value, unit, color = "text-slate-800" }) {
  return (
    <div className="md:border-s md:border-slate-200/60 md:ps-6 transition-transform hover:-translate-y-0.5 duration-200">
      <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">{label}</div>
      <div className={`text-2xl font-black tabular-nums tracking-tighter flex items-baseline gap-1 ${color}`}>
        {value}
        {unit && <span className="text-xs font-bold uppercase tracking-widest opacity-60">{unit}</span>}
      </div>
    </div>
  );
}
