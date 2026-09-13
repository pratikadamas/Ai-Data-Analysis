import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../context/UserContext.jsx";
import { useDataset } from "../../context/DatasetContext.jsx";
import { toast } from "react-toastify";
import { 
  User, 
  LogOut, 
  ChevronDown 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UserNavProfile() {
  const { user, profilePic, logout } = useUser();
  const { clearDataset } = useDataset();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isInApp = location.pathname.startsWith("/app");
  const isProfileActive = isInApp && location.search.includes("tab=profile");

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
        className="flex items-center gap-1.5 sm:gap-2.5 p-1 sm:px-2.5 sm:py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] border border-black/[0.06] dark:border-white/[0.08] transition-all duration-200 outline-none select-none cursor-pointer group active:scale-95"
        aria-label="User profile menu"
      >
        {/* Avatar */}
        {profilePic ? (
          <img
            src={profilePic}
            alt="Profile Avatar"
            className="w-7 h-7 rounded-full object-cover border border-[#0071e3]/40 shadow-sm shrink-0"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0071e3] to-[#06b6d4] flex items-center justify-center text-white text-[11px] font-bold shadow-sm shrink-0">
            {initials}
          </div>
        )}

        {/* Username Label */}
        <span className="hidden sm:inline-block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] max-w-[90px] md:max-w-[120px] truncate">
          {user.username}
        </span>

        <ChevronDown 
          className={`w-3.5 h-3.5 text-[#6e6e73] dark:text-[#a1a1a6] transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-[#0071e3] dark:text-blue-400" : ""
          }`} 
        />
      </button>

      {/* Modal / Dropdown Window with Outside Click Protection */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-2.5 w-64 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-[#fcfaf5]/95 dark:bg-[#1d1d1f]/95 border border-stone-200/80 dark:border-white/[0.12] shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl p-2 z-[999] text-[#262422] dark:text-[#f5f5f7]"
          >
            {/* User Info Header */}
            <div className="px-3.5 py-3 rounded-xl bg-[#f8f5ee] dark:bg-white/[0.04] mb-1.5 border border-stone-200/60 dark:border-white/[0.06]">
              <div className="flex items-center gap-3">
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt="Profile Avatar"
                    className="w-9 h-9 rounded-full object-cover border border-[#0071e3]/40 shadow-sm shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0071e3] to-[#06b6d4] flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
                    {initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-sm font-bold tracking-tight text-[#262422] dark:text-[#f5f5f7] truncate">
                      {user.username}
                    </p>
                    <span className="shrink-0 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                      Online
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6e6e73] dark:text-[#a1a1a6] truncate font-normal">
                    {user.email || "Active User"}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation links */}
            <div className="space-y-1">
              {/* Account Profile link */}
              <Link
                to="/app?tab=profile"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 sm:py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer active:scale-[0.98] ${
                  isProfileActive
                    ? "bg-[#0071e3]/10 dark:bg-blue-500/15 text-[#0071e3] dark:text-blue-400"
                    : "text-[#262422] dark:text-[#f5f5f7] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                }`}
              >
                <User className="w-4 h-4 shrink-0" />
                <span>Account Profile</span>
              </Link>
            </div>

            <div className="my-1.5 h-px bg-stone-200/60 dark:bg-white/[0.08]" />

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 sm:py-2 text-xs font-semibold rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer active:scale-[0.98]"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sign Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
