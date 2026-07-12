import React, { useState } from "react";
import { useDarkMode } from "../../hooks/useDarkMode.js";
import { useDataset } from "../../context/DatasetContext.jsx";
import { useUser } from "../../context/UserContext.jsx";
import { toast } from "react-toastify";

export default function Header() {
  const [isDark, setIsDark] = useDarkMode();
  const { dataset, clearDataset } = useDataset();
  const { user, logout } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const initials = user?.username ? user.username.substring(0, 2).toUpperCase() : "US";

  const handleLogoutClick = () => {
    clearDataset();
    logout();
    toast.success("Successfully logged out!");
  };

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 select-none relative z-50">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold bg-gradient-to-r from-brand-500 to-indigo-600 bg-clip-text text-transparent">
          AI Data Analyst
        </span>
        {dataset && (
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-3 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
            {dataset.filename} · {dataset.schema?.row_count?.toLocaleString()} rows
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Dark Mode Switcher */}
        <button
          onClick={() => setIsDark((d) => !d)}
          className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Toggle light/dark mode"
        >
          {isDark ? "☀️" : "🌙"}
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 outline-none focus:ring-2 focus:ring-brand-500/20 rounded-full"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm border border-brand-400/20 cursor-pointer">
              {initials}
            </div>
          </button>

          {dropdownOpen && (
            <>
              {/* Overlay blocker to close dropdown when clicked outside */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg py-1.5 z-20 animate-fade-in">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{user?.username}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogoutClick}
                  className="w-full text-left px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-semibold"
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
