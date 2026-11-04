export type Language = "en" | "fr";

export interface Translations {
  // Brand & Navbar
  brandName: string;
  brandSubtitle: string;
  apiConnected: string;
  apiOffline: string;
  btnAuditPlan: string;
  btnHomeNewPlan: string;
  btnManualInput: string;
  btnWhatsApp: string;
  btnApiKeys: string;
  langSwitchAria: string;

  // Sidebar
  navMap: string;
  navInvestigations: string;
  navReports: string;
  navDatasets: string;
  navIntelligence: string;
  sidebarCollapse: string;
  sidebarExpand: string;

  // Landing Hero
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  inputPlaceholder: string;
  btnVerifyNow: string;
  btnUploadDocument: string;
  btnManualEntry: string;
  btnExploreDatasets: string;
  navDashboard: string;
  navGeodesy: string;
  navSurveyPlan: string;
  navWhatsApp: string;
  navMuseSpark: string;
  btnImagePicker: string;
  btnPdfPicker: string;
  btnAuditSubmit: string;
  btnAnalyzing: string;
  scanningOverlay: string;
  independentTrustBadge: string;
  sampleDoualaYassa: string;
  sampleFraudAlert: string;
  sampleYaoundeOdza: string;
  footerHackathon: string;
  footerGeodesy: string;

  // Forensic Dossier Panel
  dossierTitle: string;
  tabSynthesis: string;
  tabBeacons: string;
  tabAiAnalyst: string;
  verdictCompliant: string;
  verdictAnomaly: string;
  verdictFraud: string;
  statedArea: string;
  computedArea: string;
  discrepancy: string;
  perimeter: string;
  riskScore: string;
  polygonClosure: string;
  polygonClosed: string;
  polygonOpen: string;
  selfIntersection: string;
  selfIntersectingNo: string;
  selfIntersectingYes: string;
  btnDownloadReport: string;
  btnPreviewPdf: string;
  btnShare: string;
  copied: string;
  waitingForPlan: string;
  waitingForPlanDesc: string;
  beaconId: string;
  eastX: string;
  northY: string;
  elevationZ: string;
  beaconStatus: string;
  legalTolerance: string;
  shaSeal: string;

  // AI Forensic Analyst Tab & Q&A
  aiAnalystTitle: string;
  aiAnalystSubtitle: string;
  aiDiagnosisTitle: string;
  aiAskTitle: string;
  aiAskPlaceholder: string;
  btnAskAi: string;
  askingAi: string;
  aiSuggestedPrompt1: string;
  aiSuggestedPrompt2: string;
  aiSuggestedPrompt3: string;
  aiSuggestedPrompt4: string;
  aiRecommendationsTitle: string;
  aiLegalTitle: string;
  aiEngineBadge: string;
  aiDefaultVerdictOk: string;
  aiDefaultVerdictWarn: string;
  aiDefaultVerdictDanger: string;
  aiClearChat: string;

  // Investigations Workspace
  investigationsEyebrow: string;
  investigationsTitle: string;
  investigationsDesc: string;
  filterAll: string;
  filterFlagged: string;
  filterCompliant: string;
  statTotalAudited: string;
  statCompliant: string;
  statFlagged: string;
  statAvgDiscrepancy: string;
  searchInvestigationsPlaceholder: string;
  colPlanId: string;
  colLocality: string;
  colAreaStated: string;
  colAreaComputed: string;
  colVerdict: string;
  colDate: string;
  colActions: string;
  emptyInvestigationsTitle: string;
  emptyInvestigationsDesc: string;
  btnNewAudit: string;

  // Reports Workspace
  reportsEyebrow: string;
  reportsTitle: string;
  reportsDesc: string;
  reportsTotalCertificates: string;
  reportsReadyToDownload: string;
  btnDownloadPdfBilingual: string;
  btnViewDossier: string;
  emptyReportsTitle: string;
  emptyReportsDesc: string;

  // Datasets Workspace
  datasetsEyebrow: string;
  datasetsTitle: string;
  datasetsDesc: string;
  datasetTypeReference: string;
  datasetTypeFraud: string;
  datasetTypeAnomaly: string;
  btnLoadProfile: string;
  loadingDataset: string;
  datasetBeaconsCount: string;

