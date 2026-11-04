"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Database,
  RefreshCw,
  Loader2,
  MapPin,
  Layers,
  ShieldAlert,
  ShieldCheck,
  Crosshair,
  WifiOff,
} from "lucide-react";
import { CadastralProfileSummary, PlanVerificationRequest } from "@/types/cadastre";
import {
  EmptyState,
  WorkspaceHeader,
} from "@/components/workspaces/WorkspacePrimitives";
import { useLanguage } from "@/i18n/LanguageContext";

interface DatasetsWorkspaceProps {
  apiBaseUrl: string;
  onLoadProfile: (plan: PlanVerificationRequest) => void;
  onOpenManualModal: () => void;
}

type LoadState = "loading" | "ready" | "error";

function profileExpectation(filename: string, planId: string) {
  const haystack = `${filename} ${planId}`.toLowerCase();
  if (haystack.includes("fraud") || haystack.includes("fictive")) {
    return {
      label: "Fraude documentée",
      tone: "danger" as const,
      detail: "Écart de superficie attendu supérieur à la tolérance",
    };
  }
  if (haystack.includes("overlap") || haystack.includes("intersect") || haystack.includes("err")) {
    return {
      label: "Anomalie topologique",
      tone: "warning" as const,
      detail: "Polygone auto-intersecté attendu",
    };
  }
  return {
    label: "Dossier de référence",
    tone: "success" as const,
    detail: "Géométrie conforme attendue",
  };
}

