import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext.jsx";
import { useDataset } from "../../context/DatasetContext.jsx";
import { toast } from "react-toastify";
import { 
  User, 
  LayoutDashboard, 
  LogOut, 
  ChevronDown, 
  ShieldCheck, 
  Sparkles 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UserNavProfile() {
  const { user, profilePic, logout } = useUser();
  const { clearDataset } = useDataset();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  if (!user) return null;

  const initials = user.username ? user.username.substring(0, 2).toUpperCase() : "US";

  const handleLogout = () => {
    clearDataset();
    logout();
    setIsOpen(false);
    toast.success("Successfully logged out!");
    navigate("/");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] border border-black/[0.06] dark:border-white/[0.08] transition-all duration-200 outline-none select-none cursor-pointer group"
        aria-label="User profile menu"
      >
        {/* Avatar */}
        {profilePic ? (
          <img
            src={profilePic}
            alt="Profile Avatar"
            className="w-7 h-7 rounded-full object-cover border border-[#0071e3]/40 shadow-sm"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0071e3] to-[#af52de] flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
            {initials}
          </div>
        )}

        {/* Username Label */}
        <span className="hidden sm:inline-block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] max-w-[100px] truncate">
          {user.username}
        </span>

        <ChevronDown 
          className={`w-3.5 h-3.5 text-[#6e6e73] dark:text-[#a1a1a6] transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#0071e3] dark:text-blue-400" : ""
          }`} 
        />
      </button>

      {/* Modal / Dropdown Window with Outside Click Protection */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-3 w-64 rounded-2xl bg-white/95 dark:bg-[#1d1d1f]/95 border border-black/[0.08] dark:border-white/[0.12] shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl p-2 z-[999] text-[#1d1d1f] dark:text-[#f5f5f7]"
          >
            {/* User Info Header */}
            <div className="px-3.5 py-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] mb-1.5 border border-black/[0.04] dark:border-white/[0.06]">
              <div className="flex items-center gap-3">
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt="Profile Avatar"
                    className="w-9 h-9 rounded-full object-cover border border-[#0071e3]/40 shadow-sm"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0071e3] to-[#af52de] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                    {user.username}
                  </p>
                  <p className="text-[11px] text-[#6e6e73] dark:text-[#a1a1a6] truncate font-normal">
                    {user.email || "Active User"}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation links */}
            <div className="space-y-1">
              <Link
                to="/app"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-[#0071e3]/10 dark:hover:bg-blue-500/15 hover:text-[#0071e3] dark:hover:text-blue-400 transition-colors cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Launch Analytics Studio</span>
              </Link>

              <Link
                to="/app"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Account Profile</span>
              </Link>
            </div>

            <div className="my-1.5 h-px bg-black/[0.06] dark:bg-white/[0.08]" />

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
