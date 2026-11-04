"""Pydantic schemas for Cadastra-Cameroon verification system."""

from __future__ import annotations
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class UTMZoneEnum(str, Enum):
    ZONE_32N = "32N"  # EPSG:32632 - Littoral, Douala, Centre, South-West, North-West, West
    ZONE_33N = "33N"  # EPSG:32633 - East, Adamawa, North, Far-North


class RiskLevel(str, Enum):
    LOW = "LOW"                      # Conforme / Aucune anomalie détectée (< 1% écart)
    MEDIUM = "MEDIUM"                # Tolérance Cadastrale Limite (1% à 5% écart)
    HIGH = "HIGH"                    # Anomalie Cadastrale Majeure (5% à 15% écart)
    CRITICAL_FRAUD = "CRITICAL_FRAUD"# Suspicion de Fraude Avérée / Superficie Fictive (> 15% écart)


class BeaconInput(BaseModel):
    borne_id: str = Field(..., description="Identifiant de la borne (e.g. B1, B2, 102A)")
    x: float = Field(..., description="Coordonnée Esting / X en mètres UTM")
    y: float = Field(..., description="Coordonnée Northing / Y en mètres UTM")
    z: Optional[float] = Field(None, description="Altitude / Z en mètres (si disponible)")
    description: Optional[str] = Field(None, description="Description physique (e.g. Borne béton, piquet)")


class BeaconWGS84(BaseModel):
    borne_id: str
    utm_x: float
    utm_y: float
    latitude: float
    longitude: float
    elevation_m: Optional[float] = None
    description: Optional[str] = None


class BoundarySegment(BaseModel):
    from_borne: str
    to_borne: str
    length_meters: float
    bearing_degrees: Optional[float] = None


class PlanVerificationRequest(BaseModel):
    plan_id: str = Field("PLAN-SANS-ID", description="Identifiant unique du dossier ou plan")
    title_number: Optional[str] = Field(None, description="Numéro du Titre Foncier (e.g. TF 48291/Wouri)")
    owner_name: Optional[str] = Field(None, description="Nom du propriétaire ou déclarant")
    locality: str = Field("Cameroun", description="Localité / Quartier (e.g. Douala Yassa)")
    region: str = Field("Littoral", description="Région du Cameroun")
    division: Optional[str] = Field(None, description="Département (e.g. Wouri, Mfoundi)")
    surveyor_name: Optional[str] = Field(None, description="Nom du Géomètre-Expert")
    surveyor_order_number: Optional[str] = Field(None, description="Numéro d'agrément OGEC")
    utm_zone: UTMZoneEnum = Field(UTMZoneEnum.ZONE_32N, description="Zone UTM (32N ou 33N)")
    stated_area_sqm: float = Field(0.0, description="Superficie mentionnée sur le plan en m²")
    date_surveyed: Optional[str] = Field(None, description="Date de confection du plan (YYYY-MM-DD)")
    beacons: List[BeaconInput] = Field(..., min_length=3, description="Liste ordonnée des bornes du périmètre")


class PlanVerificationResponse(BaseModel):
    plan_id: str
    is_valid: bool
    superficie_fictive_detected: bool
    stated_area_sqm: float
    computed_area_sqm: float
    discrepancy_sqm: float
    discrepancy_percentage: float
    tolerance_passed: bool
    polygon_closed: bool
    self_intersecting: bool
    perimeter_m: float
    centroid_utm: Dict[str, float]
    centroid_wgs84: Dict[str, float]
    utm_zone: str
    epsg_code: str
    beacons_wgs84: List[BeaconWGS84]
    boundary_segments: List[BoundarySegment]
    risk_score: float = Field(..., ge=0, le=100, description="Score de risque géométrique et cadastral de 0 à 100")
    risk_level: RiskLevel
    fraud_indicators: List[str]
    recommendations_fr: List[str]
    recommendations_en: List[str]
    verification_hash: str
    timestamp: str


class TableBoundingBox(BaseModel):
    ymin: float
    xmin: float
    ymax: float
    xmax: float


class PlanExtractionResponse(BaseModel):
    extracted_plan: PlanVerificationRequest
    # Real values only: fields stay None when the platform does not return them.
    # No locally-injected confidence score or segmentation box — no simulated data.
    confidence_score: Optional[float] = None
    table_roi: Optional[TableBoundingBox] = None
    # Pixel-precise table boundary returned by SAM 3.1 after it refines Muse
    # Spark's semantic grounding. It stays separate for transparent provenance.
    sam_table_roi: Optional[TableBoundingBox] = None
    # Lossless PNG data URL of the grounded table crop, present only when the
    # visual-zoom recheck actually ran on a real crop of the uploaded frame.
    table_crop_data_url: Optional[str] = None
    spark_structured_fields: Dict[str, Any] = Field(default_factory=dict)
    detected_language: Optional[str] = None
    notes: Optional[str] = None


class WhatsAppVerificationRequest(BaseModel):
    sender_phone: str
    message_text: Optional[str] = None
    media_url: Optional[str] = None


class WhatsAppVerificationResponse(BaseModel):
    success: bool
    reply_message: str
    pdf_report_url: Optional[str] = None
    verification_summary: Optional[PlanVerificationResponse] = None
    # True only when the reply was actually pushed to the citizen through the
    # WhatsApp Cloud API send endpoint (None / False in local dev without keys).
    cloud_api_text_sent: Optional[bool] = None
    cloud_api_document_sent: Optional[bool] = None
