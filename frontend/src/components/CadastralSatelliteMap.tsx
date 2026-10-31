"use client";

import dynamic from "next/dynamic";
import React from "react";
import { CadastralSatelliteMapProps } from "./CadastralSatelliteMapInner";

const MapDynamic = dynamic(
  () => import("./CadastralSatelliteMapInner"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[420px] bg-[#0D0F14] border border-white/[0.08] rounded-xl flex items-center justify-center font-mono text-xs text-zinc-500 animate-pulse">
        Chargement du moteur cartographique satellite WGS84...
      </div>
    ),
  }
);

export default function CadastralSatelliteMap(props: CadastralSatelliteMapProps) {
  return <MapDynamic {...props} />;
}
