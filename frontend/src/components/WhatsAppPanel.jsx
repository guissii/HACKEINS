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
      <form onSubmit={send} className="bg-white border-t border-slate-200 p-2 flex gap-2">
        <input
          className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:border-filaha-green"
          placeholder="Ask in Darija, French, or Arabic…"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="bg-filaha-green text-white text-sm font-medium px-4 rounded-full disabled:opacity-40"
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
