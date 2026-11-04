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
import { useLanguage } from "@/i18n/LanguageContext";

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
  const { t, isEn } = useLanguage();
  const summary = summarizeRecords(records);

  return (
    <div className="flex h-full flex-col gap-5 overflow-hidden">
      <WorkspaceHeader
        eyebrow={t.reportsEyebrow}
        title={t.reportsTitle}
        description={t.reportsDesc}
        actions={
          <button
            type="button"
            onClick={onOpenLanding}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black transition hover:bg-zinc-200"
          >
            <FileText className="h-3.5 w-3.5" />
            {t.btnNewAudit}
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <StatTile label={t.reportsTotalCertificates} value={String(summary.total)} detail={isEn ? "Generated this session" : "Générés cette session"} />
        <StatTile
          label={t.statCompliant}
          value={String(summary.compliant)}
          detail={isEn ? "Ready to archive" : "Prêts à archiver"}
          tone="success"
        />
        <StatTile
          label={t.statFlagged}
          value={String(summary.flagged)}
          detail={isEn ? "Require review" : "Nécessitent une revue"}
          tone={summary.flagged > 0 ? "danger" : "neutral"}
        />
        <StatTile
          label={isEn ? "Audited Area" : "Surface auditée"}
          value={`${Math.round(summary.totalArea).toLocaleString()} m²`}
          detail={isEn ? "Cumulative footprint" : "Emprise calculée cumulée"}
        />
      </div>

      {records.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={t.emptyReportsTitle}
          description={t.emptyReportsDesc}
          primaryAction={{ label: t.btnNewAudit, onClick: onOpenLanding }}
          footnote={isEn ? "PDF Report · EN / FR bilingual · SHA-256 seal" : "Rapport PDF · FR / EN · empreinte SHA-256"}
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
                className="group rounded-xl border border-white/[0.08] bg-[#0B0E14] p-4 transition hover:border-white/20 hover:bg-[#10141D]"
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
                          className={`rounded-md border px-2.5 py-0.5 text-xs font-semibold ${
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
                        <span className="flex items-center gap-1.5 text-zinc-400">
                          <Layers className="h-3.5 w-3.5 text-zinc-400" />
                          {record.result.utm_zone} · {record.result.epsg_code}
                        </span>
                        <span className="truncate">
                          SHA-256 {record.result.verification_hash.slice(0, 16)}…
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap shrink-0 items-center gap-2 sm:pl-4">
                    <button
                      type="button"
                      onClick={() => onOpenRecord(record)}
                      className="rounded-md border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.08] hover:text-white whitespace-nowrap"
                    >
                      {t.btnViewDossier}
                    </button>
                    <a
                      href={`/api/report/pdf?plan_id=${encodeURIComponent(record.request.plan_id || record.id)}&disposition=attachment`}
                      download={`Cadastra_Cameroon_Audit_${(record.request.plan_id || record.id).replace(/[^a-zA-Z0-9_\-\.]/g, "_")}.pdf`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-md bg-white px-3.5 py-2 text-xs font-medium text-zinc-950 transition hover:bg-zinc-200 whitespace-nowrap shadow-sm shrink-0"
                      title="Download / Téléchargement (PDF)"
                    >
                      <Download className="h-3.5 w-3.5 shrink-0" />
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                        <span className="font-semibold">Download</span>
                        <span className="text-zinc-400 font-normal">/</span>
                        <span className="font-medium text-zinc-800">Téléchargement</span>
                      </span>
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
