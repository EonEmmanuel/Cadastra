"use client";

import React from "react";
import {
  UploadCloud,
  Key,
  MessageCircle,
  Plus,
} from "lucide-react";

interface NavbarProps {
  onOpenUploadHub: () => void;
  onOpenApiSettings: () => void;
  onOpenWhatsAppModal: () => void;
  onOpenCustomPlanModal: () => void;
  apiConnected: boolean;
  isInDashboardView: boolean;
}

export default function Navbar({
  onOpenUploadHub,
  onOpenApiSettings,
  onOpenWhatsAppModal,
  onOpenCustomPlanModal,
  apiConnected,
  isInDashboardView,
}: NavbarProps) {
  return (
    <header className="h-14 w-full bg-[#07090D] border-b border-white/[0.08] px-4 flex items-center justify-between gap-4 select-none shrink-0 z-40">
      {/* 1. BRAND LOGO */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.1] flex items-center justify-center p-1.5">
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white">
            <polygon
              points="12,2 22,8.5 12,15 2,8.5"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <polyline points="2,12 12,18.5 22,12" stroke="currentColor" strokeWidth="1.8" />
            <polyline points="2,15.5 12,22 22,15.5" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </div>

        <div className="flex flex-col">
          <span className="font-sans font-bold text-sm tracking-wide text-white leading-none">
            CADASTRA<span className="text-zinc-500 font-mono ml-1">CM</span>
          </span>
          <span className="text-[8px] font-mono tracking-[0.2em] text-zinc-400 uppercase mt-0.5">
            GEOSPATIAL INTELLIGENCE
          </span>
        </div>
      </div>

      {/* 2. CENTER ACTION / HERO TRIGGER */}
      <div className="flex items-center gap-2">
        {/* Toggle between Landing Page and Dashboard */}
        <button
          onClick={onOpenUploadHub}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-semibold transition shadow-md active:scale-[0.98]"
        >
          {isInDashboardView ? (
            <>
              <UploadCloud className="w-3.5 h-3.5 text-black" />
              <span>← Accueil (Nouveau Plan)</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-3.5 h-3.5 text-black" />
              <span>Auditer un Plan (Image/PDF)</span>
            </>
          )}
        </button>

        {/* Manual Coordinate Input Trigger */}
        <button
          onClick={onOpenCustomPlanModal}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-zinc-300 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Saisie Manuelle</span>
        </button>
      </div>

      {/* 3. RIGHT INTEGRATIONS */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenWhatsAppModal}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-zinc-300 transition"
        >
          <MessageCircle className="w-3.5 h-3.5 text-zinc-400" />
          <span>WhatsApp API</span>
        </button>

        <button
          onClick={onOpenApiSettings}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-zinc-300 transition"
        >
          <Key className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline">Clés API</span>
        </button>
      </div>
    </header>
  );
}
