import React from "react";
import { motion } from "framer-motion";
import { BarChart3, Database, Loader2, Sparkles } from "lucide-react";

/**
 * Shimmer element overlay for skeleton placeholders
 */
export function Shimmer({ className = "" }) {
  return (
    <div
      className={`absolute inset-0 bg-gradient-to-r from-transparent via-black/[0.04] dark:via-white/[0.07] to-transparent animate-shimmer pointer-events-none ${className}`}
    />
  );
}

/**
 * Base versatile CardSkeleton
 */
export function CardSkeleton({ className = "", children }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-[#fcfaf5]/85 dark:bg-[#1c1c1e]/80 border border-stone-200/80 dark:border-white/[0.08] backdrop-blur-xl p-5 shadow-xs transition-all ${className}`}
    >
      <Shimmer />
      {children ? (
        children
      ) : (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="h-4 w-1/3 rounded-lg bg-stone-200/70 dark:bg-white/[0.08]" />
            <div className="h-4 w-8 rounded-full bg-stone-200/60 dark:bg-white/[0.06]" />
          </div>
          <div className="h-8 w-1/2 rounded-xl bg-stone-200/80 dark:bg-white/[0.1]" />
          <div className="h-3 w-3/4 rounded-md bg-stone-200/50 dark:bg-white/[0.05]" />
        </div>
      )}
    </div>
  );
}

/**
 * Single Stat / Metric Card Skeleton
 */
