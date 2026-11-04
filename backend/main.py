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
        if request.plan_id:
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
def generate_pdf_report(request: PlanVerificationRequest, disposition: str = Query("attachment")):
    """Generate and download official bilingual PDF cadastral audit report (POST with body)."""
    try:
        if request.plan_id:
            RECENT_VERIFIED_PLANS[request.plan_id] = request
            clean_id = re.sub(r"[^a-zA-Z0-9_\-\.]", "_", request.plan_id).lower()
            RECENT_VERIFIED_PLANS[clean_id] = request
            _save_plan_to_disk(request)
        verification_result = engine.verify_plan(request)
        pdf_bytes = generate_cadastral_pdf(verification_result, request)
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
):
    """Download official PDF cadastral report via GET query parameter."""
    plan_req = _find_plan_by_id(plan_id)
    if not plan_req:
        raise HTTPException(status_code=404, detail=f"Dossier cadastral {plan_id} introuvable.")

    return generate_pdf_report(plan_req, disposition=disposition)


@app.head("/api/report/pdf")
def head_pdf_report_by_query(
    plan_id: str = Query("douala_yassa_utm32n.json", description="ID du plan ou nom du profil"),
    disposition: str = Query("attachment", description="inline ou attachment"),
):
    """Support HTTP HEAD requests for download managers and Chromium probes."""
    plan_req = _find_plan_by_id(plan_id)
    if not plan_req:
        raise HTTPException(status_code=404, detail=f"Dossier cadastral {plan_id} introuvable.")
    resp = generate_pdf_report(plan_req, disposition=disposition)
    return Response(
        content=b"",
        status_code=200,
        media_type="application/pdf",
        headers=resp.headers,
    )


@app.get("/api/report/pdf/{plan_id}")
def get_pdf_report_by_path(plan_id: str, disposition: str = Query("attachment")):
    """Download official PDF cadastral report via GET path parameter."""
    return get_pdf_report_by_query(plan_id=plan_id, disposition=disposition)


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
