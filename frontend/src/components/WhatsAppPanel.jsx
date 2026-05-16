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
      // Route through /correction — it auto-detects whether the message is
      // a question, a correction, or an observation, and acts accordingly.
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
        // Logged but no actionable field
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
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col">
      {/* WhatsApp-style header — stays LTR for WhatsApp-look authenticity */}
      <div className="bg-[#075E54] text-white px-4 py-3 flex items-center gap-3" dir="ltr">
        <div className="w-9 h-9 rounded-full bg-ziraia-green flex items-center justify-center text-white text-lg">
          🌿
        </div>
        <div>
          <div className="font-semibold text-sm">{t("app.name")}</div>
          <div className="text-xs opacity-80">
            {farmer ? `→ ${farmer}` : t("wa.subtitle_online")}
          </div>
        </div>
        <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded">
          {aiSource === "gemini" ? t("wa.source_live") : t("wa.source_demo")}
        </span>
      </div>

      {/* Chat body */}
      <div
        className="bg-[#ECE5DD] p-3 flex-1 overflow-y-auto space-y-2"
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
              <div key={i} className="flex justify-center">
                <div className="text-xs px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
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
          <Bubble role="assistant">
            <TypingDots />
          </Bubble>
        )}
      </div>

      {/* Input */}
      <form onSubmit={send} className="bg-white border-t border-slate-200 p-2 flex items-center gap-2">
        <RoadmapIcon
          label={t("wa.attach_label")}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
            </svg>
          }
        />
        <RoadmapIcon
          label={t("wa.voice_label")}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <rect x="9" y="2" width="6" height="12" rx="3" />
              <path d="M5 10a7 7 0 0014 0" />
              <path d="M12 17v4" />
              <path d="M8 21h8" />
            </svg>
          }
        />
        <input
          className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:border-ziraia-green"
          placeholder={t("wa.placeholder")}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="bg-ziraia-green text-white text-sm font-medium px-4 py-2 rounded-full disabled:opacity-40"
        >
          {t("wa.send")}
        </button>
      </form>
    </div>
  );
}

function Bubble({ role, children }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
          isUser ? "bg-[#DCF8C6] text-slate-900" : "bg-white text-slate-900"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function BubbleWithVote({ role, text, onVote, voted, isDaily }) {
  const { t } = useI18n();
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] ${isUser ? "" : "group"}`}>
        <div
          className={`rounded-2xl px-3 py-2 text-sm shadow-sm ${
            isUser ? "bg-[#DCF8C6] text-slate-900" : "bg-white text-slate-900"
          }`}
          dir={isArabic(text) ? "rtl" : "ltr"}
        >
          <div className={isArabic(text) ? "arabic whitespace-pre-wrap" : "whitespace-pre-wrap"}>
            {text}
          </div>
        </div>
        {!isUser && onVote && (
          <div className="flex gap-1 mt-1 px-1 opacity-0 group-hover:opacity-100 transition">
            <VoteButton dir="up" active={voted === "up"} onClick={() => onVote("up")} />
            <VoteButton dir="down" active={voted === "down"} onClick={() => onVote("down")} />
            {isDaily && <span className="text-[10px] text-slate-400 ms-1">{t("wa.help_learn")}</span>}
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
      className={`text-xs px-1.5 py-0.5 rounded transition ${
        active
          ? isUp
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
          : "text-slate-400 hover:bg-slate-100"
      }`}
    >
      {isUp ? "👍" : "👎"}
    </button>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-1 py-1">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  );
}

function isArabic(s) {
  return /[؀-ۿ]/.test(s || "");
}

function RoadmapIcon({ label, icon }) {
  return (
    <button
      type="button"
      title={label}
      onClick={() =>
        alert(`${label}\n\nThis preview hints at our v2 multimodal stack — Gemini already supports voice and image input natively.`)
      }
      className="text-slate-400 hover:text-ziraia-green transition p-1.5 rounded-full hover:bg-slate-100"
    >
      {icon}
    </button>
  );
}
