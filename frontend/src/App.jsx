import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
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
import Lenis from "lenis";

import MainAppLoader from "./components/shared/MainAppLoader.jsx";
import AppLoadingBar from "./components/shared/AppLoadingBar.jsx";

import AdminAuth from "./pages/AdminAuth.jsx";
import Admin from "./pages/Admin.jsx";

function PageTitleUpdater() {
  const location = useLocation();

  React.useEffect(() => {
    const titles = {
      "/": "AI Data Analysis Platform - Talk to Your Data & Get Instant Visuals",
      "/login": "Sign In | AI Data Analysis Platform",
      "/register": "Get Started & Create Account | AI Data Analysis Platform",
      "/app": "Workspace Studio | AI Data Analysis Platform",
      "/docs": "Documentation & Guides | AI Data Analysis Platform",
      "/faq": "Frequently Asked Questions | AI Data Analysis Platform",
      "/faqs": "Frequently Asked Questions | AI Data Analysis Platform",
      "/privacy": "Privacy Policy | AI Data Analysis Platform",
      "/terms": "Terms of Service | AI Data Analysis Platform",
      "/admin/login": "Admin Sign In | AI Data Analysis Platform",
      "/admin": "Admin Portal | AI Data Analysis Platform",
    };

    document.title = titles[location.pathname] || "AI Data Analysis Platform";
  }, [location.pathname]);

  return null;
}

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useUser();

  if (loading) {
    return <MainAppLoader text="Restoring secure session..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  const { user, loading } = useUser();
  const [initialAppReady, setInitialAppReady] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(() => typeof window !== "undefined" ? window.innerWidth < 768 : false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    // Synchronize global HTML class with saved theme
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Show splash main loader on initial app load for a smooth brand intro
    const timer = setTimeout(() => {
      setInitialAppReady(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (!initialAppReady) {
    return <MainAppLoader text="Initializing AI Data Analysis..." />;
  }

  return (
    <>
      <PageTitleUpdater />
      <AppLoadingBar />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/faqs" element={<FaqPage />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        
        <Route 
          path="/login" 
          element={user ? <Navigate to="/app" replace /> : <Auth />} 
        />
        <Route 
          path="/register" 
          element={user ? <Navigate to="/app" replace /> : <Auth />} 
        />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminAuth />} />
        <Route path="/admin" element={<Admin />} />
        
        <Route 
          path="/app" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Fallback to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer 
        position="bottom-right" 
        autoClose={4000} 
        theme="colored" 
        style={{ zIndex: 99999 }}
      />
    </>
  );
}
