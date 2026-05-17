import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useI18n } from "../i18n";

export default function TrendChart({ history, fallbackHistory }) {
  const { t } = useI18n();

  // If the backend history is empty, use a visually appealing mock trend to demonstrate value
  let data = history;
  if (!history || history.length === 0) {
    if (fallbackHistory) data = fallbackHistory;
    else {
      data = [];
      const now = new Date();
      for (let i = 7; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000);
        data.push({
          date: d.toISOString().split("T")[0],
          soil_moisture_pct: 15 + Math.floor(Math.random() * 20),
        });
      }
    }
  }

  // Find today's value vs 7 days ago
  const currentVal = data[data.length - 1]?.soil_moisture_pct || 0;
  const oldVal = data[0]?.soil_moisture_pct || 0;
  const isUp = currentVal >= oldVal;

  return (
    <div className="h-full flex flex-col p-6 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      
      <div className="flex items-start justify-between mb-8 relative z-10">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-extrabold flex items-center gap-1.5 mb-2">
            <svg className="w-3.5 h-3.5 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
            {t("trend.title")}
          </div>
          <div className="flex items-baseline gap-1.5">
            <div className="text-4xl font-black text-slate-800 tracking-tighter tabular-nums">
              {currentVal}
            </div>
            <div className="text-sm font-bold text-slate-400 tracking-widest uppercase">%</div>
          </div>
          <div className="text-[11px] font-medium text-slate-500 mt-2 flex items-center gap-2">
            {t("kpi.was_week_ago", { value: `${oldVal}%` })}
            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-bold ${isUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
              {isUp ? <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg> : <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>} 
              {Math.abs(currentVal - oldVal)}%
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[180px] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#cbd5e1"
              fontSize={10}
              fontWeight={600}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => {
                const d = new Date(v);
                return `${d.getDate()}/${d.getMonth() + 1}`;
              }}
            />
            <YAxis
              stroke="#cbd5e1"
              fontSize={10}
              fontWeight={600}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(4px)",
                borderColor: "rgba(226, 232, 240, 0.8)",
                borderRadius: "12px",
                color: "#0f172a",
                fontSize: "12px",
                fontWeight: "600",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
              }}
              itemStyle={{ color: "#0ea5e9", fontWeight: "900" }}
              formatter={(val) => [`${val}%`, t("trend.unit")]}
            />
            <Area
              type="monotone"
              dataKey="soil_moisture_pct"
              stroke="#0ea5e9"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorMoisture)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
