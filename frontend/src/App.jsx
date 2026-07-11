import React from "react";
import { DatasetProvider } from "./context/DatasetContext.jsx";
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  return (
    <DatasetProvider>
      <Dashboard />
    </DatasetProvider>
  );
}
