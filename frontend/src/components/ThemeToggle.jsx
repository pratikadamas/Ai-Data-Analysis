import React from "react";
import { AnimatedThemeToggler } from "./AnimatedThemeToggler";

export default function ThemeToggle({ className = "", variant = "circle", duration = 1200, ...props }) {
  return (
    <AnimatedThemeToggler
      variant={variant}
      duration={duration}
      className={`p-2 rounded-full text-[#515154] hover:text-[#1d1d1f] dark:text-[#a1a1a6] dark:hover:text-[#f5f5f7] bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-black/[0.06] dark:border-white/[0.08] transition-all duration-200 outline-none select-none cursor-pointer active:scale-95 focus:outline-none focus:ring-0 focus-visible:ring-2 focus-visible:ring-[#0071e3] [&_svg]:w-4.5 [&_svg]:h-4.5 dark:[&_svg]:text-amber-400 ${className}`}
      aria-label="Toggle Dark Mode"
      {...props}
    />
  );
}

export { AnimatedThemeToggler };
