import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  Database, 
  Terminal, 
  Sparkles, 
  FileSpreadsheet, 
  Code2, 
  Cpu, 
  ShieldCheck, 
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Layers,
  BarChart3,
  LayoutDashboard,
  Menu,
  X
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle.jsx";
import { useUser } from "../context/UserContext.jsx";
import UserNavProfile from "../components/layout/UserNavProfile.jsx";

export default function Docs() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Track scroll position to morph navbar from full width (top) to floating pill (scrolled)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#262422] dark:bg-[#161617] dark:text-[#f5f5f7] font-sans antialiased overflow-x-hidden selection:bg-blue-500/20 transition-colors duration-300">
      
      {/* Subtle macOS Ambient Aura Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[90vw] h-[550px] bg-gradient-to-b from-blue-400/10 via-sky-300/6 to-transparent dark:from-blue-500/15 dark:via-cyan-500/10 blur-[140px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(#ded7cc_1px,transparent_1px)] dark:bg-[radial-gradient(#2d2d30_1px,transparent_1px)] [background-size:24px_24px] opacity-60 dark:opacity-40" />
      </div>

      {/* Dynamic Navigation Bar (Full width initially -> Floating squeezed pill on scroll) */}
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center px-3 sm:px-6 pointer-events-none"
      >
        <div className="w-full flex flex-col items-center">
          <div className={`pointer-events-auto flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isScrolled
              ? "mt-2.5 sm:mt-3 w-full max-w-5xl h-14 sm:h-16 px-3.5 sm:px-7 rounded-2xl sm:rounded-full bg-[#fcfaf5]/75 dark:bg-[#1d1d1f]/75 backdrop-blur-2xl shadow-[0_12px_36px_rgba(40,30,20,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)] border border-stone-300/50 dark:border-white/[0.08]"
              : "mt-0 w-full max-w-7xl h-16 sm:h-20 px-3 sm:px-8 bg-transparent border-transparent shadow-none"
          }`}>
            
            {/* Back Button & Logo with Favicon */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => {
                  if (window.history.length > 1) {
                    navigate(-1);
                  } else {
                    navigate("/");
                  }
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold text-[#515154] dark:text-[#a1a1a6] hover:text-[#0071e3] dark:hover:text-white bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] hover:bg-black/[0.06] dark:hover:bg-white/[0.1] transition-all cursor-pointer select-none"
                title="Back to previous page"
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

            {/* Desktop Navigation Links */}
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
                    <Link to="/app" className="relative group inline-flex items-center justify-center p-2 sm:px-4 sm:py-2 rounded-full text-white text-xs sm:text-sm font-medium bg-[#0071e3] hover:bg-[#0077ed] shadow-[0_4px_14px_rgba(0,113,227,0.35)] hover:shadow-[0_6px_20px_rgba(0,113,227,0.45)] transition-all duration-300">
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

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="md:hidden p-1.5 sm:p-2 rounded-full text-[#515154] dark:text-[#a1a1a6] hover:text-[#0071e3] dark:hover:text-white bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08]"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>

          </div>

          {/* Mobile Drawer */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-auto md:hidden w-full max-w-5xl mt-2 p-4 rounded-2xl bg-[#fcfaf5]/95 dark:bg-[#1d1d1f]/95 border border-stone-200/80 dark:border-white/[0.12] shadow-2xl backdrop-blur-2xl"
              >
                <div className="flex flex-col space-y-3 text-sm font-medium">
                  <Link to="/#features" onClick={() => setIsMobileMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06]">Features</Link>
                  <Link to="/#demo" onClick={() => setIsMobileMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06]">Interactive Demo</Link>
                  <Link to="/docs" onClick={() => setIsMobileMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06]">Documentation</Link>
                  <Link to="/faq" onClick={() => setIsMobileMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06]">FAQs</Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Centered Hero Header Section (Matching FAQs style with full unclipped cursive script) */}
      <section className="pt-36 sm:pt-40 pb-12 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4 border border-blue-100 dark:border-blue-800/40">
            <BookOpen className="w-3.5 h-3.5" /> Technical Reference & User Guide
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl tracking-normal mb-4 text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed">
            <span className="font-kaushan inline-block py-2 px-3 text-transparent bg-clip-text bg-gradient-to-r from-[#0071e3] via-[#0284c7] to-[#06b6d4] dark:from-blue-400 dark:via-sky-300 dark:to-cyan-300 overflow-visible">
              Documentation
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#6e6e73] dark:text-[#a1a1a6] max-w-2xl mx-auto font-normal">
            Welcome to the AI Data Analysis documentation. Learn how to prepare your data, execute natural language queries, and understand the platform architecture.
          </p>
        </div>
      </section>

      {/* Main Content Cards */}
      <section className="pb-28 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            
            {/* Quickstart Card */}
            <div className="macos-card p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#262422] dark:text-[#f5f5f7]">
                  Supported Formats & Ingestion
                </h2>
              </div>
              <p className="text-sm sm:text-base text-stone-600 dark:text-[#a1a1a6] leading-relaxed mb-4">
                You can upload tabular files up to 200MB per batch directly from your browser. Our ingestion engine leverages DuckDB's native readers for instantaneous parsing:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-stone-200/60 dark:border-white/[0.06] flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">CSV (.csv) with auto-delimiter detection</span>
                </div>
                <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-stone-200/60 dark:border-white/[0.06] flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">Excel (.xlsx, .xls) multi-sheet sheets</span>
                </div>
                <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-stone-200/60 dark:border-white/[0.06] flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">SQLite (.db, .sqlite) native tables</span>
                </div>
                <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-stone-200/60 dark:border-white/[0.06] flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">SQL Dumps (.sql) schema + inserts</span>
                </div>
              </div>
            </div>

            {/* Architecture Card */}
            <div className="macos-card p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Cpu className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#262422] dark:text-[#f5f5f7]">
                  Architecture & Security Model
                </h2>
              </div>
              <p className="text-sm sm:text-base text-stone-600 dark:text-[#a1a1a6] leading-relaxed mb-4">
                Privacy is built directly into the core execution pipeline. When you ask questions about your data:
              </p>
              <div className="space-y-3 text-xs sm:text-sm text-stone-600 dark:text-[#a1a1a6]">
                <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-stone-200/60 dark:border-white/[0.06]">
                  <strong className="text-[#1d1d1f] dark:text-[#f5f5f7] block mb-1">1. Zero Row AI Exposure</strong>
                  Only the column names and data types (schema) are sent to Groq Llama 3. Your actual data rows remain in the local DuckDB session and never touch external AI servers.
                </div>
                <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-stone-200/60 dark:border-white/[0.06]">
                  <strong className="text-[#1d1d1f] dark:text-[#f5f5f7] block mb-1">2. AST SQL Whitelisting</strong>
                  Generated queries are parsed using an Abstract Syntax Tree (AST) before execution. Non-read-only commands (such as DROP, DELETE, or UPDATE) are strictly blocked.
                </div>
                <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-stone-200/60 dark:border-white/[0.06]">
                  <strong className="text-[#1d1d1f] dark:text-[#f5f5f7] block mb-1">3. In-Memory Ephemeral Sessions</strong>
                  DuckDB runs in transient memory. As soon as you navigate away or click delete, all tables are dropped and resources are freed.
                </div>
              </div>
            </div>

            {/* Natural Language Tips */}
            <div className="macos-card p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#262422] dark:text-[#f5f5f7]">
                  Querying Best Practices
                </h2>
              </div>
              <p className="text-sm sm:text-base text-stone-600 dark:text-[#a1a1a6] leading-relaxed mb-4">
                You can ask questions conversationally. Here are some effective query patterns you can use right away:
              </p>
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-blue-500/5 dark:bg-blue-400/5 border border-blue-500/15 text-xs sm:text-sm font-mono text-blue-600 dark:text-blue-400">
                  "Show top 5 customers by total order amount with their email"
                </div>
                <div className="p-3 rounded-xl bg-blue-500/5 dark:bg-blue-400/5 border border-blue-500/15 text-xs sm:text-sm font-mono text-blue-600 dark:text-blue-400">
                  "What is the average transaction value grouped by category for 2024?"
                </div>
                <div className="p-3 rounded-xl bg-blue-500/5 dark:bg-blue-400/5 border border-blue-500/15 text-xs sm:text-sm font-mono text-blue-600 dark:text-blue-400">
                  "Find monthly churn rate and plot it as a line chart"
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Static Footer */}
      <footer className="bg-[#fcfaf5] dark:bg-[#050505] border-t border-stone-200/80 dark:border-gray-800/50 py-12 text-stone-500 dark:text-gray-400 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-medium">&copy; {new Date().getFullYear()} <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#0071e3] to-[#06b6d4]">AI Data Analysis</span></span>
          <div className="flex space-x-6 text-sm">
            <Link to="/docs" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-gray-500 dark:text-gray-400">Documentation</Link>
            <Link to="/faq" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-gray-500 dark:text-gray-400">FAQs</Link>
            <Link to="/privacy" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-gray-500 dark:text-gray-400">Privacy</Link>
            <Link to="/terms" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-gray-500 dark:text-gray-400">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