  // Intelligence Workspace
  intelligenceEyebrow: string;
  intelligenceTitle: string;
  intelligenceDesc: string;
  pipelineStep1Title: string;
  pipelineStep1Desc: string;
  pipelineStep2Title: string;
  pipelineStep2Desc: string;
  pipelineStep3Title: string;
  pipelineStep3Desc: string;
  pipelineStep4Title: string;
  pipelineStep4Desc: string;
  pipelineStep5Title: string;
  pipelineStep5Desc: string;
  statAiPipeline: string;
  statAverageRisk: string;
  statGeodeticEngine: string;

  // Custom Plan Modal
  customPlanTitle: string;
  customPlanSubtitle: string;
  fieldPlanId: string;
  fieldTitleNumber: string;
  fieldOwnerName: string;
  fieldLocality: string;
  fieldRegion: string;
  fieldDivision: string;
  fieldUtmZone: string;
  fieldStatedArea: string;
  tableBeaconsTitle: string;
  btnAddBeacon: string;
  btnLoadDoualaExample: string;
  btnCancel: string;
  btnSubmitVerification: string;

  // API Settings Modal
  apiSettingsTitle: string;
  apiSettingsSubtitle: string;
  metaCloudApiKey: string;
  whatsappPhoneId: string;
  whatsappVerifyToken: string;
  webhookUrl: string;
  btnSaveSettings: string;
  settingsSavedNotice: string;

  // WhatsApp Modal
  whatsappModalTitle: string;
  whatsappModalSubtitle: string;
  whatsappInstructions: string;
  whatsappLiveNumber: string;
  whatsappQrText: string;
  btnTestWebhook: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Brand & Navbar
    brandName: "CADASTRA",
    brandSubtitle: "CM · Geodetic Audit Instrument",
    apiConnected: "API Online",
    apiOffline: "Local Engine",
    btnAuditPlan: "Audit Survey Plan (Image/PDF)",
    btnHomeNewPlan: "← Home (New Plan)",
    btnManualInput: "Manual Coordinates",
    btnWhatsApp: "WhatsApp Channel",
    btnApiKeys: "API Keys",
    langSwitchAria: "Switch language between English and French",

    // Sidebar
    navMap: "Satellite Map",
    navInvestigations: "Investigations",
    navReports: "Certified Reports",
    navDatasets: "Ground-Truth Datasets",
    navIntelligence: "AI & Intelligence",
    sidebarCollapse: "Collapse sidebar",
    sidebarExpand: "Expand sidebar",

    // Landing Hero
    heroEyebrow: "MINDCAF Technical Standards · UTM 32N/33N Projections",
    heroTitle: "Cadastral Survey Audit & Title Deed Forensics for Cameroon",
    heroSubtitle:
      "Verify boundary beacon coordinates against official WGS84 / UTM ellipsoids, detect fictitious surface inflation, and compute boundary closure errors before property acquisition.",
    inputPlaceholder:
      "Enter UTM coordinates, a dossier ID, or drop a photo / PDF of the survey plan...",
    btnVerifyNow: "Execute Geodetic Audit",
    btnUploadDocument: "Upload Survey Plan (PDF/JPG)",
    btnManualEntry: "Manual Coordinate Table",
    btnExploreDatasets: "Explore Ground-Truth Profiles",
    navDashboard: "Inspection Dashboard",
    navGeodesy: "UTM Geodesy",
    navSurveyPlan: "Survey Plan",
    navWhatsApp: "WhatsApp API",
    navMuseSpark: "Muse Spark",
    btnImagePicker: "Image (PNG, JPG)",
    btnPdfPicker: "PDF Document",
    btnAuditSubmit: "Audit Survey Plan",
    btnAnalyzing: "AI Analysis...",
    scanningOverlay: "Scanning & Georeferencing in progress...",
    independentTrustBadge: "Independent geodetic verification tool · UTM / WGS84 mathematical verification",
    sampleDoualaYassa: "Douala Yassa (980 m² · Compliant)",
    sampleFraudAlert: "Fraud Alert (+53% Fictitious)",
    sampleYaoundeOdza: "Yaoundé Odza (2,100 m² · 5 beacons)",
    footerHackathon: "CADASTRA CM · META GLOBAL AI DEVELOPER HACKATHON 2026",
    footerGeodesy: "MUSE SPARK 1.3 & SAM 3.1 · CAMEROON GEODETIC ENGINE",

