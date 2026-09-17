import React, { useState, useEffect, useRef, useCallback } from "react";
import { useUser } from "../context/UserContext.jsx";
import { Eye, EyeOff, X, Sparkles, Database, TrendingUp, MessageSquare, ArrowLeft, RefreshCw, Clock } from "lucide-react";
import { toast } from "react-toastify";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { signInWithGoogle } from "../services/firebase.js";
import ThemeToggle from "../components/ThemeToggle.jsx";

// Google colour logo SVG
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
);

// ── Countdown-timer hook ──────────────────────────────────────────────
// Returns: { secondsLeft, isActive, startCountdown }
// startCountdown(seconds | isoString)  — pass remaining seconds OR an ISO date string
function useOtpCountdown() {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startCountdown = useCallback((secondsOrIso) => {
    clearTimer();
    let remaining;
    if (typeof secondsOrIso === "string") {
      // ISO date from server → compute remaining ms
      remaining = Math.max(0, Math.round((new Date(secondsOrIso + "Z") - Date.now()) / 1000));
    } else {
      remaining = Math.max(0, Math.round(secondsOrIso));
    }
    setSecondsLeft(remaining);
    if (remaining <= 0) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => clearTimer(), []);

  return { secondsLeft, isActive: secondsLeft > 0, startCountdown };
}

// Circular SVG ring around the countdown number
const RING_R = 18;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R;
function CountdownRing({ secondsLeft, total = 60 }) {
  const progress = Math.max(0, Math.min(1, secondsLeft / total));
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress);
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" className="absolute -top-0.5 -left-0.5" style={{ transform: "rotate(-90deg)" }}>
      {/* Track */}
      <circle cx="22" cy="22" r={RING_R} fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-200 dark:text-slate-800" />
      {/* Progress */}
      <circle
        cx="22" cy="22" r={RING_R}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray={RING_CIRCUMFERENCE}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        className="text-brand-500 transition-all duration-1000 ease-linear"
      />
    </svg>
  );
}

