const BASE = "/api";

async function get(path) {
  const r = await fetch(`${BASE}${path}`);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

async function post(path, body) {
  const r = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