    // Forensic Dossier Panel
    dossierTitle: "Cadastral Forensic Dossier",
    tabSynthesis: "Synthesis",
    tabBeacons: "Beacons",
    tabAiAnalyst: "AI Analyst",
    verdictCompliant: "Geodetically Compliant",
    verdictAnomaly: "Topological Anomaly",
    verdictFraud: "Fictitious Surface / Fraud",
    statedArea: "Stated Area",
    computedArea: "Calculated Area",
    discrepancy: "Discrepancy",
    perimeter: "Perimeter",
    riskScore: "Risk Score",
    polygonClosure: "Perimeter Closure",
    polygonClosed: "Closed loop (Conforming)",
    polygonOpen: "Open perimeter (Defective)",
    selfIntersection: "Boundary Crossing",
    selfIntersectingNo: "Zero self-intersections",
    selfIntersectingYes: "Self-intersecting polygon detected",
    btnDownloadReport: "Download / Téléchargement",
    btnPreviewPdf: "Preview",
    btnShare: "Share Summary",
    copied: "Copied!",
    waitingForPlan: "Awaiting Cadastral Plan",
    waitingForPlanDesc: "Upload a boundary survey plan or enter coordinates to compute the geodetic audit.",
    beaconId: "Beacon ID",
    eastX: "East (X)",
    northY: "North (Y)",
    elevationZ: "Elevation (Z)",
    beaconStatus: "Status",
    legalTolerance: "Legal Tolerance: 1.0%",
    shaSeal: "SHA-256 Digital Fingerprint",

    // AI Forensic Analyst Tab & Q&A
    aiAnalystTitle: "AI Forensic Cadastral Analyst",
    aiAnalystSubtitle: "Meta AI & Geodetic Reasoning Engine",
    aiDiagnosisTitle: "Forensic Diagnosis & Buyer Advice",
    aiAskTitle: "Ask Meta AI about this Parcel",
    aiAskPlaceholder: "Ask a question in plain English (e.g. Is this parcel safe to purchase?)...",
    btnAskAi: "Ask",
    askingAi: "Analyzing with Meta AI...",
    aiSuggestedPrompt1: "Is this parcel safe to purchase?",
    aiSuggestedPrompt2: "Explain the area discrepancy in simple terms",
    aiSuggestedPrompt3: "What must the licensed surveyor rectify?",
    aiSuggestedPrompt4: "What legal cadastral risks apply under Decree 76-165?",
    aiRecommendationsTitle: "Actionable Buyer Recommendations",
    aiLegalTitle: "Cameroon Statutory References",
    aiEngineBadge: "Engine",
    aiDefaultVerdictOk: "Survey boundaries are geodetically sound. Parcel complies with Cameroon cadastral standards.",
    aiDefaultVerdictWarn: "Minor geometric anomalies or boundary warning detected. On-site verification recommended.",
    aiDefaultVerdictDanger: "Critical alert: Significant area inflation or topological defect detected. Do not disburse funds.",
    aiClearChat: "Reset Q&A",

    // Investigations Workspace
    investigationsEyebrow: "Cadastral Investigations · Active Session",
    investigationsTitle: "Investigations",
    investigationsDesc: "Every survey plan audited in this session is recorded here with its geometric metrics, verification status, and SHA-256 fingerprint.",
    filterAll: "All Dossiers",
    filterFlagged: "Flagged Anomaly / Fraud",
    filterCompliant: "Compliant",
    statTotalAudited: "Audited Plans",
    statCompliant: "Compliant",
    statFlagged: "Flagged / Anomalies",
    statAvgDiscrepancy: "Avg Area Discrepancy",
    searchInvestigationsPlaceholder: "Search by plan ID, title deed number, locality, owner...",
    colPlanId: "Plan ID",
    colLocality: "Locality",
    colAreaStated: "Stated Area",
    colAreaComputed: "Calculated Area",
    colVerdict: "Verdict",
    colDate: "Audit Date",
    colActions: "Action",
    emptyInvestigationsTitle: "No investigations in this session",
    emptyInvestigationsDesc: "Audit a survey plan or load a ground-truth dataset to begin.",
    btnNewAudit: "New Audit",

