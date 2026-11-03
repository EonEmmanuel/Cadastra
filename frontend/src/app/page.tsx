"use client";

import React, { useCallback, useState } from "react";
import {
  FileText,
  UploadCloud,
  Crosshair,
  Layers3,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import CadastralSatelliteMap from "@/components/CadastralSatelliteMap";
import ForensicDossierPanel from "@/components/ForensicDossierPanel";
import LandingHero from "@/components/LandingHero";
import SmoothScroll from "@/components/SmoothScroll";
import AiExtractionReviewModal from "@/components/AiExtractionReviewModal";
import ApiSettingsModal from "@/components/ApiSettingsModal";
import WhatsAppChannelModal from "@/components/WhatsAppChannelModal";
import CustomPlanModal from "@/components/CustomPlanModal";
import InvestigationsWorkspace from "@/components/workspaces/InvestigationsWorkspace";
import ReportsWorkspace from "@/components/workspaces/ReportsWorkspace";
import DatasetsWorkspace from "@/components/workspaces/DatasetsWorkspace";
import IntelligenceWorkspace from "@/components/workspaces/IntelligenceWorkspace";
import {
  PlanVerificationRequest,
  PlanVerificationResponse,
  PlanExtractionPreview,
  VerificationRecord,
  VerificationSource,
} from "@/types/cadastre";
import { verifyCadastralPlanLocally } from "@/utils/geodesy";
import { makeRecordId } from "@/utils/records";

const API_BASE = "http://localhost:8000";

export default function CadastraApp() {
  // Synchronously initialize state on client to prevent landing page flash on refresh
  const [viewMode, setViewMode] = useState<"landing" | "dashboard">(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get("view");
      if (viewParam === "dashboard") return "dashboard";
      if (viewParam === "landing") return "landing";
      try {
        if (sessionStorage.getItem("cadastra_verification_result")) return "dashboard";
      } catch {}
    }
    return "landing";
  });

  const [activeNavTab, setActiveNavTab] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab && ["carte", "investigations", "rapports", "donnees", "ia"].includes(tab)) {
        return tab;
      }
    }
    return "carte";
  });

  const [currentRequest, setCurrentRequest] = useState<PlanVerificationRequest | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem("cadastra_current_request");
        return saved ? JSON.parse(saved) : null;
      } catch {}
    }
    return null;
  });

  const [verificationResult, setVerificationResult] = useState<PlanVerificationResponse | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem("cadastra_verification_result");
        return saved ? JSON.parse(saved) : null;
      } catch {}
    }
    return null;
  });

  const [selectedBorneId, setSelectedBorneId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isDossierCollapsed, setIsDossierCollapsed] = useState<boolean>(false);

  // Every completed audit stays in the session so investigations, reports and
  // analytics read one real, shared list instead of separate mock data.
  const [history, setHistory] = useState<VerificationRecord[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem("cadastra_history");
        return saved ? JSON.parse(saved) : [];
      } catch {}
    }
    return [];
  });
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Synchronize state changes to sessionStorage
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (currentRequest) {
        sessionStorage.setItem("cadastra_current_request", JSON.stringify(currentRequest));
      }
    } catch {}
  }, [currentRequest]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (verificationResult) {
        sessionStorage.setItem("cadastra_verification_result", JSON.stringify(verificationResult));
      }
    } catch {}
  }, [verificationResult]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (history.length > 0) {
        sessionStorage.setItem("cadastra_history", JSON.stringify(history));
      }
    } catch {}
  }, [history]);

  // Probe the real backend once so the status chip is truthful before the
  // first verification (local fallback is labelled as such, never hidden).
  React.useEffect(() => {
    let cancelled = false;
    const check = () => {
      fetch(`${API_BASE}/health`)
        .then((response) => {
          if (!cancelled) setApiConnected(response.ok);
        })
        .catch(() => {
          if (!cancelled) setApiConnected(false);
        });
    };
    check();
    window.addEventListener("focus", check);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", check);
    };
  }, []);

  // Keep the URL shareable and refresh-safe: the active workspace is encoded
  // in the query string instead of living only in React state.
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (viewMode === "dashboard") {
      params.set("view", "dashboard");
      params.set("tab", activeNavTab);
    } else {
      params.delete("view");
      params.delete("tab");
    }
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      query ? `${window.location.pathname}?${query}` : window.location.pathname
    );
  }, [viewMode, activeNavTab]);

  // Modals state
  const [isAiReviewOpen, setIsAiReviewOpen] = useState(false);
  const [pendingExtraction, setPendingExtraction] = useState<PlanVerificationRequest | null>(null);
  const [pendingFileName, setPendingFileName] = useState<string>("");
  const [extractionPreview, setExtractionPreview] = useState<PlanExtractionPreview | null>(null);

  const [isApiSettingsOpen, setIsApiSettingsOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isCustomPlanOpen, setIsCustomPlanOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);

  const commitVerification = useCallback(
    (
      request: PlanVerificationRequest,
      result: PlanVerificationResponse,
      source: VerificationSource
    ) => {
      setCurrentRequest(request);
      setVerificationResult(result);
      setSelectedBorneId(null);
      setIsDossierCollapsed(false);
      setHistory((previous) => {
        const base = {
          request,
          result,
          timestamp: new Date().toISOString(),
          source,
        };
        const id = makeRecordId(base);
        if (previous.some((record) => record.id === id)) {
          return previous;
        }
        return [{ ...base, id }, ...previous];
      });
    },
    []
  );

  // Execute verification against FastAPI backend or Snyder geodetic fallback
  const runVerification = useCallback(
    async (requestToVerify: PlanVerificationRequest, source: VerificationSource = "manual") => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestToVerify),
        });

        if (res.ok) {
          const data: PlanVerificationResponse = await res.json();
          setApiConnected(true);
          commitVerification(requestToVerify, data, source);
        } else {
          throw new Error(`API Error: ${res.statusText}`);
        }
      } catch {
        // Local geodetic Gauss-Shoelace & Snyder projection fallback
        const localResult = verifyCadastralPlanLocally({
          plan_id: requestToVerify.plan_id,
          stated_area_sqm: requestToVerify.stated_area_sqm,
          utm_zone: requestToVerify.utm_zone,
          region: requestToVerify.region,
          locality: requestToVerify.locality,
          beacons: requestToVerify.beacons,
        }) as PlanVerificationResponse;
        setApiConnected(false);
        commitVerification(requestToVerify, localResult, source);
      } finally {
        setIsLoading(false);
      }
    },
    [commitVerification]
  );

  // Auto-load profile or sample parcel if requested in query parameters
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const requestedProfile = params.get("profile") || params.get("sample");
    if (requestedProfile) {
      fetch(`${API_BASE}/api/profiles/${requestedProfile}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((plan) => {
          if (plan) {
            setCurrentRequest(plan);
            runVerification(plan, "dataset");
            setViewMode("dashboard");
            setActiveNavTab("carte");
          }
        })
        .catch(() => {});
    }
  }, [runVerification]);

  // When a plan is uploaded or submitted from the Landing Hero:
  // Open the Human-in-the-Loop AI Vision Review Modal first for uploads,
  // or jump directly to the geodetic map for sample test profiles.
  const handlePlanLoadedFromHero = (
    plan: PlanVerificationRequest,
    fileName: string,
    preview: PlanExtractionPreview | null
  ) => {
    if (!preview) {
      setCurrentRequest(plan);
      runVerification(plan, "dataset");
      setViewMode("dashboard");
      setActiveNavTab("carte");
      return;
    }
    setPendingExtraction(plan);
    setPendingFileName(fileName);
    setExtractionPreview(preview);
    setIsAiReviewOpen(true);
  };

  // When human validates the coordinates in the AI Review Modal:
  const handleConfirmAiReview = (confirmedPlan: PlanVerificationRequest) => {
    setCurrentRequest(confirmedPlan);
    setIsAiReviewOpen(false);
    runVerification(confirmedPlan, "upload");
    setViewMode("dashboard");
    setActiveNavTab("carte");
  };

  // Custom Plan Submit Handler (Direct Manual Input)
  const handleCustomPlanSubmit = (customPlan: PlanVerificationRequest) => {
    setCurrentRequest(customPlan);
    setIsCustomPlanOpen(false);
    runVerification(customPlan, "manual");
    setViewMode("dashboard");
    setActiveNavTab("carte");
  };

  // Load a ground-truth profile from the backend's /api/profiles endpoint
  const handleLoadProfile = (plan: PlanVerificationRequest) => {
    setCurrentRequest(plan);
    runVerification(plan, "dataset");
    setViewMode("dashboard");
    setActiveNavTab("carte");
  };

  const openRecord = (record: VerificationRecord) => {
    setCurrentRequest(record.request);
    setVerificationResult(record.result);
    setSelectedBorneId(null);
    setActiveNavTab("carte");
    setViewMode("dashboard");
  };

  // PDF Report Download Handler
  const handleDownloadPdf = async (
    requestOverride?: PlanVerificationRequest | null,
    recordId?: string
  ) => {
    const target = requestOverride ?? currentRequest;
    if (!target) return;
    setDownloadingId(recordId ?? "current");
    try {
      const res = await fetch(`${API_BASE}/api/report/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(target),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Cadastra_Cameroon_Audit_${target.plan_id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else {
        alert("Erreur lors de la génération du rapport PDF.");
      }
    } catch {
      alert("Impossible de joindre le serveur pour le téléchargement PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  const renderWorkspace = () => {
    switch (activeNavTab) {
      case "investigations":
        return (
          <InvestigationsWorkspace
            records={history}
            onOpenRecord={openRecord}
            onOpenManualModal={() => setIsCustomPlanOpen(true)}
            onOpenLanding={() => setViewMode("landing")}
          />
        );
      case "rapports":
        return (
          <ReportsWorkspace
            records={history}
            downloadingId={downloadingId}
            onDownload={(record) => handleDownloadPdf(record.request, record.id)}
            onOpenRecord={openRecord}
            onOpenLanding={() => setViewMode("landing")}
          />
        );
      case "donnees":
        return (
          <DatasetsWorkspace
            apiBaseUrl={API_BASE}
            onLoadProfile={handleLoadProfile}
            onOpenManualModal={() => setIsCustomPlanOpen(true)}
          />
        );
      case "ia":
        return (
          <IntelligenceWorkspace
            records={history}
            extractionPreview={extractionPreview}
            onOpenRecord={openRecord}
            onOpenLanding={() => setViewMode("landing")}
            apiConnected={apiConnected}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={
        viewMode === "landing"
          ? "min-h-screen w-full flex flex-col bg-[#03060E] text-zinc-100 font-sans antialiased overflow-x-hidden"
          : "h-screen w-screen flex flex-col bg-[#03060E] text-zinc-100 overflow-hidden font-sans antialiased"
      }
    >
      {/* 1. VIEW MODE SWITCHING: LANDING PAGE vs INSPECTION DASHBOARD */}
      {viewMode === "landing" ? (
        // VOCEL-TIER LANDING PAGE (Hero, AI Input Field, Zero Dummy Fakes)
        <>
          <SmoothScroll enabled={true} />
          <LandingHero
            onPlanLoaded={handlePlanLoadedFromHero}
            onOpenManualModal={() => setIsCustomPlanOpen(true)}
            onOpenDashboard={() => {
              setViewMode("dashboard");
              setActiveNavTab("carte");
            }}
            onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
            onOpenApiSettings={() => setIsApiSettingsOpen(true)}
          />
        </>
      ) : (
        // GEOSPATIAL INSPECTION DASHBOARD (Full-Bleed Map + Floating Glass Docks)
        <div className="h-full w-full flex flex-col overflow-hidden bg-[#03060E]">
          {/* Top Dashboard Header */}
          <Navbar
            onOpenUploadHub={() => setViewMode("landing")}
            onOpenApiSettings={() => setIsApiSettingsOpen(true)}
            onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
            onOpenCustomPlanModal={() => setIsCustomPlanOpen(true)}
            apiConnected={apiConnected}
            isInDashboardView={true}
          />

          {/* Main Dashboard Canvas Layout: Map Extends Full-Bleed Behind Everything */}
          <div className="flex-1 relative overflow-hidden">
            {/* 1. FULL-BLEED SATELLITE MAP (Foundational Canvas) */}
            <div className="absolute inset-0 z-0">
              <CadastralSatelliteMap
                key={verificationResult?.verification_hash || currentRequest?.plan_id || "empty"}
                planId={currentRequest?.plan_id || "En attente de plan"}
                beacons={verificationResult?.beacons_wgs84 || []}
                centroid={verificationResult?.centroid_wgs84}
                boundarySegments={verificationResult?.boundary_segments || []}
                riskLevel={verificationResult?.risk_level || "LOW"}
                statedArea={currentRequest?.stated_area_sqm || 0}
                computedArea={verificationResult?.computed_area_sqm || 0}
                discrepancySqm={verificationResult?.discrepancy_sqm || 0}
                locality={currentRequest?.locality || "Cameroun (WGS84)"}
                utmZone={currentRequest?.utm_zone || "32N"}
                epsgCode={verificationResult?.epsg_code}
                selectedBorneId={selectedBorneId}
                onSelectBorne={setSelectedBorneId}
                leftOffset={isSidebarCollapsed ? 64 + 16 : 208 + 16}
                rightOffset={
                  isDossierCollapsed || !verificationResult ? 16 : 420 + 16
                }
              />
            </div>

            {/* 2. LEFT FLOATING CAPSULE SIDEBAR (Image 1 Style) */}
            <div className="absolute left-4 top-4 bottom-4 z-20 pointer-events-auto">
              <Sidebar
                activeTab={activeNavTab}
                recordCount={history.length}
                onTabChange={(tab) => {
                  if (tab === "accueil") {
                    setViewMode("landing");
                  } else {
                    setActiveNavTab(tab);
                  }
                }}
                onOpenApiSettings={() => setIsApiSettingsOpen(true)}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
              />
            </div>

            {/* 3. WORKSPACE CONTENT OVERLAY */}
            {activeNavTab === "carte" ? (
              <>
                {/* Right Floating Forensic Dossier (Image 2 Style) */}
                {verificationResult && (
                  <div
                    className={`absolute right-4 top-4 bottom-4 z-20 pointer-events-auto transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isDossierCollapsed
                        ? "translate-x-[calc(100%+2rem)] opacity-0 pointer-events-none"
                        : "translate-x-0 opacity-100 w-[420px] max-w-[calc(100vw-6rem)]"
                    }`}
                  >
                    <ForensicDossierPanel
                      result={verificationResult}
                      request={currentRequest}
                      isLoading={isLoading}
                      onDownloadPdf={() => handleDownloadPdf()}
                      isDownloadingPdf={downloadingId === "current"}
                      selectedBorneId={selectedBorneId}
                      onSelectBorne={setSelectedBorneId}
                      isCollapsed={isDossierCollapsed}
                      onToggleCollapse={() => setIsDossierCollapsed(true)}
                    />
                  </div>
                )}

                {/* Floating Reopen Button when Dossier is Minimized */}
                {verificationResult && isDossierCollapsed && (
                  <button
                    type="button"
                    onClick={() => setIsDossierCollapsed(false)}
                    title="Afficher le dossier d'audit"
                    className="absolute right-4 top-4 z-20 pointer-events-auto flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#040711]/90 backdrop-blur-xl border border-white/[0.08] text-xs font-semibold text-white shadow-2xl hover:bg-white/[0.08] transition"
                  >
                    <FileText className="w-4 h-4 text-[#60A5FA]" />
                    <span>Dossier d&apos;audit</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA] shadow-[0_0_8px_#60A5FA]" />
                  </button>
                )}

                {/* Empty State Overlay */}
                {!verificationResult && !isLoading && !isCustomPlanOpen && (
                  <div
                    className="absolute inset-0 z-10 flex items-center justify-center p-4 pointer-events-none transition-all duration-300"
                    style={{
                      paddingLeft: isSidebarCollapsed
                        ? `${64 + 32}px`
                        : `${208 + 32}px`,
                    }}
                  >
                    <div className="w-full max-w-sm rounded-2xl border border-white/[0.1] bg-[#090B10]/95 p-6 text-center shadow-2xl backdrop-blur-md pointer-events-auto">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
                        <Layers3 className="h-5 w-5 text-zinc-400" />
                      </div>
                      <h2 className="text-sm font-semibold text-white">
                        Aucune parcelle chargée
                      </h2>
                      <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
                        Importez un plan de bornage ou chargez un profil de
                        référence pour afficher les bornes B1…Bn et le dossier
                        forensique.
                      </p>
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
                        <button
                          type="button"
                          onClick={() => setViewMode("landing")}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black transition hover:bg-zinc-200"
                        >
                          <UploadCloud className="h-3.5 w-3.5" />
                          Importer un plan
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsCustomPlanOpen(true)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
                        >
                          <Crosshair className="h-3.5 w-3.5" />
                          Saisie manuelle
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveNavTab("donnees")}
                        className="mt-3 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500 transition hover:text-zinc-300"
                      >
                        <FileText className="h-3 w-3" />
                        Ou parcourir les jeux de données
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Secondary workspaces floating over the full-bleed map */
              <div
                className="absolute top-4 bottom-4 right-4 z-20 pointer-events-auto overflow-hidden rounded-2xl border border-white/[0.08] bg-[#040711]/95 backdrop-blur-2xl shadow-2xl p-4 sm:p-5 transition-all duration-300"
                style={{
                  left: isSidebarCollapsed
                    ? `${64 + 32}px`
                    : `${208 + 32}px`,
                }}
              >
                {renderWorkspace()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. MODALS */}
      {/* Interactive AI Vision Multimodal Extraction & Human-in-the-Loop Review */}
      {pendingExtraction && (
        <AiExtractionReviewModal
          key={`${pendingFileName}-${pendingExtraction.plan_id}`}
          isOpen={isAiReviewOpen}
          onClose={() => setIsAiReviewOpen(false)}
          extractedPlan={pendingExtraction}
          uploadedFileName={pendingFileName}
          previewData={extractionPreview}
          onConfirm={handleConfirmAiReview}
        />
      )}

      {/* Real Meta WhatsApp Cloud API & Webhook Configuration Modal */}
      <ApiSettingsModal
        isOpen={isApiSettingsOpen}
        onClose={() => setIsApiSettingsOpen(false)}
        apiBaseUrl={API_BASE}
      />

      {/* Real WhatsApp Phone Channel Connection Modal */}
      <WhatsAppChannelModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        apiBaseUrl={API_BASE}
      />

      {/* Custom Cadastral Coordinate Input Modal */}
      <CustomPlanModal
        isOpen={isCustomPlanOpen}
        onClose={() => setIsCustomPlanOpen(false)}
        onSubmit={handleCustomPlanSubmit}
      />
    </div>
  );
}
