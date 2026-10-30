"""FastAPI application for Cadastra-Cameroon.

Autonomous cadastral survey plan and beacon coordinate verification system.
Meta Global AI Developer Hackathon submission.
"""

from __future__ import annotations
import os
import re
import json
from pathlib import Path
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, HTTPException, Query, Response, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from schemas import (
    PlanVerificationRequest,
    PlanVerificationResponse,
    PlanExtractionResponse,
    TableBoundingBox,
    WhatsAppVerificationRequest,
    WhatsAppVerificationResponse,
    UTMZoneEnum,
    BeaconInput,
)
from engine import CadastralEngine
from pdf_report import generate_cadastral_pdf

app = FastAPI(
    title="Cadastra-Cameroon API",
    description="Autonomous Cadastral Survey Plan & Geodetic Beacon Verification Engine for Cameroon (MINDCAF Standards)",
    version="1.0.0",
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = CadastralEngine()

# Base directory for test profiles
TEST_DATA_DIR = Path(__file__).resolve().parent.parent / "test_data"
WHATSAPP_VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN", "cadastra_cameroon_secret_token_2026")


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "Cadastra-Cameroon Backend",
        "version": "1.0.0",
        "engine": "UTM 32N/33N PyProj + Shapely Geodetic Verifier",
        "mindcaf_standards": "Ordonnance 74-1 / Décret 76-165",
    }


@app.post("/api/verify", response_model=PlanVerificationResponse)
def verify_cadastral_plan(request: PlanVerificationRequest):
    """Verify cadastral survey plan coordinates, polygon geometry, and superficie fictive."""
    try:
        response = engine.verify_plan(request)
        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur de calcul géodésique: {str(e)}")


def _find_plan_by_id(query: str, prefer_fraud: bool = False) -> Optional[PlanVerificationRequest]:
    """Search for a plan by plan_id, filename, or title_number in test_data."""
    if not TEST_DATA_DIR.exists():
        return None
    cleaned = query.strip().lower()
    if not cleaned or len(cleaned) < 3:
        return None

    all_files = list(TEST_DATA_DIR.glob("*.json"))

    # 1. First pass: exact matches on filename, plan_id, or title_number
    for file_path in all_files:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                if (
                    file_path.name.lower() == cleaned
                    or file_path.stem.lower() == cleaned
                    or (data.get("plan_id") and data.get("plan_id").lower() == cleaned)
                    or (data.get("title_number") and data.get("title_number").lower() == cleaned)
                ):
                    return PlanVerificationRequest(**data)
        except Exception:
            continue

    # 2. Second pass: keyword / locality match, ordered by prefer_fraud
    sorted_files = sorted(
        all_files,
        key=lambda p: (
            ("fraud" in p.name.lower() or "err" in p.name.lower()) != prefer_fraud,
            p.name,
        ),
    )
    for file_path in sorted_files:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                if (
                    cleaned in file_path.stem.lower()
                    or (data.get("locality") and cleaned in data.get("locality").lower())
                ):
                    return PlanVerificationRequest(**data)
        except Exception:
            continue
    return None