    // Reports Workspace
    reportsEyebrow: "Certified Legal Certificates · SHA-256 Signed",
    reportsTitle: "Certified PDF Reports",
    reportsDesc: "Download official bilingual cadastral certificates with complete geodetic coordinates, Gauss-Shoelace area calculation, and fraud risk score.",
    reportsTotalCertificates: "Certificates Ready",
    reportsReadyToDownload: "Available for Instant Download",
    btnDownloadPdfBilingual: "Download / Téléchargement",
    btnViewDossier: "View Dossier",
    emptyReportsTitle: "No certified reports yet",
    emptyReportsDesc: "Audit a survey plan on the map or landing page to generate official audit certificates.",

    // Datasets Workspace
    datasetsEyebrow: "Ground-Truth Reference Profiles · Cameroon Cadastre",
    datasetsTitle: "Reference Datasets",
    datasetsDesc: "Calibrated test profiles from Douala, Yaoundé, Kribi, and Bafoussam for algorithm verification and anti-fraud benchmarking.",
    datasetTypeReference: "Reference Parcel",
    datasetTypeFraud: "Documented Fraud",
    datasetTypeAnomaly: "Topological Anomaly",
    btnLoadProfile: "Load Profile",
    loadingDataset: "Loading geodetic data...",
    datasetBeaconsCount: "Boundary Beacons",

    // Intelligence Workspace
    intelligenceEyebrow: "AI & Geodetic Architecture · Meta Muse Spark & SAM 3.1",
    intelligenceTitle: "AI & Intelligence",
    intelligenceDesc: "End-to-end pipeline from paper boundary survey plan to legally defensible geodetic verdict. Zero simulated mockups.",
    pipelineStep1Title: "1. Document Ingestion",
    pipelineStep1Desc: "Photo, scan or PDF at 350 DPI with automatic contrast enhancement.",
    pipelineStep2Title: "2. SAM 3.1 Region Segmentation",
    pipelineStep2Desc: "Boundary beacon table isolation and geometric border detection.",
    pipelineStep3Title: "3. Muse Spark Structured Extraction",
    pipelineStep3Desc: "Extraction of beacons B1…Bn, UTM Easting/Northing, and stated surface area.",
    pipelineStep4Title: "4. PyProj Geodetic Verification",
    pipelineStep4Desc: "UTM Zone 32N/33N to WGS84 conversion, Gauss-Shoelace area, and perimeter closure.",
    pipelineStep5Title: "5. Legal Forensic Verdict",
    pipelineStep5Desc: "1.0% Decree 76-165 tolerance threshold, topological check, and SHA-256 seal.",
    statAiPipeline: "Extraction & Reasoning",
    statAverageRisk: "Average Risk Score",
    statGeodeticEngine: "Projection Engine",

    // Custom Plan Modal
    customPlanTitle: "Manual Coordinate Input",
    customPlanSubtitle: "Enter boundary beacon coordinates in UTM Zone 32N or 33N for instant geodetic verification.",
    fieldPlanId: "Plan Identifier",
    fieldTitleNumber: "Title Deed Number",
    fieldOwnerName: "Owner Name",
    fieldLocality: "Locality / District",
    fieldRegion: "Region",
    fieldDivision: "Division / Department",
    fieldUtmZone: "UTM Projection Zone",
    fieldStatedArea: "Stated Area on Plan (m²)",
    tableBeaconsTitle: "Boundary Beacons (Minimum 3 points required)",
    btnAddBeacon: "Add Beacon",
    btnLoadDoualaExample: "Load Douala Yassa Example",
    btnCancel: "Cancel",
    btnSubmitVerification: "Execute Geodetic Audit",

    // API Settings Modal
    apiSettingsTitle: "Meta Platform & Cloud API Settings",
    apiSettingsSubtitle: "Configure Meta AI (Muse Spark / LLaMA 3.1) and WhatsApp Business Cloud API credentials.",
    metaCloudApiKey: "Meta AI / Model API Key",
    whatsappPhoneId: "WhatsApp Phone Number ID",
    whatsappVerifyToken: "WhatsApp Webhook Verify Token",
    webhookUrl: "Webhook URL (Callback)",
    btnSaveSettings: "Save Configuration",
    settingsSavedNotice: "API keys stored in backend memory.",

