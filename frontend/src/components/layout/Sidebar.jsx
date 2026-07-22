import React from "react";
import { Table, LineChart, MessageSquare, User, Code2 } from "lucide-react";

const NAV_ITEMS = [
  { key: "preview", label: "Data Preview", icon: Table },
  { key: "explore", label: "Explore", icon: LineChart },
  { key: "chat", label: "Ask AI", icon: MessageSquare },
  { key: "sql-editor", label: "SQL Editor", icon: Code2 },
  { key: "profile", label: "User Profile", icon: User },
];

export default function Sidebar({ active, onSelect }) {
  return (
    <aside className="w-56 shrink-0 border-r border-white/20 dark:border-gray-800/50 glass-panel p-3">
      <nav className="sidebar-nav flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-brand-500 to-indigo-600 text-white shadow-md scale-[1.02]"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Icon size={18} className={isActive ? "text-white" : "opacity-70"} />
              <span className="sidebar-label font-medium tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
