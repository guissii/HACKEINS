import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";

const DECISION_COLOR = {
  IRRIGATE: "#dc2626", // red
  WAIT: "#f59e0b",     // amber
  SKIP: "#16a34a",     // green
  UNKNOWN: "#64748b",
};

export default function FarmMap({ farms, decisions, selectedId, onSelect }) {
  return (
    <MapContainer
      center={[31.5, -7.5]}
      zoom={6}
      scrollWheelZoom
      className="w-full h-full"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {farms.map((f) => {
        const action = decisions[f.id]?.decision?.action || "UNKNOWN";
        const isSelected = selectedId === f.id;
        return (
          <CircleMarker
            key={f.id}
            center={[f.lat, f.lon]}
            radius={isSelected ? 18 : 12}
            pathOptions={{
              color: "white",
              weight: isSelected ? 3 : 2,
              fillColor: DECISION_COLOR[action],
              fillOpacity: 0.9,
            }}
            eventHandlers={{ click: () => onSelect(f.id) }}
          >
            <Tooltip direction="top" offset={[0, -10]} permanent={isSelected}>
              <div className="text-xs">
                <div className="font-semibold">{f.parcel_name}</div>
                <div>{f.farmer_name}</div>
                <div className="opacity-70">
                  {f.region} · {f.crop}
                </div>
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
