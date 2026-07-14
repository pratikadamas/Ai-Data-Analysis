import React from "react";
import { Link } from "react-router-dom";
import { Database } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle.jsx";

export default function Terms() {
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
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Terms of Service</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-10">Last updated: {new Date().toLocaleDateString()}</p>
            
            <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
              <p>Welcome to AI Data Analyst. By accessing or using our platform, you agree to be bound by these Terms of Service.</p>
              
              <div>
                <h3 className="text-2xl font-bold mb-4">1. Use of the Platform</h3>
                <p>You agree to use the platform only for lawful purposes. You are strictly prohibited from uploading datasets that contain malicious code, illegal material, or data that you do not have the explicit right to process.</p>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4">2. Intellectual Property</h3>
                <p>The service, including its original content, features, and functionality, are owned by AI Data Analyst and are protected by international copyright, trademark, and other intellectual property laws.</p>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4">3. Disclaimer of Warranties</h3>
                <p>The platform is provided on an "AS IS" and "AS AVAILABLE" basis. While our AI attempts to provide accurate SQL queries and visual insights, we do not warrant that the analysis will be entirely error-free. It is your responsibility to verify critical business insights derived from the platform.</p>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4">4. Limitation of Liability</h3>
                <p>In no event shall AI Data Analyst, nor its developers, be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of or inability to use the service.</p>
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
            <Link to="/privacy" className="hover:text-brand-600 dark:hover:text-white">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
