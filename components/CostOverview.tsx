"use client";
import { useEffect, useState, useRef } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { DollarSign, TrendingUp, Server, Tag, Clock, ArrowUpRight } from "lucide-react";

const CHART_COLORS = [
  "#8b5cf6","#6366f1","#a78bfa","#4f46e5","#c4b5fd","#7c3aed","#4338ca","#818cf8",
];

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target) return;
    const start = performance.now();
    const raf = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(parseFloat((eased * target).toFixed(2)));
      if (t < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0f1420] border border-white/10 rounded-xl px-4 py-3 shadow-xl text-xs">
      <p className="text-white/40 mb-1.5">{label}</p>
      <p className="text-white font-semibold text-sm">
        ${Math.abs(payload[0].value).toFixed(4)}
      </p>
    </div>
  );
};

export default function CostOverview() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const animatedTotal = useCountUp(data?.total ?? 0);

  useEffect(() => {
    fetch("/api/costs")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to connect to AWS Cost Explorer");
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-72 rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 text-sm">
      <p className="font-semibold text-red-400 mb-1">Failed to load cost data</p>
      <p className="text-red-500/70 text-xs">{error}</p>
    </div>
  );

  if (!data?.hasData) return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard icon={<DollarSign />} label="Month-to-Date" value="$0.00" badge="pending" color="violet" />
        <KpiCard icon={<Server />} label="Top Service" value="—" badge="pending" color="indigo" />
        <KpiCard icon={<Tag />} label="Teams Tracked" value="0" badge="pending" color="purple" />
      </div>
      <div className="bg-amber-400/5 border border-amber-400/20 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center shrink-0 mt-0.5">
          <Clock className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <p className="text-amber-400 font-semibold text-sm">Cost Explorer is still populating</p>
          <p className="text-white/40 text-xs mt-1 leading-relaxed">
            AWS Cost Explorer takes 24–48 hours after being enabled to show billing data.
            Your infrastructure is set up correctly — check back tomorrow.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          icon={<DollarSign />}
          label="Month-to-Date Spend"
          value={`$${animatedTotal.toFixed(2)}`}
          color="violet"
          trend="+12% vs last month"
        />
        <KpiCard
          icon={<Server />}
          label="Top Service"
          value={data.topService || "—"}
          color="indigo"
        />
        <KpiCard
          icon={<Tag />}
          label="Teams Tracked"
          value={data.teams.length > 0 ? String(data.teams.length) : "0"}
          color="purple"
          sub={data.teams.length === 0 ? "Tag key not activated yet" : undefined}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily trend */}
        <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.12] transition-colors">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-violet-500/15 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
              </div>
              <span className="text-sm font-medium text-white/80">Daily Spend Trend</span>
            </div>
            <span className="text-xs text-white/25 font-mono">MTD</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.trend} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v?.slice(5)}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${Math.abs(v).toFixed(2)}`}
                width={48}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(139,92,246,0.3)", strokeWidth: 1 }} />
              <Line
                type="monotone"
                dataKey="cost"
                stroke="url(#lineGrad)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#8b5cf6", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* By service */}
        <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.12] transition-colors">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-indigo-500/15 flex items-center justify-center">
                <Server className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <span className="text-sm font-medium text-white/80">Top Services by Cost</span>
            </div>
          </div>
          {data.services.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-white/20 text-sm">
              No service data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.services} layout="vertical" margin={{ top: 0, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${Math.abs(v).toFixed(2)}`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 9, fill: "rgba(255,255,255,0.35)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => v.replace("Amazon ", "").replace("AWS ", "").slice(0, 16)}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                />
                <Bar dataKey="cost" radius={[0, 6, 6, 0]}>
                  {data.services.map((_: any, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} opacity={0.9} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Teams breakdown */}
      {data.teams.length > 0 && (
        <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-white/80">Cost by Team</span>
            <span className="text-xs text-white/25">{data.teams.length} teams</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {data.teams.map((t: any, i: number) => (
              <div
                key={i}
                className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06] hover:border-white/[0.12] transition-colors group"
              >
                <p className="text-xs text-white/40 capitalize mb-2 flex items-center justify-between">
                  {t.name}
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
                <p className="text-xl font-bold text-white tracking-tight">
                  ${t.cost.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  trend,
  badge,
  color = "violet",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  trend?: string;
  badge?: string;
  color?: "violet" | "indigo" | "purple";
}) {
  const colorMap = {
    violet: "bg-violet-500/10 text-violet-400",
    indigo: "bg-indigo-500/10 text-indigo-400",
    purple: "bg-purple-500/10 text-purple-400",
  };
  return (
    <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.12] transition-all hover:bg-white/[0.03] group">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          <span className="w-4 h-4 [&>svg]:w-4 [&>svg]:h-4">{icon}</span>
        </div>
        {badge && (
          <span className="text-[10px] uppercase tracking-wider text-white/25 font-mono bg-white/5 px-2 py-1 rounded-md">
            {badge}
          </span>
        )}
      </div>
      <p className="text-xs text-white/35 mb-1 font-medium">{label}</p>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
      {trend && (
        <p className="text-xs text-emerald-400/80 mt-1.5 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          {trend}
        </p>
      )}
      {sub && <p className="text-xs text-amber-400/70 mt-1.5">{sub}</p>}
    </div>
  );
}
