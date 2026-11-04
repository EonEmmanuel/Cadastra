"""FastAPI application for Cadastra-Cameroon.

Autonomous cadastral survey plan and beacon coordinate verification system.
Meta Global AI Developer Hackathon submission.
"""

from __future__ import annotations
import os
import re
import io
import json
import base64
import shutil
import subprocess
import tempfile
from pathlib import Path
import uuid
from typing import Optional, List, Dict, Any

from dotenv import load_dotenv
import httpx
from PIL import Image, ImageOps
from pydantic import ValidationError
try:
    from pypdf import PdfReader
except ImportError:  # Clear runtime error below when an environment is incomplete.
    PdfReader = None
try:
    import pypdfium2 as pdfium
except ImportError:
    pdfium = None

# Load backend/.env (git-ignored) so a plain "uvicorn backend.main:app" run
# picks up META_API_KEY, WHATSAPP_TOKEN, PHONE_NUMBER_ID and
# WHATSAPP_VERIFY_TOKEN without extra configuration.
load_dotenv()
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
    CadastralQARequest,
    CadastralQAResponse,
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
    expose_headers=["Content-Disposition", "Content-Length"],
)

engine = CadastralEngine()

# Base directory for test profiles
TEST_DATA_DIR = Path(__file__).resolve().parent.parent / "test_data"
WHATSAPP_VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN", "cadastra_cameroon_secret_token_2026")


# Global runtime API configuration (can be updated dynamically via UI)
RUNTIME_CONFIG = {
    "whatsapp_token": os.getenv("WHATSAPP_TOKEN", ""),
    "phone_number_id": os.getenv("PHONE_NUMBER_ID", ""),
    "whatsapp_verify_token": os.getenv("WHATSAPP_VERIFY_TOKEN", "cadastra_cameroon_secret_token_2026"),
    # Hackathon platform key granting SAM 3.1 + Spark access (Llama is NOT part
    # of this key; open-weight models like Glimmer are not callable with it).
    "meta_api_key": os.getenv(
        "META_API_KEY",
        os.getenv("MODEL_API_KEY", os.getenv("META_MODEL_API_KEY", os.getenv("META_LLAMA_KEY", ""))),
    ),
    "webhook_url": "http://localhost:8000/api/webhook/whatsapp",
}

# Meta Model API (verified against https://dev.meta.ai/docs/, Oct 2026):
# - Base URL https://api.meta.ai/v1, Bearer auth.
# - Muse Spark 1.3 reads images (Chat Completions `image_url` data URL) and
#   grounds objects on a normalized 0-1000 grid.
# - Contributor mode variants: muse-spark-1.3-contributor / muse-spark-1.2-
#   contributor run the SAME models at ~12-21x cheaper token prices in exchange
#   for permission to train on submitted content (limits: 150 RPM / 3M TPM).
#   Choose via META_EXTRACT_MODEL_ID — Standard mode keeps content out of training.
# - SAM 3.1 (model sam-3.1) segments via the Responses API — same key, available
#   for pixel-accurate ROI if needed later.
# - Muse Glimmer / Muse Spark Open are open weights, self-hosted only: NOT
#   callable through this key. Llama is not part of this API's model list.
META_API_BASE_URL = "https://api.meta.ai"
META_EXTRACT_MODEL_ID = os.getenv("META_EXTRACT_MODEL_ID", "muse-spark-1.3")
META_VISION_MODEL_ID = os.getenv("META_VISION_MODEL_ID", "sam-3.1")

# Inline image_url is limited to image MIME types; PDFs go through the Files API.
INLINE_IMAGE_MIME_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"}

CADASTRA_EXTRACTION_SYSTEM_PROMPT = (
    "Tu es l'agent d'extraction cadastrale pour le Cameroun (MINDCAF), basé sur Meta Model API (Muse Spark). "
    "Analyse l'image du plan cadastral fournie et extrait le tableau des coordonnées géodésiques. "
    "Repnds UNIQUEMENT un objet JSON conforme au schéma: plan_id, locality, region, utm_zone (32N ou 33N), "
    "stated_area_sqm (superficie déclarée en m²), beacons (liste ordonnée {borne_id, x Easting, y Northing, z optionnel}) "
    "et coordinates_table_box: cadre englobant du tableau de coordonnées sur la grille normalisée 0-1000 (0,0 en haut à gauche)."
)
CADASTRA_EXTRACTION_USER_PROMPT = (
    "Extrais les bornes géodésiques (identifiants, X, Y) et la superficie déclarée de ce plan cadastral, "
    "puis localise le tableau de coordonnées. Retourne uniquement le JSON du schéma."
)

CADASTRA_EDITABLE_PDF_SYSTEM_PROMPT = (
    "Tu es l'agent d'extraction cadastrale pour le Cameroun (MINDCAF). "
    "Le contenu fourni provient directement de la couche texte d'un PDF éditable, "
    "et non d'une OCR. Extrais le plan et le tableau de bornes sans modifier les "
    "chiffres, sans compléter une valeur absente et sans inventer une décimale. "
    "Réponds UNIQUEMENT avec le JSON demandé."
)

CADASTRA_EDITABLE_PDF_USER_PROMPT = (
    "Voici le texte extrait directement du PDF. Identifie le plan, la localité, le "
    "fuseau UTM, la superficie déclarée et les bornes ordonnées.\n\n"
)

# Zoom recheck pass: second Spark call on the grounded table crop.
CADASTRA_ZOOM_RECHECK_SYSTEM_PROMPT = (
    "Tu es un agent de relecture cadastrale pour le Cameroun (MINDCAF), basé sur Meta Model API (Muse Spark). "
    "On t'envoie le recadrage haute résolution du tableau de coordonnées d'un plan de bornage déjà localisé par grounding. "
    "Relis le tableau en entier, colonne par colonne, ligne par ligne, chaque chiffre isolément "
    "(attention aux confusions 1/7, 5/6, 0/O et aux décimales tronquées). "
    "N'arrondis JAMAIS une valeur: reproduis toutes les décimales imprimées, y compris les .00. "
    "Si une valeur est partiellement illisible, garde la lecture la plus probable sans jamais la tronquer. "
    "Réponds UNIQUEMENT un objet JSON conforme au schéma: beacons = liste ordonnée "
    "{borne_id, x (Easting), y (Northing), z optionnel}."
)
CADASTRA_ZOOM_RECHECK_USER_PROMPT = (
    "Relis précisément ce tableau de bornage recadré et retourne chaque borne avec ses valeurs exactes, "
    "décimales telles qu'imprimées. Retourne uniquement le JSON du schéma."
)

# Structured output (json_schema) — the platform constrains decoding to this schema.
PLAN_EXTRACTION_JSON_FORMAT = {
    "type": "json_schema",
    "json_schema": {
        "name": "cadastral_plan",
        "schema": {
            "type": "object",
            "additionalProperties": False,
            "properties": {
                "plan_id": {"type": "string"},
                "locality": {"type": "string"},
                "region": {"type": "string"},
                "utm_zone": {"type": "string", "enum": ["32N", "33N"]},
                "stated_area_sqm": {"type": "number"},
                "coordinates_table_box": {
                    "type": "object",
                    "additionalProperties": False,
                    "properties": {
                        "x_min": {"type": "integer"},
                        "y_min": {"type": "integer"},
                        "x_max": {"type": "integer"},
                        "y_max": {"type": "integer"},
                    },
                    "required": ["x_min", "y_min", "x_max", "y_max"],
                },
                "beacons": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "additionalProperties": False,
                        "properties": {
                            "borne_id": {"type": "string"},
                            "x": {"type": "number"},
                            "y": {"type": "number"},
                            "z": {"type": "number"},
                        },
                        "required": ["borne_id", "x", "y"],
                    },
                },
            },
            "required": ["plan_id", "locality", "region", "utm_zone", "stated_area_sqm", "beacons"],
        },
    },
}

# Zoom recheck contract: beacons only. The crop shows the coordinates table,
# never the full plan header, so no plan metadata is requested — nothing gets
# invented from a cropped view.
PLAN_ZOOM_RECHECK_JSON_FORMAT = {
    "type": "json_schema",
    "json_schema": {
        "name": "beacon_zoom_recheck",
        "schema": {
            "type": "object",
            "additionalProperties": False,
            "properties": {
                "beacons": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "additionalProperties": False,
                        "properties": {
                            "borne_id": {"type": "string"},
                            "x": {"type": "number"},
                            "y": {"type": "number"},
                            "z": {"type": "number"},
                        },
                        "required": ["borne_id", "x", "y"],
                    },
                    "minItems": 3,
                },
            },
            "required": ["beacons"],
        },
    },
}


# --- WhatsApp Cloud API outbound push (Graph API) ---

GRAPH_API_BASE = "https://graph.facebook.com"
GRAPH_API_VERSION = "v26.0"


def upload_whatsapp_media(pdf_bytes: bytes, filename: str) -> Optional[str]:
    """Upload a locally-generated PDF audit certificate to WhatsApp media storage.

    Returns the media_id on success, or None when credentials are missing or the
    upload fails, so the reply flow degrades gracefully to text-only.
    """
    token = RUNTIME_CONFIG.get("whatsapp_token") or ""
    phone_number_id = RUNTIME_CONFIG.get("phone_number_id") or ""
    if not token or not phone_number_id:
        return None

    url = f"{GRAPH_API_BASE}/{GRAPH_API_VERSION}/{phone_number_id}/media"
    try:
        with httpx.Client(timeout=60.0) as client:
            response = client.post(
                url,
                headers={"Authorization": f"Bearer {token}"},
                data={"messaging_product": "whatsapp"},
                files={"file": (filename, io.BytesIO(pdf_bytes), "application/pdf")},
            )
            response.raise_for_status()
            return response.json().get("id")
    except Exception as exc:
        print(f"[WhatsApp] Media upload failed: {exc}")
        return None


