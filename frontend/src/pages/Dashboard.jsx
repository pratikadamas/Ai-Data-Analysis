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
import { RefreshCw } from "lucide-react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("preview");
  const { dataset, clearDataset } = useDataset();

  return (
    <div className="h-screen flex flex-col relative">
      {/* Optional ambient background glows could go here, but using the global styles for now */}
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar active={activeTab} onSelect={setActiveTab} />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "profile" ? (
            <UserProfile />
          ) : (
            <>
              {!dataset && activeTab === "preview" && <UploadArea />}

              {activeTab === "preview" && dataset && <PreviewTable />}
              {activeTab === "explore" && <ExplorePanel />}
              {activeTab === "chat" && <ChatPanel />}
              {activeTab === "sql-editor" && <SqlEditorPanel />}

              {/* Show upload area inline when on a tab that needs data but none is loaded */}
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
    </div>
  );
}
