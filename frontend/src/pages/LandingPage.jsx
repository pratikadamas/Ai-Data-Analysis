import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Database, 
  LineChart, 
  MessageSquare, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle.jsx";

const features = [
  {
    icon: <Database className="w-6 h-6 text-brand-500" />,
    title: "Multi-Format Data Loader",
    description: "Seamlessly drop CSV, Excel, SQLite, or JSON files. Automatic column detection, clean mappings, and ready in seconds."
  },
  {
    icon: <LineChart className="w-6 h-6 text-brand-500" />,
    title: "Interactive Plotly Charts",
    description: "Interact with dynamic scatter, line, bar, or pie charts. Zoom, pan, filter, and export high-resolution assets instantly."
  },
  {
    icon: <MessageSquare className="w-6 h-6 text-brand-500" />,
    title: "Conversational Insights",
    description: "Ask natural questions about your dataset. Our AI system writes backend Python code, handles processing, and replies in real-time."
  },
  {
    icon: <Zap className="w-6 h-6 text-brand-500" />,
    title: "Lightning Fast Engine",
    description: "Powered by DuckDB for sub-second aggregations on millions of rows right inside your browser session."
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-brand-500" />,
    title: "Secure & Private",
    description: "Your data stays in your environment. We use enterprise-grade encryption and secure transient sessions."
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-500 overflow-x-hidden selection:bg-brand-500/30">
      
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed w-full z-50 glass-panel border-b border-white/20 dark:border-gray-800/40 bg-white/70 dark:bg-[#0a0a0a]/70"
      >
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
              <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors">
                Sign In
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/login" className="relative group inline-flex items-center justify-center px-6 py-2.5 rounded-full text-white font-medium bg-gradient-to-r from-brand-600 to-indigo-600 overflow-hidden shadow-glow hover:shadow-glow-lg transition-all">
                  <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
                  <span className="relative">Get Started</span>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 lg:pt-56 lg:pb-40 overflow-hidden">
        {/* Deep Space Gradients - Adjusted opacity for light mode visibility */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[120%] h-[800px] bg-gradient-to-b from-brand-500/10 via-indigo-500/5 to-transparent dark:from-brand-500/20 dark:via-purple-500/10 blur-[120px] -z-10 rounded-[100%] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex-1 text-center lg:text-left"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="inline-flex items-center mb-6 px-4 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-700 dark:text-brand-300 font-medium text-sm tracking-wide shadow-glow backdrop-blur-md"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              The Next Generation of Data Analysis
            </motion.div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-[1.1]">
              Talk to your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-500 to-purple-600 dark:from-brand-500 dark:via-indigo-500 dark:to-purple-500 animate-gradient-x">
                Data Context.
              </span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto lg:mx-0 text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
              Upload any dataset and start asking questions in plain English. 
              Get instant insights, interactive charts, and intelligent SQL generation powered by AI.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                {/* Changed button colors to ensure contrast in light mode */}
                <Link to="/login" className="w-full sm:w-auto bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-8 py-4 rounded-full font-bold text-lg transition-all shadow-xl hover:shadow-2xl flex items-center justify-center">
                  Start Analyzing <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotateY: 15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1.5, delay: 0.4, type: "spring" }}
            className="flex-1 w-full relative perspective-[1000px]"
          >
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="relative rounded-3xl overflow-hidden glassmorphism-deep border border-gray-200 dark:border-gray-700/50 shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/5 to-purple-500/5 dark:from-brand-500/10 dark:to-purple-500/10 z-10 pointer-events-none mix-blend-overlay"></div>
              <img src="/assets/hero_data_abstract.png" alt="Data Analytics Illustration" className="w-full h-auto object-cover opacity-90 scale-105" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Everything you need for analysis</h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">Built for speed, accuracy, and mind-blowing ease of use.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                className="group relative bg-white/50 dark:bg-gray-900/40 backdrop-blur-lg p-8 rounded-3xl shadow-lg border border-gray-200/80 dark:border-gray-800/50 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/0 to-purple-500/0 group-hover:from-brand-500/5 group-hover:to-purple-500/5 transition-colors duration-500 -z-10"></div>
                <div className="w-14 h-14 bg-brand-50 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-brand-100 dark:border-brand-900/50">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-32 bg-gray-50 dark:bg-[#0a0a0a] relative border-y border-gray-200 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">How it works</h2>
            <p className="text-xl text-gray-500 dark:text-gray-400">Three simple steps to unlock your data.</p>
          </motion.div>

          <div className="space-y-32">
            {/* Step 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex flex-col md:flex-row items-center gap-16"
            >
              <div className="flex-1 order-2 md:order-1">
                <div className="text-brand-600 dark:text-brand-500 font-bold text-xl mb-2">Step 1</div>
                <h3 className="text-4xl font-bold mb-6">Upload Your Data</h3>
                <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                  Securely drag and drop your CSV, Excel, or JSON files into the workspace. Our engine instantly processes and maps the schema.
                </p>
              </div>
              <div className="flex-1 order-1 md:order-2">
                <img src="/assets/workflow_upload.png" alt="Upload illustration" className="rounded-3xl shadow-xl dark:shadow-glow-lg border border-gray-200 dark:border-white/10" />
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex flex-col md:flex-row items-center gap-16"
            >
              <div className="flex-1">
                <img src="/assets/workflow_charts.png" alt="Charts illustration" className="rounded-3xl shadow-xl dark:shadow-glow-lg border border-gray-200 dark:border-white/10" />
              </div>
              <div className="flex-1">
                <div className="text-indigo-600 dark:text-indigo-500 font-bold text-xl mb-2">Step 2</div>
                <h3 className="text-4xl font-bold mb-6">Ask & Visualize</h3>
                <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                  Type questions naturally. The AI generates the precise SQL, executes it, and renders gorgeous, interactive charts instantly.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section (Replacing Inline FAQ) */}
      <section className="py-32 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-brand-600 to-indigo-700 rounded-[3rem] p-12 md:p-20 shadow-2xl text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 relative z-10">Ready to unlock your data?</h2>
            <p className="text-xl text-brand-100 mb-10 relative z-10 max-w-2xl mx-auto">
              Join thousands of analysts who are exploring their datasets 10x faster with AI-powered natural language queries.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 relative z-10">
              <Link to="/login" className="bg-white text-brand-700 hover:bg-gray-50 px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg transform hover:-translate-y-1">
                Start Analyzing for Free
              </Link>
              <Link to="/faq" className="text-white border border-white/30 hover:bg-white/10 px-8 py-4 rounded-full font-bold text-lg transition-all">
                Read our FAQs
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#050505] border-t border-gray-200 dark:border-gray-800/50 py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-6 md:mb-0">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Database className="w-4 h-4" />
            </div>
            <span className="font-bold text-xl">AI Data Analyst</span>
          </div>
          
          <div className="flex space-x-8 text-sm font-medium text-gray-500 dark:text-gray-400 mb-6 md:mb-0">
            <Link to="/docs" className="hover:text-brand-600 dark:hover:text-white transition-colors">Docs</Link>
            <Link to="/faq" className="hover:text-brand-600 dark:hover:text-white transition-colors">FAQ</Link>
            <Link to="/privacy" className="hover:text-brand-600 dark:hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-brand-600 dark:hover:text-white transition-colors">Terms</Link>
          </div>
          
          <div className="flex space-x-4">
            <a href="https://github.com/Babin123456/Ai-Data-Analysis" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <span className="sr-only">GitHub</span>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
