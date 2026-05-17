import { useState } from "react";
import { useI18n } from "../i18n";

export default function FarmList({ farms, analyses, selectedId, onSelect, onAddFarm, className = "" }) {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const filtered = farms.filter((f) => `${f.farmer_name} ${f.region} ${f.parcel_name} ${f.crop}`.toLowerCase().includes(q.trim().toLowerCase()));
  const DOT = { IRRIGATE: "bg-indigo-500", WAIT: "bg-amber-500", SKIP: "bg-emerald-500" };

  return (
    <div className={`bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-sm rounded-2xl flex flex-col overflow-hidden ${className}`}>
      <div className="p-4 sm:p-5 border-b border-slate-100/60 flex items-center justify-between gap-2 bg-gradient-to-r from-slate-50/50 to-white/50">
        <div className="text-xs uppercase tracking-widest text-slate-700 font-extrabold">{t("dash.farms_title")}</div>
        <button type="button" onClick={onAddFarm}
          className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md border border-emerald-200/80 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80 hover:-translate-y-0.5 transition-all shadow-sm flex items-center gap-1.5">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          {t("dash.add_farm")}
        </button>
      </div>
      <div className="px-4 py-3 border-b border-slate-100/60 bg-slate-50/30">
        <div className="relative">
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("dash.search_farms")}
            className="w-full bg-white border border-slate-200/80 rounded-lg pl-9 pr-3 py-2 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto light-scroll p-2">
        {filtered.map((f) => {
          const action = analyses[f.id]?.decision?.action;
          const dotCls = DOT[action] || "bg-slate-300";
          const sel = selectedId === f.id;
          return (
            <button key={f.id} onClick={() => onSelect(f.id)}
              className={`w-full text-start px-4 py-3.5 mb-1 transition-all duration-200 rounded-xl ${sel ? "bg-emerald-50/80 border border-emerald-200/60 shadow-sm" : "hover:bg-slate-50 border border-transparent"}`}>
              <div className="flex items-center gap-3.5">
                <span className={`w-2.5 h-2.5 rounded-full ${dotCls} shrink-0 shadow-sm ${sel ? 'ring-2 ring-emerald-500/20 ring-offset-2' : ''}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className={`font-extrabold text-sm truncate ${sel ? "text-emerald-900" : "text-slate-800"}`}>{f.parcel_name}</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 shrink-0 border border-slate-200/60 bg-white px-1.5 py-0.5 rounded shadow-sm">{action ? t(`decision.${action}`) : "…"}</span>
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 truncate flex items-center gap-1.5">
                    <span className="truncate">{f.farmer_name}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>{t(f.crop)}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="font-bold">{f.area_hectares} {t("farm.area")}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && <div className="p-8 text-sm text-slate-500 font-medium text-center">{t("dash.no_farms")}</div>}
      </div>
    </div>
  );
}
