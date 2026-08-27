import React from "react";
import { motion } from "framer-motion";

export default function MainAppLoader({ text = "Loading AI Data Analysis..." }) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#fbfbfd] dark:bg-[#161617] text-[#1d1d1f] dark:text-[#f5f5f7] transition-colors duration-300">
      
      {/* Background ambient lighting */}
      <div className="absolute w-96 h-96 rounded-full bg-gradient-to-tr from-[#0071e3]/20 via-[#5e5ce6]/15 to-[#af52de]/15 dark:from-blue-500/20 dark:via-indigo-500/15 dark:to-purple-500/15 blur-3xl pointer-events-none" />
      
      {/* macOS Glass Center Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col items-center p-10 rounded-3xl bg-white/80 dark:bg-[#1d1d1f]/90 border border-black/[0.08] dark:border-white/[0.12] shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
      >
        {/* Brand Logo with Ambient Ring */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="absolute inset-0 w-20 h-20 -m-2 rounded-2xl bg-gradient-to-tr from-[#0071e3]/30 to-[#af52de]/30 animate-pulse blur-md" />
          <motion.img 
            src="/favicon.webp" 
            alt="AI Data Analysis Brand Logo" 
            className="w-16 h-16 object-contain drop-shadow-lg relative z-10"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Apple Style Circle Spinner */}
        <div className="relative w-8 h-8 flex items-center justify-center mb-4">
          <div className="w-8 h-8 rounded-full border-[2.5px] border-black/[0.08] dark:border-white/[0.12]" />
          <div className="absolute inset-0 w-8 h-8 rounded-full border-[2.5px] border-t-[#0071e3] dark:border-t-blue-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        </div>
        
        {/* Brand title & loading status */}
        <div className="text-center space-y-1">
          <h3 className="font-semibold text-base tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
            AI Data Analysis
          </h3>
          <p className="text-xs font-medium text-[#6e6e73] dark:text-[#a1a1a6]">
            {text}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
