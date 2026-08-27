import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function AppLoadingBar() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Trigger on every location/route navigation
    setLoading(true);
    setProgress(35);

    const timer1 = setTimeout(() => {
      setProgress(75);
    }, 180);

    const timer2 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 300);
    }, 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [location.pathname, location.hash]);

  return (
    <>
      {/* Top progress line */}
      {loading && (
        <div className="fixed top-0 left-0 right-0 z-[99999] h-[3px] bg-transparent pointer-events-none overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#0071e3] via-[#5e5ce6] to-[#af52de] dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 transition-all duration-200 ease-out shadow-[0_0_12px_rgba(0,113,227,1)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Pure Icon Circle Loader in front of the screen with Full-Screen Background Blur */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[99998] flex items-center justify-center backdrop-blur-md bg-white/10 dark:bg-black/20 pointer-events-none select-none"
          >
            {/* Pure Dual-Circle Apple Spinner with Ambient Halo */}
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-14 h-14 flex items-center justify-center"
            >
              {/* Soft blur glow */}
              <div className="absolute inset-0 rounded-full bg-blue-500/25 dark:bg-blue-400/30 blur-xl" />
              
              {/* Outer guide circle */}
              <div className="w-12 h-12 rounded-full border-[3px] border-black/[0.15] dark:border-white/[0.2]" />
              
              {/* High-contrast spinning arc */}
              <div className="absolute inset-0 m-auto w-12 h-12 rounded-full border-[3.5px] border-t-[#0071e3] dark:border-t-blue-400 border-r-[#5e5ce6] dark:border-r-indigo-400 border-b-transparent border-l-transparent animate-spin" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
