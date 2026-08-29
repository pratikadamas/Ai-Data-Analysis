import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, KeyRound, Mail, ArrowRight, Zap, CheckCircle2, Lock } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

export default function AdminAuth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "";

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

      toast.success(`Welcome to Admin Panel, ${user.username}!`);
      navigate("/admin");
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Admin authentication failed.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = async () => {
    setEmail("admin@demo.com");
    setPassword("admin123");
    toast.info("Demo admin credentials auto-filled. Logging in...");
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/admin/login`, {
        email: "admin@demo.com",
        password: "admin123",
      });

      const { access_token, user } = response.data;
      localStorage.setItem("admin_token", access_token);
      localStorage.setItem("admin_user", JSON.stringify(user));

      toast.success(`Welcome to Admin Panel, ${user.username}!`);
      navigate("/admin");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Demo admin login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#000000] text-slate-900 dark:text-white flex items-center justify-center p-4 relative overflow-hidden font-sans transition-colors duration-300">
      {/* Background Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500/20 via-blue-500/10 to-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/80 dark:bg-[#161618]/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-3xl p-8 shadow-2xl relative z-10">
        
        {/* Header Badge */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
            <ShieldCheck className="w-9 h-9 text-white" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full mb-2">
            System Control Portal
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Admin Access</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Sign in to access system metrics, users, and API analytics.
          </p>
        </div>

        {/* Demo Login Quick Action */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/60 dark:border-blue-500/20 text-left">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                Quick Demo Testing
              </span>
            </div>
            <span className="text-[10px] bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 font-mono px-2 py-0.5 rounded-full">
              1-Click
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
            Click below to instantly log in using pre-configured demo admin credentials.
          </p>
          <button
            type="button"
            onClick={handleFillDemo}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-blue-500/20 active:scale-[0.98]"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Login as Demo Admin (admin@demo.com)</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-slate-200 dark:border-white/10 w-full" />
          <span className="bg-white dark:bg-[#161618] px-3 text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Or Standard Login
          </span>
          <div className="border-t border-slate-200 dark:border-white/10 w-full" />
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@demo.com"
                required
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-semibold text-sm flex items-center justify-center space-x-2 transition shadow-lg active:scale-[0.98]"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Admin Panel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer link back to standard app */}
        <div className="mt-8 text-center border-t border-slate-200 dark:border-white/10 pt-4">
          <Link
            to="/login"
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            ← Return to Standard User Login
          </Link>
        </div>

      </div>
    </div>
  );
}
