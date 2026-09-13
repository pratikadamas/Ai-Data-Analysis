import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FileText, 
  Lock, 
  Layout, 
  BookOpen, 
  CheckCircle2, 
  FileSpreadsheet, 
  ShieldCheck, 
  LineChart, 
  Terminal, 
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  LayoutDashboard,
  Database,
  BarChart3
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle.jsx";
import { useUser } from "../context/UserContext.jsx";
import UserNavProfile from "../components/layout/UserNavProfile.jsx";

export default function Docs() {
  const { user } = useUser();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#262422] dark:bg-[#161617] dark:text-[#f5f5f7] font-sans antialiased overflow-x-hidden selection:bg-blue-500/20 transition-colors duration-300">
      
      {/* Subtle macOS Ambient Aura Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[90vw] h-[550px] bg-gradient-to-b from-blue-400/10 via-sky-300/6 to-transparent dark:from-blue-500/15 dark:via-cyan-500/10 blur-[140px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(#ded7cc_1px,transparent_1px)] dark:bg-[radial-gradient(#2d2d30_1px,transparent_1px)] [background-size:24px_24px] opacity-60 dark:opacity-40" />
      </div>

      {/* Floating Apple/macOS Styled Navigation Bar */}
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 left-0 right-0 z-50 max-w-5xl mx-auto px-4"
      >
        <div className="bg-[#fcfaf5]/60 dark:bg-[#1d1d1f]/60 backdrop-blur-2xl border border-stone-300/40 dark:border-white/[0.08] shadow-[0_8px_32px_rgba(40,30,20,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] rounded-full px-3.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between transition-all duration-300 hover:shadow-[0_12px_40px_rgba(40,30,20,0.06)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
          
          {/* Logo & Back button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate("/#footer");
                }
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold text-[#515154] dark:text-[#a1a1a6] hover:text-[#0071e3] dark:hover:text-white bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] hover:bg-black/[0.06] dark:hover:bg-white/[0.1] transition-all cursor-pointer select-none"
              title="Back to previous section"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group cursor-pointer select-none shrink-0">
              <img 
                src="/favicon.webp" 
                alt="AI Data Analysis Logo" 
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain transition-transform duration-300 group-hover:scale-105 shrink-0"
              />
              <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-[#0071e3] via-[#0284c7] to-[#06b6d4] dark:from-[#38bdf8] dark:via-[#0ea5e9] dark:to-[#06b6d4] bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
                <span className="hidden sm:inline">AI Data Analysis</span>
                <span className="sm:hidden">AI Analysis</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-7 text-sm font-medium text-[#515154] dark:text-[#a1a1a6]">
            <Link to="/#features" className="hover:text-[#0071e3] dark:hover:text-white transition-colors duration-200">Features</Link>
            <Link to="/#demo" className="hover:text-[#0071e3] dark:hover:text-white transition-colors duration-200">Interactive Demo</Link>
            <Link to="/docs" className="text-[#0071e3] dark:text-white font-semibold transition-colors duration-200">Documentation</Link>
            <Link to="/faq" className="hover:text-[#0071e3] dark:hover:text-white transition-colors duration-200">FAQs</Link>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <ThemeToggle />
            
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-3">
                <UserNavProfile />
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/app" className="relative group inline-flex items-center justify-center p-2 sm:px-4 sm:py-2 rounded-full text-white text-xs sm:text-sm font-medium bg-[#0071e3] hover:bg-[#0077ed] shadow-[0_4px_14px_rgba(0,113,227,0.35)] hover:shadow-[0_6px_20px_rgba(0,113,227,0.45)] transition-all duration-300" title="Launch Analytics Studio">
                    <span className="relative flex items-center gap-1.5">
                      <LayoutDashboard className="w-4 h-4 sm:hidden" />
                      <span className="hidden sm:inline">Launch App</span>
                      <ArrowRight className="hidden sm:inline w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>
                </motion.div>
              </div>
            ) : (
              <>
                <Link to="/login" className="hidden sm:inline-block text-[#515154] dark:text-[#a1a1a6] hover:text-[#0071e3] dark:hover:text-white font-medium text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06]">
                  Sign In
                </Link>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/register" className="relative group inline-flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-white text-xs sm:text-sm font-medium bg-[#0071e3] hover:bg-[#0077ed] shadow-[0_4px_14px_rgba(0,113,227,0.35)] hover:shadow-[0_6px_20px_rgba(0,113,227,0.45)] transition-all duration-300">
                    <span className="relative flex items-center gap-1.5">
                      Get Started
                    </span>
                  </Link>
                </motion.div>
              </>
            )}
          </div>

        </div>
      </motion.nav>

      {/* Main Content */}
      <section className="pt-36 pb-28 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#0071e3] text-xs font-semibold uppercase tracking-wider mb-4 border border-blue-100">
              <BookOpen className="w-3.5 h-3.5" /> Technical Reference & User Guide
            </div>
            <h1 className="text-4xl sm:text-5xl tracking-tight mb-4 text-[#1d1d1f] dark:text-[#f5f5f7]">
              <span className="font-kaushan text-transparent bg-clip-text bg-gradient-to-r from-[#0071e3] via-[#0284c7] to-[#06b6d4] dark:from-blue-400 dark:via-sky-300 dark:to-cyan-300">
                Documentation
              </span>
            </h1>
            <p className="text-lg text-[#6e6e73] dark:text-[#a1a1a6] leading-relaxed font-normal">
              Welcome to the AI Data Analysis documentation. Learn how to prepare your data, execute natural language queries, and understand the platform architecture.
            </p>
          </div>

          <div className="space-y-12">
            
            {/* Quickstart Card */}
            <div className="macos-card p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] dark:text-blue-400 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-[#262422] dark:text-[#f5f5f7]">
                  Supported Formats & Ingestion
                </h2>
              </div>
              <p className="text-stone-600 dark:text-[#a1a1a6] leading-relaxed mb-4">
                AI Data Analysis supports high-speed batch and streaming processing for:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-stone-200/80 dark:border-white/[0.06]">
                  <strong className="text-sm text-[#262422] dark:text-[#f5f5f7]">CSV Files (.csv)</strong>
                  <p className="text-xs text-stone-500 dark:text-[#a1a1a6] mt-0.5">Delimited text with automatic header and delimiter inferencing.</p>
                </div>
                <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-stone-200/80 dark:border-white/[0.06]">
                  <strong className="text-sm text-[#262422] dark:text-[#f5f5f7]">Excel Workbooks (.xlsx, .xls)</strong>
                  <p className="text-xs text-stone-500 dark:text-[#a1a1a6] mt-0.5">Multi-sheet spreadsheets parsed into DuckDB tables.</p>
                </div>
                <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-stone-200/80 dark:border-white/[0.06]">
                  <strong className="text-sm text-[#262422] dark:text-[#f5f5f7]">SQLite Databases (.db, .sqlite)</strong>
                  <p className="text-xs text-stone-500 dark:text-[#a1a1a6] mt-0.5">Embedded relational schemas attached in-memory.</p>
                </div>
                <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-stone-200/80 dark:border-white/[0.06]">
                  <strong className="text-sm text-[#262422] dark:text-[#f5f5f7]">SQL Dumps (.sql)</strong>
                  <p className="text-xs text-stone-500 dark:text-[#a1a1a6] mt-0.5">Standard DDL and DML table script execution.</p>
                </div>
              </div>
            </div>

            {/* AI Query Engine Card */}
            <div className="macos-card p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-[#0284c7] dark:text-cyan-400 flex items-center justify-center">
                  <Terminal className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-[#262422] dark:text-[#f5f5f7]">
                  Natural Language to SQL
                </h2>
              </div>
              <p className="text-stone-600 dark:text-[#a1a1a6] leading-relaxed mb-3">
                When you ask a question in the <strong>Ask AI</strong> panel, our system:
              </p>
              <ol className="list-decimal pl-6 space-y-2 text-stone-600 dark:text-[#a1a1a6]">
                <li>Transmits only schema column definitions and prompt queries to Groq Llama 3.3 70B (protecting data confidentiality).</li>
                <li>Receives a validated, deterministic DuckDB SQL query.</li>
                <li>Executes the query directly in zero-latency in-memory DuckDB.</li>
                <li>Constructs interactive Plotly specifications or paginated result tables.</li>
              </ol>
            </div>

            {/* Visualizer Card */}
            <div className="macos-card p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-[#262422] dark:text-[#f5f5f7]">
                  Interactive Charting
                </h2>
              </div>
              <p className="text-stone-600 dark:text-[#a1a1a6] leading-relaxed">
                Render bar, line, pie, scatter, area, histogram, and box charts using Plotly.js.
              </p>
              <p className="mt-4 text-sm sm:text-base font-semibold text-[#262422] dark:text-[#f5f5f7]">Use the built-in Plotly control toolbar to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2 text-sm sm:text-base text-stone-600 dark:text-[#a1a1a6]">
                <li>Zoom into specific data ranges and outliers.</li>
                <li>Pan across continuous time-series data.</li>
                <li>Export publication-ready, high-resolution PNG charts directly to your device.</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Static Footer */}
      <footer className="bg-[#fcfaf5] dark:bg-[#050505] border-t border-stone-200/80 dark:border-gray-800/50 py-12 text-stone-500 dark:text-gray-400 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-medium">&copy; {new Date().getFullYear()} <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#0071e3] to-[#06b6d4]">AI Data Analysis</span></span>
          <div className="flex space-x-6 text-sm">
            <Link to="/faq" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-gray-500 dark:text-gray-400">FAQs</Link>
            <Link to="/privacy" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-gray-500 dark:text-gray-400">Privacy</Link>
            <Link to="/terms" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-gray-500 dark:text-gray-400">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
