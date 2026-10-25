import React, { useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home,
  ArrowLeft,
  BookOpen,
  Database,
  BarChart3,
  Wifi,
  GitBranch,
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle.jsx";

/* ─────────────────────────────────────────────────────────────────────────────
   Broken-graph SVG illustration — inline so no extra asset is needed.
   Uses currentColor so it inherits light/dark text colour automatically.
──────────────────────────────────────────────────────────────────────────────*/
function BrokenDataIllustration() {
  return (
    <svg
      viewBox="0 0 320 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="w-full max-w-[320px] mx-auto"
    >
      {/* Grid lines */}
      {[40, 80, 120, 160].map((y) => (
        <line
          key={y}
          x1="24"
          y1={y}
          x2="296"
          y2={y}
          stroke="currentColor"
          strokeOpacity="0.08"
          strokeWidth="1"
        />
      ))}
      {[80, 136, 192, 248].map((x) => (
        <line
          key={x}
          x1={x}
          y1="20"
          x2={x}
          y2="180"
          stroke="currentColor"
          strokeOpacity="0.08"
          strokeWidth="1"
        />
      ))}

      {/* Axes */}
      <line
        x1="24"
        y1="180"
        x2="296"
        y2="180"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="24"
        y1="20"
        x2="24"
        y2="180"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Intact left segment of line chart */}
      <motion.path
        d="M 24 160 L 80 110 L 136 125 L 160 85"
        stroke="#0071e3"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.0, delay: 0.3, ease: "easeOut" }}
      />

      {/* Broken / disconnected right segment */}
      <motion.path
        d="M 192 105 L 248 135 L 296 65"
        stroke="#06b6d4"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="6 4"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.5 }}
        transition={{ duration: 0.8, delay: 1.1, ease: "easeOut" }}
      />

      {/* "Gap" warning icon in the middle break */}
      <motion.g
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.4, type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformOrigin: "176px 95px" }}
      >
        <circle cx="176" cy="95" r="13" fill="#ef4444" fillOpacity="0.15" />
        <circle
          cx="176"
          cy="95"
          r="13"
          stroke="#ef4444"
          strokeWidth="1.5"
          strokeOpacity="0.7"
        />
        {/* ! mark */}
        <line
          x1="176"
          y1="88"
          x2="176"
          y2="97"
          stroke="#ef4444"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="176" cy="102" r="1.2" fill="#ef4444" />
      </motion.g>

      {/* Bar chart in bottom-right, one bar missing/hollow */}
      {[
        { x: 232, h: 40, fill: "#0071e3", stroke: undefined, opacity: 0.7 },
        { x: 248, h: 60, fill: "#0284c7", stroke: undefined, opacity: 0.7 },
        { x: 264, h: 20, fill: "none",    stroke: "#ef4444", opacity: 0.5 },
        { x: 280, h: 50, fill: "#06b6d4", stroke: undefined, opacity: 0.7 },
      ].map(({ x, h, fill, stroke, opacity }, i) => (
        <motion.rect
          key={x}
          x={x}
          y={180 - h}
          width="10"
          height={h}
          rx="2"
          fill={fill}
          stroke={stroke}
          strokeWidth={stroke ? 1.5 : 0}
          strokeDasharray={stroke ? "3 2" : undefined}
          fillOpacity={opacity}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ delay: 0.5 + i * 0.12, duration: 0.45, ease: "easeOut" }}
          style={{ transformOrigin: `${x + 5}px 180px` }}
        />
      ))}

      {/* Disconnected database node */}
      <motion.g
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <ellipse cx="54" cy="48" rx="18" ry="6" fill="#0071e3" fillOpacity="0.15" stroke="#0071e3" strokeOpacity="0.4" strokeWidth="1.2" />
        <rect x="36" y="48" width="36" height="14" fill="#0071e3" fillOpacity="0.1" />
        <ellipse cx="54" cy="62" rx="18" ry="6" fill="#0071e3" fillOpacity="0.15" stroke="#0071e3" strokeOpacity="0.4" strokeWidth="1.2" />
        {/* Broken link going to right */}
        <line x1="72" y1="55" x2="84" y2="55" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" strokeOpacity="0.6" />
        <line x1="88" y1="55" x2="100" y2="55" stroke="#6b7280" strokeWidth="1.5" strokeDasharray="3 2" strokeOpacity="0.3" />
      </motion.g>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Floating ambient orbs — match the MainAppLoader / Docs page pattern
