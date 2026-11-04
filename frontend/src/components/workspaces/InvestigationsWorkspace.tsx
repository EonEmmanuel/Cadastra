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
import { useLanguage } from "@/i18n/LanguageContext";

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
  const { t, isEn } = useLanguage();
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
        eyebrow={t.investigationsEyebrow}
        title={t.investigationsTitle}
        description={t.investigationsDesc}
        actions={
          <>
            <button
              type="button"
              onClick={onOpenManualModal}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              {t.btnManualInput}
            </button>
            <button
              type="button"
              onClick={onOpenLanding}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white px-3 py-2 text-xs font-semibold text-black transition hover:bg-zinc-200"
            >
              <Crosshair className="h-3.5 w-3.5" />
              {t.btnNewAudit}
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <StatTile label={t.statTotalAudited} value={String(summary.total)} detail={isEn ? "Current session" : "Session en cours"} />
        <StatTile
          label={t.statCompliant}
          value={String(summary.compliant)}
          detail={isEn ? "Decree 76-165 respected" : "Tolérance 76-165 respectée"}
          tone="success"
        />
        <StatTile
          label={t.statFlagged}
          value={String(summary.flagged)}
          detail={isEn ? "Fraud or invalid geometry" : "Fraude ou géométrie invalide"}
          tone={summary.flagged > 0 ? "danger" : "neutral"}
        />
        <StatTile
          label={t.statAvgDiscrepancy}
          value={`${summary.maxDiscrepancy.toFixed(1)} %`}
          detail={isEn ? "Stated vs calculated" : "Surface déclarée vs calculée"}
          tone={summary.maxDiscrepancy > 1 ? "warning" : "neutral"}
        />
      </div>

      {records.length === 0 ? (
        <EmptyState
          icon={Crosshair}
          title={t.emptyInvestigationsTitle}
          description={t.emptyInvestigationsDesc}
          primaryAction={{ label: t.btnUploadDocument, onClick: onOpenLanding }}
          secondaryAction={{ label: t.btnManualInput, onClick: onOpenManualModal }}
          footnote={isEn ? "Real audit records only · No synthetic fakes" : "Aucune donnée simulée · dossiers réels uniquement"}
        />
      ) : (
        <>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.02] p-1">
              {(
                [
                  { id: "all", label: `${t.filterAll} (${records.length})` },
                  { id: "flagged", label: `${t.filterFlagged} (${summary.flagged})` },
                  { id: "compliant", label: `${t.filterCompliant} (${summary.compliant})` },
                ] as { id: Filter; label: string }[]
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
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
              <Search className="h-3.5 w-3.5 text-zinc-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t.searchInvestigationsPlaceholder}
                className="w-full bg-transparent text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none sm:w-64"
              />
            </label>
          </div>

          <div className="flex-1 overflow-auto rounded-2xl border border-white/[0.08]">
            <table className="w-full min-w-[760px] border-collapse text-left text-xs">
              <thead className="sticky top-0 z-10 bg-[#090B10]">
                <tr className="border-b border-white/[0.08] font-mono text-xs uppercase tracking-wider text-zinc-400">
                  <th className="px-4 py-3 font-semibold">{t.colPlanId}</th>
                  <th className="px-4 py-3 font-semibold">{t.colLocality}</th>
                  <th className="px-4 py-3 font-semibold">Zone</th>
                  <th className="px-4 py-3 text-right font-semibold">{t.colAreaStated}</th>
                  <th className="px-4 py-3 text-right font-semibold">{t.colAreaComputed}</th>
                  <th className="px-4 py-3 text-right font-semibold">{t.discrepancy}</th>
                  <th className="px-4 py-3 font-semibold">{t.colVerdict}</th>
                  <th className="px-4 py-3 text-right font-semibold">{t.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {visibleRecords.map((record) => {
                  const verdict = getVerdict(record.result);
                  const toneClass =
                    verdict.tone === "danger"
                      ? "bg-red-500/15 text-red-300 border-red-500/30"
                      : verdict.tone === "warning"
                      ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                      : "bg-[#00DF8F]/15 text-[#00DF8F] border-[#00DF8F]/30";
                  const delta = record.result.discrepancy_percentage;

                  return (
                    <tr
                      key={record.id}
                      className="border-b border-white/[0.05] transition last:border-0 hover:bg-white/[0.025]"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {verdict.tone === "success" ? (
                            <ShieldCheck className="h-4 w-4 shrink-0 text-[#00DF8F]" />
                          ) : (
                            <ShieldAlert
                              className={`h-4 w-4 shrink-0 ${
                                verdict.tone === "danger" ? "text-red-400" : "text-amber-400"
                              }`}
                            />
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-mono text-xs font-bold text-white">
                              {record.result.plan_id}
                            </p>
                            <p className="truncate text-xs text-zinc-400 mt-0.5">
                              {record.request.title_number || "Titre en cours"} ·{" "}
                              {getSourceLabel(record.source)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-300">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                          <span className="truncate text-xs font-medium text-zinc-200">{record.request.locality}</span>
                        </span>
                        <span className="mt-0.5 block text-xs text-zinc-400">
                          {record.request.region}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs font-medium text-[#93C5FD]">
                        {record.result.utm_zone}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-zinc-200">
                        {Math.round(record.result.stated_area_sqm).toLocaleString()} m²
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-zinc-200">
                        {Math.round(record.result.computed_area_sqm).toLocaleString()} m²
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-mono text-xs font-bold ${
                          Math.abs(delta) > 1 ? "text-red-400" : "text-[#00DF8F]"
                        }`}
                      >
                        {delta > 0 ? "+" : ""}
                        {delta.toFixed(1)} %
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-md border px-2.5 py-0.5 text-xs font-semibold ${toneClass}`}
                        >
                          {verdict.label}
                        </span>
                        <span className="mt-1 block text-xs text-zinc-400">
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
