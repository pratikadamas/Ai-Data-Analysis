import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowLeft,
  Eye,
  EyeOff,
  X,
  Zap,
  CheckCircle2,
  BarChart3,
  Users,
  Activity,
  Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import ThemeToggle from "../components/ThemeToggle.jsx";

export default function AdminAuth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const rawApiUrl = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
  const API_URL = rawApiUrl.endsWith("/api") ? rawApiUrl.slice(0, -4) : rawApiUrl;

  const handleAdminLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter admin email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/admin/login`, {
        email: email.trim(),
        password: password.trim(),
      });

      const { access_token, user } = response.data;
      localStorage.setItem("admin_token", access_token);
      localStorage.setItem("admin_user", JSON.stringify(user));

      toast.success(`Welcome to Admin Portal, ${user.username}!`);
      navigate("/admin");
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Admin authentication failed.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-[#050505] text-slate-900 dark:text-white overflow-hidden select-none transition-colors duration-500">
      {/* Left side: Premium Brand & Admin Feature Showcase (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-[50%] relative bg-slate-50 dark:bg-slate-900/40 flex-col justify-between p-12 overflow-hidden border-r border-slate-200 dark:border-slate-800 transition-colors duration-500">
        {/* SVG Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)] pointer-events-none transition-colors duration-500" />

        {/* Moving glowing background gradients */}
        <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] rounded-full bg-brand-500/10 blur-[120px] pointer-events-none animate-pulse duration-[6000ms]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none animate-pulse duration-[8000ms]" />

        {/* Brand Header */}
        <Link
          to="/"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="relative z-10 flex items-center gap-2.5 group cursor-pointer"
        >
          <img
            src="/favicon.webp"
            alt="AI Data Analysis Logo"
            className="w-8 h-8 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-sm"
          />
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-700 dark:from-white dark:via-indigo-200 dark:to-slate-300 bg-clip-text text-transparent">
            AI Data Analysis
          </span>
        </Link>

        {/* Admin Feature Showcase List */}
        <div className="relative z-10 my-auto max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-semibold mb-6">
            <ShieldCheck className="w-3.5 h-3.5" /> System Control Center
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight leading-tight mb-8">
            Comprehensive system <br />
            <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-500 dark:from-brand-400 dark:via-indigo-400 dark:to-brand-300 bg-clip-text text-transparent">
              administration & metrics.
            </span>
          </h2>

          <div className="space-y-6">
            {/* Admin Feature 1 */}
            <div className="flex gap-4 group">
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center group-hover:bg-brand-500/10 group-hover:border-brand-500/30 transition-all duration-300 shadow-sm">
                <BarChart3 className="w-5 h-5 text-brand-500 dark:text-brand-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  Groq LLM Usage Analytics
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Real-time interactive SVG bar charts tracking daily API calls, total token volume, and daily aggregated MongoDB records.
                </p>
              </div>
            </div>

            {/* Admin Feature 2 */}
            <div className="flex gap-4 group">
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center group-hover:bg-brand-500/10 group-hover:border-brand-500/30 transition-all duration-300 shadow-sm">
                <Users className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  Paginated User Management
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Server-side MongoDB pagination, instant regex search across usernames and emails, role control, and account verification status.
                </p>
              </div>
            </div>

            {/* Admin Feature 3 */}
            <div className="flex gap-4 group">
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center group-hover:bg-brand-500/10 group-hover:border-brand-500/30 transition-all duration-300 shadow-sm">
                <Activity className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  System Health & Live Logs
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Monitor MongoDB ping response time, DuckDB memory sandboxes, and auto-stream backend server logs via in-memory ring buffer.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Left Side Footer */}
        <div className="relative z-10 flex justify-between items-center text-xs text-slate-500 dark:text-slate-600">
          <span>&copy; {new Date().getFullYear()} AI Data Analysis. All rights reserved.</span>
          <span>Admin Control v2.1</span>
        </div>
      </div>

      {/* Right side: Admin Auth Form Container */}
      <div className="w-full lg:w-[50%] flex items-center justify-center p-6 sm:p-12 relative bg-white dark:bg-[#050505] transition-colors duration-500">
        {/* Top Actions: Back to Home & Theme Toggle */}
        <div className="absolute top-6 left-6 right-6 sm:top-10 sm:left-10 sm:right-10 flex items-center justify-between z-20 pointer-events-auto">
          <Link
            to="/"
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
          <ThemeToggle />
        </div>

        {/* Glow circles for mobile/tablet background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.02),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,#1e293b,transparent_70%)] opacity-20 lg:hidden pointer-events-none transition-colors duration-500" />
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-brand-500/5 blur-[120px] lg:hidden pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-indigo-500/5 blur-[120px] lg:hidden pointer-events-none" />

        <div className="w-full max-w-[400px] relative z-10">
          {/* Logo for mobile only */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden justify-center mt-8 sm:mt-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-700 dark:from-white dark:via-indigo-200 dark:to-slate-300 bg-clip-text text-transparent">
              AI Data Analysis Admin
            </span>
          </div>

          {/* Form Header */}
          <div className="mb-8 text-center lg:text-left mt-8 lg:mt-0">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2 transition-colors duration-500">
              Admin Access
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium transition-colors duration-500">
              Sign in to manage system metrics, user accounts, and API analytics
            </p>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleAdminLogin} className="space-y-5" autoComplete="off">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider transition-colors duration-500">
                Admin Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@demo.com"
                  autoComplete="off"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-brand-500/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none transition-all duration-200 pr-10"
                />
                {email && (
                  <button
                    type="button"
                    onClick={() => setEmail("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider transition-colors duration-500">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-brand-500/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none transition-all duration-200 pr-16"
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {password && (
                    <button
                      type="button"
                      onClick={() => setPassword("")}
                      className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 focus:ring-2 focus:ring-brand-500/50 outline-none flex justify-center items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Sign In to Admin Portal"
              )}
            </button>
          </form>

          {/* Footer link back to standard user login */}
          <div className="text-center mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              &larr; Return to Standard User Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
