import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Database, 
  LineChart, 
  MessageSquare, 
  Zap, 
  ArrowRight,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  ChevronRight,
  Code2,
  Lock,
  Star,
  Activity,
  ChevronLeft,
  BookOpen,
  HelpCircle,
  Shield,
  FileText,
  Layers,
  Terminal,
  Cpu,
  Check
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle.jsx";
import { useUser } from "../context/UserContext.jsx";
import UserNavProfile from "../components/layout/UserNavProfile.jsx";

const stats = [
  { value: "10x", label: "Faster Insights", sub: "compared to manual SQL writing", icon: Zap },
  { value: "99.4%", label: "Query Precision", sub: "powered by DuckDB + Groq Llama 3", icon: CheckCircle2 },
  { value: "<1.2s", label: "Aggregation Speed", sub: "millions of rows processed instantly", icon: Activity },
  { value: "100%", label: "In-Memory Privacy", sub: "zero persistent disk row retention", icon: Lock },
];

const features = [
  {
    icon: <Database className="w-5 h-5 text-[#0071e3]" />,
    badge: "Smart Ingestion",
    title: "Multi-Format Instant Loader",
    description: "Drag and drop CSV, Excel (.xlsx, .xls), SQLite (.db), or SQL files. Automatic type detection, smart parsing, and zero complex setup.",
    gradient: "from-blue-500/10 to-indigo-500/10"
  },
  {
    icon: <MessageSquare className="w-5 h-5 text-[#5e5ce6]" />,
    badge: "Natural Language AI",
    title: "Conversational Query Assistant",
    description: "Ask questions in plain English like 'Show me monthly revenue by region with growth rates'. AI crafts sanitized, safe DuckDB SQL queries automatically.",
    gradient: "from-indigo-500/10 to-purple-500/10"
  },
  {
    icon: <LineChart className="w-5 h-5 text-[#af52de]" />,
    badge: "Plotly Interactive",
    title: "Dynamic Smart Visualizations",
    description: "Automatic visual charting: scatter, line, grouped bar, and pie charts with interactive zoom, hover tooltips, and instant PNG/SVG exports.",
    gradient: "from-purple-500/10 to-pink-500/10"
  },
  {
    icon: <Zap className="w-5 h-5 text-amber-500" />,
    badge: "Ultra Fast",
    title: "DuckDB Analytical Engine",
    description: "Harness vector execution inside DuckDB for lightning-fast OLAP aggregations and joins on large datasets right in your session.",
    gradient: "from-amber-500/10 to-orange-500/10"
  },
  {
    icon: <Lock className="w-5 h-5 text-emerald-500" />,
    badge: "Enterprise Privacy",
    title: "Strict Zero-Row AI Privacy",
    description: "Your dataset rows never leave your secure session. Only anonymized column names and schema structures are shared with the LLM.",
    gradient: "from-emerald-500/10 to-teal-500/10"
  },
  {
    icon: <Code2 className="w-5 h-5 text-cyan-500" />,
    badge: "Dev & Pro Ready",
    title: "Integrated SQL Editor",
    description: "Switch seamlessly between AI-generated insights and a rich SQL code editor with execution metrics, table filters, and raw data export.",
    gradient: "from-cyan-500/10 to-blue-500/10"
  }
];

const interactiveDemos = [
  {
    id: "chat",
    tab: "1. Ask Natural Questions",
    prompt: "Compare average customer spend between Desktop and Mobile in Q3",
    sql: "SELECT device_type, ROUND(AVG(total_amount), 2) AS avg_spend, COUNT(*) as orders\nFROM sales_data\nWHERE quarter = 'Q3'\nGROUP BY device_type;",
    explanation: "Mobile users averaged $142.50 per order (+18% higher than Desktop at $120.75), accounting for 64% of total order volume.",
    chartType: "Grouped Bar Chart"
  },
  {
    id: "visualize",
    tab: "2. Automatic Visual Insights",
    prompt: "Show the top 5 product categories by revenue margin",
    sql: "SELECT category, SUM(revenue) as total_rev, ROUND(AVG(margin_pct), 1) as avg_margin\nFROM products\nGROUP BY category\nORDER BY total_rev DESC\nLIMIT 5;",
    explanation: "Electronics generated $450k revenue with a 38% margin, followed by Home Goods at $310k with the highest margin of 52%.",
    chartType: "Plotly Interactive Chart"
  },
  {
    id: "sql",
    tab: "3. Advanced Multi-File Joins",
    prompt: "Join customers with churn_risk and calculate high-risk counts by tier",
    sql: "SELECT c.plan_tier, COUNT(*) as at_risk_users\nFROM customers c\nJOIN churn_scores s ON c.user_id = s.user_id\nWHERE s.risk_score > 0.75\nGROUP BY c.plan_tier;",
    explanation: "Identified 284 high-risk enterprise users and 612 pro users, allowing proactive retention campaigns.",
    chartType: "Risk Distribution Donut"
  }
];

