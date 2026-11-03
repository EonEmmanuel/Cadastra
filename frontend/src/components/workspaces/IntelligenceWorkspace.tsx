"use client";

import React from "react";
import {
  Sparkles,
  ScanLine,
  BrainCircuit,
  Ruler,
  ShieldCheck,
  ArrowRight,
  FileSearch,
  Gauge,
  Cpu,
  Languages,
  Crosshair,
} from "lucide-react";
import {
  PlanExtractionPreview,
  VerificationRecord,
} from "@/types/cadastre";
import {
  StatTile,
  WorkspaceHeader,
} from "@/components/workspaces/WorkspacePrimitives";
import { getVerdict, summarizeRecords } from "@/utils/records";

interface IntelligenceWorkspaceProps {
  records: VerificationRecord[];
  extractionPreview: PlanExtractionPreview | null;
  onOpenRecord: (record: VerificationRecord) => void;
  onOpenLanding: () => void;
  apiConnected: boolean;
}

const PIPELINE = [
  {
    icon: FileSearch,
    title: "Ingestion du plan",
    detail: "Photo, scan ou PDF · rendu 350 DPI pour les documents non textuels.",
  },
  {
    icon: ScanLine,
    title: "SAM 3.1 · ROI",
    detail: "Segmentation du tableau des bornes avant lecture des coordonnées.",
  },
  {
    icon: BrainCircuit,
    title: "Muse Spark · extraction",
    detail: "Sortie structurée Bornes B1…Bn, X, Y, Z et surface déclarée.",
  },
  {
    icon: Ruler,
    title: "Moteur géodésique",
    detail: "PyProj UTM 32N/33N ➔ WGS84, Shoelace, périmètre et auto-intersection.",
  },
  {
    icon: ShieldCheck,
    title: "Verdict géodésique",
    detail: "Tolérance 1.0%, indicateurs d'anomalie et sceau SHA-256.",
  },
];

