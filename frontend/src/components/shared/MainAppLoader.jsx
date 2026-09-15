import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MainAppLoader({ text = "Loading AI Data Analysis..." }) {
  // Micro step-phases for high-tech data analysis feel
  const [phaseIndex, setPhaseIndex] = useState(0);

  const loadingPhases = [
    text,
    "Synchronizing in-memory DuckDB engine...",
    "Validating secure analytical environment...",
    "Preparing intelligent AI workspace...",
  ];

  useEffect(() => {
    // Only cycle hints if using default or generic loading message
    const interval = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % loadingPhases.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [loadingPhases.length]);

  const activeText = text !== "Loading AI Data Analysis..." ? text : loadingPhases[phaseIndex];

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#f7f5f0]/95 dark:bg-[#0c0c0e]/95 backdrop-blur-2xl text-[#262422] dark:text-[#f5f5f7] select-none transition-colors duration-500 overflow-hidden">
      
      {/* ── Background Subtle Tech Dot Matrix ────────────────────────── */}
      <div 
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(currentColor 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* ── Ambient Floating Glow Nebulas ───────────────────────────── */}
      <div className="absolute w-[500px] h-[500px] -top-24 -left-24 rounded-full bg-gradient-to-tr from-[#0071e3]/20 via-[#38bdf8]/15 to-transparent dark:from-blue-600/25 dark:via-cyan-500/15 dark:to-transparent blur-[110px] pointer-events-none animate-pulse" />
      <div className="absolute w-[450px] h-[450px] -bottom-20 -right-20 rounded-full bg-gradient-to-br from-[#06b6d4]/20 via-[#6366f1]/15 to-transparent dark:from-cyan-500/20 dark:via-indigo-600/20 dark:to-transparent blur-[110px] pointer-events-none" />

      {/* ── Center Loader (Unboxed, Seamless Floating) ─────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col items-center w-full max-w-[340px] px-6"
      >

        {/* ── Tri-Orbital Quantum Reactor ──────────────────────────── */}
        <div className="relative w-32 h-32 flex items-center justify-center mb-7">
          
          {/* Ambient Core Glow */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-[#0071e3]/30 to-[#06b6d4]/30 dark:from-blue-500/35 dark:to-cyan-400/35 blur-xl animate-pulse" />

          {/* Outer Orbital Ring (Clean Static Ring without Dot Spin) */}
          <div className="absolute inset-0 rounded-full border border-dashed border-blue-500/25 dark:border-cyan-400/25" />

          {/* Middle Counter-Rotating Shimmer Arc (Counter-Clockwise) */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-3 rounded-full border-2 border-transparent border-t-[#0071e3] border-r-[#06b6d4] dark:border-t-blue-400 dark:border-r-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
          />

          {/* Inner Fast Pulse Ring (Clockwise) */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-6 rounded-full border border-stone-200/60 dark:border-white/10 border-t-cyan-500 dark:border-t-cyan-300"
          />

          {/* Central Logo Floating (Cleanly without square box background) */}
          <motion.div
            animate={{ 
              scale: [1, 1.08, 1],
              y: [0, -4, 0]
            }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 w-16 h-16 flex items-center justify-center select-none pointer-events-none"
          >
            <img 
              src="/favicon.webp" 
              alt="AI Data Analysis Brand Icon" 
              className="w-full h-full object-contain drop-shadow-[0_8px_20px_rgba(0,113,227,0.35)] dark:drop-shadow-[0_8px_24px_rgba(56,189,248,0.4)]"
            />
          </motion.div>
        </div>

        {/* ── Brand Title & Active Status Indicator ────────────────── */}
        <div className="text-center w-full space-y-2">
          
          {/* App Name with Shimmer Gradient */}
          <h2 className="font-outfit font-bold text-lg tracking-tight bg-gradient-to-r from-[#0071e3] via-[#0284c7] to-[#06b6d4] dark:from-[#38bdf8] dark:via-[#0ea5e9] dark:to-[#06b6d4] bg-clip-text text-transparent">
            AI Data Analysis
          </h2>

          {/* Dynamic Frequency Bars */}
          <div className="flex items-center justify-center gap-1 py-1">
            {[0.4, 0.7, 1.0, 0.6, 0.8, 0.4].map((scale, i) => (
              <motion.span
                key={i}
                animate={{
                  scaleY: [0.3, scale, 0.3],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 1.1,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
                className="w-1 h-3.5 rounded-full bg-gradient-to-t from-[#0071e3] to-[#06b6d4] dark:from-blue-400 dark:to-cyan-400 origin-center"
              />
            ))}
          </div>

          {/* Smooth Fade Status Text */}
          <div className="h-6 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={activeText}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className="text-xs font-medium text-stone-500 dark:text-zinc-400 truncate max-w-[290px] px-1"
              >
                {activeText}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* ── High-Tech Laser Beam Progress Bar ─────────────────────── */}
        <div className="w-full mt-6">
          <div className="relative w-full h-1.5 rounded-full bg-stone-300/70 dark:bg-white/[0.08] overflow-hidden">
            {/* Sliding Laser Gradient Beam */}
            <motion.div
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-y-0 w-1/2 rounded-full bg-gradient-to-r from-transparent via-[#0071e3] to-[#06b6d4] dark:via-blue-400 dark:to-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
            />
          </div>

          {/* Footer Micro-Badge */}
          <div className="flex items-center justify-between mt-3 px-1 text-[10px] font-semibold text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Engine Online
            </span>
            <span>DuckDB + Groq AI</span>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
