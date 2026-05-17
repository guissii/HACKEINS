import { useI18n } from "../i18n";

const Icons = {
  irrigate: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2v20M2 12h20M19 5l-14 14M5 5l14 14M16.5 16.5l-2.5-2.5M7.5 7.5l2.5 2.5M16.5 7.5l-2.5 2.5M7.5 16.5l2.5-2.5" /></svg>,
  wait: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  skip: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 6 9 17l-5-5"/></svg>,
};

const STYLE = {
  IRRIGATE: {
    bg: "bg-indigo-50/50",
    border: "border-indigo-200/80",
    accent: "text-indigo-700",
    badge: "bg-indigo-600 text-white shadow-indigo-500/20",
    glow: "bg-indigo-500/10",
    icon: <Icons.irrigate className="w-8 h-8 text-indigo-500" />
  },
  WAIT: {
    bg: "bg-amber-50/50",
    border: "border-amber-200/80",
    accent: "text-amber-700",
    badge: "bg-amber-500 text-white shadow-amber-500/20",
    glow: "bg-amber-500/10",
    icon: <Icons.wait className="w-8 h-8 text-amber-500" />
  },
  SKIP: {
    bg: "bg-emerald-50/50",
    border: "border-emerald-200/80",
    accent: "text-emerald-700",
    badge: "bg-emerald-500 text-white shadow-emerald-500/20",
    glow: "bg-emerald-500/10",
    icon: <Icons.skip className="w-8 h-8 text-emerald-500" />
  },
};

export default function DecisionWidget({ decision }) {
  const { t } = useI18n();
  if (!decision) return null;
  const s = STYLE[decision.action] || STYLE.SKIP;
  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${s.bg} border ${s.border} p-6 transition-all duration-500 animate-fade-in shadow-sm h-full flex flex-col justify-between group`}
    >
      <div className={`absolute -right-10 -top-10 w-40 h-40 ${s.glow} rounded-full blur-3xl pointer-events-none transition-transform group-hover:scale-110 duration-700`} />
      
      <div>
        <div className="flex items-start justify-between relative z-10">
          <span
            className={`inline-flex items-center gap-1.5 ${s.badge} text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded border border-white/20 shadow-sm`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
            {t(`decision.${decision.action}`)}
          </span>
          <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100/50">
            {s.icon}
          </div>
        </div>

        {decision.action === "IRRIGATE" && (
          <>
            <div className="mt-6 grid grid-cols-2 gap-4 relative z-10">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">
                  {t("decision.duration")}
                </div>
                <div className={`text-4xl font-black ${s.accent} tracking-tighter tabular-nums`}>
                  {decision.irrigation_minutes}
                  <span className="text-xs font-bold text-slate-400 ms-1 tracking-normal">
                    {t("decision.unit_min")}
                  </span>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">
                  {t("decision.water")}
                </div>
                <div className={`text-4xl font-black ${s.accent} tracking-tighter tabular-nums`}>
                  {(decision.irrigation_liters / 1000).toFixed(1)}
                  <span className="text-xs font-bold text-slate-400 ms-1 tracking-normal">
                    {t("decision.unit_m3")}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 relative z-10 flex gap-3">
              <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all rounded-xl py-3 text-sm font-extrabold flex items-center justify-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                {t("action.execute") || "EXECUTE ORDER"}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-slate-200/50 relative z-10 flex items-center justify-between">
        <div className="text-xs text-slate-500 font-medium">
          {t("decision.et0_today")}
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200/60 rounded text-xs font-bold text-slate-700 shadow-sm">
          {decision.et0_mm} mm
        </div>
      </div>
    </div>
  );
}
