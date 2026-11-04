"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Download,
  Share2,
  Check,
  AlertTriangle,
  ShieldCheck,
  Activity,
  ChevronRight,
  Copy,
  Ruler,
  Compass,
  ExternalLink,
  Send,
  Loader2,
  Scale,
  CheckCircle2,
  HelpCircle,
  Cpu,
} from "lucide-react";
import {
  PlanVerificationResponse,
  PlanVerificationRequest,
} from "@/types/cadastre";
import { getVerdict } from "@/utils/records";
import { useLanguage } from "@/i18n/LanguageContext";
import { apiFetch } from "@/utils/api";

interface ForensicDossierPanelProps {
  result: PlanVerificationResponse | null;
  request: PlanVerificationRequest | null;
  isLoading: boolean;
  onDownloadPdf: () => void;
  isDownloadingPdf: boolean;
  selectedBorneId?: string | null;
  onSelectBorne?: (borneId: string | null) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface QAMessage {
  id: string;
  question: string;
  answer: string;
  recommendations: string[];
  legal_references: string[];
  ai_engine: string;
  risk_level?: string;
  timestamp: string;
}

export default function ForensicDossierPanel({
  result,
  request,
  isLoading,
  onDownloadPdf,
  isDownloadingPdf,
  selectedBorneId,
  onSelectBorne,
  isCollapsed,
  onToggleCollapse,
}: ForensicDossierPanelProps) {
  const { language, t } = useLanguage();
  const isEn = language === "en";

  const [activeTab, setActiveTab] = useState<"synthese" | "bornes" | "ia">("synthese");
  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // AI Analyst state
  const [qaHistory, setQaHistory] = useState<QAMessage[]>([]);
  const [customQuestion, setCustomQuestion] = useState("");
  const [isAskingAi, setIsAskingAi] = useState(false);
  const [initialDiagnosis, setInitialDiagnosis] = useState<QAMessage | null>(null);
  const [isLoadingDiagnosis, setIsLoadingDiagnosis] = useState(false);
  const [diagnosisError, setDiagnosisError] = useState<string | null>(null);
  const [askError, setAskError] = useState<string | null>(null);
  const [isLocalDownloading, setIsLocalDownloading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const isDownloading = isDownloadingPdf || isLocalDownloading;

  // Load initial AI forensic diagnosis when a new plan is loaded
  useEffect(() => {
    if (!result || !request) return;

    let isSubscribed = true;
    setIsLoadingDiagnosis(true);
    setDiagnosisError(null);
    setAskError(null);

    async function loadInitialDiagnosis() {
      try {
        const defaultQ = isEn
          ? "Is this parcel safe to purchase and what does the geodetic audit indicate?"
          : "Ce terrain est-il sûr à l'achat et qu'indique l'audit géodésique ?";

        const res = await apiFetch("/api/ai/qa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan_id: result?.plan_id,
            question: defaultQ,
            language: isEn ? "en" : "fr",
            request_data: request,
            verification_data: result,
          }),
        });

        if (res.ok && isSubscribed) {
          const data = await res.json();
          const diagnosisMsg: QAMessage = {
            id: `diag-${Date.now()}`,
            question: defaultQ,
            answer: data.answer,
            recommendations: data.recommendations || [],
            legal_references: data.legal_references || [],
            ai_engine: data.ai_engine || "Cadastra Geodetic Forensic Engine",
            risk_level: data.risk_level,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          setInitialDiagnosis(diagnosisMsg);
        } else if (isSubscribed) {
          setDiagnosisError(
            isEn
              ? "Automated AI diagnosis unavailable."
              : "Diagnostic IA automatisé non disponible."
          );
        }
      } catch (err) {
        if (isSubscribed) {
          setDiagnosisError(
            isEn
              ? "AI reasoning server unreachable."
              : "Serveur d'analyse IA injoignable."
          );
        }
      } finally {
        if (isSubscribed) {
          setIsLoadingDiagnosis(false);
        }
      }
    }

    loadInitialDiagnosis();
    return () => {
      isSubscribed = false;
    };
  }, [result, request, isEn]);

