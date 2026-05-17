import { useI18n } from "../i18n";

export default function WaterSavings({ decision, farm }) {
  const { t } = useI18n();
  
  if (!decision || decision.action !== "IRRIGATE") return null;

  const trad = 5 * 10000 * (farm?.area_hectares || 1);
  const actual = decision.irrigation_liters || 0;
  const saved = Math.max(0, trad - actual);
  const pct = trad > 0 ? Math.round((saved / trad) * 100) : 0;
  const m3 = saved / 1000;
  const diesel = (m3 * 0.3).toFixed(1);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-emerald-50/80 to-teal-50/40 border border-emerald-200/60 p-6 h-full flex flex-col shadow-sm relative overflow-hidden group">
      {/* Decorative background */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none transition-transform group-hover:scale-110 duration-700" />
      
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" /></svg>
        <div className="text-[10px] uppercase tracking-widest text-emerald-800 font-extrabold">{t("savings.title")}</div>
      </div>

      <div className="flex-1 flex flex-col justify-center relative z-10">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-5xl font-black text-emerald-700 tracking-tighter tabular-nums">{m3.toFixed(1)}</span>
          <span className="text-xs font-bold text-emerald-600/70 tracking-widest uppercase">{t("decision.unit_m3")}</span>
        </div>
        
        <div className="mt-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-emerald-100/50 text-emerald-700 border border-emerald-200/50">
            <svg className="w-3 h-3 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m19 12-7 7-7-7"/><path d="M12 19V5"/></svg>
            {pct}% {t("savings.vs")}
          </span>
        </div>

        {m3 > 0 && (
          <div className="border-t border-emerald-200/60 pt-4 mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white border border-emerald-100 flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 22h18"/><path d="M4 22V4c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v7"/><path d="M18 10h3a2 2 0 0 1 2 2v10"/><path d="M9 14h2"/></svg>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{t("savings.diesel")}</span>
            </div>
            <span className="text-sm font-black text-slate-700 tabular-nums">{diesel}L</span>
          </div>
        )}
      </div>
    </div>
  );
}
