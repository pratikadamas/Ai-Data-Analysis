import React, { useState } from "react";
import { useUser } from "../../context/UserContext.jsx";
import { Eye, EyeOff, CheckCircle, Camera, Upload, Trash2, ShieldCheck, KeyRound, Sparkles } from "lucide-react";
import { toast } from "react-toastify";

export default function UserProfile() {
  const { user, profilePic, updateProfilePic, removeProfilePic, changePassword } = useUser();
  
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (JPEG, PNG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateProfilePic(reader.result);
      toast.success("Profile picture updated!");
    };
    reader.onerror = () => {
      toast.error("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

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
      
      {/* Page Title with Apple badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0071e3]/10 dark:bg-blue-500/15 text-[#0071e3] dark:text-blue-400 font-bold text-xs mb-2 border border-[#0071e3]/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ACCOUNT SETTINGS</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">User Profile & Security</h1>
          <p className="text-sm text-[#6e6e73] dark:text-[#a1a1a6] mt-1 font-normal">
            Manage your account identity, security keys, and workspace preferences.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Detail Card - macOS Window Card */}
        <div className="md:col-span-1 rounded-2xl bg-white/80 dark:bg-[#1d1d1f]/80 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.1] shadow-sm p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          {/* Top macOS Traffic Dots */}
          <div className="w-full flex items-center justify-start gap-1.5 mb-6 opacity-70">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
          </div>

          {/* Profile Picture Avatar */}
          <div className="relative group mb-4">
            {profilePic ? (
              <img
                src={profilePic}
                alt="Profile Avatar"
                className="w-24 h-24 rounded-full object-cover shadow-[0_8px_20px_rgba(0,0,0,0.12)] border-2 border-[#0071e3]/50"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#0071e3] to-[#af52de] flex items-center justify-center text-white text-3xl font-extrabold shadow-[0_8px_20px_rgba(0,113,227,0.3)]">
                {initials}
              </div>
            )}
            <label
              htmlFor="profile-pic-input"
              className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity backdrop-blur-sm"
              title="Upload Profile Picture"
            >
              <Camera size={22} />
            </label>
            <input
              id="profile-pic-input"
              type="file"
              accept="image/png, image/jpeg, image/webp, image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Photo Actions */}
          <div className="flex items-center gap-2 mb-4">
            <label
              htmlFor="profile-pic-input"
              className="text-xs font-semibold text-[#0071e3] dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1.5"
            >
              <Upload size={13} /> {profilePic ? "Change Photo" : "Upload Photo"}
            </label>
            {profilePic && (
              <>
                <span className="text-gray-300 dark:text-gray-700">·</span>
                <button
                  type="button"
                  onClick={() => {
                    removeProfilePic();
                    toast.info("Profile picture removed.");
                  }}
                  className="text-xs font-semibold text-red-500 hover:underline flex items-center gap-1"
                >
                  <Trash2 size={12} /> Remove
                </button>
              </>
            )}
          </div>
          
          <h2 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">{user?.username}</h2>
          <p className="text-xs text-[#6e6e73] dark:text-[#a1a1a6] mt-0.5 mb-6 break-all font-normal">{user?.email || "Active Member"}</p>
          
          <div className="w-full pt-4 border-t border-black/[0.06] dark:border-white/[0.08] text-left space-y-3.5">
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-[#6e6e73] dark:text-[#a1a1a6] font-semibold">Account Status</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mt-1 border border-emerald-200/50 dark:border-emerald-800/40">
                <CheckCircle size={12} strokeWidth={2.5} /> Active Verified
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-[#6e6e73] dark:text-[#a1a1a6] font-semibold">Member Since</span>
              <span className="text-xs font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mt-1 block">
                {memberDate}
              </span>
            </div>
          </div>
        </div>

        {/* Change Password Card - macOS Window Card */}
        <div className="md:col-span-2 rounded-2xl bg-white/80 dark:bg-[#1d1d1f]/80 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.1] shadow-sm p-6 relative overflow-hidden">
          {/* Top macOS Traffic Dots */}
          <div className="w-full flex items-center justify-between gap-1.5 mb-5 opacity-70">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">
              <KeyRound size={12} />
              <span>Password Security</span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">Update Security Credentials</h3>
          <p className="text-xs text-[#6e6e73] dark:text-[#a1a1a6] mb-5 font-normal">
            Ensure your account is protected with a strong, distinct password.
          </p>

          <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5 uppercase tracking-wider">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 text-sm text-[#1d1d1f] dark:text-[#f5f5f7] outline-none transition-all duration-200 pr-10 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#0071e3] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5 uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 6 chars)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 text-sm text-[#1d1d1f] dark:text-[#f5f5f7] outline-none transition-all duration-200 pr-10 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#0071e3] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5 uppercase tracking-wider">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Verify new password"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 text-sm text-[#1d1d1f] dark:text-[#f5f5f7] outline-none transition-all duration-200 pr-10 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#0071e3] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-all duration-200 flex items-center gap-2 shadow-[0_2px_8px_rgba(0,113,227,0.35)] active:scale-95 cursor-pointer"
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
