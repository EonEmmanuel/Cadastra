"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Download,
  Share2,
  FileText,
  CheckCircle,
  XCircle,
  Hash,
  ExternalLink,
} from "lucide-react";
import { PlanVerificationResponse, PlanVerificationRequest } from "@/types/cadastre";

interface VerificationPanelProps {
  result: PlanVerificationResponse | null;
  request: PlanVerificationRequest | null;
  isLoading: boolean;
  onDownloadPdf: () => void;
  isDownloadingPdf: boolean;
}

export default function VerificationPanel({
  result,
  request,
  isLoading,
  onDownloadPdf,
  isDownloadingPdf,
}: VerificationPanelProps) {
  const [lang, setLang] = useState<"fr" | "en">("fr");

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse space-y-4">
        <div className="h-14 bg-slate-100 rounded-lg" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 bg-slate-100 rounded-lg" />
          <div className="h-20 bg-slate-100 rounded-lg" />
        </div>
        <div className="h-32 bg-slate-100 rounded-lg" />
      </div>
    );
  }

  if (!result || !request) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center space-y-3">
        <FileText className="w-12 h-12 text-slate-300 mx-auto" />
        <h4 className="font-bold text-slate-700">Aucun plan chargé</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Sélectionnez un profil test ci-dessus ou saisissez manuellement les coordonnées des bornes pour lancer l&apos;audit géodésique.
        </p>
      </div>
    );
  }

  const isFraud = result.superficie_fictive_detected || result.risk_level === "CRITICAL_FRAUD" || result.risk_level === "HIGH";

  // Score color
  let scoreColor = "bg-emerald-500";
  if (result.risk_score > 60) scoreColor = "bg-red-600";
  else if (result.risk_score > 25) scoreColor = "bg-amber-500";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
      {/* 1. Verdict Banner */}
      <div
        className={`p-5 rounded-t-xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          result.risk_level === "LOW"
            ? "bg-gradient-to-r from-emerald-700 to-emerald-800"
            : result.superficie_fictive_detected
            ? "bg-gradient-to-r from-red-700 to-red-800"
            : "bg-gradient-to-r from-amber-600 to-amber-700"
        }`}
      >
        <div className="flex items-start gap-3">
          {result.risk_level === "LOW" ? (
            <ShieldCheck className="w-8 h-8 text-emerald-200 shrink-0 mt-0.5" />
          ) : result.superficie_fictive_detected ? (
            <ShieldAlert className="w-8 h-8 text-red-200 shrink-0 mt-0.5 animate-pulse" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-amber-200 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/20">
                Audit MINDCAF {result.plan_id}
              </span>
              <span className="text-xs text-white/80">UTM Zone {result.utm_zone}</span>
            </div>
            <h3 className="text-base font-extrabold tracking-tight">
              {result.risk_level === "LOW"
                ? "PLAN CONFORME AUX NORMES CADASTRALES"
                : result.superficie_fictive_detected
                ? "ALERTE FRAUDE : SUPERFICIE FICTIVE DÉTECTÉE"
                : "ANOMALIE GÉOMÉTRIQUE IDENTIFIÉE"}
            </h3>
            <p className="text-xs text-white/90 mt-0.5">
              {result.risk_level === "LOW"
                ? "Tolérance légale respectée · Coordonnées géodésiques validées."
                : result.superficie_fictive_detected
                ? `Surévaluation frauduleuse de +${result.discrepancy_sqm.toLocaleString()} m² (+${result.discrepancy_percentage.toFixed(1)}% au-delà des bornes).`
                : "Les limites de bornage contiennent des irrégularités topologiques."}
            </p>
          </div>
        </div>

        <button
          onClick={onDownloadPdf}
          disabled={isDownloadingPdf}
          className="shrink-0 px-4 py-2 bg-white text-slate-900 rounded-lg font-bold text-xs shadow-md hover:bg-slate-100 flex items-center gap-2 transition active:scale-95 disabled:opacity-50"
        >
          {isDownloadingPdf ? (
            <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download className="w-4 h-4 text-emerald-700" />
          )}
          Certificat PDF Officiel
        </button>
      </div>

      {/* 2. Core Comparative Metrics */}
      <div className="p-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Contrôle Métrique & Détection d&apos;Écart
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Stated Area */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
            <span className="text-[11px] text-slate-500 block mb-0.5">Superficie Déclarée</span>
            <span className="text-lg font-extrabold text-slate-900">
              {result.stated_area_sqm.toLocaleString()} <span className="text-xs font-normal text-slate-500">m²</span>
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">Mentionnée sur papier</span>
          </div>

          {/* Computed Area */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
            <span className="text-[11px] text-slate-500 block mb-0.5">Superficie Calculée</span>
            <span className={`text-lg font-extrabold ${isFraud ? "text-red-700" : "text-emerald-700"}`}>
              {result.computed_area_sqm.toLocaleString()} <span className="text-xs font-normal text-slate-500">m²</span>
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">Formule Shoelace UTM</span>
          </div>

          {/* Discrepancy */}
          <div className={`p-3 rounded-lg border ${result.tolerance_passed ? "bg-emerald-50/50 border-emerald-200" : "bg-red-50/50 border-red-200"}`}>
            <span className="text-[11px] text-slate-500 block mb-0.5">Écart de Surface</span>
            <span className={`text-lg font-extrabold ${result.tolerance_passed ? "text-emerald-700" : "text-red-700"}`}>
              {result.discrepancy_percentage > 0 ? (result.stated_area_sqm > result.computed_area_sqm ? "+" : "-") : ""}
              {result.discrepancy_sqm.toLocaleString()} <span className="text-xs font-normal">m²</span>
            </span>
            <span className="text-[10px] font-semibold block mt-1">
              ({result.discrepancy_percentage.toFixed(2)}% écart)
            </span>
          </div>

          {/* Legal Tolerance Status */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex flex-col justify-between">
            <div>
              <span className="text-[11px] text-slate-500 block mb-0.5">Tolérance Légale</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {result.tolerance_passed ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-xs font-bold ${result.tolerance_passed ? "text-emerald-700" : "text-red-700"}`}>
                  {result.tolerance_passed ? "CONFORME" : "NON-CONFORME"}
                </span>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 mt-1">Norme MINDCAF 1.0%</span>
          </div>
        </div>

        {/* Risk Score Meter */}
        <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              Indice de Risque Foncier (0 à 100) :
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                result.risk_level === "LOW" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
              }`}>
                {result.risk_level}
              </span>
            </span>
            <span className="font-mono font-bold text-slate-900">{result.risk_score} / 100</span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${scoreColor} transition-all duration-500`}
              style={{ width: `${Math.min(100, Math.max(5, result.risk_score))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Fraud Indicators & Alerts */}
      {result.fraud_indicators.length > 0 && (
        <div className="p-5 bg-red-50/40">
          <h4 className="text-xs font-bold uppercase tracking-wider text-red-800 mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            Anomalies & Indices de Falsification Détectés ({result.fraud_indicators.length})
          </h4>
          <ul className="space-y-1.5 text-xs text-red-900">
            {result.fraud_indicators.map((ind, i) => (
              <li key={i} className="flex items-start gap-2 bg-white/80 p-2 rounded border border-red-200">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                <span>{ind}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 4. Recommendations & Advisory */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Avis Technique & Recommandations Juridiques
          </h4>
          <div className="flex items-center gap-1 text-[11px] bg-slate-100 p-0.5 rounded-md">
            <button
              onClick={() => setLang("fr")}
              className={`px-2 py-0.5 rounded font-bold ${lang === "fr" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}
            >
              Français
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-2 py-0.5 rounded font-bold ${lang === "en" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}
            >
              English
            </button>
          </div>
        </div>

        <ul className="space-y-2 text-xs text-slate-700">
          {(lang === "fr" ? result.recommendations_fr : result.recommendations_en).map((rec, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
              <span>{rec}</span>
            </li>
          ))}
        </ul>

        {/* Cryptographic Hash */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1 font-mono truncate max-w-md">
            <Hash className="w-3 h-3 shrink-0" />
            <span className="truncate">Empreinte SHA-256 : {result.verification_hash}</span>
          </div>
          <span>{result.timestamp.slice(0, 19)} UTC</span>
        </div>
      </div>
    </div>
  );
}