  const handleAskQuestion = async (queryText?: string) => {
    const q = (queryText ?? customQuestion).trim();
    if (!q || !result || isAskingAi) return;

    setIsAskingAi(true);
    setAskError(null);
    if (!queryText) setCustomQuestion("");

    try {
      const res = await apiFetch("/api/ai/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: result.plan_id,
          question: q,
          language: isEn ? "en" : "fr",
          request_data: request,
          verification_data: result,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const newMsg: QAMessage = {
          id: `qa-${Date.now()}`,
          question: q,
          answer: data.answer,
          recommendations: data.recommendations || [],
          legal_references: data.legal_references || [],
          ai_engine: data.ai_engine || "Cadastra Geodetic Forensic Engine",
          risk_level: data.risk_level,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setQaHistory((prev) => [...prev, newMsg]);
        setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      } else {
        setAskError(
          isEn
            ? "AI reasoning request failed. Please check connection."
            : "Échec de l'analyse IA. Vérifiez la connexion au serveur."
        );
      }
    } catch (err: any) {
      console.error("AI QA request failed:", err);
      setAskError(
        isEn
          ? "Unable to reach AI reasoning server."
          : "Serveur d'analyse IA injoignable."
      );
    } finally {
      setIsAskingAi(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full rounded-2xl bg-[#0B0E14]/95 backdrop-blur-2xl border border-white/[0.08] p-6 flex flex-col justify-center items-center text-center shadow-2xl">
        <div className="w-9 h-9 rounded-full border-2 border-[#00DF8F] border-t-transparent animate-spin mb-3.5" />
        <p className="text-sm font-mono text-zinc-300">
          {isEn
            ? "Computing Gauss-Shoelace geodetic projection..."
            : "Calcul géodésique Gauss-Shoelace en cours..."}
        </p>
      </div>
    );
  }

  if (!result || !request) {
    return (
      <div className="w-full h-full rounded-2xl bg-[#0B0E14]/95 backdrop-blur-2xl border border-white/[0.08] p-6 flex flex-col justify-center items-center text-center space-y-3.5 shadow-2xl">
        <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
          <Activity className="w-6 h-6 text-[#00DF8F]" />
        </div>
        <div>
          <p className="text-base font-semibold text-white">{t.waitingForPlan}</p>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs leading-relaxed">
            {t.waitingForPlanDesc}
          </p>
        </div>
      </div>
    );
  }

  const verdict = getVerdict(result);
  const isFraud = verdict.tone === "danger";
  const isValid = verdict.tone === "success";
  const isAnomaly = verdict.tone === "warning";

  const handleShare = () => {
    const summary = `[CADASTRA-CAMEROON · ${isEn ? "GEODETIC AUDIT" : "AUDIT GÉODÉSIQUE"}]\nPlan: ${result.plan_id} (${request.title_number || (isEn ? "Title in progress" : "Titre en cours")})\n${isEn ? "Locality" : "Localité"}: ${request.locality}\n${isEn ? "Stated Area" : "Surface Déclarée"}: ${result.stated_area_sqm} m²\n${isEn ? "Computed Area" : "Surface Calculée"}: ${result.computed_area_sqm} m²\n${isEn ? "Discrepancy" : "Écart"}: ${result.discrepancy_percentage.toFixed(2)}%\nVerdict: ${isFraud ? (isEn ? "CRITICAL FRAUD" : "FRAUDE SUPERFICIE FICTIVE") : isAnomaly ? (isEn ? "TOPOLOGICAL ANOMALY" : "ANOMALIE TOPOLOGIQUE") : (isEn ? "COMPLIANT" : "CONFORME")}\nSHA-256: ${result.verification_hash}`;
    navigator.clipboard.writeText(summary);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(result.verification_hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const riskScore = Math.round(result.risk_score);

  const suggestedPrompts = [
    t.aiSuggestedPrompt1,
    t.aiSuggestedPrompt2,
    t.aiSuggestedPrompt3,
    t.aiSuggestedPrompt4,
  ];

  return (
    <div className="w-full h-full rounded-2xl bg-[#0B0E14]/95 backdrop-blur-2xl border border-white/[0.08] flex flex-col justify-between overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] font-sans">
      {/* 1. TOP HEADER & SEGMENTED TABS */}
      <div className="p-4 sm:p-5 pb-3 space-y-3.5 border-b border-white/[0.06]">
        {/* Title, Badge & Minimize Toggle */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                Plan {result.plan_id}
              </h2>
              <span
                className={`text-xs font-medium shrink-0 ${
                  isFraud
                    ? "text-[#F04444]"
                    : isAnomaly
                    ? "text-[#F5B544]"
                    : "text-[#00DF8F]"
                }`}
              >
                {isFraud
                  ? (isEn ? "High Risk" : "Risque élevé")
                  : isAnomaly
                  ? (isEn ? "Anomaly" : "Anomalie")
                  : (isEn ? "Compliant" : "Conforme")}
              </span>
            </div>

            {request.title_number && (
              <p className="text-xs font-mono text-zinc-400 mt-0.5 truncate">
                {request.title_number}
              </p>
            )}
          </div>

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              title={isEn ? "Hide analysis panel" : "Masquer le panneau d'analyse"}
              className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.08] transition shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 3 Focused High-Signal Tabs: Synthesis, Beacons, and AI Analyst */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-[10px] bg-white/[0.03] border border-white/[0.06]">
          <button
            type="button"
            onClick={() => setActiveTab("synthese")}
            className={`py-2 px-2.5 rounded-md text-xs font-medium transition text-center truncate ${
              activeTab === "synthese"
                ? "bg-white text-zinc-950 shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {t.tabSynthesis}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("bornes")}
            className={`py-2 px-2.5 rounded-md text-xs font-medium transition text-center truncate ${
              activeTab === "bornes"
                ? "bg-white text-zinc-950 shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {t.tabBeacons} ({result.beacons_wgs84.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ia")}
            className={`py-2 px-2.5 rounded-md text-xs font-medium transition text-center truncate flex items-center justify-center gap-1.5 ${
              activeTab === "ia"
                ? "bg-white text-zinc-950 shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Cpu className="w-3.5 h-3.5 shrink-0" />
            <span>{t.tabAiAnalyst}</span>
          </button>
        </div>
      </div>

      {/* 2. SCROLLABLE TAB CONTENT */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
        {/* SYNTHESIS TAB */}
        {activeTab === "synthese" && (
          <>
            {/* Stated vs Computed Area Comparison Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col justify-between">
                <span className="text-xs font-medium text-zinc-400">
                  {t.statedArea}
                </span>
                <span className="text-lg sm:text-xl font-bold font-mono text-white mt-1">
                  {result.stated_area_sqm.toLocaleString()} <span className="text-xs font-normal text-zinc-400">m²</span>
                </span>
                <span className="text-[11px] text-zinc-500 mt-1">
                  {isEn ? "Stated on survey sheet" : "Mentionnée sur le plan"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col justify-between">
                <span className="text-xs font-medium text-zinc-400">
                  {t.computedArea}
                </span>
                <span
                  className={`text-lg sm:text-xl font-bold font-mono mt-1 ${
                    isValid ? "text-[#00DF8F]" : "text-white"
                  }`}
                >
                  {result.computed_area_sqm.toLocaleString()} <span className="text-xs font-normal text-zinc-400">m²</span>
                </span>
                <span className="text-[11px] text-zinc-500 mt-1">
                  Gauss-Shoelace WGS84
                </span>
              </div>
            </div>

            {/* Geodetic Discrepancy & Tolerance Row */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-zinc-300">{t.discrepancy}</span>
                <span
                  className={`font-mono font-bold text-sm ${
                    isFraud ? "text-red-400" : "text-[#00DF8F]"
                  }`}
                >
                  {result.discrepancy_sqm > 0 ? "+" : ""}
                  {Math.round(result.discrepancy_sqm).toLocaleString()} m² (
                  {result.discrepancy_percentage > 0 ? "+" : ""}
                  {result.discrepancy_percentage.toFixed(2)}%)
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.04]">
                <span className="font-medium text-zinc-400">
                  {isEn ? "Geodetic tolerance" : "Tolérance géodésique"}
                </span>
                <span
                  className={`font-semibold ${
                    result.tolerance_passed ? "text-[#00DF8F]" : "text-red-400"
                  }`}
                >
                  {result.tolerance_passed
                    ? (isEn ? "Within legal tolerance (≤ 1%)" : "Seuil respecté (≤ 1%)")
                    : (isEn ? "Exceeds tolerance (> 1%)" : "Seuil dépassé (> 1%)")}
                </span>
              </div>
            </div>

            {/* Geodetic Verdict & Risk Score Card */}
            <div
              className={`p-4 rounded-xl space-y-3 border ${
                isFraud
                  ? "bg-red-500/[0.07] border-red-500/25"
                  : isAnomaly
                  ? "bg-amber-500/[0.07] border-amber-500/25"
                  : "bg-[#00DF8F]/[0.06] border-[#00DF8F]/20"
              }`}
            >
              <div className="flex items-start gap-2.5">
                {isFraud ? (
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                ) : isAnomaly ? (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-[#00DF8F] shrink-0 mt-0.5" />
                )}

                <div className="space-y-1">
                  <h4
                    className={`text-sm font-bold tracking-tight ${
                      isFraud
                        ? "text-red-300"
                        : isAnomaly
                        ? "text-amber-300"
                        : "text-white"
                    }`}
                  >
                    {isFraud
                      ? (isEn ? "Fictitious Surface Detected" : "Superficie fictive détectée")
                      : isAnomaly
                      ? (isEn ? "Topological Anomaly" : "Anomalie géométrique")
                      : (isEn ? "Plan Matches Verified Coordinates" : "Plan conforme aux coordonnées")}
                  </h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {isFraud
                      ? (isEn
                          ? `The computed ground area (${result.computed_area_sqm.toLocaleString()} m²) is substantially lower than declared (${result.stated_area_sqm.toLocaleString()} m²). The discrepancy of ${result.discrepancy_percentage.toFixed(1)}% indicates fictitious surface inflation.`
                          : `La superficie géodésique calculée (${result.computed_area_sqm.toLocaleString()} m²) est inférieure à la superficie déclarée (${result.stated_area_sqm.toLocaleString()} m²). L'écart de ${result.discrepancy_percentage.toFixed(1)}% constitue une anomalie foncière.`)
                      : isAnomaly
                      ? (isEn
                          ? "The polygon boundary self-intersects or perimeter closure vectors fail geodetic precision standards."
                          : "Les segments du polygone se croisent ou le périmètre cadastral est géométriquement invalide.")
                      : (isEn
                          ? "UTM boundary coordinates concord with stated area within standard geodetic margin of error."
                          : "Les coordonnées UTM concordent avec la surface déclarée dans la marge d'erreur géodésique standard.")}
                  </p>
                </div>
              </div>

              {/* Risk Score Progress */}
              <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-medium">{t.riskScore}</span>
                  <span
                    className={`font-mono font-bold ${
                      isFraud ? "text-red-400" : isAnomaly ? "text-amber-400" : "text-[#00DF8F]"
                    }`}
                  >
                    {riskScore} / 100
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-sm bg-white/[0.08] overflow-hidden">
                  <div
                    className={`h-full rounded-sm transition-all duration-500 ${
                      isFraud ? "bg-red-400" : isAnomaly ? "bg-amber-400" : "bg-[#00DF8F]"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(4, riskScore))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Essential Cadastral Metadata */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 font-medium">{isEn ? "Locality" : "Localité"}</span>
                <span className="text-zinc-200 font-semibold">{request.locality}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 font-medium">{isEn ? "Projection" : "Projection géodésique"}</span>
                <span className="text-zinc-300 font-mono font-medium">{result.epsg_code} ({result.utm_zone})</span>
              </div>
              {request.surveyor_name && (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-medium">{isEn ? "Surveyor" : "Géomètre déclarant"}</span>
                  <span className="text-zinc-200 font-medium">{request.surveyor_name}</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* BEACONS TAB */}
        {activeTab === "bornes" && (
          <div className="space-y-3.5">
            {/* Perimeter and Self-intersection stats */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Ruler className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{t.perimeter}</span>
                </div>
                <span className="text-base font-bold font-mono text-white mt-1 block">
                  {result.perimeter_m.toFixed(1)} m
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Compass className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{t.polygonClosure}</span>
                </div>
                <span
                  className={`text-xs font-semibold mt-1 block ${
                    !result.self_intersecting ? "text-[#00DF8F]" : "text-red-400"
                  }`}
                >
                  {!result.self_intersecting ? t.selfIntersectingNo : t.selfIntersectingYes}
                </span>
              </div>
            </div>

            {/* Interactive UTM Beacons List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>{isEn ? "Boundary Beacons" : "Sommets du bornage"}</span>
                <span className="font-mono">{result.beacons_wgs84.length} {isEn ? "beacons B1..Bn" : "bornes B1..Bn"}</span>
              </div>

              <div className="space-y-1.5">
                {result.beacons_wgs84.map((b) => {
                  const isSelected = selectedBorneId === b.borne_id;
                  return (
                    <button
                      key={b.borne_id}
                      type="button"
                      onClick={() => onSelectBorne?.(b.borne_id)}
                      className={`w-full p-2.5 rounded-xl text-left transition flex items-center justify-between border ${
                        isSelected
                          ? "bg-[#00DF8F]/10 border-[#00DF8F]/40 text-white shadow-sm"
                          : "bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.06] text-zinc-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center ${
                            isSelected
                              ? "bg-[#00DF8F] text-black"
                              : "bg-white/[0.08] text-white"
                          }`}
                        >
                          {b.borne_id}
                        </span>
                        <div className="text-xs">
                          <span className="font-mono text-zinc-200">
                            X: {Math.round(b.utm_x).toLocaleString()} m
                          </span>
                          <span className="text-zinc-500 mx-1.5">|</span>
                          <span className="font-mono text-zinc-200">
                            Y: {Math.round(b.utm_y).toLocaleString()} m
                          </span>
                        </div>
                      </div>

                      <span className="text-[11px] font-mono text-zinc-400">
                        {b.latitude.toFixed(5)}°, {b.longitude.toFixed(5)}°
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cryptographic SHA-256 Fingerprint */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between text-zinc-400">
                <span>{isEn ? "SHA-256 Fingerprint" : "Empreinte SHA-256"}</span>
                <button
                  type="button"
                  onClick={handleCopyHash}
                  className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition"
                  title={isEn ? "Copy complete hash" : "Copier le hash complet"}
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedHash ? (isEn ? "Copied" : "Copié") : (isEn ? "Copy" : "Copier")}</span>
                </button>
              </div>
              <p className="text-zinc-300 text-[11px] break-all leading-tight">
                {result.verification_hash}
              </p>
            </div>
          </div>
        )}

        {/* AI FORENSIC ANALYST TAB */}
        {activeTab === "ia" && (
          <div className="space-y-4">
            {/* 1. Initial AI Forensic Diagnosis Card */}
            {isLoadingDiagnosis && (
              <div className="p-4 rounded-[10px] bg-[#10141D] border border-white/[0.08] flex items-center gap-2.5 text-xs text-zinc-400">
                <Loader2 className="w-4 h-4 text-[#00DF8F] animate-spin shrink-0" />
                <span>
                  {isEn
                    ? "Evaluating geodetic closure, boundary overlap, and statutory tolerance..."
                    : "Évaluation de la fermeture géodésique, du chevauchement et de la tolérance..."}
                </span>
              </div>
            )}

            {!isLoadingDiagnosis && diagnosisError && !initialDiagnosis && (
              <div className="p-4 rounded-[10px] bg-[#10141D] border border-white/[0.08] text-xs text-zinc-400 space-y-1">
                <p className="font-medium text-zinc-300">{diagnosisError}</p>
                <p className="text-zinc-500 leading-relaxed">
                  {isEn
                    ? "Formulate a direct query regarding coordinates or compliance using the input below."
                    : "Formulez une question directe concernant les coordonnées ou la conformité ci-dessous."}
                </p>
              </div>
            )}

            {!isLoadingDiagnosis && initialDiagnosis && (
              <div className="p-4 rounded-[10px] bg-[#10141D] border border-white/[0.08] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Scale className="w-4 h-4 text-zinc-400 shrink-0" />
                    <h3 className="text-xs font-medium text-white truncate">
                      {t.aiDiagnosisTitle}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {initialDiagnosis.risk_level && (
                      <span
                        className={`text-[11px] font-mono font-medium ${
                          initialDiagnosis.risk_level.toUpperCase() === "HIGH" ||
                          initialDiagnosis.risk_level.toUpperCase() === "CRITICAL"
                            ? "text-[#F04444]"
                            : initialDiagnosis.risk_level.toUpperCase() === "MEDIUM"
                            ? "text-[#F5B544]"
                            : "text-[#00DF8F]"
                        }`}
                      >
                        {initialDiagnosis.risk_level} {isEn ? "Risk" : "Risque"}
                      </span>
                    )}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-zinc-400 truncate max-w-[150px]">
                      {initialDiagnosis.ai_engine}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                  {initialDiagnosis.answer}
                </p>

                {/* Recommendations */}
                {initialDiagnosis.recommendations.length > 0 && (
                  <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                    <span className="text-[11px] font-medium text-zinc-300 block">
                      {t.aiRecommendationsTitle}
                    </span>
                    <ul className="space-y-1.5 text-xs text-zinc-400">
                      {initialDiagnosis.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                          <span className="leading-snug text-zinc-300">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Legal Citations */}
                {initialDiagnosis.legal_references.length > 0 && (
                  <div className="pt-2 border-t border-white/[0.06] flex items-center gap-1.5 flex-wrap text-[10px] text-zinc-400 font-mono">
                    <Scale className="w-3 h-3 text-zinc-500 shrink-0" />
                    <span>{t.aiLegalTitle}:</span>
                    {initialDiagnosis.legal_references.map((ref, idx) => (
                      <span key={idx} className="bg-white/[0.03] px-1.5 py-0.5 rounded-sm border border-white/[0.06] text-zinc-300">
                        {ref}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. Interactive Q&A Space Header */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-zinc-400" />
                <h4 className="text-xs font-semibold text-white">
                  {t.aiAskTitle}
                </h4>
              </div>

              {/* Clickable Suggestion Chips */}
              <div className="flex flex-wrap gap-1.5">
                {suggestedPrompts.map((promptText, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAskQuestion(promptText)}
                    disabled={isAskingAi}
                    className="text-xs px-2.5 py-1.5 rounded-md bg-[#10141D] hover:bg-white/[0.06] text-zinc-300 hover:text-white border border-white/[0.08] transition text-left active:scale-[0.98] disabled:opacity-50 max-w-full leading-relaxed break-words"
                  >
                    {promptText}
                  </button>
                ))}
              </div>

              {/* Chat Input Field */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAskQuestion();
                    }
                  }}
                  placeholder={t.aiAskPlaceholder}
                  disabled={isAskingAi}
                  className="flex-1 min-w-0 bg-[#10141D] border border-white/[0.08] rounded-md px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30 transition disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => handleAskQuestion()}
                  disabled={isAskingAi || !customQuestion.trim()}
                  className="px-3.5 py-2 rounded-md bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-medium transition disabled:opacity-40 flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap shadow-sm active:scale-[0.98]"
                >
                  {isAskingAi ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-950 shrink-0" />
                  ) : (
                    <Send className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span className="whitespace-nowrap shrink-0">
                    {isAskingAi ? t.askingAi : t.btnAskAi}
                  </span>
                </button>
              </div>

              {/* QA Error Notice */}
              {askError && (
                <div className="p-2.5 rounded-md bg-red-500/[0.08] border border-red-500/20 text-xs text-red-300">
                  {askError}
                </div>
              )}
            </div>

            {/* Conversation Log */}
            {(qaHistory.length > 0 || isAskingAi) && (
              <div className="space-y-2.5 pt-2">
                {qaHistory.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-3.5 rounded-[10px] bg-[#10141D] border border-white/[0.08] space-y-2 text-xs"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2 text-zinc-400">
                      <span className="font-medium text-white min-w-0">Q: {msg.question}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {msg.risk_level && (
                          <span
                            className={`text-[10px] font-mono font-medium ${
                              msg.risk_level.toUpperCase() === "HIGH" ||
                              msg.risk_level.toUpperCase() === "CRITICAL"
                                ? "text-[#F04444]"
                                : msg.risk_level.toUpperCase() === "MEDIUM"
                                ? "text-[#F5B544]"
                                : "text-[#00DF8F]"
                            }`}
                          >
                            {msg.risk_level} {isEn ? "Risk" : "Risque"}
                          </span>
                        )}
                        <span className="font-mono text-[10px] text-zinc-500">{msg.timestamp}</span>
                      </div>
                    </div>

                    <p className="text-zinc-300 leading-relaxed font-normal">
                      {msg.answer}
                    </p>

                    {msg.recommendations.length > 0 && (
                      <div className="pt-2 border-t border-white/[0.06] space-y-1">
                        <span className="text-[11px] font-medium text-zinc-300 block">
                          {t.aiRecommendationsTitle}
                        </span>
                        <ul className="space-y-1">
                          {msg.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2 text-zinc-400">
                              <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                              <span className="text-zinc-300 leading-snug">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {msg.legal_references && msg.legal_references.length > 0 && (
                      <div className="pt-2 border-t border-white/[0.06] flex items-center gap-1.5 flex-wrap text-[10px] text-zinc-400 font-mono">
                        <Scale className="w-3 h-3 text-zinc-500 shrink-0" />
                        <span>{t.aiLegalTitle}:</span>
                        {msg.legal_references.map((ref, idx) => (
                          <span key={idx} className="bg-white/[0.03] px-1.5 py-0.5 rounded-sm border border-white/[0.06] text-zinc-300">
                            {ref}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {isAskingAi && (
                  <div className="p-3 rounded-[10px] bg-[#10141D] border border-white/[0.08] flex items-center gap-2.5 text-xs text-zinc-400">
                    <Loader2 className="w-3.5 h-3.5 text-[#00DF8F] animate-spin shrink-0" />
                    <span>
                      {isEn
                        ? "Evaluating geodetic coordinates and statutory compliance..."
                        : "Évaluation des coordonnées géodésiques et de la conformité..."}
                    </span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. BOTTOM ACTION BUTTONS */}
      <div className="p-3 sm:p-4 pt-3 flex flex-wrap sm:flex-nowrap items-center gap-2 border-t border-white/[0.08] bg-[#0B0E14]">
        <a
          href={`/api/report/pdf?plan_id=${encodeURIComponent(request?.plan_id || "plan")}&disposition=attachment`}
          download={`Cadastra_Cameroon_Audit_${(request?.plan_id || "plan").replace(/[^a-zA-Z0-9_\-\.]/g, "_")}.pdf`}
          onClick={() => {
            setIsLocalDownloading(true);
            setTimeout(() => setIsLocalDownloading(false), 2500);
          }}
          className="flex-1 min-w-0 px-3 sm:px-3.5 py-2.5 rounded-md bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs transition flex items-center justify-center gap-2 whitespace-nowrap shadow-sm active:scale-[0.98]"
          title={isEn ? "Download certified PDF audit report (Bilingual EN/FR)" : "Télécharger le certificat PDF officiel d'audit (Bilingue EN/FR)"}
          aria-label="Download / Téléchargement (PDF)"
        >
          {isDownloading ? (
            <Loader2 className="w-4 h-4 text-zinc-950 animate-spin shrink-0" />
          ) : (
            <Download className="w-4 h-4 text-zinc-950 shrink-0" />
          )}
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0">
            <span className="font-semibold">Download</span>
            <span className="text-zinc-500 font-normal">/</span>
            <span className="font-medium text-zinc-800">Téléchargement</span>
          </span>
        </a>

        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href={`/api/report/pdf?plan_id=${encodeURIComponent(request?.plan_id || "plan")}&disposition=inline`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 sm:p-2.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white text-xs font-medium transition flex items-center justify-center border border-white/[0.08] whitespace-nowrap active:scale-[0.98]"
            title={isEn ? "Preview official PDF certificate in new tab" : "Aperçu du certificat PDF officiel dans un nouvel onglet"}
            aria-label={t.btnPreviewPdf}
          >
            <ExternalLink className="w-4 h-4 text-zinc-400 shrink-0" />
          </a>

          <button
            type="button"
            onClick={handleShare}
            className="p-2 sm:p-2.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white text-xs font-medium transition flex items-center justify-center border border-white/[0.08] whitespace-nowrap active:scale-[0.98]"
            title={isEn ? "Copy audit summary" : "Copier le résumé d'audit"}
            aria-label={t.btnShare}
          >
            {copiedShare ? (
              <Check className="w-4 h-4 text-[#00DF8F] shrink-0" />
            ) : (
              <Share2 className="w-4 h-4 text-zinc-400 shrink-0" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
