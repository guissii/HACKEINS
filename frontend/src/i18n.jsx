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
  "app.name":                  { en: "ZiraIA",                                ar: "ZiraIA" },
  "app.tagline":               { en: "Irrigation intelligence for Moroccan farmers", ar: "ذكاء السقي لفلاحة المغرب" },
  "app.event":                 { en: "Hack AI · Rural World 2026",               ar: "Hack AI · العالم القروي 2026" },
  "lang.toggle":               { en: "العربية",                                  ar: "English" },
  "nav.home":                  { en: "Home",                                     ar: "الرئيسية" },
  "nav.project":               { en: "Project",                                  ar: "المشروع" },
  "nav.features":              { en: "Features",                                 ar: "المزايا" },
  "nav.contact":               { en: "Contact",                                  ar: "تواصل" },
  "nav.dashboard":             { en: "Dashboard",                                ar: "لوحة التحكم" },

  "project.kicker":            { en: "Project",                                  ar: "المشروع" },
  "project.title":             { en: "ZiraIA — Complete Project Document",       ar: "ZiraIA — وثيقة المشروع" },
  "project.subtitle":          { en: "One page with the full story: problem, solution, features, workflow, and interfaces.", ar: "صفحة واحدة فيها القصة كاملة: المشكل، الحل، المزايا، سير العمل والواجهات." },
  "project.cta_dashboard":     { en: "Open dashboard",                           ar: "فتح اللوحة" },
  "project.cta_contact":       { en: "Contact / Pilot",                          ar: "تواصل / تجربة" },

  "project.ai_status_title":   { en: "Gemini status",                            ar: "حالة Gemini" },
  "project.ai_ok":             { en: "Connected: Gemini is configured in the backend.", ar: "شغال: Gemini مهيأ فالخادم." },
  "project.ai_missing":        { en: "Not configured: set GEMINI_API_KEY in backend/.env to enable live Darija.", ar: "ما مهيأش: خص GEMINI_API_KEY فـ backend/.env باش تخدم الدارجة مباشرة." },
  "project.ai_unknown":        { en: "Unknown: backend not reachable or status endpoint failed.", ar: "غير معروف: الخادم ما كيتوصلش ولا كاين خطأ." },
  "project.ai_model":          { en: "Model",                                    ar: "الموديل" },
  "project.ai_test":           { en: "Test Gemini (farm #1)",                    ar: "جرب Gemini (الضيعة 1)" },
  "project.ai_testing":        { en: "Testing…",                                 ar: "كنجرب…" },
  "project.ai_test_result":    { en: "AI source",                                ar: "مصدر الذكاء" },

  // States
  "state.loading_farms":       { en: "Loading farms…",                           ar: "كنحملو الضيعات…" },
  "state.select_farm":         { en: "Select a farm on the map",                 ar: "اختار ضيعة من الخريطة" },
  "state.backend_error":       { en: "Backend error",                            ar: "خطأ في الخادم" },
  "state.backend_hint":        { en: "Is FastAPI running on :8765?",             ar: "واش FastAPI خدام على :8765؟" },

  // Farm header
  "farm.area":                 { en: "ha",                                       ar: "هكتار" },

  // Data translations (Backend values)
  "citrus":                    { en: "citrus",                                   ar: "حوامض (ليمون)" },
  "tomato":                    { en: "tomato",                                   ar: "طماطم" },
  "wheat":                     { en: "wheat",                                    ar: "قمح" },
  "olive":                     { en: "olive",                                    ar: "زيتون" },
  "barley":                    { en: "barley",                                   ar: "شعير" },
  "argan":                     { en: "argan",                                    ar: "أركان" },
  
  "Souss-Massa":               { en: "Souss-Massa",                              ar: "سوس ماسة" },
  "Beni Mellal":               { en: "Beni Mellal",                              ar: "بني ملال" },
  "Fes-Meknes":                { en: "Fes-Meknes",                               ar: "فاس مكناس" },
  "Marrakech-Safi":            { en: "Marrakech-Safi",                           ar: "مراكش آسفي" },
  "Oriental":                  { en: "Oriental",                                 ar: "الشرق" },

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
  "kpi.water_level":           { en: "Water Level",                              ar: "مستوى الماء" },
  "kpi.drought_pred":          { en: "Drought Prediction",                       ar: "توقع الجفاف" },
  "kpi.planting_window":       { en: "Optimal Planting Window",                  ar: "وقت الزراعة المناسب" },
  "kpi.yield":                 { en: "Estimated Yield",                          ar: "المحصول المتوقع" },
  "kpi.harvest_date":          { en: "Harvest Date",                             ar: "تاريخ الحصاد" },
  "kpi.losses":                { en: "Possible Losses",                          ar: "الخسائر المحتملة" },
  
  "recommender.title":         { en: "Soil Audit & Recommendations",             ar: "تدقيق التربة والتوصيات" },
  "recommender.crop":          { en: "Recommended Crop",                         ar: "المحصول المنصوح به" },
  "recommender.budget":        { en: "Estimated Budget",                         ar: "الميزانية المتوقعة" },
  "recommender.roi":           { en: "Expected ROI",                             ar: "العائد المتوقع" },
  
  "alert.hail":                { en: "Hail Risk",                                ar: "خطر البرد/التبروري" },
  "alert.extreme_heat":        { en: "Extreme Heat",                             ar: "حرارة مفرطة" },
  "alert.high_wind":           { en: "Dangerous Wind",                           ar: "رياح قوية" },
  "alert.critical_humidity":   { en: "Critical Humidity",                        ar: "رطوبة حرجة" },

  "ai_advisor.title":          { en: "AI Crop Advisor",                          ar: "المستشار الفلاحي (الذكاء الاصطناعي)" },
  "ai_advisor.placeholder":    { en: "e.g. My leaves are turning yellow...",     ar: "مثال: الأوراق ديال الزرع ولاو صفرين..." },
  "ai_advisor.cause":          { en: "Probable Cause",                           ar: "السبب المحتمل" },
  "ai_advisor.diagnosis":      { en: "Diagnosis",                                ar: "التشخيص" },
  "ai_advisor.action":         { en: "Immediate Action",                         ar: "التدخل السريع" },
  "ai_advisor.fertilizer":     { en: "Recommended Fertilizer",                   ar: "السماد المنصوح به" },
  
  "map.dry_zones":             { en: "Dry Zones",                                ar: "مناطق جافة" },
  "map.dead_zones":            { en: "Dead Zones",                               ar: "مناطق ميتة" },
  "map.growth":                { en: "Growth Tracking",                          ar: "تتبع النمو" },
  
  "channels.title":            { en: "Notifications",                            ar: "الإشعارات" },
  "channels.sms":              { en: "SMS",                                      ar: "رسالة قصيرة SMS" },
  "channels.whatsapp":         { en: "WhatsApp",                                 ar: "واتساب" },
  "channels.voice":            { en: "Voice (Darija/Amazigh/FR)",                ar: "رسالة صوتية (دارجة/أمازيغية/فرنسية)" },  "dash.portfolio":            { en: "Cooperative Portfolio",                    ar: "محفظة التعاونية" },
  "dash.total_farms":          { en: "Active farms",                             ar: "ضيعات نشطة" },
  "dash.total_area":           { en: "Total area",                               ar: "المساحة الإجمالية" },
  "dash.total_water":          { en: "Water saved (today)",                      ar: "الماء الموفر (اليوم)" },
  "dash.alerts":               { en: "Active alerts",                            ar: "إنذارات نشطة" },
  "dash.tab_overview":         { en: "Overview",                                 ar: "نظرة عامة" },
  "dash.tab_chat":             { en: "WhatsApp",                                 ar: "واتساب" },
  "dash.farms_title":          { en: "Farms",                                    ar: "الضيعات" },
  "dash.search_farms":         { en: "Search farms…",                            ar: "بحث…" },
  "dash.no_farms":             { en: "No farms match your search.",              ar: "ما كايناش ضيعات بهاد البحث." },
  "dash.select_title":         { en: "Select a farm",                             ar: "اختار ضيعة" },
  "dash.select_hint":          { en: "Select a farm from the list to see decisions.", ar: "اختار ضيعة من اللائحة باش تشوف القرار." },
  "dash.add_farm":             { en: "Add farm",                                 ar: "زيد ضيعة" },
  "dash.local_title":          { en: "Setup required",                            ar: "خاص الإعداد" },
  "dash.local_hint":           { en: "This farm is saved in your dashboard. Connect data sources to enable daily decisions.", ar: "هاد الضيعة محفوظة فلوحتك. خاص ربط البيانات باش يبان القرار اليومي." },
  "dash.profile_title":        { en: "Farm profile",                              ar: "معلومات الضيعة" },
  "dash.profile_farmer":       { en: "Farmer",                                   ar: "الفلاح" },
  "dash.profile_country":      { en: "Country",                                  ar: "البلد" },
  "dash.profile_region":       { en: "Region",                                   ar: "الجهة" },
  "dash.profile_crop":         { en: "Crop",                                     ar: "المحصول" },
  "dash.profile_area":         { en: "Area",                                     ar: "المساحة" },
  "dash.next_steps":           { en: "Next steps",                                ar: "الخطوات الجاية" },
  "dash.step_a":               { en: "Confirm the exact GPS coordinates.",        ar: "أكد إحداثيات GPS." },
  "dash.step_b":               { en: "Choose crop stage and irrigation method.",  ar: "حدد مرحلة الزرع وطريقة السقي." },
  "dash.step_c":               { en: "Enable daily recommendations (no sensors).", ar: "فعل التوصيات اليومية (بلا حساسات)." },
  "dash.local_chat_title":     { en: "WhatsApp setup",                             ar: "إعداد واتساب" },
  "dash.local_chat_hint":      { en: "Messaging will be enabled after setup is complete.", ar: "الرسائل غادي تخدم من بعد الإعداد." },

  "dash.interests.kicker":     { en: "Value drivers",                              ar: "أسباب القيمة" },
  "dash.interests.title":      { en: "What makes this win in Africa & Morocco",    ar: "شنو كيخلّي هاد الحل يربح فالمغرب وإفريقيا" },
  "dash.interests.subtitle":   { en: "Africa needs: water efficiency, lower diesel cost, and trusted decisions — with 100% software rollout.", ar: "احتياجات إفريقيا: اقتصاد فالماء، تقليل ثمن المازوط، وقرارات موثوقة — بحل 100% برمجيات." },
  "dash.interests.persona_farmer":   { en: "Small farmer",                         ar: "فلاح صغير" },
  "dash.interests.persona_investor": { en: "Investor / Business",                  ar: "مستثمر / بيزنس" },
  "dash.interests.kicker_live": { en: "LIVE",                                      ar: "جاهز" },
  "dash.interests.kicker_next": { en: "NEXT",                                      ar: "قريباً" },

  "dash.interests.farmer_1_title": { en: "Multi-channel: WhatsApp, SMS (2G) & Voice", ar: "تعدد القنوات: واتساب، SMS (2G) وصوت" },
  "dash.interests.farmer_1_body":  { en: "Solves connectivity issues. Remote areas get standard SMS or automated IVR calls. Works everywhere, no 4G needed.", ar: "كيحل مشكل الشبكة. المناطق البعيدة كيوصلها SMS عادي ولا مكالمة صوتية. خدام في أي بلاصة، بلا 4G." },
  "dash.interests.farmer_2_title": { en: "Local Calibration (Farmer Feedback)", ar: "معايرة محلية (رأي الفلاح)" },
  "dash.interests.farmer_2_body":  { en: "Solves the micro-climate issue. If the satellite is wrong, the farmer simply replies 'It didn't rain', and the system instantly corrects the local model.", ar: "كيحل مشكل المناخ المحلي. يلا غلظ الساتلايت، الفلاح كيجاوب 'ما طاحتش الشتا'، والنظام كيصحح النموذج ديك الساعة." },
  "dash.interests.farmer_3_title": { en: "Trust & Human-in-the-loop", ar: "الثقة والإنسان فالدورة" },
  "dash.interests.farmer_3_body":  { en: "Solves the trust barrier. The farmer stays in control. The system acts as an advisor that adapts to the farmer's visual observations.", ar: "كيحل مشكل الثقة. الفلاح كيبقى هو المتحكم. النظام كيتصرف كمستشار كيتأقلم مع الملاحظة بالعين ديال الفلاح." },
  "dash.interests.farmer_4_title": { en: "Cooperative support at scale", ar: "دعم للتعاونيات" },
  "dash.interests.farmer_4_body":  { en: "Coops need scale: multi-farm monitoring, training, and safe corrections (expire after 24h) for local reality.", ar: "التعاونيات محتاجة التوسع: مراقبة ضيعات متعددة، تدريب، وتصحيحات آمنة (كتسالي بعد 24س) حسب الواقع." },

  "dash.interests.investor_1_title": { en: "Virtual Sensors (AI Data Fusion)", ar: "حساسات افتراضية (دمج البيانات بالذكاء الاصطناعي)" },
  "dash.interests.investor_1_body":  { en: "No IoT needed. We fuse Sentinel-1 (Radar moisture) + Sentinel-2 (Optical) + ECMWF climate models to generate hyper-precise 'virtual sensors' for every meter of your farm.", ar: "بلا ما تحتاج IoT. كندمجو الرادار والبصريات والطقس باش نصنعو 'حساسات افتراضية' دقيقة لكل ميترو فالضيعة." },
  "dash.interests.investor_2_title": { en: "Digital Labor Management", ar: "إدارة رقمية للعمال" },
  "dash.interests.investor_2_body":  { en: "Instead of expensive smart valves, the system auto-generates digital work orders via WhatsApp for field workers ('Open valve 3 for 40 mins'), ensuring full traceability.", ar: "بلا صمامات غالية، النظام كيصيفط أوامر عمل للعمال عبر واتساب ('حل الفانا 3 لمدة 40 دقيقة') باش يضمن التتبع." },
  "dash.interests.investor_3_title": { en: "AI Super-Resolution Mapping", ar: "خرائط الذكاء الاصطناعي الفائقة" },
  "dash.interests.investor_3_body":  { en: "We use deep learning to artificially upscale 10m public satellite data into 1m hyper-resolution maps, allowing micro-zoning 100% via software.", ar: "كنستعملو الذكاء الاصطناعي باش نرفعو دقة الساتلايت من 10 متر لـ 1 متر، باش نديرو تقسيم دقيق 100% بالبرمجيات." },
  "dash.interests.investor_4_title": { en: "Infinite Scalability", ar: "توسع لا محدود" },
  "dash.interests.investor_4_body":  { en: "Because we have zero hardware, you can instantly add 10,000 hectares across 3 African countries to your dashboard with a single click. Zero logistics.", ar: "بما أننا معندناش عتاد، تقدر تزيد 10.000 هكتار في 3 بلدان إفريقية بضغطة وحدة. صفر لوجستيك." },

  "dash.interests.cta_features": { en: "See full features",                        ar: "شوف المزايا" },
  "dash.interests.cta_contact":  { en: "Request a pilot",                          ar: "طلب تجربة" },

  "form.close":                { en: "Close",                                     ar: "إغلاق" },
  "form.cancel":               { en: "Cancel",                                    ar: "إلغاء" },
  "form.save":                 { en: "Save",                                      ar: "حفظ" },
  "form.note":                 { en: "Saved locally for now.",                    ar: "محفوظ محلياً دابا." },
  "form.scope":                { en: "Morocco & Africa",                          ar: "المغرب وإفريقيا" },
  "form.scope_hint":           { en: "This form accepts farms in Morocco and Africa only.", ar: "هاد الفورم كيقبل غير المغرب وإفريقيا." },
  "form.country":              { en: "Country",                                   ar: "البلد" },
  "form.region":               { en: "Region",                                    ar: "الجهة" },
  "form.region_placeholder":   { en: "State / region",                             ar: "الجهة/المنطقة" },
  "form.farmer":               { en: "Farmer name",                               ar: "اسم الفلاح" },
  "form.parcel":               { en: "Parcel name",                               ar: "اسم القطعة" },
  "form.crop":                 { en: "Crop",                                      ar: "المحصول" },
  "form.area":                 { en: "Area (ha)",                                 ar: "المساحة (هكتار)" },
  "form.coords":               { en: "GPS (lat/lon)",                              ar: "GPS (lat/lon)" },
  "form.coords_hint":          { en: "Africa bounding box enforced.",              ar: "كتطبق حدود إفريقيا." },
  "form.err_farmer":           { en: "Farmer name is required.",                  ar: "خاص اسم الفلاح." },
  "form.err_parcel":           { en: "Parcel name is required.",                  ar: "خاص اسم القطعة." },
  "form.err_region":           { en: "Region is required.",                        ar: "خاص الجهة." },
  "form.err_area":             { en: "Area must be a positive number.",           ar: "المساحة خاصها تكون رقم موجب." },
  "form.err_coords":           { en: "GPS coordinates must be valid numbers.",    ar: "إحداثيات GPS خاصها تكون أرقام." },
  "form.err_africa":           { en: "Coordinates must be inside Africa.",        ar: "الإحداثيات خاصها تكون داخل إفريقيا." },
  
  // Water savings
  "savings.title":             { en: "Water & Energy saved today",               ar: "الماء والطاقة الموفرة اليوم" },
  "savings.vs":                { en: "less than scheduled irrigation",           ar: "أقل من السقي المجدول" },
  "savings.diesel":            { en: "Liters of diesel saved (pump)",            ar: "لترات مازوط موفرة (المضخة)" },


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

  "landing.kicker":            { en: "Decision intelligence",                    ar: "ذكاء القرار" },
  "landing.title":             { en: "Irrigation decisions, explained and auditable.", ar: "قرارات السقي، بشرح واضح وقابل للتدقيق." },
  "landing.subtitle":          { en: "Free weather data + deterministic rules → daily guidance for every farm. AI is only used to communicate in Darija, not to decide how much water to apply.", ar: "بيانات الطقس المجانية + قواعد حتمية → توجيه يومي لكل ضيعة. الذكاء الاصطناعي غير للتواصل بالدارجة، ماشي للحساب." },
  "landing.cta_primary":       { en: "Open dashboard",                           ar: "فتح اللوحة" },
  "landing.cta_secondary":     { en: "See features",                             ar: "شوف المزايا" },
  "landing.bullet1":           { en: "Daily decision per farm: irrigate, wait, or skip.", ar: "قرار يومي لكل ضيعة: سقي، تسنى، ولا بلا سقي." },
  "landing.bullet2":           { en: "Minutes and liters, plus alerts for risky weather.", ar: "دقائق ولترات، مع إنذارات ديال الطقس." },
  "landing.bullet3":           { en: "Map view with KPIs and a 7‑day soil‑moisture trend.", ar: "خريطة مع مؤشرات ومنحنى رطوبة 7 أيام." },
  "landing.bullet4":           { en: "Darija messaging for farmers, with safe fallback mode.", ar: "رسائل بالدارجة للفلاح، مع وضع احتياطي آمن." },
  "landing.metric1_label":     { en: "Water savings",                            ar: "توفير الماء" },
  "landing.metric1_value":     { en: "Daily",                                    ar: "يومي" },
  "landing.metric2_label":     { en: "Explainable",                              ar: "مفهوم" },
  "landing.metric2_value":     { en: "Rule-based",                               ar: "قواعد" },
  "landing.metric3_label":     { en: "Channel",                                  ar: "القناة" },
  "landing.metric3_value":     { en: "WhatsApp + web",                           ar: "واتساب + ويب" },
  "landing.outcomes_title":    { en: "Outcomes",                                 ar: "النتائج" },
  "landing.outcomes_note":     { en: "Open the dashboard to see live decisions.", ar: "حل اللوحة باش تشوف القرارات مباشرة." },
  "landing.includes_title":    { en: "Includes",                                 ar: "كيشمل" },
  "landing.includes1":         { en: "Bilingual UI (English / Arabic) with RTL.", ar: "واجهة ثنائية (إنجليزية/عربية) مع RTL." },
  "landing.includes2":         { en: "WhatsApp-style panel for daily messages and Q&A.", ar: "واجهة بحال واتساب للرسائل اليومية والأسئلة." },
  "landing.includes3":         { en: "Audit-friendly: deterministic decision engine + explanation.", ar: "قرار قابل للتدقيق: قواعد حتمية + شرح." },
  "landing.how_kicker":        { en: "How it works",                             ar: "كيفاش كخدام" },
  "landing.how_title":         { en: "Simple flow, auditable decisions.",        ar: "مسار بسيط وقرار قابل للتدقيق." },
  "landing.step1_title":       { en: "Collect",                                  ar: "جمع" },
  "landing.step1_body":        { en: "Weather + farm context (location, crop, season).", ar: "الطقس + سياق الضيعة (الموقع، الزرع، الموسم)." },
  "landing.step2_title":       { en: "Decide",                                   ar: "قرار" },
  "landing.step2_body":        { en: "Deterministic rules compute irrigation minutes and liters.", ar: "قواعد حتمية كتحدد الدقائق واللترات ديال السقي." },
  "landing.step3_title":       { en: "Explain",                                  ar: "شرح" },
  "landing.step3_body":        { en: "AI translates the decision into a clear Darija message.", ar: "الذكاء كتحول القرار لرسالة واضحة بالدارجة." },
  "landing.core_kicker":       { en: "Core features",                            ar: "المزايا الأساسية" },
  "landing.core_title":        { en: "Software-first. No sensors required.",     ar: "حل برمجي. بلا حساسات." },
  "landing.core_subtitle":     { en: "Deliver daily irrigation guidance at scale using free data sources and a professional cooperative dashboard.", ar: "توجيه يومي للسقي على نطاق واسع باستعمال بيانات مجانية ولوحة احترافية للتعاونيات." },
  "landing.core1_title":       { en: "Daily decision per parcel",                ar: "قرار يومي لكل قطعة" },
  "landing.core1_body":        { en: "IRRIGATE / WAIT / SKIP with minutes and liters.", ar: "سقي / تسنى / بلا سقي مع الدقائق واللترات." },
  "landing.core2_title":       { en: "7-day irrigation plan",                    ar: "خطة سقي 7 أيام" },
  "landing.core2_body":        { en: "A simple schedule so farmers can plan labor and water.", ar: "برنامج بسيط باش الفلاح يخطط للخدمة والماء." },
  "landing.core3_title":       { en: "Extreme weather alerts",                   ar: "إنذارات الطقس" },
  "landing.core3_body":        { en: "Frost, heat, heavy rain and drought-stress warnings.", ar: "إنذار البرد، السخونية، الشتا القوية، وإجهاد الجفاف." },
  "landing.core4_title":       { en: "WhatsApp delivery in Darija",              ar: "واتساب بالدارجة" },
  "landing.core4_body":        { en: "Warm, simple messages seniors can follow.", ar: "رسائل بسيطة وواضحة للفلاحين الكبار." },
  "landing.core5_title":       { en: "Cooperative dashboard",                    ar: "لوحة تعاونية" },
  "landing.core5_body":        { en: "Map, KPIs, history, and farm-level oversight.", ar: "خريطة، مؤشرات، تاريخ، ومراقبة ديال الضيعات." },
  "landing.core6_title":       { en: "Measured savings + audit log",             ar: "توفير + تتبع" },
  "landing.core6_body":        { en: "Water saved, decisions stored, explainable to investors.", ar: "ماء موفّر، قرارات مسجلة، ومفهومة للمستثمر." },
  "landing.principles_kicker": { en: "Design principles",                        ar: "مبادئ" },
  "landing.principles_title":  { en: "Trustworthy by design.",                   ar: "ثقة من البداية." },
  "landing.demo_title":        { en: "Demo snapshot",                            ar: "لقطة تجريبية" },
  "landing.demo_row1_label":   { en: "Today",                                    ar: "اليوم" },
  "landing.demo_row1_value":   { en: "IRRIGATE / WAIT / SKIP",                   ar: "سقي / تسنى / بلا سقي" },
  "landing.demo_row2_label":   { en: "Inputs",                                   ar: "المعطيات" },
  "landing.demo_row2_value":   { en: "Weather + soil + crop stage",              ar: "طقس + تربة + مرحلة" },
  "landing.demo_row3_label":   { en: "Output",                                   ar: "النتيجة" },
  "landing.demo_row3_value":   { en: "Minutes + liters + alerts",                ar: "دقائق + لترات + إنذارات" },
  "landing.demo_note":         { en: "For a full end-to-end demo, open the dashboard.", ar: "باش تشوف التجربة كاملة، حل اللوحة." },
  "landing.trust_line":        { en: "Built for cooperatives and small farmers — simple, fast, and explainable.", ar: "موجه للتعاونيات والفلاحين الصغار — بسيط، سريع، ومفهوم." },
  "landing.card1_title":       { en: "Deterministic core",                       ar: "نواة حتمية" },
  "landing.card1_body":        { en: "Irrigation math is pure Python and unit-tested. Decisions stay consistent and auditable.", ar: "حساب السقي بايثون صافي ومختبر. القرار ثابت وقابل للتدقيق." },
  "landing.card2_title":       { en: "AI at the edge",                           ar: "الذكاء فالحافة" },
  "landing.card2_body":        { en: "The model translates numbers into a warm Darija message. If the API fails, we fall back safely.", ar: "النموذج كيعطي رسالة بالدارجة. إلا طاح، كنرجعو لقوالب آمنة." },
  "landing.card3_title":       { en: "Human-in-the-loop",                        ar: "الإنسان فالدورة" },
  "landing.card3_body":        { en: "Farmers can correct soil/rain signals. Overrides expire automatically after 24h.", ar: "الفلاح يقدر يصحح المعطيات. التصحيحات كتسالي بعد 24 ساعة." },

  "features.kicker":           { en: "Product",                                  ar: "المنتج" },
  "features.title":            { en: "Built for field reality.",                 ar: "مبني على واقع الميدان." },
  "features.subtitle":         { en: "Designed for small farmers and cooperatives: fast, readable, and explainable decisions with a professional dashboard.", ar: "مصمم للفلاحين الصغار والتعاونيات: قرارات سريعة ومفهومة ولوحة احترافية." },
  "features.item1_title":      { en: "Daily decision per farm",                  ar: "قرار يومي لكل ضيعة" },
  "features.item1_body":       { en: "IRRIGATE, WAIT or SKIP with minutes and liters — plus frost / drought / heavy rain alerts.", ar: "سقي أو تسنى أو بلا سقي مع الدقائق واللترات + إنذارات." },
  "features.item2_title":      { en: "Map + KPIs + trends",                      ar: "خريطة + مؤشرات + منحنى" },
  "features.item2_body":       { en: "Morocco map with decision pins, NDVI/soil moisture indicators, and 7-day history.", ar: "خريطة المغرب مع قرارات، مؤشرات، وسجل 7 أيام." },
  "features.item3_title":      { en: "Bilingual UI (EN/AR)",                     ar: "واجهة ثنائية (EN/AR)" },
  "features.item3_body":       { en: "RTL ready, with Arabic typography and stable formatting for charts and maps.", ar: "دعم RTL وخط عربي مع تنسيق ثابت للرسوم والخريطة." },
  "features.item4_title":      { en: "Overrides with TTL",                       ar: "تصحيحات بمدة" },
  "features.item4_body":       { en: "Corrections win for 24 hours, then data takes over again automatically.", ar: "التصحيح كيبقى 24 ساعة ثم كترجع البيانات." },
  "features.cta_primary":      { en: "Try the dashboard",                        ar: "جرب اللوحة" },
  "features.cta_secondary":    { en: "Talk to us",                               ar: "تواصل معنا" },

  "contact.kicker":            { en: "Get in touch",                             ar: "تواصل" },
  "contact.title":             { en: "Contact",                                  ar: "تواصل" },
  "contact.subtitle":          { en: "For pilots, cooperatives, and demo requests.", ar: "للتجارب، التعاونيات، وطلبات العرض." },
  "contact.field_name":        { en: "Name",                                     ar: "الإسم" },
  "contact.field_org":         { en: "Organization",                             ar: "الجهة" },
  "contact.field_email":       { en: "Email",                                    ar: "البريد" },
  "contact.field_msg":         { en: "Message",                                  ar: "الرسالة" },
  "contact.ph_name":           { en: "Your name",                                ar: "الإسم" },
  "contact.ph_org":            { en: "Cooperative / company",                    ar: "تعاونية / شركة" },
  "contact.ph_email":          { en: "name@domain.com",                          ar: "name@domain.com" },
  "contact.ph_msg":            { en: "What do you want to build together?",      ar: "شنو بغيتي نبنيو مع بعض؟" },
  "contact.submit":            { en: "Send",                                     ar: "إرسال" },
  "contact.note":              { en: "This form is UI-only for now.",            ar: "هاد الفورم غير واجهة دابا." },

  "footer.note":               { en: "ZiraIA — hackathon prototype.",            ar: "ZiraIA — نموذج هاكاثون." },
  "footer.contact":            { en: "Contact",                                  ar: "تواصل" },
};

const LangContext = createContext({ lang: "en", setLang: () => {}, t: (k) => k });

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem("ziraia.lang") || "en"; } catch { return "en"; }
  });
  const setLang = useCallback((l) => {
    setLangState(l);
    try { localStorage.setItem("ziraia.lang", l); } catch {}
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
