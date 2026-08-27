import React from "react";
import { Table, LineChart, MessageSquare, User, Code2, PanelLeftClose, PanelLeftOpen } from "lucide-react";

const NAV_ITEMS = [
  { key: "preview", label: "Data Preview", icon: Table },
  { key: "explore", label: "Explore", icon: LineChart },
  { key: "chat", label: "Ask AI", icon: MessageSquare },
  { key: "sql-editor", label: "SQL Editor", icon: Code2 },
  { key: "profile", label: "User Profile", icon: User },
];

export default function Sidebar({ active, onSelect, isOpen = true, onToggle }) {
  return (
    <aside 
      className={`sidebar-wrapper shrink-0 border-r border-black/[0.06] dark:border-white/[0.08] bg-white/75 dark:bg-[#161617]/75 backdrop-blur-2xl select-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-between relative z-40 ${
        isOpen ? "w-56 p-3" : "w-16 p-2"
      }`}
    >
      <div className="flex flex-col gap-2">
        {/* Sidebar Header with macOS Toggle Icon Button */}
        <div className={`flex items-center pb-2 border-b border-black/[0.04] dark:border-white/[0.06] ${
          isOpen ? "justify-between px-1" : "justify-center"
        }`}>
          {isOpen && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6e6e73] dark:text-[#a1a1a6]">
              Workspace
            </span>
          )}
          <button
            onClick={onToggle}
            className="p-1.5 rounded-xl text-[#515154] dark:text-[#a1a1a6] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] hover:text-[#0071e3] transition-all duration-200 cursor-pointer shadow-sm"
            title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            aria-label="Toggle Sidebar"
          >
            {isOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav flex flex-col gap-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <div key={item.key} className="relative group">
                <button
                  onClick={() => onSelect(item.key)}
                  className={`w-full flex items-center rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isOpen 
                      ? "gap-3 px-3 py-2 text-left" 
                      : "justify-center p-2.5"
                  } ${
                    isActive
                      ? "bg-[#0071e3] text-white shadow-[0_2px_8px_rgba(0,113,227,0.35)]"
                      : "text-[#515154] dark:text-[#a1a1a6] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]"
                  }`}
                >
                  <Icon size={18} className={isActive ? "text-white shrink-0" : "opacity-80 shrink-0 group-hover:scale-110 transition-transform"} />
                  {isOpen && (
                    <span className="sidebar-label tracking-tight truncate">{item.label}</span>
                  )}
                </button>

                {/* Floating macOS Tooltip (Shown on hover when collapsed) */}
                {!isOpen && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 rounded-lg bg-black/90 dark:bg-white/95 text-white dark:text-black text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-xl backdrop-blur-md z-50">
                    {item.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-black/90 dark:border-r-white/95" />
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom status badge / indicator */}
      {isOpen ? (
        <div className="px-2 py-1.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05] text-[11px] text-[#6e6e73] dark:text-[#a1a1a6] flex items-center justify-between">
          <span className="font-medium">Studio Engine</span>
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        </div>
      ) : (
        <div className="flex justify-center pb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Engine Active" />
        </div>
      )}
    </aside>
  );
}
