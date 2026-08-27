import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../components/layout/Header.jsx";
import Sidebar from "../components/layout/Sidebar.jsx";
import UploadArea from "../components/upload/UploadArea.jsx";
import PreviewTable from "../components/preview/PreviewTable.jsx";
import ExplorePanel from "../components/explore/ExplorePanel.jsx";
import ChatPanel from "../components/chat/ChatPanel.jsx";
import SqlEditorPanel from "../components/sql-editor/SqlEditorPanel.jsx";
import EmptyWorkspaceStudio from "../components/dashboard/EmptyWorkspaceStudio.jsx";
import SectionCircleLoader from "../components/shared/SectionCircleLoader.jsx";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(() => tabParam || "preview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { dataset, clearDataset, sessionVerified } = useDataset();

  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setSearchParams(key === "preview" ? {} : { tab: key });
  };

  return (
    <div className="h-screen flex flex-col relative bg-[#f5f5f7] dark:bg-[#000000] text-[#1d1d1f] dark:text-[#f5f5f7] antialiased selection:bg-[#0071e3] selection:text-white">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with show/hide icon rail and hover tooltip */}
        <Sidebar 
          active={activeTab} 
          onSelect={handleTabChange} 
          isOpen={isSidebarOpen} 
          onToggle={() => setIsSidebarOpen((prev) => !prev)} 
        />

        {/* Main content with 120Hz smooth scrolling physics */}
        <main className="dashboard-main flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth will-change-transform">
          {!sessionVerified ? (
            <div className="flex items-center justify-center h-full">
              <SectionCircleLoader size="lg" text="Restoring workspace session…" />
            </div>
          ) : activeTab === "profile" ? (
            <UserProfile />
          ) : !dataset ? (
            <EmptyWorkspaceStudio onSelectTab={handleTabChange} />
          ) : (
            <>
              {activeTab === "preview" && <PreviewTable />}
              {activeTab === "explore" && <ExplorePanel />}
              {activeTab === "chat" && <ChatPanel />}
              {activeTab === "sql-editor" && <SqlEditorPanel />}

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
