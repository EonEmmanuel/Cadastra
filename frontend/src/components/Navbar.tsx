"use client";

import React from "react";
import {
  UploadCloud,
  Key,
  MessageCircle,
  Plus,
  Languages,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

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
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="h-14 w-full bg-[#060709] border-b border-white/[0.08] px-3 sm:px-4 flex items-center justify-between gap-3 select-none shrink-0 z-40 font-sans">
      {/* 1. BRAND LOGO + BACKEND STATUS */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={onOpenUploadHub}>
          <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-white/[0.04] backdrop-blur-md">
            <div className="w-4 h-4 rounded-full border border-[#00DF8F]/70 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
          <span className="text-sm font-semibold tracking-tight text-white uppercase font-sans">
            {t.brandName}<span className="text-[#00DF8F] ml-1 font-mono text-xs">CM</span>
          </span>
        </div>

        {/* Real backend status */}
        <span
          title={
            apiConnected
              ? "FastAPI server active (localhost:8000)"
              : "API offline: fallback local calculation"
          }
          className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${
            apiConnected
              ? "border-[#00DF8F]/30 bg-[#00DF8F]/10 text-[#00DF8F]"
              : "border-zinc-700 bg-white/[0.03] text-zinc-400"
          }`}
        >
          <span>
            {apiConnected ? t.apiConnected : t.apiOffline}
          </span>
        </span>
      </div>

      {/* 2. CENTER ACTION / HERO TRIGGER */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenUploadHub}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-white text-zinc-900 hover:bg-zinc-100 text-xs font-semibold transition shadow-sm active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          <UploadCloud className="w-3.5 h-3.5 text-zinc-900" />
          <span className="hidden sm:inline">
            {isInDashboardView ? t.btnHomeNewPlan : t.btnAuditPlan}
          </span>
          <span className="sm:hidden">
            {isInDashboardView ? (language === "en" ? "Home" : "Accueil") : (language === "en" ? "Audit" : "Auditer")}
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenCustomPlanModal}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-medium text-zinc-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden lg:inline">{t.btnManualInput}</span>
        </button>
      </div>

      {/* 3. RIGHT INTEGRATIONS & LANGUAGE TOGGLE */}
      <div className="flex items-center gap-2">
        {/* Bilingual Language Switcher (EN / FR) */}
        <div className="flex items-center rounded-md bg-white/[0.05] border border-white/[0.1] p-0.5 font-mono text-xs">
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={`px-2.5 py-1 rounded-sm text-[11px] font-semibold transition ${
              language === "en"
                ? "bg-white text-zinc-950 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
            title="English"
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLanguage("fr")}
            className={`px-2.5 py-1 rounded-sm text-[11px] font-semibold transition ${
              language === "fr"
                ? "bg-white text-zinc-950 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
            title="Français"
          >
            FR
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenWhatsAppModal}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-zinc-300 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 active:scale-[0.98]"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden xl:inline">{t.btnWhatsApp}</span>
        </button>

        <button
          type="button"
          onClick={onOpenApiSettings}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-zinc-300 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 active:scale-[0.98]"
        >
          <Key className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline">{t.btnApiKeys}</span>
        </button>
      </div>
    </header>
  );
}