export function StatCardSkeleton({ accent = "blue" }) {
  const accentGlow = {
    blue: "bg-blue-500/10 text-blue-500 dark:text-blue-400",
    emerald: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400",
    sky: "bg-sky-500/10 text-sky-500 dark:text-sky-400",
    cyan: "bg-cyan-500/10 text-cyan-500 dark:text-cyan-400",
    amber: "bg-amber-500/10 text-amber-500 dark:text-amber-400",
  }[accent] || "bg-blue-500/10 text-blue-500 dark:text-blue-400";

  return (
    <div className="relative overflow-hidden bg-[#fcfaf5]/85 dark:bg-[#161618]/90 border border-stone-200/80 dark:border-white/10 p-5 rounded-2xl shadow-xs backdrop-blur-xl">
      <Shimmer />
      <div className="flex items-center justify-between mb-3">
        {/* Label placeholder */}
        <div className="h-3.5 w-28 rounded-md bg-stone-300/60 dark:bg-white/[0.09]" />
        {/* Icon container placeholder */}
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${accentGlow}`}>
          <div className="w-3.5 h-3.5 rounded-full bg-current opacity-40 animate-pulse" />
        </div>
      </div>
      {/* Big metric number placeholder */}
      <div className="h-7 w-24 rounded-lg bg-stone-300/80 dark:bg-white/[0.12] mb-2 animate-pulse" />
      {/* Subtext description placeholder */}
      <div className="h-3 w-40 rounded-md bg-stone-200/70 dark:bg-white/[0.05]" />
    </div>
  );
}

/**
 * Grid of Stat Cards Skeletons (configurable count)
 */
export function StatCardSkeletonGrid({ count = 4 }) {
  const accents = ["blue", "emerald", "sky", "cyan"];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
      {Array.from({ length: count }).map((_, idx) => (
        <StatCardSkeleton key={idx} accent={accents[idx % accents.length]} />
      ))}
    </div>
  );
}

/**
 * Realistic Chart Card Skeleton with simulated axes, bars, and loading badge
 */
export function ChartSkeleton({ title = "Generating Chart Visualization…", message = "Computing aggregations and rendering vector plots in background" }) {
  const barHeights = [45, 75, 30, 90, 60, 80, 40, 65, 85, 50, 70, 95];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#fcfaf5]/90 dark:bg-[#1c1c1e]/85 border border-stone-200/80 dark:border-white/[0.08] backdrop-blur-2xl p-6 shadow-sm animate-fade-in">
      <Shimmer />

      {/* Header bar placeholder */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-black/[0.04] dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#0071e3]/10 dark:bg-blue-500/20 text-[#0071e3] dark:text-blue-400 flex items-center justify-center">
            <BarChart3 size={15} />
          </div>
          <div className="space-y-1">
            <div className="h-4 w-36 rounded-md bg-stone-300/70 dark:bg-white/[0.1]" />
            <div className="h-2.5 w-24 rounded-md bg-stone-200/60 dark:bg-white/[0.05]" />
          </div>
        </div>

        {/* Floating status pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#0071e3]/10 dark:bg-blue-500/20 border border-[#0071e3]/20 dark:border-blue-400/20">
          <Loader2 size={12} className="text-[#0071e3] dark:text-blue-400 animate-spin" />
          <span className="text-[11px] font-semibold text-[#0071e3] dark:text-blue-300">
            Rendering in background
          </span>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative h-64 sm:h-72 w-full flex items-end justify-between gap-2 sm:gap-4 px-4 pb-6 pt-8 bg-black/[0.015] dark:bg-white/[0.02] rounded-2xl border border-black/[0.03] dark:border-white/[0.04]">
        {/* Horizontal grid guide lines */}
        <div className="absolute inset-x-4 top-10 border-b border-dashed border-black/[0.05] dark:border-white/[0.06]" />
        <div className="absolute inset-x-4 top-1/2 border-b border-dashed border-black/[0.05] dark:border-white/[0.06]" />
        <div className="absolute inset-x-4 bottom-6 border-b border-black/[0.08] dark:border-white/[0.1]" />

        {/* Animated simulated bars */}
        {barHeights.map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full z-10">
            <div
              className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-[#0071e3]/20 via-[#0284c7]/30 to-[#06b6d4]/40 dark:from-blue-500/20 dark:via-sky-500/30 dark:to-cyan-400/35 animate-pulse"
              style={{
                height: `${h}%`,
                animationDelay: `${i * 100}ms`,
                animationDuration: "1.8s",
              }}
            />
            <div className="w-5 h-2 mt-2 rounded bg-stone-300/40 dark:bg-white/[0.06]" />
          </div>
        ))}

        {/* Center overlay badge */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-20 pointer-events-none">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="px-5 py-3 rounded-2xl bg-[#fcfaf5]/90 dark:bg-[#1c1c1e]/90 border border-stone-200/90 dark:border-white/[0.12] shadow-lg backdrop-blur-xl flex flex-col items-center space-y-1.5 max-w-sm"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
              <span className="w-2 h-2 rounded-full bg-[#0071e3] dark:bg-cyan-400 animate-ping" />
              <span>{title}</span>
            </div>
            <p className="text-[11px] text-[#6e6e73] dark:text-[#a1a1a6] font-medium leading-tight">
              {message}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/**
 * Realistic Table Skeleton with columns and alternating rows
 */
export function TableSkeleton({
  rowsCount = 5,
  title = "Fetching Data Rows…",
  message = "Running DuckDB execution & preparing data table…",
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#fcfaf5]/90 dark:bg-[#1c1c1e]/80 border border-stone-200/80 dark:border-white/[0.08] backdrop-blur-2xl shadow-xs animate-fade-in flex flex-col">
      <Shimmer />

      {/* Header with Title & Status */}
      <div className="px-4 py-3 bg-black/[0.02] dark:bg-white/[0.02] border-b border-stone-200/70 dark:border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#0071e3]/10 dark:bg-blue-400/20 text-[#0071e3] dark:text-blue-400 flex items-center justify-center">
            <Database size={12} />
          </div>
          <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#0071e3] dark:text-blue-400">
          <Loader2 size={12} className="animate-spin" />
          <span>{message}</span>
        </div>
      </div>

      {/* Table Head Skeletons */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 px-4 py-2.5 bg-black/[0.015] dark:bg-white/[0.01] border-b border-black/[0.04] dark:border-white/[0.06]">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className={`h-3 rounded-md bg-stone-300/60 dark:bg-white/[0.08] ${
              idx === 4 ? "hidden sm:block" : ""
            }`}
          />
        ))}
      </div>

      {/* Table Row Skeletons */}
      <div className="divide-y divide-black/[0.03] dark:divide-white/[0.04]">
        {Array.from({ length: rowsCount }).map((_, rowIdx) => (
          <div
            key={rowIdx}
            className="grid grid-cols-4 sm:grid-cols-5 gap-3 px-4 py-3 items-center hover:bg-black/[0.01] transition-colors"
          >
            <div className="h-3 w-3/4 rounded bg-stone-300/50 dark:bg-white/[0.07] animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-stone-200/70 dark:bg-white/[0.05] animate-pulse" />
            <div className="h-3 w-4/5 rounded bg-stone-300/50 dark:bg-white/[0.07] animate-pulse" />
            <div className="h-3 w-2/3 rounded bg-stone-200/70 dark:bg-white/[0.05] animate-pulse" />
            <div className="hidden sm:block h-3 w-3/5 rounded bg-stone-300/50 dark:bg-white/[0.07] animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * AI Response Assistant Thinking & Generating Card Skeleton
 */
export function ChatAiSkeleton({ message = "AI analyzing dataset & generating response…" }) {
  return (
    <div className="flex justify-start w-full max-w-[95%] animate-fade-in">
      <div className="w-full relative overflow-hidden rounded-2xl rounded-tl-xs p-4.5 bg-[#fcfaf5]/90 dark:bg-[#1c1c1e]/85 backdrop-blur-2xl border border-stone-200/80 dark:border-white/[0.08] shadow-xs space-y-3">
        <Shimmer />

        {/* AI Header pill */}
        <div className="flex items-center gap-2.5 pb-2 border-b border-black/[0.04] dark:border-white/[0.06]">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#0071e3] to-[#06b6d4] flex items-center justify-center shadow-xs">
            <Sparkles size={12} className="text-white animate-spin" style={{ animationDuration: "4s" }} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-gradient-to-r from-[#0071e3] to-[#06b6d4] bg-clip-text text-transparent">
              Groq Llama 3.3
            </span>
            <span className="text-[11px] text-[#6e6e73] dark:text-[#a1a1a6] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3] animate-ping" />
              {message}
            </span>
          </div>
        </div>

        {/* Simulated markdown text lines */}
        <div className="space-y-2 pt-1">
          <div className="h-3.5 w-11/12 rounded-md bg-stone-300/60 dark:bg-white/[0.08] animate-pulse" />
          <div className="h-3.5 w-4/5 rounded-md bg-stone-300/50 dark:bg-white/[0.07] animate-pulse" />
          <div className="h-3.5 w-9/12 rounded-md bg-stone-300/60 dark:bg-white/[0.08] animate-pulse" />
        </div>

        {/* Simulated code/query card block */}
        <div className="p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] space-y-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#ff5f56]/70" />
            <div className="w-2 h-2 rounded-full bg-[#ffbd2e]/70" />
            <div className="w-2 h-2 rounded-full bg-[#27c93f]/70" />
          </div>
          <div className="h-3 w-2/3 rounded bg-stone-300/40 dark:bg-white/[0.05]" />
          <div className="h-3 w-1/2 rounded bg-stone-300/30 dark:bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}

export default CardSkeleton;
