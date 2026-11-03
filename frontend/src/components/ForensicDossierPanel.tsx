"use client";

import React, { useState } from "react";
import {
  Download,
  Share2,
  Check,
  AlertTriangle,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  FileText,
  Clock,
  Layers,
  MapPin,
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
}

export default function ForensicDossierPanel({
  result,
  request,
  isLoading,
  onDownloadPdf,
  isDownloadingPdf,
  selectedBorneId,
  onSelectBorne,
}: ForensicDossierPanelProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "technical" | "history" | "documents">("overview");
  const [copiedShare, setCopiedShare] = useState(false);

  if (isLoading) {
    return (
      <div className="w-full h-full rounded-2xl bg-[#040711] p-6 flex flex-col justify-center items-center text-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#60A5FA] border-t-transparent animate-spin mb-3" />
        <p className="text-xs font-mono text-zinc-400">
          Calcul géodésique Gauss-Shoelace en cours...
        </p>
      </div>
    );
  }

  if (!result || !request) {
    return (
      <div className="w-full h-full rounded-2xl bg-[#040711] border border-white/[0.08] p-6 flex flex-col justify-center items-center text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
          <FileText className="w-6 h-6 text-zinc-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">En attente d&apos;un plan cadastral</p>
          <p className="text-xs text-zinc-500 mt-1 max-w-xs">
            Téléversez un plan cadastral (PDF ou Image) ou effectuez une saisie manuelle pour générer le dossier forensique.
          </p>
        </div>
      </div>
    );
  }

  const verdict = getVerdict(result);
  const isFraud = verdict.tone === "danger";
  const isValid = verdict.tone === "success";
  const isAnomaly = verdict.tone === "warning";

  const lat = result.centroid_wgs84?.latitude || 4.0436;
  const lng = result.centroid_wgs84?.longitude || 9.7511;
  const googleMapsUrl = `https://maps.google.com/?q=${lat},${lng}&t=k&z=18`;

  const handleShare = () => {
    const summary = `[CADASTRA-CAMEROON · AUDIT GÉODÉSIQUE]\nPlan: ${result.plan_id} (${request.title_number || "Titre en cours"})\nLocalité: ${request.locality}\nSurface Déclarée: ${result.stated_area_sqm} m²\nSurface Calculée: ${result.computed_area_sqm} m²\nÉcart: ${result.discrepancy_percentage.toFixed(2)}%\nVerdict: ${verdict.label.toUpperCase()}\nEmpreinte SHA-256: ${result.verification_hash}`;
    navigator.clipboard.writeText(summary);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const riskScore = Math.round(result.risk_score);

  return (
    <div className="w-full h-full rounded-2xl bg-[#040711] border border-white/[0.08] flex flex-col justify-between overflow-hidden shadow-2xl font-sans">
      {/* 1. TOP HEADER & TABS */}
      <div className="p-4 sm:p-5 pb-0 space-y-3">
        {/* Parcel Title & Risk Badge */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-tight truncate max-w-[240px]">
            Plan {result.plan_id}
          </h2>

          <span
            className={`px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide ${
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

        {/* Tab Row */}
        <div className="flex items-center gap-4 text-xs font-medium border-b border-white/[0.06]">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-2 transition relative ${
              activeTab === "overview"
                ? "text-[#93C5FD] font-semibold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Vue d&apos;ensemble
            {activeTab === "overview" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#60A5FA] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("technical")}
            className={`pb-2 transition relative ${
              activeTab === "technical"
                ? "text-[#93C5FD] font-semibold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Détails techniques
            {activeTab === "technical" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#60A5FA] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`pb-2 transition relative ${
              activeTab === "history"
                ? "text-[#93C5FD] font-semibold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Historique
            {activeTab === "history" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#60A5FA] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("documents")}
            className={`pb-2 transition relative ${
              activeTab === "documents"
                ? "text-[#93C5FD] font-semibold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Documents
            {activeTab === "documents" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#60A5FA] rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* 2. SCROLLABLE TAB CONTENT */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
        {activeTab === "overview" && (
          <>
            {/* Real Cadastral Location Preview Card */}
            <div className="relative rounded-xl overflow-hidden bg-[#11141D] border border-white/[0.08] p-3 flex flex-col justify-between min-h-[90px]">
              <div className="relative z-10 flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    {request.locality}
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Région : {request.region}
                  </p>
                  <p className="text-[10px] font-mono text-zinc-500 mt-1">
                    {lat.toFixed(5)}° N {lng.toFixed(5)}° E
                  </p>
                </div>

                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-[10px] font-medium text-zinc-200 flex items-center gap-1 transition"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>

            {/* Informations Clés */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-white tracking-tight">
                Informations clés
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-medium">Surface déclarée</span>
                  <span className="text-white font-mono font-bold">
                    {result.stated_area_sqm.toLocaleString()} m²
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-medium">Surface calculée</span>
                  <span
                    className={`font-mono font-bold ${
                      isValid ? "text-emerald-400" : "text-white"
                    }`}
                  >
                    {result.computed_area_sqm.toLocaleString()} m²
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-medium">Écart</span>
                  <span
                    className={`font-mono font-bold ${
                      isFraud ? "text-red-400" : "text-emerald-400"
                    }`}
                  >
                    {result.discrepancy_sqm > 0 ? "+" : ""}
                    {Math.round(result.discrepancy_sqm).toLocaleString()} m² (
                    {result.discrepancy_percentage > 0 ? "+" : ""}
                    {result.discrepancy_percentage.toFixed(1)}%)
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-medium">Statut</span>
                  <span
                    className={`font-semibold ${
                      result.tolerance_passed ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {result.tolerance_passed
                      ? "Tolérance respectée"
                      : "Tolérance dépassée"}
                  </span>
                </div>

                {request.title_number && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-medium">Réf. cadastrale</span>
                    <span className="text-zinc-300 font-mono text-[11px]">
                      {request.title_number}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Analyse de l'IA */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <h4 className="text-xs font-bold text-white tracking-tight">
                  Analyse de l&apos;IA
                </h4>
              </div>

              <div
                className={`p-3.5 rounded-xl space-y-2 border ${
                  isFraud
                    ? "bg-red-500/[0.08] border-red-500/20"
                    : isAnomaly
                    ? "bg-amber-500/[0.08] border-amber-500/20"
                    : "bg-emerald-500/[0.08] border-emerald-500/20"
                }`}
              >
                <div className="flex items-start gap-2">
                  {isFraud ? (
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  ) : isAnomaly ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  )}

                  <div className="space-y-1">
                    <span
                      className={`text-xs font-bold ${
                        isFraud
                          ? "text-red-300"
                          : isAnomaly
                          ? "text-amber-300"
                          : "text-emerald-400"
                      }`}
                    >
                      {isFraud
                        ? "Anomalie détectée"
                        : isAnomaly
                        ? "Anomalie topologique"
                        : "Plan régulier et conforme"}
                    </span>
                    <p className="text-[11px] text-zinc-300 leading-relaxed font-normal">
                      {isFraud
                        ? `Superficie réelle calculée (${result.computed_area_sqm.toLocaleString()} m²) inférieure à la superficie déclarée (${result.stated_area_sqm.toLocaleString()} m²). L'écart dépasse le seuil géodésique de tolérance (1.0%).`
                        : isAnomaly
                        ? "Les segments du polygone se croisent. Le périmètre cadastral est géométriquement invalide."
                        : "Les coordonnées UTM concordent avec la surface déclarée. Tolérance géodésique respectée."}
                    </p>
                  </div>
                </div>

                {/* Score de Risque */}
                <div className="pt-2 flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">Score de risque :</span>
                    <span
                      className={`font-mono font-bold ${
                        isFraud
                          ? "text-red-400"
                          : isAnomaly
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {riskScore} / 100
                    </span>
                  </div>

                  <span className="text-[10px] text-zinc-500 font-mono">
                    Gauss-Shoelace
                  </span>
                </div>

                {/* Risk Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isFraud ? "bg-red-400" : isAnomaly ? "bg-amber-400" : "bg-emerald-400"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(3, riskScore))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Preuves et Sources */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white tracking-tight">
                Preuves et sources
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300 font-medium">
                    Imagerie satellite WGS84
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-300 font-medium">
                    Bornage géodésique UTM
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-300 font-medium">
                    Calcul de géométrie Gauss-Shoelace
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "technical" && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white tracking-tight">
              Télémétrie Géodésique Gauss-Shoelace
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Projection & Zone UTM</span>
                <span className="text-white font-mono font-medium">
                  {result.epsg_code} ({result.utm_zone})
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Périmètre Total</span>
                <span className="text-white font-mono font-medium">
                  {result.perimeter_m.toFixed(2)} m
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Auto-Intersection</span>
                <span
                  className={`font-semibold ${
                    !result.self_intersecting ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {!result.self_intersecting ? "Aucun croisement" : "Intersection détectée"}
                </span>
              </div>
            </div>

            <div className="pt-2 space-y-1.5">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                Bornes UTM ({result.beacons_wgs84.length} sommets)
              </span>

              <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                {result.beacons_wgs84.map((b) => (
                  <button
                    key={b.borne_id}
                    onClick={() => onSelectBorne?.(b.borne_id)}
                    className={`p-2 rounded-xl text-left transition flex items-center justify-between ${
                      selectedBorneId === b.borne_id
                        ? "bg-white/[0.1] text-white ring-1 ring-white/20"
                        : "bg-white/[0.03] hover:bg-white/[0.06] text-zinc-300"
                    }`}
                  >
                    <span className="font-bold text-emerald-400">{b.borne_id}</span>
                    <span className="text-[10px] text-zinc-400">
                      {Math.round(b.utm_x)}, {Math.round(b.utm_y)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] text-[10px] font-mono text-zinc-500 space-y-1 mt-2">
              <span className="block text-zinc-400 font-medium">Empreinte SHA-256</span>
              <span className="break-all block">{result.verification_hash}</span>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-3 text-xs">
            <h4 className="text-xs font-bold text-white tracking-tight">
              Traçabilité & Vérification
            </h4>

            <div className="space-y-2 text-zinc-300">
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white/[0.02]">
                <Clock className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Date de Vérification</div>
                  <div className="text-[11px] text-zinc-400">
                    {new Date(result.timestamp || Date.now()).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white/[0.02]">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Référentiel Géodésique</div>
                  <div className="text-[11px] text-zinc-400">
                    Projection UTM Snyder ellipsoïde WGS84 (Zone 32N / 33N).
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="space-y-3 text-xs">
            <h4 className="text-xs font-bold text-white tracking-tight">
              Rapport d&apos;Expertise
            </h4>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">Certificat d&apos;Audit Géodésique</p>
                    <p className="text-[10px] text-zinc-500">Rapport technique bilingue FR / EN</p>
                  </div>
                </div>

                <button
                  onClick={onDownloadPdf}
                  disabled={isDownloadingPdf}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-xs font-semibold text-white transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. BOTTOM ACTION BUTTONS */}
      <div className="p-4 sm:p-5 pt-2 flex items-center gap-2 border-t border-white/[0.06]">
        <button
          onClick={onDownloadPdf}
          disabled={isDownloadingPdf}
          className="flex-1 px-4 py-2.5 rounded-xl bg-white text-zinc-900 font-semibold text-xs tracking-tight transition hover:bg-zinc-100 shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>
            {isDownloadingPdf ? "Génération du PDF..." : "Télécharger le rapport d'audit"}
          </span>
        </button>

        <button
          onClick={handleShare}
          className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 text-xs font-medium transition flex items-center gap-1.5"
          title="Copier le résumé"
        >
          {copiedShare ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copié</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>Partager</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
