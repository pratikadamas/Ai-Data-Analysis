import React, { useState } from "react";
import Header from "../components/layout/Header.jsx";
import Sidebar from "../components/layout/Sidebar.jsx";
import UploadArea from "../components/upload/UploadArea.jsx";
import PreviewTable from "../components/preview/PreviewTable.jsx";
import ExplorePanel from "../components/explore/ExplorePanel.jsx";
import ChatPanel from "../components/chat/ChatPanel.jsx";
import { useDataset } from "../context/DatasetContext.jsx";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("preview");
  const { dataset } = useDataset();

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar active={activeTab} onSelect={setActiveTab} />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {!dataset && <UploadArea />}

          {dataset && activeTab === "preview" && <PreviewTable />}
          {dataset && activeTab === "explore" && <ExplorePanel />}
          {dataset && activeTab === "chat" && <ChatPanel />}

          {dataset && (
            <div className="pt-2">
              <button
                onClick={() => window.location.reload()}
                className="text-xs text-gray-500 hover:underline"
              >
                Upload a different dataset
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