export default function IntelligenceWorkspace({
  records,
  extractionPreview,
  onOpenRecord,
  onOpenLanding,
  apiConnected,
}: IntelligenceWorkspaceProps) {
  const summary = summarizeRecords(records);
  const averageRisk =
    records.length === 0
      ? 0
      : records.reduce((sum, record) => sum + record.result.risk_score, 0) / records.length;

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto pr-1">
      <WorkspaceHeader
        eyebrow="Chaîne d'analyse · Muse Spark + SAM 3.1"
        title="IA & Analyses"
        description="Le chemin complet entre un plan papier et un verdict opposable : segmentation, extraction structurée, projection géodésique et contrôle réglementaire. Aucune étape n'est simulée dans l'interface."
        actions={
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-medium ${
              apiConnected
                ? "border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-300"
                : "border-zinc-500/25 bg-white/[0.03] text-zinc-400"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                apiConnected ? "bg-emerald-400" : "bg-zinc-500"
              }`}
            />
            {apiConnected ? "Backend connecté" : "Fallback local"}
          </span>
        }
      />

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <StatTile label="Analyses exécutées" value={String(summary.total)} detail="Session en cours" />
        <StatTile
          label="Taux de conformité"
          value={`${summary.complianceRate} %`}
          detail="Tolérance réglementaire"
          tone={summary.complianceRate >= 100 ? "success" : "warning"}
        />
        <StatTile
          label="Score de risque moyen"
          value={`${Math.round(averageRisk)} / 100`}
          detail="Moteur Gauss-Shoelace"
          tone={averageRisk > 60 ? "danger" : averageRisk > 30 ? "warning" : "success"}
        />
        <StatTile
          label="Écart maximal"
          value={`${summary.maxDiscrepancy.toFixed(1)} %`}
          detail="Surface fictive potentielle"
          tone={summary.maxDiscrepancy > 1 ? "danger" : "neutral"}
        />
      </div>

      {/* Pipeline */}
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <h2 className="text-xs font-bold tracking-tight text-white">
            Pipeline d&apos;audit
          </h2>
          <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-600">
            5 étapes
          </span>
        </div>

        <ol className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-5">
          {PIPELINE.map((step, index) => {
            const Icon = step.icon;
            return (
              <li
                key={step.title}
                className="relative rounded-xl border border-white/[0.07] bg-[#090B10] p-3.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
                    <Icon className="h-4 w-4 text-emerald-400" />
                  </div>
                  <span className="font-mono text-[10px] text-zinc-600">
                    0{index + 1}
                  </span>
                </div>
                <p className="mt-3 text-xs font-semibold text-white">{step.title}</p>
                <p className="mt-1 text-[10px] leading-relaxed text-zinc-500">
                  {step.detail}
                </p>
                {index < PIPELINE.length - 1 && (
                  <ArrowRight className="absolute -right-2 top-1/2 hidden h-3.5 w-3.5 -translate-y-1/2 text-zinc-700 xl:block" />
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {/* Last extraction provenance */}
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
          <div className="mb-3 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-sky-400" />
            <h2 className="text-xs font-bold tracking-tight text-white">
              Provenance de la dernière extraction
            </h2>
          </div>

          {extractionPreview ? (
            <div className="space-y-2 text-[11px]">
              {[
                { label: "Source document", value: extractionPreview.documentSource },
                { label: "Segmentation SAM 3.1", value: extractionPreview.samSegmentation },
                { label: "Zoom / relecture", value: extractionPreview.zoomRecheck },
                { label: "Protocole", value: extractionPreview.protocol },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-start justify-between gap-3 border-b border-white/[0.05] py-1.5 last:border-0"
                >
                  <span className="shrink-0 text-zinc-500">{row.label}</span>
                  <span className="text-right font-mono text-zinc-300">
                    {row.value || "—"}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-white/[0.05] pt-2">
                <span className="flex items-center gap-1.5 text-zinc-500">
                  <Languages className="h-3 w-3" />
                  Langue détectée
                </span>
                <span className="font-mono uppercase text-zinc-300">
                  {extractionPreview.detectedLanguage || "—"}
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/[0.1] px-4 py-8 text-center">
              <ScanLine className="mx-auto h-5 w-5 text-zinc-600" />
              <p className="mt-2 text-[11px] text-zinc-500">
                Aucune extraction IA dans cette session. Importez un plan depuis
                l&apos;accueil pour consigner la provenance réelle du document.
              </p>
            </div>
          )}
        </section>

        {/* Session analytics */}
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
          <div className="mb-3 flex items-center gap-2">
            <Gauge className="h-4 w-4 text-amber-400" />
            <h2 className="text-xs font-bold tracking-tight text-white">
              Répartition des verdicts
            </h2>
          </div>

          {records.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/[0.1] px-4 py-8 text-center">
              <Crosshair className="mx-auto h-5 w-5 text-zinc-600" />
              <p className="mt-2 text-[11px] text-zinc-500">
                Les compteurs se remplissent à chaque audit terminé.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {(
                [
                  { key: "success", label: "Conformes", tone: "bg-emerald-400" },
                  { key: "warning", label: "Anomalies topologiques", tone: "bg-amber-400" },
                  { key: "danger", label: "Fraudes suspectées", tone: "bg-red-400" },
                ] as const
              ).map((bucket) => {
                const count = records.filter(
                  (record) => getVerdict(record.result).tone === bucket.key
                ).length;
                const percentage = records.length === 0 ? 0 : (count / records.length) * 100;

                return (
                  <div key={bucket.key}>
                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">{bucket.label}</span>
                      <span className="font-mono text-zinc-300">
                        {count} · {Math.round(percentage)} %
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className={`h-full rounded-full ${bucket.tone}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="mt-4 space-y-1.5 border-t border-white/[0.06] pt-3">
                {records.slice(-3).reverse().map((record) => {
                  const verdict = getVerdict(record.result);
                  return (
                    <button
                      key={record.id}
                      type="button"
                      onClick={() => onOpenRecord(record)}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition hover:bg-white/[0.04]"
                    >
                      <span className="truncate font-mono text-[11px] text-zinc-300">
                        {record.result.plan_id}
                      </span>
                      <span
                        className={`ml-2 shrink-0 text-[10px] font-semibold ${
                          verdict.tone === "danger"
                            ? "text-red-400"
                            : verdict.tone === "warning"
                            ? "text-amber-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {verdict.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>

      {records.length === 0 && (
        <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold text-white">
              Aucune analyse dans cette session
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-400">
              Importez un plan : la provenance réelle de l&apos;extraction et les
              compteurs de verdicts se rempliront automatiquement.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenLanding}
            className="shrink-0 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black transition hover:bg-zinc-200"
          >
            Importer un plan
          </button>
        </div>
      )}
    </div>
  );
}
