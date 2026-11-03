"use client";

import React, {
  useState,
  useRef,
  useEffect,
  DragEvent,
  KeyboardEvent,
} from "react";
import {
  FileText,
  ArrowUp,
  Image as ImageIcon,
  MessageCircle,
  X,
  Compass,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { PlanVerificationRequest, PlanExtractionPreview } from "@/types/cadastre";

interface LandingHeroProps {
  onPlanLoaded: (
    plan: PlanVerificationRequest,
    fileName: string,
    preview: PlanExtractionPreview | null
  ) => void;
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractError, setExtractError] = useState<string | null>(null);

  // Dedicated refs for Image and PDF inputs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // GSAP animation refs
  const containerRef = useRef<HTMLDivElement>(null);
  const bloomRef = useRef<HTMLDivElement>(null);
  const wave1Ref = useRef<SVGPathElement>(null);
  const wave2Ref = useRef<SVGPathElement>(null);
  const wave3Ref = useRef<SVGPathElement>(null);

  // Create / revoke object URL whenever attached file changes
  useEffect(() => {
    if (!attachedFile) {
      setPreviewUrl(null);
      return;
    }
    if (attachedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(attachedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    // PDF — no image preview
    setPreviewUrl(null);
  }, [attachedFile]);

  // GSAP entrance + ambient animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-anim-header", {
        y: -16,
        opacity: 0,
        duration: 0.55,
        ease: "power2.out",
      });
      gsap.from(".hero-anim-title", {
        y: 20,
        opacity: 0,
        duration: 0.65,
        ease: "power3.out",
        delay: 0.05,
      });
      gsap.from(".hero-anim-subtitle", {
        y: 16,
        opacity: 0,
        duration: 0.65,
        ease: "power2.out",
        delay: 0.1,
      });
      // The card keeps opacity 100% solid at all times (never dims on refresh/mount)
      gsap.from(".hero-anim-card", {
        y: 18,
        duration: 0.6,
        ease: "power2.out",
      });
      gsap.from([".hero-anim-trust", ".hero-anim-samples"], {
        y: 14,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        delay: 0.18,
      });

      if (wave1Ref.current) {
        gsap.to(wave1Ref.current, {
          y: -12,
          duration: 4.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
      if (wave2Ref.current) {
        gsap.to(wave2Ref.current, {
          y: 10,
          duration: 6.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 0.5,
        });
      }
      if (wave3Ref.current) {
        gsap.to(wave3Ref.current, {
          y: -8,
          duration: 5.4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 1.0,
        });
      }
      if (bloomRef.current) {
        gsap.to(bloomRef.current, {
          scale: 1.06,
          opacity: 0.9,
          duration: 5.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Core extraction pipeline — called only when user presses submit
  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setExtractError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:8000/api/extract", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.extracted_plan) {
          const structured = data.spark_structured_fields ?? {};
          const preview: PlanExtractionPreview = {
            previewUrl: URL.createObjectURL(file),
            previewKind: file.type.startsWith("image/") ? "image" : "pdf",
            tableRoi: data.table_roi ?? null,
            samTableRoi: data.sam_table_roi ?? null,
            cropUrl:
              typeof data.table_crop_data_url === "string"
                ? data.table_crop_data_url
                : null,
            samSegmentation:
              typeof structured.sam_3_1?.table_refinement === "string"
                ? structured.sam_3_1.table_refinement
                : null,
            documentSource:
              typeof structured.document_source === "string"
                ? structured.document_source
                : null,
            zoomRecheck:
              typeof structured.zoom_recheck === "string"
                ? structured.zoom_recheck
                : null,
            protocol: structured.protocol ?? null,
            detectedLanguage: data.detected_language ?? null,
          };
          onPlanLoaded(data.extracted_plan, file.name, preview);
          setAttachedFile(null);
          return;
        }
        setExtractError(
          "Le serveur n'a renvoyé aucune coordonnée exploitable pour ce document."
        );
        return;
      }

      let detail = `Erreur serveur ${res.status}`;
      try {
        const err = await res.json();
        if (err?.detail) {
          if (typeof err.detail === "string") {
            if (
              err.detail.includes("PlanVerificationRequest") ||
              err.detail.includes("beacons")
            ) {
              detail =
                "Aucune table de bornes (B1...Bn) lisible n'a été trouvée sur cette image. Assurez-vous d'utiliser un plan de bornage avec son tableau de coordonnées géodésiques.";
            } else {
              detail = err.detail;
            }
          } else {
            detail = JSON.stringify(err.detail);
          }
        }
      } catch {
        // fall through to status-code message
      }
      setExtractError(`Extraction IA : ${detail}`);
    } catch {
      setExtractError(
        "Impossible de contacter le serveur backend (http://localhost:8000). Vérifiez que FastAPI est démarré."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // File selection handlers — attach only, no auto-upload
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const isImage =
      file.type.startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(file.name);
    if (!isImage) {
      setExtractError(
        "Format invalide. Ce sélecteur n'accepte que les images (PNG, JPG, WEBP)."
      );
      return;
    }
    setExtractError(null);
    setAttachedFile(file);
  };

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const isPdf =
      file.type === "application/pdf" || /\.pdf$/i.test(file.name);
    if (!isPdf) {
      setExtractError(
        "Format invalide. Ce sélecteur n'accepte que les documents PDF."
      );
      return;
    }
    setExtractError(null);
    setAttachedFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const isImage =
      file.type.startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(file.name);
    const isPdf =
      file.type === "application/pdf" || /\.pdf$/i.test(file.name);

    if (!isImage && !isPdf) {
      setExtractError(
        "Format non pris en charge. Déposez une image (PNG, JPG) ou un PDF."
      );
      return;
    }
    setExtractError(null);
    setAttachedFile(file);
  };

  // Submit: if file is attached, upload it; otherwise handle text intent
  const handlePromptSubmit = () => {
    if (attachedFile) {
      handleFileUpload(attachedFile);
      return;
    }

    const trimmed = promptText.trim().toLowerCase();
    if (!trimmed) {
      imageInputRef.current?.click();
      return;
    }

    if (
      trimmed.includes("yassa") ||
      (trimmed.includes("douala") && !trimmed.includes("fraude"))
    ) {
      handleLoadSample("douala_yassa_utm32n.json");
      return;
    }
    if (
      trimmed.includes("fraude") ||
      trimmed.includes("fraud") ||
      trimmed.includes("fictive")
    ) {
      handleLoadSample("douala_yassa_fraud_superficie.json");
      return;
    }
    if (
      trimmed.includes("odza") ||
      trimmed.includes("yaounde") ||
      trimmed.includes("yaoundé")
    ) {
      handleLoadSample("yaounde_odza_utm32n.json");
      return;
    }

    onOpenManualModal();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handlePromptSubmit();
    }
  };

  const handleLoadSample = async (profileName: string) => {
    setIsProcessing(true);
    setExtractError(null);
    try {
      const res = await fetch(
        `http://localhost:8000/api/profiles/${profileName}`
      );
      if (res.ok) {
        const plan = await res.json();
        onPlanLoaded(plan, profileName, null);
      } else {
        setExtractError("Profil de démonstration introuvable sur le serveur.");
      }
    } catch {
      setExtractError("Erreur de connexion lors du chargement du profil.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen bg-[#03060E] text-zinc-100 flex flex-col justify-between overflow-x-clip font-sans select-none"
    >
      {/* Atmospheric ambient layers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-[12%] left-[8%] w-[620px] h-[520px] rounded-full opacity-25 blur-[130px]"
          style={{
            background:
              "radial-gradient(circle, rgba(129, 140, 248, 0.4) 0%, transparent 70%)",
          }}
        />
        <div
          ref={bloomRef}
          className="absolute top-[32%] left-1/2 -translate-x-1/2 w-[1150px] h-[780px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 50%, rgba(37, 99, 235, 0.44) 0%, rgba(29, 78, 216, 0.22) 42%, rgba(15, 23, 42, 0) 75%)",
          }}
        />
        <div
          className="absolute bottom-0 inset-x-0 h-[480px] w-full"
          style={{
            background:
              "radial-gradient(ellipse 100% 65% at 50% 100%, rgba(59, 130, 246, 0.38) 0%, rgba(30, 64, 175, 0.18) 45%, transparent 75%)",
          }}
        />
        <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#93C5FD]/50 to-transparent" />

        <svg
          viewBox="0 0 1440 320"
          className="absolute bottom-0 inset-x-0 w-full h-[270px] object-cover opacity-45 text-[#93C5FD]"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            ref={wave1Ref}
            d="M0,210 C260,130 520,260 760,190 C1000,120 1220,230 1440,170"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            ref={wave2Ref}
            d="M0,240 C300,190 600,270 880,215 C1140,165 1320,245 1440,205"
            stroke="currentColor"
            strokeWidth="0.8"
            opacity="0.65"
          />
          <path
            ref={wave3Ref}
            d="M0,265 C340,225 660,285 980,245 C1260,205 1360,255 1440,235"
            stroke="currentColor"
            strokeWidth="0.6"
            opacity="0.45"
          />
        </svg>
      </div>

      {/* Minimalist Header */}
      <header className="hero-anim-header relative z-20 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-white/[0.04] backdrop-blur-md">
            <div className="w-4 h-4 rounded-full border border-[#60A5FA]/70 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
          <span className="text-sm font-semibold tracking-tight text-white uppercase font-sans">
            CADASTRA<span className="text-[#60A5FA] ml-1 font-mono text-xs">CM</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-normal text-zinc-400">
          <button
            type="button"
            onClick={onOpenManualModal}
            className="hover:text-white transition-colors"
          >
            Géodésie UTM
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample("douala_yassa_utm32n.json")}
            className="hover:text-white transition-colors"
          >
            Plan de bornage
          </button>
          <button
            type="button"
            onClick={onOpenWhatsAppModal}
            className="hover:text-white transition-colors"
          >
            WhatsApp API
          </button>
          <button
            type="button"
            onClick={onOpenApiSettings}
            className="hover:text-white transition-colors"
          >
            Muse Spark
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenApiSettings}
            className="hidden sm:inline-flex text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-full transition"
          >
            Clés API
          </button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={onOpenDashboard}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.12] backdrop-blur-md transition-all active:scale-95"
          >
            <span>Ouvrir la Carte</span>
          </motion.button>
        </div>
      </header>

      {/* Hero content */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-6 pt-10 pb-16 flex flex-col items-center text-center my-auto">
        <h1 className="hero-anim-title text-4xl sm:text-[3.6rem] font-bold tracking-[-0.03em] text-white leading-[1.1] max-w-3xl">
          Audit Foncier &amp; Vérification Cadastrale
        </h1>
        <p className="hero-anim-subtitle mt-4 text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed font-normal">
          Moteur géodésique autonome pour la vérification de plans de bornage et
          la détection de superficies fictives au Cameroun.
        </p>

        {/* Hidden file inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={handleImageSelect}
        />
        <input
          ref={pdfInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handlePdfSelect}
        />

        {/* THE FLOATING AI INPUT CARD — Pure Snow White Solid Surface */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            backgroundColor: isDragging ? "#F8FAFC" : "#FFFFFF",
            border: isDragging ? "2px solid #3B82F6" : "1px solid rgba(226, 232, 240, 0.9)",
            boxShadow:
              "0 24px 60px -12px rgba(0, 0, 0, 0.5), 0 12px 30px -10px rgba(37, 99, 235, 0.25), inset 0 1px 0 rgba(255, 255, 255, 1)",
          }}
          className="hero-anim-card relative w-full mt-10 rounded-[32px] p-6 sm:p-7 text-left overflow-hidden z-20"
        >
          {/* Attached file indicator chip */}
          <AnimatePresence>
            {attachedFile && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="mb-3.5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-700 text-xs font-medium text-zinc-100 shadow-sm"
              >
                {attachedFile.type === "application/pdf" ? (
                  <FileText className="w-3.5 h-3.5 text-red-400 shrink-0" />
                ) : (
                  <ImageIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                )}
                <span className="truncate max-w-[240px]">{attachedFile.name}</span>
                {!isProcessing && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAttachedFile(null);
                    }}
                    className="hover:text-red-400 transition ml-1"
                    aria-label="Retirer le fichier"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Textarea — only shown when no file is attached or not processing */}
          {!attachedFile && (
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              placeholder="Entrez des coordonnées UTM, un identifiant de dossier, ou déposez une photo / PDF du plan..."
              className="w-full bg-transparent text-zinc-900 placeholder:text-zinc-400 text-sm sm:text-base font-normal outline-none resize-none leading-relaxed"
            />
          )}

          {/* Document preview + scan animation — shown when file is attached */}
          <AnimatePresence>
            {attachedFile && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25 }}
                className="relative w-full rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200"
                style={{ minHeight: 160 }}
              >
                {/* Image preview */}
                {previewUrl && attachedFile.type.startsWith("image/") && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="Aperçu du document"
                    className="w-full object-contain max-h-56"
                  />
                )}

                {/* PDF placeholder */}
                {!previewUrl && (
                  <div className="flex flex-col items-center justify-center gap-3 py-10">
                    <FileText className="w-10 h-10 text-zinc-400" />
                    <span className="text-xs text-zinc-500 font-medium truncate max-w-[280px]">
                      {attachedFile.name}
                    </span>
                  </div>
                )}

                {/* Scanning overlay — only while processing */}
                {isProcessing && (
                  <>
                    {/* Dimming veil */}
                    <div className="absolute inset-0 bg-black/30" />
                    {/* Animated scan laser line */}
                    <motion.div
                      className="absolute inset-x-0 h-[3px] pointer-events-none z-10"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent 0%, #3B82F6 40%, #60A5FA 50%, #3B82F6 60%, transparent 100%)",
                        boxShadow: "0 0 16px 4px rgba(59,130,246,0.6)",
                      }}
                      initial={{ top: "0%" }}
                      animate={{ top: ["0%", "100%", "0%"] }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    {/* Processing label */}
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-t from-black/60 to-transparent">
                      <Loader2 className="w-3.5 h-3.5 text-blue-300 animate-spin" />
                      <span className="text-[11px] text-blue-200 font-mono tracking-wide">
                        Analyse en cours...
                      </span>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom controls row */}
          <div className="mt-5 pt-3.5 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200/90">
            <div className="flex flex-wrap items-center gap-2">
              {/* Image picker */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-zinc-100 hover:bg-zinc-200/90 text-zinc-800 border border-zinc-200 shadow-xs transition disabled:opacity-50"
              >
                <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Image (PNG, JPG)</span>
              </motion.button>

              {/* PDF picker */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => pdfInputRef.current?.click()}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-zinc-100 hover:bg-zinc-200/90 text-zinc-800 border border-zinc-200 shadow-xs transition disabled:opacity-50"
              >
                <FileText className="w-3.5 h-3.5 text-red-600" />
                <span>Document PDF</span>
              </motion.button>

              {/* WhatsApp */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={onOpenWhatsAppModal}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-zinc-100 hover:bg-zinc-200/90 text-zinc-800 border border-zinc-200 shadow-xs transition"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp API</span>
              </motion.button>

              {/* Manual entry */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={onOpenManualModal}
                className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-zinc-100 hover:bg-zinc-200/90 text-zinc-800 border border-zinc-200 shadow-xs transition"
              >
                <Compass className="w-3.5 h-3.5 text-zinc-600" />
                <span>Saisie Manuelle</span>
              </motion.button>
            </div>

            {/* Submit button — user must press this to start analysis */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={handlePromptSubmit}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-[#0B0F19] hover:bg-black text-white shadow-md shadow-black/25 transition-all active:scale-95 disabled:opacity-50 shrink-0"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                  <span>Analyse IA...</span>
                </>
              ) : (
                <>
                  <span>Auditer le plan</span>
                  <ArrowUp className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Error notification */}
        <AnimatePresence>
          {extractError && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              className="mt-4 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-start gap-2.5 max-w-xl text-left"
            >
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{extractError}</span>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleLoadSample("douala_yassa_utm32n.json")
                    }
                    className="underline hover:text-white transition"
                  >
                    Tester un plan conforme
                  </button>
                  <span className="text-zinc-500">·</span>
                  <button
                    type="button"
                    onClick={onOpenManualModal}
                    className="underline hover:text-white transition"
                  >
                    Saisie manuelle
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Neutral capability badge — no government claim */}
        <p className="hero-anim-trust mt-5 text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA]" />
          <span>Outil indépendant de vérification géodésique · Calcul UTM/WGS84</span>
        </p>

        {/* Quick-load sample chips */}
        <div className="hero-anim-samples mt-6 flex flex-wrap items-center justify-center gap-2.5">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => handleLoadSample("douala_yassa_utm32n.json")}
            className="px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-zinc-300 hover:text-white transition"
          >
            Douala Yassa (980 m² · Conforme)
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() =>
              handleLoadSample("douala_yassa_fraud_superficie.json")
            }
            className="px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-zinc-300 hover:text-white transition"
          >
            Alerte Fraude (+53% Fictive)
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => handleLoadSample("yaounde_odza_utm32n.json")}
            className="px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-zinc-300 hover:text-white transition"
          >
            Yaoundé Odza (2 100 m² · 5 bornes)
          </motion.button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 font-mono border-t border-white/[0.06]">
        <span>CADASTRA CM · META GLOBAL AI DEVELOPER HACKATHON 2026</span>
        <span className="mt-1 sm:mt-0">MUSE SPARK 1.3 &amp; SAM 3.1 · GÉODÉSIE CAMEROUN</span>
      </footer>
    </div>
  );
}
