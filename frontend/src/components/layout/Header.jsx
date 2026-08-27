import React from "react";
import { Link } from "react-router-dom";
import { useDarkMode } from "../../hooks/useDarkMode.js";
import { useDataset } from "../../context/DatasetContext.jsx";
import UserNavProfile from "./UserNavProfile.jsx";
import { Sun, Moon } from "lucide-react";

export default function Header() {
  const [isDark, setIsDark] = useDarkMode();
  const { dataset } = useDataset();

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-[#161617]/80 backdrop-blur-2xl select-none relative z-50 transition-colors duration-200">
      <div className="flex items-center gap-4">
        {/* macOS Traffic Dots */}
        <div className="hidden sm:flex items-center gap-2 mr-1">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
        </div>

        <Link 
          to="/" 
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <img 
            src="/favicon.webp" 
            alt="AI Data Analysis Logo" 
            className="w-7 h-7 object-contain group-hover:scale-105 transition-transform duration-300"
          />
          <span className="header-title text-base font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-[#0071e3] transition-colors">
            AI Data Analysis
          </span>
        </Link>
        {dataset && (
          <span
            className="header-dataset-pill text-xs font-medium text-[#6e6e73] dark:text-[#a1a1a6] ml-2 bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.06] px-2.5 py-0.5 rounded-full backdrop-blur-sm"
            title={dataset.files?.map(f => f.filename).join(", ") || dataset.filename}
          >
            {dataset.files?.length > 1
              ? `${dataset.files.length} files · ${dataset.files.reduce((sum, f) => sum + (f.schema?.row_count || 0), 0).toLocaleString()} rows`
              : `${dataset.filename} · ${dataset.schema?.row_count?.toLocaleString()} rows`
            }
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Dark Mode Switcher */}
        <button
          onClick={() => setIsDark((d) => !d)}
          className="text-[#515154] dark:text-[#a1a1a6] p-2 rounded-full border border-black/[0.06] dark:border-white/[0.08] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-[#0071e3] transition-all"
          title="Toggle light/dark mode"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* User Nav Profile with outside click handling */}
        <UserNavProfile />
      </div>
    </header>
  );
}
