"use client";
import { useEffect, useState } from "react";
import { BarChart2, AlertCircle } from "lucide-react";

export default function BudgetStatus() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/budgets")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load budget data");
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="h-72 rounded-2xl bg-white/[0.02] border border-white/[0.07] animate-pulse" />
  );

  if (error) return (
    <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
      <p className="text-red-400 text-sm">{error}</p>
    </div>
  );

  const statusConfig = (s: string) => ({
    critical: {
      text: "text-red-400",
      bar: "bg-gradient-to-r from-red-500 to-red-400",
      badge: "bg-red-400/10 text-red-400 border-red-400/20",
    },
    warning: {
      text: "text-amber-400",
      bar: "bg-gradient-to-r from-amber-500 to-amber-400",
      badge: "bg-amber-400/10 text-amber-400 border-amber-400/20",
    },
    ok: {
      text: "text-emerald-400",
      bar: "bg-gradient-to-r from-violet-600 to-indigo-500",
      badge: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    },
  }[s] ?? {
    text: "text-white/50",
    bar: "bg-white/20",
    badge: "bg-white/5 text-white/40 border-white/10",
  });

  return (
    <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.12] transition-colors">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-6 h-6 rounded-md bg-indigo-500/10 flex items-center justify-center">
          <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
        </div>
        <span className="text-sm font-medium text-white/80">Budget Status</span>
        <span className="ml-auto text-xs font-mono text-white/25">
          {data.budgets.length} budget{data.budgets.length !== 1 ? "s" : ""}
        </span>
      </div>

      {data.budgets.length === 0 ? (
        <div className="flex items-center gap-2 text-xs text-white/30 bg-white/[0.02] rounded-xl px-4 py-3 border border-white/[0.06]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          No budgets found — check Terraform deployed successfully
        </div>
      ) : (
        <div className="space-y-5">
          {data.budgets.map((b: any) => {
            const cfg = statusConfig(b.status);
            return (
              <div key={b.name}>
                {/* Label row */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white/70 capitalize">{b.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase tracking-wide font-medium px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                      {b.status}
                    </span>
                    <span className={`text-xs font-bold tabular-nums ${cfg.text}`}>
                      {b.pct}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="relative h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${cfg.bar}`}
                    style={{ width: `${Math.min(b.pct, 100)}%` }}
                  />
                  {/* Threshold markers */}
                  <div className="absolute top-0 left-[80%] h-full w-px bg-white/20" title="80%" />
                  <div className="absolute top-0 left-[90%] h-full w-px bg-white/20" title="90%" />
                </div>

                {/* Spend details */}
                <div className="flex justify-between text-xs">
                  <span className="text-white/30">
                    <span className="text-white/60">${b.actual}</span>
                    <span className="mx-1 text-white/15">/</span>
                    <span className="text-white/40">${b.limit}</span>
                  </span>
                  <span className="text-white/25">
                    Forecast{" "}
                    <span className={b.pct >= 90 ? "text-red-400" : "text-white/50"}>
                      ${b.forecast}
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
