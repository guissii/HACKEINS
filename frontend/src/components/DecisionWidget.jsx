const STYLE = {
  IRRIGATE: {
    bg: "bg-red-50 border-red-200",
    accent: "text-red-700",
    badge: "bg-red-600",
    label: "IRRIGATE NOW",
    emoji: "💧",
  },
  WAIT: {
    bg: "bg-amber-50 border-amber-200",
    accent: "text-amber-700",
    badge: "bg-amber-500",
    label: "WAIT — RAIN COMING",
    emoji: "🌧️",
  },
  SKIP: {
    bg: "bg-green-50 border-green-200",
    accent: "text-green-700",
    badge: "bg-green-600",
    label: "SOIL IS GOOD",
    emoji: "✅",
  },
};

export default function DecisionWidget({ decision }) {
  if (!decision) return null;
  const s = STYLE[decision.action] || STYLE.SKIP;
  return (
    <div className={`rounded-xl border ${s.bg} p-5`}>
      <div className="flex items-center justify-between">
        <span
          className={`inline-block ${s.badge} text-white text-xs font-bold tracking-wider px-3 py-1 rounded-full`}
        >
          {s.label}
        </span>
        <span className="text-3xl">{s.emoji}</span>
      </div>

      {decision.action === "IRRIGATE" && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs uppercase tracking-wide opacity-60">
              Duration
            </div>
            <div className={`text-3xl font-bold ${s.accent}`}>
              {decision.irrigation_minutes}
              <span className="text-base font-medium opacity-70 ml-1">min</span>
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide opacity-60">
              Water
            </div>
            <div className={`text-3xl font-bold ${s.accent}`}>
              {(decision.irrigation_liters / 1000).toFixed(1)}
              <span className="text-base font-medium opacity-70 ml-1">m³</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-3 text-xs opacity-70">
        ET₀ today: <span className="font-semibold">{decision.et0_mm} mm</span>
      </div>
    </div>
  );
}
