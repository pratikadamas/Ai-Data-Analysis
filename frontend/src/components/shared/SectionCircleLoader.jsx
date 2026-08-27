import React from "react";
import { motion } from "framer-motion";

export default function SectionCircleLoader({ size = "md", text = "" }) {
  const sizeMap = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-2.5",
    lg: "w-12 h-12 border-3",
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 space-y-3">
      <div className="relative flex items-center justify-center">
        {/* Outer ambient glow */}
        <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-md pointer-events-none" />
        
        {/* Subtle background track */}
        <div className={`${sizeMap[size] || sizeMap.md} rounded-full border-black/[0.08] dark:border-white/[0.1]`} />
        
        {/* Rotating macOS Blue circle spinner */}
        <div className={`absolute inset-0 ${sizeMap[size] || sizeMap.md} rounded-full border-t-[#0071e3] dark:border-t-blue-400 border-r-transparent border-b-transparent border-l-transparent animate-spin`} />
      </div>

      {text && (
        <span className="text-xs font-medium text-[#6e6e73] dark:text-[#a1a1a6] animate-pulse">
          {text}
        </span>
      )}
    </div>
  );
}
