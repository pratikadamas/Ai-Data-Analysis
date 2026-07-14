import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Database } from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle.jsx";

const faqs = [
  {
    question: "Is my data stored permanently on your servers?",
    answer: "No. Your data is loaded into a transient, in-memory DuckDB session. Once your session ends, the data is completely wiped from our temporary storage."
  },
  {
    question: "What file formats do you support?",
    answer: "We currently support CSV, Excel (.xlsx, .xls), SQLite (.db, .sqlite), and raw SQL dumps. Support for JSON and Parquet is coming soon!"
  },
  {
    question: "How does the AI analysis work?",
    answer: "When you ask a question, we securely send your query and your dataset's schema (column names and types) to our LLM. It generates the exact SQL query needed, runs it against your data, and returns the result and visualization."
  },
  {
    question: "Can I deploy this on my own infrastructure?",
    answer: "Yes! The entire project is open-source. You can clone the repository and deploy the frontend on Vercel and the backend on Render or your own servers."
  },
  {
    question: "Are my datasets sent to OpenAI/Anthropic?",
    answer: "No. We only send the schema (column names and data types) and your natural language question to the LLM to generate SQL. The actual row data remains secure within your local browser/server session."
  },
  {
    question: "What happens if the AI generates incorrect SQL?",
    answer: "Our engine executes the SQL in a sandboxed environment. If an error occurs, the system automatically attempts to self-correct by sending the error log back to the LLM for a revised query. You can also view and manually edit the generated SQL."
  },
  {
    question: "Is there a limit to the dataset size I can upload?",
    answer: "Since the data is processed in-memory using DuckDB, the limit depends on your device's available RAM. For the best browser experience, we recommend datasets under 500MB."
  },
  {
    question: "How do I export the charts and insights?",
    answer: "Every Plotly chart generated has a built-in toolbar that allows you to download the visualization as a high-resolution PNG. You can also export the raw SQL results as a CSV file."
  },
  {
    question: "Do I need to know SQL to use this tool?",
    answer: "Not at all! The platform is designed for non-technical users. You simply ask questions in plain English, and the AI handles the complex database querying behind the scenes."
  },
  {
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
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-500 overflow-x-hidden selection:bg-brand-500/30">
      {/* Navigation */}
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
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[120%] h-[800px] bg-gradient-to-b from-brand-500/10 via-indigo-500/5 to-transparent blur-[120px] -z-10 rounded-[100%] pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold tracking-tight mb-6">Frequently Asked Questions</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">Everything you need to know about the platform.</p>
          </motion.div>
          
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white/80 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-800/50 overflow-hidden"
              >
                <button 
                  className="w-full px-8 py-6 text-left font-bold flex justify-between items-center focus:outline-none"
                  onClick={() => toggleFaq(idx)}
                >
                  <span className="text-xl text-gray-800 dark:text-gray-200">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: openFaq === idx ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                  </motion.div>
                </button>
                <motion.div 
                  initial={false}
                  animate={{ height: openFaq === idx ? "auto" : 0, opacity: openFaq === idx ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className="px-8 pb-6 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">{faq.answer}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Simplified Footer */}
      <footer className="bg-white dark:bg-[#050505] border-t border-gray-200 dark:border-gray-800/50 py-12 text-center text-gray-500 dark:text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <span className="font-medium">&copy; {new Date().getFullYear()} AI Data Analyst</span>
          <div className="flex space-x-6 mt-4 md:mt-0 text-sm">
            <Link to="/docs" className="hover:text-brand-600 dark:hover:text-white">Documentation</Link>
            <Link to="/privacy" className="hover:text-brand-600 dark:hover:text-white">Privacy</Link>
            <Link to="/terms" className="hover:text-brand-600 dark:hover:text-white">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
