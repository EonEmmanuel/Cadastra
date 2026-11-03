export type UTMZone = "32N" | "33N";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL_FRAUD";

export interface BeaconInput {
  borne_id: string;
  x: number;
  y: number;
  z?: number;
  description?: string;
}

export interface BeaconWGS84 {
  borne_id: string;
  utm_x: number;
  utm_y: number;
  latitude: number;
  longitude: number;
  elevation_m?: number | null;
  description?: string;
}

export interface BoundarySegment {
  from_borne: string;
  to_borne: string;
  length_meters: number;
  bearing_degrees?: number;
}

export interface PlanVerificationRequest {
  plan_id: string;
  title_number?: string;
  owner_name?: string;
  locality: string;
  region: string;
  division?: string;
  surveyor_name?: string;
  surveyor_order_number?: string;
  utm_zone: UTMZone;
  stated_area_sqm: number;
  date_surveyed?: string;
  beacons: BeaconInput[];
}

export interface PlanVerificationResponse {
  plan_id: string;
  is_valid: boolean;
  superficie_fictive_detected: boolean;
  stated_area_sqm: number;
  computed_area_sqm: number;
  discrepancy_sqm: number;
  discrepancy_percentage: number;
  tolerance_passed: boolean;
  polygon_closed: boolean;
  self_intersecting: boolean;
  perimeter_m: number;
  centroid_utm: { x: number; y: number };
  centroid_wgs84: { latitude: number; longitude: number };
  utm_zone: string;
  epsg_code: string;
  beacons_wgs84: BeaconWGS84[];
  boundary_segments: BoundarySegment[];
  risk_score: number;
  risk_level: RiskLevel;
  fraud_indicators: string[];
  recommendations_fr: string[];
  recommendations_en: string[];
  verification_hash: string;
  timestamp: string;
}

export interface CadastralProfileSummary {
  filename: string;
  plan_id: string;
  title_number?: string;
  owner_name?: string;
  locality: string;
  region: string;
  utm_zone: UTMZone;
  stated_area_sqm: number;
  num_beacons: number;
}

export interface TableBoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface PlanExtractionResponse {
  extracted_plan: PlanVerificationRequest;
  confidence_score: number | null;
  table_roi: TableBoundingBox | null;
  sam_table_roi: TableBoundingBox | null;
  table_crop_data_url: string | null;
  spark_structured_fields: Record<string, any>;
  detected_language: string | null;
  notes: string | null;
}

export type VerificationSource = "upload" | "manual" | "dataset";

/**
 * One completed verification held in the session workspace. The dashboard,
 * investigations, reports and intelligence panes all read from this single
 * list so the UI never has to invent a case that does not exist.
 */
export interface VerificationRecord {
  id: string;
  request: PlanVerificationRequest;
  result: PlanVerificationResponse;
  timestamp: string;
  source: VerificationSource;
}

// Real provenance of a live extraction, passed from the hero to the review
// modal so it can render the actual uploaded document with the actual
// Muse Spark grounding box (never simulated).
export interface PlanExtractionPreview {
  previewUrl: string;
  previewKind: "image" | "pdf";
  tableRoi: TableBoundingBox | null;
  samTableRoi: TableBoundingBox | null;
  cropUrl: string | null;
  samSegmentation: string | null;
  documentSource: string | null;
  zoomRecheck: string | null;
  protocol: string | null;
  detectedLanguage: string | null;
}
