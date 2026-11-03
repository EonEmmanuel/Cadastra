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
    <header className="h-14 w-full bg-[#03060E] border-b border-white/[0.08] px-3 sm:px-4 flex items-center justify-between gap-3 select-none shrink-0 z-40 font-sans">
      {/* 1. BRAND LOGO + BACKEND STATUS */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={onOpenUploadHub}>
          <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-white/[0.04] backdrop-blur-md">
            <div className="w-4 h-4 rounded-full border border-[#60A5FA]/70 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
          <span className="text-sm font-semibold tracking-tight text-white uppercase font-sans">
            CADASTRA<span className="text-[#60A5FA] ml-1 font-mono text-xs">CM</span>
          </span>
        </div>

        {/* Real backend status — labelled honestly */}
        <span
          title={
            apiConnected
              ? "Vérifications servies par l'API FastAPI (localhost:8000)"
              : "API injoignable : calcul local de secours (Snyder + Shoelace)"
          }
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider ${
            apiConnected
              ? "border-[#60A5FA]/30 bg-[#3B82F6]/10 text-blue-200"
              : "border-zinc-700 bg-white/[0.03] text-zinc-400"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              apiConnected ? "bg-[#60A5FA] shadow-[0_0_6px_#60A5FA]" : "bg-zinc-500"
            }`}
          />
          <span className="hidden md:inline">
            {apiConnected ? "API en ligne" : "Mode local"}
          </span>
        </span>
      </div>

      {/* 2. CENTER ACTION / HERO TRIGGER */}
      <div className="flex items-center gap-2">
        {/* Toggle between Landing Page and Dashboard */}
        <button
          type="button"
          onClick={onOpenUploadHub}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-zinc-900 hover:bg-zinc-100 text-xs font-semibold transition shadow-sm active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          <UploadCloud className="w-3.5 h-3.5 text-zinc-900" />
          <span className="hidden sm:inline">
            {isInDashboardView ? "← Accueil (Nouveau Plan)" : "Auditer un Plan (Image/PDF)"}
          </span>
          <span className="sm:hidden">
            {isInDashboardView ? "Accueil" : "Auditer"}
          </span>
        </button>

        {/* Manual Coordinate Input Trigger */}
        <button
          type="button"
          onClick={onOpenCustomPlanModal}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-medium text-zinc-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden lg:inline">Saisie Manuelle</span>
        </button>
      </div>

      {/* 3. RIGHT INTEGRATIONS */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenWhatsAppModal}
          className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-zinc-300 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 active:scale-[0.98]"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden lg:inline">WhatsApp API</span>
        </button>

        <button
          type="button"
          onClick={onOpenApiSettings}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-zinc-300 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 active:scale-[0.98]"
        >
          <Key className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline">Clés API</span>
        </button>
      </div>
    </header>
  );
}
