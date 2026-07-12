import React, { useState } from "react";
import { useUser } from "../context/UserContext.jsx";
import { Eye, EyeOff, X } from "lucide-react";
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
    await login(email, password);
    setLoading(false);
    // Note: UserContext updates the user state and shows toasts or handles redirect
    // But since login might fail and return a result, let's verify if we need to switch view:
    const result = await login(email, password);
    if (!result.success && result.isUnverified) {
      setEmail(result.email || email);
      switchView("verify");
      const statusMsg = "Please verify your account using the OTP code sent to your email.";
      toast.warning(statusMsg);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-brand-950 p-6 relative overflow-hidden select-none">
      {/* Decorative ambient light circles */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      {/* Auth Card */}
      <div className="w-full max-w-md bg-white/5 dark:bg-gray-900/40 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-2xl rounded-2xl p-8 transition-all duration-300 relative z-10">
        
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-400 via-indigo-400 to-brand-300 bg-clip-text text-transparent">
            AI Data Analyst
          </h1>
          <p className="text-xs text-gray-400 mt-2 font-medium">
            {view === "login" && "Sign in to manage and analyze your datasets"}
            {view === "register" && "Create an account to start analyzing data"}
            {view === "verify" && "Confirm your identity via OTP validation"}
            {view === "forgot" && "Reset your forgotten account password"}
            {view === "reset" && "Create a new strong password"}
          </p>
        </div>

        {/* Dynamic Views */}
        {view === "login" && (
          <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  autoComplete="off"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 pr-10"
                />
                {email && (
                  <button
                    type="button"
                    onClick={() => setEmail("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">Password</label>
                <button
                  type="button"
                  onClick={() => switchView("forgot")}
                  className="text-xs text-brand-400 hover:text-brand-300 transition-colors hover:underline"
                >
                  Forgot Password?
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
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 pr-16"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {password && (
                    <button
                      type="button"
                      onClick={() => setPassword("")}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-lg bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-semibold text-sm transition-all duration-200 focus:ring-2 focus:ring-brand-500/50 outline-none flex justify-center items-center gap-2 shadow-lg disabled:opacity-50"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Sign In"}
            </button>
            <div className="text-center mt-4">
              <span className="text-xs text-gray-400">Don't have an account? </span>
              <button
                type="button"
                onClick={() => switchView("register")}
                className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors hover:underline"
              >
                Sign Up
              </button>
            </div>
          </form>
        )}

        {view === "register" && (
          <form onSubmit={handleRegister} className="space-y-4" autoComplete="off">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">Username</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Pick a username"
                  autoComplete="off"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 pr-10"
                />
                {username && (
                  <button
                    type="button"
                    onClick={() => setUsername("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="off"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 pr-10"
                />
                {email && (
                  <button
                    type="button"
                    onClick={() => setEmail("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a strong password"
                  autoComplete="new-password"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 pr-16"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {password && (
                    <button
                      type="button"
                      onClick={() => setPassword("")}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-lg bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-semibold text-sm transition-all duration-200 focus:ring-2 focus:ring-brand-500/50 outline-none flex justify-center items-center gap-2 shadow-lg disabled:opacity-50"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Register Account"}
            </button>
            <div className="text-center mt-4">
              <span className="text-xs text-gray-400">Already registered? </span>
              <button
                type="button"
                onClick={() => switchView("login")}
                className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors hover:underline"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {view === "verify" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                readOnly
                value={email}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-400 cursor-not-allowed outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">6-Digit OTP Code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-brand-500 text-sm text-white placeholder-gray-500 outline-none tracking-widest text-center font-bold transition-all duration-200"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-lg bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-semibold text-sm transition-all duration-200 focus:ring-2 focus:ring-brand-500/50 outline-none flex justify-center items-center gap-2 shadow-lg disabled:opacity-50"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Verify Code"}
            </button>
            <div className="text-center mt-4 flex justify-between items-center px-1">
              <button
                type="button"
                onClick={() => switchView("register")}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                ← Back to SignUp
              </button>
              <button
                type="button"
                onClick={() => switchView("login")}
                className="text-xs font-semibold text-brand-400 hover:underline"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {view === "forgot" && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <p className="text-xs text-gray-400 leading-relaxed mb-1">
              Enter your email address below, and we will send you a 6-digit OTP code to verify your request and reset your password.
            </p>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="registered-email@example.com"
                  autoComplete="off"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 pr-10"
                />
                {email && (
                  <button
                    type="button"
                    onClick={() => setEmail("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-lg bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-semibold text-sm transition-all duration-200 focus:ring-2 focus:ring-brand-500/50 outline-none flex justify-center items-center gap-2 shadow-lg disabled:opacity-50"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Send Reset Code"}
            </button>
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => switchView("login")}
                className="text-xs text-brand-400 hover:text-brand-300 hover:underline font-semibold transition-colors"
              >
                ← Back to Login
              </button>
            </div>
          </form>
        )}

        {view === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-4" autoComplete="off">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                readOnly
                value={email}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-400 cursor-not-allowed outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 pr-16"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {password && (
                    <button
                      type="button"
                      onClick={() => setPassword("")}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">Reset OTP Code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="6-Digit Reset OTP"
                autoComplete="off"
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-white placeholder-gray-500 outline-none tracking-widest text-center font-bold transition-all duration-200"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-lg bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-semibold text-sm transition-all duration-200 focus:ring-2 focus:ring-brand-500/50 outline-none flex justify-center items-center gap-2 shadow-lg disabled:opacity-50"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Reset Password"}
            </button>
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => switchView("login")}
                className="text-xs text-brand-400 hover:text-brand-300 hover:underline font-semibold transition-colors"
              >
                Cancel and Login
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
