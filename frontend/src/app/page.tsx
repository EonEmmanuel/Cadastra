"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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

function CadastraAppContent() {
  const searchParams = useSearchParams();
  const urlView = searchParams.get("view");
  const urlTab = searchParams.get("tab");

  // Synchronously initialize viewMode & activeNavTab matching the URL during SSR and client hydration
  const [viewMode, setViewMode] = useState<"landing" | "dashboard">(() => {
    return urlView === "dashboard" ? "dashboard" : "landing";
  });

  const [activeNavTab, setActiveNavTab] = useState<string>(() => {
    if (urlTab && ["carte", "investigations", "rapports", "donnees", "ia"].includes(urlTab)) {
      return urlTab;
    }
    return "carte";
  });

  // Client session state (initialized to null/empty on initial render to guarantee identical SSR & client markup)
  const [currentRequest, setCurrentRequest] = useState<PlanVerificationRequest | null>(null);
  const [verificationResult, setVerificationResult] = useState<PlanVerificationResponse | null>(null);
  const [history, setHistory] = useState<VerificationRecord[]>([]);
  const [isRestoredFromSession, setIsRestoredFromSession] = useState<boolean>(false);

  const [selectedBorneId, setSelectedBorneId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isDossierCollapsed, setIsDossierCollapsed] = useState<boolean>(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

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

  // Restore session data immediately after client hydration
  useEffect(() => {
    try {
      const savedReq = sessionStorage.getItem("cadastra_current_request");
      const savedRes = sessionStorage.getItem("cadastra_verification_result");
      const savedHist = sessionStorage.getItem("cadastra_history");
      if (savedReq) setCurrentRequest(JSON.parse(savedReq));
      if (savedRes) setVerificationResult(JSON.parse(savedRes));
      if (savedHist) setHistory(JSON.parse(savedHist));
    } catch {}
    setIsRestoredFromSession(true);
  }, []);

  // Synchronize state changes to sessionStorage only after initial session restoration
  useEffect(() => {
    if (!isRestoredFromSession) return;
    try {
      if (currentRequest) {
        sessionStorage.setItem("cadastra_current_request", JSON.stringify(currentRequest));
      } else {
        sessionStorage.removeItem("cadastra_current_request");
      }
    } catch {}
  }, [currentRequest, isRestoredFromSession]);

  useEffect(() => {
    if (!isRestoredFromSession) return;
    try {
      if (verificationResult) {
        sessionStorage.setItem("cadastra_verification_result", JSON.stringify(verificationResult));
      } else {
        sessionStorage.removeItem("cadastra_verification_result");
      }
    } catch {}
  }, [verificationResult, isRestoredFromSession]);

  useEffect(() => {
    if (!isRestoredFromSession) return;
    try {
      if (history.length > 0) {
        sessionStorage.setItem("cadastra_history", JSON.stringify(history));
      }
    } catch {}
  }, [history, isRestoredFromSession]);

  // Keep the URL shareable, back/forward friendly, and refresh-safe
  useEffect(() => {
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
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [viewMode, activeNavTab]);

  // Support browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const v = params.get("view");
      const t = params.get("tab");
      setViewMode(v === "dashboard" ? "dashboard" : "landing");
      if (t && ["carte", "investigations", "rapports", "donnees", "ia"].includes(t)) {
        setActiveNavTab(t);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Probe backend health once
  useEffect(() => {
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
      setSelectedBorneId(null);
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
      } catch (err) {
        console.warn("API verify failed, running local Snyder fallback", err);
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
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const requestedProfile = params.get("profile") || params.get("sample");
    if (requestedProfile) {
      fetch(`${API_BASE}/api/profiles/${requestedProfile}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((plan) => {
          if (plan) {
            setVerificationResult(null);
            setCurrentRequest(plan);
            setViewMode("dashboard");
            setActiveNavTab("carte");
            runVerification(plan, "dataset");
          }
        })
        .catch(() => {});
    }
  }, [runVerification]);

  // When a plan is uploaded or submitted from the Landing Hero:
  const handlePlanLoadedFromHero = (
    plan: PlanVerificationRequest,
    fileName: string,
    preview: PlanExtractionPreview | null
  ) => {
    if (!preview) {
      setVerificationResult(null);
      setCurrentRequest(plan);
      setViewMode("dashboard");
      setActiveNavTab("carte");
      runVerification(plan, "dataset");
      return;
    }
    setPendingExtraction(plan);
    setPendingFileName(fileName);
    setExtractionPreview(preview);
    setIsAiReviewOpen(true);
  };

  // When human validates the coordinates in the AI Review Modal:
  const handleConfirmAiReview = (confirmedPlan: PlanVerificationRequest) => {
    setVerificationResult(null);
    setCurrentRequest(confirmedPlan);
    setIsAiReviewOpen(false);
    setPendingExtraction(null);
    setExtractionPreview(null);
    setViewMode("dashboard");
    setActiveNavTab("carte");
    runVerification(confirmedPlan, "upload");
  };

  // Custom Plan Submit Handler (Direct Manual Input)
  const handleCustomPlanSubmit = (customPlan: PlanVerificationRequest) => {
    setVerificationResult(null);
    setCurrentRequest(customPlan);
    setIsCustomPlanOpen(false);
    setViewMode("dashboard");
    setActiveNavTab("carte");
    runVerification(customPlan, "manual");
  };

  // Load a ground-truth profile from the backend's /api/profiles endpoint
  const handleLoadProfile = (plan: PlanVerificationRequest) => {
    setVerificationResult(null);
    setCurrentRequest(plan);
    setViewMode("dashboard");
    setActiveNavTab("carte");
    runVerification(plan, "dataset");
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
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error("PDF download failed", e);
    } finally {
      setDownloadingId(null);
    }
  };

  // Render secondary workspaces based on active sidebar tab
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

                {/* Loading Indicator Overlay */}
                {isLoading && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center p-4 pointer-events-none">
                    <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#040711]/90 border border-white/[0.12] backdrop-blur-xl shadow-2xl text-xs font-mono text-zinc-200">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#60A5FA] animate-ping" />
                      <span>Calcul géodésique Gauss-Shoelace et projection WGS84 en cours...</span>
                    </div>
                  </div>
                )}

                {/* Session Restoring Placeholder */}
                {!isRestoredFromSession && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center p-4 pointer-events-none">
                    <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#090B10]/80 border border-white/[0.08] backdrop-blur-md text-xs font-mono text-zinc-400">
                      <span className="w-2 h-2 rounded-full bg-[#60A5FA] animate-ping" />
                      <span>Initialisation de la session géodésique...</span>
                    </div>
                  </div>
                )}

                {/* Empty State Overlay */}
                {isRestoredFromSession && !verificationResult && !isLoading && !isCustomPlanOpen && (
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

export default function CadastraApp() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#03060E] text-zinc-400 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#60A5FA] animate-ping" />
            <span>Initialisation du terminal géodésique...</span>
          </div>
        </div>
      }
    >
      <CadastraAppContent />
    </Suspense>
  );
}