def send_whatsapp_message(recipient: str, message_payload: Dict[str, Any]) -> bool:
    """Push a message to a citizen via `POST /{phone_number_id}/messages`.

    Meta discards the webhook's HTTP response body, so replies MUST be pushed
    explicitly through this endpoint — a webhook that only returns JSON would
    leave the citizen with no response at all.
    """
    token = RUNTIME_CONFIG.get("whatsapp_token") or ""
    phone_number_id = RUNTIME_CONFIG.get("phone_number_id") or ""
    if not token or not phone_number_id:
        return False

    url = f"{GRAPH_API_BASE}/{GRAPH_API_VERSION}/{phone_number_id}/messages"
    body: Dict[str, Any] = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": recipient,
        **message_payload,
    }
    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.post(
                url,
                headers={"Authorization": f"Bearer {token}"},
                json=body,
            )
            response.raise_for_status()
            return True
    except Exception as exc:
        print(f"[WhatsApp] Send failed for {recipient}: {exc}")
        return False


@app.get("/api/config")
def get_runtime_config():
    """Return current API and webhook integration configuration."""
    return {
        "whatsapp_token_configured": bool(RUNTIME_CONFIG["whatsapp_token"]),
        "phone_number_id": RUNTIME_CONFIG["phone_number_id"],
        "whatsapp_verify_token": RUNTIME_CONFIG["whatsapp_verify_token"],
        "meta_api_key_configured": bool(RUNTIME_CONFIG["meta_api_key"]),
        # Legacy alias kept for clients still reading the old field name.
        "meta_llama_key_configured": bool(RUNTIME_CONFIG["meta_api_key"]),
        "webhook_url": RUNTIME_CONFIG["webhook_url"],
    }


@app.post("/api/config")
def update_runtime_config(payload: Dict[str, str]):
    """Update Meta WhatsApp Cloud API credentials and Meta platform (SAM 3.1 / Spark) API keys."""
    if "whatsapp_token" in payload:
        RUNTIME_CONFIG["whatsapp_token"] = payload["whatsapp_token"]
    if "phone_number_id" in payload:
        RUNTIME_CONFIG["phone_number_id"] = payload["phone_number_id"]
    if "whatsapp_verify_token" in payload:
        RUNTIME_CONFIG["whatsapp_verify_token"] = payload["whatsapp_verify_token"]
        global WHATSAPP_VERIFY_TOKEN
        WHATSAPP_VERIFY_TOKEN = payload["whatsapp_verify_token"]
    for key_name in ("meta_api_key", "meta_llama_key", "model_api_key"):
        if key_name in payload:
            RUNTIME_CONFIG["meta_api_key"] = payload[key_name]
            break
    if "webhook_url" in payload:
        RUNTIME_CONFIG["webhook_url"] = payload["webhook_url"]

    return {
        "status": "success",
        "message": "Configuration API mise à jour avec succès.",
        "config": get_runtime_config(),
    }


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


# In-memory registry for recently audited plans so on-the-fly uploads can be retrieved for PDF/reports
RECENT_VERIFIED_PLANS: Dict[str, PlanVerificationRequest] = {}
SAVED_PLANS_DIR = Path(__file__).resolve().parent / "saved_plans"
SAVED_PLANS_DIR.mkdir(parents=True, exist_ok=True)

def _save_plan_to_disk(req: PlanVerificationRequest):
    try:
        safe_id = re.sub(r"[^a-zA-Z0-9_\-\.]", "_", req.plan_id or "plan")
        target_file = SAVED_PLANS_DIR / f"{safe_id}.json"
        with open(target_file, "w", encoding="utf-8") as f:
            json.dump(req.model_dump(), f, ensure_ascii=False, indent=2)
    except Exception:
        pass

@app.post("/api/verify", response_model=PlanVerificationResponse)
def verify_cadastral_plan(request: PlanVerificationRequest):
    """Verify cadastral survey plan coordinates, polygon geometry, and superficie fictive."""
    try:
        response = engine.verify_plan(request)
        if not request.plan_id:
            request.plan_id = f"PLAN-{uuid.uuid4().hex[:8].upper()}"
        RECENT_VERIFIED_PLANS[request.plan_id] = request
        clean_id = re.sub(r"[^a-zA-Z0-9_\-\.]", "_", request.plan_id).lower()
        RECENT_VERIFIED_PLANS[clean_id] = request
        _save_plan_to_disk(request)
        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur de calcul géodésique: {str(e)}")


def _find_plan_by_id(query: str, prefer_fraud: bool = False) -> Optional[PlanVerificationRequest]:
    """Search for a plan by plan_id, filename, or title_number in memory, saved_plans, and test_data."""
    cleaned = query.strip().lower()
    if not cleaned:
        return None

    # Check recent in-memory verifications first
    if query in RECENT_VERIFIED_PLANS:
        return RECENT_VERIFIED_PLANS[query]
    if cleaned in RECENT_VERIFIED_PLANS:
        return RECENT_VERIFIED_PLANS[cleaned]
    for k, v in RECENT_VERIFIED_PLANS.items():
        if cleaned in k.lower():
            return v

    search_dirs = [SAVED_PLANS_DIR]
    if TEST_DATA_DIR.exists():
        search_dirs.append(TEST_DATA_DIR)

    all_files: List[Path] = []
    for d in search_dirs:
        if d.exists():
            all_files.extend(list(d.glob("*.json")))

    alpha_query = re.sub(r"[^a-zA-Z0-9]", "", cleaned)

    # 1. First pass: exact or normalized matches on filename, plan_id, or title_number
    for file_path in all_files:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                file_stem_clean = file_path.stem.lower()
                file_stem_alpha = re.sub(r"[^a-zA-Z0-9]", "", file_stem_clean)
                pid = str(data.get("plan_id") or "").lower()
                pid_alpha = re.sub(r"[^a-zA-Z0-9]", "", pid)
                tnum = str(data.get("title_number") or "").lower()
                tnum_alpha = re.sub(r"[^a-zA-Z0-9]", "", tnum)

                if (
                    file_path.name.lower() == cleaned
                    or file_stem_clean == cleaned
                    or (alpha_query and alpha_query == file_stem_alpha)
                    or (pid and pid == cleaned)
                    or (alpha_query and alpha_query == pid_alpha)
                    or (tnum and tnum == cleaned)
                    or (alpha_query and alpha_query == tnum_alpha)
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
                file_stem_alpha = re.sub(r"[^a-zA-Z0-9]", "", file_path.stem.lower())
                loc = str(data.get("locality") or "").lower()
                if (
                    cleaned in file_path.stem.lower()
                    or (alpha_query and alpha_query in file_stem_alpha)
                    or (loc and cleaned in loc)
                ):
                    return PlanVerificationRequest(**data)
        except Exception:
            continue
    return None


@app.post("/api/report/pdf")
def generate_pdf_report(
    request: PlanVerificationRequest,
    disposition: str = Query("attachment"),
    language: str = Query("bilingual", description="Report language: 'bilingual', 'en', or 'fr'"),
):
    """Generate and download official PDF cadastral audit report (Bilingual, English, or French)."""
    try:
        if not request.plan_id:
            request.plan_id = f"PLAN-{uuid.uuid4().hex[:8].upper()}"
        RECENT_VERIFIED_PLANS[request.plan_id] = request
        clean_id = re.sub(r"[^a-zA-Z0-9_\-\.]", "_", request.plan_id).lower()
        RECENT_VERIFIED_PLANS[clean_id] = request
        _save_plan_to_disk(request)
        verification_result = engine.verify_plan(request)
        pdf_bytes = generate_cadastral_pdf(verification_result, request, language=language)
        safe_plan_id = re.sub(r"[^a-zA-Z0-9_\-\.]", "_", request.plan_id or "plan")
        filename = f"Cadastra_Cameroon_Audit_{safe_plan_id}.pdf"
        disp_type = "inline" if disposition.lower() == "inline" else "attachment"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'{disp_type}; filename="{filename}"',
                "Content-Length": str(len(pdf_bytes)),
                "Accept-Ranges": "bytes",
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération PDF: {str(e)}")


@app.get("/api/report/pdf")
def get_pdf_report_by_query(
    plan_id: str = Query("douala_yassa_utm32n.json", description="ID du plan ou nom du profil"),
    disposition: str = Query("attachment", description="inline ou attachment"),
    language: str = Query("bilingual", description="Report language: 'bilingual', 'en', or 'fr'"),
):
    """Download official PDF cadastral report via GET query parameter."""
    plan_req = _find_plan_by_id(plan_id)
    if not plan_req:
        raise HTTPException(status_code=404, detail=f"Dossier cadastral {plan_id} introuvable.")

    return generate_pdf_report(plan_req, disposition=disposition, language=language)


@app.head("/api/report/pdf")
def head_pdf_report_by_query(
    plan_id: str = Query("douala_yassa_utm32n.json", description="ID du plan ou nom du profil"),
    disposition: str = Query("attachment", description="inline ou attachment"),
    language: str = Query("bilingual", description="Report language: 'bilingual', 'en', or 'fr'"),
):
    """Support HTTP HEAD requests for download managers and Chromium probes."""
    plan_req = _find_plan_by_id(plan_id)
    if not plan_req:
        raise HTTPException(status_code=404, detail=f"Dossier cadastral {plan_id} introuvable.")
    resp = generate_pdf_report(plan_req, disposition=disposition, language=language)
    return Response(
        content=b"",
        status_code=200,
        media_type="application/pdf",
        headers=resp.headers,
    )


@app.get("/api/report/pdf/{plan_id}")
def get_pdf_report_by_path(
    plan_id: str,
    disposition: str = Query("attachment"),
    language: str = Query("bilingual", description="Report language: 'bilingual', 'en', or 'fr'"),
):
    """Download official PDF cadastral report via GET path parameter."""
    return get_pdf_report_by_query(plan_id=plan_id, disposition=disposition, language=language)


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


def _meta_json_headers() -> Dict[str, str]:
    return {
        "Authorization": f"Bearer {RUNTIME_CONFIG.get('meta_api_key', '')}",
        "Content-Type": "application/json",
    }


async def _extract_via_chat_completions(content_bytes: bytes, media_type: str) -> tuple[Dict[str, Any], str]:
    """Image path: inline base64 data URL through POST /v1/chat/completions.

    Verified request shape (dev.meta.ai/docs/image-understanding): Muse Spark
    reads the image and json_schema structured output constrains the response.
    """
    b64_content = base64.b64encode(content_bytes).decode("utf-8")

    async with httpx.AsyncClient(timeout=45.0) as client:
        response = await client.post(
            f"{META_API_BASE_URL}/v1/chat/completions",
            headers=_meta_json_headers(),
            json={
                "model": META_EXTRACT_MODEL_ID,
                "messages": [
                    {"role": "system", "content": CADASTRA_EXTRACTION_SYSTEM_PROMPT},
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": CADASTRA_EXTRACTION_USER_PROMPT},
                            {
                                "type": "image_url",
                                "image_url": {"url": f"data:{media_type};base64,{b64_content}"},
                            },
                        ],
                    },
                ],
                "response_format": PLAN_EXTRACTION_JSON_FORMAT,
            },
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"Erreur Meta Model API {response.status_code}: {response.text[:300]}",
        )
    raw_text = response.json()["choices"][0]["message"]["content"]
    return json.loads(raw_text), "chat-completions"


