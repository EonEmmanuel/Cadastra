"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import {
  Crosshair,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Ruler,
  Compass,
  Layers,
} from "lucide-react";
import { BeaconWGS84, BoundarySegment, RiskLevel } from "@/types/cadastre";

export interface CadastralSatelliteMapProps {
  planId: string;
  beacons: BeaconWGS84[];
  centroid?: { latitude: number; longitude: number };
  boundarySegments: BoundarySegment[];
  riskLevel: RiskLevel;
  statedArea: number;
  computedArea: number;
  discrepancySqm?: number;
  locality: string;
  utmZone?: string;
  epsgCode?: string;
  selectedBorneId?: string | null;
  onSelectBorne?: (borneId: string | null) => void;
  leftOffset?: number;
  rightOffset?: number;
}

// Auto Bounds Fitter with Dynamic Asymmetrical Viewport Padding
function MapBoundsController({
  beacons,
  fitKey,
  leftOffset = 80,
  rightOffset = 450,
}: {
  beacons: BeaconWGS84[];
  fitKey: number;
  leftOffset?: number;
  rightOffset?: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!beacons || beacons.length === 0) return;
    try {
      const bounds = L.latLngBounds(
        beacons.map((b) => [b.latitude, b.longitude] as [number, number])
      );
      if (bounds.isValid()) {
        map.invalidateSize();
        map.fitBounds(bounds, {
          paddingTopLeft: [leftOffset + 40, 80],
          paddingBottomRight: [rightOffset + 40, 80],
          maxZoom: 19,
          animate: true,
        });
      }
    } catch (e) {
      console.warn("Bounds fit error", e);
    }
  }, [beacons, map, fitKey, leftOffset, rightOffset]);

  return null;
}

// Map Event Tracker
function MapEventTracker({
  onCoordsChange,
  onZoomChange,
  setMapInstance,
}: {
  onCoordsChange: (coords: { lat: number; lng: number }) => void;
  onZoomChange: (zoom: number) => void;
  setMapInstance: (map: L.Map) => void;
}) {
  const map = useMapEvents({
    mousemove(e) {
      onCoordsChange(e.latlng);
    },
    move() {
      onCoordsChange(map.getCenter());
    },
    zoomend() {
      onZoomChange(map.getZoom());
    },
  });

  useEffect(() => {
    setMapInstance(map);
    onZoomChange(map.getZoom());
  }, [map, onZoomChange, setMapInstance]);

  return null;
}

