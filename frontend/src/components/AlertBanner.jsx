const ICON = {
  frost: "🥶",
  drought_stress: "🏜️",
  crop_stress: "🌱",
  heavy_rain: "🌧️",
};

const SEVERITY_COLOR = {
  high: "bg-red-100 text-red-800 border-red-300",
  medium: "bg-amber-100 text-amber-800 border-amber-300",
  low: "bg-sky-100 text-sky-800 border-sky-300",
};

export default function AlertBanner({ alerts }) {
  if (!alerts || alerts.length === 0) return null;
  return (
    <div className="space-y-2">
      {alerts.map((a, i) => (
        <div
          key={i}
          className={`flex items-start gap-3 rounded-lg border px-3 py-2 text-sm ${SEVERITY_COLOR[a.severity]}`}
        >
          <span className="text-xl leading-none">{ICON[a.type] || "⚠️"}</span>
          <div className="flex-1">
            <div className="font-semibold capitalize">
              {a.type.replace("_", " ")}
            </div>
            <div className="text-xs opacity-90">{a.message}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