async def _recheck_beacons_via_chat_completions(crop_bytes: bytes) -> Dict[str, Any]:
    """Second-pass digit re-read on the grounded table crop (visual zoom).

    Same verified Chat Completions request shape as the primary extraction, but
    the payload is a focused, lossless PNG of just the coordinates table and the
    schema covers beacons only (no plan metadata to invent from a cropped view).
    Raises on platform errors or unparseable text — the caller degrades
    gracefully to the first-pass reading.
    """
    b64_content = base64.b64encode(crop_bytes).decode("utf-8")

    async with httpx.AsyncClient(timeout=45.0) as client:
        response = await client.post(
            f"{META_API_BASE_URL}/v1/chat/completions",
            headers=_meta_json_headers(),
            json={
                "model": META_EXTRACT_MODEL_ID,
                "messages": [
                    {"role": "system", "content": CADASTRA_ZOOM_RECHECK_SYSTEM_PROMPT},
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": CADASTRA_ZOOM_RECHECK_USER_PROMPT},
                            {
                                "type": "image_url",
                                "image_url": {"url": f"data:image/png;base64,{b64_content}"},
                            },
                        ],
                    },
                ],
                "response_format": PLAN_ZOOM_RECHECK_JSON_FORMAT,
            },
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"Erreur Meta Model API {response.status_code}: {response.text[:300]}",
        )
    raw_text = response.json()["choices"][0]["message"]["content"]
    return json.loads(raw_text)


def _parse_sam_table_box(output_text: str, width: int, height: int) -> TableBoundingBox:
    """Parse and validate the SAM 3.1 box grammar for one still image."""
    match = re.search(
        r"<\|box;x1=(\d+);y1=(\d+);x2=(\d+);y2=(\d+);w=(\d+);h=(\d+)(?:;c=[\d.]+)?\|>",
        output_text,
    )
    if not match:
        raise RuntimeError("SAM 3.1 n'a renvoyé aucune boîte de segmentation exploitable.")
    left, top, right, bottom, response_width, response_height = map(int, match.groups())
    if response_width != width or response_height != height or right <= left or bottom <= top:
        raise RuntimeError("Boîte SAM incohérente avec les dimensions de l'image.")
    return TableBoundingBox(
        xmin=left / width,
        ymin=top / height,
        xmax=right / width,
        ymax=bottom / height,
    )


async def _refine_table_roi_with_sam(
    content_bytes: bytes, media_type: str, roi: TableBoundingBox
) -> TableBoundingBox:
    """Refine Spark's semantic table box with a real SAM 3.1 box prompt.

    Muse Spark identifies which region is the cadastral coordinate table. SAM
    3.1 then receives that region as a pixel box prompt and returns a
    pixel-precise table boundary plus its segmentation mask. This workflow uses
    the returned box to make a tighter source-image crop for the digit-reading
    pass; the API response keeps both model outputs distinct.
    """
    try:
        image = ImageOps.exif_transpose(Image.open(io.BytesIO(content_bytes)))
        width, height = image.size
    except Exception as exc:
        raise RuntimeError(f"Image illisible pour le raffinement SAM: {exc}")

    x1 = max(0, min(width - 1, int(roi.xmin * width)))
    y1 = max(0, min(height - 1, int(roi.ymin * height)))
    x2 = max(x1 + 1, min(width, int(roi.xmax * width)))
    y2 = max(y1 + 1, min(height, int(roi.ymax * height)))
    # SAM's documented box-prompt grammar uses displayed, EXIF-corrected media
    # dimensions. The image has already been normalized before this stage.
    box_prompt = f"<0f>1<|box;x1={x1};y1={y1};x2={x2};y2={y2};w={width};h={height}|>"
    encoded_image = base64.b64encode(content_bytes).decode("utf-8")
    output_deltas: List[str] = []

    async with httpx.AsyncClient(timeout=60.0) as client:
        async with client.stream(
            "POST",
            f"{META_API_BASE_URL}/v1/responses",
            headers=_meta_json_headers(),
            json={
                "model": META_VISION_MODEL_ID,
                "input": [{
                    "role": "user",
                    "content": [
                        {"type": "input_text", "text": box_prompt},
                        {"type": "input_image", "image_url": f"data:{media_type};base64,{encoded_image}"},
                    ],
                }],
                "stream": True,
                # SAM metadata is string-valued; boolean JSON here is ignored by
                # the API instead of requesting the confidence field.
                "metadata": {"mask_encoding": "one_bit", "include_confidence": "true"},
            },
        ) as response:
            if response.status_code != 200:
                body = (await response.aread()).decode("utf-8", errors="replace")
                raise RuntimeError(f"SAM 3.1 a répondu {response.status_code}: {body[:180]}")
            async for line in response.aiter_lines():
                if not line.startswith("data:"):
                    continue
                payload = line[5:].strip()
                if not payload or payload == "[DONE]":
                    continue
                try:
                    event = json.loads(payload)
                except json.JSONDecodeError:
                    continue
                delta = event.get("delta")
                if isinstance(delta, str):
                    output_deltas.append(delta)

    # SAM emits geometry in the streamed output-text lane. The mask remains
    # part of that real response; the crop operation needs the refined box.
    return _parse_sam_table_box("".join(output_deltas), width, height)


def _crop_table_region(content_bytes: bytes, roi: TableBoundingBox) -> bytes:
    """Crop the grounded coordinates-table region from the exact uploaded frame.

    `roi` comes normalized 0-1 (from the 0-1000 grounding grid). Grounding boxes
    tend to sit slightly inside the printed table, so the crop keeps a 3% margin
    on each side — cutting decimal columns off was a real failure mode. Small
    crops are upscaled 2x (LANCZOS) so Spark's vision tiles process more
    effective pixels per digit. Saved as lossless PNG.
    """
    try:
        img = Image.open(io.BytesIO(content_bytes))
        img = ImageOps.exif_transpose(img)
    except Exception as exc:
        raise RuntimeError(f"Image illisible pour le recadrage zoom: {exc}")
    width, height = img.size
    pad_x = max(2, int(width * 0.03))
    pad_y = max(2, int(height * 0.03))
    left = max(0, int(roi.xmin * width) - pad_x)
    top = max(0, int(roi.ymin * height) - pad_y)
    right = min(width, int(roi.xmax * width) + pad_x)
    bottom = min(height, int(roi.ymax * height) + pad_y)
    if right - left < 40 or bottom - top < 40:
        raise RuntimeError("Boîte de grounding trop petite pour recadrer.")
    crop = img.crop((left, top, right, bottom)).convert("RGB")
    if max(crop.size) < 1400:
        crop = crop.resize((crop.width * 2, crop.height * 2), Image.Resampling.LANCZOS)
    out = io.BytesIO()
    crop.save(out, format="PNG")
    return out.getvalue()


def _normalize_image_bytes(content_bytes: bytes, media_type: str) -> tuple[bytes, str]:
    """EXIF-orient inline photos so the pixel frame matches what Spark grounds on.

    Vision calls receive the raw bytes while browsers display the EXIF-rotated
    variant — without this step the grounding box would not line up with the UI
    preview. Frames otherwise stay untouched: no resizing, no re-compression
    (a large scan keeps its native resolution).
    """
    try:
        img = Image.open(io.BytesIO(content_bytes))
        orientation = img.getexif().get(0x0112, 1)
    except Exception:
        return content_bytes, media_type  # unreadable: send raw bytes as-is
    if orientation in (2, 3, 4, 5, 6, 7, 8):
        img = ImageOps.exif_transpose(img)
        out = io.BytesIO()
        if media_type == "image/png":
            img.save(out, format="PNG")
            return out.getvalue(), "image/png"
        img.convert("RGB").save(out, format="JPEG", quality=92)
        return out.getvalue(), "image/jpeg"
    return content_bytes, media_type


