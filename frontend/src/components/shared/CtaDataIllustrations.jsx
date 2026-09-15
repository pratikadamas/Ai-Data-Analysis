import React from "react";

/**
 * CtaIllustrationsDecor
 * Refined, clean, and reduced layout for the CTA section.
 * Uses 2 tasteful accent illustrations (left and right) at a reduced,
 * elegant scale with zero overlap over the text or buttons.
 */
export default function CtaIllustrationsDecor() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* ── Left Flank: Smart Ingestion Accent ── */}
      <div className="absolute left-2 sm:left-4 md:left-6 lg:left-8 top-1/2 -translate-y-1/2 w-20 sm:w-24 md:w-28 lg:w-32 h-auto opacity-80 dark:opacity-85 drop-shadow-[0_10px_20px_rgba(0,113,227,0.12)] dark:drop-shadow-[0_12px_24px_rgba(6,182,212,0.25)]">
        <img
          src="/assets/data_ingestion.webp"
          alt="Data Ingestion"
          className="w-full h-auto object-contain"
          loading="lazy"
        />
      </div>

      {/* ── Right Flank: Analytics Metrics Accent ── */}
      <div className="absolute right-2 sm:right-4 md:right-6 lg:right-8 top-1/2 -translate-y-1/2 w-20 sm:w-24 md:w-28 lg:w-32 h-auto opacity-80 dark:opacity-85 drop-shadow-[0_10px_20px_rgba(0,113,227,0.12)] dark:drop-shadow-[0_12px_24px_rgba(6,182,212,0.25)]">
        <img
          src="/assets/analytics_dashboard.webp"
          alt="Analytics Dashboard"
          className="w-full h-auto object-contain"
          loading="lazy"
        />
      </div>

      {/* Subtle Ambient Glows */}
      <div className="absolute top-1/2 left-6 -translate-y-1/2 w-28 h-28 bg-[#0071e3]/8 dark:bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-1/2 right-6 -translate-y-1/2 w-28 h-28 bg-[#06b6d4]/8 dark:bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
    </div>
  );
}
