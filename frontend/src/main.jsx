import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { UserProvider } from "./context/UserContext.jsx";
import { DatasetProvider } from "./context/DatasetContext.jsx";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <UserProvider>
        <DatasetProvider>
          <App />
        </DatasetProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);
