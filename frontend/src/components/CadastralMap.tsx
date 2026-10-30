"use client";

import dynamic from "next/dynamic";
import React from "react";
import { BeaconWGS84, BoundarySegment, RiskLevel } from "@/types/cadastre";

interface CadastralMapProps {
  beacons: BeaconWGS84[];
  centroid?: { latitude: number; longitude: number };
  boundarySegments: BoundarySegment[];
  riskLevel: RiskLevel;
  statedArea: number;
  computedArea: number;
  locality: string;
}

// Dynamically import the inner Leaflet map with SSR disabled to prevent `window is not defined`
const DynamicCadastralMapInner = dynamic(
  () => import("./CadastralMapInner"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[520px] rounded-xl bg-slate-900/10 flex flex-col items-center justify-center text-slate-500 animate-pulse border border-slate-200">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium">Chargement de l&apos;imagerie satellite et du tracé cadastral...</p>
      </div>
    ),
  }
);

export default function CadastralMap(props: CadastralMapProps) {
  return <DynamicCadastralMapInner {...props} />;
}
