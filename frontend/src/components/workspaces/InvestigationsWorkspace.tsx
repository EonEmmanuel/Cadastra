"use client";

import React, { useMemo, useState } from "react";
import {
  Search,
  ShieldAlert,
  ShieldCheck,
  Crosshair,
  MapPin,
  Plus,
} from "lucide-react";
import { VerificationRecord } from "@/types/cadastre";
import {
  EmptyState,
  RowAction,
  StatTile,
  WorkspaceHeader,
} from "@/components/workspaces/WorkspacePrimitives";
import {
  formatRecordDate,
  getSourceLabel,
  getVerdict,
  isFlagged,
  summarizeRecords,
} from "@/utils/records";

interface InvestigationsWorkspaceProps {
  records: VerificationRecord[];
  onOpenRecord: (record: VerificationRecord) => void;
  onOpenManualModal: () => void;
  onOpenLanding: () => void;
}

type Filter = "all" | "flagged" | "compliant";

export default function InvestigationsWorkspace({
  records,
  onOpenRecord,
  onOpenManualModal,
  onOpenLanding,
}: InvestigationsWorkspaceProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const summary = summarizeRecords(records);

  const visibleRecords = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return records
      .filter((record) => (filter === "all" ? true : filter === "flagged" ? isFlagged(record) : !isFlagged(record)))
      .filter((record) => {
        if (!needle) return true;
        return [
          record.request.plan_id,
          record.request.title_number,
          record.request.locality,
          record.request.region,
          record.request.owner_name,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(needle));
      });
  }, [records, filter, query]);

  return (
    <div className="flex h-full flex-col gap-5 overflow-hidden">
      <WorkspaceHeader
        eyebrow="Enquêtes foncières · Session en cours"
        title="Investigations"
        description="Chaque plan audité dans cette session est consigné ici avec sa géométrie, son statut de vérification et son empreinte SHA-256. Ouvrez un dossier pour retrouver la parcelle sur la carte."
        actions={
          <>
            <button
              type="button"
              onClick={onOpenManualModal}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              Saisie manuelle
            </button>
            <button
              type="button"
              onClick={onOpenLanding}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white px-3 py-2 text-xs font-semibold text-black transition hover:bg-zinc-200"
            >
              <Crosshair className="h-3.5 w-3.5" />
              Nouvel audit
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <StatTile label="Dossiers audités" value={String(summary.total)} detail="Session en cours" />
        <StatTile
          label="Conformes"
          value={String(summary.compliant)}
          detail="Tolérance 76-165 respectée"
          tone="success"
        />
        <StatTile
          label="Signalés"
          value={String(summary.flagged)}
          detail="Fraude ou géométrie invalide"
          tone={summary.flagged > 0 ? "danger" : "neutral"}
        />
        <StatTile
          label="Écart maximal"
          value={`${summary.maxDiscrepancy.toFixed(1)} %`}
          detail="Surface déclarée vs calculée"
          tone={summary.maxDiscrepancy > 1 ? "warning" : "neutral"}
        />
      </div>

      {records.length === 0 ? (
        <EmptyState
          icon={Crosshair}
          title="Aucune enquête ouverte"
          description="Lancez un audit depuis l'accueil en important un plan de bornage, ou saisissez les coordonnées UTM d'une parcelle. Les dossiers apparaîtront ici automatiquement."
          primaryAction={{ label: "Importer un plan", onClick: onOpenLanding }}
          secondaryAction={{ label: "Saisir des coordonnées", onClick: onOpenManualModal }}
          footnote="Aucune donnée simulée · dossiers réels uniquement"
        />
      ) : (
        <>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.02] p-1">
              {(
                [
                  { id: "all", label: `Tous (${records.length})` },
                  { id: "flagged", label: `Signalés (${summary.flagged})` },
                  { id: "compliant", label: `Conformes (${summary.compliant})` },
                ] as { id: Filter; label: string }[]
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition ${
                    filter === item.id
                      ? "bg-white text-black shadow"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2">
              <Search className="h-3.5 w-3.5 text-zinc-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher un plan, une localité, un titre…"
                className="w-full bg-transparent text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none sm:w-64"
              />
            </label>
          </div>

          <div className="flex-1 overflow-auto rounded-2xl border border-white/[0.08]">
            <table className="w-full min-w-[760px] border-collapse text-left text-xs">
              <thead className="sticky top-0 z-10 bg-[#090B10]">
                <tr className="border-b border-white/[0.08] font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                  <th className="px-4 py-3 font-medium">Dossier</th>
                  <th className="px-4 py-3 font-medium">Localité</th>
                  <th className="px-4 py-3 font-medium">Zone</th>
                  <th className="px-4 py-3 text-right font-medium">Déclarée</th>
                  <th className="px-4 py-3 text-right font-medium">Calculée</th>
                  <th className="px-4 py-3 text-right font-medium">Écart</th>
                  <th className="px-4 py-3 font-medium">Verdict</th>
                  <th className="px-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleRecords.map((record) => {
                  const verdict = getVerdict(record.result);
                  const toneClass =
                    verdict.tone === "danger"
                      ? "bg-red-500/10 text-red-300 border-red-500/25"
                      : verdict.tone === "warning"
                      ? "bg-amber-500/10 text-amber-300 border-amber-500/25"
                      : "bg-emerald-500/10 text-emerald-300 border-emerald-500/25";
                  const delta = record.result.discrepancy_percentage;

                  return (
                    <tr
                      key={record.id}
                      className="border-b border-white/[0.05] transition last:border-0 hover:bg-white/[0.025]"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {verdict.tone === "success" ? (
                            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                          ) : (
                            <ShieldAlert
                              className={`h-3.5 w-3.5 shrink-0 ${
                                verdict.tone === "danger" ? "text-red-400" : "text-amber-400"
                              }`}
                            />
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-mono font-semibold text-white">
                              {record.result.plan_id}
                            </p>
                            <p className="truncate text-[10px] text-zinc-500">
                              {record.request.title_number || "Titre en cours"} ·{" "}
                              {getSourceLabel(record.source)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-300">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-zinc-600" />
                          <span className="truncate">{record.request.locality}</span>
                        </span>
                        <span className="mt-0.5 block text-[10px] text-zinc-500">
                          {record.request.region}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-zinc-400">
                        {record.result.utm_zone}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-zinc-300">
                        {Math.round(record.result.stated_area_sqm).toLocaleString()} m²
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-zinc-300">
                        {Math.round(record.result.computed_area_sqm).toLocaleString()} m²
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-mono font-semibold ${
                          Math.abs(delta) > 1 ? "text-red-400" : "text-emerald-400"
                        }`}
                      >
                        {delta > 0 ? "+" : ""}
                        {delta.toFixed(1)} %
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold ${toneClass}`}
                        >
                          {verdict.label}
                        </span>
                        <span className="mt-1 block text-[10px] text-zinc-600">
                          {formatRecordDate(record.timestamp)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <RowAction
                          label="Ouvrir"
                          onClick={() => onOpenRecord(record)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {visibleRecords.length === 0 && (
              <div className="px-6 py-14 text-center text-xs text-zinc-500">
                Aucun dossier ne correspond à ce filtre ou à cette recherche.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
