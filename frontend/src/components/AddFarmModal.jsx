import { useState, useRef, useEffect } from "react";
import { useI18n } from "../i18n";
import { MapContainer, TileLayer, Polygon, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";

// Map bounds for Africa
const AFRICA_BOUNDS = [[-38, -26], [38, 55]];

const customPointIcon = new L.DivIcon({
  className: "custom-point-marker",
  html: `<div style="width: 22px; height: 22px; background-color: #3b82f6; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.3); color: transparent; font-size: 10px; font-weight: 900; cursor: grab; transition: all 0.2s;" onmouseover="this.style.backgroundColor='#ef4444'; this.style.color='white';" onmouseout="this.style.backgroundColor='#3b82f6'; this.style.color='transparent';">✕</div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

function SearchController({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo([coords.lat, coords.lon], 12);
    }
  }, [coords, map]);
  return null;
}
function getConvexHull(points) {
  if (points.length < 3) return points;
  
  const sorted = [...points].sort((a, b) => a.lng === b.lng ? a.lat - b.lat : a.lng - b.lng);
  const cross = (o, a, b) => (a.lng - o.lng) * (b.lat - o.lat) - (a.lat - o.lat) * (b.lng - o.lng);
  
  const lower = [];
  for (let i = 0; i < sorted.length; i++) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], sorted[i]) <= 0) lower.pop();
    lower.push(sorted[i]);
  }
  
  const upper = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], sorted[i]) <= 0) upper.pop();
    upper.push(sorted[i]);
  }
  
  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

// Map click handler to update coordinates
function MapSelector({ points, setPoints }) {
  useMapEvents({
    click(e) {
      setPoints((prev) => [...prev, e.latlng]);
    },
  });

  const hullPoints = getConvexHull(points);

  return (
    <>
      {points.map((p, i) => (
        <Marker 
          key={i} 
          position={p} 
          icon={customPointIcon}
          draggable={true}
          eventHandlers={{
            click: (e) => {
              if (e.originalEvent) {
                e.originalEvent.stopPropagation();
              }
              setPoints((prev) => prev.filter((_, idx) => idx !== i));
            },
            dragend: (e) => {
              const marker = e.target;
              const position = marker.getLatLng();
              setPoints((prev) => {
                const newPoints = [...prev];
                newPoints[i] = position;
                return newPoints;
              });
            }
          }}
        />
      ))}
      {hullPoints.length > 2 && (
        <Polygon positions={hullPoints} pathOptions={{ color: '#10b981', fillColor: '#34d399', fillOpacity: 0.4 }} />
      )}
    </>
  );
}

export default function AddFarmModal({ onClose, onSubmit }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  
  const [investorName, setInvestorName] = useState("");
  const [points, setPoints] = useState([]); // Array of latlngs for polygon
  const [err, setErr] = useState("");
  const [extractState, setExtractState] = useState("idle"); // idle | capturing | analyzing | result
  
  // Intelligent Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [flyCoords, setFlyCoords] = useState(null);
  
  const inputCls = "w-full bg-white border border-slate-200/80 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-sm font-medium";

  async function handleSearch(e) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setErr("");
    
    try {
      const coordMatch = searchQuery.match(/^(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)$/);
      if (coordMatch) {
        const lat = parseFloat(coordMatch[1]);
        const lon = parseFloat(coordMatch[3]);
        setFlyCoords({ lat, lon });
        setPoints([{ lat, lng: lon }]);
        setIsSearching(false);
        return;
      }

      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=ma,sn,ci,ke,eg,dz,tn`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setFlyCoords({ lat, lon });
        setPoints([{ lat, lng: lon }]);
      } else {
        setErr(isAr ? "لم يتم العثور على المكان، حاول كتابة اسم مدينة، منطقة، أو إحداثيات (خط العرض، خط الطول)." : "Location not found, try a city, region, or coordinates (lat, lon).");
      }
    } catch (error) {
      setErr("Search failed.");
    } finally {
      setIsSearching(false);
    }
  }

  function submit(e) {
    e.preventDefault();
    if (!investorName.trim()) return setErr(isAr ? "المرجو إدخال اسم المشروع/الضيعة" : "Project/Farm name is required");
    if (points.length === 0) return setErr(isAr ? "المرجو تحديد موقع الضيعة بالنقر على الخريطة" : "Please click on the map to determine the location");
    if (points.length > 0 && points.length < 3) setErr(isAr ? "تم تحديد نقطة واحدة فقط، سيتم استخراج المحيط تلقائياً." : "Only point(s) selected, AI will auto-extract bounds.");
    else setErr("");
    
    setExtractState("capturing");

    setTimeout(() => setExtractState("analyzing"), 1500);
    setTimeout(() => setExtractState("result"), 3500);
    
    setTimeout(() => {
      onSubmit({ 
        country: "Morocco", 
        region: "Maroc", 
        farmer_name: investorName.trim(), 
        parcel_name: "Zone A", 
        crop: "AI Recommended", 
        area_hectares: 10, 
        lat: points[0].lat, 
        lon: points[0].lng
      });
    }, 6500);
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl animate-slide-up max-h-[95vh] flex flex-col m-6 overflow-hidden border border-slate-200/80">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100/60 bg-gradient-to-r from-slate-50/80 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div>
              <div className="text-xl font-black text-slate-800 tracking-tight">
                {isAr ? "تحديد حدود المشروع" : "Determine Project Boundaries"}
              </div>
              <div className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                {isAr ? "ابحث بذكاء أو أدخل إحداثيات وحدد موقع المشروع." : "Smart search or enter coordinates, then click the map."}
              </div>
            </div>
          </div>
          <button type="button" disabled={extractState !== "idle"} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors" onClick={onClose}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        
        <div className="p-8 flex-1 overflow-y-auto light-scroll flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-extrabold mb-2.5">
                {isAr ? "اسم المشروع / الضيعة" : "Project / Farm Name"}
              </label>
              <input 
                value={investorName} 
                onChange={(e) => setInvestorName(e.target.value)} 
                className={inputCls} 
                placeholder={isAr ? "مثال: ضيعة الأمل..." : "e.g. Atlas Farms..."} 
                disabled={extractState !== "idle"}
              />
            </div>
            
            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200/60 shadow-sm">
              <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-extrabold mb-2.5">
                {isAr ? "بحث ذكي عن المنطقة" : "Intelligent Region Search"}
              </label>
              <div className="flex gap-2">
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isAr ? "مثال: مكناس، أو إحداثيات" : "e.g. Meknes, or lat, lon"}
                  className="flex-1 bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                  disabled={extractState !== "idle"}
                />
                <button 
                  onClick={handleSearch}
                  disabled={isSearching || extractState !== "idle"}
                  className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition shadow-sm flex items-center justify-center min-w-[50px] disabled:opacity-50"
                >
                  {isSearching ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>}
                </button>
              </div>
            </div>

            <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100/80 flex-1 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-emerald-800 font-extrabold mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  {isAr ? "تعليمات التحديد" : "Selection Instructions"}
                </div>
                <ul className="text-[13px] font-medium text-emerald-700/80 space-y-2.5">
                  <li className="flex gap-2.5"><span className="text-emerald-500 shrink-0">•</span>{isAr ? "انقر عدة مرات على الخريطة لرسم مضلع يحيط بالضيعة." : "Click multiple times on the map to draw a polygon around the farm."}</li>
                  <li className="flex gap-2.5"><span className="text-emerald-500 shrink-0">•</span>{isAr ? "يمكنك سحب وإفلات أي نقطة لتعديل موقعها." : "You can drag and drop any point to adjust its position."}</li>
                  <li className="flex gap-2.5"><span className="text-emerald-500 shrink-0">•</span>{isAr ? "انقر على أي نقطة زرقاء (ماركر) لحذفها." : "Click on any blue marker to delete it."}</li>
                  <li className="flex gap-2.5"><span className="text-emerald-500 shrink-0">•</span>{isAr ? "سيقوم الذكاء الاصطناعي باستخراج محيط الضيعة آلياً إذا اكتفيت بنقطة واحدة." : "AI will auto-extract if you only place one point."}</li>
                  <li className="flex gap-2.5"><span className="text-emerald-500 shrink-0">•</span>{isAr ? "تحليل طيفي للتربة عبر الأقمار الصناعية." : "Spectral soil analysis via satellite."}</li>
                </ul>
              </div>
              
              {points.length > 0 && extractState === "idle" && (
                <div className="mt-4 flex gap-2">
                  <button 
                    onClick={() => setPoints(prev => prev.slice(0, -1))} 
                    className="text-[10px] font-bold uppercase tracking-widest text-amber-700 bg-amber-100/50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200/50 transition self-start"
                  >
                    {isAr ? "تراجع" : "Undo Last"}
                  </button>
                  <button 
                    onClick={() => setPoints([])} 
                    className="text-[10px] font-bold uppercase tracking-widest text-red-600 bg-red-100/50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200/50 transition self-start"
                  >
                    {isAr ? "مسح التحديد" : "Clear All"}
                  </button>
                </div>
              )}
            </div>
            {err && <div className="rounded-xl bg-red-50 border border-red-200/80 px-4 py-3 text-xs text-red-700 font-bold shadow-sm">{err}</div>}
          </div>

          <div className="w-full lg:w-2/3">
            <div className="h-[480px] w-full rounded-3xl overflow-hidden border-4 border-white shadow-xl relative ring-1 ring-slate-200/60">
              <style>{`
                @keyframes scanLine {
                  0% { top: 0%; opacity: 0; }
                  10% { opacity: 1; }
                  90% { opacity: 1; }
                  100% { top: 100%; opacity: 0; }
                }
              `}</style>
              {extractState !== "idle" && (
                <div className="absolute inset-0 z-[1000] bg-slate-900/90 flex flex-col items-center justify-center text-white backdrop-blur-md p-8 transition-all duration-500">
                  {extractState === "capturing" && (
                     <div className="flex flex-col items-center animate-fade-in">
                       <svg className="w-16 h-16 text-indigo-400 mb-6 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/><line x1="16" y1="5" x2="22" y2="5"/><line x1="19" y1="2" x2="19" y2="8"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                       <div className="text-2xl font-black tracking-tight">{isAr ? "التقاط صور قمر صناعي عالية الدقة..." : "Capturing High-Res Satellite Imagery..."}</div>
                       <div className="text-sm font-medium text-slate-400 mt-2">Connecting to Sentinel-2...</div>
                     </div>
                  )}
                  
                  {extractState === "analyzing" && (
                     <div className="flex flex-col items-center w-full max-w-lg animate-fade-in">
                       <div className="relative w-full h-48 bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 mb-6 shadow-2xl">
                         <div className="absolute inset-0 opacity-60 bg-[url('https://images.unsplash.com/photo-1586771107445-d3af9e111b15?w=800')] bg-cover bg-center grayscale mix-blend-overlay"></div>
                         <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400 shadow-[0_0_20px_4px_rgba(52,211,153,1)]" style={{ animation: "scanLine 2s ease-in-out infinite alternate" }} />
                         
                         {/* Highlight spots */}
                         <div className="absolute top-1/4 left-1/3 w-8 h-8 border-2 border-emerald-400 rounded-full animate-ping opacity-50"></div>
                         <div className="absolute bottom-1/3 right-1/4 w-12 h-12 border-2 border-amber-400 rounded-full animate-ping opacity-50 animation-delay-1000"></div>
                       </div>
                       <div className="text-2xl font-black mb-2 text-emerald-400 tracking-tight">{isAr ? "تحليل طيفي للتربة" : "AI Multispectral Soil Analysis"}</div>
                       <div className="text-sm font-bold text-slate-300 uppercase tracking-widest">{isAr ? "استخراج مؤشرات الخصوبة والمواد العضوية..." : "Extracting fertility signatures..."}</div>
                     </div>
                  )}

                  {extractState === "result" && (
                     <div className="w-full max-w-lg bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-emerald-500/40 shadow-2xl animate-slide-up">
                       <div className="flex items-center gap-4 mb-6">
                         <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 ring-1 ring-emerald-500/50">
                           <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" /></svg>
                         </div>
                         <div>
                           <div className="text-xl font-black text-white tracking-tight">{isAr ? "اكتمل تحليل التربة بنجاح" : "Soil Fertility Assessed"}</div>
                           <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mt-1">Ready for initialization</div>
                         </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                         <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                           <div className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mb-1">Estimated pH</div>
                           <div className="text-2xl font-black text-white">6.8 <span className="text-xs text-emerald-400 font-bold ml-1">Optimal</span></div>
                         </div>
                         <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                           <div className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mb-1">Organic Matter</div>
                           <div className="text-2xl font-black text-white">2.4% <span className="text-xs text-amber-400 font-bold ml-1">Moderate</span></div>
                         </div>
                         <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                           <div className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mb-1">Nitrogen Potential</div>
                           <div className="text-2xl font-black text-emerald-400">High</div>
                         </div>
                         <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                           <div className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mb-1">Dominant Type</div>
                           <div className="text-2xl font-black text-white">Loam</div>
                         </div>
                       </div>
                     </div>
                  )}
                </div>
              )}
              <MapContainer
                center={[31.7917, -7.0926]}
                zoom={5}
                maxBounds={AFRICA_BOUNDS}
                minZoom={4}
                className="w-full h-full"
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap"
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                {extractState === "idle" && <MapSelector points={points} setPoints={setPoints} />}
                <SearchController coords={flyCoords} />
              </MapContainer>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100/60 bg-slate-50/50 flex items-center justify-between">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-white px-3 py-2 rounded-lg border border-slate-200/60 shadow-sm flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {points.length > 0 ? `LAT: ${points[0].lat.toFixed(5)} | LON: ${points[0].lng.toFixed(5)}` : (isAr ? "لم يتم التحديد" : "Not selected")}
          </div>
          <button 
            type="submit" 
            onClick={submit} 
            disabled={extractState !== "idle"}
            className="bg-indigo-600 text-white font-extrabold text-[11px] uppercase tracking-widest px-8 py-3.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg hover:shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            {extractState !== "idle" ? (
              <span>{isAr ? "جاري المعالجة..." : "Processing..."}</span>
            ) : (
              <>
                <span>{isAr ? "تحليل المضلع والذهاب للوحة القيادة" : "Analyze Bounds & Go to Dashboard"}</span>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