def _extract_embedded_pdf_text(content_bytes: bytes) -> str:
    """Read a born-digital PDF text layer without applying OCR."""
    if PdfReader is None:
        raise RuntimeError(
            "Le support des PDF éditables nécessite pypdf. Installez les dépendances backend."
        )
    try:
        reader = PdfReader(io.BytesIO(content_bytes))
        return "\n".join((page.extract_text() or "") for page in reader.pages).strip()
    except Exception as exc:
        raise RuntimeError(f"Texte PDF non extractible: {exc}")


def _has_usable_embedded_coordinate_text(text: str) -> bool:
    """Require several coordinate-like rows before trusting a PDF text layer."""
    if len(re.sub(r"\s+", "", text)) < 120:
        return False
    coordinate_rows = re.findall(
        r"(?:B(?:orne)?\s*[A-Za-z0-9]+|\d+)\s*[:=,\-]?\s*\d{4,7}(?:[.,]\d+)?\s*[,;/\s]+\d{4,7}(?:[.,]\d+)?",
        text,
        re.IGNORECASE,
    )
    return len(coordinate_rows) >= 3


def _render_scanned_pdf_first_page(content_bytes: bytes, dpi: int = 350) -> bytes:
    """Rasterize page one of a scan at OCR-safe resolution with pypdfium2, pypdf, or Poppler."""
    # 1. Primary: pypdfium2 (Chromium PDFium, in-process, cross-platform, zero system binaries needed)
    if pdfium is not None:
        try:
            doc = pdfium.PdfDocument(content_bytes)
            if len(doc) > 0:
                page = doc[0]
                # Scale factor: 72 points per inch in PDF spec -> scale = dpi / 72.0
                bitmap = page.render(scale=dpi / 72.0)
                pil_image = bitmap.to_pil()
                # Bound maximum dimension to 2600px to ensure fast upload and prevent Meta API timeout while keeping high visual clarity
                if max(pil_image.size) > 2600:
                    pil_image.thumbnail((2600, 2600), Image.Resampling.LANCZOS)
                out = io.BytesIO()
                pil_image.save(out, format="PNG")
                return out.getvalue()
        except Exception:
            pass

    # 2. Secondary fallback: direct extraction of embedded scanner image via pypdf
    if PdfReader is not None:
        try:
            reader = PdfReader(io.BytesIO(content_bytes))
            if len(reader.pages) > 0:
                page = reader.pages[0]
                if page.images and len(page.images) > 0:
                    largest_image = max(page.images, key=lambda img: len(img.data))
                    img_pil = Image.open(io.BytesIO(largest_image.data))
                    if max(img_pil.size) > 2600:
                        img_pil.thumbnail((2600, 2600), Image.Resampling.LANCZOS)
                    out = io.BytesIO()
                    img_pil.save(out, format="PNG")
                    return out.getvalue()
        except Exception:
            pass

    # 3. Tertiary fallback: external Poppler pdftoppm if installed on system PATH
    renderer = shutil.which("pdftoppm")
    if renderer:
        runtime_temp_root = Path(__file__).resolve().parent / ".cadastra_runtime_tmp"
        runtime_temp_root.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(prefix="pdf_", dir=runtime_temp_root) as temp_dir:
            temp_path = Path(temp_dir)
            source = temp_path / "source.pdf"
            output_prefix = temp_path / "page"
            source.write_bytes(content_bytes)
            try:
                completed = subprocess.run(
                    [renderer, "-f", "1", "-l", "1", "-r", str(dpi), "-png", str(source), str(output_prefix)],
                    capture_output=True,
                    text=True,
                    timeout=45,
                    check=False,
                )
            except subprocess.TimeoutExpired as exc:
                raise RuntimeError("Le rendu du PDF scanné a dépassé le délai autorisé.") from exc
            rendered_pages = list(temp_path.glob("page-*.png"))
            if completed.returncode == 0 and rendered_pages:
                return rendered_pages[0].read_bytes()

    raise RuntimeError(
        "Impossible de convertir le PDF scanné en image. "
        "Le moteur de rendu pypdfium2 et l'utilitaire système Poppler pdftoppm sont tous deux indisponibles."
    )


async def _extract_editable_pdf_text(text: str) -> Dict[str, Any]:
    """Ask Spark to structure direct PDF text, never to visually read a scan."""
    # Keep payload bounded while preserving the beginning, where plan metadata
    # and most coordinate tables normally appear.
    source_text = text[:60000]
    async with httpx.AsyncClient(timeout=45.0) as client:
        response = await client.post(
            f"{META_API_BASE_URL}/v1/chat/completions",
            headers=_meta_json_headers(),
            json={
                "model": META_EXTRACT_MODEL_ID,
                "messages": [
                    {"role": "system", "content": CADASTRA_EDITABLE_PDF_SYSTEM_PROMPT},
                    {"role": "user", "content": CADASTRA_EDITABLE_PDF_USER_PROMPT + source_text},
                ],
                "response_format": PLAN_EXTRACTION_JSON_FORMAT,
            },
        )
    if response.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"Erreur Meta Model API {response.status_code}: {response.text[:300]}",
        )
    return json.loads(response.json()["choices"][0]["message"]["content"])


async def _extract_via_files_api(content_bytes: bytes, filename: str, media_type: str) -> tuple[Dict[str, Any], str]:
    """PDF/other path: POST /v1/files then POST /v1/responses with input_image file_id.

    Inline image_url accepts image MIME types only, so PDFs are uploaded through
    the Files API (purpose="user_data") and referenced by id on the Responses API.
    """
    async with httpx.AsyncClient(timeout=90.0) as client:
        upload = await client.post(
            f"{META_API_BASE_URL}/v1/files",
            headers={"Authorization": f"Bearer {RUNTIME_CONFIG.get('meta_api_key', '')}"},
            files={"file": (filename, io.BytesIO(content_bytes), media_type or "application/octet-stream")},
            data={"purpose": "user_data"},
        )
        if upload.status_code != 200:
            raise HTTPException(
                status_code=502,
                detail=f"Erreur Meta Files API {upload.status_code}: {upload.text[:300]}",
            )
        file_id = upload.json().get("id")

        response = await client.post(
            f"{META_API_BASE_URL}/v1/responses",
            headers=_meta_json_headers(),
            json={
                "model": META_EXTRACT_MODEL_ID,
                "input": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "input_text", "text": CADASTRA_EXTRACTION_USER_PROMPT},
                            {"type": "input_image", "file_id": file_id},
                        ],
                    }
                ],
                "text": {"format": PLAN_EXTRACTION_JSON_FORMAT},
            },
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"Erreur Meta Model API {response.status_code}: {response.text[:300]}",
        )

    output_text = None
    for output_item in response.json().get("output", []):
        if output_item.get("type") == "message":
            for content_block in output_item.get("content", []):
                if content_block.get("type") == "output_text" and content_block.get("text"):
                    output_text = content_block["text"]
                    break
        if output_text:
            break
    if output_text is None:
        raise HTTPException(status_code=502, detail="Réponse Meta sans texte exploitable.")
    return json.loads(output_text), "responses-files-api"


async def call_spark_extraction(content_bytes: bytes, media_type: str, filename: str = "plan.jpg") -> tuple[Dict[str, Any], str]:
    """Dispatch the real Muse Spark extraction call by input media type.

    Returns (parsed_json, protocol_used). Raises on any platform error or
    unparseable response — no fallback data is ever returned.
    """
    if media_type in INLINE_IMAGE_MIME_TYPES:
        return await _extract_via_chat_completions(content_bytes, media_type)
    return await _extract_via_files_api(content_bytes, filename, media_type)


