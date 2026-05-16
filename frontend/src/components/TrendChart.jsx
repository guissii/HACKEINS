import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from "recharts";

export default function TrendChart({ history, fallbackHistory }) {
  // Backend gives newest-first; reverse for chronological chart.
  let rows = (history || []).slice().reverse();

  // If only one persisted reading, synthesize the 7-day moisture series
  // from the farm's current snapshot so the chart isn't a single dot.
  if (rows.length <= 1 && fallbackHistory?.length) {
    const today = new Date();
    rows = fallbackHistory.map((m, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (fallbackHistory.length - 1 - i));
      return {
        date: d.toISOString().slice(5, 10),
        soil_moisture_pct: m,
      };
    });
  } else {
    rows = rows.map((r) => ({ ...r, date: r.date.slice(5) }));
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-700">
          Soil moisture trend (last 7 days)
        </h3>
        <span className="text-xs text-slate-400">% saturation</span>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" fontSize={11} stroke="#64748b" />
            <YAxis fontSize={11} stroke="#64748b" domain={[0, 60]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="soil_moisture_pct"
              stroke="#0284c7"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              name="Soil moisture"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
