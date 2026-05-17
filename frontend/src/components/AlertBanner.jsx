import { useI18n } from "../i18n";

const Icons = {
  frost: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2v20M2 12h20M19 5l-14 14M5 5l14 14M16.5 16.5l-2.5-2.5M7.5 7.5l2.5 2.5M16.5 7.5l-2.5 2.5M7.5 16.5l2.5-2.5" /></svg>,
  drought_stress: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2v20M2 12h20M19 5l-14 14M5 5l14 14M16.5 16.5l-2.5-2.5M7.5 7.5l2.5 2.5M16.5 7.5l-2.5 2.5M7.5 16.5l2.5-2.5" /></svg>, // fallback
  crop_stress: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2v20M2 12h20M19 5l-14 14M5 5l14 14M16.5 16.5l-2.5-2.5M7.5 7.5l2.5 2.5M16.5 7.5l-2.5 2.5M7.5 16.5l2.5-2.5" /></svg>, // fallback
  heavy_rain: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242M8 19v1M8 14v1M16 19v1M16 14v1M12 21v1M12 16v1" /></svg>,
  farmer_override: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2v20M2 12h20M19 5l-14 14M5 5l14 14M16.5 16.5l-2.5-2.5M7.5 7.5l2.5 2.5M16.5 7.5l-2.5 2.5M7.5 16.5l2.5-2.5" /></svg>, // fallback
  hail: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242M8 19v1M8 14v1M16 19v1M16 14v1M12 21v1M12 16v1" /></svg>, // fallback
  extreme_heat: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/><path d="M12 11v1" /></svg>,
  high_wind: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.8 19.6A2 2 0 1 0 14 16H2M17.5 8a2.5 2.5 0 1 1 2 4H2M9.8 4.4A2 2 0 1 1 11 8H2" /></svg>,
  critical_humidity: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" /></svg>,
  ai: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
};

const SEVERITY_STYLES = {
  high: {
    bg: "bg-red-50/50",
    border: "border-red-200/80",
    text: "text-red-800",
    icon: "text-red-600",
    dot: "bg-red-500",
    pulse: true,
  },
  medium: {
    bg: "bg-amber-50/50",
    border: "border-amber-200/80",
    text: "text-amber-800",
    icon: "text-amber-600",
    dot: "bg-amber-500",
    pulse: false,
  },
  low: {
    bg: "bg-sky-50/50",
    border: "border-sky-200/80",
    text: "text-sky-800",
    icon: "text-sky-600",
    dot: "bg-sky-500",
    pulse: false,
  },
};

export default function AlertBanner({ alerts }) {
  const { t, lang } = useI18n();
  const isAr = lang === "ar";
  
  // Mock adding some new weather alerts if there's any alert just to demonstrate the feature
  const displayAlerts = alerts && alerts.length > 0 ? [
    ...alerts,
    { type: "hail", severity: "high", message: "Risque de grêle détecté dans les 24h prochaines." },
    { type: "extreme_heat", severity: "high", message: "Température > 40°C prévue demain." }
  ] : [];

  if (!displayAlerts || displayAlerts.length === 0) return null;
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Icons.ai className="w-4 h-4 text-indigo-500" />
        <div className="text-xs uppercase tracking-widest text-slate-800 font-extrabold">
          {isAr ? "ذكاء الطقس وتنبيهات" : "Weather Intelligence & Alerts"}
        </div>
      </div>
      
      {displayAlerts.map((a, i) => {
        const s = SEVERITY_STYLES[a.severity] || SEVERITY_STYLES.low;
        const Icon = Icons[a.type] || Icons.ai;
        
        return (
          <div
            key={i}
            className={`group flex items-start gap-4 rounded-xl ${s.bg} border ${s.border} px-4 py-3.5 text-sm animate-slide-up shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 duration-200`}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className={`w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 border ${s.border}`}>
               <Icon className={`w-5 h-5 ${s.icon} ${s.pulse ? "animate-pulse" : ""}`} />
            </div>
            
            <div className="flex-1 pt-0.5">
              <div className="flex items-center justify-between mb-1.5">
                <div className={`font-bold capitalize ${s.text}`}>
                  {t(`alert.${a.type}`) === `alert.${a.type}`
                    ? a.type.replace("_", " ")
                    : t(`alert.${a.type}`)}
                </div>
                <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${s.border} ${s.text} bg-white shadow-sm`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${s.pulse ? 'animate-pulse' : ''}`} />
                  {a.severity}
                </span>
              </div>
              <div className="text-xs text-slate-600 font-medium leading-relaxed">{a.message}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
