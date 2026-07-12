import React, { useState } from "react";
import { useUser } from "../../context/UserContext.jsx";
import { Eye, EyeOff } from "lucide-react";

export default function UserProfile() {
  const { user, changePassword } = useUser();
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const initials = user?.username ? user.username.substring(0, 2).toUpperCase() : "US";
  const memberDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recently";

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill out all fields.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation password do not match.");
      return;
    }

    setLoading(true);
    const result = await changePassword(currentPassword, newPassword);
    setLoading(false);

    if (result.success) {
      setSuccess("Your password has been changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in select-none">
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Account Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your account profile and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Detail Card */}
        <div className="md:col-span-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
          
          {/* Avatar Icon */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-md mb-4 border border-brand-400/20">
            {initials}
          </div>
          
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{user?.username}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-6 break-all">{user?.email}</p>
          
          <div className="w-full pt-4 border-t border-gray-100 dark:border-gray-800 text-left space-y-3.5">
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Verification</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 mt-1">
                ✔ Active Verified
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Member Since</span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-1 block">
                {memberDate}
              </span>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="md:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Update Password</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
            Ensure your account uses a secure password to prevent unauthorized access.
          </p>

          {/* Feedback banners */}
          {error && (
            <div className="mb-4 p-3 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg">
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-lg">
              ✨ {success}
            </div>
          )}

          <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm text-gray-900 dark:text-white outline-none transition-all duration-200 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 6 chars)"
                  className="w-full px-3.5 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm text-gray-900 dark:text-white outline-none transition-all duration-200 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Verify new password"
                  className="w-full px-3.5 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm text-gray-900 dark:text-white outline-none transition-all duration-200 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
