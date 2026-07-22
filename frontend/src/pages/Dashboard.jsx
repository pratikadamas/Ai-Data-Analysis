import React, { useState } from "react";
import Header from "../components/layout/Header.jsx";
import Sidebar from "../components/layout/Sidebar.jsx";
import UploadArea from "../components/upload/UploadArea.jsx";
import PreviewTable from "../components/preview/PreviewTable.jsx";
import ExplorePanel from "../components/explore/ExplorePanel.jsx";
import ChatPanel from "../components/chat/ChatPanel.jsx";
import SqlEditorPanel from "../components/sql-editor/SqlEditorPanel.jsx";
import UserProfile from "../components/profile/UserProfile.jsx";
import { useDataset } from "../context/DatasetContext.jsx";
import { RefreshCw, Table, LineChart, MessageSquare, User, Code2 } from "lucide-react";

const NAV_ITEMS = [
  { key: "preview",    label: "Preview",  icon: Table },
  { key: "explore",   label: "Explore",  icon: LineChart },
  { key: "chat",      label: "Ask AI",   icon: MessageSquare },
  { key: "sql-editor",label: "SQL",      icon: Code2 },
  { key: "profile",   label: "Profile",  icon: User },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("preview");
  const { dataset, clearDataset, sessionVerified } = useDataset();

  return (
    <div className="h-screen flex flex-col relative">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — hidden on mobile via .sidebar-nav CSS class */}
        <Sidebar active={activeTab} onSelect={setActiveTab} />

        {/* Main content */}
        <main className="dashboard-main flex-1 overflow-y-auto p-6 space-y-6">
          {!sessionVerified ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3 text-gray-400 dark:text-gray-500">
                <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">Restoring session…</span>
              </div>
            </div>
          ) : activeTab === "profile" ? (
            <UserProfile />
          ) : (
            <>
              {!dataset && activeTab === "preview" && <UploadArea />}

              {activeTab === "preview" && dataset && <PreviewTable />}
              {activeTab === "explore" && <ExplorePanel />}
              {activeTab === "chat" && <ChatPanel />}
              {activeTab === "sql-editor" && <SqlEditorPanel />}

              {!dataset && (activeTab === "explore" || activeTab === "chat" || activeTab === "sql-editor") && (
                <UploadArea />
              )}

              {dataset && (
                <div className="pt-2 flex justify-center">
                  <button
                    onClick={clearDataset}
                    className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <RefreshCw size={14} className="hover:animate-spin" />
                    Upload a different dataset
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ── Mobile bottom tab bar (hidden on desktop via CSS media query) ── */}
      <nav className="bottom-tab-bar hidden">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-lg transition-all ${
                isActive
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-semibold tracking-wide">{label}</span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-500" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
