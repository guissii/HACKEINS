// In production (Vercel), set VITE_API_URL to your deployed backend URL.
// In local dev, it falls back to "/api" which uses the Vite proxy.
const BASE = import.meta.env.VITE_API_URL || "/api";

async function get(path) {
  const r = await fetch(`${BASE}${path}`, {
    headers: { "Bypass-Tunnel-Reminder": "true" }
  });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

async function post(path, body) {
  const r = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Bypass-Tunnel-Reminder": "true"
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

export const api = {
  listFarms: () => get("/farms"),
  getFarm: (id) => get(`/farms/${id}`),
  analyze: (id) => get(`/farms/${id}/analyze`),
  history: (id) => get(`/farms/${id}/history`),
  ask: (id, question) => post(`/farms/${id}/ask`, { question }),
  aiStatus: () => get("/ai-status"),
  // Human-in-the-loop:
  correction: (id, text) => post(`/farms/${id}/correction`, { text }),
  feedback: (id, vote, messageExcerpt) =>
    post(`/farms/${id}/feedback`, { vote, message_excerpt: messageExcerpt }),
  overrides: (id) => get(`/farms/${id}/overrides`),
};
