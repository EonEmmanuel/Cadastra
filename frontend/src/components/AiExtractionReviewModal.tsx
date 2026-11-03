"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  ScanText,
  FileText,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { PlanVerificationRequest, BeaconInput, PlanExtractionPreview } from "@/types/cadastre";

interface AiExtractionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  extractedPlan: PlanVerificationRequest;
  uploadedFileName?: string;
  previewData?: PlanExtractionPreview | null;
  onConfirm: (confirmedPlan: PlanVerificationRequest) => void;
}

export default function AiExtractionReviewModal({
  isOpen,
  onClose,
  extractedPlan,
  uploadedFileName = "plan_cadastral_scan.jpg",
  previewData = null,
  onConfirm,
}: AiExtractionReviewModalProps) {
  const [locality, setLocality] = useState(extractedPlan.locality);
  const [planId, setPlanId] = useState(extractedPlan.plan_id);
  const [titleNumber, setTitleNumber] = useState(extractedPlan.title_number || "");
  const [statedArea, setStatedArea] = useState<number>(extractedPlan.stated_area_sqm);
  const [utmZone, setUtmZone] = useState<"32N" | "33N">(extractedPlan.utm_zone);
  const [beacons, setBeacons] = useState<BeaconInput[]>(extractedPlan.beacons);
  const [formError, setFormError] = useState<string | null>(null);

  // A second upload reuses this component instance: re-sync the editable form
  // with the new extraction instead of showing the previous document's values.
  useEffect(() => {
    setLocality(extractedPlan.locality);
    setPlanId(extractedPlan.plan_id);
    setTitleNumber(extractedPlan.title_number || "");
    setStatedArea(extractedPlan.stated_area_sqm);
    setUtmZone(extractedPlan.utm_zone);
    setBeacons(extractedPlan.beacons);
    setFormError(null);
  }, [extractedPlan]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleUpdateBeacon = (index: number, field: keyof BeaconInput, value: any) => {
    const updated = [...beacons];
    updated[index] = { ...updated[index], [field]: value };
    setBeacons(updated);
    setFormError(null);
  };

  const handleConfirm = () => {
    const numericBeacons = beacons.map((b) => ({
      ...b,
      x: Number(b.x),
      y: Number(b.y),
      z: b.z ? Number(b.z) : undefined,
    }));

    if (
      numericBeacons.some(
        (beacon) => !Number.isFinite(beacon.x) || !Number.isFinite(beacon.y)
      )
    ) {
      setFormError(
        "Une ou plusieurs bornes ont des coordonnées X/Y invalides. Corrigez-les avant de lancer l'audit."
      );
      return;
    }

    if (!Number.isFinite(Number(statedArea)) || Number(statedArea) <= 0) {
      setFormError("La surface déclarée doit être un nombre supérieur à 0 m².");
      return;
    }

    if (!planId.trim() || !locality.trim()) {
      setFormError("La référence du plan et la localité sont obligatoires.");
      return;
    }

    const confirmed: PlanVerificationRequest = {
      ...extractedPlan,
      locality: locality.trim(),
      plan_id: planId.trim(),
      title_number: titleNumber.trim() || undefined,
      stated_area_sqm: Number(statedArea),
      utm_zone: utmZone,
      beacons: numericBeacons,
    };
    onConfirm(confirmed);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {/* Outer Shell */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-review-title"
        className="w-full max-w-4xl p-2 rounded-3xl bg-white/[0.02] ring-1 ring-white/[0.08] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Inner Surface */}
        <div className="rounded-2xl bg-[#090B10] flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between bg-white/[0.02] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#60A5FA]/10 ring-1 ring-[#60A5FA]/20 flex items-center justify-center">
                <ScanText className="w-5 h-5 text-[#60A5FA]" />
              </div>
              <div>
                <h3 id="ai-review-title" className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  Extraction Optique & Revue Humaine
                  <span className="px-2 py-0.5 rounded-full bg-[#60A5FA]/15 text-[#93C5FD] text-[10px] font-mono">
                    Audit optique WGS84
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Document analysé : <span className="text-zinc-200 font-mono">{uploadedFileName}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Fermer"
              className="p-2 rounded-xl hover:bg-white/[0.06] text-zinc-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body: Split View (Document Scan Preview + Interactive Human-in-the-Loop Review) */}
          <div data-lenis-prevent className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (5 cols): The user's actual document + the real
                Muse Spark grounding box (normalized 0-1000 grid, 0,0 = top-left).
                No simulated blueprint, no invented rows. */}
            <div className="lg:col-span-5 space-y-3 flex flex-col">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#00DF8F]" />
                  Document analysé par Muse Spark
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {previewData?.previewKind === "pdf" ? "PDF SOURCE" : "IMAGE SOURCE"}
                </span>
              </div>

              {previewData?.previewKind === "image" && (
                <div className="relative rounded-2xl overflow-hidden bg-[#0D1017] ring-1 ring-white/[0.08] flex-1 min-h-[280px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewData.previewUrl}
                    alt="Plan cadastral importé"
                    className="absolute inset-0 w-full h-full object-contain"
                  />

                  {/* Real grounding box returned by Muse Spark.
                      table_roi values are normalized 0-1 (from the 0-1000 grid). */}
                  {previewData.tableRoi && (
                    <div
                      className="absolute border-2 border-[#00DF8F] bg-[#00DF8F]/5 pointer-events-none"
                      style={{
                        left: `${previewData.tableRoi.xmin * 100}%`,
                        top: `${previewData.tableRoi.ymin * 100}%`,
                        width: `${Math.max(0, (previewData.tableRoi.xmax - previewData.tableRoi.xmin) * 100)}%`,
                        height: `${Math.max(0, (previewData.tableRoi.ymax - previewData.tableRoi.ymin) * 100)}%`,
                      }}
                    >
                      <span className="absolute -top-5 left-0 px-1.5 py-0.5 rounded bg-[#00DF8F] text-black text-[9px] font-mono font-bold whitespace-nowrap">
                        Tableau des bornes
                      </span>
                    </div>
                  )}
                  {previewData.samTableRoi && (
                    <div
                      className="absolute border-2 border-sky-400 bg-sky-400/5 pointer-events-none"
                      style={{
                        left: `${previewData.samTableRoi.xmin * 100}%`,
                        top: `${previewData.samTableRoi.ymin * 100}%`,
                        width: `${Math.max(0, (previewData.samTableRoi.xmax - previewData.samTableRoi.xmin) * 100)}%`,
                        height: `${Math.max(0, (previewData.samTableRoi.ymax - previewData.samTableRoi.ymin) * 100)}%`,
                      }}
                    >
                      <span className="absolute -bottom-5 left-0 px-1.5 py-0.5 rounded bg-sky-400 text-black text-[9px] font-mono font-bold whitespace-nowrap">
                        SAM 3.1 · limite segmentée
                      </span>
                    </div>
                  )}
                </div>
              )}

              {previewData?.previewKind === "pdf" && (
                <div className="relative rounded-2xl overflow-hidden bg-[#0D1017] ring-1 ring-white/[0.08] flex-1 min-h-[280px]">
                  <iframe
                    src={previewData.previewUrl}
                    title="Plan cadastral importé (PDF)"
                    className="absolute inset-0 w-full h-full bg-white"
                  />
                </div>
              )}

              {!previewData && (
                <div className="rounded-2xl overflow-hidden bg-[#0D1017] ring-1 ring-white/[0.08] flex-1 min-h-[280px] flex items-center justify-center px-6 text-center text-xs text-zinc-500">
                  Aucune prévisualisation du document joint.
                </div>
              )}

              {/* Real Muse Spark zoom recheck crop: the exact lossless PNG the
                  beacons were re-read from at full resolution */}
              {previewData?.cropUrl && (
                <div className="space-y-1">
                  <div className="relative rounded-2xl overflow-hidden bg-[#0D1017] ring-1 ring-white/[0.08] min-h-[220px] flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewData.cropUrl}
                      alt="Recadrage du tableau des bornes relu par Muse Spark"
                      className="max-h-[260px] w-auto max-w-full object-contain"
                    />
                  </div>
                  <p className="text-[10px] font-mono text-zinc-500 flex items-center gap-1.5">
                    <span className="text-[#00DF8F]">Relecture zoom</span>
                    <span>
                      {previewData.zoomRecheck === "applied"
                        ? "appliquée — chaque chiffre relu sur ce recadrage"
                        : previewData.zoomRecheck ?? ""}
                    </span>
                  </p>
                </div>
              )}

              {/* Real provenance facts only — nothing simulated */}
              <div className="p-2.5 rounded-xl bg-white/[0.03] text-[10px] font-mono text-zinc-400 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#00DF8F]">Grounding Muse Spark</span>
                  <span className="text-zinc-500">
                    {previewData?.tableRoi
                      ? `ROI [x ${Math.round(previewData.tableRoi.xmin * 1000)}–${Math.round(previewData.tableRoi.xmax * 1000)} · y ${Math.round(previewData.tableRoi.ymin * 1000)}–${Math.round(previewData.tableRoi.ymax * 1000)}] / 1000`
                      : "boîte non renvoyée par le modèle"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sky-400">SAM 3.1</span>
                  <span className="text-zinc-500">
                    {previewData?.samSegmentation === "applied"
                      ? "segmentation de la limite du tableau appliquée"
                      : previewData?.samSegmentation ?? "non exécutée"}
                  </span>
                </div>
                <p className="text-zinc-500 text-[9px]">
                  {[
                    previewData?.protocol === "chat-completions"
                      ? "Protocole : vision en ligne (Chat Completions)"
                      : null,
                    previewData?.protocol === "responses-files-api"
                      ? "Protocole : Files API + sorties structurées"
                      : null,
                    previewData?.documentSource === "embedded-pdf-text"
                      ? "Source : texte PDF éditable (sans OCR)"
                      : null,
                    previewData?.documentSource === "scanned-pdf-page-1-350dpi"
                      ? "Source : PDF scanné rendu à 350 DPI"
                      : null,
                    previewData?.detectedLanguage ? `Langue : ${previewData.detectedLanguage}` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "Extraction structurée via Meta Model API"}
                </p>
              </div>
            </div>

            {/* Right Column (7 cols): Human-in-the-Loop Clarification Prompt & Form */}
            <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
              {/* AI Assistant Prompt Box */}
              <div className="p-3.5 rounded-2xl bg-[#00DF8F]/[0.08] ring-1 ring-[#00DF8F]/20 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#60A5FA]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Validation Géodésique & Contrôle Qualité</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                  Le moteur d&apos;extraction a relevé{" "}
                  <span className="text-[#93C5FD] font-semibold">{beacons.length} bornes</span> depuis
                  votre document. Vérifiez ou corrigez chaque valeur ci-dessous avant de lancer le
                  calcul géodésique Gauss-Shoelace et l&apos;audit anti-fraude.
                </p>
              </div>

              {/* Plan Metadata Fields */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-400">Réf. Plan</label>
                  <input
                    type="text"
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                    className="w-full bg-white/[0.03] ring-1 ring-white/[0.08] focus:ring-[#00DF8F]/50 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-400">Titre Foncier</label>
                  <input
                    type="text"
                    value={titleNumber}
                    onChange={(e) => setTitleNumber(e.target.value)}
                    className="w-full bg-white/[0.03] ring-1 ring-white/[0.08] focus:ring-[#00DF8F]/50 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-400">Localité</label>
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full bg-white/[0.03] ring-1 ring-white/[0.08] focus:ring-[#00DF8F]/50 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-400">Zone UTM</label>
                  <select
                    value={utmZone}
                    onChange={(e) => setUtmZone(e.target.value as "32N" | "33N")}
                    className="w-full bg-white/[0.03] ring-1 ring-white/[0.08] focus:ring-[#00DF8F]/50 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                  >
                    <option value="32N">32N (Ouest/Centre)</option>
                    <option value="33N">33N (Grand Nord/Est)</option>
                  </select>
                </div>
              </div>

              {/* Stated Area Field */}
              <div className="p-3 rounded-xl bg-white/[0.02] flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-medium text-zinc-300 block">
                    Surface Déclarée sur le Plan Papier (m²)
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Valeur mentionnée textuellement sur le procès-verbal
                  </span>
                </div>
                <div className="w-36">
                  <input
                    type="number"
                    step="0.01"
                    value={statedArea}
                    onChange={(e) => setStatedArea(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white/[0.04] ring-1 ring-white/[0.1] focus:ring-[#00DF8F]/50 rounded-xl px-3 py-1.5 text-sm font-mono font-bold text-white text-right outline-none"
                  />
                </div>
              </div>

              {/* Beacons Coordinate Matrix */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-300">
                    Coordonnées UTM des Bornes Détectées ({beacons.length})
                  </span>
                  <span className="text-[10px] font-mono text-[#00DF8F]">
                    Modifiable en temps réel
                  </span>
                </div>

                <div data-lenis-prevent className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {beacons.map((b, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.02] text-xs font-mono"
                    >
                      <span className="w-8 text-center font-bold text-[#00DF8F]">
                        {b.borne_id}
                      </span>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-1">
                          <span className="text-[10px] text-zinc-500">X:</span>
                          <input
                            type="number"
                            step="0.01"
                            value={b.x}
                            onChange={(e) =>
                              handleUpdateBeacon(idx, "x", parseFloat(e.target.value))
                            }
                            className="w-full bg-white/[0.04] rounded-lg px-2 py-1 text-white outline-none"
                          />
                        </div>
                        <div className="flex-1 flex items-center gap-1">
                          <span className="text-[10px] text-zinc-500">Y:</span>
                          <input
                            type="number"
                            step="0.01"
                            value={b.y}
                            onChange={(e) =>
                              handleUpdateBeacon(idx, "y", parseFloat(e.target.value))
                            }
                            className="w-full bg-white/[0.04] rounded-lg px-2 py-1 text-white outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inline validation */}
              {formError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/[0.08] px-3.5 py-2.5 text-xs text-red-300">
                  {formError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white transition"
                >
                  Annuler
                </button>

                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-5 py-2.5 rounded-xl bg-[#00DF8F] hover:bg-[#00C97F] text-black font-semibold text-xs tracking-tight transition shadow-xl flex items-center gap-2 active:scale-[0.98]"
                >
                  <span>Confirmer & Lancer l&apos;Audit Géodésique</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
