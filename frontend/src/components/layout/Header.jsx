import React, { useState } from "react";
import { useDarkMode } from "../../hooks/useDarkMode.js";
import { useDataset } from "../../context/DatasetContext.jsx";
import { useUser } from "../../context/UserContext.jsx";
import { toast } from "react-toastify";
import { Sun, Moon } from "lucide-react";

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
    <header className="h-14 flex items-center justify-between px-6 border-b border-white/20 dark:border-gray-800/50 glass-panel select-none relative z-50">
      <div className="flex items-center gap-2">
        <span className="header-title text-lg font-semibold bg-gradient-to-r from-brand-500 to-indigo-600 bg-clip-text text-transparent">
          AI Data Analyst
        </span>
        {dataset && (
          <span
            className="header-dataset-pill text-xs text-gray-500 dark:text-gray-400 ml-3 bg-gray-100/50 dark:bg-gray-800/50 px-2 py-0.5 rounded backdrop-blur-sm"
            title={dataset.files?.map(f => f.filename).join(", ") || dataset.filename}
          >
            {dataset.files?.length > 1
              ? `${dataset.files.length} files · ${dataset.files.reduce((sum, f) => sum + (f.schema?.row_count || 0), 0).toLocaleString()} total rows`
              : `${dataset.filename} · ${dataset.schema?.row_count?.toLocaleString()} rows`
            }
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Dark Mode Switcher */}
        <button
          onClick={() => setIsDark((d) => !d)}
          className="text-gray-600 dark:text-gray-300 px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Toggle light/dark mode"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 outline-none focus:ring-2 focus:ring-brand-500/20 rounded-full transition-transform hover:scale-105"
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
              <div className="absolute right-0 mt-2 w-48 glass-panel rounded-lg shadow-lg py-1.5 z-20 animate-fade-in">
                <div className="px-4 py-2 border-b border-gray-100/20 dark:border-gray-800/50">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{user?.username}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogoutClick}
                  className="w-full text-left px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors font-semibold"
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
