import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Scale, 
  Globe, 
  Shield, 
  AlertTriangle, 
  FileCheck,
  Lock,
  ArrowRight 
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle.jsx";
import { useUser } from "../context/UserContext.jsx";
import UserNavProfile from "../components/layout/UserNavProfile.jsx";

export default function Terms() {
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
            <Link to="/docs" className="hover:text-[#0071e3] dark:hover:text-white transition-colors duration-200">Documentation</Link>
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
          <div className="bg-white/80 dark:bg-gray-900/40 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-gray-200/50 dark:border-gray-800/50 shadow-sm">
            
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
                <FileCheck className="w-4 h-4" /> Legal & Service Agreement
              </div>
              <h1 className="text-4xl md:text-5xl tracking-tight mb-2 text-[#1d1d1f] dark:text-[#f5f5f7]">
                <span className="font-kaushan text-transparent bg-clip-text bg-gradient-to-r from-[#0071e3] via-[#5e5ce6] to-[#af52de] dark:from-blue-400 dark:via-indigo-300 dark:to-purple-300">
                  Terms of Service
                </span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
            
            <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
              <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                Welcome to AI Data Analysis. By accessing or using our platform, you agree to be bound by these Terms of Service.
              </p>
              
              <div className="macos-card p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-50 text-[#0071e3] rounded-xl flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-semibold m-0 text-[#1d1d1f] dark:text-[#f5f5f7]">1. Acceptable Use of the Platform</h3>
                </div>
                <p className="text-sm text-[#6e6e73] dark:text-[#a1a1a6] leading-relaxed font-normal">
                  You agree to use the platform only for lawful analytics purposes. You are strictly prohibited from uploading datasets that contain malicious code, illegal material, or data that you do not have the explicit right to process.
                </p>
              </div>

              <div className="macos-card p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-50 text-[#0071e3] rounded-xl flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-semibold m-0 text-[#1d1d1f] dark:text-[#f5f5f7]">2. Intellectual Property Rights</h3>
                </div>
                <p className="text-sm text-[#6e6e73] dark:text-[#a1a1a6] leading-relaxed font-normal">
                  The service, including its original software codebase, algorithms, and interface functionality, is owned by AI Data Analysis and protected by copyright and intellectual property standards. You retain all ownership rights to your uploaded data.
                </p>
              </div>

              <div className="macos-card p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-50 text-[#0071e3] rounded-xl flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-semibold m-0 text-[#1d1d1f] dark:text-[#f5f5f7]">3. AI Insights Disclaimer</h3>
                </div>
                <p className="text-sm text-[#6e6e73] dark:text-[#a1a1a6] leading-relaxed font-normal">
                  The platform is provided on an "AS IS" basis. While our AI engine executes verified DuckDB SQL to deliver accurate analytics, you should always review critical automated conclusions prior to high-stakes business decision-making.
                </p>
              </div>

              <div className="macos-card p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-50 text-[#0071e3] rounded-xl flex items-center justify-center shrink-0">
                    <Scale className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-semibold m-0 text-[#1d1d1f] dark:text-[#f5f5f7]">4. Limitation of Liability</h3>
                </div>
                <p className="text-sm text-[#6e6e73] dark:text-[#a1a1a6] leading-relaxed font-normal">
                  In no event shall AI Data Analysis, nor its developers, be liable for any indirect, incidental, or consequential damages resulting from your use of or inability to use the platform.
                </p>
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
            <Link to="/docs" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-gray-500 dark:text-gray-400">Documentation</Link>
            <Link to="/faq" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-gray-500 dark:text-gray-400">FAQs</Link>
            <Link to="/privacy" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-gray-500 dark:text-gray-400">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
