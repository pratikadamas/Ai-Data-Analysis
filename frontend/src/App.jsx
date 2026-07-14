import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { DatasetProvider } from "./context/DatasetContext.jsx";
import { useUser } from "./context/UserContext.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Auth from "./pages/Auth.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import FaqPage from "./pages/FaqPage.jsx";
import Docs from "./pages/Docs.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import Terms from "./pages/Terms.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Protected Route Wrapper
function ProtectedRoute({ children }) {
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
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  const { user } = useUser();

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        
        <Route 
          path="/login" 
          element={user ? <Navigate to="/app" replace /> : <Auth />} 
        />
        
        <Route 
          path="/app" 
          element={
            <ProtectedRoute>
              <DatasetProvider>
                <Dashboard />
              </DatasetProvider>
            </ProtectedRoute>
          } 
        />
        
        {/* Fallback to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer position="bottom-right" autoClose={4000} theme="colored" />
    </>
  );
}
