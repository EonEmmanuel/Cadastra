"use client";

import React, { useState, useRef, DragEvent, KeyboardEvent } from "react";
import {
  UploadCloud,
  FileText,
  Play,
  Sparkles,
  ArrowUp,
  Paperclip,
  Image as ImageIcon,
  Mic,
  X,
  FileEdit,
} from "lucide-react";
import { PlanVerificationRequest } from "@/types/cadastre";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HalftoneDome } from "@/components/ui/halftone-dome";
import { WaveformVisualizer } from "@/components/ui/waveform-visualizer";
import { PartnerLogos } from "@/components/ui/partner-logos";

interface LandingHeroProps {
  onPlanLoaded: (plan: PlanVerificationRequest, fileName: string) => void;
  onOpenManualModal: () => void;
  onOpenDashboard: () => void;
  onOpenWhatsAppModal: () => void;
  onOpenApiSettings: () => void;
}

export default function LandingHero({
  onPlanLoaded,
  onOpenManualModal,
  onOpenDashboard,
  onOpenWhatsAppModal,
  onOpenApiSettings,
}: LandingHeroProps) {
  const [promptText, setPromptText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setAttachedFile(file);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:8000/api/extract", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        onPlanLoaded(data.extracted_plan, file.name);
      } else {
        // Open review modal with an empty plan ready for user input
        const emptyPlan: PlanVerificationRequest = {
          plan_id: file.name.replace(/\.[^/.]+$/, "").toUpperCase(),
          locality: "Cameroun",
          region: "Littoral",
          utm_zone: "32N",
          stated_area_sqm: 0,
          beacons: [],
        };
        onPlanLoaded(emptyPlan, file.name);
      }
    } catch {
      const emptyPlan: PlanVerificationRequest = {
        plan_id: file.name.replace(/\.[^/.]+$/, "").toUpperCase(),
        locality: "Cameroun",
        region: "Littoral",
        utm_zone: "32N",
        stated_area_sqm: 0,
        beacons: [],
      };
      onPlanLoaded(emptyPlan, file.name);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handlePromptSubmit = () => {
    if (attachedFile) {
      handleFileUpload(attachedFile);
      return;
    }

    if (!promptText.trim()) {
      fileInputRef.current?.click();
      return;
    }

    // If user typed coordinates or text, open manual modal
    onOpenManualModal();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handlePromptSubmit();
    }
  };

  return (
    // Outer Framed Artboard (Vocel Framed Layout: hairline borders + pitch-black bg)
    <div className="w-full max-w-[1240px] mx-auto border-x border-white/[0.08] min-h-screen bg-[#07080A] text-zinc-100 flex flex-col justify-between select-none relative font-sans">
      {/* Geodetic Corner Registration Crosshairs (+) */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-white/30 text-xs font-mono pointer-events-none z-30">
        +
      </div>
      <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 text-white/30 text-xs font-mono pointer-events-none z-30">
        +
      </div>

      {/* 1. TOP NAVIGATION BAR */}
      <header className="w-full border-b border-white/[0.08] px-6 py-4 flex items-center justify-between gap-4">
        {/* Left: Geometric Cadastral Glyph + Logo */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white">
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-xs font-semibold tracking-wider text-white uppercase">
            CADASTRA<span className="text-zinc-500 font-mono ml-1">CM</span>
          </span>
        </div>

        {/* Center: Clean Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs text-zinc-400 font-normal">
          <a href="#audit" className="hover:text-white transition">
            Cadastre
          </a>
          <a href="#vision" className="hover:text-white transition">
            Vision AI
          </a>
          <a href="#geodesy" className="hover:text-white transition">
            Géodésie
          </a>
          <button onClick={onOpenWhatsAppModal} className="hover:text-white transition">
            WhatsApp API
          </button>
          <a href="#standards" className="hover:text-white transition">
            MINDCAF
          </a>
        </nav>

        {/* Right: Actions + Solid White Button */}
        <div className="flex items-center gap-3 text-xs">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenWhatsAppModal}
            className="hidden sm:inline-flex text-zinc-400 hover:text-white"
          >
            WhatsApp
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenApiSettings}
            className="text-zinc-400 hover:text-white"
          >
            Clés API
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenDashboard}
          >
            Ouvrir la Carte
          </Button>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative w-full pt-16 pb-8 px-6 flex flex-col items-center text-center">
        {/* Eyebrow Pill Badge (Vocel Pattern) */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] text-zinc-300 mb-8 cursor-default">
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          <span className="font-mono uppercase tracking-wider text-zinc-300 font-medium">
            HACKATHON META AI 2026 : NORMES DÉCRET 76-165
          </span>
          <span className="text-zinc-500 font-mono">›</span>
        </div>

        {/* Big Bold Headline (Balanced 2-Line Typography without orphans) */}
        <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-medium tracking-tight text-white max-w-5xl leading-[1.14]">
          L&apos;Intelligence Cadastrale qui&nbsp;s&apos;exécute
          <br />
          à la vitesse de la pensée
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mt-5 leading-relaxed font-normal">
          Audit géodésique autonome, segmentation SAM 3.1, extraction Muse Spark et détection instantanée des fraudes foncières au Cameroun. Optimisé pour les géomètres qui bâtissent l&apos;avenir.
        </p>

        {/* Two Real Action Buttons (No dummy demo triggers) */}
        <div className="flex items-center gap-3 mt-6 mb-4">
          <Button
            variant="primary"
            size="lg"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="w-4 h-4 mr-2" />
            Auditer un plan (Image / PDF)
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={onOpenManualModal}
          >
            <FileEdit className="w-4 h-4 mr-2" />
            Saisie manuelle des coordonnées
          </Button>
        </div>

        {/* 3. HERO STAGE: BACKGROUND DOME + LARGE DECORATED AI INPUT DIRECTLY UNDER */}
        <div className="relative w-full max-w-4xl mt-3 pb-24 flex flex-col items-center">
          {/* Halftone Dome as backdrop: lifted up so its curved stipple crown arches above the card */}
          <div className="absolute -top-14 inset-x-0 flex justify-center pointer-events-none z-0">
            <HalftoneDome />
          </div>

          {/* 4. LARGE, DECORATED AI MODE INPUT FIELD (Directly Under, Sized & Decorated) */}
          <div
            id="audit"
            className="relative z-10 w-full max-w-3xl mx-auto mt-4 text-left space-y-3.5"
          >
            {/* Multi-Color Ambient Glow Ring + Rainbow Gradient Frame */}
            <div className="relative group w-full">
              {/* Outer Rainbow Multi-Color Atmospheric Glow Halo */}
              <div className="absolute -inset-1 sm:-inset-1.5 rounded-[34px] bg-gradient-to-r from-sky-400 via-teal-300 via-emerald-400 via-amber-300 via-orange-400 via-rose-500 to-indigo-500 blur-xl opacity-75 group-hover:opacity-95 transition duration-500 pointer-events-none" />
              <div className="absolute -inset-0.5 rounded-[32px] bg-gradient-to-r from-sky-400 via-teal-300 via-emerald-400 via-amber-300 via-orange-400 via-rose-500 to-indigo-500 blur-sm opacity-90 pointer-events-none" />

              {/* The Input Card Container with 1.5px Rainbow Frame */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative rounded-[32px] p-[1.5px] bg-gradient-to-r from-sky-400 via-teal-300 via-emerald-400 via-amber-300 via-orange-400 via-rose-500 to-indigo-500 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.9)] transition-all duration-300 ${
                  isDragging ? "scale-[1.01]" : ""
                }`}
              >
                {/* Inner Card Glass Surface */}
                <div className="relative rounded-[30.5px] bg-[#0A0D14]/95 backdrop-blur-2xl p-6 sm:p-7 flex flex-col justify-between min-h-[165px] sm:min-h-[185px]">
                  {/* Subtle inner rainbow wash along the bottom edge */}
                  <div className="absolute inset-x-0 bottom-0 h-16 rounded-b-[30px] bg-gradient-to-t from-white/[0.03] to-transparent pointer-events-none" />
                  <div className="absolute inset-x-12 bottom-0 h-[2px] bg-gradient-to-r from-sky-400/30 via-amber-300/40 via-orange-400/40 to-indigo-500/30 blur-[1px] pointer-events-none" />

                  {/* Top: Text Input / Query */}
                  <div className="w-full flex-1">
                    <textarea
                      rows={2}
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handlePromptSubmit();
                        }
                      }}
                      placeholder="Poser une question, saisir des coordonnées géodésiques, ou glisser un plan cadastral (Image ou PDF)..."
                      className="w-full bg-transparent text-base sm:text-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none resize-none font-normal leading-relaxed selection:bg-white/20"
                    />

                    {/* Attached File Pill Preview if file dropped/selected */}
                    {attachedFile && (
                      <div className="inline-flex items-center gap-2 mt-2 px-3.5 py-1.5 rounded-xl bg-white/[0.08] border border-white/[0.12] text-xs text-zinc-200 shadow-sm">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span className="font-mono truncate max-w-[240px]">
                          {attachedFile.name}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          ({(attachedFile.size / 1024).toFixed(0)} KB)
                        </span>
                        <button
                          onClick={() => setAttachedFile(null)}
                          className="text-zinc-400 hover:text-white ml-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Hidden Real File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.json"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />

                  {/* Bottom Row: Actions Bar */}
                  <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/[0.06] relative z-10">
                    {/* Left: Attachment & Upload Actions */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 sm:px-3 sm:py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] transition flex items-center gap-2 text-xs font-medium"
                        title="Importer une image de plan (SAM 3.1 + Muse Spark)"
                      >
                        <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" />
                        <span className="hidden sm:inline">Image</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 sm:px-3 sm:py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] transition flex items-center gap-2 text-xs font-medium"
                        title="Joindre un document PDF ou fichier de bornage"
                      >
                        <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" />
                        <span className="hidden sm:inline">PDF</span>
                      </button>
                    </div>

                    {/* Right: Mic & Circular Upward Arrow Submit Button */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={onOpenWhatsAppModal}
                        className="p-2 sm:p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] transition"
                        title="Audit via WhatsApp Cloud API"
                      >
                        <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" />
                      </button>

                      {/* Circular Action Button with Arrow Up (soft periwinkle matching reference) */}
                      <button
                        type="button"
                        onClick={handlePromptSubmit}
                        disabled={isProcessing}
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#7C88C2] hover:bg-[#8D99D4] text-white flex items-center justify-center transition-all duration-200 shadow-[0_4px_16px_rgba(124,136,194,0.35)] active:scale-95 disabled:opacity-40 shrink-0"
                        title="Lancer l'analyse du plan"
                      >
                        {isProcessing ? (
                          <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        ) : (
                          <ArrowUp className="w-5 h-5 text-white stroke-[2.75]" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Suggestions List (identical in style to Meet AI Mode reference image, with crisp readable dark translucent pills) */}
            <div className="w-full pt-1 space-y-2">
              <button
                type="button"
                onClick={onOpenManualModal}
                className="group flex items-center gap-3 text-left w-full px-3.5 py-2 rounded-xl bg-[#080A0F]/85 backdrop-blur-md border border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.04] text-xs sm:text-sm text-zinc-300 hover:text-white transition shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400/80 group-hover:text-amber-300 transition shrink-0" />
                <span className="truncate">Auditer les coordonnées géodésiques d&apos;un plan de bornage (UTM 32N / 33N)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group flex items-center gap-3 text-left w-full px-3.5 py-2 rounded-xl bg-[#080A0F]/85 backdrop-blur-md border border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.04] text-xs sm:text-sm text-zinc-300 hover:text-white transition shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-400/80 group-hover:text-sky-300 transition shrink-0" />
                <span className="truncate">Extraire les bornes depuis une image ou PDF cadastral via Muse Spark</span>
              </button>

              <button
                type="button"
                onClick={() => setPromptText("Vérifier la conformité de superficie légale selon le Décret MINDCAF N° 76-165")}
                className="group flex items-center gap-3 text-left w-full px-3.5 py-2 rounded-xl bg-[#080A0F]/85 backdrop-blur-md border border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.04] text-xs sm:text-sm text-zinc-300 hover:text-white transition shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400/80 group-hover:text-emerald-300 transition shrink-0" />
                <span className="truncate">Contrôler la tolérance réglementaire de superficie foncière (Décret MINDCAF 76-165)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. LOGO / AUTHORITY MARQUEE STRIP */}
      <PartnerLogos />

      {/* 6. LOWER SECTION: "Built for Real-Time Cadastral Intelligence" */}
      <section id="geodesy" className="w-full pt-20 pb-24 px-6 flex flex-col items-center text-center">
        {/* Section Headline */}
        <h2 className="text-3xl sm:text-5xl font-medium tracking-tight text-white max-w-2xl leading-[1.1]">
          Conçu pour l&apos;Audit Cadastral
          <br />
          en Temps Réel
        </h2>

        {/* Section Subtitle */}
        <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mt-4 leading-relaxed font-normal">
          Précision géodésique absolue, projection de Snyder et clarté juridique — même sur les dossiers de titres fonciers les plus complexes du Cameroun.
        </p>

        {/* Two Action Buttons */}
        <div className="flex items-center gap-3 mt-7 mb-14">
          <Button
            variant="primary"
            size="lg"
            onClick={() => fileInputRef.current?.click()}
          >
            Auditer un plan
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={onOpenDashboard}
          >
            Explorer la carte
          </Button>
        </div>

        {/* Twin Comparison Cards with Center Floating Button (System Descriptors, Zero Dummy Fakes) */}
        <div className="relative w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Declared Paper Survey Plan */}
          <Card className="p-6 text-left space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-200">Plan Cadastral Numérisé</span>
              <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] font-mono text-zinc-400">
                Muse Spark · SAM 3.1
              </span>
            </div>

            {/* Vocel Audio/Vector Waveform Visualizer */}
            <WaveformVisualizer type="declared" />

            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-white">Extraction instantanée du bornage.</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-normal">
                Meta SAM 3.1 isole le tableau des coordonnées géodésiques, Muse Spark numérise les bornes sans saisie manuelle.
              </p>
            </div>
          </Card>

          {/* Floating Center Icon */}
          <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white text-black items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            <Play className="w-4 h-4 fill-black text-black ml-0.5" />
          </div>

          {/* Card 2: Verified Geodetic Output */}
          <Card className="p-6 text-left space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">Audit Géodésique Autonome</span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
                Décret N° 76-165
              </span>
            </div>

            {/* Vocel Audio/Vector Waveform Visualizer */}
            <WaveformVisualizer type="verified" />

            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-white">Précision géométrique absolue.</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-normal">
                Gauss-Shoelace calcule la véritable empreinte au sol. Les discordances sont certifiées conformes aux tolérances réglementaires.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="w-full border-t border-white/[0.08] py-6 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-mono">
        <span>CADASTRA-CAMEROON · META GLOBAL AI DEVELOPER HACKATHON 2026</span>
        <span>MINDCAF · SYSTÈME NATIONAL DE VÉRIFICATION FONCIÈRE</span>
      </footer>
    </div>
  );
}
