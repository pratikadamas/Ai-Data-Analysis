import React, { useState } from "react";
import Header from "../components/layout/Header.jsx";
import Sidebar from "../components/layout/Sidebar.jsx";
import UploadArea from "../components/upload/UploadArea.jsx";
import PreviewTable from "../components/preview/PreviewTable.jsx";
import ExplorePanel from "../components/explore/ExplorePanel.jsx";
import ChatPanel from "../components/chat/ChatPanel.jsx";
import UserProfile from "../components/profile/UserProfile.jsx";
import { useDataset } from "../context/DatasetContext.jsx";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("preview");
  const { dataset, clearDataset } = useDataset();

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar active={activeTab} onSelect={setActiveTab} />
        <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 dark:bg-gray-950">
          {activeTab === "profile" ? (
            <UserProfile />
          ) : (
            <>
              {!dataset && <UploadArea />}

              {dataset && activeTab === "preview" && <PreviewTable />}
              {dataset && activeTab === "explore" && <ExplorePanel />}
              {dataset && activeTab === "chat" && <ChatPanel />}

              {dataset && (
                <div className="pt-2">
                  <button
                    onClick={clearDataset}
                    className="text-xs text-gray-500 hover:text-red-500 hover:underline transition-colors"
                  >
                    🔄 Upload a different dataset
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
