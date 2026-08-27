import React from "react";
import { Link } from "react-router-dom";
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
  ArrowRight
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle.jsx";
import { useUser } from "../context/UserContext.jsx";
import UserNavProfile from "../components/layout/UserNavProfile.jsx";

export default function Docs() {
  const { user } = useUser();
  return (
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] dark:bg-[#161617] dark:text-[#f5f5f7] font-sans antialiased overflow-x-hidden selection:bg-blue-500/20 transition-colors duration-300">
      
      {/* Subtle macOS Ambient Aura Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[90vw] h-[550px] bg-gradient-to-b from-blue-400/10 via-indigo-300/6 to-transparent dark:from-blue-500/15 dark:via-purple-500/10 blur-[140px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#2d2d30_1px,transparent_1px)] [background-size:24px_24px] opacity-60 dark:opacity-40" />
      </div>

      {/* Floating Apple/macOS Styled Navigation Bar */}
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 left-0 right-0 z-50 max-w-5xl mx-auto px-4"
      >
        <div className="bg-white/65 dark:bg-[#1d1d1f]/65 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] rounded-full px-6 h-16 flex items-center justify-between transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
          
          {/* Logo with Favicon */}
          <Link to="/" className="flex items-center space-x-3 group cursor-pointer select-none">
            <img 
              src="/favicon.webp" 
              alt="AI Data Analysis Logo" 
              className="w-8 h-8 object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <span className="font-semibold text-lg tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
              AI Data Analysis
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-7 text-sm font-medium text-[#515154] dark:text-[#a1a1a6]">
            <Link to="/#features" className="hover:text-[#0071e3] dark:hover:text-white transition-colors duration-200">Features</Link>
            <Link to="/#demo" className="hover:text-[#0071e3] dark:hover:text-white transition-colors duration-200">Interactive Demo</Link>
            <Link to="/docs" className="text-[#0071e3] dark:text-white font-semibold transition-colors duration-200">Documentation</Link>
            <Link to="/faq" className="hover:text-[#0071e3] dark:hover:text-white transition-colors duration-200">FAQs</Link>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            
            {user ? (
              <div className="flex items-center gap-3">
                <UserNavProfile />
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/app" className="relative group inline-flex items-center justify-center px-4 py-2 rounded-full text-white text-sm font-medium bg-[#0071e3] hover:bg-[#0077ed] shadow-[0_4px_14px_rgba(0,113,227,0.35)] hover:shadow-[0_6px_20px_rgba(0,113,227,0.45)] transition-all duration-300">
                    <span className="relative flex items-center gap-1.5">
                      Launch App <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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
                  <Link to="/register" className="relative group inline-flex items-center justify-center px-4 py-2 rounded-full text-white text-sm font-medium bg-[#0071e3] hover:bg-[#0077ed] shadow-[0_4px_14px_rgba(0,113,227,0.35)] hover:shadow-[0_6px_20px_rgba(0,113,227,0.45)] transition-all duration-300">
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
              <span className="font-kaushan text-transparent bg-clip-text bg-gradient-to-r from-[#0071e3] via-[#5e5ce6] to-[#af52de] dark:from-blue-400 dark:via-indigo-300 dark:to-purple-300">
                Documentation
              </span>
            </h1>
            <p className="text-lg text-[#6e6e73] dark:text-[#a1a1a6] leading-relaxed font-normal">
              Welcome to the AI Data Analysis documentation. Learn how to prepare your data, execute natural language queries, and understand the platform architecture.
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="space-y-6">
              
              {/* Section 1 */}
              <div className="macos-card p-8 group">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-11 h-11 bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold m-0 text-[#1d1d1f] dark:text-[#f5f5f7]">Supported File Formats</h2>
                </div>
                <p className="mb-4 text-sm sm:text-base text-[#6e6e73] dark:text-[#a1a1a6]">Our engine currently supports the following formats out of the box:</p>
                <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-[#1d1d1f] dark:text-[#f5f5f7]">
                  <li><strong className="text-[#0071e3] dark:text-blue-400">CSV (.csv):</strong> Standard comma-separated values. Ensure column headers are present on the first row.</li>
                  <li><strong className="text-[#0071e3] dark:text-blue-400">Excel (.xlsx, .xls):</strong> The engine reads the first active sheet and infers types automatically.</li>
                  <li><strong className="text-[#0071e3] dark:text-blue-400">SQLite (.db, .sqlite):</strong> Connect and inspect multi-table database schemas natively.</li>
                  <li><strong className="text-[#0071e3] dark:text-blue-400">SQL Dumps (.sql):</strong> Load raw DDL and INSERT statements into temporary tables.</li>
                </ul>
              </div>

              {/* Section 2: Security & Privacy Architecture */}
              <div className="macos-card p-8 group">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-11 h-11 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold m-0 text-[#1d1d1f] dark:text-[#f5f5f7]">Security & Privacy Architecture</h2>
                </div>
                <p className="text-sm sm:text-base text-[#6e6e73] dark:text-[#a1a1a6] leading-relaxed font-normal">
                  We take data privacy seriously. By leveraging <strong className="text-[#1d1d1f] dark:text-[#f5f5f7]">DuckDB</strong> in-memory sessions, your uploaded data resides in a completely isolated, volatile memory space.
                </p>
                <p className="mt-4 text-sm sm:text-base text-[#6e6e73] dark:text-[#a1a1a6] leading-relaxed font-normal">
                  When you converse with the AI, we <strong className="text-[#1d1d1f] dark:text-[#f5f5f7]">never</strong> send your raw table rows to the LLM. We only transmit the schema definitions (column names and data types) alongside your natural language query so the model can generate accurate SQL.
                </p>
              </div>

              {/* Section 3: Interactive Plotly Visualizations */}
              <div className="macos-card p-8 group">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-11 h-11 bg-purple-50 dark:bg-purple-950/60 text-[#af52de] dark:text-purple-400 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
                    <LineChart className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold m-0 text-[#1d1d1f] dark:text-[#f5f5f7]">Interactive Plotly Visualizations</h2>
                </div>
                <p className="text-sm sm:text-base text-[#6e6e73] dark:text-[#a1a1a6] leading-relaxed font-normal">
                  The analytics engine analyzes your query results and automatically recommends and renders the ideal chart type (Bar, Line, Scatter, Pie, Heatmap).
                </p>
                <p className="mt-4 text-sm sm:text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Use the built-in Plotly control toolbar to:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2 text-sm sm:text-base text-[#6e6e73] dark:text-[#a1a1a6]">
                  <li>Zoom into specific data ranges and outliers.</li>
                  <li>Pan across continuous time-series data.</li>
                  <li>Export publication-ready, high-resolution PNG charts directly to your device.</li>
                </ul>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Static Footer */}
      <footer className="bg-white dark:bg-[#050505] border-t border-gray-200 dark:border-gray-800/50 py-12 text-gray-500 dark:text-gray-400 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-medium">&copy; {new Date().getFullYear()} AI Data Analysis</span>
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
