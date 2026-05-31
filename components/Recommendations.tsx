"use client";
import { useEffect, useState } from "react";
import { Zap, TrendingDown, Clock } from "lucide-react";

export default function Recommendations() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/recommendations")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="h-36 rounded-2xl bg-white/[0.02] border border-white/[0.07] animate-pulse" />
  );

  const totalSaving = data.recommendations.reduce(
    (sum: number, r: any) => sum + (parseFloat(r.estimatedSaving) || 0),
    0
  );

  return (
    <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.12] transition-colors">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-6 h-6 rounded-md bg-yellow-400/10 flex items-center justify-center">
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
        </div>
        <span className="text-sm font-medium text-white/80">Rightsizing Recommendations</span>
        <div className="ml-auto flex items-center gap-2">
          {data.recommendations.length > 0 && (
            <div className="flex items-center gap-1.5 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-3 py-1">
              <TrendingDown className="w-3 h-3 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400">
                ${totalSaving.toFixed(0)}
                <span className="font-normal text-emerald-400/60">/mo potential savings</span>
              </span>
            </div>
          )}
          {data.recommendations.length > 0 && (
            <span className="text-xs bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 px-2.5 py-1 rounded-full font-medium">
              {data.recommendations.length} available
            </span>
          )}
        </div>
      </div>

      {data.recommendations.length === 0 ? (
        <div className="flex items-center gap-3 text-xs text-white/30 bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3">
          <Clock className="w-4 h-4 shrink-0 text-white/20" />
          No recommendations yet — Compute Optimizer needs 24–48 hours after opt-in to generate suggestions.
        </div>
      ) : (
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Instance", "Finding", "Current type", "Recommended", "Est. saving"].map((h, i) => (
                  <th
                    key={h}
                    className={`text-xs font-medium text-white/30 pb-3 ${i === 4 ? "text-right" : "text-left"} ${i > 0 ? "pl-4" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {data.recommendations.map((r: any, i: number) => (
                <tr
                  key={i}
                  className="group hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 pr-4">
                    <span className="text-xs font-mono text-white/70 group-hover:text-white/90 transition-colors">
                      {r.instanceName || r.instanceArn?.split("/").pop()}
                    </span>
                  </td>
                  <td className="py-3 pl-4">
                    <span
                      className={`text-[10px] uppercase tracking-wide font-medium px-2.5 py-1 rounded-full border ${
                        r.finding === "OVER_PROVISIONED"
                          ? "bg-red-400/10 text-red-400 border-red-400/20"
                          : "bg-white/5 text-white/40 border-white/10"
                      }`}
                    >
                      {r.finding === "OVER_PROVISIONED" ? "Over-provisioned" : r.finding}
                    </span>
                  </td>
                  <td className="py-3 pl-4">
                    <span className="text-xs font-mono text-white/40 line-through decoration-white/20">
                      {r.currentType}
                    </span>
                  </td>
                  <td className="py-3 pl-4">
                    <span className="text-xs font-mono text-emerald-400 font-medium">
                      {r.recommendedType}
                    </span>
                  </td>
                  <td className="py-3 pl-4 text-right">
                    <span className="text-xs font-bold text-emerald-400">
                      ${r.estimatedSaving}
                      <span className="text-emerald-400/50 font-normal">/mo</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
