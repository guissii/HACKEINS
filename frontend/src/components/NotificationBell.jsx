import { useState, useRef, useEffect } from "react";
import { useI18n } from "../i18n";

export default function NotificationBell({ farms = [], analyses = {}, onSelectFarm }) {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  
  // Close when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Compute critical alerts across all farms
  const notifications = [];
  
  for (const farm of farms) {
    const analysis = analyses[farm.id];
    if (!analysis?.decision) continue;
    
    // Backend alerts
    if (analysis.decision.alerts) {
      for (const alert of analysis.decision.alerts) {
        if (alert.severity === "high" || alert.severity === "medium") {
          let msg = alert.message;
          if (lang === "ar") {
            if (alert.type === "frost") msg = "🥶 خطر الصقيع (الجريحة) الليلة!";
            else if (alert.type === "heavy_rain") msg = "🌧️ أمطار غزيرة متوقعة، يُنصح بتأجيل السقي";
            else if (alert.type === "drought_stress") msg = "⚠️ انخفاض رطوبة التربة لـ 7 أيام متتالية";
            else if (alert.type === "crop_stress") msg = "🥀 انخفاض في مؤشر الغطاء النباتي (NDVI)، المحصول تحت الإجهاد";
          } else {
            // Provide English fallback icons and clean text if needed
            if (alert.type === "frost") msg = "🥶 Frost risk tonight!";
            else if (alert.type === "heavy_rain") msg = "🌧️ Heavy rain expected, skip irrigation";
            else if (alert.type === "drought_stress") msg = "⚠️ Soil moisture declining for 7 days";
            else if (alert.type === "crop_stress") msg = "🥀 NDVI drop detected, crop under stress";
          }
          notifications.push({
            farm,
            type: alert.type,
            severity: alert.severity,
            message: msg
          });
        }
      }
    }
    
    // Frontend weather alerts (Chergui, Heat, etc)
    const weather = farm.weather;
    if (weather) {
      if (weather.temp_max_c >= 40) notifications.push({ farm, type: "extreme_heat", severity: "high", message: lang === "ar" ? "حرارة قوية متوقعة اليوم." : "Extreme heat expected today." });
      if (weather.wind_kmh >= 30 && weather.humidity_pct <= 30 && weather.temp_max_c >= 35) {
        notifications.push({ farm, type: "extreme_heat", severity: "high", message: lang === "ar" ? "تنبيه رياح الشرقي: جفاف شديد، تبخر سريع." : "Chergui Wind Alert: Extremely dry and hot." });
      }
      if (weather.rain_prob_24h === 0 && weather.temp_max_c >= 30 && farm.region === "Souss-Massa") {
        notifications.push({ farm, type: "critical_humidity", severity: "medium", message: lang === "ar" ? "خطر الإجهاد المائي (سوس ماسة)" : "Hydric Stress Risk (Souss-Massa)" });
      }
    }
  }

  // ADD A FORCED DEMO ALERT FOR PRESENTATION (ALWAYS SHOWS IN RED)
  if (farms.length > 0) {
    notifications.push({
      farm: farms[0],
      type: "demo_critical",
      severity: "high",
      message: lang === "ar" ? "🚨 عاصفة رعدية قوية متوقعة الليلة. يُنصح بتأجيل السقي لتجنب غمر المحاصيل." : "🚨 Severe thunderstorm expected tonight. Delay irrigation to prevent crop flooding."
    });
  }
  
  // Deduplicate and sort by severity
  const uniqueNotifications = [];
  const seen = new Set();
  for (const n of notifications) {
    const key = `${n.farm.id}-${n.type}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueNotifications.push(n);
    }
  }
  
  uniqueNotifications.sort((a, b) => (a.severity === "high" ? -1 : 1));
  const highCount = uniqueNotifications.filter(n => n.severity === "high").length;

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setOpen(!open)}
        className="relative p-2 text-slate-500 hover:text-slate-800 transition-colors rounded-full hover:bg-slate-100"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
        {uniqueNotifications.length > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm animate-pulse" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-xl overflow-hidden z-50 animate-slide-up origin-top-right">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">
              {lang === "ar" ? "تنبيهات المخاطر" : "Risk Alerts"}
            </h3>
            <span className="text-[9px] font-bold uppercase tracking-widest bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
              {highCount} {lang === "ar" ? "حرجة" : "Critical"}
            </span>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto light-scroll">
            {uniqueNotifications.length === 0 ? (
              <div className="p-6 text-center text-sm font-medium text-slate-500">
                {lang === "ar" ? "لا توجد مخاطر حالياً" : "No risks detected"}
              </div>
            ) : (
              uniqueNotifications.map((n, i) => (
                <button 
                  key={i} 
                  onClick={() => {
                    if (onSelectFarm) onSelectFarm(n.farm.id);
                    setOpen(false);
                  }}
                  className="w-full text-left p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3"
                >
                  <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${n.severity === 'high' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black text-slate-800">{n.farm.parcel_name}</span>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 border border-slate-200 px-1 rounded">{n.farm.region}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-600 leading-snug">{n.message}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
