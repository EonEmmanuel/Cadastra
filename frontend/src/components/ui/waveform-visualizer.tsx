"use client";

import React from "react";

interface WaveformProps {
  type: "declared" | "verified";
  className?: string;
}

export function WaveformVisualizer({ type, className = "" }: WaveformProps) {
  if (type === "declared") {
    // Declared Paper Plan: Rich oscillating geometric wave with high luminosity & beacon markers
    return (
      <div
        className={`relative w-full h-40 rounded-xl bg-[#06080B] border border-white/[0.08] overflow-hidden flex items-center justify-center ${className}`}
      >
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FFFFFF_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

        <svg
          viewBox="0 0 400 130"
          className="w-full h-full text-white"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="declared-wave-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
              <stop offset="25%" stopColor="rgba(255,255,255,0.6)" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="75%" stopColor="rgba(255,255,255,0.6)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
            </linearGradient>

            <filter id="declared-glow" x="-30%" y="-40%" width="160%" height="180%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Reference Zero Axis */}
          <line
            x1="20"
            y1="65"
            x2="380"
            y2="65"
            stroke="rgba(255,255,255,0.15)"
            strokeDasharray="3 4"
          />

          {/* Multi-layered Waveform Ribbons (Vocel acoustic wave style) */}
          <path
            d="M 25 65 C 80 20, 130 110, 200 65 C 270 20, 320 110, 375 65"
            stroke="url(#declared-wave-grad)"
            strokeWidth="3.2"
            filter="url(#declared-glow)"
          />

          <path
            d="M 35 65 C 90 35, 140 95, 200 65 C 260 35, 310 95, 365 65"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="1.8"
          />

          <path
            d="M 45 65 C 100 48, 150 82, 200 65 C 250 48, 300 82, 355 65"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1.2"
          />

          {/* Glowing Beacon Nodes with pulsing rings */}
          <circle cx="115" cy="50" r="3.5" fill="#FFFFFF" />
          <circle cx="115" cy="50" r="7" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />

          <circle cx="200" cy="65" r="4" fill="#FFFFFF" />

          <circle cx="285" cy="80" r="3.5" fill="#FFFFFF" />
          <circle cx="285" cy="80" r="7" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
        </svg>

        <div className="absolute bottom-2.5 left-3 text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
          Signal Numérisé · 4 Bornes
        </div>
      </div>
    );
  }

  // Verified AI Geodesy: Pure harmonic synthesized wave ribbon with sharp Gauss-Shoelace precision
  return (
    <div
      className={`relative w-full h-40 rounded-xl bg-[#06080B] border border-white/[0.08] overflow-hidden flex items-center justify-center ${className}`}
    >
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FFFFFF_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

      <svg
        viewBox="0 0 400 130"
        className="w-full h-full text-white"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="verified-wave-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="30%" stopColor="rgba(255,255,255,0.8)" />
            <stop offset="50%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="rgba(255,255,255,0.8)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
          </linearGradient>

          <filter id="verified-glow" x="-30%" y="-40%" width="160%" height="180%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Reference Zero Axis */}
        <line
          x1="20"
          y1="65"
          x2="380"
          y2="65"
          stroke="rgba(255,255,255,0.15)"
          strokeDasharray="3 4"
        />

        {/* Synthesized Geodetic Wave Ribbon 1 (Vivid Glowing Core) */}
        <path
          d="M 25 65 C 75 12, 125 118, 200 65 C 275 12, 325 118, 375 65"
          stroke="url(#verified-wave-grad)"
          strokeWidth="3.6"
          filter="url(#verified-glow)"
        />

        {/* Synthesized Geodetic Wave Ribbon 2 */}
        <path
          d="M 35 65 C 85 28, 135 102, 200 65 C 265 28, 315 102, 365 65"
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="2"
        />

        {/* Synthesized Geodetic Wave Ribbon 3 */}
        <path
          d="M 50 65 C 100 42, 150 88, 200 65 C 250 42, 300 88, 350 65"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.2"
        />

        {/* Geodetic Closure Node with Target Crosshair */}
        <circle cx="200" cy="65" r="4.5" fill="#FFFFFF" />
        <circle cx="200" cy="65" r="9" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
      </svg>

      <div className="absolute bottom-2.5 right-3 text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
        UTM 32N · Gauss-Shoelace
      </div>
    </div>
  );
}
