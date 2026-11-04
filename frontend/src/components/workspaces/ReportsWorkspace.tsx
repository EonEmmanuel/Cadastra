"use client";

import React from "react";
import {
  Download,
  FileText,
  ShieldCheck,
  FileWarning,
  Clock,
  Layers,
} from "lucide-react";
import { VerificationRecord } from "@/types/cadastre";
import {
  EmptyState,
  StatTile,
  WorkspaceHeader,
} from "@/components/workspaces/WorkspacePrimitives";
import { formatRecordDate, getVerdict, isFlagged, summarizeRecords } from "@/utils/records";

interface ReportsWorkspaceProps {
  records: VerificationRecord[];
  downloadingId: string | null;
  onDownload: (record: VerificationRecord) => void;
  onOpenRecord: (record: VerificationRecord) => void;
  onOpenLanding: () => void;
}

export default function ReportsWorkspace({
  records,
  downloadingId,
  onDownload,
  onOpenRecord,
  onOpenLanding,
}: ReportsWorkspaceProps) {
  const summary = summarizeRecords(records);

  return (
    <div className="flex h-full flex-col gap-5 overflow-hidden">
      <WorkspaceHeader
        eyebrow="Rapports d'audit · Analyse géodésique"
        title="Rapports"
        description="Les certificats bilingues générés pour cette session. Chaque PDF reprend la table des bornes, le verdict de tolérance et le sceau SHA-256 produit par le moteur géodésique."
        actions={
          <button
            type="button"
            onClick={onOpenLanding}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black transition hover:bg-zinc-200"
          >
            <FileText className="h-3.5 w-3.5" />
            Nouvel audit
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <StatTile label="Rapports disponibles" value={String(summary.total)} detail="Générés cette session" />
        <StatTile
          label="Certificats conformes"
          value={String(summary.compliant)}
          detail="Prêts à archiver"
          tone="success"
        />
        <StatTile
          label="Dossiers signalés"
          value={String(summary.flagged)}
          detail="Nécessitent une revue"
          tone={summary.flagged > 0 ? "danger" : "neutral"}
        />
        <StatTile
          label="Surface auditée"
          value={`${Math.round(summary.totalArea).toLocaleString()} m²`}
          detail="Emprise calculée cumulée"
        />
      </div>

      {records.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aucun rapport à générer"
          description="Le certificat d'audit bilingue est produit à partir d'un plan réellement vérifié. Lancez un audit : le rapport apparaîtra ici, téléchargeable en PDF."
          primaryAction={{ label: "Lancer un audit", onClick: onOpenLanding }}
          footnote="Rapport PDF · FR / EN · empreinte SHA-256"
        />
      ) : (
        <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
          {records.map((record) => {
            const verdict = getVerdict(record.result);
            const flagged = isFlagged(record);
            const isDownloading = downloadingId === record.id;

            return (
              <div
                key={record.id}
                className="group rounded-xl border border-white/[0.08] bg-[#040711]/60 backdrop-blur-md p-4 transition hover:border-[#60A5FA]/30 hover:bg-[#040711]/90"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                        flagged
                          ? "border-red-500/25 bg-red-500/[0.08] text-red-400"
                          : "border-[#00DF8F]/30 bg-[#00DF8F]/10 text-[#00DF8F]"
                      }`}
                    >
                      {flagged ? (
                        <FileWarning className="h-5 w-5" />
                      ) : (
                        <ShieldCheck className="h-5 w-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-mono text-sm font-bold text-white">
                          {record.result.plan_id}
                        </h3>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                            verdict.tone === "danger"
                              ? "border-red-500/25 bg-red-500/10 text-red-300"
                              : verdict.tone === "warning"
                              ? "border-amber-500/25 bg-amber-500/10 text-amber-300"
                              : "border-[#00DF8F]/30 bg-[#00DF8F]/10 text-[#00DF8F]"
                          }`}
                        >
                          {verdict.label}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-zinc-300">
                        Certificat d&apos;audit géodésique · {record.request.locality} ·{" "}
                        {record.request.region}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-zinc-400">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-zinc-500" />
                          {formatRecordDate(record.timestamp)}
                        </span>
                        <span className="flex items-center gap-1.5 text-[#93C5FD]">
                          <Layers className="h-3.5 w-3.5 text-[#60A5FA]" />
                          {record.result.utm_zone} · {record.result.epsg_code}
                        </span>
                        <span className="truncate">
                          SHA-256 {record.result.verification_hash.slice(0, 16)}…
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 sm:pl-4">
                    <button
                      type="button"
                      onClick={() => onOpenRecord(record)}
                      className="rounded-lg border border-white/[0.1] bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-zinc-200 transition hover:border-[#60A5FA]/40 hover:bg-[#60A5FA]/10 hover:text-white"
                    >
                      Voir le dossier
                    </button>
                    <a
                      href={`/api/report/pdf?plan_id=${encodeURIComponent(record.request.plan_id || record.id)}&disposition=attachment`}
                      download={`Cadastra_Cameroon_Audit_${(record.request.plan_id || record.id).replace(/[^a-zA-Z0-9_\-\.]/g, "_")}.pdf`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-xs font-semibold text-black transition hover:bg-zinc-200"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>PDF bilingue</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
