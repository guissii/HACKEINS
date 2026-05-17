import { useState, useEffect } from "react";
import { useI18n } from "../i18n";

const Icons = {
  frost: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2v20M2 12h20M19 5l-14 14M5 5l14 14M16.5 16.5l-2.5-2.5M7.5 7.5l2.5 2.5M16.5 7.5l-2.5 2.5M7.5 16.5l2.5-2.5" /></svg>,
  heavy_rain: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242M8 19v1M8 14v1M16 19v1M16 14v1M12 21v1M12 16v1" /></svg>,
  extreme_heat: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/><path d="M12 11v1" /></svg>,
  high_wind: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.8 19.6A2 2 0 1 0 14 16H2M17.5 8a2.5 2.5 0 1 1 2 4H2M9.8 4.4A2 2 0 1 1 11 8H2" /></svg>,
  critical_humidity: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" /></svg>,
  ai: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>,
  alert: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m10.065 8 1.48-3.6A2 2 0 0 1 15 5.5V11h4.5a2 2 0 0 1 1.63 3.16L14.36 21.6A2 2 0 0 1 11 20.5V14H6.5a2 2 0 0 1-1.63-3.16L8.5 4.4"/></svg>
};

const SEVERITY_STYLE = {
  high: { border: "border-red-200/80", bg: "bg-red-50/50", text: "text-red-700", dot: "bg-red-500", icon: "text-red-600" },
  medium: { border: "border-amber-200/80", bg: "bg-amber-50/50", text: "text-amber-700", dot: "bg-amber-500", icon: "text-amber-600" },
  low: { border: "border-sky-200/80", bg: "bg-sky-50/50", text: "text-sky-700", dot: "bg-sky-500", icon: "text-sky-600" },
};

function maxSeverity(a, b) {
  const rank = { high: 3, medium: 2, low: 1 };
  return (rank[a] || 0) >= (rank[b] || 0) ? a : b;
}

