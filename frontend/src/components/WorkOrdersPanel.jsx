import { useState } from "react";
import { useI18n } from "../i18n";

export default function WorkOrdersPanel({ decision }) {
  const { lang } = useI18n();
  const [status, setStatus] = useState("pending");

  if (!decision || decision.action !== "IRRIGATE") return null;

  const isAr = lang === "ar";

  return (
    <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 shadow-sm mt-6 relative overflow-hidden group">
      <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-slate-200/40 rounded-full blur-2xl pointer-events-none group-hover:bg-slate-300/40 transition-colors duration-700" />
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
          </div>
          <div>
            <h3 className="font-black text-slate-800 tracking-tight text-lg">
              {isAr ? "إدارة العمال الرقمية" : "Digital Labor Management"}
            </h3>
            <p className="text-[9px] uppercase tracking-widest text-slate-500 font-extrabold mt-0.5">
              {isAr ? "بدون صمامات ذكية" : "No Smart Valves Needed"}
            </p>
          </div>
        </div>
        <div className="text-[10px] bg-slate-100/80 text-slate-600 px-2.5 py-1 rounded border border-slate-200/60 font-bold uppercase tracking-widest shadow-sm">
          {isAr ? "أوامر العمل" : "Work Orders"}
        </div>
      </div>

      <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-5 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-black text-slate-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            {isAr ? "توجيه العامل: يوسف" : "Dispatch to: Youssef"}
          </div>
          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-sm flex items-center gap-1 ${
            status === "pending" ? "bg-amber-100/80 text-amber-700 border border-amber-200/60" : "bg-emerald-100/80 text-emerald-700 border border-emerald-200/60"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === "pending" ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
            {status === "pending" ? (isAr ? "قيد الانتظار" : "Pending") : (isAr ? "مكتمل" : "Completed")}
          </span>
        </div>

        <div className="bg-white border-l-4 border-emerald-500 p-4 rounded-lg shadow-sm text-sm text-slate-700 font-medium mb-5">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <div className="leading-relaxed">
              {isAr ? `السلام يوسف، فتح الفانا رقم 3 لمدة ${decision.irrigation_minutes} دقيقة. تأكد من إغلاقها بعد الانتهاء.` : `Salam Youssef, please open Valve 3 for ${decision.irrigation_minutes} minutes. Reply 'DONE' when finished.`}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            disabled={status === "completed"}
            onClick={() => setStatus("completed")}
            className="flex-1 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border border-emerald-200/60 text-[11px] uppercase tracking-widest font-extrabold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
          >
            {isAr ? "محاكاة رد العامل ('تم')" : "Simulate Worker Reply ('DONE')"}
          </button>
        </div>
      </div>
    </div>
  );
}
