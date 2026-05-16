// Tiny zero-dependency i18n.
//
// Usage:
//   import { useI18n } from "./i18n";
//   const { t, lang, setLang } = useI18n();
//   <h1>{t("dashboard.title")}</h1>
//
// Language is persisted to localStorage so it survives reloads.
// When lang === "ar", document.dir is flipped to "rtl" (handled in App).

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const STRINGS = {
  // Header
  "app.name":                  { en: "Filaha AI",                                ar: "فلاحة AI" },
  "app.tagline":               { en: "Irrigation intelligence for Moroccan farmers", ar: "ذكاء السقي لفلاحة المغرب" },
  "app.event":                 { en: "Hack AI · Rural World 2026",               ar: "Hack AI · العالم القروي 2026" },
  "lang.toggle":               { en: "العربية",                                  ar: "English" },

  // States
  "state.loading_farms":       { en: "Loading farms…",                           ar: "كنحملو الضيعات…" },
  "state.select_farm":         { en: "Select a farm on the map",                 ar: "اختار ضيعة من الخريطة" },
  "state.backend_error":       { en: "Backend error",                            ar: "خطأ في الخادم" },
  "state.backend_hint":        { en: "Is FastAPI running on :8765?",             ar: "واش FastAPI خدام على :8765؟" },

  // Farm header
  "farm.area":                 { en: "ha",                                       ar: "هكتار" },

  // Decision widget
  "decision.IRRIGATE":         { en: "IRRIGATE NOW",                             ar: "سقي دابا" },
  "decision.WAIT":             { en: "WAIT — RAIN COMING",                       ar: "تسنى — الشتا جاية" },
  "decision.SKIP":             { en: "SOIL IS GOOD",                             ar: "الأرض مزيانة" },
  "decision.duration":         { en: "Duration",                                 ar: "المدة" },
  "decision.water":            { en: "Water",                                    ar: "الماء" },
  "decision.unit_min":         { en: "min",                                      ar: "دقيقة" },
  "decision.unit_m3":          { en: "m³",                                       ar: "م³" },
  "decision.et0_today":        { en: "Today's water demand (ET₀)",               ar: "طلب الماء اليوم (ET₀)" },

  // KPI cards
  "kpi.ndvi.title":            { en: "Crop health (NDVI)",                       ar: "صحة الزرع (NDVI)" },
  "kpi.ndvi.explain":          { en: "0 = bare soil, 1 = dense vegetation",      ar: "0 = أرض جرداء، 1 = نبات كثيف" },
  "kpi.soil.title":            { en: "Soil moisture",                            ar: "رطوبة التربة" },
  "kpi.soil.threshold":        { en: "threshold",                                ar: "العتبة" },
  "kpi.rain.title":            { en: "Rain probability (48h)",                   ar: "احتمال الشتا (48س)" },
  "kpi.temp.title":            { en: "Temperature",                              ar: "درجة الحرارة" },
  "kpi.temp.range":            { en: "min / max",                                ar: "الأدنى / الأقصى" },
  "kpi.et0.title":             { en: "Water demand (ET₀)",                       ar: "طلب الماء (ET₀)" },
  "kpi.was_week_ago":          { en: "was {value} 7 days ago",                   ar: "كانت {value} قبل 7 أيام" },

  // Water savings
  "savings.title":             { en: "Water saved today",                        ar: "الماء اللي وفرنا اليوم" },
  "savings.vs":                { en: "less than scheduled irrigation",           ar: "أقل من السقي المجدول" },

  // Trend
  "trend.title":               { en: "Soil moisture trend (last 7 days)",        ar: "تطور رطوبة التربة (7 أيام)" },
  "trend.unit":                { en: "% saturation",                             ar: "% تشبع" },

  // Alerts
  "alert.frost":               { en: "Frost",                                    ar: "البرد" },
  "alert.drought_stress":      { en: "Drought stress",                           ar: "إجهاد جفاف" },
  "alert.crop_stress":         { en: "Crop stress",                              ar: "إجهاد الزرع" },
  "alert.heavy_rain":          { en: "Heavy rain",                               ar: "شتا قوية" },
  "alert.farmer_override":     { en: "Farmer override active",                   ar: "تعديل من الفلاح مفعّل" },

  // Override banner
  "override.title":            { en: "Farmer overrides active",                  ar: "تعديلات الفلاح مفعّلة" },
  "override.hours_left":       { en: "h left",                                   ar: "س متبقية" },

  // WhatsApp panel
  "wa.subtitle_online":        { en: "online",                                   ar: "متصل" },
  "wa.source_live":            { en: "Gemini live",                              ar: "Gemini مباشر" },
  "wa.source_demo":            { en: "Demo mode",                                ar: "وضع تجريبي" },
  "wa.placeholder":            { en: "Ask, or correct the AI (Darija/French/Arabic)…", ar: "سول، ولا صحح الذكاء الاصطناعي…" },
  "wa.send":                   { en: "Send",                                     ar: "ارسل" },
  "wa.updated":                { en: "Updated",                                  ar: "تم التحديث" },
  "wa.help_learn":             { en: "help us learn",                            ar: "ساعدنا نتعلمو" },
  "wa.attach_label":           { en: "Attach a photo of your plant for AI diagnosis (coming soon)", ar: "ضيف تصويرة ديال الزرع للتشخيص (قريبا)" },
  "wa.voice_label":            { en: "Send a voice note in Darija (coming soon — for illiterate farmers)", ar: "صيفط نوط صوتية بالدارجة (قريبا — للفلاحين اللي ما كيقراوش)" },

  // Farm list
  "list.region":               { en: "Region",                                   ar: "الجهة" },
};

const LangContext = createContext({ lang: "en", setLang: () => {}, t: (k) => k });

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem("filaha.lang") || "en"; } catch { return "en"; }
  });
  const setLang = useCallback((l) => {
    setLangState(l);
    try { localStorage.setItem("filaha.lang", l); } catch {}
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);
  const t = useCallback((key, vars) => {
    const entry = STRINGS[key];
    if (!entry) return key;
    let s = entry[lang] || entry.en || key;
    if (vars) for (const k in vars) s = s.replace(`{${k}}`, vars[k]);
    return s;
  }, [lang]);
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useI18n() {
  return useContext(LangContext);
}
