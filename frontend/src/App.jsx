import React from "react";
import { DatasetProvider } from "./context/DatasetContext.jsx";
import { useUser } from "./context/UserContext.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Auth from "./pages/Auth.jsx";

export default function App() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium tracking-wide text-gray-500 dark:text-gray-400 animate-pulse">
            Loading session...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <DatasetProvider>
      <Dashboard />
    </DatasetProvider>
  );
}
