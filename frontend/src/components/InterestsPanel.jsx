import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n";

/* ── Persona pill toggle with sliding indicator ── */
function PersonaToggle({ value, onChange, options }) {
  const idx = options.findIndex((o) => o.value === value);
  return (
    <div className="relative inline-flex items-center rounded-full p-1 bg-slate-100 border border-slate-200 shadow-inner">
      {/* sliding indicator */}
      <div
        className="absolute top-1 bottom-1 rounded-full transition-all duration-300 ease-out"
        style={{
          width: `calc(50% - 4px)`,
          left: idx === 0 ? "4px" : "calc(50% + 0px)",
          background: "linear-gradient(135deg, #10b981, #0ea5e9)",
          boxShadow: "0 2px 6px rgba(16,185,129,0.2)",
        }}
      />
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`relative z-10 flex-1 px-6 py-2.5 text-sm font-bold rounded-full transition-colors duration-300 ${
            value === opt.value ? "text-white" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ── Icon map for each benefit card ── */
const ICONS = {
  "farmer_1": "",
  "farmer_2": "",
  "farmer_3": "",
  "farmer_4": "",
  "investor_1": "",
  "investor_2": "",
  "investor_3": "",
  "investor_4": "",
};

const GRADIENTS = {
  "farmer_1": "from-green-100 to-emerald-50 text-green-700",
  "farmer_2": "from-blue-100 to-cyan-50 text-blue-700",
  "farmer_3": "from-amber-100 to-orange-50 text-amber-700",
  "farmer_4": "from-violet-100 to-purple-50 text-purple-700",
  "investor_1": "from-cyan-100 to-blue-50 text-cyan-700",
  "investor_2": "from-emerald-100 to-teal-50 text-emerald-700",
  "investor_3": "from-orange-100 to-red-50 text-orange-700",
  "investor_4": "from-indigo-100 to-violet-50 text-indigo-700",
};

function BenefitCard({ id, kicker, title, body, delay }) {
  const isLive = kicker.toLowerCase() === "live" || kicker === "جاهز";
  return (
    <div
      className="group bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all animate-slide-up relative overflow-hidden"
      style={{ animationDelay: `${delay * 0.08}s` }}
    >
      <div className="flex items-start gap-4">
        {/* Icon circle */}
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${GRADIENTS[id] || "from-slate-100 to-slate-50 text-slate-700"} flex items-center justify-center text-xl shrink-0 border border-slate-100`}>
          {ICONS[id] || ""}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            {/* Live/Next badge */}
            {isLive ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
                {kicker}
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                {kicker}
              </span>
            )}
          </div>
          <div className="text-sm font-bold text-slate-800 leading-snug">{title}</div>
          <div className="mt-2 text-sm text-slate-600 leading-relaxed">{body}</div>
        </div>
      </div>
    </div>
  );
}

export default function InterestsPanel() {
  const { t } = useI18n();
  const [persona, setPersona] = useState("farmer");

  const rows = useMemo(() => {
    if (persona === "investor") {
      return [
        { id: "investor_1", kicker: t("dash.interests.kicker_live"), title: t("dash.interests.investor_1_title"), body: t("dash.interests.investor_1_body") },
        { id: "investor_2", kicker: t("dash.interests.kicker_live"), title: t("dash.interests.investor_2_title"), body: t("dash.interests.investor_2_body") },
        { id: "investor_3", kicker: t("dash.interests.kicker_next"), title: t("dash.interests.investor_3_title"), body: t("dash.interests.investor_3_body") },
        { id: "investor_4", kicker: t("dash.interests.kicker_next"), title: t("dash.interests.investor_4_title"), body: t("dash.interests.investor_4_body") },
      ];
    }
    return [
      { id: "farmer_1", kicker: t("dash.interests.kicker_live"), title: t("dash.interests.farmer_1_title"), body: t("dash.interests.farmer_1_body") },
      { id: "farmer_2", kicker: t("dash.interests.kicker_live"), title: t("dash.interests.farmer_2_title"), body: t("dash.interests.farmer_2_body") },
      { id: "farmer_3", kicker: t("dash.interests.kicker_live"), title: t("dash.interests.farmer_3_title"), body: t("dash.interests.farmer_3_body") },
      { id: "farmer_4", kicker: t("dash.interests.kicker_next"), title: t("dash.interests.farmer_4_title"), body: t("dash.interests.farmer_4_body") },
    ];
  }, [persona, t]);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden animate-fade-in shadow-sm" style={{ animationDelay: "0.2s" }}>
      {/* Hero header with subtle pattern */}
      <div className="relative px-6 pt-8 pb-6 bg-white border-b border-slate-200">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="chip bg-indigo-50 text-indigo-700 border-indigo-200">{t("dash.interests.kicker")}</span>
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight max-w-lg">
            {t("dash.interests.title")}
          </h2>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-xl">
            {t("dash.interests.subtitle")}
          </p>

          <div className="mt-6">
            <PersonaToggle
              value={persona}
              onChange={setPersona}
              options={[
                { value: "farmer", label: `${t("dash.interests.persona_farmer")}` },
                { value: "investor", label: `${t("dash.interests.persona_investor")}` },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Cards grid */}
      <div className="px-6 pb-6 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {rows.map((r, i) => (
          <BenefitCard key={r.id} {...r} delay={i} />
        ))}
      </div>

      {/* CTAs */}
      <div className="px-6 pb-8 pt-2 flex flex-wrap gap-3">
        <Link to="/features" className="btn btn-secondary text-sm">
          {t("dash.interests.cta_features")}
        </Link>
        <Link to="/contact" className="btn btn-primary text-sm">
          {t("dash.interests.cta_contact")}
        </Link>
      </div>
    </div>
  );
}
