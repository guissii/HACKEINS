import { useEffect, useState } from "react";
import { api } from "../api";
import { useI18n } from "../i18n";
import DecisionWidget from "../components/DecisionWidget";
import KPICards from "../components/KPICards";
import TrendChart from "../components/TrendChart";
import WhatsAppPanel from "../components/WhatsAppPanel";
import SiteHeader from "../components/SiteHeader";

// Extracted Components to keep Dashboard clean
import AddFarmModal from "../components/AddFarmModal";
import PortfolioOverview from "../components/PortfolioOverview";
import FarmList from "../components/FarmList";
import WaterSavings from "../components/WaterSavings";
import WeatherWidget from "../components/WeatherWidget";
import WorkOrdersPanel from "../components/WorkOrdersPanel";
import { SectionHeader, ProfileRow, StepItem, OverrideBanner } from "../components/DashboardShared";
import { getAdvancedCropSuitability } from "../utils/cropEngine";

export default function DashboardPage() {
  const { t, lang } = useI18n();
  const isAr = lang === "ar";
  const [farms, setFarms] = useState([]);
  const [localFarms, setLocalFarms] = useState(() => {
    try { const raw = localStorage.getItem("ziraia.localFarms"); return raw ? JSON.parse(raw) : []; } catch { return []; }
  });
  const [analyses, setAnalyses] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [showAddFarm, setShowAddFarm] = useState(false);

  useEffect(() => {
    if (window.location.hash === "#new") {
      setShowAddFarm(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const list = await api.listFarms();
        setFarms(list.data);
        if (!selectedId) {
          if (localFarms.length) setSelectedId(localFarms[0].id);
          else if (list.data.length) setSelectedId(list.data[0].id);
        }
        const results = await Promise.all(list.data.map((f) => api.analyze(f.id).then((r) => [f.id, r.data])));
        setAnalyses(Object.fromEntries(results));
      } catch (e) { setError(e.message); }
    })();
  }, []);

  useEffect(() => { try { localStorage.setItem("ziraia.localFarms", JSON.stringify(localFarms)); } catch {} }, [localFarms]);

  useEffect(() => {
    if (!selectedId) return;
    if (typeof selectedId === "string" && selectedId.startsWith("local_")) { setHistory([]); return; }
    api.history(selectedId).then((r) => setHistory(r.data)).catch(() => {});
  }, [selectedId]);

  async function refreshAnalysis(id) {
    try { const r = await api.analyze(id); setAnalyses((prev) => ({ ...prev, [id]: r.data })); } catch {}
  }

  const selectedFarm = farms.find((f) => f.id === selectedId);
  const selectedLocalFarm = localFarms.find((f) => f.id === selectedId);
  const selectedAnalysis = analyses[selectedId];
  const allFarms = [...localFarms, ...farms];
  const activeFarm = selectedFarm || selectedLocalFarm;
  const hasAnalysis = selectedFarm && selectedAnalysis;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <SiteHeader 
        variant="dashboard" 
        farms={allFarms} 
        analyses={analyses} 
        onSelectFarm={(id) => { setSelectedId(id); setShowChat(false); }} 
      />

      {error && (
        <div className="bg-red-50 border-b border-red-200 text-red-700 px-6 py-2 text-sm">
          {t("state.backend_error")}: {error}. {t("state.backend_hint")}
        </div>
      )}

      <div className="flex-1 overflow-y-auto light-scroll">
        <section className="container-page pt-5">
          <PortfolioOverview farms={allFarms} analyses={analyses} />
        </section>

        <section className="container-page pt-5">
          <FarmList
            className="max-h-[52vh] lg:max-h-[420px]"
            farms={allFarms}
            analyses={analyses}
            selectedId={selectedId}
            onSelect={(id) => { setSelectedId(id); setShowChat(false); }}
            onAddFarm={() => setShowAddFarm(true)}
          />
        </section>

        {activeFarm && (
          <section className="container-page pt-8 pb-8">
            <SectionHeader
              icon=""
              title={activeFarm.parcel_name}
              subtitle={`${activeFarm.farmer_name} · ${activeFarm.region} · ${activeFarm.area_hectares} ${t("farm.area")} · ${activeFarm.crop}`}
              right={
                hasAnalysis && (
                  <div className="flex gap-2">
                    <button onClick={() => setShowChat(false)}
                      className={`text-xs font-bold px-4 py-2 rounded-lg border transition-all ${!showChat ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"}`}>
                      {t("dash.tab_overview")}
                    </button>
                    <button onClick={() => setShowChat(true)}
                      className={`text-xs font-bold px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${showChat ? "bg-green-600 text-white border-green-600" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"}`}>
                      {t("dash.tab_chat")}
                    </button>
                  </div>
                )
              }
            />

            {selectedLocalFarm ? (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-amber-50/50 backdrop-blur-sm rounded-2xl border border-amber-200/80 p-6 shadow-sm">
                  <div className="text-[10px] uppercase tracking-widest text-amber-700 font-extrabold">{t("dash.local_title")}</div>
                  <div className="text-sm text-amber-800 mt-4 leading-relaxed font-medium">{t("dash.local_hint")}</div>
                </div>
                <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-extrabold mb-4">{t("dash.profile_title")}</div>
                  <div className="space-y-1">
                    <ProfileRow label={t("dash.profile_farmer")} value={selectedLocalFarm.farmer_name} />
                    <ProfileRow label={t("dash.profile_country")} value={selectedLocalFarm.country} />
                    <ProfileRow label={t("dash.profile_region")} value={selectedLocalFarm.region} />
                    <ProfileRow label={t("dash.profile_crop")} value={selectedLocalFarm.crop} />
                    <ProfileRow label={t("dash.profile_area")} value={`${selectedLocalFarm.area_hectares} ${t("farm.area")}`} />
                  </div>
                </div>
                <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-500 font-extrabold mb-4">{t("dash.next_steps")}</div>
                    <div className="space-y-4">
                      <StepItem n={1} text={t("dash.step_a")} />
                      <StepItem n={2} text={t("dash.step_b")} />
                      <StepItem n={3} text={t("dash.step_c")} />
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (farms.length > 0) {
                        setSelectedId(farms[0].id);
                        setShowChat(false);
                      }
                    }}
                    className="mt-6 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    {isAr ? "تفعيل النظام للضيعة" : "Activate System"}
                  </button>
                </div>
              </div>
            ) : hasAnalysis ? (
              showChat ? (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <WhatsAppPanel farmId={selectedFarm.id} farmer={selectedFarm.farmer_name}
                      dailyMessage={selectedAnalysis.ai?.darija_message} aiSource={selectedAnalysis.ai?._source}
                      onOverrideApplied={() => refreshAnalysis(selectedFarm.id)} />
                  </div>
                  <div>
                    <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                      <div className="flex items-center gap-2.5 mb-5">
                        <svg className="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg>
                        <h3 className="font-black text-slate-800 tracking-tight">{t("ai_advisor.title")}</h3>
                      </div>
                      <div className="space-y-5">
                        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-[13px] text-slate-600 font-medium italic shadow-inner">
                          "{t("ai_advisor.placeholder")}"
                        </div>
                        <div className="space-y-4 mt-5 border-l-2 border-emerald-500/50 pl-5 py-2">
                          <div>
                            <div className={`text-[10px] font-extrabold text-slate-400 mb-1 ${isAr ? "" : "uppercase tracking-widest"}`}>{t("ai_advisor.cause")}</div>
                            <div className="text-sm font-bold text-slate-800">{isAr ? "نقص في النيتروجين أو إجهاد مائي" : "Carence en azote (N) ou stress hydrique"}</div>
                          </div>
                          <div>
                            <div className={`text-[10px] font-extrabold text-slate-400 mb-1 ${isAr ? "" : "uppercase tracking-widest"}`}>{t("ai_advisor.diagnosis")}</div>
                            <div className="text-sm text-slate-600 font-medium">{isAr ? "اصفرار الأوراق القديمة. يظهر مستشعر NDVI انخفاضاً في الحيوية." : "Les feuilles plus anciennes jaunissent en premier. Le capteur NDVI montre une baisse de vigueur."}</div>
                          </div>
                          <div>
                            <div className={`text-[10px] font-extrabold text-slate-400 mb-1 ${isAr ? "" : "uppercase tracking-widest"}`}>{t("ai_advisor.action")}</div>
                            <div className="text-sm text-slate-600 font-medium">{isAr ? "الري الليلة (راجع التوصية) والتحقق من رطوبة الجذور." : "Irriguer ce soir (voir recommandation) et vérifier l'humidité à la racine."}</div>
                          </div>
                          <div>
                            <div className={`text-[10px] font-extrabold text-slate-400 mb-1 ${isAr ? "" : "uppercase tracking-widest"}`}>{t("ai_advisor.fertilizer")}</div>
                            <div className="text-sm text-slate-600 font-medium">{isAr ? "يوريا 46% (الجرعة: 50 كجم/هكتار) في مياه الري." : "Urée 46% (dose: 50 kg/ha) en fertirrigation."}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* DIGITAL LABOR MANAGEMENT */}
                    <WorkOrdersPanel decision={selectedAnalysis.decision} />
                  </div>
                </div>
              ) : (
                <>
                  <div className="mt-6 flex flex-col gap-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <DecisionWidget decision={selectedAnalysis.decision} />
                      <WaterSavings decision={selectedAnalysis.decision} farm={selectedFarm} />
                    </div>
                    
                    {selectedAnalysis.overrides && Object.keys(selectedAnalysis.overrides || {}).length > 0 && (
                      <div className="w-full">
                        <OverrideBanner overrides={selectedAnalysis.overrides} />
                      </div>
                    )}

                    <div className="w-full">
                      <WeatherWidget farm={selectedFarm} alerts={selectedAnalysis.decision?.alerts || []} />
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className={`flex items-center justify-between mb-3 ${isAr ? "flex-row-reverse" : ""}`}>
                      <div className={`text-[11px] text-slate-500 font-extrabold flex items-center gap-2 ${isAr ? "" : "uppercase tracking-widest"}`}>
                        <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
                        {isAr ? "بيانات الحقل والتوقعات" : "Field Data & Predictions"}
                      </div>
                      <div className={`text-[9px] font-black px-2.5 py-1 bg-indigo-50/80 text-indigo-700 border border-indigo-200/60 rounded-md shadow-sm flex items-center gap-1.5 ${isAr ? "" : "uppercase tracking-widest"}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                        {isAr ? "مستشعر الذكاء الاصطناعي نشط (بدون IoT)" : "AI Virtual Sensor Fusion Active (No IoT)"}
                      </div>
                    </div>
                    <KPICards decision={selectedAnalysis.decision} />
                  </div>
                  
                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="bg-transparent h-full">
                      <TrendChart history={history} fallbackHistory={null} />
                    </div>
                    
                    <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none transition-transform group-hover:scale-110 duration-700" />
                      
                      <div className="flex items-center justify-between mb-6 relative z-10">
                        <div className="flex items-center gap-2.5">
                          <svg className="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                          <h3 className="font-black text-slate-800 tracking-tight">{isAr ? "تحليل الذكاء الاصطناعي للمحاصيل" : "AI Crop Suitability Analysis"}</h3>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border border-indigo-100 text-indigo-600 bg-indigo-50 ${isAr ? "" : "uppercase tracking-widest"}`}>{isAr ? "مدعوم بالذكاء الاصطناعي" : "AI Powered"}</span>
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-center space-y-4 relative z-10">
                        <div className="text-[13px] font-medium text-slate-600 mb-2 leading-relaxed">
                          {isAr 
                            ? "بناءً على تحليل التربة (pH 6.8) والمناخ المحلي، نقترح الخيارات التالية. أنت صاحب القرار النهائي." 
                            : "Based on your soil profile (pH 6.8, Loam) and local climate data, ZiraIA suggests these high-yield options. You remain in complete control."}
                        </div>
                        
                        <div className="space-y-3 max-h-[250px] overflow-y-auto light-scroll pr-2">
                          {getAdvancedCropSuitability(activeFarm, selectedAnalysis).map((crop, idx) => {
                            const matchLevel = crop.score > 85 ? "OPTIMAL" : crop.score > 65 ? "HIGH" : "MODERATE";
                            const matchLabel = isAr ? (matchLevel === "OPTIMAL" ? "مثالي" : matchLevel === "HIGH" ? "جيد جداً" : "متوسط") : matchLevel;
                            const iconColor = crop.score > 85 ? "text-emerald-500" : crop.score > 65 ? "text-teal-500" : "text-amber-500";
                            const bgIconColor = crop.score > 85 ? "bg-emerald-50 border-emerald-100" : crop.score > 65 ? "bg-teal-50 border-teal-100" : "bg-amber-50 border-amber-100";
                            
                            return (
                              <div key={crop.id} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between hover:border-indigo-300 transition-all cursor-pointer group/item hover:shadow-sm" dir={isAr ? "rtl" : "ltr"}>
                                 <div className="flex items-center gap-3">
                                   <div className={`w-14 h-12 shrink-0 rounded-xl flex flex-col items-center justify-center border ${bgIconColor}`}>
                                     <svg className={`w-5 h-5 ${iconColor} mb-0.5`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                       {crop.score > 85 ? (
                                         <><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></>
                                       ) : crop.score > 65 ? (
                                         <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>
                                       ) : (
                                         <><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>
                                       )}
                                     </svg>
                                     <span className={`text-[9px] font-black ${isAr ? "tracking-normal" : "tracking-widest uppercase"} ${iconColor}`}>{matchLabel}</span>
                                   </div>
                                   <div>
                                     <div className="text-sm font-bold text-slate-800">{isAr ? crop.name.ar : crop.name.en}</div>
                                     <div className={`text-[11px] font-bold text-slate-500 mt-0.5 ${isAr ? "tracking-normal" : "uppercase tracking-widest"}`}>
                                       {isAr ? crop.desc.ar : crop.desc.en}
                                     </div>
                                   </div>
                                 </div>
                                 <button 
                                   onClick={() => alert(isAr ? `تم اختيار المحصول: ${crop.name.ar}` : `Crop selected: ${crop.name.en}`)}
                                   className={`text-[10px] font-bold text-slate-400 group-hover/item:text-indigo-600 px-3 py-1.5 border border-slate-200 group-hover/item:border-indigo-300 rounded-md bg-white transition-colors shrink-0 ${isAr ? "tracking-normal" : "uppercase"}`}>
                                   {isAr ? "اختيار" : "Select"}
                                 </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )
            ) : (
              <div className="mt-6 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
                <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                <div className="text-lg font-black text-slate-800 tracking-tight">{t("dash.select_title")}</div>
                <div className="text-sm font-medium text-slate-500 mt-2">{t("dash.select_hint")}</div>
              </div>
            )}
          </section>
        )}
      </div>

      {showAddFarm && (
        <AddFarmModal onClose={() => setShowAddFarm(false)}
          onSubmit={(payload) => {
            const id = `local_${Date.now()}`;
            setLocalFarms((prev) => [{ id, ...payload }, ...prev]);
            setSelectedId(id); setShowChat(false); setShowAddFarm(false);
          }} />
      )}
    </div>
  );
}
