"use client";

import React from "react";

export function PartnerLogos() {
  return (
    <section className="w-full border-y border-white/[0.08] bg-[#07080A]">
      <div className="border-b border-white/[0.06] px-4 py-2.5 text-center">
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-600">
          Technologies et référentiels utilisés · aucune affiliation officielle
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.08] text-center">
        {/* 1. MINDCAF */}
        <div className="py-6 px-4 flex items-center justify-center gap-2.5 text-zinc-400 hover:text-white transition group cursor-default">
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 text-zinc-500 group-hover:text-white transition"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" />
            <path d="M12 22V12" />
            <path d="M21 7L12 12L3 7" />
          </svg>
          <span className="text-xs font-semibold tracking-wider font-mono uppercase">
            MINDCAF
          </span>
        </div>

        {/* 2. OGEC */}
        <div className="py-6 px-4 flex items-center justify-center gap-2.5 text-zinc-400 hover:text-white transition group cursor-default">
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 text-zinc-500 group-hover:text-white transition"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3V21" />
            <path d="M3 12H21" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span className="text-xs font-semibold tracking-wider font-mono uppercase">
            OGEC
          </span>
        </div>

        {/* 3. META AI */}
        <div className="py-6 px-4 flex items-center justify-center gap-2.5 text-zinc-400 hover:text-white transition group cursor-default">
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 text-zinc-500 group-hover:text-white transition"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <path d="M7.5 8C5.01 8 3 10.01 3 12.5C3 15.5 5.5 17.5 8 17.5C10.5 17.5 12 15 12 12C12 9 13.5 6.5 16 6.5C18.5 6.5 21 8.5 21 11.5C21 13.99 18.99 16 16.5 16C14.5 16 13 14.5 12 12" />
          </svg>
          <span className="text-xs font-semibold tracking-wider font-mono uppercase">
            META AI
          </span>
        </div>

        {/* 4. WHATSAPP CLOUD */}
        <div className="py-6 px-4 flex items-center justify-center gap-2.5 text-zinc-400 hover:text-white transition group cursor-default">
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 text-zinc-500 group-hover:text-white transition"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span className="text-xs font-semibold tracking-wider font-mono uppercase">
            WHATSAPP
          </span>
        </div>

        {/* 5. IGN CAMEROUN */}
        <div className="py-6 px-4 flex items-center justify-center gap-2.5 text-zinc-400 hover:text-white transition group cursor-default col-span-2 sm:col-span-1">
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 text-zinc-500 group-hover:text-white transition"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
          <span className="text-xs font-semibold tracking-wider font-mono uppercase">
            IGN
          </span>
        </div>
      </div>
    </section>
  );
}