@app.post("/api/extract", response_model=PlanExtractionResponse)
async def extract_plan_from_document(
    file: Optional[UploadFile] = File(None),
    profile_hint: Optional[str] = Form(None),
):
    """Extract structured beacon data via the real Meta Model API (Muse Spark).

    Muse Spark reads the plan image or direct text from an editable PDF,
    extracts the beacon table AND grounds the coordinate-table box on the
    normalized 0-1000 grid. SAM 3.1 then refines that table boundary for the
    pixel-accurate zoom crop. NO simulation: without MODEL_API_KEY the
    endpoint returns 503 instead of placeholder data.
    """
    if not RUNTIME_CONFIG.get("meta_api_key"):
        raise HTTPException(
            status_code=503,
            detail=(
                "Clé Meta Model API non configurée. Ajoutez META_API_KEY dans backend/.env "
                "(plateforme hackathon : Muse Spark, SAM 3.1). Aucune donnée de simulation "
                "n'est générée par conception — saisissez les coordonnées manuellement."
            ),
        )

    if not file:
        raise HTTPException(
            status_code=422,
            detail="Envoie l'image ou le PDF du plan à analyser (champ multipart 'file').",
        )

    try:
        content_bytes = await file.read()
        media_type = file.content_type or "application/octet-stream"
        document_source = "uploaded-image"
        embedded_text_characters = 0
        # EXIF-orient inline photos first: the grounding box is expressed on the
        # exact pixel frame we upload, while browsers display the rotated
        # variant. Same frame = the zoom recheck crop lines up with what the
        # model actually saw.
        if media_type in INLINE_IMAGE_MIME_TYPES:
            content_bytes, media_type = _normalize_image_bytes(content_bytes, media_type)
            parsed, protocol_used = await call_spark_extraction(
                content_bytes,
                media_type,
                file.filename or "plan.jpg",
            )
        elif media_type == "application/pdf":
            embedded_text = _extract_embedded_pdf_text(content_bytes)
            embedded_text_characters = len(embedded_text)
            if _has_usable_embedded_coordinate_text(embedded_text):
                parsed = await _extract_editable_pdf_text(embedded_text)
                protocol_used = "editable-pdf-text"
                document_source = "embedded-pdf-text"
            else:
                # A scanned PDF has no trustworthy selectable coordinate text.
                # Render page one at 350 DPI, then follow the identical image
                # pipeline so Spark grounding, SAM, and the zoom recheck work.
                content_bytes = _render_scanned_pdf_first_page(content_bytes)
                media_type = "image/png"
                parsed, protocol_used = await call_spark_extraction(
                    content_bytes,
                    media_type,
                    "rendered-page-1.png",
                )
                document_source = "scanned-pdf-page-1-350dpi"
        else:
            parsed, protocol_used = await call_spark_extraction(
                content_bytes,
                media_type,
                file.filename or "plan.bin",
            )
    except HTTPException:
        raise
    except ValidationError as exc:
        error_msg = "; ".join(f"{e.get('loc', [''])[0]}: {e.get('msg', '')}" for e in exc.errors())
        raise HTTPException(
            status_code=422,
            detail=(
                f"Coordonnées cadastrales incomplètes dans le document: {error_msg}. "
                "Vérifiez que le plan scanné comporte un tableau de bornes lisible avec coordonnées X, Y et superficie."
            ),
        )
    except (json.JSONDecodeError, KeyError, ValueError, TypeError) as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Réponse du modèle non exploitable: {exc}",
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Échec de l'appel Meta: {exc}")

    # Real table ROI from Muse Spark perception grounding (0-1000 grid -> 0-1).
    table_roi: Optional[TableBoundingBox] = None
    grounded_box = parsed.get("coordinates_table_box") if isinstance(parsed, dict) else None
    if grounded_box:
        try:
            table_roi = TableBoundingBox(
                ymin=grounded_box["y_min"] / 1000.0,
                xmin=grounded_box["x_min"] / 1000.0,
                ymax=grounded_box["y_max"] / 1000.0,
                xmax=grounded_box["x_max"] / 1000.0,
            )
        except (KeyError, TypeError):
            table_roi = None  # grounding omitted / malformed: stays None, never faked

    # Visual-zoom recheck: re-read the grounded coordinates table on a lossless
    # crop of the exact frame Muse Spark grounded — native resolution over the
    # region that matters most. Cases caught by a human reviewer on dense digit
    # columns (5/6, 1/7, truncated decimals) drop sharply. Applied only when the
    # model returned a grounding box; any failure degrades gracefully to the
    # first-pass reading and is reported honestly.
    zoom_status = "skipped"
    sam_status = "skipped"
    sam_table_roi: Optional[TableBoundingBox] = None
    table_crop_data_url: Optional[str] = None
    if protocol_used == "chat-completions" and table_roi is not None:
        try:
            sam_table_roi = await _refine_table_roi_with_sam(content_bytes, media_type, table_roi)
            sam_status = "applied"
        except Exception as exc:
            # SAM is a refinement stage, not a reason to discard a successful
            # Spark extraction. Keep the original grounding crop as fallback.
            sam_status = f"failed: {str(exc)[:120]}"

        try:
            crop_bytes = _crop_table_region(content_bytes, sam_table_roi or table_roi)
            zoom_result = await _recheck_beacons_via_chat_completions(crop_bytes)
            zoom_beacons = zoom_result.get("beacons") if isinstance(zoom_result, dict) else None
            # Only adopt the zoom reading when it found the same number of rows —
            # a mismatched count means the crop or the reading lost structure,
            # and silently re-binding rows would corrupt the mapping.
            if (
                isinstance(zoom_beacons, list)
                and isinstance(parsed.get("beacons"), list)
                and len(zoom_beacons) == len(parsed["beacons"])
            ):
                parsed["beacons"] = zoom_beacons
                table_crop_data_url = (
                    "data:image/png;base64," + base64.b64encode(crop_bytes).decode("utf-8")
                )
                zoom_status = "applied"
            else:
                zoom_status = "inconclusive"
        except Exception as exc:
            zoom_status = f"failed: {str(exc)[:120]}"

    try:
        extracted_request = PlanVerificationRequest(**parsed)
    except ValidationError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Réponse du modèle non exploitable: {exc}",
        )

    # Only real facts about the call — no invented metrics.
    structured_fields = {
        "provider": "Meta Model API",
        "model_id": META_EXTRACT_MODEL_ID,
        "protocol": protocol_used,
        "document_source": document_source,
        "embedded_text_characters": embedded_text_characters,
        "beacons_extracted_count": len(extracted_request.beacons),
        "viewing_projection": f"UTM {extracted_request.utm_zone.value}",
        "vision_model_id": META_VISION_MODEL_ID,
        "grounding_grid": "0-1000 (Muse Spark perception grounding)",
        "sam_3_1": {
            "model_id": META_VISION_MODEL_ID,
            "table_refinement": sam_status,
        },
        "zoom_recheck": zoom_status,
        "live_api_call": True,
    }
    return PlanExtractionResponse(
        extracted_plan=extracted_request,
        table_roi=table_roi,
        sam_table_roi=sam_table_roi,
        table_crop_data_url=table_crop_data_url,
        spark_structured_fields=structured_fields,
        notes="Extraction en direct via Meta Model API (Muse Spark).",
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

    # 3. No recognizable plan and no coordinates: answer honestly instead of
    # auditing an unrelated sample profile (no fabricated verdicts).
    if not plan_req:
        return WhatsAppVerificationResponse(
            success=False,
            reply_message=(
                "⚠️ Je n'ai pas trouvé de dossier ou de coordonnées dans votre message.\n\n"
                "Envoyez les bornes au format :\n"
                "B1: 583420, 446100\nB2: 583455, 446100\nB3: 583455, 446072\nB4: 583420, 446072\n"
                "Superficie déclarée : 980 m2\n\n"
                "…ou l'identifiant du dossier à vérifier (ex: DLA-YAS-2024-001)."
            ),
            pdf_report_url=None,
            verification_summary=None,
        )

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
        f"📄 Le certificat PDF officiel avec empreinte SHA-256 est joint ci-dessous."
    )

    # Outbound Cloud API push: uncommented only when real credentials are set.
    # Without them the webhook still returns 200 + structured JSON so the local
    # UI / simulator keeps working during development.
    cloud_text_sent = False
    cloud_document_sent = False
    if RUNTIME_CONFIG.get("whatsapp_token") and RUNTIME_CONFIG.get("phone_number_id"):
        cloud_text_sent = send_whatsapp_message(
            sender, {"type": "text", "text": {"body": reply_text}}
        )
        if cloud_text_sent:
            pdf_filename = f"Cadastra_Audit_{verification.plan_id}.pdf"
            pdf_bytes: Optional[bytes] = None
            try:
                pdf_bytes = generate_cadastral_pdf(verification, plan_req)
            except Exception:
                pdf_bytes = None
            media_id = upload_whatsapp_media(pdf_bytes, pdf_filename) if pdf_bytes else None
            if media_id:
                cloud_document_sent = send_whatsapp_message(
                    sender,
                    {
                        "type": "document",
                        "document": {"id": media_id, "filename": pdf_filename},
                    },
                )

    return WhatsAppVerificationResponse(
        success=True,
        reply_message=reply_text,
        pdf_report_url=f"/api/report/pdf?plan_id={verification.plan_id}",
        verification_summary=verification,
        cloud_api_text_sent=cloud_text_sent,
        cloud_api_document_sent=cloud_document_sent,
    )


# --- Cadastral Forensic AI Q&A & Expert Recommendation Engine ---

