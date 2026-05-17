import { Link } from "react-router-dom";
import { useI18n } from "../i18n";
import NotificationBell from "./NotificationBell";

export default function SiteHeader({ variant = "landing", farms = [], analyses = {}, onSelectFarm }) {
  const { lang, setLang, t } = useI18n();

  return (
    <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* 1. Logo (Start) */}
        <div className="flex items-center flex-1">
          <Link to="/" className="flex items-center group">
            <img 
              src="/logo-ziraia.jpg" 
              alt="ZiraIA" 
              className="h-14 w-auto object-contain transition-transform group-hover:scale-105" 
            />
          </Link>
        </div>

        {/* 2. Navigation (Center) */}
        <div className="hidden md:flex items-center justify-center gap-10 flex-none">
          <Link to="/" className="text-[15px] font-semibold text-slate-700 hover:text-emerald-600 transition-colors">
            {t("nav.home")}
          </Link>
          <Link to="/project" className="text-[15px] font-semibold text-slate-700 hover:text-emerald-600 transition-colors">
            {t("nav.project")}
          </Link>
          <Link to="/features" className="text-[15px] font-semibold text-slate-700 hover:text-emerald-600 transition-colors">
            {t("nav.features")}
          </Link>
          <Link to="/contact" className="text-[15px] font-semibold text-slate-700 hover:text-emerald-600 transition-colors">
            {t("nav.contact")}
          </Link>
          {variant === "landing" && (
            <Link
              to="/dashboard"
              className="px-4 py-2 text-[15px] font-bold bg-slate-100 text-slate-700 rounded-xl border border-slate-200 hover:bg-slate-200 hover:text-emerald-700 transition-colors"
            >
              {t("nav.dashboard")}
            </Link>
          )}
        </div>

        {/* 3. Actions (End) */}
        <div className="flex items-center justify-end flex-1 gap-6">
          {variant === "dashboard" && (
            <NotificationBell farms={farms} analyses={analyses} onSelectFarm={onSelectFarm} />
          )}
          
          <div className="hidden sm:block text-[11px] text-slate-400 font-medium border-s border-slate-200 ps-4" dir="ltr">
            {t("app.event")}
          </div>
          
          <button
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="px-5 py-2.5 rounded-full border border-slate-200 bg-white text-slate-700 text-[13px] font-bold hover:bg-slate-50 hover:shadow-sm transition-all shadow-sm"
          >
            {t("lang.toggle")}
          </button>

          {variant === "dashboard" && (
            <button className="flex items-center justify-center w-11 h-11 rounded-full border-2 border-slate-100 bg-white shadow-sm hover:shadow transition-all group overflow-hidden shrink-0">
              <img 
                src="https://api.dicebear.com/7.x/notionists/svg?seed=Ahmed&backgroundColor=e2e8f0" 
                alt="Profile" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              />
            </button>
          )}
        </div>
        
      </div>
    </header>
  );
}
