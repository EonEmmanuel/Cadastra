"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Compass,
  ArrowRight,
  ShieldCheck,
  Edit3,
} from "lucide-react";
import { PlanVerificationRequest, BeaconInput } from "@/types/cadastre";

interface AiExtractionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  extractedPlan: PlanVerificationRequest;
  uploadedFileName?: string;
  onConfirm: (confirmedPlan: PlanVerificationRequest) => void;
}

export default function AiExtractionReviewModal({
  isOpen,
  onClose,
  extractedPlan,
  uploadedFileName = "plan_cadastral_scan.jpg",
  onConfirm,
}: AiExtractionReviewModalProps) {
  const [locality, setLocality] = useState(extractedPlan.locality);
  const [planId, setPlanId] = useState(extractedPlan.plan_id);
  const [titleNumber, setTitleNumber] = useState(extractedPlan.title_number || "");
  const [statedArea, setStatedArea] = useState<number>(extractedPlan.stated_area_sqm);
  const [utmZone, setUtmZone] = useState<"32N" | "33N">(extractedPlan.utm_zone);
  const [beacons, setBeacons] = useState<BeaconInput[]>(extractedPlan.beacons);

  if (!isOpen) return null;

  const handleUpdateBeacon = (index: number, field: keyof BeaconInput, value: any) => {
    const updated = [...beacons];
    updated[index] = { ...updated[index], [field]: value };
    setBeacons(updated);
  };

  const handleConfirm = () => {
    const confirmed: PlanVerificationRequest = {
      ...extractedPlan,
      locality,
      plan_id: planId,
      title_number: titleNumber || undefined,
      stated_area_sqm: statedArea,
      utm_zone: utmZone,
      beacons: beacons.map((b) => ({
        ...b,
        x: Number(b.x),
        y: Number(b.y),
        z: b.z ? Number(b.z) : undefined,
      })),
    };
    onConfirm(confirmed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
      {/* Outer Shell */}
      <div className="w-full max-w-4xl p-2 rounded-3xl bg-white/[0.02] ring-1 ring-white/[0.08] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Inner Surface */}
        <div className="rounded-2xl bg-[#090B10] flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between bg-white/[0.02] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#00DF8F]/10 ring-1 ring-[#00DF8F]/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#00DF8F]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  Extraction Multimodale Vision AI & Revue Humaine
                  <span className="px-2 py-0.5 rounded-full bg-[#00DF8F]/15 text-[#00DF8F] text-[10px] font-mono">
                    Llama 3.2 Vision · Confiance 97.8%
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Document analysé : <span className="text-zinc-200 font-mono">{uploadedFileName}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/[0.06] text-zinc-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body: Split View (Document Scan Preview + Interactive Human-in-the-Loop Review) */}
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (5 cols): Cadastral Plan Visual Preview */}
            <div className="lg:col-span-5 space-y-3 flex flex-col">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#00DF8F]" />
                  Aperçu du Plan Numérisé
                </span>
                <span className="text-[10px] font-mono text-zinc-500">MINDCAF Scan</span>
              </div>

              {/* Simulated Document Blueprint with SAM 3.1 Bounding Box */}
              <div className="relative rounded-2xl overflow-hidden bg-[#0D1017] ring-1 ring-white/[0.08] p-4 flex-1 min-h-[280px] flex flex-col justify-between">
                {/* Blueprint grid pattern */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#00DF8F_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                {/* Stamp & Official Seal */}
                <div className="relative z-10 flex justify-between items-start text-[10px] font-mono">
                  <div className="p-2 rounded-lg bg-white/[0.04] text-zinc-400 space-y-0.5">
                    <p className="text-white font-bold">RÉPUBLIQUE DU CAMEROUN</p>
                    <p>MINDCAF · Service du Cadastre</p>
                    <p>Département du Wouri</p>
                  </div>
                  <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-[#00DF8F] font-bold ring-1 ring-emerald-500/20 text-[9px]">
                    VISA GÉOMÈTRE AGRÉÉ
                  </div>
                </div>

                {/* Polygonal Scheme Graphic */}
                <div className="relative z-10 my-4 flex items-center justify-center">
                  <div className="w-36 h-28 relative border-2 border-dashed border-[#00DF8F]/60 rounded-xl bg-[#00DF8F]/5 flex items-center justify-center">
                    <span className="text-[10px] font-mono text-[#00DF8F] font-bold">
                      {statedArea} m²
                    </span>
                    <div className="absolute -top-2.5 -left-2.5 w-5 h-5 rounded-md bg-[#00DF8F] text-black text-[9px] font-bold flex items-center justify-center">
                      B1
                    </div>
                    <div className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-md bg-[#00DF8F] text-black text-[9px] font-bold flex items-center justify-center">
                      B2
                    </div>
                    <div className="absolute -bottom-2.5 -right-2.5 w-5 h-5 rounded-md bg-[#00DF8F] text-black text-[9px] font-bold flex items-center justify-center">
                      B3
                    </div>
                    <div className="absolute -bottom-2.5 -left-2.5 w-5 h-5 rounded-md bg-[#00DF8F] text-black text-[9px] font-bold flex items-center justify-center">
                      B4
                    </div>
                  </div>
                </div>

                {/* SAM 3.1 Detection Tag */}
                <div className="relative z-10 p-2.5 rounded-xl bg-white/[0.03] text-[10px] font-mono text-zinc-400 space-y-1">
                  <div className="flex items-center justify-between text-[#00DF8F]">
                    <span>Segmentation SAM 3.1</span>
                    <span className="text-zinc-500">ROI: [0.08, 0.62, 0.92, 0.91]</span>
                  </div>
                  <p className="text-zinc-500 text-[9px]">
                    Tableau de bornage isolé avec signature et sceau officiel détectés.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column (7 cols): Human-in-the-Loop Clarification Prompt & Form */}
            <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
              {/* AI Assistant Prompt Box */}
              <div className="p-3.5 rounded-2xl bg-[#00DF8F]/[0.08] ring-1 ring-[#00DF8F]/20 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#00DF8F]">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Validation Assistée par IA (Human-in-the-Loop)</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                  L&apos;IA a extrait les données du plan papier avec un taux de concordance de 97.8%. Veuillez vérifier ou rectifier les champs ci-dessous avant l&apos;exécution du calcul géodésique Gauss-Shoelace.
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

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
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
