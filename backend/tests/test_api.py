"""API endpoint integration tests."""

import io

import pytest
from fastapi.testclient import TestClient
from PIL import Image

import main
from main import app, WHATSAPP_VERIFY_TOKEN


@pytest.fixture
def client():
    return TestClient(app)


WHATSAPP_TEXT_MESSAGE_PAYLOAD = {
    "entry": [
        {
            "changes": [
                {
                    "value": {
                        "messages": [
                            {
                                "from": "237691234567",
                                "type": "text",
                                "text": {"body": "Vérifier plan Douala Yassa"},
                            }
                        ]
                    }
                }
            ]
        }
    ]
}


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Cadastra-Cameroon" in data["service"]


def test_api_verify_valid_plan(client):
    payload = {
        "plan_id": "TEST-DLA-01",
        "title_number": "TF 1234/Wouri",
        "locality": "Douala Yassa",
        "region": "Littoral",
        "utm_zone": "32N",
        "stated_area_sqm": 980.0,
        "beacons": [
            {"borne_id": "B1", "x": 583420.0, "y": 446100.0},
            {"borne_id": "B2", "x": 583455.0, "y": 446100.0},
            {"borne_id": "B3", "x": 583455.0, "y": 446072.0},
            {"borne_id": "B4", "x": 583420.0, "y": 446072.0},
        ],
    }
    response = client.post("/api/verify", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is True
    assert data["computed_area_sqm"] == 980.0
    assert len(data["beacons_wgs84"]) == 4
    assert len(data["boundary_segments"]) == 4


def test_api_verify_invalid_beacons(client):
    # Less than 3 beacons
    payload = {
        "plan_id": "TEST-INVALID",
        "locality": "Douala",
        "region": "Littoral",
        "utm_zone": "32N",
        "stated_area_sqm": 500.0,
        "beacons": [
            {"borne_id": "B1", "x": 583420.0, "y": 446100.0},
            {"borne_id": "B2", "x": 583455.0, "y": 446100.0},
        ],
    }
    response = client.post("/api/verify", json=payload)
    assert response.status_code == 422  # Pydantic validation error for min_length=3


def test_api_profiles_list(client):
    response = client.get("/api/profiles")
    assert response.status_code == 200
    profiles = response.json()
    assert isinstance(profiles, list)
    assert len(profiles) >= 4
    filenames = [p["filename"] for p in profiles]
    assert "douala_yassa_utm32n.json" in filenames
    assert "douala_yassa_fraud_superficie.json" in filenames


def test_api_get_specific_profile(client):
    response = client.get("/api/profiles/douala_yassa_utm32n.json")
    assert response.status_code == 200
    data = response.json()
    assert data["plan_id"] == "DLA-YAS-2024-001"
    assert data["stated_area_sqm"] == 980.0


def test_api_generate_pdf_report(client):
    payload = {
        "plan_id": "TEST-PDF-01/Wouri:Litige",
        "title_number": "TF 5555/Wouri",
        "owner_name": "Test Owner",
        "locality": "Douala - Bonapriso",
        "region": "Littoral",
        "utm_zone": "32N",
        "stated_area_sqm": 980.0,
        "surveyor_name": "Ing. Test",
        "surveyor_order_number": "OGEC-999",
        "beacons": [
            {"borne_id": "B1", "x": 583420.0, "y": 446100.0},
            {"borne_id": "B2", "x": 583455.0, "y": 446100.0},
            {"borne_id": "B3", "x": 583455.0, "y": 446072.0},
            {"borne_id": "B4", "x": 583420.0, "y": 446072.0},
        ],
    }
    response = client.post("/api/report/pdf", json=payload)
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert len(response.content) > 1000
    assert response.content[:4] == b"%PDF"
    # Filename should be sanitized without invalid slashes or colons
    cd_header = response.headers["content-disposition"]
    assert "TEST-PDF-01_Wouri_Litige.pdf" in cd_header


def test_api_get_pdf_report_by_query(client):
    """GET /api/report/pdf?plan_id=... should return 200 and PDF stream with language options."""
    # Bilingual default
    resp_bilingual = client.get("/api/report/pdf?plan_id=DLA-YAS-2024-001&language=bilingual")
    assert resp_bilingual.status_code == 200
    assert resp_bilingual.headers["content-type"] == "application/pdf"
    assert resp_bilingual.content[:4] == b"%PDF"

    # English edition
    resp_en = client.get("/api/report/pdf?plan_id=DLA-YAS-2024-001&language=en")
    assert resp_en.status_code == 200
    assert resp_en.headers["content-type"] == "application/pdf"
    assert resp_en.content[:4] == b"%PDF"

    # French edition
    resp_fr = client.get("/api/report/pdf?plan_id=DLA-YAS-2024-001&language=fr")
    assert resp_fr.status_code == 200
    assert resp_fr.headers["content-type"] == "application/pdf"
    assert resp_fr.content[:4] == b"%PDF"


def test_api_get_pdf_report_by_path(client):
    """GET /api/report/pdf/{plan_id} should return 200 and PDF stream."""
    response = client.get("/api/report/pdf/douala_yassa_utm32n.json")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.content[:4] == b"%PDF"


def test_api_extract_requires_api_key(client, monkeypatch):
    """Sans clé Meta configurée, /api/extract refuse et ne renvoie AUCUNE donnée simulée."""
    monkeypatch.setitem(main.RUNTIME_CONFIG, "meta_api_key", "")
    response = client.post("/api/extract", data={"profile_hint": "douala_yassa_utm32n.json"})
    assert response.status_code == 503
    assert "META_API_KEY" in response.json()["detail"]


def test_api_extract_requires_file_with_key(client, monkeypatch):
    """Clé configurée mais aucun fichier envoyé → 422, pas de plan vide fabriqué."""
    monkeypatch.setitem(main.RUNTIME_CONFIG, "meta_api_key", "test-key")
    response = client.post("/api/extract", data={"profile_hint": "douala_yassa_utm32n.json"})
    assert response.status_code == 422
    assert "'file'" in response.json()["detail"]


def test_api_extract_live_with_key(client, monkeypatch):
    """Clé + image: l'appel Muse Spark réel est exécuté et sa réponse retournée sans invention."""
    monkeypatch.setitem(main.RUNTIME_CONFIG, "meta_api_key", "test-key")

    async def fake_call(content_bytes, media_type, filename):
        assert media_type == "image/jpeg"
        return {
            "plan_id": "EXTRACT-01",
            "locality": "Douala Yassa",
            "region": "Littoral",
            "utm_zone": "32N",
            "stated_area_sqm": 980.0,
            "beacons": [
                {"borne_id": "B1", "x": 583420.0, "y": 446100.0},
                {"borne_id": "B2", "x": 583455.0, "y": 446100.0},
                {"borne_id": "B3", "x": 583455.0, "y": 446072.0},
                {"borne_id": "B4", "x": 583420.0, "y": 446072.0},
            ],
        }, "chat-completions"

    monkeypatch.setattr(main, "call_spark_extraction", fake_call)
    response = client.post(
        "/api/extract",
        files={"file": ("plan.jpg", b"binary", "image/jpeg")},
        data={"profile_hint": ""},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["extracted_plan"]["plan_id"] == "EXTRACT-01"
    # No fabricated metrics: confidence and ROI stay None unless grounded/returned
    assert data["confidence_score"] is None
    assert data["table_roi"] is None
    assert data["spark_structured_fields"]["live_api_call"] is True
    assert data["spark_structured_fields"]["protocol"] == "chat-completions"
    assert data["spark_structured_fields"]["model_id"] == main.META_EXTRACT_MODEL_ID
    assert data["spark_structured_fields"]["beacons_extracted_count"] == 4


def test_api_extract_zoom_recheck_corrects_beacons(client, monkeypatch):
    """Visual zoom: beacons from the grounded crop replace first-pass values,
    and the response exposes the actual crop the re-read was based on."""
    monkeypatch.setitem(main.RUNTIME_CONFIG, "meta_api_key", "test-key")

    async def fake_call(content_bytes, media_type, filename="plan.jpg"):
        return {
            "plan_id": "EXTRACT-01",
            "locality": "Douala Yassa",
            "region": "Littoral",
            "utm_zone": "32N",
            "stated_area_sqm": 980.0,
            "coordinates_table_box": {"x_min": 60, "y_min": 430, "x_max": 940, "y_max": 900},
            # First-pass mistake: B3 x = 583465.0 (digit misread)
            "beacons": [
                {"borne_id": "B1", "x": 583420.0, "y": 446100.0},
                {"borne_id": "B2", "x": 583455.0, "y": 446100.0},
                {"borne_id": "B3", "x": 583465.0, "y": 446072.0},
                {"borne_id": "B4", "x": 583420.0, "y": 446072.0},
            ],
        }, "chat-completions"

    async def fake_zoom(crop_bytes):
        assert crop_bytes.startswith(b"\x89PNG")
        return {
            "beacons": [
                {"borne_id": "B1", "x": 583420.0, "y": 446100.0},
                {"borne_id": "B2", "x": 583455.0, "y": 446100.0},
                {"borne_id": "B3", "x": 583455.0, "y": 446072.0},
                {"borne_id": "B4", "x": 583420.0, "y": 446072.0},
            ],
        }

    monkeypatch.setattr(main, "call_spark_extraction", fake_call)
    monkeypatch.setattr(main, "_recheck_beacons_via_chat_completions", fake_zoom)

    png = io.BytesIO()
    Image.new("RGB", (120, 160), color=(20, 22, 26)).save(png, format="PNG")
    response = client.post(
        "/api/extract",
        files={"file": ("plan.png", png.getvalue(), "image/png")},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["spark_structured_fields"]["zoom_recheck"] == "applied"
    assert data["table_crop_data_url"].startswith("data:image/png;base64,")
    # Corrected reading from the zoom pass (B3 x = 583455.0)
    assert data["extracted_plan"]["beacons"][2]["x"] == 583455.0


def test_api_extract_scanned_pdf_renders_then_uses_image_pipeline(client, monkeypatch):
    """A scanned PDF renders at high DPI before the Spark/SAM image path."""
    monkeypatch.setitem(main.RUNTIME_CONFIG, "meta_api_key", "test-key")

    async def fake_image_extract(content_bytes, media_type, filename="plan.png"):
        assert media_type == "image/png"
        assert filename == "rendered-page-1.png"
        return {
            "plan_id": "EXTRACT-PDF-01",
            "locality": "Douala Yassa",
            "region": "Littoral",
            "utm_zone": "32N",
            "stated_area_sqm": 980.0,
            "beacons": [
                {"borne_id": "B1", "x": 583420.0, "y": 446100.0},
                {"borne_id": "B2", "x": 583455.0, "y": 446100.0},
                {"borne_id": "B3", "x": 583455.0, "y": 446072.0},
            ],
        }, "chat-completions"

    monkeypatch.setattr(main, "_extract_embedded_pdf_text", lambda _: "")
    monkeypatch.setattr(main, "_render_scanned_pdf_first_page", lambda _: b"rendered-png")
    monkeypatch.setattr(main, "call_spark_extraction", fake_image_extract)
    response = client.post(
        "/api/extract",
        files={"file": ("plan.pdf", b"%PDF-1.4 test", "application/pdf")},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["extracted_plan"]["plan_id"] == "EXTRACT-PDF-01"
    assert data["spark_structured_fields"]["document_source"] == "scanned-pdf-page-1-350dpi"


def test_whatsapp_webhook_verification(client):
    params = {
        "hub.mode": "subscribe",
        "hub.challenge": "1158201444",
        "hub.verify_token": WHATSAPP_VERIFY_TOKEN,
    }
    response = client.get("/api/webhook/whatsapp", params=params)
    assert response.status_code == 200
    assert response.text == "1158201444"


def test_whatsapp_message_handling(client):
    payload = {
        "entry": [
            {
                "changes": [
                    {
                        "value": {
                            "messages": [
                                {
                                    "from": "237691234567",
                                    "type": "text",
                                    "text": {"body": "Vérifier plan Douala Yassa"},
                                }
                            ]
                        }
                    }
                ]
            }
        ]
    }
    response = client.post("/api/webhook/whatsapp", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "CADASTRA-CAMEROON" in data["reply_message"]
    assert "CONFORME" in data["reply_message"]
    assert data["pdf_report_url"] is not None

    # Follow the returned PDF URL to verify it returns 200
    pdf_res = client.get(data["pdf_report_url"])
    assert pdf_res.status_code == 200
    assert pdf_res.content[:4] == b"%PDF"


def test_whatsapp_user_coordinate_message(client):
    """WhatsApp webhook should extract custom coordinates texted by citizen."""
    custom_text = """Bonjour Cadastra,
    B1: 583420, 446100
    B2: 583455, 446100
    B3: 583455, 446072
    B4: 583420, 446072
    Superficie déclarée: 980 m2"""

    payload = {
        "entry": [
            {
                "changes": [
                    {
                        "value": {
                            "messages": [
                                {
                                    "from": "237699887766",
                                    "type": "text",
                                    "text": {"body": custom_text},
                                }
                            ]
                        }
                    }
                ]
            }
        ]
    }
    response = client.post("/api/webhook/whatsapp", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "CONFORME" in data["reply_message"]


def test_whatsapp_delivery_receipt_status(client):
    """WhatsApp webhook should acknowledge delivery status receipts without errors."""
    payload = {
        "entry": [
            {
                "changes": [
                    {
                        "value": {
                            "statuses": [
                                {"id": "wamid.123", "status": "delivered", "recipient_id": "237691234567"}
                            ]
                        }
                    }
                ]
            }
        ]
    }
    response = client.post("/api/webhook/whatsapp", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "Accusé de réception" in data["reply_message"]


def test_whatsapp_send_skipped_without_cloud_credentials(client, monkeypatch):
    """Sans token Cloud API configuré, aucun appel Graph API ne doit être tenté."""
    monkeypatch.setitem(main.RUNTIME_CONFIG, "whatsapp_token", "")
    monkeypatch.setitem(main.RUNTIME_CONFIG, "phone_number_id", "")
    calls = []

    def fake_send(recipient, payload):
        calls.append(("send", recipient, payload))
        return True

    def fake_upload(pdf_bytes, filename):
        calls.append(("upload", filename))
        return "fake-media-id"

    monkeypatch.setattr(main, "send_whatsapp_message", fake_send)
    monkeypatch.setattr(main, "upload_whatsapp_media", fake_upload)

    response = client.post("/api/webhook/whatsapp", json=WHATSAPP_TEXT_MESSAGE_PAYLOAD)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["cloud_api_text_sent"] is False
    assert data["cloud_api_document_sent"] is False
    assert calls == []  # no Graph API side effects in local sandbox mode


def test_whatsapp_outbound_push_with_cloud_credentials(client, monkeypatch):
    """Avec identifiants Cloud API : push texte puis certificat PDF (upload media + send)."""
    monkeypatch.setitem(main.RUNTIME_CONFIG, "whatsapp_token", "test-bearer-token")
    monkeypatch.setitem(main.RUNTIME_CONFIG, "phone_number_id", "987654321")
    sent = []

    def fake_send(recipient, payload):
        sent.append((recipient, payload))
        return True

    def fake_upload(pdf_bytes, filename):
        assert pdf_bytes[:4] == b"%PDF"  # a real generated audit certificate
        assert filename.startswith("Cadastra_Audit_")
        return "fake-media-id"

    monkeypatch.setattr(main, "send_whatsapp_message", fake_send)
    monkeypatch.setattr(main, "upload_whatsapp_media", fake_upload)

    response = client.post("/api/webhook/whatsapp", json=WHATSAPP_TEXT_MESSAGE_PAYLOAD)
    assert response.status_code == 200
    data = response.json()
    assert data["cloud_api_text_sent"] is True
    assert data["cloud_api_document_sent"] is True
    assert len(sent) == 2
    # 1st push: the text verdict to the citizen
    assert sent[0][0] == "237691234567"
    assert sent[0][1]["type"] == "text"
    assert "CADASTRA-CAMEROON" in sent[0][1]["text"]["body"]
    # 2nd push: the PDF certificate uploaded and referenced by media id
    assert sent[1][1]["type"] == "document"
    assert sent[1][1]["document"]["id"] == "fake-media-id"
    assert sent[1][1]["document"]["filename"].endswith(".pdf")


def test_whatsapp_unknown_plan_returns_honest_reply(client):
    """Message sans dossier ni coordonnées: réponse honnête, JAMAIS d'audit d'un profil non lié."""
    payload = {
        "entry": [
            {
                "changes": [
                    {
                        "value": {
                            "messages": [
                                {
                                    "from": "237600000000",
                                    "type": "text",
                                    "text": {"body": "Bonjour c'est quoi vos horaires ?"},
                                }
                            ]
                        }
                    }
                ]
            }
        ]
    }
    response = client.post("/api/webhook/whatsapp", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert data["verification_summary"] is None
    assert data["pdf_report_url"] is None
    assert "coordonnées" in data["reply_message"]
    assert "DLA-YAS-2024-001" in data["reply_message"]