export default function Auth() {
  const { login, register, verifyOtp, forgotPassword, resetPassword, resendOtp, loginWithGoogle } = useUser();
  const navigate = useNavigate();

  // Determine initial view from URL path or query param
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const initialMode = searchParams.get("mode") || (location.pathname === "/register" ? "register" : "login");
  const [view, setView] = useState(initialMode); // login | register | verify | forgot | reset
  const [googleLoading, setGoogleLoading] = useState(false);

  // Sync view when URL changes
  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "register" || location.pathname === "/register") {
      setView("register");
    } else if (mode === "login" || location.pathname === "/login") {
      setView("login");
    }
  }, [searchParams, location]);

  // Google OAuth handler
  const handleGoogleSignIn = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    try {
      // Step 1: Firebase popup → get credential
      const result = await signInWithGoogle();
      // Step 2: Get Firebase ID token to exchange with our backend
      const idToken = await result.user.getIdToken();
      // Step 3: Backend verifies token, upserts user in MongoDB, returns our JWT
      const outcome = await loginWithGoogle(idToken);
      if (outcome.success) {
        toast.success(`Welcome, ${result.user.displayName || result.user.email}!`);
        navigate("/app", { replace: true });
      } else {
        toast.error(outcome.error || "Google sign-in failed. Please try again.");
      }
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        toast.error(err.message || "Google sign-in failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Countdown timer (shared between verify + reset views)
  const { secondsLeft, isActive: timerActive, startCountdown } = useOtpCountdown();
  const [resendLoading, setResendLoading] = useState(false);
  const OTP_COOLDOWN = 60; // seconds
  
  // Form states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Email format validator
  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const switchView = (newView) => {
    setView(newView);
    setUsername("");
    setPassword("");
    setOtp("");
    setShowPassword(false);
    setEmailError("");
    // Start cooldown when entering OTP views so the button is disabled immediately
    if (newView === "verify" || newView === "reset") {
      startCountdown(OTP_COOLDOWN);
    }
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
    if (!validateEmail(email)) {
      setEmailError("Enter a valid Email");
      return;
    }
    setEmailError("");
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
    if (!validateEmail(email)) {
      setEmailError("Enter a valid Email");
      return;
    }
    setEmailError("");
    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);
    if (result.success) {
      switchView("reset");
      const statusMsg = "If the email matches, a reset OTP code was sent to your email.";
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

  // ── Resend OTP handler ─────────────────────────────────────────────
  const handleResendOtp = async (purpose) => {
    if (timerActive || resendLoading) return;
    setResendLoading(true);
    const result = await resendOtp(email, purpose);
    setResendLoading(false);
    if (result.success) {
      setOtp("");
      toast.success("A new OTP has been sent to your email!");
      startCountdown(result.nextAllowedAt || OTP_COOLDOWN);
    } else {
      // Even on error, if server gave a cooldown timestamp, respect it
      if (result.nextAllowedAt) {
        startCountdown(result.nextAllowedAt);
      }
      toast.error(result.error || "Failed to resend OTP.");
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#f7f5f0] dark:bg-[#050505] text-stone-900 dark:text-white overflow-hidden select-none transition-colors duration-500">
      {/* Left side: Premium Brand & Feature Showcase (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-[50%] relative bg-[#f4efe6] dark:bg-slate-900/40 flex-col justify-between p-12 overflow-hidden border-r border-stone-200/80 dark:border-slate-800 transition-colors duration-500">
        {/* SVG Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)] pointer-events-none transition-colors duration-500" />
        
        {/* Subtle moving glows (violet color removed) */}
        <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] rounded-full bg-sky-500/[0.04] dark:bg-sky-500/[0.06] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-500/[0.04] dark:bg-cyan-500/[0.06] blur-[100px] pointer-events-none" />

        {/* Brand Header */}
        <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="relative z-10 flex items-center gap-2.5 group cursor-pointer">
          <img src="/favicon.webp" alt="AI Data Analysis Logo" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-sm" />
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-cyan-900 to-slate-700 dark:from-white dark:via-cyan-200 dark:to-slate-300 bg-clip-text text-transparent">
            AI Data Analysis
          </span>
        </Link>

        {/* Feature List Container */}
        <div className="relative z-10 my-auto max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#0071e3] dark:text-blue-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Intelligent Data Exploration
          </div>
          
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight mb-8">
            The simplest way to <br />
            <span className="bg-gradient-to-r from-[#0071e3] via-[#0284c7] to-[#06b6d4] dark:from-[#38bdf8] dark:via-[#0ea5e9] dark:to-[#06b6d4] bg-clip-text text-transparent">
              explore & analyze
            </span> your data.
          </h2>

          <div className="space-y-6">
            {/* Feature 1: Multi-Format Data Loader */}
            <div className="flex gap-4 items-start group cursor-default select-none">
              <div 
                className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#fcfaf5] dark:bg-slate-900 border border-stone-200/80 dark:border-slate-800 flex items-center justify-center shadow-sm transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1.5 group-hover:scale-110 group-hover:shadow-md group-hover:border-stone-300 dark:group-hover:border-slate-700 cursor-default"
              >
                <Database className="w-5 h-5 text-[#0071e3] dark:text-[#38bdf8] transition-transform duration-300 group-hover:scale-105 pointer-events-none" />
              </div>
              <div className="cursor-default select-none">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 cursor-default select-none">
                  Multi-Format Data Loader
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed cursor-default select-none">
                  Seamlessly drop CSV, Excel, or JSON files. Automatic column detection, clean mappings, and ready in seconds.
                </p>
              </div>
            </div>

            {/* Feature 2: Interactive Plotly Charts */}
            <div className="flex gap-4 items-start group cursor-default select-none">
              <div 
                className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#fcfaf5] dark:bg-slate-900 border border-stone-200/80 dark:border-slate-800 flex items-center justify-center shadow-sm transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1.5 group-hover:scale-110 group-hover:shadow-md group-hover:border-stone-300 dark:group-hover:border-slate-700 cursor-default"
              >
                <TrendingUp className="w-5 h-5 text-[#0284c7] dark:text-[#38bdf8] transition-transform duration-300 group-hover:scale-105 pointer-events-none" />
              </div>
              <div className="cursor-default select-none">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 cursor-default select-none">
                  Interactive Plotly Charts
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed cursor-default select-none">
                  Interact with dynamic scatter, line, bar, or pie charts. Zoom, pan, filter, and export high-resolution assets instantly.
                </p>
              </div>
            </div>

            {/* Feature 3: Conversational Insights */}
            <div className="flex gap-4 items-start group cursor-default select-none">
              <div 
                className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#fcfaf5] dark:bg-slate-900 border border-stone-200/80 dark:border-slate-800 flex items-center justify-center shadow-sm transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1.5 group-hover:scale-110 group-hover:shadow-md group-hover:border-stone-300 dark:group-hover:border-slate-700 cursor-default"
              >
                <MessageSquare className="w-5 h-5 text-[#06b6d4] dark:text-[#22d3ee] transition-transform duration-300 group-hover:scale-105 pointer-events-none" />
              </div>
              <div className="cursor-default select-none">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 cursor-default select-none">
                  Conversational Insights
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed cursor-default select-none">
                  Ask natural questions about your dataset. Our AI system writes backend Python code, handles processing, and replies in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Left Side Footer */}
        <div className="relative z-10 flex justify-between items-center text-xs text-slate-500 dark:text-slate-600">
          <span>&copy; {new Date().getFullYear()} AI Data Analysis. All rights reserved.</span>
          <span>v2.1.0</span>
        </div>
      </div>

      {/* Right side: Auth Form container */}
      <div className="w-full lg:w-[50%] flex items-center justify-center p-6 sm:p-12 relative bg-[#f7f5f0] dark:bg-[#050505] transition-colors duration-500">
        
        {/* Top Actions: Back to Home & Theme Toggle */}
        <div className="absolute top-6 left-6 right-6 sm:top-10 sm:left-10 sm:right-10 flex items-center justify-between z-20 pointer-events-auto">
          <Link to="/" className="text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center text-sm font-semibold transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
          <ThemeToggle />
        </div>

        {/* Glow circles for mobile/tablet background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.02),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,#1e293b,transparent_70%)] opacity-20 lg:hidden pointer-events-none transition-colors duration-500" />
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-brand-500/5 blur-[120px] lg:hidden pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-cyan-500/5 blur-[120px] lg:hidden pointer-events-none" />

        <div className="w-full max-w-[400px] relative z-10">
          {/* Logo for mobile only */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden justify-center mt-8 sm:mt-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-slate-900 via-cyan-900 to-slate-700 dark:from-white dark:via-cyan-200 dark:to-slate-300 bg-clip-text text-transparent">
              AI Data Analysis
            </span>
          </div>

          {/* Form Header */}
          <div className="mb-8 text-center lg:text-left mt-8 lg:mt-0">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2 transition-colors duration-500">
              {view === "login" && "Welcome back"}
              {view === "register" && "Create an account"}
              {view === "verify" && "Verify account"}
              {view === "forgot" && "Forgot password?"}
              {view === "reset" && "Reset password"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium transition-colors duration-500">
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
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider transition-colors duration-500">
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
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors duration-500">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => switchView("forgot")}
                    className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-500 dark:hover:text-brand-300 transition-colors hover:underline hover:underline-offset-4"
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
                className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-600 hover:from-brand-600 hover:to-cyan-700 text-white font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 focus:ring-2 focus:ring-brand-500/50 outline-none flex justify-center items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Sign In"
                )}
              </button>

              {/* ── Divider ── */}
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">or continue with</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              </div>

              {/* ── Google OAuth Button ── */}
              <button
                type="button"
                id="google-signin-btn"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/60 dark:hover:shadow-slate-900/60 focus:ring-2 focus:ring-brand-500/30 outline-none flex justify-center items-center gap-2.5 disabled:opacity-50 disabled:pointer-events-none"
              >
                {googleLoading ? (
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                {googleLoading ? "Signing in…" : "Sign in with Google"}
              </button>

              <div className="text-center mt-4">
                <span className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-500">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => switchView("register")}
                  className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-500 dark:hover:text-brand-300 transition-colors hover:underline hover:underline-offset-4"
                >
                  Create account
                </button>
              </div>
            </form>
          )}

          {view === "register" && (
            <form onSubmit={handleRegister} className="space-y-5" autoComplete="off">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider transition-colors duration-500">
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
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-brand-500/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none transition-all duration-200 pr-10"
                  />
                  {username && (
                    <button
                      type="button"
                      onClick={() => setUsername("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider transition-colors duration-500">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(""); }}
                    onBlur={() => { if (email && !validateEmail(email)) setEmailError("Enter a valid Email"); else setEmailError(""); }}
                    placeholder="you@example.com"
                    autoComplete="off"
                    className={`w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border hover:border-slate-300 dark:hover:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-brand-500/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none transition-all duration-200 pr-10 ${emailError ? "border-red-400 dark:border-red-500 focus:border-red-400 focus:ring-red-400/10" : "border-slate-200 dark:border-slate-800 focus:border-brand-500"}`}
                  />
                  {email && (
                    <button
                      type="button"
                      onClick={() => { setEmail(""); setEmailError(""); }}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                {emailError && (
                  <p className="mt-1.5 text-xs font-medium text-red-500 dark:text-red-400 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 13a1 1 0 1 0 2 0v-4a1 1 0 1 0-2 0v4zm1-8a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" clipRule="evenodd" /></svg>
                    {emailError}
                  </p>
                )}
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
                    placeholder="Choose a strong password"
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
                className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-600 hover:from-brand-600 hover:to-cyan-700 text-white font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 focus:ring-2 focus:ring-brand-500/50 outline-none flex justify-center items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Create Account"
                )}
              </button>

              {/* ── Divider ── */}
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">or sign up with</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              </div>

              {/* ── Google OAuth Button ── */}
              <button
                type="button"
                id="google-signup-btn"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/60 dark:hover:shadow-slate-900/60 focus:ring-2 focus:ring-brand-500/30 outline-none flex justify-center items-center gap-2.5 disabled:opacity-50 disabled:pointer-events-none"
              >
                {googleLoading ? (
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                {googleLoading ? "Signing up…" : "Sign up with Google"}
              </button>

              <div className="text-center mt-4">
                <span className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-500">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => switchView("login")}
                  className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-500 dark:hover:text-brand-300 transition-colors hover:underline hover:underline-offset-4"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {view === "verify" && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider transition-colors duration-500">
                  Email Address
                </label>
                <input
                  type="email"
                  readOnly
                  value={email}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-900 text-sm text-slate-400 dark:text-slate-500 cursor-not-allowed outline-none transition-colors duration-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider transition-colors duration-500">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-brand-500/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none tracking-widest text-center font-bold transition-all duration-200"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-600 hover:from-brand-600 hover:to-cyan-700 text-white font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 focus:ring-2 focus:ring-brand-500/50 outline-none flex justify-center items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Verify & Activate"
                )}
              </button>

              {/* ── Resend OTP Row ── */}
              <div className="flex items-center justify-between px-1 pt-1">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {timerActive ? (
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} className="text-brand-500" />
                      Resend available in{" "}
                      <span className="font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                        {String(Math.floor(secondsLeft / 60)).padStart(1, "0")}:{String(secondsLeft % 60).padStart(2, "0")}
                      </span>
                    </span>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500">Didn't receive the code?</span>
                  )}
                </div>

                <button
                  type="button"
                  disabled={timerActive || resendLoading}
                  onClick={() => handleResendOtp("registration")}
                  className={[
                    "relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                    timerActive || resendLoading
                      ? "text-slate-400 dark:text-slate-600 cursor-not-allowed"
                      : "text-brand-600 dark:text-brand-400 hover:bg-brand-500/10 hover:text-brand-700 dark:hover:text-brand-300 cursor-pointer"
                  ].join(" ")}
                >
                  {/* Animated ring shown while timer is active */}
                  {timerActive && (
                    <span className="relative inline-flex items-center justify-center w-[42px] h-[42px]">
                      <CountdownRing secondsLeft={secondsLeft} total={OTP_COOLDOWN} />
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 tabular-nums leading-none">
                        {secondsLeft}
                      </span>
                    </span>
                  )}
                  {resendLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    !timerActive && <RefreshCw size={13} />
                  )}
                  {!timerActive && (resendLoading ? "Sending…" : "Resend OTP")}
                </button>
              </div>

              <div className="text-center mt-2 flex justify-between items-center px-1 text-xs">
                <button
                  type="button"
                  onClick={() => switchView("register")}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  &larr; Back to Sign Up
                </button>
                <button
                  type="button"
                  onClick={() => switchView("login")}
                  className="font-bold text-brand-600 dark:text-brand-400 hover:text-brand-500 dark:hover:text-brand-300 transition-colors"
                >
                  Sign In Instead
                </button>
              </div>
            </form>
          )}

          {view === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider transition-colors duration-500">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(""); }}
                    onBlur={() => { if (email && !validateEmail(email)) setEmailError("Enter a valid Email"); else setEmailError(""); }}
                    placeholder="registered-email@example.com"
                    autoComplete="off"
                    className={`w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border hover:border-slate-300 dark:hover:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-brand-500/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none transition-all duration-200 pr-10 ${emailError ? "border-red-400 dark:border-red-500 focus:border-red-400 focus:ring-red-400/10" : "border-slate-200 dark:border-slate-800 focus:border-brand-500"}`}
                  />
                  {email && (
                    <button
                      type="button"
                      onClick={() => { setEmail(""); setEmailError(""); }}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                {emailError && (
                  <p className="mt-1.5 text-xs font-medium text-red-500 dark:text-red-400 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 13a1 1 0 1 0 2 0v-4a1 1 0 1 0-2 0v4zm1-8a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" clipRule="evenodd" /></svg>
                    {emailError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-600 hover:from-brand-600 hover:to-cyan-700 text-white font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 focus:ring-2 focus:ring-brand-500/50 outline-none flex justify-center items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
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
                  className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-500 dark:hover:text-brand-300 transition-colors hover:underline hover:underline-offset-4"
                >
                  &larr; Back to Login
                </button>
              </div>
            </form>
          )}

          {view === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-5" autoComplete="off">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider transition-colors duration-500">
                  Email Address
                </label>
                <input
                  type="email"
                  readOnly
                  value={email}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-900 text-sm text-slate-400 dark:text-slate-500 cursor-not-allowed outline-none transition-colors duration-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider transition-colors duration-500">
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

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider transition-colors duration-500">
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
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-brand-500/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none tracking-widest text-center font-bold transition-all duration-200"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-600 hover:from-brand-600 hover:to-cyan-700 text-white font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 focus:ring-2 focus:ring-brand-500/50 outline-none flex justify-center items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Reset Password"
                )}
              </button>

              {/* ── Resend OTP Row for reset view ── */}
              <div className="flex items-center justify-between px-1 pt-1">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {timerActive ? (
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} className="text-brand-500" />
                      Resend available in{" "}
                      <span className="font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                        {String(Math.floor(secondsLeft / 60)).padStart(1, "0")}:{String(secondsLeft % 60).padStart(2, "0")}
                      </span>
                    </span>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500">Didn't receive the code?</span>
                  )}
                </div>

                <button
                  type="button"
                  disabled={timerActive || resendLoading}
                  onClick={() => handleResendOtp("reset")}
                  className={[
                    "relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                    timerActive || resendLoading
                      ? "text-slate-400 dark:text-slate-600 cursor-not-allowed"
                      : "text-brand-600 dark:text-brand-400 hover:bg-brand-500/10 hover:text-brand-700 dark:hover:text-brand-300 cursor-pointer"
                  ].join(" ")}
                >
                  {timerActive && (
                    <span className="relative inline-flex items-center justify-center w-[42px] h-[42px]">
                      <CountdownRing secondsLeft={secondsLeft} total={OTP_COOLDOWN} />
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 tabular-nums leading-none">
                        {secondsLeft}
                      </span>
                    </span>
                  )}
                  {resendLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    !timerActive && <RefreshCw size={13} />
                  )}
                  {!timerActive && (resendLoading ? "Sending…" : "Resend OTP")}
                </button>
              </div>

              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={() => switchView("login")}
                  className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-500 dark:hover:text-brand-300 transition-colors hover:underline hover:underline-offset-4"
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
