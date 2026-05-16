import { useState } from "react";
import { api } from "../api";

export default function WhatsAppPanel({ farmId, farmer, dailyMessage, aiSource }) {
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
      const r = await api.ask(farmId, q);
      setMessages((m) => [...m, { role: "assistant", text: r.data.reply }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "⚠️ خطأ في الاتصال، عاود من بعد." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col">
      {/* WhatsApp-style header */}
      <div className="bg-[#075E54] text-white px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-filaha-green flex items-center justify-center text-white text-lg">
          🌿
        </div>
        <div>
          <div className="font-semibold text-sm">Filaha AI</div>
          <div className="text-xs opacity-80">
            {farmer ? `→ ${farmer}` : "online"}
          </div>
        </div>
        <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded">
          {aiSource === "gemini" ? "Gemini live" : "Demo mode"}
        </span>
      </div>

      {/* Chat body */}
      <div
        className="bg-[#ECE5DD] p-3 flex-1 overflow-y-auto space-y-2"
        style={{ minHeight: "260px", maxHeight: "360px" }}
      >
        {dailyMessage && (
          <Bubble role="assistant">
            <div className="arabic whitespace-pre-wrap">{dailyMessage}</div>
          </Bubble>
        )}
        {messages.map((m, i) => (
          <Bubble key={i} role={m.role}>
            <div
              className={isArabic(m.text) ? "arabic whitespace-pre-wrap" : "whitespace-pre-wrap"}
            >
              {m.text}
            </div>
          </Bubble>
        ))}
        {loading && (
          <Bubble role="assistant">
            <span className="opacity-60">typing…</span>
          </Bubble>
        )}
      </div>

      {/* Input */}
      <form onSubmit={send} className="bg-white border-t border-slate-200 p-2 flex items-center gap-2">
        {/* Roadmap-only icons: visually preview multimodal capability.
            Gemini already supports voice + image natively; we chose text
            for the demo. Clicking them shows a "coming soon" hint. */}
        <RoadmapIcon
          label="Attach a photo of your plant for AI diagnosis (coming soon)"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
            </svg>
          }
        />
        <RoadmapIcon
          label="Send a voice note in Darija (coming soon — for illiterate farmers)"
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
          className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:border-filaha-green"
          placeholder="Ask in Darija, French, or Arabic…"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="bg-filaha-green text-white text-sm font-medium px-4 py-2 rounded-full disabled:opacity-40"
        >
          Send
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
      className="text-slate-400 hover:text-filaha-green transition p-1.5 rounded-full hover:bg-slate-100"
    >
      {icon}
    </button>
  );
}