def _generate_expert_cadastral_qa(
    question: str,
    plan_id: str,
    locality: str,
    stated_area: float,
    computed_area: float,
    discrepancy_pct: float,
    discrepancy_sqm: float,
    risk_level: str,
    risk_score: float,
    polygon_closed: bool,
    self_intersecting: bool,
    beacons_count: int,
    is_en: bool,
    perimeter_m: float = 0.0,
) -> tuple[str, List[str], List[str]]:
    """Generate high-fidelity forensic cadastral Q&A response in English or French."""
    q_lower = question.lower()

    is_safe_query = any(k in q_lower for k in ["safe", "buy", "purchase", "sûr", "sur", "acheter", "achat", "invest", "danger", "sécurisé", "securise", "good", "valid", "fiable", "confiance"])
    is_discrepancy_query = any(k in q_lower for k in ["discrepancy", "difference", "area", "surface", "écart", "ecart", "fictive", "différence", "shoelace", "gauss", "m²", "sqm", "taille"])
    is_legal_query = any(k in q_lower for k in ["legal", "law", "loi", "décret", "decret", "decree", "tribunal", "notaire", "notary", "juridique", "recours", "sanction", "peine", "code", "droit", "plainte"])
    is_closure_query = any(k in q_lower for k in ["closure", "close", "fermeture", "boucle", "gap", "open", "trou", "fermé", "ferme"])
    is_intersection_query = any(k in q_lower for k in ["intersect", "crois", "chevauch", "overlap", "croisement", "self-intersect"])
    is_beacons_query = any(k in q_lower for k in ["beacon", "borne", "coordonn", "coord", "utm", "gps", "wgs84", "easting", "northing", "périmètre", "perimeter"])
    is_surveyor_query = any(k in q_lower for k in ["surveyor", "géomètre", "geometre", "rectify", "rectifier", "ogec", "corrig", "fix", "ordre", "signature", "visa"])
    is_price_query = any(k in q_lower for k in ["price", "prix", "cout", "coût", "argent", "money", "rembours", "refund", "renegotiat", "négoci"])
    is_procedure_query = any(k in q_lower for k in ["mindcaf", "etap", "step", "procédure", "procedure", "conservat", "titre", "dossier", "comment faire", "que faire"])

    legal_refs = [
        "Decree No. 76-165 of 27 April 1976 (Land Demarcation & Title Registration)",
        "Law No. 80-21 of 14 July 1980 (Cameroon Order of Surveyors - OGEC)",
        "Civil Code Art. 1616-1622 (Delivery of Cadastral Surface Guarantees)",
        "Cameroon Penal Code Art. 316 & 318 (Fictitious Property Claims & Fraud)",
    ] if is_en else [
        "Décret n° 76-165 du 27 avril 1976 (Bornage et immatriculation au Cameroun)",
        "Loi n° 80-21 du 14 juillet 1980 (Ordre des Géomètres du Cameroun - OGEC)",
        "Code Civil Art. 1616 à 1622 (Garantie de contenance et déficit de surface)",
        "Code Pénal Camerounais Art. 316 et 318 (Escroquerie et vente de terrain fictif)",
    ]

    if is_safe_query:
        if risk_level in ["LOW"]:
            if is_en:
                ans = (
                    f"Yes, geodetically speaking, Plan {plan_id} in {locality} exhibits high perimeter integrity. "
                    f"The Gauss-Shoelace computed surface ({computed_area:.1f} m²) matches the declared surface ({stated_area:.1f} m²) "
                    f"with an anomaly rate of only {discrepancy_pct:.2f}%, well within Cameroon's official 1.0% cadastre tolerance. "
                    f"The perimeter closes smoothly across all {beacons_count} boundary beacons without self-intersecting lines. "
                    f"You may safely proceed to notary due diligence."
                )
                recs = [
                    "Proceed to title deed registration with a licensed notary.",
                    "Verify physical beacon presence on site prior to boundary fencing.",
                    "Obtain a non-encumbrance certificate (certificat d'urbanisme) from the divisional delegation.",
                ]
            else:
                ans = (
                    f"Oui, sur le plan géodésique, le plan {plan_id} à {locality} présente une excellente conformité. "
                    f"La surface calculée par Gauss-Shoelace ({computed_area:.1f} m²) concorde avec la surface déclarée ({stated_area:.1f} m²) "
                    f"avec un écart de seulement {discrepancy_pct:.2f}%, strictement inférieur à la tolérance légale de 1.0% au Cameroun. "
                    f"Le polygone est fermé sans auto-intersection sur l'ensemble des {beacons_count} bornes. "
                    f"Vous pouvez poursuivre la transaction chez votre notaire."
                )
                recs = [
                    "Procéder à l'acte notarié de vente en toute confiance géodésique.",
                    "Contrôler la présence physique des bornes bétons sur le terrain avant clôture.",
                    "Demander le certificat d'urbanisme et de non-opposition auprès de la délégation départementale.",
                ]
        elif risk_level in ["MEDIUM"]:
            if is_en:
                ans = (
                    f"Caution is advised. Plan {plan_id} exhibits a borderline surface discrepancy of {discrepancy_pct:.2f}% "
                    f"({discrepancy_sqm:+.1f} m² between declared {stated_area:.1f} m² and actual {computed_area:.1f} m²). "
                    f"While the parcel does not show malicious boundary overlap, this gap exceeds the normal 1.0% tolerance. "
                    f"Do not pay the full purchase balance until the surveyor clarifies this measurement gap."
                )
                recs = [
                    "Withhold final payment until the surveyor issues a corrected, sealed coordinate schedule.",
                    "Request an on-site joint inspection (contre-expertise) with an OGEC licensed surveyor.",
                    "Ensure neighboring plot boundaries do not claim the disputed area.",
                ]
            else:
                ans = (
                    f"Vigilance recommandée. Le plan {plan_id} présente un écart limite de {discrepancy_pct:.2f}% "
                    f"({discrepancy_sqm:+.1f} m² entre les {stated_area:.1f} m² déclarés et {computed_area:.1f} m² réels). "
                    f"Cet écart dépasse la tolérance standard de 1.0%. "
                    f"Ne versez aucun acompte définitif sans rectification préalable par le géomètre assermenté."
                )
                recs = [
                    "Bloquer le solde de la transaction jusqu'à la révision du tableau des coordonnées.",
                    "Exiger un contre-bornage contradictoire par un géomètre agréé OGEC.",
                    "Vérifier auprès des riverains qu'aucun chevauchement n'est revendiqué.",
                ]
        else:
            if is_en:
                ans = (
                    f"HIGH ALERT: Do NOT purchase this parcel in its current state. "
                    f"Plan {plan_id} in {locality} carries a critical risk score of {risk_score:.0f}/100. "
                    f"The declared surface of {stated_area:.1f} m² differs by {discrepancy_pct:.1f}% ({discrepancy_sqm:+.1f} m²) "
                    f"from the true polygon area ({computed_area:.1f} m²). "
                    + ("The boundary lines self-intersect, creating an invalid geometric perimeter. " if self_intersecting else "")
                    + ("The perimeter does not close on the initial beacon. " if not polygon_closed else "")
                    + "This is a prime indicator of fictitious surface inflation, exposing the buyer to title cancellation and boundary disputes under Cameroon Law."
                )
                recs = [
                    "HALT all financial transactions with the seller or intermediary immediately.",
                    "Submit the plan to the Regional Delegation of MINDCAF for formal cadastral verification.",
                    "Demand an authentic boundary protocol signed by an OGEC surveyor with verified registration number.",
                    "Check the local Land Registry for double-titling risks on this coordinate cluster.",
                ]
            else:
                ans = (
                    f"ALERTE MAJEURE : N'achetez PAS ce terrain en l'état. "
                    f"Le plan {plan_id} à {locality} présente un niveau de risque critique de {risk_score:.0f}/100. "
                    f"La surface déclarée ({stated_area:.1f} m²) s'écarte de {discrepancy_pct:.1f}% ({discrepancy_sqm:+.1f} m²) "
                    f"de la surface mathématique réelle ({computed_area:.1f} m²). "
                    + ("Le polygone s'auto-intersecte, formant une géométrie caduque. " if self_intersecting else "")
                    + ("Le périmètre ne se referme pas sur la borne initiale. " if not polygon_closed else "")
                    + "Il s'agit d'un indice flagrant de superficie fictive, exposant l'acquéreur à l'annulation du titre et à des litiges fonciers sévères (Décret 76-165)."
                )
                recs = [
                    "Suspendre immédiatement tout versement financier au vendeur ou courtier.",
                    "Saisir la délégation régionale du MINDCAF pour contrôle d'authenticité cadastrale.",
                    "Exiger un procès-verbal de bornage officiel revêtu du cachet d'un géomètre inscrit à l'OGEC.",
                    "Vérifier à la conservation foncière locale l'absence d'un double titre sur cette emprise.",
                ]
    elif is_discrepancy_query:
        if is_en:
            ans = (
                f"The area discrepancy is {discrepancy_pct:.2f}% ({discrepancy_sqm:+.2f} m²). "
                f"The plan states {stated_area:.2f} m², but rigorous Gauss-Shoelace geodetic integration of the UTM "
                f"beacon coordinates proves the real enclosed ground area is {computed_area:.2f} m². "
                f"Under Cameroon cadastral practice, any deviation over 1.0% triggers administrative review. "
                + (f"You are paying for {abs(discrepancy_sqm):.1f} m² of non-existent land ('superficie fictive')." if discrepancy_sqm < 0 else "The parcel encroaches beyond its declared bounds.")
            )
            recs = [
                f"Recalculate transaction price based on the actual {computed_area:.1f} m² rather than stated {stated_area:.1f} m².",
                "Demand that the surveyor adjust the plan title deed sheet to reflect real ground coordinates.",
                "Verify whether the adjacent plots are registered under conflicting overlapping boundaries.",
            ]
        else:
            ans = (
                f"L'écart de superficie est de {discrepancy_pct:.2f}% ({discrepancy_sqm:+.2f} m²). "
                f"Le plan mentionne {stated_area:.2f} m², mais le calcul Gauss-Shoelace rigoureux projeté en UTM "
                f"établit que la superficie réelle enclose par les bornes est de {computed_area:.2f} m². "
                f"Au Cameroun, la norme technique tolère un écart maximal de 1.0%. "
                + (f"Vous payez pour {abs(discrepancy_sqm):.1f} m² de terrain inexistant (superficie fictive)." if discrepancy_sqm < 0 else "Le terrain empiète au-delà de sa contenance déclarée.")
            )
            recs = [
                f"Ajuster le prix de vente sur la base de la superficie réelle ({computed_area:.1f} m²) et non sur les {stated_area:.1f} m² déclarés.",
                "Demander au géomètre la rectification du cartouche du plan de bornage.",
                "Vérifier auprès du cadastre qu'aucune parcelle voisine ne chevauche ces coordonnées.",
            ]
    elif is_legal_query:
        if is_en:
            ans = (
                f"Under Cameroonian land law, selling land with a fraudulent area gap ({discrepancy_pct:.2f}%) "
                f"violates Decree No. 76-165 of 27 April 1976 and constitutes fictitious property deception under Penal Code Art. 316. "
                f"Pursuant to Civil Code Articles 1616 to 1622, any surface deficit exceeding 1/20th (5%) legally entitles the buyer "
                f"to demand an immediate proportional price reduction or full contract rescission with damages before the Court of First Instance."
            )
            recs = [
                "Serve formal legal notice (mise en demeure) to the seller referencing Civil Code Art. 1616-1622.",
                "File a petition for cadastral inspection with the Divisional Land Conservator (Conservateur Foncier).",
                "Do not sign the final notarial deed without a rectified boundary protocol signed by an OGEC surveyor.",
                "Preserve this cryptographic SHA-256 geodetic audit certificate as admissible court evidence.",
            ]
        else:
            ans = (
                f"Selon le droit foncier camerounais, la cession d'un terrain avec un écart de contenance de {discrepancy_pct:.2f}% "
                f"enfreint le Décret n° 76-165 du 27 avril 1976 et tombe sous le coup de l'escroquerie foncière (Code Pénal Art. 316 et 318). "
                f"En vertu des articles 1616 à 1622 du Code civil, tout déficit supérieur à 1/20e (5%) ouvre droit à une action en diminution "
                f"proportionnelle du prix ou en résolution de la vente devant le Tribunal de Première Instance (TPI)."
            )
            recs = [
                "Adresser une mise en demeure au vendeur sur le fondement des articles 1616 à 1622 du Code civil.",
                "Saisir la Conservation Foncière départementale du MINDCAF pour vérification d'authenticité.",
                "Refuser la signature notariée sans un plan rectificatif délivré par un géomètre assermenté OGEC.",
                "Conserver ce certificat d'audit certifié avec sceau SHA-256 comme pièce probante en justice.",
            ]
    elif is_closure_query:
        if is_en:
            ans = (
                f"Perimeter closure status: {'Closed successfully' if polygon_closed else 'Open / Non-closed perimeter'}. "
                f"Total parcel perimeter is {perimeter_m:.1f} meters across {beacons_count} beacons. "
                + ("All boundary vectors return accurately to the initial beacon within sub-centimeter tolerance." if polygon_closed else "The last beacon fails to join the initial beacon, leaving an open polygon that invalidates the legal cadastral boundary under Decree 76-165.")
            )
            recs = [
                "Ensure physical boundary beacons on site match the numeric UTM Northing/Easting table.",
                "Check for angular deflection errors in the surveyor's traverse calculation sheet.",
                "Require the surveyor to re-close the polygon on site with differential GPS.",
            ]
        else:
            ans = (
                f"État de fermeture du périmètre : {'Parfaitement fermé' if polygon_closed else 'Périmètre ouvert / défectueux'}. "
                f"Le périmètre total est de {perimeter_m:.1f} mètres pour {beacons_count} bornes. "
                + ("Les vecteurs de cheminement reviennent exactement sur la borne de départ." if polygon_closed else "La dernière borne ne boucle pas sur la borne initiale, rendant le plan topographiquement caduc et irrecevable au MINDCAF (Décret 76-165).")
            )
            recs = [
                "Contrôler la concordance physique entre les bornes du plan et les piquets implantés.",
                "Demander la feuille de calcul de polygonation du géomètre.",
                "Exiger la fermeture rigoureuse du cheminement au GPS différentiel.",
            ]
    elif is_intersection_query:
        if is_en:
            ans = (
                f"Topological intersection status: {'Self-intersecting perimeter detected' if self_intersecting else 'Clean polygon geometry'}. "
                + ("CRITICAL: Two or more boundary vectors cross each other, forming a figure-eight (bowtie) anomaly. This produces mathematically invalid areas and guarantees immediate rejection by the MINDCAF land registrar." if self_intersecting else "All boundary edges enclose a clean geometric parcel without crossing lines.")
            )
            recs = [
                "Reorder the beacon sequence in the surveyor's field notebook." if self_intersecting else "Confirm boundary orientation conforms to standard clockwise survey order.",
                "Demand an updated boundary plan before applying for title registration.",
            ]
        else:
            ans = (
                f"État topologique des limites : {'Auto-intersection détectée' if self_intersecting else 'Géométrie régulière'}. "
                + ("CRITIQUE : Deux segments de limite se croisent en papillon (huit de bornage). Cette anomalie invalide le calcul de contenance et entraîne le rejet systématique du dossier au cadastre du MINDCAF." if self_intersecting else "Aucun croisement de limites détecté. Le polygone est géodésiquement cohérent.")
            )
            recs = [
                "Corriger l'ordre de cheminement des bornes dans le carnet de terrain du géomètre." if self_intersecting else "Vérifier que la numérotation des bornes suit le sens horaire conventionnel.",
                "Exiger un plan de bornage régularisé avant le dépôt du titre foncier.",
            ]
    elif is_beacons_query:
        if is_en:
            ans = (
                f"Beacon & Coordinate Analysis for Plan {plan_id} in {locality}: "
                f"The plot contains {beacons_count} geodetic beacons defining a perimeter of {perimeter_m:.1f} meters. "
                f"All coordinates are projected onto the legal national datum (WGS84 / UTM). "
                f"Gauss-Shoelace integration yields {computed_area:.1f} m² of enclosed ground."
            )
            recs = [
                "Perform physical beacon verification (contrôle de bornage) with an RTK GPS receiver.",
                "Check that each concrete monument bears the official surveyor stamp and beacon ID.",
                "Ensure boundary markers have not been displaced by roadworks or neighbors.",
            ]
        else:
            ans = (
                f"Analyse des bornes et coordonnées du plan {plan_id} ({locality}) : "
                f"La parcelle comporte {beacons_count} bornes géodésiques définissant un périmètre de {perimeter_m:.1f} mètres. "
                f"Toutes les coordonnées sont projetées sur le système légal WGS84 / UTM. "
                f"L'intégration Gauss-Shoelace confirme une surface enclose réelle de {computed_area:.1f} m²."
            )
            recs = [
                "Procéder au repérage physique des bornes sur le terrain avec un récepteur GPS RTK.",
                "Vérifier que chaque borne bétonnée porte l'identifiant et l'empreinte du géomètre.",
                "S'assurer qu'aucune borne n'a été déplacée lors de travaux de terrassement.",
            ]
    elif is_surveyor_query:
        if is_en:
            ans = (
                f"To rectify Plan {plan_id}, instruct an OGEC-registered surveyor to execute a corrective traverse. "
                f"Under Law No. 80-21, only a surveyor sworn before the Court of Appeal and registered on the active OGEC roll "
                f"can legally certify boundary amendments. The surveyor must correct the {discrepancy_pct:.2f}% surface gap "
                f"and stamp the amended plan with their official seal."
            )
            recs = [
                "Verify the surveyor's active license on the Cameroon OGEC official roll (ogec-cameroun.org).",
                "Require an amended cadastral plan stamped with the official MINCAF/OGEC seal.",
                "Ensure all contiguous neighbors sign the boundary protocol (procès-verbal de bornage contradictoire).",
            ]
        else:
            ans = (
                f"Pour régulariser le plan {plan_id}, vous devez mandater un géomètre inscrit à l'OGEC. "
                f"Selon la Loi n° 80-21, seul un géomètre assermenté près la Cour d'Appel et inscrit au tableau de l'OGEC "
                f"a compétence légale pour rectifier un plan. Il doit corriger l'écart de {discrepancy_pct:.2f}% "
                f"et apposer son visa d'inscription et son sceau officiel."
            )
            recs = [
                "Vérifier l'inscription du géomètre au tableau officiel de l'Ordre des Géomètres du Cameroun (OGEC).",
                "Exiger un plan de bornage rectificatif visé et scellé.",
                "Faire contresigner le procès-verbal de bornage contradictoire par tous les riverains contigus.",
            ]
    elif is_price_query:
        price_ratio = (computed_area / stated_area) if stated_area > 0 else 1.0
        if is_en:
            ans = (
                f"Financial Evaluation: The real parcel area is {computed_area:.1f} m² versus {stated_area:.1f} m² declared "
                f"({discrepancy_pct:.2f}% gap). If the seller quoted a price based on {stated_area:.1f} m², you are overpaying by "
                f"{abs(discrepancy_pct):.1f}%. Under Civil Code Art. 1619, you are entitled to reduce the agreed price to "
                f"exactly {price_ratio * 100:.1f}% of the initial total."
            )
            recs = [
                f"Renegotiate purchase total: pay strictly for the verified {computed_area:.1f} m².",
                "Ask the notary to insert a special protective clause regarding true surveyed acreage.",
                "Refuse any lump-sum pricing without an official rectified cadastral sheet.",
            ]
        else:
            ans = (
                f"Évaluation financière : La superficie réelle est de {computed_area:.1f} m² contre {stated_area:.1f} m² déclarés "
                f"({discrepancy_pct:.2f}% d'écart). Si le prix a été fixé sur la base des {stated_area:.1f} m², vous subissez un "
                f"surcoût de {abs(discrepancy_pct):.1f}%. Selon l'article 1619 du Code civil, vous êtes en droit d'exiger une "
                f"diminution du prix total à hauteur de {price_ratio * 100:.1f}% du montant convenu."
            )
            recs = [
                f"Renégocier le montant total en ne payant strictement que les {computed_area:.1f} m² réels.",
                "Demander au notaire d'insérer une clause résolutoire sur la contenance arpentée.",
                "Refuser tout paiement forfaitaire sans plan modificatif certifié conforme.",
            ]
    elif is_procedure_query:
        if is_en:
            ans = (
                f"Recommended Procedure for Plan {plan_id} in {locality}: "
                f"1. Freeze payments until an OGEC surveyor reviews the coordinates. "
                f"2. File a verification request at the Divisional Cadastre Service of MINDCAF. "
                f"3. Convene a contradictory demarcation with all adjoining landowners. "
                f"4. Once corrected, file for final land title registration (titre foncier)."
            )
            recs = [
                "Visit the local MINDCAF Cadastral Delegation with a copy of this audit report.",
                "Hire an independent surveyor from the official OGEC list for counter-verification.",
                "Ensure the public enquiry period (affichage de bornage) completed without objections.",
            ]
        else:
            ans = (
                f"Procédure recommandée pour le plan {plan_id} ({locality}) : "
                f"1. Suspendre les versements tant que les coordonnées ne sont pas clarifiées. "
                f"2. Déposer une demande de vérification auprès du service départemental du cadastre (MINDCAF). "
                f"3. Convoquer un bornage contradictoire en présence de tous les propriétaires riverains. "
                f"4. Déposer le dossier technique visé pour l'établissement du titre foncier définitif."
            )
            recs = [
                "Se rendre à la délégation départementale du MINDCAF muni de cet audit géodésique.",
                "Faire appel à un géomètre indépendant inscrit à l'OGEC pour contre-expertise.",
                "S'assurer que la période légale d'affichage du bornage s'est déroulée sans opposition.",
            ]
    else:
        if is_en:
            ans = (
                f"Regarding '{question}': For Plan {plan_id} in {locality}, the geodetic audit established a risk score "
                f"of {risk_score:.0f}/100 ({risk_level} risk). The parcel encompasses {beacons_count} beacons with a perimeter "
                f"of {perimeter_m:.1f} m. Gauss-Shoelace computed area is {computed_area:.1f} m² compared to declared {stated_area:.1f} m² "
                f"({discrepancy_pct:.2f}% gap). "
                + ("Boundary lines are cleanly closed." if polygon_closed else "Perimeter exhibits an open traverse defect.")
            )
            recs = [
                f"Verify land title authenticity with the divisional land conservator in {locality}.",
                "Ensure no duplicate title number has been assigned to this geodetic coordinate envelope.",
                "Keep this certified cryptographic audit report (SHA-256 seal) in your property archive.",
            ]
        else:
            ans = (
                f"Concernant '{question}' : Pour le plan {plan_id} à {locality}, l'audit géodésique établit un score de risque "
                f"de {risk_score:.0f}/100 (risque {risk_level}). La parcelle comprend {beacons_count} bornes pour un périmètre "
                f"de {perimeter_m:.1f} m. La surface calculée par Gauss-Shoelace est de {computed_area:.1f} m² contre {stated_area:.1f} m² déclarés "
                f"({discrepancy_pct:.2f}% d'écart). "
                + ("Les limites sont topologiquement fermées." if polygon_closed else "Le cheminement présente un défaut d'ouverture géométrique.")
            )
            recs = [
                f"Vérifier l'historique du titre foncier auprès du conservateur des domaines de {locality}.",
                "Vérifier l'absence de chevauchement avec les titres fonciers limitrophes.",
                "Conserver ce rapport certifié muni du sceau SHA-256 dans votre dossier foncier.",
            ]

    return ans, recs, legal_refs


