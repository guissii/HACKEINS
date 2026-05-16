import { useI18n } from "../i18n";

const STYLE = {
  IRRIGATE: {
    bg: "bg-red-50 border-red-200",
    accent: "text-red-700",
    badge: "bg-red-600",
    emoji: "💧",
  },
  WAIT: {
    bg: "bg-amber-50 border-amber-200",
    accent: "text-amber-700",
    badge: "bg-amber-500",
    emoji: "🌧️",
  },
  SKIP: {
    bg: "bg-green-50 border-green-200",
    accent: "text-green-700",
    badge: "bg-green-600",
    emoji: "✅",
  },
};

export default function DecisionWidget({ decision }) {
  const { t } = useI18n();
  if (!decision) return null;
  const s = STYLE[decision.action] || STYLE.SKIP;
  return (
    <div className={`rounded-xl border ${s.bg} p-5`}>
      <div className="flex items-center justify-between">
        <span
          className={`inline-block ${s.badge} text-white text-xs font-bold tracking-wider px-3 py-1 rounded-full`}
        >
          {t(`decision.${decision.action}`)}
        </span>
        <span className="text-3xl">{s.emoji}</span>
      </div>

      {decision.action === "IRRIGATE" && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs uppercase tracking-wide opacity-60">
              {t("decision.duration")}
            </div>
            <div className={`text-3xl font-bold ${s.accent}`}>
              {decision.irrigation_minutes}
              <span className="text-base font-medium opacity-70 ms-1">
                {t("decision.unit_min")}
              </span>
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide opacity-60">
              {t("decision.water")}
            </div>
            <div className={`text-3xl font-bold ${s.accent}`}>
              {(decision.irrigation_liters / 1000).toFixed(1)}
              <span className="text-base font-medium opacity-70 ms-1">
                {t("decision.unit_m3")}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-3 text-xs opacity-70">
        {t("decision.et0_today")}: <span className="font-semibold">{decision.et0_mm} mm</span>
      </div>
    </div>
  );
}