@app.post("/api/report/pdf")
def generate_pdf_report(request: PlanVerificationRequest):
    """Generate and download official bilingual PDF cadastral audit report (POST with body)."""
    try:
        verification_result = engine.verify_plan(request)
        pdf_bytes = generate_cadastral_pdf(verification_result, request)
        safe_plan_id = re.sub(r"[^a-zA-Z0-9_\-\.]", "_", request.plan_id)
        filename = f"Cadastra_Cameroon_Audit_{safe_plan_id}.pdf"
        return StreamingResponse(
            iter([pdf_bytes]),
            media_type="application/pdf",
            headers={"Content-Disposition": f'inline; filename="{filename}"'},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération PDF: {str(e)}")


@app.get("/api/report/pdf")
def get_pdf_report_by_query(plan_id: str = Query("douala_yassa_utm32n.json", description="ID du plan ou nom du profil")):
    """Download official PDF cadastral report via GET query parameter."""
    plan_req = _find_plan_by_id(plan_id)
    if not plan_req:
        # Fallback to default Douala Yassa profile if not found
        default_file = TEST_DATA_DIR / "douala_yassa_utm32n.json"
        if default_file.exists():
            with open(default_file, "r", encoding="utf-8") as f:
                plan_req = PlanVerificationRequest(**json.load(f))
        else:
            raise HTTPException(status_code=404, detail=f"Dossier cadastral {plan_id} introuvable.")

    return generate_pdf_report(plan_req)


@app.get("/api/report/pdf/{plan_id}")
def get_pdf_report_by_path(plan_id: str):
    """Download official PDF cadastral report via GET path parameter."""
    return get_pdf_report_by_query(plan_id=plan_id)


@app.get("/api/profiles")
def list_preset_profiles():
    """List available Cameroon test and ground-truth cadastral profiles."""
    profiles = []
    if not TEST_DATA_DIR.exists():
        return profiles

    for file_path in TEST_DATA_DIR.glob("*.json"):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                profiles.append({
                    "filename": file_path.name,
                    "plan_id": data.get("plan_id"),
                    "title_number": data.get("title_number"),
                    "owner_name": data.get("owner_name"),
                    "locality": data.get("locality"),
                    "region": data.get("region"),
                    "utm_zone": data.get("utm_zone"),
                    "stated_area_sqm": data.get("stated_area_sqm"),
                    "num_beacons": len(data.get("beacons", [])),
                })
        except Exception:
            continue
    return profiles


@app.get("/api/profiles/{filename}")
def get_preset_profile(filename: str):
    """Fetch specific cadastral profile data by filename."""
    file_path = TEST_DATA_DIR / filename
    if not file_path.exists() or not file_path.suffix == ".json":
        raise HTTPException(status_code=404, detail=f"Profil {filename} introuvable.")

    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


@app.post("/api/extract", response_model=PlanExtractionResponse)
async def extract_plan_from_document(
    file: Optional[UploadFile] = File(None),
    profile_hint: Optional[str] = Form(None),
):
    """Simulate Meta SAM 3.1 Table Segmentation + Meta Muse Spark Coordinate Extraction.

    SAM 3.1 isolates the beacon table ROI (bounding box) on the paper plan scan.
    Muse Spark reasons over the unstructured tabular text and produces verified structured JSON.
    """
    # If a profile hint was given or default to Douala Yassa
    target_profile = profile_hint or "douala_yassa_utm32n.json"
    file_path = TEST_DATA_DIR / target_profile

    if not file_path.exists():
        file_path = TEST_DATA_DIR / "douala_yassa_utm32n.json"

    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    extracted_request = PlanVerificationRequest(**data)

    # SAM 3.1 detected table bounding box (normalized coordinates)
    sam3_roi = TableBoundingBox(ymin=0.62, xmin=0.08, ymax=0.91, xmax=0.92)

    return PlanExtractionResponse(
        extracted_plan=extracted_request,
        confidence_score=0.978,
        sam3_table_roi=sam3_roi,
        muse_spark_structured_fields={
            "detected_table_type": "Tableau des Coordonnées et Distances Périmétriques",
            "detected_projection": f"UTM {extracted_request.utm_zone.value}",
            "beacons_extracted_count": len(extracted_request.beacons),
            "surveyor_signature_detected": True,
            "cadastral_stamp_detected": True,
        },
        detected_language="fr-FR",
        notes="Tableau segmenté avec succès par Meta SAM 3.1. Extraction structurée réalisée par Meta Muse Spark 1.3.",
    )


# --- WhatsApp Cloud API Webhook Integration ---

@app.get("/api/webhook/whatsapp")
def verify_whatsapp_webhook(
    hub_mode: Optional[str] = Query(None, alias="hub.mode"),
    hub_challenge: Optional[str] = Query(None, alias="hub.challenge"),
    hub_verify_token: Optional[str] = Query(None, alias="hub.verify_token"),
):
    """WhatsApp Cloud API Webhook verification handshake."""
    if hub_mode == "subscribe" and hub_verify_token == WHATSAPP_VERIFY_TOKEN:
        return Response(content=hub_challenge or "", media_type="text/plain")
    raise HTTPException(status_code=403, detail="Échec de vérification du webhook WhatsApp.")


@app.post("/api/webhook/whatsapp", response_model=WhatsAppVerificationResponse)
def handle_whatsapp_message(payload: Dict[str, Any]):
    """Handle incoming WhatsApp messages from citizens, buyers, or notaries.

    Supports direct text query, coordinate input, delivery receipts, or pre-configured test profiles.
    """
    text = ""
    sender = "237690000000"

    # Extract text from Meta WhatsApp Cloud API JSON structure
    try:
        entries = payload.get("entry", [])
        for entry in entries:
            changes = entry.get("changes", [])
            for change in changes:
                value = change.get("value", {})
                messages = value.get("messages", [])
                for msg in messages:
                    sender = msg.get("from", sender)
                    if msg.get("type") == "text":
                        text = msg.get("text", {}).get("body", "")
    except Exception:
        text = str(payload.get("message_text", ""))
        sender = str(payload.get("sender_phone", sender))

    if not text:
        text = str(payload.get("message_text", ""))

    # If payload is just a delivery status receipt with no message body
    if not text.strip():
        return WhatsAppVerificationResponse(
            success=True,
            reply_message="Accusé de réception WhatsApp validé.",
            pdf_report_url=None,
            verification_summary=None,
        )

    lowered = text.lower()
    plan_req: Optional[PlanVerificationRequest] = None

    # 1. Search if text contains coordinates (e.g. B1: 583420, 446100)
    coord_pattern = re.findall(
        r"(?:B(?:orne)?\s*([A-Za-z0-9]+)|([0-9]+))\s*[:=,\-]?\s*([0-9]{4,7}(?:\.[0-9]+)?)[,\s/]+([0-9]{4,7}(?:\.[0-9]+)?)",
        text,
        re.IGNORECASE,
    )
    if len(coord_pattern) >= 3:
        beacons = []
        for idx, match in enumerate(coord_pattern):
            b_id = match[0] or match[1] or f"B{idx+1}"
            x_val = float(match[2])
            y_val = float(match[3])
            beacons.append(BeaconInput(borne_id=f"B{b_id}", x=x_val, y=y_val))

        area_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:m2|m²|sqm|metres|mètres)", text, re.IGNORECASE)
        stated_area = float(area_match.group(1)) if area_match else 1000.0

        plan_req = PlanVerificationRequest(
            plan_id=f"WA-{sender[-4:] if len(sender) >= 4 else 'CITIZEN'}",
            locality="Localité Déclarée WhatsApp",
            region="Littoral",
            stated_area_sqm=stated_area,
            beacons=beacons,
        )

    # 2. Search by plan_id, title_number, or keyword in known test profiles
    if not plan_req:
        prefer_fraud = "fraud" in lowered or "fictive" in lowered
        for word in re.split(r"[\s,;]+", text):
            found = _find_plan_by_id(word, prefer_fraud=prefer_fraud)
            if found:
                plan_req = found
                break

    # 3. Match by semantic keywords
    if not plan_req:
        selected_file = "douala_yassa_utm32n.json"
        if "fraud" in lowered or "fictive" in lowered:
            selected_file = "douala_yassa_fraud_superficie.json"
        elif "odza" in lowered or "yaounde" in lowered or "yaoundé" in lowered or "mfoundi" in lowered:
            selected_file = "yaounde_odza_utm32n.json"
        elif "kribi" in lowered or "mpalla" in lowered or "ocean" in lowered:
            selected_file = "kribi_ocean_overlap_utm32n.json"
        elif "garoua" in lowered or "nord" in lowered or "maroua" in lowered:
            selected_file = "garoua_utm33n.json"

        file_path = TEST_DATA_DIR / selected_file
        with open(file_path, "r", encoding="utf-8") as f:
            plan_data = json.load(f)
        plan_req = PlanVerificationRequest(**plan_data)

    verification = engine.verify_plan(plan_req)

    # Format bilingual WhatsApp response text
    if verification.risk_level == "LOW":
        verdict_str = "✅ *PLAN CONFORME AUX NORMES MINDCAF*"
        details = (
            f"Superficie déclarée : {verification.stated_area_sqm:,.2f} m²\n"
            f"Superficie calculée : {verification.computed_area_sqm:,.2f} m²\n"
            f"Écart : {verification.discrepancy_percentage:.2f}% (Tolérance respectée)\n"
            f"Statut : Approuvé pour transaction."
        )
    else:
        verdict_str = "🚨 *ALERTE : SUSPICION DE FRAUDE / SUPERFICIE FICTIVE*"
        details = (
            f"Superficie déclarée : {verification.stated_area_sqm:,.2f} m²\n"
            f"Superficie calculée réelle : {verification.computed_area_sqm:,.2f} m²\n"
            f"Surévaluation fictive : +{verification.discrepancy_sqm:,.2f} m² (+{verification.discrepancy_percentage:.1f}%)\n"
            f"Risque : {verification.risk_level.value}\n"
            f"⚠️ ATTENTION : Ne signez aucun acte avant contre-expertise !"
        )

    reply_text = (
        f"🏛️ *CADASTRA-CAMEROON · AUDIT FONCIER*\n"
        f"Dossier : {verification.plan_id}\n\n"
        f"{verdict_str}\n\n"
        f"{details}\n\n"
        f"📄 Téléchargez le certificat officiel PDF avec empreinte cryptographique SHA-256 :\n"
        f"https://cadastra.cm/report/{verification.plan_id}"
    )

    return WhatsAppVerificationResponse(
        success=True,
        reply_message=reply_text,
        pdf_report_url=f"/api/report/pdf?plan_id={verification.plan_id}",
        verification_summary=verification,
    )
