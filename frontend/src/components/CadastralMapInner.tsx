"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { BeaconWGS84, BoundarySegment, RiskLevel } from "@/types/cadastre";

interface CadastralMapInnerProps {
  beacons: BeaconWGS84[];
  centroid?: { latitude: number; longitude: number };
  boundarySegments: BoundarySegment[];
  riskLevel: RiskLevel;
  statedArea: number;
  computedArea: number;
  locality: string;
}

// Helper component to auto-pan and zoom to the parcel coordinates
function MapAutoBounds({ beacons }: { beacons: BeaconWGS84[] }) {
  const map = useMap();

  useEffect(() => {
    if (!beacons || beacons.length === 0) return;

    try {
      const bounds = L.latLngBounds(
        beacons.map((b) => [b.latitude, b.longitude] as [number, number])
      );
      if (bounds.isValid()) {
        if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
          map.setView(bounds.getNorthEast(), 17, { animate: true });
        } else {
          map.fitBounds(bounds, { padding: [60, 60], maxZoom: 18, animate: true });
        }
      }
    } catch (e) {
      console.error("Error setting map bounds", e);
    }
  }, [beacons, map]);

  return null;
}

export default function CadastralMapInner({
  beacons,
  centroid,
  boundarySegments,
  riskLevel,
  statedArea,
  computedArea,
  locality,
}: CadastralMapInnerProps) {
  const isFraud = riskLevel === "CRITICAL_FRAUD" || riskLevel === "HIGH";

  // Center on centroid or default to Douala, Cameroon (4.05°N, 9.70°E)
  const centerLat = centroid?.latitude || (beacons.length > 0 ? beacons[0].latitude : 4.0511);
  const centerLon = centroid?.longitude || (beacons.length > 0 ? beacons[0].longitude : 9.7679);

  const polygonPositions: [number, number][] = beacons.map((b) => [b.latitude, b.longitude]);

  // Custom marker icon creator
  const createBeaconIcon = (borneId: string) => {
    return L.divIcon({
      className: "beacon-marker-icon",
      html: `<div class="beacon-pin-badge ${isFraud ? "fraud" : ""}">${borneId}</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -18],
    });
  };

  const centroidIcon = L.divIcon({
    className: "beacon-marker-icon",
    html: `<div class="centroid-pin-badge">★</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });

  return (
    <div className="relative w-full h-[520px] rounded-xl overflow-hidden border border-slate-200 shadow-md">
      <MapContainer
        center={[centerLat, centerLon]}
        zoom={17}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* High-Resolution Satellite Base Layer (Esri World Imagery) */}
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>, Earthstar Geographics'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
        />

        {/* Cadastral Polygon Boundary */}
        {polygonPositions.length >= 3 && (
          <Polygon
            positions={polygonPositions}
            pathOptions={{
              color: isFraud ? "#CE1126" : "#007A3D",
              weight: isFraud ? 4 : 3,
              dashArray: isFraud ? "6, 6" : undefined,
              fillColor: isFraud ? "#CE1126" : "#007A3D",
              fillOpacity: isFraud ? 0.35 : 0.25,
            }}
          >
            <Popup>
              <div className="text-xs p-1">
                <p className="font-bold text-slate-900 border-b pb-1 mb-1">
                  Polygone Cadastral · {locality}
                </p>
                <p>Superficie déclarée: <b>{statedArea.toLocaleString()} m²</b></p>
                <p>Superficie mesurée: <b>{computedArea.toLocaleString()} m²</b></p>
                <p className={`font-semibold mt-1 ${isFraud ? "text-red-600" : "text-green-700"}`}>
                  Statut: {isFraud ? "⚠️ Non-conforme / Fraude" : "✅ Conforme MINDCAF"}
                </p>
              </div>
            </Popup>
          </Polygon>
        )}

        {/* Individual Beacons (Bornes B1..Bn) */}
        {beacons.map((b, idx) => (
          <Marker
            key={`${b.borne_id}-${idx}`}
            position={[b.latitude, b.longitude]}
            icon={createBeaconIcon(b.borne_id)}
          >
            <Popup>
              <div className="text-xs p-1 space-y-1">
                <div className="flex items-center gap-2 border-b pb-1">
                  <span className={`px-2 py-0.5 rounded font-bold text-white text-[10px] ${isFraud ? "bg-red-600" : "bg-emerald-700"}`}>
                    Borne {b.borne_id}
                  </span>
                  <span className="text-slate-500 text-[10px]">{b.description || "Borne d'angle"}</span>
                </div>
                <div className="font-mono text-[11px] text-slate-700 space-y-0.5">
                  <p>X (Est): <b>{b.utm_x.toLocaleString()} m</b></p>
                  <p>Y (Nord): <b>{b.utm_y.toLocaleString()} m</b></p>
                  <p>Lat: {b.latitude.toFixed(6)}°</p>
                  <p>Lon: {b.longitude.toFixed(6)}°</p>
                  {b.elevation_m !== undefined && <p>Alt: {b.elevation_m} m</p>}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Centroid / Barycentre Pin */}
        {centroid && (
          <Marker
            position={[centroid.latitude, centroid.longitude]}
            icon={centroidIcon}
          >
            <Popup>
              <div className="text-xs p-1">
                <p className="font-bold text-slate-900">Barycentre / Centre de gravité</p>
                <p className="font-mono text-[11px] text-slate-600">
                  {centroid.latitude.toFixed(6)}°, {centroid.longitude.toFixed(6)}°
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Superficie: {computedArea.toLocaleString()} m²</p>
              </div>
            </Popup>
          </Marker>
        )}

        <MapAutoBounds beacons={beacons} />
      </MapContainer>

      {/* Floating Badge on Map */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow border border-slate-200 text-xs flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${isFraud ? "bg-red-500 animate-pulse" : "bg-emerald-600"}`} />
        <span className="font-bold text-slate-800">
          {isFraud ? "Alerte Anomalie / Fraude" : "Bornes Géolocalisées (WGS84)"}
        </span>
        <span className="text-slate-400">|</span>
        <span className="text-slate-600">{beacons.length} Bornes</span>
      </div>
    </div>
  );
}
