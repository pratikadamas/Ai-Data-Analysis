import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Database, 
  LineChart, 
  MessageSquare, 
  ShieldCheck, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  Github,
  ArrowRight
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
  }
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
      
      {/* Navigation */}
      <nav className="fixed w-full z-50 glass-panel border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
                <Database className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight">AI Data Analyst</span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors">
                Sign In
              </Link>
              <Link to="/login" className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-full font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-brand-500/10 to-transparent blur-3xl -z-10 dark:from-brand-500/5"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            The simplest way to <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-500 dark:from-brand-400 dark:to-indigo-400">
              explore & analyze
            </span> your data.
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 mb-10">
            Upload any dataset and start asking questions in plain English. 
            Get instant insights, interactive charts, and intelligent SQL generation.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/login" className="w-full sm:w-auto bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center">
              Start Analyzing for Free <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <a href="#workflow" className="w-full sm:w-auto px-8 py-4 rounded-full font-semibold text-lg text-gray-700 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all">
              See how it works
            </a>
          </div>
          
          {/* Dashboard Preview Image (Placeholder styling) */}
          <div className="mt-16 relative mx-auto max-w-5xl animate-fade-in delay-200">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden bg-white dark:bg-gray-900 glass-panel animate-float">
              <div className="h-8 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 space-x-2 bg-gray-50 dark:bg-gray-950">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="aspect-[16/9] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-8 flex items-center justify-center">
                <div className="text-gray-400 dark:text-gray-600 font-medium text-lg flex flex-col items-center">
                  <LineChart className="w-16 h-16 mb-4 opacity-50" />
                  Interactive Dashboard Preview
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need for data analysis</h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">Built for speed, accuracy, and ease of use.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/20 rounded-xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">Three simple steps to unlock your data.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop only) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-gray-200 via-brand-300 to-gray-200 dark:from-gray-800 dark:via-brand-700 dark:to-gray-800 -z-10"></div>
            
            <div className="text-center">
              <div className="w-24 h-24 mx-auto bg-white dark:bg-gray-900 border-4 border-white dark:border-gray-950 rounded-full shadow-xl flex items-center justify-center text-3xl font-bold text-brand-600 dark:text-brand-400 mb-6 relative z-10">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Upload Data</h3>
              <p className="text-gray-500 dark:text-gray-400">Drag and drop your files into our secure workspace.</p>
            </div>
            
            <div className="text-center">
              <div className="w-24 h-24 mx-auto bg-white dark:bg-gray-900 border-4 border-white dark:border-gray-950 rounded-full shadow-xl flex items-center justify-center text-3xl font-bold text-brand-600 dark:text-brand-400 mb-6 relative z-10">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">Ask Questions</h3>
              <p className="text-gray-500 dark:text-gray-400">Type your questions in plain English, just like talking to an analyst.</p>
            </div>
            
            <div className="text-center">
              <div className="w-24 h-24 mx-auto bg-white dark:bg-gray-900 border-4 border-white dark:border-gray-950 rounded-full shadow-xl flex items-center justify-center text-3xl font-bold text-brand-600 dark:text-brand-400 mb-6 relative z-10">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Get Insights</h3>
              <p className="text-gray-500 dark:text-gray-400">Instantly receive clear answers, SQL queries, and beautiful interactive charts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-200">
                <button 
                  className="w-full px-6 py-4 text-left font-semibold flex justify-between items-center focus:outline-none"
                  onClick={() => toggleFaq(idx)}
                >
                  <span className="text-lg">{faq.question}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                <div 
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaq === idx ? 'max-h-48 pb-4 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-gray-500 dark:text-gray-400">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Database className="w-6 h-6 text-brand-600 dark:text-brand-500" />
            <span className="font-bold text-lg">AI Data Analyst</span>
          </div>
          
          <div className="flex space-x-6 text-sm text-gray-500 dark:text-gray-400 mb-4 md:mb-0">
            <a href="#features" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Features</a>
            <a href="#faq" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">FAQ</a>
            <a href="#" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Terms of Service</a>
          </div>
          
          <div className="flex space-x-4">
            <a href="https://github.com/Babin123456/Ai-Data-Analysis" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <span className="sr-only">GitHub</span>
              <Github className="w-6 h-6" />
            </a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 text-center text-sm text-gray-400 dark:text-gray-600">
          &copy; {new Date().getFullYear()} AI Data Analyst. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
