"use client";

import React, { useState } from "react";
import { Plus, Trash2, RefreshCw, Layers } from "lucide-react";
import { PlanVerificationRequest, BeaconInput, UTMZone } from "@/types/cadastre";

interface ManualCoordinateEditorProps {
  currentRequest: PlanVerificationRequest;
  onApply: (request: PlanVerificationRequest) => void;
  isLoading: boolean;
}

export default function ManualCoordinateEditor({
  currentRequest,
  onApply,
  isLoading,
}: ManualCoordinateEditorProps) {
  const [formData, setFormData] = useState<PlanVerificationRequest>({ ...currentRequest });

  const handleFieldChange = (field: keyof PlanVerificationRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBeaconChange = (index: number, field: keyof BeaconInput, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.beacons];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, beacons: updated };
    });
  };

  const handleAddBeacon = () => {
    setFormData((prev) => {
      const nextNum = prev.beacons.length + 1;
      const last = prev.beacons[prev.beacons.length - 1] || { x: 583420, y: 446100 };
      const newBeacon: BeaconInput = {
        borne_id: `B${nextNum}`,
        x: last.x + 20,
        y: last.y - 20,
        z: 25.0,
        description: `Borne B${nextNum}`,
      };
      return { ...prev, beacons: [...prev.beacons, newBeacon] };
    });
  };

  const handleRemoveBeacon = (index: number) => {
    if (formData.beacons.length <= 3) {
      alert("Au moins 3 bornes sont nécessaires pour fermer un polygone cadastral.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      beacons: prev.beacons.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Éditeur Manuel des Bornes & Coordonnées</h3>
          <p className="text-xs text-slate-500">
            Ajustez les coordonnées X/Y en UTM ou la superficie déclarée pour tester la sensibilité anti-fraude.
          </p>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow flex items-center gap-2 transition active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Recalculer & Auditer
        </button>
      </div>

      {/* Plan Metadata Fields */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="text-[11px] font-bold text-slate-600 block mb-1">Identifiant Plan</label>
          <input
            type="text"
            value={formData.plan_id}
            onChange={(e) => handleFieldChange("plan_id", e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            required
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-600 block mb-1">Localité / Quartier</label>
          <input
            type="text"
            value={formData.locality}
            onChange={(e) => handleFieldChange("locality", e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            required
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-600 block mb-1">Zone UTM Cameroun</label>
          <select
            value={formData.utm_zone}
            onChange={(e) => handleFieldChange("utm_zone", e.target.value as UTMZone)}
            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
          >
            <option value="32N">UTM 32N (Douala, Yaoundé, Ouest)</option>
            <option value="33N">UTM 33N (Garoua, Maroua, Est)</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-600 block mb-1">Superficie Déclarée (m²)</label>
          <input
            type="number"
            step="0.01"
            value={formData.stated_area_sqm}
            onChange={(e) => handleFieldChange("stated_area_sqm", parseFloat(e.target.value) || 0)}
            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold text-slate-900"
            required
          />
        </div>
      </div>

      {/* Beacons Table */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700">Bornes du Périmètre ({formData.beacons.length})</span>
          <button
            type="button"
            onClick={handleAddBeacon}
            className="text-xs text-emerald-700 font-bold hover:text-emerald-800 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Ajouter une borne
          </button>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-2 px-3">Borne</th>
                <th className="py-2 px-3">X / Esting (m)</th>
                <th className="py-2 px-3">Y / Northing (m)</th>
                <th className="py-2 px-3">Altitude Z (m)</th>
                <th className="py-2 px-3">Description</th>
                <th className="py-2 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {formData.beacons.map((b, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-1.5 px-3">
                    <input
                      type="text"
                      value={b.borne_id}
                      onChange={(e) => handleBeaconChange(idx, "borne_id", e.target.value)}
                      className="w-16 px-1.5 py-1 rounded border border-slate-200 font-bold"
                    />
                  </td>
                  <td className="py-1.5 px-3">
                    <input
                      type="number"
                      step="0.01"
                      value={b.x}
                      onChange={(e) => handleBeaconChange(idx, "x", parseFloat(e.target.value) || 0)}
                      className="w-28 px-1.5 py-1 rounded border border-slate-200"
                    />
                  </td>
                  <td className="py-1.5 px-3">
                    <input
                      type="number"
                      step="0.01"
                      value={b.y}
                      onChange={(e) => handleBeaconChange(idx, "y", parseFloat(e.target.value) || 0)}
                      className="w-28 px-1.5 py-1 rounded border border-slate-200"
                    />
                  </td>
                  <td className="py-1.5 px-3">
                    <input
                      type="number"
                      step="0.1"
                      value={b.z ?? ""}
                      onChange={(e) => handleBeaconChange(idx, "z", e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder="Opt"
                      className="w-20 px-1.5 py-1 rounded border border-slate-200"
                    />
                  </td>
                  <td className="py-1.5 px-3">
                    <input
                      type="text"
                      value={b.description ?? ""}
                      onChange={(e) => handleBeaconChange(idx, "description", e.target.value)}
                      placeholder="Borne béton"
                      className="w-full min-w-[140px] px-1.5 py-1 rounded border border-slate-200 font-sans"
                    />
                  </td>
                  <td className="py-1.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveBeacon(idx)}
                      disabled={formData.beacons.length <= 3}
                      className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </form>
  );
}
