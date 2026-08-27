import React from "react";
import { Table, LineChart, MessageSquare, User, Code2 } from "lucide-react";

const NAV_ITEMS = [
  { key: "preview", label: "Data Preview", icon: Table },
  { key: "explore", label: "Explore", icon: LineChart },
  { key: "chat", label: "Ask AI", icon: MessageSquare },
  { key: "sql-editor", label: "SQL Editor", icon: Code2 },
  { key: "profile", label: "User Profile", icon: User },
];

export default function Sidebar({ active, onSelect, isOpen = true }) {
  return (
    <aside 
      className={`sidebar-wrapper shrink-0 border-r border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-[#161617]/70 backdrop-blur-2xl select-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
        isOpen ? "w-56 p-3 opacity-100" : "w-0 p-0 border-r-0 opacity-0 pointer-events-none"
      }`}
    >
      <nav className="sidebar-nav flex flex-col gap-1 w-50">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-left transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[#0071e3] text-white shadow-[0_2px_8px_rgba(0,113,227,0.35)]"
                  : "text-[#515154] dark:text-[#a1a1a6] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]"
              }`}
            >
              <Icon size={17} className={isActive ? "text-white" : "opacity-75"} />
              <span className="sidebar-label tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
