import { useI18n } from "../i18n";

export function SectionHeader({ icon, title, subtitle, right }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-200/60 pb-5 mb-2">
      <div className="flex items-center gap-3.5">
        {icon && (
          <div className="w-12 h-12 rounded-full bg-white border border-slate-200/80 shadow-sm flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">{title}</h2>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">{subtitle}</p>
        </div>
      </div>
      {right}
    </div>
  );
}

export function ProfileRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100/50 py-2 last:border-0">
      <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{label}</span>
      <span className="text-sm font-bold text-slate-800">{value}</span>
    </div>
  );
}

export function StepItem({ n, text }) {
  return (
    <div className="flex items-start gap-3.5 group">
      <span className="w-7 h-7 rounded-full bg-slate-50 text-slate-400 border border-slate-200/80 text-[10px] font-black tracking-widest flex items-center justify-center shrink-0 shadow-sm group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-600 transition-colors duration-300">
        {n}
      </span>
      <div className="text-sm font-medium text-slate-600 leading-relaxed pt-0.5">{text}</div>
    </div>
  );
}

export function OverrideBanner({ overrides }) {
  const { t } = useI18n();
  const entries = Object.entries(overrides || {});
  if (!entries.length) return null;
  return (
    <div className="bg-amber-50/50 backdrop-blur-md rounded-2xl border border-amber-200/80 p-5 shadow-sm group hover:shadow-md transition-shadow relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none transition-transform group-hover:scale-110 duration-700" />
      
      <div className="flex items-center gap-2 mb-3 relative z-10">
        <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <div className="text-[10px] uppercase tracking-widest text-amber-700 font-extrabold">{t("override.title")}</div>
      </div>
      
      <ul className="space-y-2 relative z-10">
        {entries.map(([field, info]) => (
          <li key={field} className="flex items-center gap-2.5 bg-white/60 p-2 rounded-lg border border-amber-100/50">
            <span className="font-mono text-[10px] bg-amber-100/80 text-amber-800 px-2 py-0.5 rounded shadow-sm font-bold uppercase tracking-wider">
              {field}
            </span>
            <svg className="w-3 h-3 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            <span className="text-xs font-bold text-slate-800">{info.text}</span>
            <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-widest text-amber-600 font-bold ms-auto bg-amber-50 px-2 py-1 rounded-md border border-amber-200/50">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {info.hours_left} {t("override.hours_left")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
