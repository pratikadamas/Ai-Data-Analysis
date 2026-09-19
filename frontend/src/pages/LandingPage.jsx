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
  Check,
  FileSpreadsheet,
  ArrowUpRight,
  Copy,
  ExternalLink,
  TrendingDown,
  LayoutDashboard,
  Menu,
  X,
  User,
  Download,
  Share2
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
    gradient: "from-blue-500/10 to-cyan-500/10"
  },
  {
    icon: <MessageSquare className="w-5 h-5 text-[#0284c7] dark:text-sky-400" />,
    badge: "Natural Language AI",
    title: "Conversational Query Assistant",
    description: "Ask questions in plain English like 'Show me monthly revenue by region with growth rates'. AI crafts sanitized, safe DuckDB SQL queries automatically.",
    gradient: "from-sky-500/10 to-cyan-500/10"
  },
  {
    icon: <LineChart className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />,
    badge: "Plotly Interactive",
    title: "Dynamic Smart Visualizations",
    description: "Automatic visual charting: scatter, line, grouped bar, and pie charts with interactive zoom, hover tooltips, and instant PNG/SVG exports.",
    gradient: "from-cyan-500/10 to-teal-500/10"
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
    shortTitle: "NL to DuckDB SQL",
    dataset: "ecommerce_sales_q3.duckdb",
    rows: "1.42M rows",
    execTime: "18ms",
    prompt: "Compare average customer spend between Desktop and Mobile in Q3",
    sql: `SELECT 
  device_type, 
  ROUND(AVG(total_amount), 2) AS avg_spend, 
  COUNT(*) AS total_orders
FROM sales_data
WHERE quarter = 'Q3'
GROUP BY device_type;`,
    explanation: "Mobile users averaged $142.50 per order (+18% higher than Desktop at $120.75), driving 64.2% of total Q3 checkout volume.",
    chartType: "Comparative Spend Breakdown",
    metrics: [
      { label: "Avg Mobile Spend", value: "$142.50", change: "+18.0%", trend: "up", sub: "vs Desktop $120.75" },
      { label: "Mobile Volume Share", value: "64.2%", change: "+6.5%", trend: "up", sub: "54,062 orders" },
      { label: "DuckDB Latency", value: "18ms", change: "In-Memory", trend: "neutral", sub: "1.42M rows scanned" }
    ],
    bars: [
      { name: "Mobile (iOS & Android)", value: "$142.50", pct: 90, share: "64.2% volume", color: "from-[#0071e3] to-[#06b6d4]", badge: "Highest Spend" },
      { name: "Desktop Browsers", value: "$120.75", pct: 74, share: "29.4% volume", color: "from-sky-500 to-cyan-400", badge: "Baseline" },
      { name: "Tablet Devices", value: "$96.40", pct: 58, share: "6.4% volume", color: "from-stone-400 to-stone-500 dark:from-stone-500 dark:to-stone-600", badge: "Secondary" }
    ]
  },
  {
    id: "visualize",
    tab: "2. Automatic Visual Insights",
    shortTitle: "Visual Intelligence",
    dataset: "global_products_2026.parquet",
    rows: "824K rows",
    execTime: "12ms",
    prompt: "Show the top product categories by revenue and their profit margin",
    sql: `SELECT 
  category, 
  SUM(revenue) AS total_revenue, 
  ROUND(AVG(margin_pct), 1) AS avg_margin
FROM products
GROUP BY category
ORDER BY total_revenue DESC
LIMIT 4;`,
    explanation: "Electronics generated $450k revenue at 38% margin, while Home & Kitchen delivered the highest profit margin of 52% on $310k revenue.",
    chartType: "Ranked Profitability Bars",
    metrics: [
      { label: "Top Revenue Sector", value: "$450,000", change: "Electronics", trend: "up", sub: "38.2% gross margin" },
      { label: "Peak Profit Margin", value: "52.0%", change: "Home Goods", trend: "up", sub: "Highest yield category" },
      { label: "Vector Scan Time", value: "12ms", change: "Parquet", trend: "neutral", sub: "824,500 catalog items" }
    ],
    bars: [
      { name: "Electronics & Tech", value: "$450,000", pct: 94, share: "Margin: 38%", color: "from-[#0071e3] to-[#06b6d4]", badge: "#1 Revenue" },
      { name: "Home & Kitchen", value: "$310,000", pct: 70, share: "Margin: 52%", color: "from-emerald-500 to-teal-400", badge: "#1 Profit %" },
      { name: "Apparel & Shoes", value: "$285,000", pct: 62, share: "Margin: 44%", color: "from-sky-500 to-cyan-400", badge: "Balanced" },
      { name: "Fitness & Sport", value: "$195,000", pct: 45, share: "Margin: 41%", color: "from-amber-500 to-orange-400", badge: "High Growth" }
    ]
  },
  {
    id: "sql",
    tab: "3. Advanced Multi-File Joins",
    shortTitle: "Vectorized Multi-Join",
    dataset: "crm_accounts_x_churn.duckdb",
    rows: "520K rows",
    execTime: "24ms",
    prompt: "Join customers with churn_risk and calculate high-risk counts by tier",
    sql: `SELECT 
  c.plan_tier, 
  COUNT(*) AS at_risk_users, 
  SUM(c.mrr) AS mrr_at_risk
FROM customers c
JOIN churn_scores s ON c.user_id = s.user_id
WHERE s.risk_score > 0.75
GROUP BY c.plan_tier;`,
    explanation: "Vectorized cross-table join flagged 284 high-risk enterprise accounts representing $142k in monthly ARR for immediate CSM retention alert.",
    chartType: "Risk Segment Distribution",
    metrics: [
      { label: "At-Risk Enterprise", value: "284 orgs", change: "$142k MRR", trend: "down", sub: "High tier alert" },
      { label: "At-Risk Pro Users", value: "612 orgs", change: "$73k MRR", trend: "down", sub: "Mid tier pool" },
      { label: "Join Latency", value: "24ms", change: "In-Memory", trend: "neutral", sub: "520k joined records" }
    ],
    bars: [
      { name: "Enterprise Tier ($142k ARR)", value: "284 Orgs", pct: 78, share: "$142k MRR at risk", color: "from-rose-500 to-amber-500", badge: "Critical Action" },
      { name: "Pro Plan Tier ($73k ARR)", value: "612 Orgs", pct: 48, share: "$73k MRR at risk", color: "from-amber-500 to-yellow-400", badge: "Monitor" },
      { name: "Starter Tier ($0 at risk)", value: "0 Orgs", pct: 10, share: "0% churn risk", color: "from-emerald-500 to-teal-400", badge: "Healthy" }
    ]
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
    quote: "DuckDB under the hood makes sub-second queries feel like magic. It feels like an AI copilot built specifically for data analysis and founders.",
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

const SQLHighlight = ({ code }) => {
  const lines = code.trim().split("\n");
  return (
    <div className="font-mono text-xs leading-5 select-text overflow-x-auto py-1">
      {lines.map((line, idx) => {
        const tokens = line.split(/(\b(?:SELECT|ROUND|AVG|SUM|COUNT|AS|FROM|JOIN|ON|WHERE|GROUP BY|ORDER BY|LIMIT|DESC)\b|'[^']*'|\b\d+\b)/g);
        return (
          <div key={idx} className="table-row">
            <span className="table-cell pr-3 text-stone-500 dark:text-stone-600 text-right select-none text-[11px] w-5">
              {idx + 1}
            </span>
            <span className="table-cell whitespace-pre">
              {tokens.map((token, tIdx) => {
                if (/^(?:SELECT|FROM|JOIN|ON|WHERE|GROUP BY|ORDER BY|LIMIT)$/.test(token)) {
                  return <span key={tIdx} className="text-cyan-400 font-semibold">{token}</span>;
                }
                if (/^(?:ROUND|AVG|SUM|COUNT)$/.test(token)) {
                  return <span key={tIdx} className="text-sky-300 font-medium">{token}</span>;
                }
                if (token === "AS" || token === "DESC") {
                  return <span key={tIdx} className="text-purple-400 font-medium">{token}</span>;
                }
                if (token.startsWith("'") && token.endsWith("'")) {
                  return <span key={tIdx} className="text-amber-300">{token}</span>;
                }
                if (/^\d+$/.test(token)) {
                  return <span key={tIdx} className="text-emerald-300">{token}</span>;
                }
                return <span key={tIdx} className="text-stone-300">{token}</span>;
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default function LandingPage() {
  const { user } = useUser();
  const [activeDemo, setActiveDemo] = useState(0);
  const [isDemoHovered, setIsDemoHovered] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [cardView, setCardView] = useState("visual"); // 'visual' | 'sql'

  const handleCopySql = (sqlText) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(sqlText);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    }
  };

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-[#f7f5f0] text-[#262422] dark:bg-[#161617] dark:text-[#f5f5f7] font-sans antialiased overflow-x-hidden selection:bg-blue-500/20 transition-colors duration-300">
      
      {/* Subtle macOS Ambient Aura Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[90vw] h-[600px] bg-gradient-to-b from-blue-400/10 via-sky-300/6 to-transparent dark:from-blue-500/15 dark:via-cyan-500/10 blur-[140px] rounded-full" />
        <div className="absolute top-[35%] -left-[10%] w-[45vw] h-[450px] bg-cyan-300/8 dark:bg-cyan-600/10 blur-[130px] rounded-full" />
        <div className="absolute top-[65%] -right-[10%] w-[45vw] h-[450px] bg-blue-300/8 dark:bg-blue-600/10 blur-[130px] rounded-full" />
      </div>

      {/* Dynamic Apple/macOS Navigation Bar (Full width at top -> Floating squeezed pill on scroll) */}
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center px-3 sm:px-6 pointer-events-none"
      >
        <div className="w-full flex flex-col items-center">
          {/* Main Squeezable Bar (Single morphing container: no flickering lines, pure smooth transition) */}
          <div className={`pointer-events-auto flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isScrolled
              ? "mt-2.5 sm:mt-3 w-full max-w-5xl h-14 sm:h-16 px-3.5 sm:px-7 rounded-2xl sm:rounded-full bg-[#fcfaf5]/75 dark:bg-[#1d1d1f]/75 backdrop-blur-2xl shadow-[0_12px_36px_rgba(40,30,20,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)] border border-stone-300/50 dark:border-white/[0.08]"
              : "mt-0 w-full max-w-7xl h-16 sm:h-20 px-3 sm:px-8 bg-transparent border-transparent shadow-none"
          }`}>
          
          {/* Logo with Favicon */}
          <a href="#" onClick={handleScrollToTop} className="flex items-center space-x-2 sm:space-x-3 group cursor-pointer select-none shrink-0">
            <img 
              src="/favicon.webp" 
              alt="AI Data Analysis Logo" 
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain transition-transform duration-300 group-hover:scale-105 shrink-0"
            />
            <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-[#0071e3] via-[#0284c7] to-[#06b6d4] dark:from-[#38bdf8] dark:via-[#0ea5e9] dark:to-[#06b6d4] bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
              <span className="hidden sm:inline">AI Data Analysis</span>
              <span className="sm:hidden">AI Analysis</span>
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-7 text-sm font-medium text-[#515154] dark:text-[#a1a1a6]">
            <a href="#features" className="hover:text-[#0071e3] dark:hover:text-white transition-colors duration-200">Features</a>
            <a href="#demo" className="hover:text-[#0071e3] dark:hover:text-white transition-colors duration-200">Interactive Demo</a>
            <a href="#workflow" className="hover:text-[#0071e3] dark:hover:text-white transition-colors duration-200">Workflow</a>
            <a href="#testimonials" className="hover:text-[#0071e3] dark:hover:text-white transition-colors duration-200">Reviews</a>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <ThemeToggle />
            
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-3">
                <UserNavProfile />
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Link 
                    to="/app" 
                    className="relative group inline-flex items-center justify-center p-2 sm:px-4 sm:py-2 rounded-full text-white text-xs sm:text-sm font-medium bg-[#0071e3] hover:bg-[#0077ed] shadow-[0_4px_14px_rgba(0,113,227,0.35)] hover:shadow-[0_6px_20px_rgba(0,113,227,0.45)] transition-all duration-300 cursor-pointer"
                    title="Launch Analytics Studio"
                  >
                    <span className="relative flex items-center gap-1.5">
                      <LayoutDashboard className="w-4 h-4 sm:hidden" />
                      <span className="hidden sm:inline">Launch App</span>
                      <ArrowRight className="hidden sm:inline w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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
                  <Link to="/register" className="relative group inline-flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-white text-xs sm:text-sm font-medium bg-[#0071e3] hover:bg-[#0077ed] shadow-[0_4px_14px_rgba(0,113,227,0.35)] hover:shadow-[0_6px_20px_rgba(0,113,227,0.45)] transition-all duration-300 cursor-pointer">
                    <span className="relative flex items-center gap-1.5">
                      Get Started <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>
                </motion.div>
              </>
            )}

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-1.5 sm:p-2 rounded-full text-[#515154] dark:text-[#a1a1a6] hover:text-[#0071e3] dark:hover:text-white bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] hover:bg-black/[0.06] dark:hover:bg-white/[0.1] transition-all cursor-pointer select-none"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Dropdown Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto md:hidden w-full max-w-5xl mt-2 p-3.5 rounded-2xl bg-[#fcfaf5]/95 dark:bg-[#1d1d1f]/95 border border-stone-200/80 dark:border-white/[0.12] shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl overflow-hidden"
            >
              {user ? (
                /* Logged In Mobile Drawer Content */
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#f8f5ee] dark:bg-white/[0.04] border border-stone-200/60 dark:border-white/[0.06]">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0071e3] to-[#06b6d4] flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                      {user.username ? user.username.substring(0, 2).toUpperCase() : "US"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                          {user.username}
                        </p>
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          Logged In
                        </span>
                      </div>
                      <p className="text-xs text-[#6e6e73] dark:text-[#a1a1a6] truncate font-normal">
                        {user.email || "Active Session"}
                      </p>
                    </div>
                  </div>

                  {/* Primary Mobile Action */}
                  <Link
                    to="/app"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0071e3] to-[#0284c7] text-white text-sm font-semibold shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Open Analytics Studio</span>
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Link>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      to="/app?tab=preview"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-[#515154] dark:text-[#a1a1a6] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-[#0071e3] dark:hover:text-white transition-colors"
                    >
                      <Database className="w-3.5 h-3.5 text-[#0071e3]" />
                      <span>Data Tables</span>
                    </Link>
                    <Link
                      to="/app?tab=chat"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-[#515154] dark:text-[#a1a1a6] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-[#0071e3] dark:hover:text-white transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#0284c7]" />
                      <span>Ask AI Assistant</span>
                    </Link>
                    <Link
                      to="/app?tab=explore"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-[#515154] dark:text-[#a1a1a6] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-[#0071e3] dark:hover:text-white transition-colors"
                    >
                      <LineChart className="w-3.5 h-3.5 text-cyan-500" />
                      <span>Visualizations</span>
                    </Link>
                    <Link
                      to="/app?tab=profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-[#515154] dark:text-[#a1a1a6] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-[#0071e3] dark:hover:text-white transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-indigo-500" />
                      <span>My Profile</span>
                    </Link>
                  </div>

                  <div className="h-px bg-stone-200/60 dark:bg-white/[0.08]" />

                  {/* Section Jump Links */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#6e6e73] dark:text-[#a1a1a6] px-2 mb-1">
                      Quick Jump
                    </p>
                    <a
                      href="#features"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#515154] dark:text-[#a1a1a6] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors"
                    >
                      Features & Architecture
                    </a>
                    <a
                      href="#demo"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#515154] dark:text-[#a1a1a6] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors"
                    >
                      Interactive Demo
                    </a>
                    <a
                      href="#workflow"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#515154] dark:text-[#a1a1a6] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors"
                    >
                      How It Works
                    </a>
                    <a
                      href="#testimonials"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#515154] dark:text-[#a1a1a6] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors"
                    >
                      User Reviews
                    </a>
                  </div>
                </div>
              ) : (
                /* Logged Out Mobile Drawer Content */
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center px-4 py-2 rounded-xl border border-stone-300 dark:border-white/10 text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center px-4 py-2 rounded-xl bg-[#0071e3] text-white text-xs font-semibold shadow-md shadow-blue-500/20 hover:bg-[#0077ed] transition-colors"
                    >
                      Get Started
                    </Link>
                  </div>
                  <div className="h-px bg-stone-200/60 dark:bg-white/[0.08]" />
                  <div className="space-y-1">
                    <a
                      href="#features"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#515154] dark:text-[#a1a1a6] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors"
                    >
                      Features
                    </a>
                    <a
                      href="#demo"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#515154] dark:text-[#a1a1a6] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors"
                    >
                      Interactive Demo
                    </a>
                    <a
                      href="#workflow"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#515154] dark:text-[#a1a1a6] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors"
                    >
                      Workflow
                    </a>
                    <a
                      href="#testimonials"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#515154] dark:text-[#a1a1a6] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors"
                    >
                      Reviews
                    </a>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 lg:pt-48 lg:pb-28 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Split 2-Column Hero Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center mb-16 lg:mb-20">
            
            {/* Left Column: Headlines, CTAs & Trust Badges */}
            <div className="lg:col-span-7 text-center lg:text-left">
              
              {/* macOS Pill Badge */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center gap-2.5 mb-6 px-4 py-1.5 rounded-full border border-stone-200/80 dark:border-white/[0.12] bg-[#fcfaf5]/85 dark:bg-[#1d1d1f]/85 shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] backdrop-blur-xl hover:border-stone-300 dark:hover:border-white/[0.2] transition-all duration-300 cursor-default"
              >
                <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] dark:text-blue-400 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-[#262422] dark:text-[#f5f5f7]">
                  Next-Gen Conversational Data Intelligence
                </span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.65rem] xl:text-[4.2rem] tracking-tight mb-6 leading-[1.12] text-[#262422] dark:text-[#f5f5f7]"
              >
                <span className="font-kaushan tracking-normal text-transparent bg-clip-text bg-gradient-to-r from-[#0071e3] via-[#0284c7] to-[#06b6d4] dark:from-blue-400 dark:via-sky-300 dark:to-cyan-300">
                  Talk to Your Data.
                </span>
                <br />
                <span className="font-kaushan tracking-normal text-transparent bg-clip-text bg-gradient-to-r from-[#06b6d4] via-[#0284c7] to-[#0071e3] dark:from-cyan-300 dark:via-sky-400 dark:to-blue-400">
                  Get Instant Visuals.
                </span>
              </motion.h1>

              {/* Sub-headline */}
              <motion.p 
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-base sm:text-lg md:text-xl text-[#6e6e73] dark:text-[#a1a1a6] max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-8 font-normal"
              >
                Upload any spreadsheet, SQLite, or SQL file and ask questions naturally.
                <br />
                <strong className="text-[#262422] dark:text-[#f5f5f7] font-semibold">AI Data Analysis</strong> turns natural language into high-speed DuckDB SQL, interactive Plotly charts, and business intelligence in seconds.
              </motion.p>

              {/* CTAs */}
              <motion.div 
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4 sm:gap-5"
              >
                <Link 
                  to="/register" 
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full font-medium text-base text-white bg-[#0071e3] hover:bg-[#0077ed] shadow-[0_6px_20px_rgba(0,113,227,0.35)] flex items-center justify-center gap-2 group transition-all duration-300"
                >
                  Start Analyzing Free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a 
                  href="#demo" 
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full font-medium text-base text-[#262422] dark:text-[#f5f5f7] bg-[#fcfaf5]/90 dark:bg-[#1d1d1f]/90 border border-stone-200/80 dark:border-white/[0.1] hover:bg-[#f3ede3] dark:hover:bg-[#252528] flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all duration-300"
                >
                  Explore Live Demo <ChevronRight className="w-4 h-4 text-[#86868b]" />
                </a>
              </motion.div>

              {/* Trust badges */}
              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs font-medium text-[#6e6e73] dark:text-[#a1a1a6]">
                <span className="group flex items-center gap-2 cursor-default hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors duration-200">
                  <div className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/60 transition-colors duration-200">
                    <Check className="w-3.5 h-3.5" />
                  </div> 
                  <span>No SQL required</span>
                </span>
                <span className="group flex items-center gap-2 cursor-default hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors duration-200">
                  <div className="p-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/60 transition-colors duration-200">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>100% In-Memory Privacy</span>
                </span>
                <span className="group flex items-center gap-2 cursor-default hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors duration-200">
                  <div className="p-1 rounded-md bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/60 transition-colors duration-200">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                      <span>Free to explore</span>
                </span>
              </div>
            </div>

            {/* Right Column: Animated Vector Assistant Bot (Pure SVG, 100% Transparent, Infinite 4K, Zero Blur, Zero Texts) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 flex items-center justify-center relative select-none"
            >
              {/* Soft ambient backglow matching platform brand palette */}
              <div className="absolute w-[360px] h-[360px] bg-gradient-to-tr from-[#0071e3]/20 via-[#06b6d4]/20 to-[#3b82f6]/20 dark:from-[#0071e3]/25 dark:via-[#06b6d4]/20 dark:to-[#3b82f6]/20 rounded-full blur-3xl pointer-events-none" />

              {/* Seamless Floating Vector Illustration (Still & Suspended on Screen) */}
              <div className="relative w-full max-w-[480px] lg:max-w-[540px] flex items-center justify-center">
                <img
                  src="/assets/Assistant-Bot.svg"
                  alt="AI Assistant Bot"
                  className="w-full h-auto object-contain pointer-events-none drop-shadow-[0_25px_50px_rgba(0,113,227,0.15)] dark:drop-shadow-[0_25px_50px_rgba(6,182,212,0.2)]"
                />
              </div>
            </motion.div>
          </div>

          {/* macOS Window App Studio Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl mx-auto rounded-3xl overflow-hidden border border-stone-300/70 dark:border-white/[0.1] shadow-[0_25px_70px_rgba(40,30,20,0.08)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
          >
            {/* macOS Window Titlebar */}
            <div className="px-5 py-3 border-b border-stone-200/80 dark:border-white/[0.08] bg-[#f4efe6]/95 dark:bg-[#1a1a1d]/95 backdrop-blur-md flex items-center justify-between select-none">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] shadow-[0_0_6px_rgba(255,95,86,0.35)]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] shadow-[0_0_6px_rgba(255,189,46,0.35)]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] shadow-[0_0_6px_rgba(39,201,63,0.35)]" />
                </div>
                <div className="flex items-center gap-1.5 ml-2 pl-3 border-l border-stone-300/60 dark:border-white/10">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#0071e3] dark:text-cyan-400" />
                  <span className="text-xs font-semibold text-[#262422] dark:text-[#f5f5f7]">ecommerce_q3_report.csv</span>
                  <span className="text-[11px] text-stone-500 dark:text-[#a1a1a6] hidden sm:inline">· AI Analytics Studio</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/40 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" /> DuckDB Connected
                </span>
              </div>
            </div>

            {/* macOS Window Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[420px] bg-[#fdfcf9] dark:bg-[#161617]">
              
              {/* Left Side: Conversational Chat Prompt */}
              <div className="lg:col-span-5 p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-stone-200/70 dark:border-white/[0.08] bg-[#f8f5ee]/70 dark:bg-[#1a1a1d]/60 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#0071e3] dark:text-cyan-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Natural Language Query
                  </div>
                  
                  {/* User Prompt Bubble - Refined Glass Tint with Accent Gradient */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0071e3]/8 via-[#0284c7]/6 to-[#06b6d4]/10 dark:from-[#0071e3]/20 dark:to-[#06b6d4]/15 border border-[#0071e3]/20 dark:border-[#0071e3]/40 shadow-xs relative overflow-hidden">
                    <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold text-[#0071e3] dark:text-cyan-400 uppercase tracking-wider">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#0071e3] to-[#06b6d4] text-white flex items-center justify-center text-[9px] font-bold shadow-2xs">Q</div>
                      <span>User Query</span>
                    </div>
                    <p className="text-sm font-medium text-[#262422] dark:text-[#f5f5f7] leading-relaxed">
                      "Which product categories generated the highest profit margin with over $50k revenue?"
                    </p>
                  </div>

                  {/* AI Response Card */}
                  <div className="p-4 rounded-2xl bg-[#ffffff]/95 dark:bg-[#202024]/95 border border-stone-200/80 dark:border-white/[0.08] shadow-[0_4px_16px_rgba(0,0,0,0.03)] space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-[#262422] dark:text-[#f5f5f7]">
                        <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-[#0071e3] to-[#06b6d4] text-white flex items-center justify-center shadow-xs">
                          <Zap className="w-3 h-3" />
                        </div>
                        <span>AI Generated Analysis</span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60">Confidence 99.4%</span>
                    </div>
                    <p className="text-stone-600 dark:text-[#a1a1a6] leading-relaxed font-normal">
                      Top performing is <strong className="text-[#262422] dark:text-[#f5f5f7] font-semibold">Electronics</strong> ($184,200 rev, <strong className="text-cyan-700 dark:text-cyan-400 font-semibold">42.1% margin</strong>) followed by <strong className="text-[#262422] dark:text-[#f5f5f7] font-semibold">Home Office</strong> ($92,400 rev, <strong className="text-cyan-700 dark:text-cyan-400 font-semibold">38.6% margin</strong>).
                    </p>
                    
                    {/* Syntax-Colored SQL Box */}
                    <div className="p-3 rounded-xl bg-[#1c1b1f] border border-stone-800 text-stone-200 font-mono text-[11px] overflow-x-auto shadow-inner">
                      <div className="flex items-center justify-between text-[10px] text-stone-400 mb-1.5 pb-1 border-b border-stone-800">
                        <span className="text-cyan-400 font-semibold">DuckDB SQL</span>
                        <span className="text-emerald-400 font-medium">8.2ms exec</span>
                      </div>
                      <div className="leading-relaxed">
                        <span className="text-sky-400 font-semibold">SELECT</span> category, <span className="text-amber-300">SUM</span>(rev), <span className="text-amber-300">AVG</span>(margin)<br/>
                        <span className="text-sky-400 font-semibold">FROM</span> sales<br/>
                        <span className="text-sky-400 font-semibold">GROUP BY</span> 1 <span className="text-sky-400 font-semibold">HAVING</span> <span className="text-amber-300">SUM</span>(rev) &gt; <span className="text-cyan-300">50000</span>;
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-stone-200/70 dark:border-white/[0.08] flex items-center justify-between text-xs text-stone-500 dark:text-[#a1a1a6]">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Zap className="w-3.5 h-3.5 text-amber-500" /> Latency: <strong className="text-[#262422] dark:text-[#f5f5f7]">142ms</strong>
                  </span>
                  <span className="font-medium">Rows analyzed: <strong className="text-[#262422] dark:text-[#f5f5f7]">128,450</strong></span>
                </div>
              </div>

              {/* Right Side: Interactive Chart Mockup */}
              <div className="lg:col-span-7 p-6 sm:p-7 flex flex-col justify-between bg-[#fdfcf9] dark:bg-[#161617]">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-[#0071e3] dark:text-cyan-400" />
                        <h4 className="text-base font-bold text-[#262422] dark:text-[#f5f5f7] tracking-tight">Category Profitability vs Revenue</h4>
                      </div>
                      <p className="text-xs text-stone-500 dark:text-[#a1a1a6] mt-0.5">Interactive Plotly Chart visualization · Dynamic aggregation</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] dark:text-cyan-300 text-xs font-semibold border border-blue-200/60 dark:border-blue-800/40 shadow-2xs flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" /> Bar Chart
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-[#f4efe6] dark:bg-[#222226] text-stone-700 dark:text-[#a1a1a6] text-xs font-medium border border-stone-300/60 dark:border-white/[0.06] hover:bg-[#ede5d8] transition-colors cursor-pointer flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> Export PNG
                      </span>
                    </div>
                  </div>

                  {/* Visual Bar Representation */}
                  <div className="space-y-3.5 pt-1">
                    <div className="p-3 rounded-xl bg-[#f7f5f0]/80 dark:bg-white/[0.02] border border-stone-200/60 dark:border-white/[0.06] hover:border-stone-300 transition-all">
                      <div className="flex justify-between items-center text-xs font-semibold mb-2">
                        <span className="text-[#262422] dark:text-[#f5f5f7]">Electronics</span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] dark:text-cyan-300 font-bold border border-blue-200/50 text-[11px]">
                          $184.2k <span className="text-stone-400 font-normal">|</span> 42.1% margin
                        </span>
                      </div>
                      <div className="w-full h-3.5 rounded-full bg-[#ede7dc] dark:bg-[#26262a] overflow-hidden p-0.5">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: "92%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, delay: 0.3 }}
                          className="h-full rounded-full bg-gradient-to-r from-[#0071e3] via-[#0284c7] to-[#06b6d4] shadow-[0_0_12px_rgba(0,113,227,0.3)]"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#f7f5f0]/80 dark:bg-white/[0.02] border border-stone-200/60 dark:border-white/[0.06] hover:border-stone-300 transition-all">
                      <div className="flex justify-between items-center text-xs font-semibold mb-2">
                        <span className="text-[#262422] dark:text-[#f5f5f7]">Home Office Furniture</span>
                        <span className="px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] dark:text-sky-300 font-bold border border-sky-200/50 text-[11px]">
                          $92.4k <span className="text-stone-400 font-normal">|</span> 38.6% margin
                        </span>
                      </div>
                      <div className="w-full h-3.5 rounded-full bg-[#ede7dc] dark:bg-[#26262a] overflow-hidden p-0.5">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: "68%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, delay: 0.4 }}
                          className="h-full rounded-full bg-gradient-to-r from-[#0284c7] to-[#06b6d4] shadow-[0_0_12px_rgba(2,132,199,0.3)]"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#f7f5f0]/80 dark:bg-white/[0.02] border border-stone-200/60 dark:border-white/[0.06] hover:border-stone-300 transition-all">
                      <div className="flex justify-between items-center text-xs font-semibold mb-2">
                        <span className="text-[#262422] dark:text-[#f5f5f7]">Audio & Accessories</span>
                        <span className="px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/60 text-[#06b6d4] dark:text-cyan-300 font-bold border border-cyan-200/50 text-[11px]">
                          $64.8k <span className="text-stone-400 font-normal">|</span> 34.2% margin
                        </span>
                      </div>
                      <div className="w-full h-3.5 rounded-full bg-[#ede7dc] dark:bg-[#26262a] overflow-hidden p-0.5">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: "48%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, delay: 0.5 }}
                          className="h-full rounded-full bg-gradient-to-r from-[#06b6d4] to-[#38bdf8] shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-200/70 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-medium">
                  <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200/60 w-fit">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> +24% YoY margin growth detected
                  </span>
                  <Link to="/register" className="text-[#0071e3] hover:text-[#0077ed] dark:text-cyan-300 dark:hover:text-cyan-200 flex items-center gap-1 font-semibold group transition-colors">
                    Try with your dataset <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

            </div>
          </motion.div>

          {/* Floating Key Performance Stats - No separate section, floating directly on screen */}
          <div className="max-w-5xl mx-auto mt-12 sm:mt-16">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.7, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -6, transition: { duration: 0.25 } }}
                    className="group relative p-5 sm:p-6 rounded-3xl bg-[#fcfaf5]/70 dark:bg-[#1d1d1f]/60 backdrop-blur-2xl border border-stone-200/80 dark:border-white/[0.08] shadow-[0_12px_36px_rgba(40,30,20,0.05)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.45)] hover:shadow-[0_20px_50px_rgba(0,113,227,0.12)] hover:border-[#0071e3]/30 dark:hover:border-cyan-400/30 transition-all duration-300 select-none overflow-hidden"
                  >
                    {/* Ambient Glow on Card Hover */}
                    <div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-gradient-to-br from-[#0071e3]/10 to-[#06b6d4]/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0071e3]/10 to-[#06b6d4]/15 dark:from-blue-500/20 dark:to-cyan-500/20 text-[#0071e3] dark:text-cyan-400 flex items-center justify-center border border-[#0071e3]/15 dark:border-cyan-500/20 group-hover:scale-110 transition-transform duration-300 shadow-2xs">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-500/70 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    </div>

                    <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#0071e3] via-[#0284c7] to-[#06b6d4] dark:from-blue-400 dark:via-sky-300 dark:to-cyan-300 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm font-bold text-[#262422] dark:text-[#f5f5f7] mb-1 group-hover:text-[#0071e3] dark:group-hover:text-cyan-400 transition-colors">
                      {stat.label}
                    </div>
                    <div className="text-xs text-stone-500 dark:text-[#a1a1a6] leading-relaxed">
                      {stat.sub}
                    </div>
                  </motion.div>
                );
              })}
            </div>
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
              <span className="font-kaushan text-transparent bg-clip-text bg-gradient-to-r from-[#0071e3] via-[#0284c7] to-[#06b6d4] dark:from-blue-400 dark:via-sky-300 dark:to-cyan-300">
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

      {/* Interactive Live Demo Section (Compact & Mobile-Optimized) */}
      <section 
        id="demo" 
        className="py-16 sm:py-20 relative z-10 bg-[#f8f5ee]/70 dark:bg-[#18181b]/70 border-y border-stone-300/60 dark:border-white/[0.08]"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-xl mx-auto mb-6 sm:mb-8"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-[#0284c7] dark:text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-2.5 border border-cyan-200/80 dark:border-cyan-800/50 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              <span>Interactive Preview</span>
              {isDemoHovered && (
                <span className="ml-1 text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded">
                  Paused
                </span>
              )}
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-2.5 text-[#1d1d1f] dark:text-[#f5f5f7]">
              <span className="font-kaushan text-transparent bg-clip-text bg-gradient-to-r from-[#06b6d4] via-[#0071e3] to-[#0284c7] dark:from-cyan-300 dark:via-blue-300 dark:to-sky-300">
                Experience the AI Assistant in Action
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-[#6e6e73] dark:text-[#a1a1a6] leading-relaxed">
              Ask in plain English. Get instant DuckDB SQL queries, summary metrics, and presentation-ready charts in milliseconds.
            </p>
          </motion.div>

          {/* Step Switcher (Fully visible and responsive on mobile with flex-wrap, centered on desktop) */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 mb-5 px-2 max-w-full">
            {interactiveDemos.map((demo, idx) => (
              <button
                key={demo.id}
                onClick={() => setActiveDemo(idx)}
                className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                  activeDemo === idx 
                    ? "bg-[#0071e3] text-white shadow-[0_4px_14px_rgba(0,113,227,0.3)] scale-[1.02]" 
                    : "bg-[#fcfaf5] dark:bg-[#202024] text-[#515154] dark:text-[#a1a1a6] border border-stone-300/70 dark:border-white/[0.08] hover:bg-white dark:hover:bg-[#27272b] hover:text-[#1d1d1f] dark:hover:text-white shadow-xs"
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  activeDemo === idx 
                    ? "bg-white/25 text-white" 
                    : "bg-stone-200/80 dark:bg-white/10 text-stone-600 dark:text-stone-300"
                }`}>
                  {idx + 1}
                </span>
                <span className="font-semibold whitespace-nowrap">{demo.shortTitle}</span>
              </button>
            ))}
          </div>

          {/* Compact macOS Card */}
          <div className="relative">
            {/* Ambient Background Aura Glow */}
            <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-cyan-500/10 via-[#0071e3]/10 to-sky-500/10 rounded-2xl blur-lg opacity-60 dark:opacity-30 pointer-events-none -z-10" />

            <AnimatePresence mode="wait">
              <motion.div 
                key={activeDemo}
                initial={{ opacity: 0, y: 8, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.99 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                onMouseEnter={() => setIsDemoHovered(true)}
                onMouseLeave={() => setIsDemoHovered(false)}
                className="macos-window overflow-hidden border border-stone-300/80 dark:border-white/[0.12] shadow-[0_16px_40px_rgba(40,30,20,0.06)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
              >
                {/* Header Bar */}
                <div className="flex items-center justify-between px-3.5 sm:px-4 py-2 bg-stone-100/90 dark:bg-white/[0.04] border-b border-stone-200/80 dark:border-white/[0.08]">
                  {/* Traffic Lights + Dataset */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                    </div>
                    <div className="flex items-center gap-1 ml-1 text-xs text-stone-600 dark:text-stone-300 font-mono truncate">
                      <Database className="w-3 h-3 text-[#0071e3] dark:text-cyan-400 shrink-0" />
                      <span className="truncate max-w-[110px] sm:max-w-none">{interactiveDemos[activeDemo].dataset}</span>
                    </div>
                  </div>

                  {/* Mode Switcher: Chart vs SQL */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center p-0.5 rounded-lg bg-stone-200/80 dark:bg-white/10 text-xs font-medium">
                      <button
                        onClick={() => setCardView("visual")}
                        className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                          cardView === "visual"
                            ? "bg-white dark:bg-[#1e1e22] text-[#0071e3] dark:text-cyan-300 font-semibold shadow-xs"
                            : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                        }`}
                      >
                        <BarChart3 className="w-3 h-3" />
                        <span>Chart</span>
                      </button>
                      <button
                        onClick={() => setCardView("sql")}
                        className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                          cardView === "sql"
                            ? "bg-white dark:bg-[#1e1e22] text-[#0071e3] dark:text-cyan-300 font-semibold shadow-xs"
                            : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                        }`}
                      >
                        <Terminal className="w-3 h-3" />
                        <span>SQL</span>
                      </button>
                    </div>

                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <Zap className="w-3 h-3 text-amber-500 fill-amber-500/20 shrink-0" />
                      {interactiveDemos[activeDemo].execTime}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-3.5 sm:p-5 space-y-3">
                  
                  {/* User Question Capsule */}
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30">
                    <div className="p-1.5 rounded-lg bg-white dark:bg-[#202025] text-[#0071e3] dark:text-cyan-400 shrink-0 shadow-xs">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] leading-snug truncate">
                      "{interactiveDemos[activeDemo].prompt}"
                    </p>
                  </div>

                  {/* Mode 1: Visual Chart View */}
                  {cardView === "visual" && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      {/* Interactive Visual Bars Container */}
                      <div className="p-3 sm:p-3.5 rounded-xl bg-white/80 dark:bg-[#1a1a1e]/80 border border-stone-200/90 dark:border-white/[0.08] shadow-xs space-y-2">
                        <div className="flex items-center justify-between text-xs pb-1.5 border-b border-stone-200/60 dark:border-white/[0.06]">
                          <span className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                            <BarChart3 className="w-3.5 h-3.5 text-[#0071e3] dark:text-cyan-400" />
                            {interactiveDemos[activeDemo].chartType}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.2 rounded-full">
                            Live Result
                          </span>
                        </div>

                        {/* Bars */}
                        <div className="space-y-2 pt-0.5">
                          {interactiveDemos[activeDemo].bars.slice(0, 3).map((bar, bIdx) => (
                            <div key={bar.name} className="space-y-0.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-stone-700 dark:text-stone-300 truncate max-w-[180px] sm:max-w-none">
                                  {bar.name}
                                </span>
                                <span className="font-mono font-bold text-[#0071e3] dark:text-cyan-300">
                                  {bar.value}
                                </span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-stone-200/70 dark:bg-white/10 overflow-hidden relative">
                                <motion.div
                                  key={`${activeDemo}-${bar.name}`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${bar.pct}%` }}
                                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: bIdx * 0.08 }}
                                  className={`h-full rounded-full bg-gradient-to-r ${bar.color}`}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* AI Executive Takeaway & Key Metrics */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-2.5 items-stretch">
                        <div className="sm:col-span-7 p-2.5 sm:p-3 rounded-xl bg-stone-100/80 dark:bg-white/[0.04] border border-stone-200/80 dark:border-white/[0.06] text-xs leading-relaxed text-stone-700 dark:text-stone-300 flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <span>{interactiveDemos[activeDemo].explanation}</span>
                        </div>

                        <div className="sm:col-span-5 grid grid-cols-2 gap-2">
                          {interactiveDemos[activeDemo].metrics.slice(0, 2).map((metric) => (
                            <div
                              key={metric.label}
                              className="p-2 sm:p-2.5 rounded-xl bg-stone-100/70 dark:bg-white/[0.04] border border-stone-200/80 dark:border-white/[0.06] flex flex-col justify-between"
                            >
                              <div className="text-[10px] font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider truncate">
                                {metric.label}
                              </div>
                              <div className="my-0.5 text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7] font-mono truncate">
                                {metric.value}
                              </div>
                              <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                                {metric.change}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Mode 2: DuckDB SQL Code View */}
                  {cardView === "sql" && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="rounded-xl bg-[#12141c] text-stone-100 border border-black/20 dark:border-white/10 overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-3 py-1.5 bg-[#191b26] border-b border-white/[0.06] text-[11px] font-mono">
                        <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                          <Terminal className="w-3.5 h-3.5" />
                          <span>DuckDB Vector SQL</span>
                        </div>
                        <button
                          onClick={() => handleCopySql(interactiveDemos[activeDemo].sql)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium text-stone-300 bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
                        >
                          {copiedSql ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="p-3 text-xs">
                        <SQLHighlight code={interactiveDemos[activeDemo].sql} />
                      </div>
                      <div className="px-3 py-1 bg-[#161822] border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-stone-400">
                        <span>Read-Only In-Memory Execution</span>
                        <span>{interactiveDemos[activeDemo].rows} scanned in {interactiveDemos[activeDemo].execTime}</span>
                      </div>
                    </motion.div>
                  )}

                </div>

                {/* Compact Bottom Footer */}
                <div className="px-3.5 sm:px-4 py-2 bg-stone-100/80 dark:bg-white/[0.02] border-t border-stone-200/80 dark:border-white/[0.06] flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>In-Memory DuckDB • 0 persistent disk rows</span>
                  </div>
                  <Link 
                    to="/login"
                    className="inline-flex items-center gap-1 text-[#0071e3] dark:text-cyan-300 hover:underline font-semibold text-[11px]"
                  >
                    Try live <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

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
              <span className="font-kaushan text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-[#0071e3] to-[#06b6d4] dark:from-emerald-400 dark:via-blue-300 dark:to-cyan-300">
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
                <h3 className="text-3xl sm:text-4xl mb-4">
                  <span className="font-kaushan tracking-normal text-transparent bg-clip-text bg-gradient-to-r from-[#0071e3] via-[#0284c7] to-[#06b6d4] dark:from-blue-400 dark:via-sky-300 dark:to-cyan-300">
                    Drop Your Data Files
                  </span>
                </h3>
                <p className="text-[#6e6e73] dark:text-[#a1a1a6] text-lg leading-relaxed mb-6 font-normal">
                  Upload CSVs, Excel workbooks, or database snapshots. Our engine parses schemas in milliseconds, cleans column mappings, and loads them safely into an in-memory session.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {[".CSV", ".XLSX", ".SQLITE", ".SQL"].map((ext) => (
                    <span
                      key={ext}
                      className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-mono font-medium text-stone-600 dark:text-stone-300 bg-stone-200/60 dark:bg-white/5 border border-stone-300/60 dark:border-white/10 hover:border-[#0071e3]/60 dark:hover:border-cyan-400/60 hover:bg-white dark:hover:bg-cyan-500/10 hover:text-[#0071e3] dark:hover:text-cyan-300 hover:scale-105 hover:-translate-y-0.5 hover:shadow-xs hover:shadow-[#0071e3]/10 dark:hover:shadow-[0_2px_10px_rgba(6,182,212,0.15)] transition-all duration-200 cursor-default select-none"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400/70 dark:bg-stone-500 group-hover:bg-[#0071e3] dark:group-hover:bg-cyan-400 group-hover:scale-125 transition-all duration-200" />
                      {ext}
                    </span>
                  ))}
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
                    className="w-full max-w-[340px] sm:max-w-[380px] h-auto object-contain drop-shadow-[0_20px_35px_rgba(6,182,212,0.25)] transition-transform duration-500 hover:scale-[1.05]" 
                  />
                </motion.div>
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-50 dark:bg-cyan-950/60 text-[#0284c7] dark:text-cyan-400 font-bold text-xs mb-4 border border-cyan-100 dark:border-cyan-800/40">
                  STEP 02
                </div>
                <h3 className="text-3xl sm:text-4xl mb-4">
                  <span className="font-kaushan tracking-normal text-transparent bg-clip-text bg-gradient-to-r from-[#06b6d4] via-[#0284c7] to-[#0071e3] dark:from-cyan-300 dark:via-sky-400 dark:to-blue-400">
                    Ask, Explore & Visualize
                  </span>
                </h3>
                <p className="text-[#6e6e73] dark:text-[#a1a1a6] text-lg leading-relaxed mb-6 font-normal">
                  Chat with your data or build custom charts in the visual explore panel. The system handles aggregations, filters, mathematical transforms, and Plotly renders seamlessly.
                </p>
                <div className="flex flex-wrap items-center gap-6 text-sm font-medium">
                  <span className="group flex items-center gap-2 text-[#262422] dark:text-[#f5f5f7] cursor-default transition-colors duration-200">
                    <Sparkles className="w-4 h-4 text-[#0071e3] dark:text-blue-400 transition-transform duration-200 group-hover:scale-110" />
                    <span className="group-hover:text-[#0071e3] dark:group-hover:text-blue-400 transition-colors">AI SQL Execution</span>
                  </span>
                  <span className="group flex items-center gap-2 text-[#262422] dark:text-[#f5f5f7] cursor-default transition-colors duration-200">
                    <BarChart3 className="w-4 h-4 text-[#0284c7] dark:text-cyan-400 transition-transform duration-200 group-hover:scale-110" />
                    <span className="group-hover:text-[#0284c7] dark:group-hover:text-cyan-400 transition-colors">Real-time Plotly charts</span>
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Step 3: Decide, Export & Share */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col md:flex-row items-center gap-12 lg:gap-16"
            >
              <div className="flex-1 order-2 md:order-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] dark:text-blue-400 font-bold text-xs mb-4 border border-blue-100 dark:border-blue-800/40">
                  STEP 03
                </div>
                <h3 className="text-3xl sm:text-4xl mb-4">
                  <span className="font-kaushan tracking-normal text-transparent bg-clip-text bg-gradient-to-r from-[#0071e3] via-[#0284c7] to-[#06b6d4] dark:from-blue-400 dark:via-sky-300 dark:to-cyan-300">
                    Decide, Export & Share
                  </span>
                </h3>
                <p className="text-[#6e6e73] dark:text-[#a1a1a6] text-lg leading-relaxed mb-6 font-normal">
                  Turn discoveries into immediate business actions. Export presentation-ready Plotly charts in SVG or PNG, download cleaned analytical datasets in Excel or CSV, and share instant executive summaries with your team in one click.
                </p>
                <div className="flex flex-wrap items-center gap-6 text-sm font-medium">
                  <span className="group flex items-center gap-2 text-[#262422] dark:text-[#f5f5f7] cursor-default transition-colors duration-200">
                    <FileSpreadsheet className="w-4 h-4 text-[#0071e3] dark:text-blue-400 transition-transform duration-200 group-hover:scale-110" />
                    <span className="group-hover:text-[#0071e3] dark:group-hover:text-blue-400 transition-colors">Instant CSV & Excel Download</span>
                  </span>
                  <span className="group flex items-center gap-2 text-[#262422] dark:text-[#f5f5f7] cursor-default transition-colors duration-200">
                    <Download className="w-4 h-4 text-[#0284c7] dark:text-cyan-400 transition-transform duration-200 group-hover:scale-110" />
                    <span className="group-hover:text-[#0284c7] dark:group-hover:text-cyan-400 transition-colors">High-Res Vector Visuals</span>
                  </span>
                </div>
              </div>

              <div className="flex-1 order-1 md:order-2">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.85, y: 30 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                  className="flex items-center justify-center p-2 relative"
                >
                  <motion.img 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ 
                      duration: 4.8, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: 0.3
                    }}
                    src="/assets/img3.webp" 
                    alt="Export & Decision Flow" 
                    className="w-full max-w-[340px] sm:max-w-[380px] h-auto object-contain drop-shadow-[0_20px_35px_rgba(0,113,227,0.22)] transition-transform duration-500 hover:scale-[1.05]" 
                  />
                </motion.div>
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
            <h2 className="text-4xl sm:text-5xl tracking-tight mb-4 text-[#1d1d1f] dark:text-[#f5f5f7]">
              <span className="font-kaushan text-transparent bg-clip-text bg-gradient-to-r from-[#0071e3] via-[#0284c7] to-[#06b6d4] dark:from-blue-400 dark:via-sky-300 dark:to-cyan-300">
                Loved by Data Pros & Teams
              </span>
            </h2>
            <p className="text-lg text-[#6e6e73] dark:text-[#a1a1a6]">
              Real feedback from data analysis teams, engineers, and product teams.
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
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0071e3] to-[#06b6d4] flex items-center justify-center text-white font-semibold text-sm shadow-sm">
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
          <div className="flex items-center justify-center gap-2.5 mt-8">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentTestimonial(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentTestimonial === idx 
                    ? "w-8 bg-[#0071e3] shadow-[0_2px_10px_rgba(0,113,227,0.4)]" 
                    : "w-2.5 bg-stone-300 dark:bg-stone-600 hover:bg-stone-400 dark:hover:bg-stone-500"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl p-10 sm:p-16 lg:p-20 bg-gradient-to-b from-[#fcfaf5] to-[#f5efe4] dark:bg-[#030712] border border-stone-300/80 dark:border-0 shadow-[0_24px_60px_rgba(40,30,20,0.06)] dark:shadow-[0_24px_60px_rgba(0,113,227,0.3)] overflow-hidden text-center group">
            
            {/* Cybernetic Data Topography Background Images */}
            <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
              {/* Light Mode: Crisp White & Sapphire Blue Digital Topography */}
              <img
                src="/assets/cta_data_topography_light.webp"
                alt="Cybernetic Data Topography Light"
                className="w-full h-full object-cover object-center block dark:hidden opacity-85 contrast-105 brightness-100 transition-transform duration-1000 ease-out group-hover:scale-105"
              />
              {/* Dark Mode: Deep Cybernetic Neon Blue Topography */}
              <img
                src="/assets/cta_data_topography.webp"
                alt="Cybernetic Data Topography Dark"
                className="w-full h-full object-cover object-center hidden dark:block opacity-90 contrast-115 brightness-105 transition-transform duration-1000 ease-out group-hover:scale-105"
              />
              {/* Readability vignettes */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#fcfaf5]/30 via-transparent to-[#f5efe4]/40 dark:from-[#030712]/80 dark:via-[#030712]/45 dark:to-[#030712]/85" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(252,250,245,0.65)_0%,transparent_75%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(3,7,18,0.85)_100%)]" />
            </div>

            {/* Background Ambient Glows */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-[#0071e3]/15 dark:bg-cyan-500/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-[#06b6d4]/15 dark:bg-blue-600/30 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-xl mx-auto px-2">
              <h2 className="text-4xl sm:text-5xl tracking-tight mb-4">
                <span className="font-kaushan tracking-normal text-transparent bg-clip-text bg-gradient-to-r from-[#005bb5] via-[#0284c7] to-[#0092b8] dark:from-cyan-300 dark:via-sky-200 dark:to-blue-400 drop-shadow-sm">
                  Start Exploring Your Data Today
                </span>
              </h2>
              <p className="text-lg text-stone-800 dark:text-stone-300 mb-8 leading-relaxed font-medium dark:font-normal">
                Join data teams turning static files into interactive AI Data Analysis and visualizations.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/register"
                  className="px-8 py-3.5 rounded-full font-medium text-base text-white bg-gradient-to-r from-[#0071e3] to-[#0284c7] hover:from-[#0077ed] hover:to-[#0396db] shadow-[0_6px_20px_rgba(0,113,227,0.35)] hover:shadow-[0_8px_25px_rgba(0,113,227,0.5)] transition-all duration-300 cursor-pointer"
                >
                  Create Free Account
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3.5 rounded-full font-medium text-base text-[#262422] dark:text-white bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-stone-300/80 dark:border-white/25 backdrop-blur-md shadow-sm transition-all duration-300 cursor-pointer"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Static Footer with Icons and Scroll-to-Top Navigation */}
      <footer id="footer" className="border-t border-stone-200/80 dark:border-white/[0.08] bg-[#fcfaf5]/85 dark:bg-[#161617]/80 backdrop-blur-xl relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Brand column */}
            <div className="md:col-span-2 space-y-4">
              <a href="#" onClick={handleScrollToTop} className="flex items-center space-x-3 cursor-pointer select-none group">
                <img 
                  src="/favicon.webp" 
                  alt="AI Data Analysis Logo" 
                  className="w-8 h-8 object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-[#0071e3] via-[#0284c7] to-[#06b6d4] dark:from-[#38bdf8] dark:via-[#0ea5e9] dark:to-[#06b6d4] bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
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
                    <HelpCircle className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
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
            <p>© {new Date().getFullYear()} <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#0071e3] to-[#06b6d4]">AI Data Analysis</span>. All rights reserved.</p>
            <p>Crafted for fast in-browser data intelligence.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
