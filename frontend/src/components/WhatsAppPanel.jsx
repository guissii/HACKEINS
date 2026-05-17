import { useState } from "react";
import { api } from "../api";
import { useI18n } from "../i18n";

export default function WhatsAppPanel({
  farmId,
  farmer,
  dailyMessage,
  aiSource,
  onOverrideApplied,
}) {
  const { t } = useI18n();
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(e) {
    e.preventDefault();
    const q = question.trim();
    if (!q || loading) return;
    setQuestion("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setLoading(true);
    try {
      const r = await api.correction(farmId, q);
      const d = r.data;

      if (d.kind === "qa") {
        setMessages((m) => [
          ...m,
          { role: "assistant", text: d.reply, kind: "qa" },
        ]);
      } else if (d.kind === "override_applied") {
        setMessages((m) => [
          ...m,
          {
            role: "system",
            text: `✓ ${t("wa.updated")}: ${d.applied_field} (${t(`decision.${d.decision.action}`)})`,
            kind: "system",
          },
          { role: "assistant", text: d.ai.darija_message, kind: "decision" },
        ]);
        onOverrideApplied && onOverrideApplied();
      } else {
        setMessages((m) => [
          ...m,
          { role: "assistant", text: d.ai?.darija_message || "شكراً على التعليق ديالك!", kind: "ack" },
        ]);
      }
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "⚠️ خطأ في الاتصال، عاود من بعد.", kind: "error" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function vote(messageIndex, dir) {
    const target = messages[messageIndex];
    try {
      await api.feedback(farmId, dir, (target?.text || "").slice(0, 200));
      setMessages((m) =>
        m.map((msg, i) => (i === messageIndex ? { ...msg, voted: dir } : msg))
      );
    } catch {
      /* silent */
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md shadow-sm overflow-hidden flex flex-col h-full relative">
      {/* AI Assistant Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-5 py-4 flex items-center gap-4 relative overflow-hidden" dir="ltr">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
        
        <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 relative shadow-inner">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-extrabold text-sm tracking-wide flex items-center gap-2">
            {t("app.name")} AI
            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm bg-indigo-500/30 text-indigo-200 border border-indigo-400/20">
              {aiSource === "gemini" ? "Live" : "Demo"}
            </span>
          </div>
          <div className="text-xs text-indigo-200/80 font-medium truncate mt-0.5">
            {farmer ? `Advising ${farmer}` : "Virtual Agronomist"}
          </div>
        </div>
      </div>

      {/* Chat body */}
      <div
        className="bg-slate-50/50 p-4 flex-1 overflow-y-auto space-y-4"
        style={{ minHeight: "260px", maxHeight: "420px" }}
      >
        {dailyMessage && (
          <BubbleWithVote
            role="assistant"
            text={dailyMessage}
            onVote={(d) => vote(-1, d)}
            voted={null}
            isDaily
          />
        )}
        {messages.map((m, i) => {
          if (m.role === "system") {
            return (
              <div key={i} className="flex justify-center my-4">
                <div className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-slate-200/50 text-slate-600 border border-slate-300/50 shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  {m.text}
                </div>
              </div>
            );
          }
          return (
            <BubbleWithVote
              key={i}
              role={m.role}
              text={m.text}
              onVote={m.role === "assistant" ? (d) => vote(i, d) : null}
              voted={m.voted}
            />
          );
        })}
        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3 bg-white border border-slate-200/60 shadow-sm">
              <TypingDots />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={send} className="bg-white border-t border-slate-100 p-3 flex items-center gap-2">
        <button
          type="button"
          className="text-slate-400 hover:text-indigo-500 transition-colors p-2 rounded-full hover:bg-indigo-50"
          title="Upload Data"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" /></svg>
        </button>
        <button
          type="button"
          className="text-slate-400 hover:text-indigo-500 transition-colors p-2 rounded-full hover:bg-indigo-50"
          title="Voice Memo"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
        </button>
        
        <div className="flex-1 relative">
          <input
            className="w-full rounded-full border border-slate-200/80 bg-slate-50 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
            placeholder={t("wa.placeholder")}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-full disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-sm flex items-center justify-center"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
        </button>
      </form>
    </div>
  );
}

function BubbleWithVote({ role, text, onVote, voted, isDaily }) {
  const { t } = useI18n();
  const isUser = role === "user";
  
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}>
      <div className={`max-w-[85%] ${isUser ? "" : "group"}`}>
        <div
          className={`px-4 py-3 text-[13px] leading-relaxed shadow-sm font-medium ${
            isUser 
              ? "bg-indigo-600 text-white rounded-2xl rounded-tr-sm" 
              : "bg-white text-slate-700 border border-slate-200/60 rounded-2xl rounded-tl-sm"
          }`}
          dir={isArabic(text) ? "rtl" : "ltr"}
        >
          <div className={isArabic(text) ? "arabic whitespace-pre-wrap" : "whitespace-pre-wrap"}>
            {text}
          </div>
        </div>
        {!isUser && onVote && (
          <div className="flex gap-1.5 mt-1.5 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <VoteButton dir="up" active={voted === "up"} onClick={() => onVote("up")} />
            <VoteButton dir="down" active={voted === "down"} onClick={() => onVote("down")} />
            {isDaily && <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ms-2 mt-1">{t("wa.help_learn")}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function VoteButton({ dir, active, onClick }) {
  const isUp = dir === "up";
  return (
    <button
      type="button"
      onClick={onClick}
      title={isUp ? "Helpful" : "Not helpful"}
      className={`p-1 rounded-md transition-colors ${
        active
          ? isUp
            ? "bg-emerald-100 text-emerald-700"
            : "bg-red-100 text-red-700"
          : "text-slate-400 hover:bg-slate-200 hover:text-slate-600"
      }`}
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {isUp ? (
          <><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></>
        ) : (
          <><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></>
        )}
      </svg>
    </button>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-1.5 py-1.5 px-1">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  );
}

function isArabic(s) {
  return /[؀-ۿ]/.test(s || "");
}
