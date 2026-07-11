import React from "react";

const NAV_ITEMS = [
  { key: "preview", label: "Data Preview", icon: "📋" },
  { key: "explore", label: "Explore", icon: "📊" },
  { key: "chat", label: "Ask AI", icon: "💬" },
];

export default function Sidebar({ active, onSelect }) {
  return (
    <aside className="w-56 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3">
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left transition-colors ${
              active === item.key
                ? "bg-brand-500 text-white"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
