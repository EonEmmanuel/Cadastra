"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import CadastralSatelliteMap from "@/components/CadastralSatelliteMap";
import ForensicDossierPanel from "@/components/ForensicDossierPanel";
import LandingHero from "@/components/LandingHero";
import AiExtractionReviewModal from "@/components/AiExtractionReviewModal";
import ApiSettingsModal from "@/components/ApiSettingsModal";
import WhatsAppChannelModal from "@/components/WhatsAppChannelModal";
import CustomPlanModal from "@/components/CustomPlanModal";
import {
  PlanVerificationRequest,
  PlanVerificationResponse,
} from "@/types/cadastre";
import { verifyCadastralPlanLocally } from "@/utils/geodesy";

const API_BASE = "http://localhost:8000";

export default function CadastraApp() {
  const [activeNavTab, setActiveNavTab] = useState<string>("carte");
  // Default landing view mode is "landing"
  const [viewMode, setViewMode] = useState<"landing" | "dashboard">("landing");
  const [currentRequest, setCurrentRequest] = useState<PlanVerificationRequest | null>(null);
  const [verificationResult, setVerificationResult] = useState<PlanVerificationResponse | null>(null);
  const [selectedBorneId, setSelectedBorneId] = useState<string | null>(null);

  // Check URL query parameter for direct view switching
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const requestedView = params.get("view");
      if (requestedView === "dashboard") {
        setViewMode("dashboard");
      }
    }
  }, []);

  // Modals state
  const [isAiReviewOpen, setIsAiReviewOpen] = useState(false);
  const [pendingExtraction, setPendingExtraction] = useState<PlanVerificationRequest | null>(null);
  const [pendingFileName, setPendingFileName] = useState<string>("");

  const [isApiSettingsOpen, setIsApiSettingsOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isCustomPlanOpen, setIsCustomPlanOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);

  // Execute verification against FastAPI backend or Snyder geodetic fallback
  const runVerification = async (requestToVerify: PlanVerificationRequest) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestToVerify),
      });

      if (res.ok) {
        const data: PlanVerificationResponse = await res.json();
        setVerificationResult(data);
        setApiConnected(true);
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
      });
      setVerificationResult(localResult as PlanVerificationResponse);
      setApiConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // When a plan is uploaded or submitted from the Landing Hero:
  // Open the Human-in-the-Loop AI Vision Review Modal first
  const handlePlanLoadedFromHero = (plan: PlanVerificationRequest, fileName: string) => {
    setPendingExtraction(plan);
    setPendingFileName(fileName);
    setIsAiReviewOpen(true);
  };

  // When human validates the coordinates in the AI Review Modal:
  const handleConfirmAiReview = (confirmedPlan: PlanVerificationRequest) => {
    setCurrentRequest(confirmedPlan);
    runVerification(confirmedPlan);
    setViewMode("dashboard");
    setActiveNavTab("carte");
  };

  // Custom Plan Submit Handler (Direct Manual Input)
  const handleCustomPlanSubmit = (customPlan: PlanVerificationRequest) => {
    setCurrentRequest(customPlan);
    runVerification(customPlan);
    setViewMode("dashboard");
    setActiveNavTab("carte");
  };

  // PDF Report Download Handler
  const handleDownloadPdf = async () => {
    if (!currentRequest) return;
    setIsDownloadingPdf(true);
    try {
      const res = await fetch(`${API_BASE}/api/report/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentRequest),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Cadastra_Cameroon_Audit_${currentRequest.plan_id}.pdf`;
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
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#060709] text-zinc-100 overflow-hidden font-sans select-none antialiased">
      {/* 1. VIEW MODE SWITCHING: LANDING PAGE vs INSPECTION DASHBOARD */}
      {viewMode === "landing" ? (
        // VOCEL-TIER LANDING PAGE (Hero, AI Input Field, Zero Dummy Fakes)
        <div className="h-full w-full overflow-y-auto">
          <LandingHero
            onPlanLoaded={handlePlanLoadedFromHero}
            onOpenManualModal={() => setIsCustomPlanOpen(true)}
            onOpenDashboard={() => setViewMode("dashboard")}
            onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
            onOpenApiSettings={() => setIsApiSettingsOpen(true)}
          />
        </div>
      ) : (
        // GEOSPATIAL INSPECTION DASHBOARD (Satellite Map + Forensic Dossier Panel)
        <div className="h-full w-full flex flex-col overflow-hidden">
          {/* Top Dashboard Header */}
          <Navbar
            onOpenUploadHub={() => setViewMode("landing")}
            onOpenApiSettings={() => setIsApiSettingsOpen(true)}
            onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
            onOpenCustomPlanModal={() => setIsCustomPlanOpen(true)}
            apiConnected={apiConnected}
            isInDashboardView={true}
          />

          {/* Main Dashboard Layout */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Vertical Icon Rail */}
            <Sidebar
              activeTab={activeNavTab}
              onTabChange={(tab) => {
                if (tab === "accueil") {
                  setViewMode("landing");
                } else {
                  setActiveNavTab(tab);
                }
              }}
              onOpenApiSettings={() => setIsApiSettingsOpen(true)}
            />

            {/* Central Workspace: Map (Center) + Forensic Dossier (Right) */}
            <main className="flex-1 p-3 overflow-hidden flex flex-col lg:flex-row gap-3 bg-[#060709]">
              {/* Satellite Cadastral Map Viewport */}
              <section className="flex-1 h-[50vh] lg:h-full relative overflow-hidden flex flex-col">
                <CadastralSatelliteMap
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
                />
              </section>

              {/* Forensic Cadastral Dossier Panel */}
              <section className="w-full lg:w-[410px] xl:w-[440px] h-[50vh] lg:h-full shrink-0 flex flex-col">
                <ForensicDossierPanel
                  result={verificationResult}
                  request={currentRequest}
                  isLoading={isLoading}
                  onDownloadPdf={handleDownloadPdf}
                  isDownloadingPdf={isDownloadingPdf}
                  selectedBorneId={selectedBorneId}
                  onSelectBorne={setSelectedBorneId}
                />
              </section>
            </main>
          </div>
        </div>
      )}

      {/* 2. MODALS */}
      {/* Interactive AI Vision Multimodal Extraction & Human-in-the-Loop Review */}
      {pendingExtraction && (
        <AiExtractionReviewModal
          isOpen={isAiReviewOpen}
          onClose={() => setIsAiReviewOpen(false)}
          extractedPlan={pendingExtraction}
          uploadedFileName={pendingFileName}
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