export default function WeatherWidget({ farm, alerts = [] }) {
  const { lang, t } = useI18n();
  const isAr = lang === "ar";
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  const lat = farm?.lat ?? 30.4202;
  const lon = farm?.lon ?? -8.5863;
  const regionName = farm?.region ? farm.region : "Agadir (Souss-Massa)";

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Africa%2FCasablanca`
        );
        const data = await res.json();
        setWeather({
          currentTemp: data.current.temperature_2m,
          humidity: data.current.relative_humidity_2m,
          wind: data.current.wind_speed_10m,
          feelsLike: data.current.apparent_temperature,
          precipitation: data.current.precipitation,
          maxTemp: data.daily.temperature_2m_max[0],
          minTemp: data.daily.temperature_2m_min[0],
          precipSum: data.daily.precipitation_sum[0],
        });
      } catch (err) {
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, [lat, lon]);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm h-full flex flex-col items-center justify-center p-10 min-h-[400px]">
        <Icons.ai className="w-8 h-8 text-indigo-400 animate-pulse mb-4" />
        <div className="text-slate-500 text-sm font-medium tracking-wide">
          {isAr ? "جاري تحليل الطقس بالذكاء الاصطناعي..." : "Running AI weather synthesis..."}
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const derived = [];
  if (weather.maxTemp >= 40) derived.push({ type: "extreme_heat", severity: "high", message: isAr ? "حرارة قوية متوقعة اليوم." : "Extreme heat expected today." });
  else if (weather.maxTemp >= 35) derived.push({ type: "extreme_heat", severity: "medium", message: isAr ? "حرارة مرتفعة اليوم." : "High heat expected today." });

  if (weather.minTemp <= 2) derived.push({ type: "frost", severity: "high", message: isAr ? "خطر البرد فالليل." : "Frost risk overnight." });
  else if (weather.minTemp <= 5) derived.push({ type: "frost", severity: "low", message: isAr ? "برد خفيف ممكن فالليل." : "Cool night expected." });

  if (weather.precipSum >= 20) derived.push({ type: "heavy_rain", severity: "high", message: isAr ? "شتا قوية فـ 24 ساعة." : "Heavy rain possible within 24h." });
  else if (weather.precipSum >= 8) derived.push({ type: "heavy_rain", severity: "medium", message: isAr ? "شتا متوسطة فـ 24 ساعة." : "Moderate rain possible within 24h." });

  if (weather.wind >= 35) derived.push({ type: "high_wind", severity: "high", message: isAr ? "رياح قوية اليوم." : "Strong wind expected today." });
  else if (weather.wind >= 25) derived.push({ type: "high_wind", severity: "medium", message: isAr ? "رياح متوسطة اليوم." : "Moderate wind expected today." });

  if (weather.humidity <= 20) derived.push({ type: "critical_humidity", severity: "medium", message: isAr ? "رطوبة ضعيفة — تبخر عالي." : "Low humidity — higher evaporation." });

  // Moroccan Context Specific Alerts
  if (weather.wind >= 30 && weather.humidity <= 30 && weather.maxTemp >= 35) {
    derived.push({ 
      type: "extreme_heat", 
      severity: "high", 
      message: isAr ? "تنبيه رياح الشرقي: جفاف شديد، تبخر سريع. ينصح بالسقي العاجل." : "Chergui Wind Alert: Extremely dry and hot. Very high evapotranspiration. Urgent irrigation advised." 
    });
  }
  
  if (weather.precipSum === 0 && weather.maxTemp >= 30 && farm?.region === "Souss-Massa") {
    derived.push({
      type: "critical_humidity",
      severity: "medium",
      message: isAr ? "خطر الإجهاد المائي (Souss-Massa): لا أمطار مع حرارة مرتفعة، راقب رطوبة التربة." : "Hydric Stress Risk (Souss-Massa): Zero precipitation and high heat. Monitor soil moisture closely."
    });
  }

  const mergedByType = new Map();
  for (const a of [...alerts, ...derived]) {
    if (!a?.type) continue;
    const existing = mergedByType.get(a.type);
    if (!existing) mergedByType.set(a.type, a);
    else {
      const nextSeverity = maxSeverity(existing.severity, a.severity);
      mergedByType.set(a.type, { ...existing, ...a, severity: nextSeverity });
    }
  }

  const mergedAlerts = Array.from(mergedByType.values()).sort((a, b) => {
    const rank = { high: 3, medium: 2, low: 1 };
    return (rank[b.severity] || 0) - (rank[a.severity] || 0);
  });

  const riskScore = Math.min(
    100,
    Math.round(
      (weather.precipSum >= 20 ? 40 : weather.precipSum >= 8 ? 20 : 0) +
      (weather.maxTemp >= 40 ? 35 : weather.maxTemp >= 35 ? 20 : 0) +
      (weather.wind >= 35 ? 20 : weather.wind >= 25 ? 10 : 0) +
      (weather.minTemp <= 2 ? 25 : 0)
    )
  );

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden h-full flex flex-col relative group">
      {/* Top AI Gradient Indicator */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 opacity-80" />

      {/* Header */}
      <div className="px-6 pt-6 pb-5 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Icons.ai className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm uppercase tracking-widest text-slate-800 font-extrabold">
                {isAr ? "ذكاء الطقس" : "Weather Intelligence"}
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {isAr ? "تقييم المخاطر لـ 48 ساعة الجاية المدعوم بالذكاء الاصطناعي" : "AI-driven risk scan & hyper-local forecast"}
            </p>
          </div>
            <div className={`flex flex-col gap-2.5 ${isAr ? "items-start" : "items-end"}`}>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100/80 text-slate-700 text-[10px] font-bold rounded-md border border-slate-200/60 ${isAr ? "" : "uppercase tracking-wider"}`}>
                <svg className="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                {regionName}
              </div>
              <div className={`flex items-center gap-2.5 ${isAr ? "flex-row-reverse" : ""}`}>
                <div className={`text-[10px] font-bold text-slate-400 ${isAr ? "" : "uppercase tracking-wider"}`}>{isAr ? "المخاطر" : "Risk"}</div>
              <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                 <div className={`h-full transition-all duration-1000 ${riskScore >= 70 ? "bg-red-500" : riskScore >= 40 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${riskScore}%` }} />
              </div>
              <div className={`text-[10px] font-extrabold ${riskScore >= 70 ? "text-red-600" : riskScore >= 40 ? "text-amber-600" : "text-emerald-600"}`}>
                {riskScore}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 xl:grid-cols-12 gap-8 flex-1">
        {/* Left Column: Current Weather & AI Synthesis */}
        <div className="xl:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-end gap-4 mb-6">
              <div className="text-6xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">
                {Math.round(weather.currentTemp)}°
              </div>
              <div className="pb-1">
                <div className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mb-0.5">
                  <svg className="w-3.5 h-3.5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                  {Math.round(weather.maxTemp)}°
                  <span className="text-slate-300 mx-0.5">|</span>
                  <svg className="w-3.5 h-3.5 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  {Math.round(weather.minTemp)}°
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {isAr ? `كتحس بحال ${Math.round(weather.feelsLike)}°` : `Feels like ${Math.round(weather.feelsLike)}°`}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: isAr ? "الرطوبة" : "Humidity", value: `${weather.humidity}%`, icon: <Icons.critical_humidity className="w-4 h-4 text-sky-500" /> },
                { label: isAr ? "الرياح" : "Wind", value: `${Math.round(weather.wind)}`, unit: "km/h", icon: <Icons.high_wind className="w-4 h-4 text-slate-500" /> },
                { label: isAr ? "الشتا" : "Rain", value: `${Math.round(weather.precipSum)}`, unit: "mm", icon: <Icons.heavy_rain className="w-4 h-4 text-indigo-500" /> }
              ].map((item, i) => (
                <div key={i} className="bg-slate-50/80 border border-slate-100 rounded-xl p-3 flex flex-col items-center justify-center text-center transition-colors hover:bg-slate-50">
                  <div className="mb-2">{item.icon}</div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">{item.label}</div>
                  <div className="text-sm font-extrabold text-slate-900">
                    {item.value}
                    {item.unit && <span className="text-xs text-slate-500 font-bold ml-0.5">{item.unit}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-xl p-5 relative overflow-hidden shadow-md">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-indigo-300 font-bold">{isAr ? "تحليل الذكاء الاصطناعي" : "AI Synthesis"}</span>
            </div>
            
            <p className="text-sm text-slate-200 leading-relaxed font-medium relative z-10">
              {isAr
                ? `اليوم: ${Math.round(weather.maxTemp)}° كحد أقصى و ${Math.round(weather.minTemp)}° كحد أدنى. الشتا المتوقعة ~${Math.round(weather.precipSum)}mm. الرياح ${Math.round(weather.wind)} km/h والرطوبة ${Math.round(weather.humidity)}%.`
                : `High of ${Math.round(weather.maxTemp)}° with a low of ${Math.round(weather.minTemp)}°. Precipitation expected around ${Math.round(weather.precipSum)}mm. Wind conditions at ${Math.round(weather.wind)} km/h, humidity at ${Math.round(weather.humidity)}%.`}
            </p>
          </div>
        </div>

        {/* Right Column: Alerts */}
        <div className="xl:col-span-7 flex flex-col">
          <div className={`flex items-center justify-between mb-4 ${isAr ? "flex-row-reverse" : ""}`}>
            <div className={`text-xs text-slate-800 font-bold flex items-center gap-2 ${isAr ? "" : "uppercase tracking-widest"}`}>
              <Icons.alert className="w-4 h-4 text-slate-400" />
              {isAr ? "تنبيهات نشطة" : "Active Alerts"}
            </div>
            <div className={`text-[10px] font-bold px-2 py-1 rounded border border-slate-200 text-slate-500 bg-slate-50 ${isAr ? "" : "uppercase tracking-wider"}`}>
              {mergedAlerts.length} {isAr ? "بنود" : "Detected"}
            </div>
          </div>

          <div className="flex-1">
            {mergedAlerts.length === 0 ? (
              <div className="h-full min-h-[220px] flex flex-col items-center justify-center bg-slate-50/50 border border-slate-200/60 border-dashed rounded-xl p-8 text-center">
                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 border border-slate-100">
                   <svg className="w-6 h-6 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <p className="text-sm font-bold text-slate-800">{isAr ? "الأمور مستقرة" : "Conditions are optimal"}</p>
                <p className="text-xs text-slate-500 mt-1.5 font-medium">{isAr ? "ما كايناش مخاطر كبيرة دابا." : "No significant weather risks detected."}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mergedAlerts.map((a, i) => {
                  const s = SEVERITY_STYLE[a.severity] || SEVERITY_STYLE.low;
                  const Icon = Icons[a.type] || Icons.ai;
                  
                  const severityTranslations = {
                    high: isAr ? "عالي" : "HIGH",
                    medium: isAr ? "متوسط" : "MEDIUM",
                    low: isAr ? "منخفض" : "LOW"
                  };
                  
                  // Translate known mock messages from decision_engine
                  let displayMessage = a.message;
                  if (isAr) {
                    if (displayMessage.includes("Soil moisture declining 7 days straight")) {
                      displayMessage = "تراجع رطوبة التربة لـ 7 أيام متتالية";
                    } else if (displayMessage.includes("NDVI dropped 0.09 in a week — vegetation under stress")) {
                      displayMessage = "انخفاض NDVI بـ 0.09 في أسبوع — النباتات تحت ضغط";
                    }
                  }

                  return (
                    <div
                      key={`${a.type}-${i}`}
                      className={`group flex items-start gap-4 rounded-xl border ${s.border} ${s.bg} px-4 py-3.5 transition-all hover:shadow-md hover:-translate-y-0.5 duration-200`}
                      dir={isAr ? "rtl" : "ltr"}
                    >
                      <div className={`w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 border ${s.border}`}>
                        <Icon className={`w-5 h-5 ${s.icon}`} />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="text-sm font-bold text-slate-900 truncate capitalize">
                            {t(`alert.${a.type}`) === `alert.${a.type}` ? a.type.replaceAll("_", " ") : t(`alert.${a.type}`)}
                          </div>
                          <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold px-2 py-0.5 rounded border ${s.border} ${s.text} bg-white shadow-sm ${isAr ? "tracking-normal" : "uppercase tracking-widest"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot} ${a.severity === 'high' ? 'animate-pulse' : ''}`} />
                            {severityTranslations[a.severity] || a.severity}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 font-medium leading-relaxed">
                          {displayMessage}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

