import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  ChevronDown, 
  HelpCircle, 
  ShieldCheck, 
  FileSpreadsheet, 
  Sparkles, 
  Server, 
  Lock, 
  AlertCircle, 
  HardDrive, 
  BarChart3, 
  Code2, 
  Cpu 
} from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle.jsx";

const faqs = [
  {
    icon: HardDrive,
    question: "Is my data stored permanently on your servers?",
    answer: "No. Your data is loaded into a transient, in-memory DuckDB session. Once your session ends, the data is completely wiped from our temporary storage."
  },
  {
    icon: FileSpreadsheet,
    question: "What file formats do you support?",
    answer: "We currently support CSV, Excel (.xlsx, .xls), SQLite (.db, .sqlite), and raw SQL dumps. Support for JSON and Parquet is coming soon!"
  },
  {
    icon: Sparkles,
    question: "How does the AI analysis work?",
    answer: "When you ask a question, we securely send your query and your dataset's schema (column names and types) to our LLM. It generates the exact SQL query needed, runs it against your data, and returns the result and visualization."
  },
  {
    icon: Server,
    question: "Can I deploy this on my own infrastructure?",
    answer: "Yes! The entire project is open-source. You can clone the repository and deploy the frontend on Vercel and the backend on Render or your own servers."
  },
  {
    icon: Lock,
    question: "Are my datasets sent to OpenAI/Anthropic?",
    answer: "No. We only send the schema (column names and data types) and your natural language question to the LLM to generate SQL. The actual row data remains secure within your local browser/server session."
  },
  {
    icon: AlertCircle,
    question: "What happens if the AI generates incorrect SQL?",
    answer: "Our engine executes the SQL in a sandboxed environment. If an error occurs, the system automatically attempts to self-correct by sending the error log back to the LLM for a revised query. You can also view and manually edit the generated SQL."
  },
  {
    icon: ShieldCheck,
    question: "Is there a limit to the dataset size I can upload?",
    answer: "Since the data is processed in-memory using DuckDB, the limit depends on your device's available RAM. For the best browser experience, we recommend datasets under 500MB."
  },
  {
    icon: BarChart3,
    question: "How do I export the charts and insights?",
    answer: "Every Plotly chart generated has a built-in toolbar that allows you to download the visualization as a high-resolution PNG. You can also export the raw SQL results as a CSV file."
  },
  {
    icon: Code2,
    question: "Do I need to know SQL to use this tool?",
    answer: "Not at all! The platform is designed for non-technical users. You simply ask questions in plain English, and the AI handles the complex database querying behind the scenes."
  },
  {
    icon: Cpu,
    question: "Is there an API available for developers?",
    answer: "We are currently developing a RESTful API that will allow you to programmatically upload datasets and query them via our AI engine. Check our documentation for updates."
  }
];

export default function FaqPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

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
            <Link to="/faq" className="text-[#0071e3] dark:text-white font-semibold transition-colors duration-200">FAQs</Link>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />
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
          </div>

        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-36 pb-14 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800/40 text-[#0071e3] dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <HelpCircle className="w-3.5 h-3.5" /> Help Center & Knowledge Base
          </div>
          <h1 className="text-4xl sm:text-5xl tracking-tight mb-4 text-[#1d1d1f] dark:text-[#f5f5f7]">
            <span className="font-kaushan text-transparent bg-clip-text bg-gradient-to-r from-[#0071e3] via-[#5e5ce6] to-[#af52de] dark:from-blue-400 dark:via-indigo-300 dark:to-purple-300">
              Frequently Asked Questions
            </span>
          </h1>
          <p className="text-lg text-[#6e6e73] dark:text-[#a1a1a6] max-w-2xl mx-auto font-normal">
            Everything you need to know about how AI Data Analysis processes and protects your datasets.
          </p>
        </div>
      </section>

      {/* FAQ Grid/Accordion */}
      <section className="pb-32 relative">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-3.5">
            {faqs.map((faq, idx) => {
              const Icon = faq.icon;
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="macos-card overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left p-5 sm:p-6 flex justify-between items-center focus:outline-none group cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 pr-4">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0071e3] flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-base sm:text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-[#0071e3] transition-colors">{faq.question}</span>
                    </div>
                    <div className={`p-2 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-[#515154] dark:text-[#a1a1a6] transform transition-transform duration-300 shrink-0 ${openFaq === idx ? "rotate-180 bg-blue-50 text-[#0071e3]" : ""}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>
                  <motion.div 
                    initial={false}
                    animate={{ height: openFaq === idx ? "auto" : 0, opacity: openFaq === idx ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 pl-16 text-sm text-[#6e6e73] dark:text-[#a1a1a6] leading-relaxed font-normal">{faq.answer}</p>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Simplified Static Footer */}
      <footer className="bg-white dark:bg-[#050505] border-t border-gray-200 dark:border-gray-800/50 py-12 text-gray-500 dark:text-gray-400 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-medium">&copy; {new Date().getFullYear()} AI Data Analysis</span>
          <div className="flex space-x-6 text-sm">
            <Link to="/docs" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-gray-500 dark:text-gray-400">Documentation</Link>
            <Link to="/privacy" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-gray-500 dark:text-gray-400">Privacy</Link>
            <Link to="/terms" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-gray-500 dark:text-gray-400">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
