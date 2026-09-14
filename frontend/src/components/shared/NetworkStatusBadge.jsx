import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi, CloudRain, Loader2 } from "lucide-react";
import { useNetworkStatus } from "../../hooks/useNetworkStatus.js";

/**
 * NetworkStatusBadge
 * Displays non-intrusive status pill during slow network conditions,
 * offline state, or when background requests/rendering are occurring.
 */
export default function NetworkStatusBadge({ showActiveRequests = true }) {
  const { isOnline, isSlowNetwork, activeRequests, isBackgroundBusy } = useNetworkStatus();

  // If online, not slow network, and no background requests: hide badge
  if (isOnline && !isSlowNetwork && (!showActiveRequests || !isBackgroundBusy)) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -4 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold select-none backdrop-blur-xl transition-all"
      >
        {!isOnline ? (
          <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-full shadow-xs">
            <WifiOff size={13} className="animate-pulse text-rose-600 dark:text-rose-400" />
            <span className="text-[11px]">Offline • Reconnecting</span>
          </div>
        ) : isSlowNetwork ? (
          <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full shadow-xs">
            <CloudRain size={13} className="animate-pulse text-amber-600 dark:text-amber-400" />
            <span className="text-[11px] hidden sm:inline">Slow Network • Background Sync</span>
            <span className="text-[11px] sm:hidden">Slow Connection</span>
          </div>
        ) : isBackgroundBusy ? (
          <div className="flex items-center gap-1.5 text-[#0071e3] dark:text-cyan-400 bg-[#0071e3]/10 dark:bg-cyan-500/15 border border-[#0071e3]/25 dark:border-cyan-400/25 px-2 py-0.5 rounded-full shadow-xs">
            <Loader2 size={12} className="animate-spin text-[#0071e3] dark:text-cyan-400" />
            <span className="text-[11px] hidden md:inline">
              Processing in background
            </span>
          </div>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}
