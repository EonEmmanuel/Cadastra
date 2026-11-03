"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Plus,
  Trash2,
  Compass,
  FileSpreadsheet,
} from "lucide-react";
import { BeaconInput, PlanVerificationRequest } from "@/types/cadastre";

interface CustomPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (plan: PlanVerificationRequest) => void;
}

// Ground-truth parcel from test_data/douala_yassa_utm32n.json. Loading it is a
// real reference fill, not a simulated audit.
const DOUALA_YASSA_EXAMPLE = {
  planId: "DLA-YAS-2024-001",
  titleNumber: "TF 48291/Wouri",
  ownerName: "Tchamba Ndongo Jean-Pierre",
  locality: "Douala - Yassa (Zone Résidentielle)",
  region: "Littoral",
  division: "Wouri",
  statedArea: 980,
  beacons: [
    { borne_id: "B1", x: 583420, y: 446100, z: 24.5, description: "Borne béton d'angle Nord-Ouest" },
    { borne_id: "B2", x: 583455, y: 446100, z: 24.8, description: "Borne béton d'angle Nord-Est" },
    { borne_id: "B3", x: 583455, y: 446072, z: 25.1, description: "Borne béton d'angle Sud-Est" },
    { borne_id: "B4", x: 583420, y: 446072, z: 24.9, description: "Borne béton d'angle Sud-Ouest" },
  ],
};