    // WhatsApp Modal
    whatsappModalTitle: "WhatsApp Cadastral Verification Channel",
    whatsappModalSubtitle: "Allows Cameroon buyers and surveyors to submit boundary plans via WhatsApp for instant automated audit.",
    whatsappInstructions: "Send a photo or PDF of a cadastral survey plan to the Cadastra WhatsApp number to receive an immediate geodetic audit.",
    whatsappLiveNumber: "Official WhatsApp Channel",
    whatsappQrText: "Scan to start automated verification on WhatsApp",
    btnTestWebhook: "Send Test Cadastral Verification",
  },

  fr: {
    // Brand & Navbar
    brandName: "CADASTRA",
    brandSubtitle: "CM · Instrument d'Audit Géodésique",
    apiConnected: "API en ligne",
    apiOffline: "Mode local",
    btnAuditPlan: "Auditer un Plan (Image/PDF)",
    btnHomeNewPlan: "← Accueil (Nouveau Plan)",
    btnManualInput: "Saisie Manuelle",
    btnWhatsApp: "Canal WhatsApp",
    btnApiKeys: "Clés API",
    langSwitchAria: "Changer de langue entre anglais et français",

    // Sidebar
    navMap: "Carte Satellite",
    navInvestigations: "Enquêtes",
    navReports: "Rapports Certifiés",
    navDatasets: "Jeux de Données",
    navIntelligence: "IA & Analyses",
    sidebarCollapse: "Réduire le volet latéral",
    sidebarExpand: "Agrandir le volet latéral",

    // Landing Hero
    heroEyebrow: "Normes Techniques MINDCAF · Projections UTM 32N/33N",
    heroTitle: "Audit Cadastral & Détection de Fraude Foncière au Cameroun",
    heroSubtitle:
      "Vérifiez les coordonnées des bornes sur l'ellipsoïde officiel WGS84 / UTM, détectez les superficies fictives et auditez les erreurs de fermeture avant acquisition foncière.",
    inputPlaceholder:
      "Entrez des coordonnées UTM, un identifiant de dossier, ou déposez une photo / PDF du plan...",
    btnVerifyNow: "Exécuter l'Audit Géodésique",
    btnUploadDocument: "Importer un Plan (PDF/JPG)",
    btnManualEntry: "Tableau de Coordonnées Manuel",
    btnExploreDatasets: "Explorer les Profils Terrains",
    navDashboard: "Tableau de bord",
    navGeodesy: "Géodésie UTM",
    navSurveyPlan: "Plan de bornage",
    navWhatsApp: "WhatsApp API",
    navMuseSpark: "Muse Spark",
    btnImagePicker: "Image (PNG, JPG)",
    btnPdfPicker: "Document PDF",
    btnAuditSubmit: "Auditer le plan",
    btnAnalyzing: "Analyse IA...",
    scanningOverlay: "Analyse & Géoréférencement en cours...",
    independentTrustBadge: "Outil indépendant de vérification géodésique · Calcul mathématique UTM/WGS84",
    sampleDoualaYassa: "Douala Yassa (980 m² · Conforme)",
    sampleFraudAlert: "Alerte Fraude (+53% Fictive)",
    sampleYaoundeOdza: "Yaoundé Odza (2 100 m² · 5 bornes)",
    footerHackathon: "CADASTRA CM · META GLOBAL AI DEVELOPER HACKATHON 2026",
    footerGeodesy: "MUSE SPARK 1.3 & SAM 3.1 · GÉODÉSIE CAMEROUN",

    // Forensic Dossier Panel
    dossierTitle: "Dossier d'Audit Cadastral",
    tabSynthesis: "Synthèse",
    tabBeacons: "Bornes",
    tabAiAnalyst: "Conseiller IA",
    verdictCompliant: "Géodésiquement Conforme",
    verdictAnomaly: "Anomalie Topologique",
    verdictFraud: "Superficie Fictive / Fraude",
    statedArea: "Surface Déclarée",
    computedArea: "Surface Calculée",
    discrepancy: "Écart de Surface",
    perimeter: "Périmètre",
    riskScore: "Score de Risque",
    polygonClosure: "Fermeture du Périmètre",
    polygonClosed: "Boucle fermée (Conforme)",
    polygonOpen: "Périmètre ouvert (Défectueux)",
    selfIntersection: "Croisement de Limites",
    selfIntersectingNo: "Aucune auto-intersection",
    selfIntersectingYes: "Polygone auto-intersectant détecté",
    btnDownloadReport: "Download / Téléchargement",
    btnPreviewPdf: "Aperçu",
    btnShare: "Partager le résumé",
    copied: "Copié !",
    waitingForPlan: "En attente d'un plan cadastral",
    waitingForPlanDesc: "Importez un plan de bornage ou saisissez les coordonnées pour générer l'audit géodésique.",
    beaconId: "Identifiant Borne",
    eastX: "Est (X)",
    northY: "Nord (Y)",
    elevationZ: "Altitude (Z)",
    beaconStatus: "Statut",
    legalTolerance: "Tolérance légale : 1.0%",
    shaSeal: "Empreinte Numérique SHA-256",

    // AI Forensic Analyst Tab & Q&A
    aiAnalystTitle: "Conseiller Cadastral IA",
    aiAnalystSubtitle: "Moteur Raisonnement Géodésique & Meta AI",
    aiDiagnosisTitle: "Diagnostic Forensique & Avis Acheteur",
    aiAskTitle: "Poser une question à l'IA sur cette parcelle",
    aiAskPlaceholder: "Posez votre question en langage simple (ex. Ce terrain est-il sûr à l'achat ?)...",
    btnAskAi: "Demander",
    askingAi: "Analyse en cours avec Meta AI...",
    aiSuggestedPrompt1: "Ce terrain est-il sûr à l'achat ?",
    aiSuggestedPrompt2: "Explique l'écart de surface simplement",
    aiSuggestedPrompt3: "Que doit rectifier le géomètre ?",
    aiSuggestedPrompt4: "Quels sont les risques juridiques selon le Décret 76-165 ?",
    aiRecommendationsTitle: "Recommandations Opérationnelles Acheteur",
    aiLegalTitle: "Références Légales Camerounaises",
    aiEngineBadge: "Moteur",
    aiDefaultVerdictOk: "Le plan est géodésiquement régulier. Parcelle conforme aux normes cadastrales camerounaises.",
    aiDefaultVerdictWarn: "Anomalie géométrique mineure détectée. Vérification complémentaire sur le terrain requise.",
    aiDefaultVerdictDanger: "Alerte critique : Superficie fictive importante ou anomalie de tracé. Ne pas décaisser de fonds.",
    aiClearChat: "Réinitialiser",

    // Investigations Workspace
    investigationsEyebrow: "Enquêtes foncières · Session en cours",
    investigationsTitle: "Investigations",
    investigationsDesc: "Chaque plan audité dans cette session est consigné ici avec sa géométrie, son statut de vérification et son empreinte SHA-256.",
    filterAll: "Tous les dossiers",
    filterFlagged: "Anomalies / Fraudes",
    filterCompliant: "Conformes",
    statTotalAudited: "Dossiers audités",
    statCompliant: "Conformes",
    statFlagged: "Signalés / Anomalies",
    statAvgDiscrepancy: "Écart de surface moyen",
    searchInvestigationsPlaceholder: "Rechercher par identifiant de plan, titre foncier, localité, propriétaire...",
    colPlanId: "Identifiant Plan",
    colLocality: "Localité",
    colAreaStated: "Surface Déclarée",
    colAreaComputed: "Surface Calculée",
    colVerdict: "Verdict",
    colDate: "Date d'Audit",
    colActions: "Action",
    emptyInvestigationsTitle: "Aucune enquête dans cette session",
    emptyInvestigationsDesc: "Auditez un plan de bornage ou chargez un jeu de référence pour commencer.",
    btnNewAudit: "Nouvel audit",

    // Reports Workspace
    reportsEyebrow: "Certificats Légaux Certifiés · Signés SHA-256",
    reportsTitle: "Rapports d'Audit Certifiés",
    reportsDesc: "Téléchargez des certificats cadastraux officiels bilingues avec coordonnées géodésiques complètes, calcul Gauss-Shoelace et score de risque.",
    reportsTotalCertificates: "Certificats prêts",
    reportsReadyToDownload: "Disponibles au téléchargement direct",
    btnDownloadPdfBilingual: "Download / Téléchargement",
    btnViewDossier: "Voir le dossier",
    emptyReportsTitle: "Aucun rapport généré pour l'instant",
    emptyReportsDesc: "Auditez un plan sur la carte ou l'accueil pour produire des certificats officiels.",

    // Datasets Workspace
    datasetsEyebrow: "Profils Réels de Référence · Cadastre du Cameroun",
    datasetsTitle: "Jeux de Données",
    datasetsDesc: "Profils étalonnés de Douala, Yaoundé, Kribi et Bafoussam pour valider les calculs et benchmarker la détection de fraudes.",
    datasetTypeReference: "Parcelle de Référence",
    datasetTypeFraud: "Fraude Documentée",
    datasetTypeAnomaly: "Anomalie Topologique",
    btnLoadProfile: "Charger le profil",
    loadingDataset: "Chargement des coordonnées...",
    datasetBeaconsCount: "Bornes de Limite",

    // Intelligence Workspace
    intelligenceEyebrow: "Architecture IA & Géodésie · Meta Muse Spark & SAM 3.1",
    intelligenceTitle: "IA & Analyses",
    intelligenceDesc: "Le chemin complet entre un plan papier et un verdict opposable : segmentation, extraction structurée, calcul géodésique et visa technique.",
    pipelineStep1Title: "1. Ingestion du Document",
    pipelineStep1Desc: "Photo, scan ou PDF à 350 DPI avec rehaussement automatique du contraste.",
    pipelineStep2Title: "2. Segmentation ROI SAM 3.1",
    pipelineStep2Desc: "Isolation du tableau des coordonnées des bornes et détection du contour parcellaire.",
    pipelineStep3Title: "3. Extraction Structurée Muse Spark",
    pipelineStep3Desc: "Extraction normée des bornes B1…Bn, coordonnées Est/Nord UTM et superficie déclarée.",
    pipelineStep4Title: "4. Moteur Géodésique PyProj",
    pipelineStep4Desc: "Conversion UTM Zone 32N/33N vers WGS84, surface Gauss-Shoelace et fermeture polygonale.",
    pipelineStep5Title: "5. Verdict Forensique & Décret 76-165",
    pipelineStep5Desc: "Contrôle du seuil de tolérance de 1.0%, détection d'auto-intersection et scellement SHA-256.",
    statAiPipeline: "Extraction & Raisonnement",
    statAverageRisk: "Score de Risque Moyen",
    statGeodeticEngine: "Moteur de Projection",

    // Custom Plan Modal
    customPlanTitle: "Saisie Manuelle de Coordonnées",
    customPlanSubtitle: "Entrez les coordonnées des bornes en UTM Zone 32N ou 33N pour vérification géodésique immédiate.",
    fieldPlanId: "Identifiant du Plan",
    fieldTitleNumber: "Numéro de Titre Foncier",
    fieldOwnerName: "Nom du Propriétaire",
    fieldLocality: "Localité / Quartier",
    fieldRegion: "Région",
    fieldDivision: "Département",
    fieldUtmZone: "Zone de Projection UTM",
    fieldStatedArea: "Superficie Déclarée sur le Plan (m²)",
    tableBeaconsTitle: "Bornes Délimitant la Parcelle (Minimum 3 points)",
    btnAddBeacon: "Ajouter une borne",
    btnLoadDoualaExample: "Charger l'Exemple Douala Yassa",
    btnCancel: "Annuler",
    btnSubmitVerification: "Exécuter l'Audit Géodésique",

    // API Settings Modal
    apiSettingsTitle: "Paramètres Meta Platform & API Cloud",
    apiSettingsSubtitle: "Configurez les clés Meta AI (Muse Spark / LLaMA 3.1) et l'API WhatsApp Business Cloud.",
    metaCloudApiKey: "Clé API Meta AI / Modèle",
    whatsappPhoneId: "Identifiant Numéro WhatsApp (Phone Number ID)",
    whatsappVerifyToken: "Token de Vérification Webhook WhatsApp",
    webhookUrl: "URL du Webhook (Callback)",
    btnSaveSettings: "Enregistrer la Configuration",
    settingsSavedNotice: "Clés API enregistrées dans la mémoire du serveur.",

    // WhatsApp Modal
    whatsappModalTitle: "Canal WhatsApp d'Audit Cadastral",
    whatsappModalSubtitle: "Permet aux acheteurs et géomètres au Cameroun d'envoyer leurs plans par WhatsApp pour audit automatique.",
    whatsappInstructions: "Envoyez une photo ou un fichier PDF de plan de bornage au numéro Cadastra WhatsApp pour recevoir l'audit géodésique complet.",
    whatsappLiveNumber: "Canal WhatsApp Officiel",
    whatsappQrText: "Scannez pour démarrer la vérification sur WhatsApp",
    btnTestWebhook: "Envoyer un Audit Cadastral de Test",
  },
};
