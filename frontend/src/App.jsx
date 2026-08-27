import React, { useEffect } from "react";
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
import Lenis from "lenis";

import MainAppLoader from "./components/shared/MainAppLoader.jsx";
import AppLoadingBar from "./components/shared/AppLoadingBar.jsx";

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

  React.useEffect(() => {
    // Show splash main loader on initial app load for a smooth brand intro
    const timer = setTimeout(() => {
      setInitialAppReady(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.1,
      touchMultiplier: 1.8,
      infinite: false,
      autoRaf: false,
    });

    let lastTime = 0;
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  if (!initialAppReady) {
    return <MainAppLoader text="Initializing AI Data Analysis..." />;
  }

  return (
    <>
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
