import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import { useState } from "react";
import { useI18n } from "../i18n";

const DECISION_COLOR = {
  IRRIGATE: "#ef4444",
  WAIT: "#f59e0b",
  SKIP: "#10b981",
  UNKNOWN: "#94a3b8",
};

/* Africa-centered map */
const AFRICA_CENTER = [5, 20];
const AFRICA_BOUNDS = [[-38, -26], [40, 55]];

export default function FarmMap({ farms, decisions, selectedId, onSelect }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const [highRes, setHighRes] = useState(true);

  return (
    <div className="relative w-full h-full">
      {/* AI Super-Resolution Toggle */}
      <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur border border-slate-200 rounded-lg p-2 shadow-md flex flex-col gap-2">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1">
          {isAr ? "دقة الخريطة" : "Map Resolution"}
        </div>
        <div className="flex bg-slate-100 p-1 rounded-md">
          <button 
            onClick={() => setHighRes(false)}
            className={`text-xs px-3 py-1 font-bold rounded transition-colors ${!highRes ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}
          >
            10m (Standard)
          </button>
          <button 
            onClick={() => setHighRes(true)}
            className={`text-xs px-3 py-1 font-bold rounded transition-colors flex items-center gap-1 ${highRes ? "bg-emerald-500 text-white shadow-sm" : "text-slate-500"}`}
          >
            1m (AI Super-Res)
          </button>
        </div>
      </div>

      <MapContainer
        center={AFRICA_CENTER}
        zoom={4}
        scrollWheelZoom
        maxBounds={AFRICA_BOUNDS}
        maxBoundsViscosity={1.0}
        minZoom={3}
        className="w-full h-full"
        style={{ background: "#f8fafc" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className={highRes ? "contrast-125 saturate-150" : "opacity-80 grayscale-[30%]"}
        />
        {farms.map((f) => {
          const action = decisions[f.id]?.decision?.action || "UNKNOWN";
          const isSelected = selectedId === f.id;
          const color = DECISION_COLOR[action];
          return (
            <CircleMarker
              key={f.id}
              center={[f.lat, f.lon]}
              radius={isSelected ? 14 : 9}
              pathOptions={{
                color: isSelected ? "#0f172a" : "#ffffff",
                weight: isSelected ? 3 : 2,
                fillColor: color,
                fillOpacity: 0.9,
              }}
              eventHandlers={{ click: () => onSelect(f.id) }}
            >
              <Tooltip direction="top" offset={[0, -10]} permanent={isSelected}>
                <div className="text-xs">
                  <div className="font-bold text-slate-800">{f.parcel_name}</div>
                  <div className="text-slate-600">{f.farmer_name}</div>
                  <div className="text-slate-500">
                    {f.region} · {f.crop}
                  </div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
