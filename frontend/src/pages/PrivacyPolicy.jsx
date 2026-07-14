import React from "react";
import { Link } from "react-router-dom";
import { Database, Server, Bot, User, RefreshCcw } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle.jsx";

export default function PrivacyPolicy() {
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
          <div className="bg-white/80 dark:bg-gray-900/40 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-gray-200/50 dark:border-gray-800/50 shadow-sm">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Privacy Policy</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-10">Last updated: {new Date().toLocaleDateString()}</p>
            
            <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
              <p>Your privacy is our primary concern. This Privacy Policy outlines how we handle, process, and protect your data when you use the AI Data Analyst platform.</p>
              
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-brand-500/10 rounded-lg text-brand-600 dark:text-brand-400">
                    <Server className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold m-0">1. Data Processing and Storage</h3>
                </div>
                <p>When you upload a dataset to our platform, the file is processed in a transient, isolated environment. We use DuckDB in-memory databases to ensure that your data is never written to persistent disk storage on our servers.</p>
                <p>Once your session ends or you close your browser, the temporary memory allocation is wiped completely. We do not retain copies of your datasets.</p>
              </div>

              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <Bot className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold m-0">2. AI Integration (LLMs)</h3>
                </div>
                <p>To provide intelligent query generation, we integrate with third-party Large Language Models (such as OpenAI or Anthropic). However, <strong>we strictly prohibit the transmission of raw row data to these models.</strong></p>
                <p>Only the structural schema of your dataset (column names, data types) and your natural language prompts are sent to the AI. This ensures that sensitive information contained within your data rows remains completely private.</p>
              </div>

              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400">
                    <User className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold m-0">3. Account Information</h3>
                </div>
                <p>If you create an account, we store minimal information necessary to maintain your profile (e.g., email address, hashed password). We do not share this information with any third parties for marketing purposes.</p>
              </div>

              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
                    <RefreshCcw className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold m-0">4. Changes to This Policy</h3>
                </div>
                <p>We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white dark:bg-[#050505] border-t border-gray-200 dark:border-gray-800/50 py-12 text-center text-gray-500 dark:text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <span className="font-medium">&copy; {new Date().getFullYear()} AI Data Analyst</span>
          <div className="flex space-x-6 mt-4 md:mt-0 text-sm">
            <Link to="/docs" className="hover:text-brand-600 dark:hover:text-white">Documentation</Link>
            <Link to="/faq" className="hover:text-brand-600 dark:hover:text-white">FAQ</Link>
            <Link to="/terms" className="hover:text-brand-600 dark:hover:text-white">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
