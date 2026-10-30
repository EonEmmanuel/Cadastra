"use client";

import React, { useState } from "react";
import { Scan, Sparkles, Check, FileSpreadsheet, Bot, ArrowRight } from "lucide-react";
import { PlanVerificationRequest } from "@/types/cadastre";

interface DocumentScannerSimulatorProps {
  onPlanExtracted: (plan: PlanVerificationRequest) => void;
  isLoading: boolean;
}

export default function DocumentScannerSimulator({
  onPlanExtracted,
  isLoading,
}: DocumentScannerSimulatorProps) {
  const [scanningStep, setScanningStep] = useState<"idle" | "segmenting" | "spark_ocr" | "done">("idle");
  const [selectedScan, setSelectedScan] = useState<"douala" | "fraud" | "odza">("douala");

  const runSimulation = async () => {
    setScanningStep("segmenting");

    // 1. Meta SAM 3.1 Segmenting Table ROI
    await new Promise((r) => setTimeout(r, 700));
    setScanningStep("spark_ocr");

    // 2. Meta Muse Spark Multimodal Reasoning & Extraction
    await new Promise((r) => setTimeout(r, 900));

    let filename = "douala_yassa_utm32n.json";
    if (selectedScan === "fraud") filename = "douala_yassa_fraud_superficie.json";
    if (selectedScan === "odza") filename = "yaounde_odza_utm32n.json";

    try {
      const res = await fetch(`http://localhost:8000/api/profiles/${filename}`);
      if (res.ok) {
        const data = await res.json();
        onPlanExtracted(data);
      }
    } catch (e) {
      console.warn("Backend not directly reachable, using local profile fallback");
    }

    setScanningStep("done");
    setTimeout(() => setScanningStep("idle"), 3000);
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-purple-100 text-purple-700">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-800">
              Pipeline IA : Meta SAM 3.1 + Meta Muse Spark
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Segmentation de table par SAM 3.1 et extraction raisonnée des bornes par Muse Spark 1.3 à partir d&apos;un scan papier.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedScan}
            onChange={(e) => setSelectedScan(e.target.value as any)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700"
          >
            <option value="douala">Scan Plan Douala Yassa (Conforme)</option>
            <option value="fraud">Scan Plan Frauduleux (Superficie Fictive)</option>
            <option value="odza">Scan Plan Yaoundé Odza (5 Bornes)</option>
          </select>

          <button
            onClick={runSimulation}
            disabled={scanningStep !== "idle" || isLoading}
            className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold text-xs shadow flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
          >
            <Scan className="w-3.5 h-3.5" />
            {scanningStep === "idle" ? "Lancer Analyse IA" : "Traitement en cours..."}
          </button>
        </div>
      </div>

      {/* Visual Simulation of Document Scan with SAM 3.1 Overlay */}
      <div className="relative bg-slate-900 rounded-lg overflow-hidden border border-slate-800 p-6 flex flex-col items-center justify-center min-h-[220px]">
        {/* Document Wireframe Graphic */}
        <div className="relative w-72 h-44 bg-white/10 rounded-md border border-white/20 p-3 flex flex-col justify-between shadow-inner">
          {/* Header Lines */}
          <div className="space-y-1">
            <div className="w-24 h-2 bg-emerald-400/80 rounded" />
            <div className="w-36 h-1.5 bg-white/40 rounded" />
          </div>

          {/* Table ROI with SAM 3.1 Bounding Box */}
          <div
            className={`border-2 rounded p-1.5 transition-all duration-300 relative ${
              scanningStep === "segmenting"
                ? "border-purple-400 bg-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                : scanningStep === "spark_ocr" || scanningStep === "done"
                ? "border-emerald-400 bg-emerald-500/10"
                : "border-dashed border-white/30"
            }`}
          >
            <div className="absolute -top-3 left-2 px-1.5 py-0.2 bg-purple-600 text-white text-[9px] font-mono rounded font-bold">
              SAM 3.1 ROI [0.62, 0.08, 0.91, 0.92]
            </div>
            <div className="grid grid-cols-4 gap-1 text-[8px] text-white/70 font-mono pt-1">
              <span>B1: 583420</span>
              <span>B2: 583455</span>
              <span>B3: 583455</span>
              <span>B4: 583420</span>
            </div>
          </div>

          {/* Footer signature line */}
          <div className="flex justify-between items-center text-[9px] text-white/50">
            <span>Ordre OGEC #142</span>
            <span>MINDCAF Littoral</span>
          </div>
        </div>

        {/* Real-time Status Overlay */}
        <div className="mt-4 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                scanningStep === "segmenting" ? "bg-purple-400 animate-ping" : scanningStep !== "idle" ? "bg-emerald-400" : "bg-white/30"
              }`}
            />
            <span className="text-white/80 font-medium">Meta SAM 3.1 (Segmentation Table)</span>
          </div>
          <ArrowRight className="w-3 h-3 text-white/40" />
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                scanningStep === "spark_ocr" ? "bg-purple-400 animate-ping" : scanningStep === "done" ? "bg-emerald-400" : "bg-white/30"
              }`}
            />
            <span className="text-white/80 font-medium">Meta Muse Spark 1.3 (Extraction & Validation)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
