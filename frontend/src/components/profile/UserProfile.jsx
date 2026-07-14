import React, { useState } from "react";
import { useUser } from "../../context/UserContext.jsx";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";

export default function UserProfile() {
  const { user, changePassword } = useUser();
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);

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

    if (!currentPassword || !newPassword || !confirmPassword) {
      const msg = "Please fill out all fields.";
      toast.warning(msg);
      return;
    }

    if (newPassword.length < 6) {
      const msg = "New password must be at least 6 characters long.";
      toast.warning(msg);
      return;
    }

    if (newPassword !== confirmPassword) {
      const msg = "New password and confirmation password do not match.";
      toast.warning(msg);
      return;
    }

    setLoading(true);
    const result = await changePassword(currentPassword, newPassword);
    setLoading(false);

    if (result.success) {
      const msg = "Your password has been changed successfully!";
      toast.success(msg);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error(result.error);
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
        <div className="md:col-span-1 glass-panel rounded-xl p-6 flex flex-col items-center justify-center text-center">
          
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
                <CheckCircle size={12} strokeWidth={2.5} /> Active Verified
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
        <div className="md:col-span-2 glass-panel rounded-xl p-6">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Update Password</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
            Ensure your account uses a secure password to prevent unauthorized access.
          </p>

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
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm text-gray-900 dark:text-white outline-none transition-all duration-200 pr-10 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-500 transition-colors"
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
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm text-gray-900 dark:text-white outline-none transition-all duration-200 pr-10 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-500 transition-colors"
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
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm text-gray-900 dark:text-white outline-none transition-all duration-200 pr-10 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95"
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