@app.post("/api/ai/qa", response_model=CadastralQAResponse)
async def ask_cadastral_ai(payload: CadastralQARequest):
    """Interactive Cadastral Forensic AI Q&A and Expert Audit Recommendation.

    Supports English ('en') and French ('fr').
    Uses Meta Model API (Muse Spark / LLaMA) when configured; falls back seamlessly
    to Cadastra's deterministic geodetic-legal reasoning engine.
    """
    plan_req: Optional[PlanVerificationRequest] = payload.request_data
    if not plan_req and payload.plan_id:
        plan_req = _find_plan_by_id(payload.plan_id)

    verification = payload.verification_data
    if not verification and plan_req:
        try:
            verification = engine.verify_plan(plan_req)
        except Exception:
            verification = None

    lang = (payload.language or "en").lower().strip()
    is_en = lang == "en"

    plan_id = payload.plan_id or (plan_req.plan_id if plan_req else "Unknown")
    locality = plan_req.locality if plan_req else "Cameroon"
    stated_area = verification.stated_area_sqm if verification else (plan_req.stated_area_sqm if plan_req else 0.0)
    computed_area = verification.computed_area_sqm if verification else 0.0
    discrepancy_pct = verification.discrepancy_percentage if verification else 0.0
    discrepancy_sqm = verification.discrepancy_sqm if verification else 0.0
    risk_level = str(verification.risk_level.value) if verification else "MEDIUM"
    risk_score = verification.risk_score if verification else 50.0
    polygon_closed = verification.polygon_closed if verification else True
    self_intersecting = verification.self_intersecting if verification else False
    beacons_count = len(verification.beacons_wgs84) if verification else (len(plan_req.beacons) if plan_req else 0)
    perimeter_m = verification.perimeter_m if verification else 0.0

    meta_key = RUNTIME_CONFIG.get("meta_api_key")
    if meta_key:
        try:
            cadastral_context = (
                f"Plan ID: {plan_id}\n"
                f"Locality: {locality}\n"
                f"Beacons count: {beacons_count}\n"
                f"Stated Area: {stated_area:.2f} m²\n"
                f"Gauss-Shoelace Computed Area: {computed_area:.2f} m²\n"
                f"Area Discrepancy: {discrepancy_pct:.2f}% ({discrepancy_sqm:+.2f} m²)\n"
                f"Cameroon Legal Tolerance: 1.0%\n"
                f"Polygon Closed: {polygon_closed}\n"
                f"Self-Intersecting Boundary: {self_intersecting}\n"
                f"Risk Score: {risk_score:.0f}/100 ({risk_level})\n"
                f"Relevant Legislation: Decree No. 76-165 of 27 April 1976 (Cameroon Land Tenure & Cadastre), "
                f"Order of Surveyors (OGEC) standards, Penal Code Art. 316."
            )

            sys_prompt = (
                f"You are CADASTRA AI, an expert Cameroon cadastral surveyor and geodetic analyst. "
                f"Respond directly in {'English' if is_en else 'French'} in 2-4 authoritative, clear sentences with actionable legal and technical guidance. "
                f"Cite relevant Cameroon laws (Decree 76-165, Penal Code Art. 316, Civil Code) where applicable."
            )

            user_msg = (
                f"Plan: {plan_id} in {locality}. Stated area: {stated_area:.1f} m², Gauss-Shoelace computed: {computed_area:.1f} m² "
                f"(Gap: {discrepancy_pct:.2f}%, {discrepancy_sqm:+.1f} m²). Legal tolerance: 1.0%. "
                f"Polygon closed: {polygon_closed}. Self-intersecting: {self_intersecting}. Risk: {risk_level} ({risk_score:.0f}/100). "
                f"Question: {payload.question}"
            )

            async with httpx.AsyncClient(timeout=18.0) as client:
                res = await client.post(
                    f"{META_API_BASE_URL}/v1/chat/completions",
                    headers={"Authorization": f"Bearer {meta_key}", "Content-Type": "application/json"},
                    json={
                        "model": META_EXTRACT_MODEL_ID,
                        "messages": [
                            {"role": "system", "content": sys_prompt},
                            {"role": "user", "content": user_msg},
                        ],
                        "temperature": 0.1,
                    },
                )
                if res.status_code == 200:
                    choices = res.json().get("choices") or []
                    if choices:
                        message = choices[0].get("message") or {}
                        content = message.get("content")
                        if content and content.strip():
                            ans_text = content.strip()
                            recs = [
                                line.lstrip("*-•123456789. ")
                                for line in ans_text.split("\n")
                                if line.strip().startswith(("-", "*", "•", "1.", "2.", "3.", "4.", "5."))
                            ]
                            if not recs:
                                if risk_score > 60:
                                    recs = [
                                        "Demand signed coordinate rectification from the licensed surveyor before any payment." if is_en else "Exiger la rectification signée des coordonnées par le géomètre avant tout paiement.",
                                        "Verify land title authenticity with the divisional land registry (Conservation Foncière)." if is_en else "Vérifier l'authenticité du titre foncier auprès de la conservation foncière.",
                                        "Request a joint contradictory demarcation on site." if is_en else "Demander un bornage contradictoire sur le terrain.",
                                    ]
                                else:
                                    recs = [
                                        "Proceed with transaction through a licensed notary." if is_en else "Procéder à la transaction devant un notaire assermenté.",
                                        "Physically inspect boundary beacons on site." if is_en else "Vérifier physiquement l'implantation des bornes sur le site.",
                                        "Keep this certified cryptographic SHA-256 report." if is_en else "Conserver ce rapport d'audit certifié muni de l'empreinte SHA-256.",
                                    ]
                            return CadastralQAResponse(
                                plan_id=plan_id,
                                question=payload.question,
                                answer=ans_text,
                                verdict_summary=f"{risk_level} Risk ({risk_score:.0f}/100)" if is_en else f"Risque {risk_level} ({risk_score:.0f}/100)",
                                risk_level=risk_level,
                                risk_score=risk_score,
                                recommendations=recs[:4],
                                legal_references=["Decree No. 76-165 of 27 April 1976", "Civil Code Art. 1616-1622", "Penal Code Art. 316"],
                                language="en" if is_en else "fr",
                                ai_engine="Meta AI (Muse Spark / LLaMA)",
                            )
        except Exception as e:
            logger.warning(f"Meta AI QA fallback engaged due to: {e}")

    answer, recs, legal_refs = _generate_expert_cadastral_qa(
        question=payload.question,
        plan_id=plan_id,
        locality=locality,
        stated_area=stated_area,
        computed_area=computed_area,
        discrepancy_pct=discrepancy_pct,
        discrepancy_sqm=discrepancy_sqm,
        risk_level=risk_level,
        risk_score=risk_score,
        polygon_closed=polygon_closed,
        self_intersecting=self_intersecting,
        beacons_count=beacons_count,
        is_en=is_en,
        perimeter_m=perimeter_m,
    )

    verdict_summary = (
        f"Geodetic Audit Verdict: {risk_level} Risk (Score: {risk_score:.0f}/100)"
        if is_en
        else f"Verdict d'audit géodésique : Risque {risk_level} (Score : {risk_score:.0f}/100)"
    )

    return CadastralQAResponse(
        plan_id=plan_id,
        question=payload.question,
        answer=answer,
        verdict_summary=verdict_summary,
        risk_level=risk_level,
        risk_score=risk_score,
        recommendations=recs,
        legal_references=legal_refs,
        language="en" if is_en else "fr",
        ai_engine="Cadastra Geodetic Forensic Engine",
    )
