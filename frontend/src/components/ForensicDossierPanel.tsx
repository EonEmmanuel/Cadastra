"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import {
  PlanVerificationResponse,
  PlanVerificationRequest,
} from "@/types/cadastre";
import { getVerdict } from "@/utils/records";

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
  const [activeTab, setActiveTab] = useState<"synthese" | "bornes">("synthese");
  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  if (isLoading) {
    return (
      <div className="w-full h-full rounded-2xl bg-[#040711]/90 backdrop-blur-2xl border border-white/[0.08] p-6 flex flex-col justify-center items-center text-center shadow-2xl">
        <div className="w-9 h-9 rounded-full border-2 border-[#60A5FA] border-t-transparent animate-spin mb-3.5" />
        <p className="text-sm font-mono text-zinc-300">
          Calcul géodésique Gauss-Shoelace en cours...
        </p>
      </div>
    );
  }

  if (!result || !request) {
    return (
      <div className="w-full h-full rounded-2xl bg-[#040711]/90 backdrop-blur-2xl border border-white/[0.08] p-6 flex flex-col justify-center items-center text-center space-y-3.5 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
          <Activity className="w-6 h-6 text-[#60A5FA]" />
        </div>
        <div>
          <p className="text-base font-semibold text-white">En attente d&apos;un plan cadastral</p>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs leading-relaxed">
            Importez un plan de bornage ou saisissez les coordonnées pour générer l&apos;audit géodésique.
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
    const summary = `[CADASTRA-CAMEROON · AUDIT GÉODÉSIQUE]\nPlan: ${result.plan_id} (${request.title_number || "Titre en cours"})\nLocalité: ${request.locality}\nSurface Déclarée: ${result.stated_area_sqm} m²\nSurface Calculée: ${result.computed_area_sqm} m²\nÉcart: ${result.discrepancy_percentage.toFixed(2)}%\nVerdict: ${verdict.label.toUpperCase()}\nEmpreinte SHA-256: ${result.verification_hash}`;
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

  return (
    <div className="w-full h-full rounded-2xl bg-[#040711]/90 backdrop-blur-2xl border border-white/[0.08] flex flex-col justify-between overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] font-sans">
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
                className={`px-3 py-0.5 rounded-full text-xs font-semibold tracking-wide shrink-0 ${
                  isFraud
                    ? "bg-red-500/15 text-red-400 border border-red-500/30"
                    : isAnomaly
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                }`}
              >
                {isFraud ? "Risque élevé" : isAnomaly ? "Anomalie" : "Conforme"}
              </span>
            </div>

            {request.title_number && (
              <p className="text-xs font-mono text-[#93C5FD] mt-0.5 truncate">
                {request.title_number}
              </p>
            )}
          </div>

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              title="Masquer le panneau d'analyse"
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] transition shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 2 Focused High-Signal Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <button
            type="button"
            onClick={() => setActiveTab("synthese")}
            className={`py-2 px-3 rounded-lg text-xs font-semibold transition text-center truncate ${
              activeTab === "synthese"
                ? "bg-white text-zinc-950 shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Synthèse d&apos;audit
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("bornes")}
            className={`py-2 px-3 rounded-lg text-xs font-semibold transition text-center truncate ${
              activeTab === "bornes"
                ? "bg-white text-zinc-950 shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Bornes UTM ({result.beacons_wgs84.length})
          </button>
        </div>
      </div>

      {/* 2. SCROLLABLE TAB CONTENT (High-Signal, Clear Typography) */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
        {activeTab === "synthese" && (
          <>
            {/* Stated vs Computed Area Comparison Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Surface Déclarée */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col justify-between">
                <span className="text-xs font-medium text-zinc-400">
                  Surface déclarée
                </span>
                <span className="text-lg sm:text-xl font-bold font-mono text-white mt-1">
                  {result.stated_area_sqm.toLocaleString()} <span className="text-xs font-normal text-zinc-400">m²</span>
                </span>
                <span className="text-[11px] text-zinc-500 mt-1">
                  Mentionnée sur le plan
                </span>
              </div>

              {/* Surface Calculée */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col justify-between">
                <span className="text-xs font-medium text-zinc-400">
                  Surface calculée
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
                <span className="font-medium text-zinc-300">Écart de superficie</span>
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
                <span className="font-medium text-zinc-400">Tolérance géodésique</span>
                <span
                  className={`font-semibold ${
                    result.tolerance_passed ? "text-[#00DF8F]" : "text-red-400"
                  }`}
                >
                  {result.tolerance_passed ? "Seuil respecté (≤ 1%)" : "Seuil dépassé (> 1%)"}
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
                  : "bg-[#3B82F6]/[0.08] border-[#60A5FA]/25"
              }`}
            >
              <div className="flex items-start gap-2.5">
                {isFraud ? (
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                ) : isAnomaly ? (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-[#60A5FA] shrink-0 mt-0.5" />
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
                      ? "Superficie fictive détectée"
                      : isAnomaly
                      ? "Anomalie géométrique"
                      : "Plan conforme aux coordonnées"}
                  </h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {isFraud
                      ? `La superficie géodésique calculée (${result.computed_area_sqm.toLocaleString()} m²) est inférieure à la superficie déclarée (${result.stated_area_sqm.toLocaleString()} m²). L'écart de ${result.discrepancy_percentage.toFixed(1)}% constitue une anomalie foncière.`
                      : isAnomaly
                      ? "Les segments du polygone se croisent ou le périmètre cadastral est géométriquement invalide."
                      : "Les coordonnées UTM concordent avec la surface déclarée dans la marge d'erreur géodésique standard."}
                  </p>
                </div>
              </div>

              {/* Risk Score Progress */}
              <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-medium">Indice de risque foncier</span>
                  <span
                    className={`font-mono font-bold ${
                      isFraud ? "text-red-400" : isAnomaly ? "text-amber-400" : "text-[#60A5FA]"
                    }`}
                  >
                    {riskScore} / 100
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isFraud ? "bg-red-400" : isAnomaly ? "bg-amber-400" : "bg-[#60A5FA]"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(4, riskScore))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Essential Cadastral Metadata */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 font-medium">Localité</span>
                <span className="text-zinc-200 font-semibold">{request.locality}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 font-medium">Projection géodésique</span>
                <span className="text-[#93C5FD] font-mono font-medium">{result.epsg_code} ({result.utm_zone})</span>
              </div>
              {request.surveyor_name && (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-medium">Géomètre déclarant</span>
                  <span className="text-zinc-200 font-medium">{request.surveyor_name}</span>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "bornes" && (
          <div className="space-y-3.5">
            {/* Perimeter and Self-intersection stats */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Ruler className="w-3.5 h-3.5 text-[#60A5FA]" />
                  <span>Périmètre total</span>
                </div>
                <span className="text-base font-bold font-mono text-white mt-1 block">
                  {result.perimeter_m.toFixed(1)} m
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Compass className="w-3.5 h-3.5 text-[#60A5FA]" />
                  <span>Topologie</span>
                </div>
                <span
                  className={`text-xs font-semibold mt-1 block ${
                    !result.self_intersecting ? "text-[#00DF8F]" : "text-red-400"
                  }`}
                >
                  {!result.self_intersecting ? "Polygone régulier" : "Intersection"}
                </span>
              </div>
            </div>

            {/* Interactive UTM Beacons List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Sommets du bornage</span>
                <span className="font-mono">{result.beacons_wgs84.length} bornes B1..Bn</span>
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
                          ? "bg-[#3B82F6]/15 border-[#60A5FA] text-white shadow-md shadow-blue-500/10"
                          : "bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.06] text-zinc-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center ${
                            isSelected
                              ? "bg-[#60A5FA] text-black"
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
                <span>Empreinte SHA-256</span>
                <button
                  type="button"
                  onClick={handleCopyHash}
                  className="flex items-center gap-1 text-[11px] text-[#93C5FD] hover:text-white transition"
                  title="Copier le hash complet"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedHash ? "Copié" : "Copier"}</span>
                </button>
              </div>
              <p className="text-zinc-300 text-[11px] break-all leading-tight">
                {result.verification_hash}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. BOTTOM ACTION BUTTONS */}
      <div className="p-4 sm:p-5 pt-3 flex items-center gap-2.5 border-t border-white/[0.06] bg-[#040711]">
        <button
          type="button"
          onClick={onDownloadPdf}
          disabled={isDownloadingPdf}
          className="flex-1 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-semibold text-xs tracking-tight transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-zinc-950" />
          <span>
            {isDownloadingPdf ? "Génération..." : "Télécharger le rapport d'audit"}
          </span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 text-xs font-medium transition flex items-center gap-1.5 border border-white/[0.08]"
          title="Copier le résumé d'audit"
        >
          {copiedShare ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Copié</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-zinc-300" />
              <span>Partager</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
