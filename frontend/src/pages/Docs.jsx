import React from "react";
import { Link } from "react-router-dom";
import { Database, FileText, Lock, Layout } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle.jsx";

export default function Docs() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-500 overflow-x-hidden selection:bg-brand-500/30">
      <nav className="fixed w-full z-50 glass-panel border-b border-white/20 dark:border-gray-800/40 bg-white/70 dark:bg-[#0a0a0a]/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform">
                <Database className="w-6 h-6" />
              </div>
              <span className="font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                AI Data Analyst
              </span>
            </Link>
            <div className="flex items-center space-x-6">
              <ThemeToggle />
              <Link to="/login" className="relative group inline-flex items-center justify-center px-6 py-2.5 rounded-full text-white font-medium bg-gradient-to-r from-brand-600 to-indigo-600 overflow-hidden shadow-glow hover:shadow-glow-lg transition-all">
                <span className="relative">Get Started</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-40 pb-32 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold tracking-tight mb-8">Documentation</h1>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed mb-12">
              Welcome to the AI Data Analyst documentation. Here you will find everything you need to know about preparing your data, running queries, and understanding the architecture of the platform.
            </p>
            
            <div className="space-y-12">
              <div className="bg-white/80 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl p-8 border border-gray-200/50 dark:border-gray-800/50 shadow-sm">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-600 dark:text-brand-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold m-0">Supported File Formats</h2>
                </div>
                <p className="mb-4">Our engine currently supports the following formats out of the box:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>CSV (.csv):</strong> Standard comma-separated values. Ensure headers are present on the first row.</li>
                  <li><strong>Excel (.xlsx, .xls):</strong> The engine will read the first active sheet.</li>
                  <li><strong>SQLite (.db, .sqlite):</strong> Connect directly to lightweight database files.</li>
                </ul>
              </div>

              <div className="bg-white/80 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl p-8 border border-gray-200/50 dark:border-gray-800/50 shadow-sm">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold m-0">Security & Privacy</h2>
                </div>
                <p>We take data privacy extremely seriously. Because we utilize <strong>DuckDB</strong> in-memory sessions, your uploaded data resides in a completely isolated, temporary environment.</p>
                <p className="mt-4">When you interact with the AI, we <strong>never</strong> send your raw row data to the LLM. We only transmit the schema definitions (column names and data types) alongside your natural language prompt so the model can generate the appropriate SQL query.</p>
              </div>

              <div className="bg-white/80 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl p-8 border border-gray-200/50 dark:border-gray-800/50 shadow-sm">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Layout className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold m-0">Interactive Charts</h2>
                </div>
                <p>The platform automatically detects the intent of your query and generates the most appropriate chart using Plotly.js.</p>
                <p className="mt-4">You can use the built-in Plotly toolbar on every chart to:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Zoom into specific data clusters.</li>
                  <li>Pan across time-series data.</li>
                  <li>Download high-resolution PNGs directly to your device.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white dark:bg-[#050505] border-t border-gray-200 dark:border-gray-800/50 py-12 text-center text-gray-500 dark:text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <span className="font-medium">&copy; {new Date().getFullYear()} AI Data Analyst</span>
          <div className="flex space-x-6 mt-4 md:mt-0 text-sm">
            <Link to="/faq" className="hover:text-brand-600 dark:hover:text-white">FAQ</Link>
            <Link to="/privacy" className="hover:text-brand-600 dark:hover:text-white">Privacy</Link>
            <Link to="/terms" className="hover:text-brand-600 dark:hover:text-white">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