──────────────────────────────────────────────────────────────────────────────*/
function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Dot-matrix grid */}
      <div
        className="absolute inset-0 opacity-[0.5] dark:opacity-[0.35]"
        style={{
          backgroundImage: "radial-gradient(#ded7cc 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      {/* Top-centre blue ambient glow */}
      <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[80vw] h-[500px] bg-gradient-to-b from-blue-400/12 via-sky-300/8 to-transparent dark:from-blue-500/18 dark:via-cyan-500/12 blur-[130px] rounded-full" />
      {/* Bottom-right cyan orb */}
      <div className="absolute bottom-[-10%] right-[-5%] w-[40vw] h-[400px] bg-gradient-to-tl from-cyan-400/10 via-indigo-400/8 to-transparent dark:from-cyan-500/15 dark:via-indigo-600/12 blur-[110px] rounded-full" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Floating data-chip decorations
──────────────────────────────────────────────────────────────────────────────*/
const CHIPS = [
  { icon: Database,  label: "DuckDB",    delay: 0.10, cls: "top-[12%] left-[8%]  sm:left-[12%]" },
  { icon: BarChart3, label: "Analytics", delay: 0.20, cls: "top-[18%] right-[8%] sm:right-[14%]" },
  { icon: Wifi,      label: "No Signal", delay: 0.30, cls: "bottom-[22%] left-[6%]  sm:left-[10%]" },
  { icon: GitBranch, label: "SQL Query", delay: 0.15, cls: "bottom-[18%] right-[6%] sm:right-[10%]" },
];

function FloatingChip({ icon: Icon, label, delay, cls }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      aria-hidden="true"
      className={`absolute hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full
        bg-white/60 dark:bg-white/[0.06] border border-stone-200/70 dark:border-white/[0.08]
        backdrop-blur-md shadow-sm text-xs font-medium text-stone-500 dark:text-zinc-400
        select-none pointer-events-none animate-float ${cls}`}
    >
      <Icon className="w-3.5 h-3.5 text-[#0071e3] dark:text-sky-400" />
      {label}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main NotFound page
──────────────────────────────────────────────────────────────────────────────*/
export default function NotFound() {
  const navigate = useNavigate();

  /* Update document title */
  useEffect(() => {
    document.title = "404 – Page Not Found | AI Data Analysis Platform";
    return () => {
      document.title = "AI Data Analysis Platform";
    };
  }, []);

  /* "Go Back" — fall back to dashboard if no usable history entry */
  const handleGoBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#f7f5f0] text-[#262422] dark:bg-[#161617] dark:text-[#f5f5f7] font-sans antialiased overflow-x-hidden selection:bg-blue-500/20 transition-colors duration-300">
      <AmbientBackground />

      {/* Floating decorative chips */}
      {CHIPS.map((chip) => (
        <FloatingChip key={chip.label} {...chip} />
      ))}

      {/* ── Minimal top bar ────────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex items-center justify-between px-5 sm:px-8 py-4"
      >
        <Link
          to="/"
          className="flex items-center gap-2.5 group cursor-pointer"
          aria-label="Back to home"
        >
          <img
            src="/favicon.webp"
            alt="AI Data Analysis logo"
            className="w-7 h-7 object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_2px_10px_rgba(0,113,227,0.3)]"
          />
          <span className="text-sm sm:text-base font-bold tracking-tight font-outfit bg-gradient-to-r from-[#0071e3] via-[#0284c7] to-[#06b6d4] dark:from-[#38bdf8] dark:via-[#0ea5e9] dark:to-[#06b6d4] bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
            AI Data Analysis
          </span>
        </Link>

        <ThemeToggle />
      </motion.header>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main
        className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 sm:px-8 py-12 text-center"
        aria-labelledby="not-found-heading"
      >
        {/* 404 large gradient number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden="true"
          className="relative mb-2 select-none"
        >
          <span
            className="block font-outfit font-black leading-none
              bg-gradient-to-br from-[#0071e3] via-[#0284c7] to-[#06b6d4]
              dark:from-[#38bdf8] dark:via-[#0ea5e9] dark:to-[#06b6d4]
              bg-clip-text text-transparent
              drop-shadow-[0_8px_40px_rgba(0,113,227,0.18)]
              dark:drop-shadow-[0_8px_40px_rgba(56,189,248,0.22)]"
            style={{ fontSize: "clamp(7rem, 22vw, 14rem)" }}
          >
            404
          </span>
          {/* Subtle glow behind the number */}
          <div
            className="absolute inset-0 -z-10 blur-3xl opacity-20 dark:opacity-30
              bg-gradient-to-br from-[#0071e3] to-[#06b6d4] rounded-full scale-75"
            aria-hidden="true"
          />
        </motion.div>

        {/* SVG illustration */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[300px] sm:max-w-[340px] mb-8 text-[#262422] dark:text-[#f5f5f7]"
          aria-hidden="true"
        >
          <BrokenDataIllustration />
        </motion.div>

        {/* Headings & body copy */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-lg"
        >
          <h1
            id="not-found-heading"
            className="font-outfit font-bold text-2xl sm:text-3xl md:text-4xl tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] mb-3"
          >
            Oops! Data Not Found.
          </h1>
          <p className="text-sm sm:text-base text-stone-500 dark:text-zinc-400 leading-relaxed max-w-md mx-auto">
            Looks like this page got lost in the data. The resource you&apos;re
            looking for doesn&apos;t exist or may have moved.
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          {/* Primary — Back to Dashboard */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full
              bg-gradient-to-r from-[#0071e3] to-[#0284c7]
              hover:from-[#0077ed] hover:to-[#0290d4]
              active:scale-[0.97] text-white font-semibold text-sm
              shadow-[0_4px_20px_rgba(0,113,227,0.35)] hover:shadow-[0_6px_24px_rgba(0,113,227,0.45)]
              transition-all duration-200
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            Back to Dashboard
          </Link>

          {/* Secondary — Go Back */}
          <button
            type="button"
            onClick={handleGoBack}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full
              bg-black/[0.05] hover:bg-black/[0.09]
              dark:bg-white/[0.07] dark:hover:bg-white/[0.12]
              border border-black/[0.08] dark:border-white/[0.1]
              text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold text-sm
              active:scale-[0.97] transition-all duration-200
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Go Back
          </button>

          {/* Tertiary — Explore Docs (links to existing /docs route) */}
          <Link
            to="/docs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full
              bg-black/[0.03] hover:bg-black/[0.07]
              dark:bg-white/[0.04] dark:hover:bg-white/[0.08]
              border border-black/[0.06] dark:border-white/[0.08]
              text-stone-500 dark:text-zinc-400 hover:text-[#0071e3] dark:hover:text-sky-400
              font-medium text-sm active:scale-[0.97] transition-all duration-200
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
          >
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            Explore Docs
          </Link>
        </motion.div>

        {/* Status micro-badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="mt-10 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-stone-400 dark:text-zinc-600 select-none"
          aria-hidden="true"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Error 404 &middot; Route not found
          <span className="mx-1 opacity-40">&middot;</span>
          DuckDB + Groq AI
        </motion.div>
      </main>

      {/* ── Minimal footer ─────────────────────────────────────────────────── */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="relative z-10 pb-6 text-center text-xs text-stone-400 dark:text-zinc-600 select-none"
      >
        &copy; {new Date().getFullYear()} AI Data Analysis Platform &mdash; All
        rights reserved
      </motion.footer>
    </div>
  );
}
