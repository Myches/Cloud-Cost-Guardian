"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, HardDrive, Monitor, Flame } from "lucide-react";

export default function WasteDetection() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/waste")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="h-72 rounded-2xl bg-white/[0.02] border border-white/[0.07] animate-pulse" />
  );

  const hasWaste = data.totalWaste > 0;

  return (
    <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.12] transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-md flex items-center justify-center ${hasWaste ? "bg-amber-400/10" : "bg-emerald-400/10"}`}>
            <AlertTriangle className={`w-3.5 h-3.5 ${hasWaste ? "text-amber-400" : "text-emerald-400"}`} />
          </div>
          <span className="text-sm font-medium text-white/80">Waste Detection</span>
        </div>
        {hasWaste && (
          <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-full px-3 py-1">
            <Flame className="w-3 h-3 text-red-400" />
            <span className="text-xs font-semibold text-red-400">
              ~${data.totalWaste}<span className="font-normal text-red-400/70">/mo waste</span>
            </span>
          </div>
        )}
      </div>

      {/* Unattached volumes */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <HardDrive className="w-3.5 h-3.5 text-white/30" />
          <span className="text-xs text-white/40 font-medium">Unattached EBS Volumes</span>
          <span className="ml-auto text-xs font-mono text-white/25">
            {data.unattachedVolumes.length} found
          </span>
        </div>

        {data.unattachedVolumes.length === 0 ? (
          <div className="flex items-center gap-2 text-xs text-emerald-400/80 bg-emerald-400/5 border border-emerald-400/15 rounded-xl px-3 py-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            All volumes are attached
          </div>
        ) : (
          <div className="space-y-2">
            {data.unattachedVolumes.map((v: any) => (
              <div
                key={v.id}
                className="flex items-center justify-between bg-red-500/5 border border-red-500/15 rounded-xl px-3.5 py-2.5 group hover:border-red-500/30 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-mono text-white/80 truncate">{v.id}</p>
                  <p className="text-xs text-white/35 mt-0.5">
                    {v.sizeGb}GB {v.type}
                    <span className="mx-1.5 text-white/15">·</span>
                    <span className="capitalize">{v.team}</span>
                    <span className="mx-1.5 text-white/15">·</span>
                    {v.environment}
                  </p>
                </div>
                <span className="text-xs font-semibold text-red-400 ml-3 shrink-0">
                  ${v.monthlyCost}
                  <span className="text-red-400/50 font-normal">/mo</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Running instances */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Monitor className="w-3.5 h-3.5 text-white/30" />
          <span className="text-xs text-white/40 font-medium">Running EC2 Instances</span>
          <span className="ml-auto text-xs font-mono text-white/25">
            {data.runningInstances.length} active
          </span>
        </div>

        {data.runningInstances.length === 0 ? (
          <div className="flex items-center gap-2 text-xs text-emerald-400/80 bg-emerald-400/5 border border-emerald-400/15 rounded-xl px-3 py-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            No running instances detected
          </div>
        ) : (
          <div className="space-y-2 max-h-44 overflow-y-auto pr-1 scrollbar-thin">
            {data.runningInstances.map((inst: any) => (
              <div
                key={inst.id}
                className="flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-xl px-3.5 py-2.5 group hover:border-white/[0.12] transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-mono text-white/80 truncate">{inst.id}</p>
                  <p className="text-xs text-white/35 mt-0.5">
                    {inst.type}
                    <span className="mx-1.5 text-white/15">·</span>
                    <span className="capitalize">{inst.team}</span>
                  </p>
                </div>
                <span
                  className={`text-[10px] uppercase tracking-wide font-medium px-2.5 py-1 rounded-full ml-3 shrink-0 ${
                    inst.environment === "prod"
                      ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"
                      : "bg-amber-400/10 text-amber-400 border border-amber-400/20"
                  }`}
                >
                  {inst.environment}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