export default function DatasetsWorkspace({
  apiBaseUrl,
  onLoadProfile,
  onOpenManualModal,
}: DatasetsWorkspaceProps) {
  const { t, isEn } = useLanguage();
  const [profiles, setProfiles] = useState<CadastralProfileSummary[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [loadingFilename, setLoadingFilename] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const loadProfiles = useCallback(async () => {
    setState("loading");
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/api/profiles`);
      if (!response.ok) {
        throw new Error(`Le serveur a répondu ${response.status}.`);
      }
      const data = (await response.json()) as CadastralProfileSummary[];
      setProfiles(Array.isArray(data) ? data : []);
      setState("ready");
    } catch {
      setState("error");
      setError(
        isEn
          ? "Cannot reach cadastral engine on http://localhost:8000. Start FastAPI backend and retry."
          : "Impossible de joindre le moteur cadastral sur http://localhost:8000. Démarrez le backend FastAPI, puis réessayez."
      );
    }
  }, [apiBaseUrl, isEn]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const handleLoadProfile = async (profile: CadastralProfileSummary) => {
    setLoadingFilename(profile.filename);
    setProfileError(null);
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/profiles/${encodeURIComponent(profile.filename)}`
      );
      if (!response.ok) {
        throw new Error(`Profil indisponible (${response.status}).`);
      }
      const plan = (await response.json()) as PlanVerificationRequest;
      onLoadProfile(plan);
    } catch {
      setProfileError(
        isEn
          ? `Profile ${profile.filename} could not be loaded. Verify backend status.`
          : `Le profil ${profile.filename} n'a pas pu être chargé. Vérifiez que le backend est démarré.`
      );
    } finally {
      setLoadingFilename(null);
    }
  };

  return (
    <div className="flex h-full flex-col gap-5 overflow-hidden">
      <WorkspaceHeader
        eyebrow={t.datasetsEyebrow}
        title={t.datasetsTitle}
        description={t.datasetsDesc}
        actions={
          <>
            <button
              type="button"
              onClick={onOpenManualModal}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
            >
              <Crosshair className="h-3.5 w-3.5" />
              {t.btnManualInput}
            </button>
            <button
              type="button"
              onClick={loadProfiles}
              disabled={state === "loading"}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white px-3 py-2 text-xs font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${state === "loading" ? "animate-spin" : ""}`}
              />
              {isEn ? "Refresh" : "Actualiser"}
            </button>
          </>
        }
      />

      {state === "error" && (
        <EmptyState
          icon={WifiOff}
          title="Moteur cadastral hors ligne"
          description={error ?? "Le serveur d'analyse est injoignable."}
          primaryAction={{ label: "Réessayer", onClick: loadProfiles }}
          secondaryAction={{ label: "Saisie manuelle", onClick: onOpenManualModal }}
          footnote="API attendue · http://localhost:8000"
        />
      )}

      {state === "loading" && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-[196px] animate-pulse rounded-2xl border border-white/[0.08] bg-white/[0.02]"
            />
          ))}
        </div>
      )}

      {state === "ready" && profiles.length === 0 && (
        <EmptyState
          icon={Database}
          title="Aucun profil disponible"
          description="Le backend est joignable mais le dossier test_data/ est vide. Ajoutez un profil cadastral JSON au projet puis actualisez."
          primaryAction={{ label: "Actualiser", onClick: loadProfiles }}
          footnote="test_data/*.json"
        />
      )}

      {state === "ready" && profiles.length > 0 && (
        <div className="flex-1 overflow-y-auto pr-1">
          {profileError && (
            <div className="mb-3 rounded-xl border border-red-500/25 bg-red-500/[0.08] px-4 py-2.5 text-xs text-red-300">
              {profileError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {profiles.map((profile) => {
              const expectation = profileExpectation(profile.filename, profile.plan_id);
              const isLoading = loadingFilename === profile.filename;

              return (
                <article
                  key={profile.filename}
                  className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0B0E14] p-4 transition hover:border-white/20 hover:bg-[#10141D]"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate font-mono text-sm font-bold text-white">
                          {profile.plan_id}
                        </h3>
                        <p className="mt-0.5 truncate text-xs text-zinc-400">
                          {profile.filename}
                        </p>
                      </div>
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                          expectation.tone === "danger"
                            ? "border-red-500/25 bg-red-500/[0.08] text-red-400"
                            : expectation.tone === "warning"
                            ? "border-amber-500/25 bg-amber-500/[0.08] text-amber-400"
                            : "border-[#00DF8F]/30 bg-[#00DF8F]/10 text-[#00DF8F]"
                        }`}
                      >
                        {expectation.tone === "success" ? (
                          <ShieldCheck className="h-4 w-4" />
                        ) : (
                          <ShieldAlert className="h-4 w-4" />
                        )}
                      </span>
                    </div>

                    <p className="mt-3 flex items-center gap-1.5 text-xs text-zinc-200 font-medium">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                      <span className="truncate">{profile.locality}</span>
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">
                      {profile.region} · {profile.title_number || "Titre en cours"}
                    </p>

                    <div className="mt-3 grid grid-cols-3 gap-1.5 font-mono text-xs">
                      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5">
                        <span className="block text-zinc-400 text-[11px]">Surface</span>
                        <span className="text-zinc-100 font-bold">
                          {Math.round(profile.stated_area_sqm).toLocaleString()} m²
                        </span>
                      </div>
                      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5">
                        <span className="block text-zinc-400 text-[11px]">Zone</span>
                        <span className="text-zinc-100 font-bold">{profile.utm_zone}</span>
                      </div>
                      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5">
                        <span className="block text-zinc-400 text-[11px]">Bornes</span>
                        <span className="text-zinc-100 font-bold">{profile.num_beacons}</span>
                      </div>
                    </div>

                    <p
                      className={`mt-3 text-xs font-semibold ${
                        expectation.tone === "danger"
                          ? "text-red-400"
                          : expectation.tone === "warning"
                          ? "text-amber-400"
                          : "text-[#00DF8F]"
                      }`}
                    >
                      {expectation.label} · {expectation.detail}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
                    <span className="flex items-center gap-1.5 font-mono text-xs text-zinc-400">
                      <Layers className="h-3.5 w-3.5 text-zinc-400" />
                      {profile.filename.endsWith(".json") ? "JSON" : "profil"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleLoadProfile(profile)}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-60"
                    >
                      {isLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Crosshair className="h-3.5 w-3.5" />
                      )}
                      {isLoading ? "Chargement…" : "Vérifier"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