const testimonials = [
  {
    quote: "AI Data Analysis transformed our weekly sprint reporting. Instead of writing custom SQL for every ad-hoc question, stakeholders get charts and numbers in seconds.",
    author: "Elena Rostova",
    role: "Lead Data Scientist",
    company: "FinTech Scaleup",
    avatar: "ER"
  },
  {
    quote: "The zero-row transmission privacy model gave our compliance team complete confidence. It's the most polished, intuitive data tool we've used all year.",
    author: "Marcus Chen",
    role: "VP of Product Analytics",
    company: "HealthCore AI",
    avatar: "MC"
  },
  {
    quote: "DuckDB under the hood makes sub-second queries feel like magic. It feels like an AI copilot built specifically for analysts and founders.",
    author: "Sarah Jenkins",
    role: "Growth Director",
    company: "SaaS Matrix",
    avatar: "SJ"
  },
  {
    quote: "Clean, robust visual charting with zero SQL bottlenecks. We hooked up our financial CSVs and got instant multi-variable aggregations.",
    author: "Liam Vance",
    role: "Chief Strategy Officer",
    company: "Apex Capital",
    avatar: "LV"
  }
];

export default function LandingPage() {
  const { user } = useUser();
  const [activeDemo, setActiveDemo] = useState(0);
  const [isDemoHovered, setIsDemoHovered] = useState(false);

  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isTestimonialHovered, setIsTestimonialHovered] = useState(false);

  // Auto-playing Demo Carousel (2s timer, pauses on card hover)
  useEffect(() => {
    if (isDemoHovered) return;
    const timer = setInterval(() => {
      setActiveDemo((prev) => (prev + 1) % interactiveDemos.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [isDemoHovered]);

  // Auto-playing Testimonials Carousel (2s timer, pauses on card hover)
  useEffect(() => {
    if (isTestimonialHovered) return;
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [isTestimonialHovered]);

  const [isScrolled, setIsScrolled] = useState(false);

  // Track scroll position to morph navbar from full width (top) to floating pill (scrolled)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] dark:bg-[#161617] dark:text-[#f5f5f7] font-sans antialiased overflow-x-hidden selection:bg-blue-500/20 transition-colors duration-300">
      
      {/* Subtle macOS Ambient Aura Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[90vw] h-[600px] bg-gradient-to-b from-blue-400/10 via-indigo-300/6 to-transparent dark:from-blue-500/15 dark:via-purple-500/10 blur-[140px] rounded-full" />
        <div className="absolute top-[35%] -left-[10%] w-[45vw] h-[450px] bg-purple-300/8 dark:bg-purple-600/10 blur-[130px] rounded-full" />
        <div className="absolute top-[65%] -right-[10%] w-[45vw] h-[450px] bg-blue-300/8 dark:bg-blue-600/10 blur-[130px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#2d2d30_1px,transparent_1px)] [background-size:24px_24px] opacity-60 dark:opacity-40" />
      </div>

      {/* Dynamic Apple/macOS Navigation Bar (Full width at top -> Floating pill on scroll) */}
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isScrolled 
            ? "top-3 max-w-5xl mx-auto px-4" 
            : "top-0 w-full px-4 sm:px-8 border-b border-black/[0.06] dark:border-white/[0.08] bg-white/75 dark:bg-[#161617]/75 backdrop-blur-2xl"
        }`}
      >
        <div className={`flex items-center justify-between transition-all duration-300 ${
          isScrolled
            ? "bg-white/70 dark:bg-[#1d1d1f]/75 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-full px-6 h-15"
            : "max-w-7xl mx-auto h-18 px-2"
        }`}>
          
          {/* Logo with Favicon */}
          <a href="#" onClick={handleScrollToTop} className="flex items-center space-x-3 group cursor-pointer select-none">
            <img 
              src="/favicon.webp" 
              alt="AI Data Analysis Logo" 
              className="w-8 h-8 object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <span className="font-semibold text-lg tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
              AI Data Analysis
            </span>
          </a>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-7 text-sm font-medium text-[#515154] dark:text-[#a1a1a6]">
            <a href="#features" className="hover:text-[#0071e3] dark:hover:text-white transition-colors duration-200">Features</a>
            <a href="#demo" className="hover:text-[#0071e3] dark:hover:text-white transition-colors duration-200">Interactive Demo</a>
            <a href="#workflow" className="hover:text-[#0071e3] dark:hover:text-white transition-colors duration-200">Workflow</a>
            <a href="#testimonials" className="hover:text-[#0071e3] dark:hover:text-white transition-colors duration-200">Reviews</a>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            
            {user ? (
              <div className="flex items-center gap-3">
                <UserNavProfile />
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/app" className="relative group inline-flex items-center justify-center px-4 py-2 rounded-full text-white text-sm font-medium bg-[#0071e3] hover:bg-[#0077ed] shadow-[0_4px_14px_rgba(0,113,227,0.35)] hover:shadow-[0_6px_20px_rgba(0,113,227,0.45)] transition-all duration-300 cursor-pointer">
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
                  <Link to="/register" className="relative group inline-flex items-center justify-center px-4 py-2 rounded-full text-white text-sm font-medium bg-[#0071e3] hover:bg-[#0077ed] shadow-[0_4px_14px_rgba(0,113,227,0.35)] hover:shadow-[0_6px_20px_rgba(0,113,227,0.45)] transition-all duration-300 cursor-pointer">
                    <span className="relative flex items-center gap-1.5">
                      Get Started <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>
                </motion.div>
              </>
            )}
          </div>

        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 lg:pt-48 lg:pb-28 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-4xl mx-auto mb-16">
            
            {/* macOS Pill Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2.5 mb-8 px-4 py-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.12] bg-white/85 dark:bg-[#1d1d1f]/85 shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] backdrop-blur-xl hover:border-black/[0.15] dark:hover:border-white/[0.2] transition-all duration-300 cursor-default"
            >
              <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] dark:text-blue-400 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                Next-Gen Conversational Data Intelligence
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight mb-8 leading-[1.12] text-[#1d1d1f] dark:text-[#f5f5f7]"
            >
              <span className="font-kaushan tracking-normal text-transparent bg-clip-text bg-gradient-to-r from-[#0071e3] via-[#5e5ce6] to-[#af52de] dark:from-blue-400 dark:via-indigo-300 dark:to-purple-300">
                Talk to Your Data.
              </span>
              <br />
              <span className="font-kaushan tracking-normal text-transparent bg-clip-text bg-gradient-to-r from-[#af52de] via-[#ff2d55] to-[#ff9500] dark:from-purple-300 dark:via-pink-400 dark:to-amber-300">
                Get Instant Visuals.
              </span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p 
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg sm:text-xl md:text-2xl text-[#6e6e73] dark:text-[#a1a1a6] max-w-3xl mx-auto leading-relaxed mb-10 font-normal"
            >
              Upload any spreadsheet, SQLite, or SQL file and ask questions naturally. 
              <strong className="text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold"> AI Data Analysis</strong> turns natural language into high-speed DuckDB SQL, interactive Plotly charts, and business intelligence in seconds.
            </motion.p>

            {/* CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-5"
            >
              <Link 
                to="/register" 
                className="w-full sm:w-auto px-8 py-3.5 rounded-full font-medium text-base text-white bg-[#0071e3] hover:bg-[#0077ed] shadow-[0_6px_20px_rgba(0,113,227,0.35)] flex items-center justify-center gap-2 group transition-all duration-300"
              >
                Start Analyzing Free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a 
                href="#demo" 
                className="w-full sm:w-auto px-8 py-3.5 rounded-full font-medium text-base text-[#1d1d1f] dark:text-[#f5f5f7] bg-white/90 dark:bg-[#1d1d1f]/90 border border-black/[0.08] dark:border-white/[0.1] hover:bg-gray-50 dark:hover:bg-[#252528] flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all duration-300"
              >
                Explore Live Demo <ChevronRight className="w-4 h-4 text-[#86868b]" />
              </a>
            </motion.div>

            {/* Trust badge with point text hover */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-[#6e6e73] dark:text-[#a1a1a6]">
              <span className="group flex items-center gap-2 cursor-default hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors duration-200">
                <div className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/60 transition-colors duration-200">
                  <Check className="w-3.5 h-3.5" />
                </div> 
                <span>No SQL knowledge required</span>
              </span>
              <span className="group flex items-center gap-2 cursor-default hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors duration-200">
                <div className="p-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/60 transition-colors duration-200">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>100% In-Memory Privacy</span>
              </span>
              <span className="hidden sm:flex group items-center gap-2 cursor-default hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors duration-200">
                <div className="p-1 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/60 transition-colors duration-200">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Free to explore</span>
              </span>
            </div>
          </div>

          {/* macOS Window App Studio Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl mx-auto macos-window overflow-hidden"
          >
            {/* macOS Window Titlebar */}
            <div className="px-5 py-3.5 border-b border-black/[0.06] dark:border-white/[0.08] bg-[#f5f5f7]/90 dark:bg-[#1f1f22]/90 backdrop-blur-md flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
                <span className="ml-3 text-xs font-medium text-[#86868b] dark:text-[#a1a1a6]">AI Data Analysis Studio · ecommerce_q3_report.csv</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" /> DuckDB Connected
                </span>
              </div>
            </div>

            {/* macOS Window Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[400px] bg-white dark:bg-[#161617]">
              
              {/* Left Side: Conversational Chat Prompt */}
              <div className="lg:col-span-5 p-6 border-b lg:border-b-0 lg:border-r border-black/[0.06] dark:border-white/[0.08] bg-[#fafafa] dark:bg-[#1a1a1d] flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#0071e3] dark:text-blue-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Natural Language Query
                  </div>
                  
                  {/* User Bubble */}
                  <div className="p-3.5 rounded-2xl rounded-tr-none bg-[#0071e3] text-white text-sm font-medium shadow-[0_4px_12px_rgba(0,113,227,0.25)]">
                    "Which product categories generated the highest profit margin with over $50k revenue?"
                  </div>

                  {/* AI Response Card */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#222226] border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-2.5 text-xs text-[#515154] dark:text-[#a1a1a6]">
                    <div className="flex items-center gap-2 font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                      <div className="w-5 h-5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-[#5e5ce6] dark:text-indigo-400 flex items-center justify-center">
                        <Zap className="w-3.5 h-3.5" />
                      </div>
                      AI Generated Analysis
                    </div>
                    <p className="leading-relaxed font-normal">
                      Top performing is <strong className="text-[#1d1d1f] dark:text-[#f5f5f7]">Electronics</strong> ($184,200 rev, <strong className="text-[#1d1d1f] dark:text-[#f5f5f7]">42.1% margin</strong>) followed by <strong className="text-[#1d1d1f] dark:text-[#f5f5f7]">Home Office</strong> ($92,400 rev, <strong className="text-[#1d1d1f] dark:text-[#f5f5f7]">38.6% margin</strong>).
                    </p>
                    <div className="p-2.5 rounded-lg bg-[#1e1e24] text-emerald-400 font-mono text-[11px] overflow-x-auto">
                      SELECT category, SUM(rev), AVG(margin) FROM sales GROUP BY 1 HAVING SUM(rev) &gt; 50000;
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between text-xs text-[#86868b] dark:text-[#a1a1a6]">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" /> Latency: <strong className="text-[#1d1d1f] dark:text-[#f5f5f7]">142ms</strong>
                  </span>
                  <span>Rows analyzed: <strong className="text-[#1d1d1f] dark:text-[#f5f5f7]">128,450</strong></span>
                </div>
              </div>

              {/* Right Side: Interactive Chart Mockup */}
              <div className="lg:col-span-7 p-6 flex flex-col justify-between bg-white dark:bg-[#161617]">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Category Profitability vs Revenue</h4>
                      <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">Interactive Plotly Chart visualization</p>
                    </div>
                    <div className="flex gap-1.5">
                      <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] dark:text-blue-400 text-[11px] font-semibold border border-blue-100 dark:border-blue-800/40">
                        Bar Chart
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-[#f5f5f7] dark:bg-[#222226] text-[#515154] dark:text-[#a1a1a6] text-[11px] font-medium border border-black/[0.04] dark:border-white/[0.06]">
                        Export PNG
                      </span>
                    </div>
                  </div>

                  {/* Visual Bar Representation */}
                  <div className="space-y-3.5 pt-2">
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1.5 text-[#1d1d1f] dark:text-[#f5f5f7]">
                        <span>Electronics</span>
                        <span className="text-[#0071e3] dark:text-blue-400 font-semibold">$184.2k (42.1% margin)</span>
                      </div>
                      <div className="w-full h-3.5 rounded-full bg-[#f5f5f7] dark:bg-[#222226] overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: "92%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, delay: 0.3 }}
                          className="h-full rounded-full bg-gradient-to-r from-[#0071e3] to-[#5e5ce6]"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1.5 text-[#1d1d1f] dark:text-[#f5f5f7]">
                        <span>Home Office Furniture</span>
                        <span className="text-[#5e5ce6] dark:text-indigo-400 font-semibold">$92.4k (38.6% margin)</span>
                      </div>
                      <div className="w-full h-3.5 rounded-full bg-[#f5f5f7] dark:bg-[#222226] overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: "68%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, delay: 0.4 }}
                          className="h-full rounded-full bg-gradient-to-r from-[#5e5ce6] to-[#af52de]"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1.5 text-[#1d1d1f] dark:text-[#f5f5f7]">
                        <span>Audio & Accessories</span>
                        <span className="text-[#af52de] dark:text-purple-400 font-semibold">$64.8k (34.2% margin)</span>
                      </div>
                      <div className="w-full h-3.5 rounded-full bg-[#f5f5f7] dark:bg-[#222226] overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: "48%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, delay: 0.5 }}
                          className="h-full rounded-full bg-gradient-to-r from-[#af52de] to-[#ff2d55]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between text-xs font-medium">
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" /> +24% YoY margin growth detected
                  </span>
                  <Link to="/register" className="text-[#0071e3] dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold">
                    Try with your dataset <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </section>

      {/* Metrics Counter Section */}
      <section className="py-20 relative z-10 border-y border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-[#161617]/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="macos-card p-6"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] dark:text-blue-400 flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-4xl sm:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#0071e3] via-[#5e5ce6] to-[#af52de] dark:from-blue-400 dark:via-indigo-300 dark:to-purple-300 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-0.5">{stat.label}</div>
                  <div className="text-xs text-[#86868b] dark:text-[#a1a1a6]">{stat.sub}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bento Grid Features Section */}
      <section id="features" className="py-28 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4 border border-blue-100 dark:border-blue-800/40">
              Comprehensive Analytics Capabilities
            </div>
            <h2 className="text-4xl sm:text-5xl tracking-tight mb-4 text-[#1d1d1f] dark:text-[#f5f5f7]">
              <span className="font-kaushan text-transparent bg-clip-text bg-gradient-to-r from-[#0071e3] via-[#5e5ce6] to-[#af52de] dark:from-blue-400 dark:via-indigo-300 dark:to-purple-300">
                Engineered for Speed, Intelligence & Accuracy
              </span>
            </h2>
            <p className="text-lg text-[#6e6e73] dark:text-[#a1a1a6]">
              Everything you need to turn static data files into interactive insight engines in seconds.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="macos-card group p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[#f5f5f7] dark:bg-[#222226] border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                      {feature.icon}
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#f5f5f7] dark:bg-[#222226] text-[#515154] dark:text-[#a1a1a6] border border-black/[0.04] dark:border-white/[0.06]">
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold mb-2.5 text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-[#0071e3] dark:group-hover:text-blue-400 transition-colors duration-200">
                    {feature.title}
                  </h3>
                  
                  <p className="text-[#6e6e73] dark:text-[#a1a1a6] text-sm leading-relaxed mb-6 font-normal">
                    {feature.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-xs font-semibold text-[#0071e3] dark:text-blue-400">
                  <span>Explore capability</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* Interactive Live Demo Playground Section */}
      <section 
        id="demo" 
        className="py-28 relative z-10 bg-[#f5f5f7]/60 dark:bg-[#1a1a1d]/60 border-y border-black/[0.06] dark:border-white/[0.08]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-3xl mx-auto mb-14"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-[#af52de] dark:text-purple-400 text-xs font-semibold uppercase tracking-wider mb-4 border border-purple-100 dark:border-purple-800/40">
              Interactive 2s Playground Carousel {isDemoHovered && "(Paused on Card Hover)"}
            </div>
            <h2 className="text-4xl sm:text-5xl tracking-tight mb-4 text-[#1d1d1f] dark:text-[#f5f5f7]">
              <span className="font-kaushan text-transparent bg-clip-text bg-gradient-to-r from-[#af52de] via-[#0071e3] to-[#5e5ce6] dark:from-purple-300 dark:via-blue-300 dark:to-indigo-300">
                Experience the AI Assistant in Action
              </span>
            </h2>
            <p className="text-lg text-[#6e6e73] dark:text-[#a1a1a6]">
              Rotates every 2 seconds automatically. Hovering directly over the card pauses rotation.
            </p>
          </motion.div>

          {/* Tab Switcher */}
          <div className="flex flex-wrap justify-center gap-2.5 mb-10">
            {interactiveDemos.map((demo, idx) => (
              <button
                key={demo.id}
                onClick={() => setActiveDemo(idx)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                  activeDemo === idx 
                    ? "bg-[#0071e3] text-white shadow-[0_4px_14px_rgba(0,113,227,0.3)]" 
                    : "bg-white dark:bg-[#222226] text-[#515154] dark:text-[#a1a1a6] border border-black/[0.06] dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-[#2c2c30] shadow-sm"
                }`}
              >
                {demo.tab}
              </button>
            ))}
          </div>

          {/* Interactive Card with pause strictly on card hover */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeDemo}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => setIsDemoHovered(true)}
              onMouseLeave={() => setIsDemoHovered(false)}
              className="max-w-4xl mx-auto macos-card p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
            >
              <div className="space-y-6">
                
                {/* Natural prompt box */}
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#86868b] dark:text-[#a1a1a6] mb-2">User Question Prompt</div>
                  <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800/40 text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white dark:bg-[#1d1d1f] text-[#0071e3] dark:text-blue-400 shadow-sm shrink-0">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    "{interactiveDemos[activeDemo].prompt}"
                  </div>
                </div>

                {/* Generated SQL snippet */}
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#86868b] dark:text-[#a1a1a6] mb-2 flex items-center justify-between">
                    <span>Generated DuckDB SQL</span>
                    <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-mono font-bold">100% Sanitized & Read-Only</span>
                  </div>
                  <pre className="p-4 rounded-xl bg-[#1e1e24] text-emerald-400 font-mono text-xs sm:text-sm overflow-x-auto leading-relaxed border border-black/10 dark:border-white/10 shadow-inner">
                    {interactiveDemos[activeDemo].sql}
                  </pre>
                </div>

                {/* Generated Explanation */}
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#86868b] dark:text-[#a1a1a6] mb-2">AI Summary & Chart Selection</div>
                  <div className="p-4 rounded-xl bg-[#f5f5f7] dark:bg-[#222226] border border-black/[0.04] dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                      {interactiveDemos[activeDemo].explanation}
                    </p>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] dark:text-blue-400 text-xs font-semibold shrink-0 border border-blue-100 dark:border-blue-800/40">
                      <BarChart3 className="w-3.5 h-3.5" /> 
                      {interactiveDemos[activeDemo].chartType}
                    </span>
                  </div>
                </div>

              </div>
            </motion.div>
          </AnimatePresence>

        </div>
      </section>

      {/* Step Workflow Section */}
      <section id="workflow" className="py-28 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 text-xs font-semibold uppercase tracking-wider mb-4">
              Simple 3-Step Flow
            </div>
            <h2 className="text-4xl sm:text-5xl tracking-tight mb-4 text-[#1d1d1f] dark:text-[#f5f5f7]">
              <span className="font-kaushan text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-[#0071e3] to-[#5e5ce6] dark:from-emerald-400 dark:via-blue-300 dark:to-indigo-300">
                From Raw Files to Decisions in 60 Seconds
              </span>
            </h2>
            <p className="text-lg text-[#6e6e73] dark:text-[#a1a1a6]">
              No complex database pipelines, no warehouse setups. Just pure browser-speed data analysis.
            </p>
          </motion.div>

          <div className="space-y-24">
            
            {/* Step 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col md:flex-row items-center gap-12 lg:gap-16"
            >
              <div className="flex-1 order-2 md:order-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] dark:text-blue-400 font-bold text-xs mb-4 border border-blue-100 dark:border-blue-800/40">
                  STEP 01
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold mb-4 text-[#1d1d1f] dark:text-[#f5f5f7]">Drop Your Data Files</h3>
                <p className="text-[#6e6e73] dark:text-[#a1a1a6] text-lg leading-relaxed mb-6 font-normal">
                  Upload CSVs, Excel workbooks, or database snapshots. Our engine parses schemas in milliseconds, cleans column mappings, and loads them safely into an in-memory session.
                </p>
                <div className="flex flex-wrap gap-2 text-xs font-semibold text-[#515154] dark:text-[#a1a1a6]">
                  <span className="px-3 py-1.5 rounded-lg bg-[#f5f5f7] dark:bg-[#222226] border border-black/[0.06] dark:border-white/[0.08]">.CSV</span>
                  <span className="px-3 py-1.5 rounded-lg bg-[#f5f5f7] dark:bg-[#222226] border border-black/[0.06] dark:border-white/[0.08]">.XLSX</span>
                  <span className="px-3 py-1.5 rounded-lg bg-[#f5f5f7] dark:bg-[#222226] border border-black/[0.06] dark:border-white/[0.08]">.SQLITE</span>
                  <span className="px-3 py-1.5 rounded-lg bg-[#f5f5f7] dark:bg-[#222226] border border-black/[0.06] dark:border-white/[0.08]">.SQL</span>
                </div>
              </div>
              <div className="flex-1 order-1 md:order-2">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.85, y: 30 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center justify-center p-2 relative"
                >
                  <motion.img 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ 
                      duration: 4.5, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    src="/assets/img1.webp" 
                    alt="Data Ingestion" 
                    className="w-full max-w-[340px] sm:max-w-[380px] h-auto object-contain drop-shadow-[0_20px_35px_rgba(0,113,227,0.22)] transition-transform duration-500 hover:scale-[1.05]" 
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col md:flex-row items-center gap-12 lg:gap-16"
            >
              <div className="flex-1">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.85, y: 30 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                  className="flex items-center justify-center p-2 relative"
                >
                  <motion.img 
                    animate={{ y: [0, -12, 0] }}
                    transition={{ 
                      duration: 5, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: 0.6
                    }}
                    src="/assets/img2.webp" 
                    alt="Interactive Charting" 
                    className="w-full max-w-[340px] sm:max-w-[380px] h-auto object-contain drop-shadow-[0_20px_35px_rgba(94,92,230,0.25)] transition-transform duration-500 hover:scale-[1.05]" 
                  />
                </motion.div>
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-[#5e5ce6] dark:text-indigo-400 font-bold text-xs mb-4 border border-indigo-100 dark:border-indigo-800/40">
                  STEP 02
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold mb-4 text-[#1d1d1f] dark:text-[#f5f5f7]">Ask, Explore & Visualize</h3>
                <p className="text-[#6e6e73] dark:text-[#a1a1a6] text-lg leading-relaxed mb-6 font-normal">
                  Chat with your data or build custom charts in the visual explore panel. The system handles aggregations, filters, mathematical transforms, and Plotly renders seamlessly.
                </p>
                <div className="flex flex-wrap items-center gap-5 text-sm font-medium text-[#5e5ce6] dark:text-indigo-400">
                  <span className="group flex items-center gap-2 cursor-default hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors duration-200">
                    <div className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/60 transition-colors duration-200">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span>AI SQL Execution</span>
                  </span>
                  <span className="group flex items-center gap-2 cursor-default hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors duration-200">
                    <div className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/60 transition-colors duration-200">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <span>Real-time Plotly charts</span>
                  </span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Testimonials Carousel Section */}
      <section 
        id="testimonials" 
        className="py-28 relative z-10 bg-[#f5f5f7]/60 dark:bg-[#1a1a1d]/60 border-y border-black/[0.06] dark:border-white/[0.08] overflow-hidden"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-3xl mx-auto mb-14"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40 text-xs font-semibold uppercase tracking-wider mb-4">
              Auto Carousel · 2s Interval {isTestimonialHovered && "(Paused on Card Hover)"}
            </div>
            <h2 className="text-4xl sm:text-5xl tracking-tight mb-4 text-[#1d1d1f] dark:text-[#f5f5f7]">
              <span className="font-kaushan text-transparent bg-clip-text bg-gradient-to-r from-[#0071e3] via-[#af52de] to-[#ff2d55] dark:from-blue-400 dark:via-purple-300 dark:to-pink-300">
                Loved by Data Pros & Teams
              </span>
            </h2>
            <p className="text-lg text-[#6e6e73] dark:text-[#a1a1a6]">
              Hover directly over the testimonial card to pause rotation.
            </p>
          </motion.div>

          {/* Carousel Card */}
          <div className="relative min-h-[260px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentTestimonial}
                initial={{ opacity: 0, x: 30, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -30, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                onMouseEnter={() => setIsTestimonialHovered(true)}
                onMouseLeave={() => setIsTestimonialHovered(false)}
                className="w-full p-8 sm:p-10 macos-card shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-1 text-amber-400 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-[#1d1d1f] dark:text-[#f5f5f7] text-lg sm:text-xl font-normal leading-relaxed italic mb-8">
                    "{testimonials[currentTestimonial].quote}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-black/[0.06] dark:border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0071e3] to-[#5e5ce6] flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                      {testimonials[currentTestimonial].avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-base text-[#1d1d1f] dark:text-[#f5f5f7]">{testimonials[currentTestimonial].author}</div>
                      <div className="text-xs text-[#86868b] dark:text-[#a1a1a6]">{testimonials[currentTestimonial].role} · {testimonials[currentTestimonial].company}</div>
                    </div>
                  </div>

                  {/* Manual Controls */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                      className="p-2 rounded-full bg-[#f5f5f7] dark:bg-[#222226] hover:bg-gray-200 dark:hover:bg-[#2c2c30] text-[#515154] dark:text-[#a1a1a6] transition-colors cursor-pointer"
                      title="Previous"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
                      className="p-2 rounded-full bg-[#f5f5f7] dark:bg-[#222226] hover:bg-gray-200 dark:hover:bg-[#2c2c30] text-[#515154] dark:text-[#a1a1a6] transition-colors cursor-pointer"
                      title="Next"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Carousel Dot Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentTestimonial(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentTestimonial === idx 
                    ? "w-8 bg-[#0071e3]" 
                    : "w-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl p-10 sm:p-16 bg-[#1d1d1f] dark:bg-[#1a1a1d] text-white border border-transparent dark:border-white/[0.1] shadow-[0_24px_60px_rgba(0,0,0,0.18)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.5)] overflow-hidden text-center">
            
            {/* Background Glow */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-4xl sm:text-5xl tracking-tight mb-4 text-white">
                <span className="font-kaushan text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-pink-300">
                  Start Exploring Your Data Today
                </span>
              </h2>
              <p className="text-lg text-[#a1a1a6] mb-8 leading-relaxed font-normal">
                Join data teams and analysts turning static files into interactive SQL intelligence and visualizations.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/register"
                  className="px-8 py-3.5 rounded-full font-medium text-base text-[#1d1d1f] bg-white hover:bg-gray-100 shadow-xl transition-all duration-300"
                >
                  Create Free Account
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3.5 rounded-full font-medium text-base text-white border border-white/20 hover:bg-white/10 transition-all duration-300"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Static Footer with Icons and Scroll-to-Top Navigation */}
      <footer className="border-t border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-[#161617]/80 backdrop-blur-xl relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Brand column */}
            <div className="md:col-span-2 space-y-4">
              <a href="#" onClick={handleScrollToTop} className="flex items-center space-x-3 cursor-pointer select-none">
                <img 
                  src="/favicon.webp" 
                  alt="AI Data Analysis Logo" 
                  className="w-8 h-8 object-contain"
                />
                <span className="font-semibold text-lg tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                  AI Data Analysis
                </span>
              </a>
              <p className="text-sm text-[#6e6e73] dark:text-[#a1a1a6] max-w-sm font-normal">
                Next-generation conversational analytics, intelligent DuckDB query processing, and automated Plotly visualizations.
              </p>
            </div>

            {/* Resources Links */}
            <div>
              <h4 className="font-semibold text-sm text-[#1d1d1f] dark:text-[#f5f5f7] mb-4">Resources</h4>
              <ul className="space-y-2.5 text-sm text-[#6e6e73] dark:text-[#a1a1a6]">
                <li>
                  <Link to="/docs" className="flex items-center gap-2 hover:text-[#0071e3] dark:hover:text-blue-400 transition-colors">
                    <BookOpen className="w-4 h-4 text-[#0071e3] dark:text-blue-400 shrink-0" />
                    <span>Documentation</span>
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="flex items-center gap-2 hover:text-[#0071e3] dark:hover:text-blue-400 transition-colors">
                    <HelpCircle className="w-4 h-4 text-[#5e5ce6] dark:text-indigo-400 shrink-0" />
                    <span>FAQs</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="font-semibold text-sm text-[#1d1d1f] dark:text-[#f5f5f7] mb-4">Legal</h4>
              <ul className="space-y-2.5 text-sm text-[#6e6e73] dark:text-[#a1a1a6]">
                <li>
                  <Link to="/privacy" className="flex items-center gap-2 hover:text-[#0071e3] dark:hover:text-blue-400 transition-colors">
                    <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Privacy Policy</span>
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="flex items-center gap-2 hover:text-[#0071e3] dark:hover:text-blue-400 transition-colors">
                    <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Terms of Service</span>
                  </Link>
                </li>
              </ul>
            </div>

          </div>

          <div className="mt-8 pt-8 border-t border-black/[0.06] dark:border-white/[0.08] flex flex-col sm:flex-row justify-between items-center text-xs text-[#86868b] dark:text-[#a1a1a6] gap-4">
            <p>© {new Date().getFullYear()} AI Data Analysis. All rights reserved.</p>
            <p>Crafted for fast in-browser data intelligence.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