export default function CustomPlanModal({
  isOpen,
  onClose,
  onSubmit,
}: CustomPlanModalProps) {
  const [planId, setPlanId] = useState("");
  const [titleNumber, setTitleNumber] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [locality, setLocality] = useState("");
  const [region, setRegion] = useState("Littoral");
  const [division, setDivision] = useState("");
  const [utmZone, setUtmZone] = useState<"32N" | "33N">("32N");
  const [statedArea, setStatedArea] = useState<number | "">("");
  const [formError, setFormError] = useState<string | null>(null);

  const [beacons, setBeacons] = useState<BeaconInput[]>([
    { borne_id: "B1", x: "" as any, y: "" as any, z: 0, description: "Borne B1" },
    { borne_id: "B2", x: "" as any, y: "" as any, z: 0, description: "Borne B2" },
    { borne_id: "B3", x: "" as any, y: "" as any, z: 0, description: "Borne B3" },
    { borne_id: "B4", x: "" as any, y: "" as any, z: 0, description: "Borne B4" },
  ]);

  // Close on Escape, matching the other dialogs and avoiding a keyboard trap.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const fillExample = () => {
    setPlanId(DOUALA_YASSA_EXAMPLE.planId);
    setTitleNumber(DOUALA_YASSA_EXAMPLE.titleNumber);
    setOwnerName(DOUALA_YASSA_EXAMPLE.ownerName);
    setLocality(DOUALA_YASSA_EXAMPLE.locality);
    setRegion(DOUALA_YASSA_EXAMPLE.region);
    setDivision(DOUALA_YASSA_EXAMPLE.division);
    setStatedArea(DOUALA_YASSA_EXAMPLE.statedArea);
    setUtmZone("32N");
    setBeacons(DOUALA_YASSA_EXAMPLE.beacons.map((beacon) => ({ ...beacon })));
    setFormError(null);
  };

  const handleAddBeacon = () => {
    const nextNum = beacons.length + 1;
    setBeacons([
      ...beacons,
      {
        borne_id: `B${nextNum}`,
        x: "" as any,
        y: "" as any,
        z: 0,
        description: `Borne B${nextNum}`,
      },
    ]);
    setFormError(null);
  };

  const handleRemoveBeacon = (index: number) => {
    if (beacons.length <= 3) {
      setFormError("Un polygone cadastral valide requiert au minimum 3 bornes.");
      return;
    }
    setBeacons(beacons.filter((_, i) => i !== index));
  };

  const handleUpdateBeacon = (index: number, field: keyof BeaconInput, value: any) => {
    const updated = [...beacons];
    updated[index] = { ...updated[index], [field]: value };
    setBeacons(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that coordinates are valid numbers
    const validBeacons = beacons.map((b) => ({
      ...b,
      x: Number(b.x) || 0,
      y: Number(b.y) || 0,
      z: b.z ? Number(b.z) : 0,
    }));

    if (validBeacons.some((b) => b.x === 0 || b.y === 0)) {
      setFormError("Renseignez les coordonnées X et Y de chaque borne avant de lancer l'audit.");
      return;
    }

    if (!statedArea || Number(statedArea) <= 0) {
      setFormError("La superficie déclarée doit être supérieure à 0 m².");
      return;
    }

    const req: PlanVerificationRequest = {
      plan_id: planId.trim() || `PLAN-${Date.now().toString().slice(-6)}`,
      title_number: titleNumber.trim() || undefined,
      owner_name: ownerName.trim() || "Propriétaire déclarant",
      locality: locality.trim() || "Cameroun",
      region: region.trim() || "Littoral",
      division: division.trim() || undefined,
      utm_zone: utmZone,
      stated_area_sqm: Number(statedArea) || 0,
      date_surveyed: new Date().toISOString().split("T")[0],
      beacons: validBeacons,
    };
    onSubmit(req);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-sans"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="custom-plan-title"
        className="w-full max-w-2xl bg-[#090B10] rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/[0.08] max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white/[0.02] border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 id="custom-plan-title" className="text-sm font-bold text-white tracking-tight">
                Saisie Manuelle des Coordonnées Géodésiques
              </h3>
              <p className="text-xs text-zinc-400">
                Système Géodésique WGS84 · Projection UTM Snyder
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fillExample}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] px-2.5 py-1.5 text-[10px] font-medium text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
              title="Remplir avec une parcelle réelle de test_data"
            >
              <FileSpreadsheet className="w-3 h-3 text-[#60A5FA]" />
              Exemple Douala
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form data-lenis-prevent onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Identifiant du Plan
              </label>
              <input
                type="text"
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                placeholder="ex: PLAN-2026-001"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Numéro du Titre Foncier
              </label>
              <input
                type="text"
                value={titleNumber}
                onChange={(e) => setTitleNumber(e.target.value)}
                placeholder="ex: TF 12345/Wouri"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Propriétaire déclarant
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="ex: Tchamba Ndongo Jean-Pierre"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Localité / Ville
              </label>
              <input
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="ex: Douala - Bonanjo"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Région
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#090B10] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30"
              >
                <option value="Littoral">Littoral</option>
                <option value="Centre">Centre</option>
                <option value="Sud">Sud</option>
                <option value="Nord">Nord</option>
                <option value="Ouest">Ouest</option>
                <option value="Adamaoua">Adamaoua</option>
                <option value="Est">Est</option>
                <option value="Extrême-Nord">Extrême-Nord</option>
                <option value="Nord-Ouest">Nord-Ouest</option>
                <option value="Sud-Ouest">Sud-Ouest</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Zone UTM (Cameroun)
              </label>
              <select
                value={utmZone}
                onChange={(e) => setUtmZone(e.target.value as "32N" | "33N")}
                className="w-full px-3 py-2 rounded-xl bg-[#090B10] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30 font-mono"
              >
                <option value="32N">UTM Zone 32N (Littoral, Centre, Ouest, Sud)</option>
                <option value="33N">UTM Zone 33N (Nord, Adamaoua, Extrême-Nord)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Superficie Déclarée (m²)
              </label>
              <input
                type="number"
                value={statedArea}
                onChange={(e) => setStatedArea(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="ex: 1500"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 font-mono"
              />
            </div>
          </div>

          {/* Coordinate Beacons Table */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-400" />
                Tableau des Bornes (Coordonnées Métriques UTM)
              </span>

              <button
                type="button"
                onClick={handleAddBeacon}
                className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-[11px] text-zinc-300 transition flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Ajouter une borne</span>
              </button>
            </div>

            <div className="space-y-1.5 font-mono text-xs">
              {beacons.map((b, i) => (
                <div
                  key={i}
                  className="grid grid-cols-12 gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] items-center"
                >
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={b.borne_id}
                      onChange={(e) => handleUpdateBeacon(i, "borne_id", e.target.value)}
                      className="w-full bg-transparent text-white font-bold text-xs focus:outline-none"
                    />
                  </div>

                  <div className="col-span-4">
                    <input
                      type="number"
                      step="0.01"
                      value={b.x}
                      onChange={(e) => handleUpdateBeacon(i, "x", e.target.value)}
                      placeholder="X (Easting)"
                      className="w-full px-2 py-1 rounded bg-black/40 border border-white/[0.08] text-zinc-200 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="col-span-4">
                    <input
                      type="number"
                      step="0.01"
                      value={b.y}
                      onChange={(e) => handleUpdateBeacon(i, "y", e.target.value)}
                      placeholder="Y (Northing)"
                      className="w-full px-2 py-1 rounded bg-black/40 border border-white/[0.08] text-zinc-200 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveBeacon(i)}
                      className="p-1 rounded text-zinc-500 hover:text-red-400 transition"
                      title="Supprimer la borne"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inline validation: no browser alert(), no silent failure */}
          {formError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/[0.08] px-3.5 py-2.5 text-xs text-red-300">
              {formError}
            </div>
          )}

          {/* Submit */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-xs text-zinc-300 transition"
            >
              Annuler
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition shadow-lg active:scale-95"
            >
              Lancer l&apos;Audit Géodésique
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
