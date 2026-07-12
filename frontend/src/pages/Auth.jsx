import React, { useState } from "react";
import { useUser } from "../context/UserContext.jsx";
import { Eye, EyeOff, X, Sparkles, Database, TrendingUp, MessageSquare } from "lucide-react";
import { toast } from "react-toastify";

export default function Auth() {
  const { login, register, verifyOtp, forgotPassword, resetPassword } = useUser();
  const [view, setView] = useState("login"); // login | register | verify | forgot | reset
  
  // Form states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const switchView = (newView) => {
    setView(newView);
    // We intentionally don't clear email when switching views 
    // so it can be passed from register -> verify or forgot -> reset
    setUsername("");
    setPassword("");
    setOtp("");
    setShowPassword(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      toast.success("Successfully logged in!");
    } else {
      if (result.isUnverified) {
        setEmail(result.email || email);
        switchView("verify");
        const statusMsg = "Please verify your account using the OTP code sent to your email.";
        toast.warning(statusMsg);
      } else {
        toast.error(result.error || "Login failed. Please check your credentials.");
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) return;
    setLoading(true);
    const result = await register(username, email, password);
    setLoading(false);
    if (result.success) {
      setEmail(result.email);
      switchView("verify");
      const statusMsg = "Account registered! A 6-digit OTP code has been sent to your email.";
      toast.success(statusMsg);
    } else {
      toast.error(result.error);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!email || !otp) return;
    setLoading(true);
    const result = await verifyOtp(email, otp);
    setLoading(false);
    if (result.success) {
      switchView("login");
      const statusMsg = "Verification successful! You can now sign in.";
      toast.success(statusMsg);
    } else {
      toast.error(result.error);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);
    if (result.success) {
      switchView("reset");
      const statusMsg = "If the email matches, a reset OTP code was sent. Fill details below to reset.";
      toast.success(statusMsg);
    } else {
      toast.error(result.error);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email || !password || !otp) return;
    setLoading(true);
    const result = await resetPassword(email, password, otp);
    setLoading(false);
    if (result.success) {
      switchView("login");
      const statusMsg = "Password reset successful! Please login with your new password.";
      toast.success(statusMsg);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-950 text-white overflow-hidden select-none">
      {/* Left side: Premium Brand & Feature Showcase (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-[50%] relative bg-slate-900/40 flex-col justify-between p-12 overflow-hidden border-r border-slate-900">
        {/* SVG Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)] pointer-events-none" />
        
        {/* Subtle moving glows */}
        <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] rounded-full bg-brand-500/10 blur-[120px] pointer-events-none animate-pulse duration-[6000ms]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none animate-pulse duration-[8000ms]" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            AI Data Analyst
          </span>
        </div>

        {/* Feature List Container */}
        <div className="relative z-10 my-auto max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Intelligent Data Exploration
          </div>
          
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight mb-8">
            The simplest way to <br />
            <span className="bg-gradient-to-r from-brand-400 via-indigo-400 to-brand-300 bg-clip-text text-transparent">
              explore & analyze
            </span> your data.
          </h2>

          <div className="space-y-6">
            {/* Feature 1 */}
            <div className="flex gap-4 group">
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:bg-brand-500/10 group-hover:border-brand-500/30 transition-all duration-300">
                <Database className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                  Multi-Format Data Loader
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Seamlessly drop CSV, Excel, or JSON files. Automatic column detection, clean mappings, and ready in seconds.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-4 group">
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:bg-brand-500/10 group-hover:border-brand-500/30 transition-all duration-300">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                  Interactive Plotly Charts
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Interact with dynamic scatter, line, bar, or pie charts. Zoom, pan, filter, and export high-resolution assets instantly.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-4 group">
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:bg-brand-500/10 group-hover:border-brand-500/30 transition-all duration-300">
                <MessageSquare className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                  Conversational Insights
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Ask natural questions about your dataset. Our AI system writes backend Python code, handles processing, and replies in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Left Side Footer */}
        <div className="relative z-10 flex justify-between items-center text-xs text-slate-600">
          <span>&copy; {new Date().getFullYear()} AI Data Analyst. All rights reserved.</span>
          <span>v2.1.0</span>
        </div>
      </div>

      {/* Right side: Auth Form container */}
      <div className="w-full lg:w-[50%] flex items-center justify-center p-6 sm:p-12 relative bg-slate-950">
        {/* Glow circles for mobile/tablet background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#1e293b,transparent_70%)] opacity-20 lg:hidden pointer-events-none" />
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-brand-500/5 blur-[120px] lg:hidden pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-indigo-500/5 blur-[120px] lg:hidden pointer-events-none" />

        <div className="w-full max-w-[400px] relative z-10">
          {/* Logo for mobile only */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              AI Data Analyst
            </span>
          </div>

          {/* Form Header */}
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
              {view === "login" && "Welcome back"}
              {view === "register" && "Create an account"}
              {view === "verify" && "Verify account"}
              {view === "forgot" && "Forgot password?"}
              {view === "reset" && "Reset password"}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              {view === "login" && "Sign in to manage and analyze your datasets"}
              {view === "register" && "Enter your details to register and get started"}
              {view === "verify" && "Confirm your identity via OTP validation"}
              {view === "forgot" && "Enter email and we'll send a 6-digit OTP code"}
              {view === "reset" && "Define a secure, new password for your account"}
            </p>
          </div>

          {/* Dynamic Views */}
          {view === "login" && (
            <form onSubmit={handleLogin} className="space-y-5" autoComplete="off">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    autoComplete="off"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 focus:border-brand-500 focus:bg-slate-900 focus:ring-4 focus:ring-brand-500/10 text-sm text-white placeholder-slate-600 outline-none transition-all duration-200 pr-10"
                  />
                  {email && (
                    <button
                      type="button"
                      onClick={() => setEmail("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => switchView("forgot")}
                    className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors hover:underline hover:underline-offset-4"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="new-password"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 focus:border-brand-500 focus:bg-slate-900 focus:ring-4 focus:ring-brand-500/10 text-sm text-white placeholder-slate-600 outline-none transition-all duration-200 pr-16"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {password && (
                      <button
                        type="button"
                        onClick={() => setPassword("")}
                        className="text-slate-500 hover:text-white transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-500 hover:text-white transition-colors"
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
                  "Sign In"
                )}
              </button>

              <div className="text-center mt-6">
                <span className="text-xs text-slate-400">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => switchView("register")}
                  className="text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors hover:underline hover:underline-offset-4"
                >
                  Create account
                </button>
              </div>
            </form>
          )}

          {view === "register" && (
            <form onSubmit={handleRegister} className="space-y-5" autoComplete="off">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Pick a username"
                    autoComplete="off"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 focus:border-brand-500 focus:bg-slate-900 focus:ring-4 focus:ring-brand-500/10 text-sm text-white placeholder-slate-600 outline-none transition-all duration-200 pr-10"
                  />
                  {username && (
                    <button
                      type="button"
                      onClick={() => setUsername("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="off"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 focus:border-brand-500 focus:bg-slate-900 focus:ring-4 focus:ring-brand-500/10 text-sm text-white placeholder-slate-600 outline-none transition-all duration-200 pr-10"
                  />
                  {email && (
                    <button
                      type="button"
                      onClick={() => setEmail("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Choose a strong password"
                    autoComplete="new-password"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 focus:border-brand-500 focus:bg-slate-900 focus:ring-4 focus:ring-brand-500/10 text-sm text-white placeholder-slate-600 outline-none transition-all duration-200 pr-16"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {password && (
                      <button
                        type="button"
                        onClick={() => setPassword("")}
                        className="text-slate-500 hover:text-white transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-500 hover:text-white transition-colors"
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
                  "Create Account"
                )}
              </button>

              <div className="text-center mt-6">
                <span className="text-xs text-slate-400">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => switchView("login")}
                  className="text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors hover:underline hover:underline-offset-4"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {view === "verify" && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  readOnly
                  value={email}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/20 border border-slate-900 text-sm text-slate-500 cursor-not-allowed outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/40 border border-slate-800 focus:border-brand-500 focus:bg-slate-900 focus:ring-4 focus:ring-brand-500/10 text-sm text-white placeholder-slate-600 outline-none tracking-widest text-center font-bold transition-all duration-200"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 focus:ring-2 focus:ring-brand-500/50 outline-none flex justify-center items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Verify & Activate"
                )}
              </button>

              <div className="text-center mt-6 flex justify-between items-center px-1 text-xs">
                <button
                  type="button"
                  onClick={() => switchView("register")}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  &larr; Back to Sign Up
                </button>
                <button
                  type="button"
                  onClick={() => switchView("login")}
                  className="font-bold text-brand-400 hover:text-brand-300 transition-colors"
                >
                  Sign In Instead
                </button>
              </div>
            </form>
          )}

          {view === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="registered-email@example.com"
                    autoComplete="off"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 focus:border-brand-500 focus:bg-slate-900 focus:ring-4 focus:ring-brand-500/10 text-sm text-white placeholder-slate-600 outline-none transition-all duration-200 pr-10"
                  />
                  {email && (
                    <button
                      type="button"
                      onClick={() => setEmail("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
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
                  "Send Reset Code"
                )}
              </button>

              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => switchView("login")}
                  className="text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors hover:underline hover:underline-offset-4"
                >
                  &larr; Back to Login
                </button>
              </div>
            </form>
          )}

          {view === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-5" autoComplete="off">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  readOnly
                  value={email}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/20 border border-slate-900 text-sm text-slate-500 cursor-not-allowed outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 focus:border-brand-500 focus:bg-slate-900 focus:ring-4 focus:ring-brand-500/10 text-sm text-white placeholder-slate-600 outline-none transition-all duration-200 pr-16"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {password && (
                      <button
                        type="button"
                        onClick={() => setPassword("")}
                        className="text-slate-500 hover:text-white transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Reset OTP Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;"
                  autoComplete="off"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/40 border border-slate-800 focus:border-brand-500 focus:bg-slate-900 focus:ring-4 focus:ring-brand-500/10 text-sm text-white placeholder-slate-600 outline-none tracking-widest text-center font-bold transition-all duration-200"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 focus:ring-2 focus:ring-brand-500/50 outline-none flex justify-center items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Reset Password"
                )}
              </button>

              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => switchView("login")}
                  className="text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors hover:underline hover:underline-offset-4"
                >
                  Cancel and Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