export default function CadastralSatelliteMapInner({
  planId,
  beacons,
  centroid,
  boundarySegments,
  riskLevel,
  statedArea,
  computedArea,
  discrepancySqm = 0,
  locality,
  utmZone = "32N",
  epsgCode = "EPSG:32632",
  selectedBorneId,
  onSelectBorne,
  leftOffset = 80,
  rightOffset = 450,
}: CadastralSatelliteMapProps) {
  const isCritical = riskLevel === "CRITICAL_FRAUD";
  const isAnomaly = riskLevel === "HIGH" || riskLevel === "MEDIUM";
  const isFraud = isCritical || isAnomaly;
  const [tileMode, setTileMode] = useState<"satellite" | "carte" | "mixte">("satellite");
  const [showMeasure, setShowMeasure] = useState<boolean>(true);
  const [fitKey, setFitKey] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(19);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const centerLat = centroid?.latitude || (beacons.length > 0 ? beacons[0].latitude : 4.0436);
  const centerLon = centroid?.longitude || (beacons.length > 0 ? beacons[0].longitude : 9.7511);

  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number }>({
    lat: centerLat,
    lng: centerLon,
  });

  useEffect(() => {
    setCursorCoords({ lat: centerLat, lng: centerLon });
  }, [centerLat, centerLon]);

  const centroidLat = centroid?.latitude;
  const centroidLng = centroid?.longitude;
  useEffect(() => {
    if (mapInstance && centroidLat != null && centroidLng != null) {
      mapInstance.flyTo([centroidLat, centroidLng], 19, {
        animate: true,
        duration: 1.0,
      });
    }
  }, [centroidLat, centroidLng, mapInstance]);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
      setTimeout(() => mapInstance?.invalidateSize(), 200);
    } catch (e) {
      console.warn("Fullscreen toggle error", e);
    }
  };

  const polygonPositions: [number, number][] = beacons.map((b) => [b.latitude, b.longitude]);

  // Beacon Marker Pin (Clean Glass Badge)
  const createBeaconIcon = (borneId: string, isSelected: boolean) => {
    const tone = isCritical
      ? "bg-[#090A0E] text-red-400 ring-1 ring-red-500/40"
      : isAnomaly
      ? "bg-[#090A0E] text-amber-400 ring-1 ring-amber-500/40"
      : "bg-[#090A0E] text-[#00DF8F] ring-1 ring-[#00DF8F]/40";

    return L.divIcon({
      className: "beacon-marker-icon",
      html: `
        <div class="flex items-center justify-center w-7 h-7 rounded-lg font-mono text-xs font-bold shadow-xl transition-all ${tone} ${
        isSelected ? "scale-125 ring-2 ring-white" : ""
      }">
          ${borneId}
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  };

  // Compact Floating Tactical Overlay Callouts (Clean, proportional badge)
  const createBubbleIcon = (
    title: string,
    subtitle: string,
    variant: "green" | "red" | "amber"
  ) => {
    const tone =
      variant === "red"
        ? "bg-[#060709]/90 text-red-300 ring-1 ring-red-500/30"
        : variant === "amber"
        ? "bg-[#060913]/90 text-amber-300 ring-1 ring-amber-500/30"
        : "bg-[#060709]/90 text-emerald-200 ring-1 ring-[#00DF8F]/30";
    const dot =
      variant === "red"
        ? "bg-red-400 shadow-[0_0_6px_#EF4444]"
        : variant === "amber"
        ? "bg-amber-400 shadow-[0_0_6px_#F59E0B]"
        : "bg-[#00DF8F] shadow-[0_0_6px_#00DF8F]";

    return L.divIcon({
      className: "map-overlay-marker",
      html: `
        <div class="flex items-center gap-2 px-3 py-1 rounded-md backdrop-blur-md shadow-xl text-xs whitespace-nowrap ${tone}">
          <span class="w-2 h-2 rounded-full ${dot} shrink-0"></span>
          <span class="font-medium text-zinc-200 font-sans tracking-tight">${title}</span>
          <span class="text-zinc-500 font-mono">·</span>
          <span class="font-bold font-mono text-white">${subtitle}</span>
        </div>
      `,
      iconSize: [170, 28],
      iconAnchor: [85, 14],
    });
  };

  const totalPerimeter = boundarySegments.reduce((sum, s) => sum + s.length_meters, 0);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative select-none font-sans overflow-hidden bg-[#060709]"
    >
      {/* 1. TOP FLOATING HUD OVER MAP (Dynamically offset between docks) */}
      <div
        className="absolute top-4 z-[1000] pointer-events-none transition-all duration-300 flex items-center justify-between gap-3"
        style={{
          left: `${leftOffset + 16}px`,
          right: `${rightOffset + 16}px`,
        }}
      >
        {/* Left: Location & Parcel Stats */}
        <div className="pointer-events-auto flex items-center gap-2 p-1.5 rounded-2xl bg-[#0B0E14]/85 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.05] text-xs sm:text-[13px] font-semibold text-zinc-100">
            <span className="w-2 h-2 rounded-full bg-[#00DF8F]" />
            <span>{locality}</span>
            <span className="text-xs font-mono font-semibold text-zinc-400">({utmZone})</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.02] text-xs font-mono text-zinc-300 font-medium">
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
            <span>
              {beacons.length > 0
                ? `${beacons.length} bornes · ${Math.round(
                    computedArea > 0 ? computedArea : statedArea
                  ).toLocaleString()} m²`
                : "Aucune parcelle chargée"}
            </span>
          </div>
        </div>

        {/* Right: Map Layer Switcher (Satellite | Carte | Mixte) */}
        <div className="pointer-events-auto flex items-center gap-1 p-1.5 rounded-2xl bg-[#040711]/85 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <button
            onClick={() => setTileMode("satellite")}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition ${
              tileMode === "satellite"
                ? "bg-white text-black font-semibold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setTileMode("carte")}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition ${
              tileMode === "carte"
                ? "bg-white text-black font-semibold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Carte
          </button>
          <button
            onClick={() => setTileMode("mixte")}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition ${
              tileMode === "mixte"
                ? "bg-white text-black font-semibold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Mixte
          </button>
        </div>
      </div>

      {/* 2. THE FULL-BLEED MAP VIEWPORT */}
      <div className="w-full h-full absolute inset-0 bg-[#060709]">
        <MapContainer
          center={[centerLat, centerLon]}
          zoom={19}
          minZoom={4}
          maxZoom={22}
          zoomControl={false}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          {/* Layer 1: Satellite (Esri World Imagery) */}
          {tileMode === "satellite" && (
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxNativeZoom={19}
              maxZoom={22}
            />
          )}

          {/* Layer 2: Carte Noire (OSM tiles inverted for a dark, detailed
              street-level basemap, zoomable up to z22) */}
          {tileMode === "carte" && (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxNativeZoom={19}
              maxZoom={22}
              className="cartedark"
            />
          )}

          {/* Layer 3: Mixte (OpenStreetMap Dark Overlay) */}
          {tileMode === "mixte" && (
            <>
              <TileLayer
                attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxNativeZoom={19}
                maxZoom={22}
              />
              <TileLayer
                url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                maxNativeZoom={19}
                maxZoom={22}
                opacity={0.8}
              />
            </>
          )}

          {/* Main Cadastral Polygon — colour follows the real verdict, never a
              fabricated second polygon */}
          {polygonPositions.length >= 3 && (
            <Polygon
              positions={polygonPositions}
              pathOptions={{
                color: isCritical ? "#EF4444" : isAnomaly ? "#F59E0B" : "#00DF8F",
                weight: 2,
                fillColor: isCritical ? "#EF4444" : isAnomaly ? "#F59E0B" : "#00DF8F",
                fillOpacity: 0.18,
              }}
            >
              <Popup>
                <div className="text-xs p-2 space-y-1 font-sans text-zinc-100 min-w-[180px]">
                  <div className="font-bold text-xs uppercase text-[#00DF8F]">{locality}</div>
                  <div className="text-[11px] text-zinc-400">
                    Surface calculée : <b className="text-white font-mono">{Math.round(computedArea).toLocaleString()} m²</b>
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    Projection : {epsgCode} ({utmZone})
                  </div>
                </div>
              </Popup>
            </Polygon>
          )}

          {/* Individual Beacons (Bornes B1..Bn) */}
          {beacons.map((b, idx) => {
            const isSelected = selectedBorneId === b.borne_id;
            return (
              <Marker
                key={`${b.borne_id}-${idx}-${isSelected}`}
                position={[b.latitude, b.longitude]}
                icon={createBeaconIcon(b.borne_id, isSelected)}
                eventHandlers={{
                  click: () => onSelectBorne?.(b.borne_id),
                }}
              >
                <Popup>
                  <div className="text-xs p-2 space-y-1 font-mono text-zinc-100 min-w-[180px]">
                    <div className="font-bold text-xs text-[#00DF8F]">Borne {b.borne_id}</div>
                    <div className="text-[11px] text-zinc-300">X (Est): {b.utm_x.toFixed(2)} m</div>
                    <div className="text-[11px] text-zinc-300">Y (Nord): {b.utm_y.toFixed(2)} m</div>
                    {b.elevation_m != null && (
                      <div className="text-[10px] text-zinc-500">Altitude: {b.elevation_m.toFixed(1)} m</div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* On-Map Tactical Callout — anchored to the real centroid. The
              discrepancy is surfaced in the bottom-right HUD below, not as a
              second marker stacked on the same point. */}
          {centroid && (
            <Marker
              position={[centroid.latitude, centroid.longitude]}
              icon={createBubbleIcon(
                `Parcelle ${planId}`,
                `${Math.round(isFraud ? statedArea : computedArea).toLocaleString()} m²`,
                isCritical ? "red" : isAnomaly ? "amber" : "green"
              )}
            />
          )}

          <MapBoundsController
            beacons={beacons}
            fitKey={fitKey}
            leftOffset={leftOffset}
            rightOffset={rightOffset}
          />
          <MapEventTracker
            onCoordsChange={setCursorCoords}
            onZoomChange={setZoom}
            setMapInstance={setMapInstance}
          />
        </MapContainer>

        {/* LEFT FLOATING CONTROLS TOOLBAR (Positioned offset from the sidebar dock) */}
        <div
          className="absolute top-20 z-[1000] flex flex-col items-center gap-1.5 p-1.5 rounded-2xl bg-[#040711]/85 border border-white/[0.08] shadow-2xl backdrop-blur-xl transition-all duration-300"
          style={{ left: `${leftOffset + 16}px` }}
        >
          <button
            onClick={() => mapInstance?.zoomIn()}
            title="Zoom avant"
            className="p-2 rounded-xl hover:bg-white/[0.08] text-zinc-300 hover:text-white transition"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => mapInstance?.zoomOut()}
            title="Zoom arrière"
            className="p-2 rounded-xl hover:bg-white/[0.08] text-zinc-300 hover:text-white transition"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setFitKey((k) => k + 1)}
            title="Recadrer la parcelle"
            className="p-2 rounded-xl hover:bg-white/[0.08] text-zinc-300 hover:text-white transition"
          >
            <Crosshair className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowMeasure(!showMeasure)}
            title="Afficher mesure périmétrique"
            className={`p-2 rounded-xl transition ${
              showMeasure
                ? "bg-white text-black font-semibold shadow-sm"
                : "text-zinc-300 hover:text-white hover:bg-white/[0.08]"
            }`}
          >
            <Ruler className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
            className="p-2 rounded-xl hover:bg-white/[0.08] text-zinc-300 hover:text-white transition"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* BOTTOM-LEFT TELEMETRY HUD (Offset from the sidebar dock) */}
        <div
          className="absolute bottom-4 z-[1000] flex items-center gap-2 pointer-events-none font-mono text-xs transition-all duration-300"
          style={{ left: `${leftOffset + 16}px` }}
        >
          {/* Compass */}
          <div className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#040711]/85 border border-white/[0.08] text-zinc-200 backdrop-blur-xl shadow-xl">
            <Compass className="w-3.5 h-3.5 text-[#00DF8F]" />
            <span className="font-bold">N 0°</span>
          </div>

          {/* GPS Coordinates */}
          <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#040711]/85 border border-white/[0.08] text-zinc-200 backdrop-blur-xl shadow-xl">
            <span className="w-2 h-2 rounded-full bg-[#00DF8F]" />
            <span className="font-medium">{cursorCoords.lat.toFixed(5)}° N</span>
            <span className="text-zinc-600">/</span>
            <span className="font-medium">{cursorCoords.lng.toFixed(5)}° E</span>
          </div>

          {/* Scale */}
          <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#040711]/85 border border-white/[0.08] text-zinc-300 backdrop-blur-xl shadow-xl">
            <span className="text-[#93C5FD] font-semibold">{epsgCode}</span>
            <span className="text-zinc-600">·</span>
            <span className="font-bold text-white">z{zoom}</span>
          </div>
        </div>

        {/* BOTTOM-RIGHT PERIMETER SUMMARY (Offset from the floating dossier) */}
        {showMeasure && boundarySegments.length > 0 && (
          <div
            className="absolute bottom-4 z-[1000] pointer-events-auto px-3.5 py-1.5 rounded-xl bg-[#040711]/85 border border-white/[0.08] text-xs font-mono text-zinc-200 backdrop-blur-xl shadow-xl flex items-center gap-2 transition-all duration-300"
            style={{ right: `${rightOffset + 16}px` }}
          >
            <span className="text-zinc-400 font-sans">Périmètre :</span>
            <span className="font-bold text-[#00DF8F]">{totalPerimeter.toFixed(1)} m</span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-300">{beacons.length} bornes</span>
            {isFraud && discrepancySqm > 0 && (
              <>
                <span className="text-zinc-600">·</span>
                <span className={isCritical ? "font-bold text-red-400" : "font-bold text-amber-400"}>
                  écart +{Math.round(discrepancySqm).toLocaleString()} m²
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
