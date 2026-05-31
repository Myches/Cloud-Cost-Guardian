"use client";
import CostOverview from "../components/CostOverview";
import WasteDetection from "../components/WasteDetection";
import BudgetStatus from "../components/BudgetStatus";
import Recommendations from "../components/Recommendations";
import { Cloud, RefreshCw } from "lucide-react";

export default function Dashboard() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="min-h-screen bg-[#080b12] text-white">
      {/* Top nav bar */}
      <header className="border-b border-white/[0.06] bg-[#080b12]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Cloud className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">
              CloudCost<span className="text-violet-400">Guardian</span>
            </span>
            <span className="hidden sm:block h-4 w-px bg-white/10" />
            <span className="hidden sm:block text-xs text-white/30 font-mono">
              AWS Cost Intelligence
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-white/25 font-mono tabular-nums hidden md:block">
              {dateStr} · {timeStr}
            </span>
            <button className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-1.5 rounded-md hover:bg-white/5 border border-white/[0.06]">
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">
        {/* Page title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Cost Overview
            </h1>
            <p className="text-sm text-white/40 mt-0.5">
              Real-time AWS spend visibility and anomaly detection
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/30">
            <span className="font-mono">us-east-1</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>Production account</span>
          </div>
        </div>

        {/* Cost overview */}
        <CostOverview />

        {/* Waste + Budgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <WasteDetection />
          <BudgetStatus />
        </div>

        {/* Recommendations */}
        <Recommendations />

        {/* Footer */}
        <p className="text-center text-xs text-white/15 pb-4 font-mono">
          CloudCost Guardian · Powered by AWS Cost Explorer & Compute Optimizer
        </p>
      </div>
    </main>
  );
}
