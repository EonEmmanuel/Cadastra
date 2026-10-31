"use client";

import React from "react";

export function HalftoneDome() {
  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center select-none pointer-events-none">
      {/* Ambient Top Glow (Atmospheric light) */}
      <div className="absolute top-0 w-[600px] h-[300px] bg-white/[0.08] blur-[130px] rounded-full pointer-events-none" />

      {/* Semicircle Halftone Dome & Undulating Wave Mesh */}
      <div className="relative w-full h-[360px] sm:h-[440px] overflow-hidden flex items-end justify-center">
        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full text-white"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Fine Dot Grid Pattern - Sharp White Stipples */}
            <pattern
              id="dome-stipple"
              width="13"
              height="13"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="3" cy="3" r="1.7" fill="#FFFFFF" opacity="0.9" />
            </pattern>

            {/* True Semicircle Mask - Extends up to the apex (r=490) */}
            <radialGradient
              id="dome-radial-mask"
              cx="500"
              cy="500"
              r="490"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="65%" stopColor="#FFFFFF" stopOpacity="0.85" />
              <stop offset="85%" stopColor="#FFFFFF" stopOpacity="0.55" />
              <stop offset="97%" stopColor="#FFFFFF" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>

            <mask id="stipple-dome-mask">
              <ellipse
                cx="500"
                cy="500"
                rx="485"
                ry="485"
                fill="url(#dome-radial-mask)"
              />
            </mask>

            {/* Glowing Wave Ribbon Gradients */}
            <linearGradient id="wave-silk-1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.02)" />
              <stop offset="20%" stopColor="rgba(255,255,255,0.5)" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="80%" stopColor="rgba(255,255,255,0.5)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
            </linearGradient>

            <linearGradient id="wave-silk-2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.02)" />
              <stop offset="30%" stopColor="rgba(255,255,255,0.7)" />
              <stop offset="65%" stopColor="rgba(255,255,255,0.9)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
            </linearGradient>

            <filter id="soft-silk-glow" x="-20%" y="-30%" width="140%" height="160%">
              <feGaussianBlur stdDeviation="9" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Semicircle Halftone Dot Cloud (Vocel Stippled Sphere) */}
          <ellipse
            cx="500"
            cy="500"
            rx="485"
            ry="485"
            fill="url(#dome-stipple)"
            mask="url(#stipple-dome-mask)"
            className="opacity-95"
          />

          {/* Outer Boundary Arc of the Semicircle */}
          <path
            d="M 15 500 A 485 485 0 0 1 985 500"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            fill="none"
          />

          {/* Glowing Luminous Topographical Waveforms at Base */}
          <path
            d="M 20 450 C 200 290, 350 390, 500 340 C 650 290, 800 410, 980 450"
            fill="none"
            stroke="url(#wave-silk-1)"
            strokeWidth="4"
            filter="url(#soft-silk-glow)"
          />

          <path
            d="M 50 470 C 240 330, 400 410, 560 360 C 710 310, 850 420, 950 470"
            fill="none"
            stroke="url(#wave-silk-2)"
            strokeWidth="2.8"
          />

          <path
            d="M 80 480 C 280 370, 460 430, 620 390 C 760 360, 870 440, 920 480"
            fill="none"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="1.8"
          />

          {/* Luminous Fog Core */}
          <ellipse
            cx="500"
            cy="450"
            rx="420"
            ry="70"
            fill="url(#wave-silk-1)"
            className="opacity-35 blur-2xl"
          />
        </svg>
      </div>
    </div>
  );
}
