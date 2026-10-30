"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, ShieldAlert, MapPin } from "lucide-react";
import { UTMZone } from "@/types/cadastre";

export interface ProfileCardData {
  id: string;
  filename: string;
  title: string;
  locality: string;
  region: string;
  utmZone: UTMZone;
  statedArea: number;
  expectedVerdict: "CONFORME" | "FRAUDE" | "ANOMALIE";
  description: string;
}

export const PRESET_PROFILES: ProfileCardData[] = [
  {
    id: "douala-valid",
    filename: "douala_yassa_utm32n.json",
    title: "Douala Yassa (Régulier)",
    locality: "Douala - Yassa",
    region: "Littoral",
    utmZone: "32N",
    statedArea: 980.0,
    expectedVerdict: "CONFORME",
    description: "Parcelle résidentielle conforme, 4 bornes béton, écart de surface = 0.0%.",
  },
  {
    id: "douala-fraud",
    filename: "douala_yassa_fraud_superficie.json",
    title: "Douala Yassa (Superficie Fictive)",
    locality: "Douala - Yassa",
    region: "Littoral",
    utmZone: "32N",
    statedArea: 1500.0,
    expectedVerdict: "FRAUDE",
    description: "Fraude courante : vendeur réclame 1500 m² alors que les bornes n'enclosent que 980 m² (+53%).",
  },
  {
    id: "yaounde-valid",
    filename: "yaounde_odza_utm32n.json",
    title: "Yaoundé Odza (5 Bornes)",
    locality: "Yaoundé - Odza",
    region: "Centre",
    utmZone: "32N",
    statedArea: 2100.0,
    expectedVerdict: "CONFORME",
    description: "Polygone à 5 angles sous TF 18920/Mfoundi avec altitudes NGF.",
  },
  {
    id: "kribi-err",
    filename: "kribi_ocean_overlap_utm32n.json",
    title: "Kribi Mpalla (Auto-Croisement)",
    locality: "Kribi - Mpalla",
    region: "Sud",
    utmZone: "32N",
    statedArea: 2500.0,
    expectedVerdict: "ANOMALIE",
    description: "Anomalie géométrique en nœud de papillon (bornes croisées non-valides).",
  },
  {
    id: "garoua-valid",
    filename: "garoua_utm33n.json",
    title: "Garoua (Zone UTM 33N)",
    locality: "Garoua - Roumde Adjia",
    region: "Nord",
    utmZone: "33N",
    statedArea: 2000.0,
    expectedVerdict: "CONFORME",
    description: "Validation géodésique en zone UTM 33N (EPSG:32633) pour le Grand Nord.",
  },
];

interface ProfileSelectorProps {
  selectedId: string;
  onSelect: (profile: ProfileCardData) => void;
  isLoading: boolean;
}

export default function ProfileSelector({
  selectedId,
  onSelect,
  isLoading,
}: ProfileSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Profils Cadastraux Test Cameroun
        </h3>
        <span className="text-[11px] text-slate-400">Cliquez pour charger</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {PRESET_PROFILES.map((p) => {
          const isSelected = p.id === selectedId;

          let badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
          let Icon = CheckCircle2;
          if (p.expectedVerdict === "FRAUDE") {
            badgeColor = "bg-red-50 text-red-700 border-red-200";
            Icon = ShieldAlert;
          } else if (p.expectedVerdict === "ANOMALIE") {
            badgeColor = "bg-amber-50 text-amber-700 border-amber-200";
            Icon = AlertTriangle;
          }

          return (
            <button
              key={p.id}
              disabled={isLoading}
              onClick={() => onSelect(p)}
              className={`p-3 rounded-xl text-left border transition-all duration-150 flex flex-col justify-between ${
                isSelected
                  ? "bg-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${badgeColor}`}
                  >
                    <Icon className="w-3 h-3" />
                    {p.expectedVerdict}
                  </span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-semibold">
                    UTM {p.utmZone}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs mb-1 line-clamp-1">
                  {p.title}
                </h4>
                <p className="text-[11px] text-slate-500 flex items-center gap-1 mb-2">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {p.locality}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Déclaré :</span>
                <span className="font-bold text-slate-800">
                  {p.statedArea.toLocaleString()} m²
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
