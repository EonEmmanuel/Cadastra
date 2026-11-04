"""Official bilingual (French/English) Cadastral Audit Report PDF Generator.

Designed for MINDCAF (Ministère du Cadastre et des Affaires Foncières) standards.
Generates an anti-fraud certificate with geodetic tables, surface area comparison,
fraud warning badges, and cryptographic verification stamps.
"""

from __future__ import annotations
import io
from datetime import datetime, timezone
from typing import Optional

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.graphics.shapes import Drawing, Rect, Circle, String
from reportlab.pdfgen import canvas

from schemas import PlanVerificationResponse, PlanVerificationRequest, RiskLevel


# Cameroon National Flag Colors
CAM_GREEN = colors.HexColor("#007A3D")
CAM_RED = colors.HexColor("#CE1126")
CAM_YELLOW = colors.HexColor("#FCD116")
DARK_NAVY = colors.HexColor("#1A2B4C")
LIGHT_GRAY = colors.HexColor("#F8F9FA")
BORDER_GRAY = colors.HexColor("#DEE2E6")
TEXT_MUTED = colors.HexColor("#6C757D")


class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas for dynamic total page count and official legal footers."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count: int):
        self.saveState()
        self.setFont("Helvetica", 7.5)
        self.setFillColor(TEXT_MUTED)
        # Footer text - ASCII-clean to avoid Type 1 font encoding errors in PDF viewers
        footer_left = f"Cadastra-Cameroon - MINDCAF (Ord. 74-1 / Decret 76-165) - Page {self._pageNumber} sur {page_count}"
        self.drawString(36, 16, footer_left)
        footer_right = "Certificat Geodesique Securise - Empreinte SHA-256"
        self.drawRightString(595 - 36, 16, footer_right)
        self.restoreState()


def generate_cadastral_pdf(
    result: PlanVerificationResponse,
    request: PlanVerificationRequest,
) -> bytes:
    """Generate a bilingual Cameroon Cadastral Audit Certificate in PDF format.

    Args:
        result: The PlanVerificationResponse from the CadastralEngine.
        request: The PlanVerificationRequest input metadata.

    Returns:
        bytes: Raw PDF binary stream.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=28,
        bottomMargin=28,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "CertTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=16,
        alignment=TA_CENTER,
        textColor=DARK_NAVY,
    )
    subtitle_style = ParagraphStyle(
        "CertSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=13,
        alignment=TA_CENTER,
        textColor=CAM_GREEN,
    )
    header_state_fr = ParagraphStyle(
        "HeaderStateFR",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        alignment=TA_LEFT,
        textColor=colors.black,
    )
    header_state_en = ParagraphStyle(
        "HeaderStateEN",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        alignment=TA_RIGHT,
        textColor=colors.black,
    )
    section_heading = ParagraphStyle(
        "SectionHeading",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=13,
        textColor=DARK_NAVY,
        spaceAfter=4,
    )
    body_style = ParagraphStyle(
        "BodyDark",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#212529"),
    )
    bold_label = ParagraphStyle(
        "BoldLabel",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11,
        textColor=DARK_NAVY,
    )
    verdict_text = ParagraphStyle(
        "VerdictText",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=14,
        alignment=TA_CENTER,
        textColor=colors.white,
    )

    story = []

    # 1. Cameroon Tri-Color Top Ribbon (Green, Red, Yellow)
    ribbon_drawing = Drawing(523, 6)
    ribbon_drawing.add(Rect(0, 0, 174, 6, fillColor=CAM_GREEN, strokeColor=None))
    ribbon_drawing.add(Rect(174, 0, 175, 6, fillColor=CAM_RED, strokeColor=None))
    ribbon_drawing.add(Rect(349, 0, 174, 6, fillColor=CAM_YELLOW, strokeColor=None))
    story.append(ribbon_drawing)
    story.append(Spacer(1, 8))

    # 2. Official Republic Header (Bilingual French / English)
    header_data = [
        [
            Paragraph(
                "<b>RÉPUBLIQUE DU CAMEROUN</b><br/>"
                "<i>Paix — Travail — Patrie</i><br/>"
                "MINISTÈRE DU CADASTRE ET DES<br/>"
                "AFFAIRES FONCIÈRES (MINDCAF)<br/>"
                "DIRECTION DU CADASTRE",
                header_state_fr,
            ),
            Paragraph(
                "<b>CADASTRA-CAMEROON</b><br/>"
                "<font color='#007A3D'><b>SYSTÈME D'AUDIT GÉODÉSIQUE</b></font><br/>"
                "<i>Autonomous Cadastral Verification</i>",
                ParagraphStyle("CenterLogo", parent=title_style, fontSize=9, leading=11),
            ),
            Paragraph(
                "<b>REPUBLIC OF CAMEROON</b><br/>"
                "<i>Peace — Work — Fatherland</i><br/>"
                "MINISTRY OF STATE PROPERTY,<br/>"
                "SURVEYS & LAND TENURE<br/>"
                "DEPARTMENT OF SURVEYS",
                header_state_en,
            ),
        ]
    ]
    header_table = Table(header_data, colWidths=[180, 163, 180])
    header_table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ALIGN", (0, 0), (0, -1), "LEFT"),
                ("ALIGN", (1, 0), (1, -1), "CENTER"),
                ("ALIGN", (2, 0), (2, -1), "RIGHT"),
            ]
        )
    )
    story.append(header_table)
    story.append(Spacer(1, 6))

    story.append(
        HRFlowable(width="100%", thickness=1, color=CAM_GREEN, spaceAfter=8)
    )

    # 3. Document Title
    story.append(
        Paragraph(
            "RAPPORT D'AUDIT GÉOMÉTRIQUE & CERTIFICAT DE CONFORMITÉ CADASTRALE",
            title_style,
        )
    )
    story.append(
        Paragraph(
            "CADASTRAL GEODETIC AUDIT REPORT & SURFACE COMPLIANCE CERTIFICATE",
            subtitle_style,
        )
    )
    story.append(Spacer(1, 8))

    # 4. Status Verdict Banner
    is_fraud = result.superficie_fictive_detected or result.risk_level in [
        RiskLevel.CRITICAL_FRAUD,
        RiskLevel.HIGH,
    ]
    if result.risk_level == RiskLevel.LOW:
        banner_bg = CAM_GREEN
        banner_msg = "CONFORME AUX NORMES CADASTRALES · COMPLIANT PARCEL"
        banner_sub = (
            f"Superficie validée : {result.computed_area_sqm:,.2f} m² "
            f"(Écart avec plan : {result.discrepancy_percentage:.2f}%)"
        )
    elif result.superficie_fictive_detected:
        banner_bg = CAM_RED
        banner_msg = "ALERTE FRAUDE : SUPERFICIE FICTIVE DÉTECTÉE · FRAUDULENT AREA DETECTED"
        banner_sub = (
            f"Surévaluation illégale : +{result.discrepancy_sqm:,.2f} m² "
            f"(+{result.discrepancy_percentage:.1f}% au-delà des bornes réelles)"
        )
    else:
        banner_bg = colors.HexColor("#D97706")
        banner_msg = "ANOMALIE CADASTRALE · GEOMETRIC IRREGULARITY"
        banner_sub = f"Score de risque : {result.risk_score:.0f}/100 — Non-conformité géométrique"

    banner_data = [
        [
            Paragraph(
                f"<b>{banner_msg}</b><br/><font size='9'>{banner_sub}</font>",
                verdict_text,
            )
        ]
    ]
    banner_table = Table(banner_data, colWidths=[523])
    banner_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), banner_bg),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ]
        )
    )
    story.append(banner_table)
    story.append(Spacer(1, 10))

    # 5. Parcel & Survey Metadata Table
    meta_data = [
        [
            Paragraph("<b>Identifiant Plan / Dossier :</b>", bold_label),
            Paragraph(result.plan_id, body_style),
            Paragraph("<b>Titre Foncier / Dossier :</b>", bold_label),
            Paragraph(request.title_number or "Non immatriculé / En cours", body_style),
        ],
        [
            Paragraph("<b>Déclarant / Propriétaire :</b>", bold_label),
            Paragraph(request.owner_name or "Non renseigné", body_style),
            Paragraph("<b>Localité & Région :</b>", bold_label),
            Paragraph(f"{request.locality} ({request.region})", body_style),
        ],
        [
            Paragraph("<b>Géomètre-Expert :</b>", bold_label),
            Paragraph(request.surveyor_name or "Non précisé", body_style),
            Paragraph("<b>Agrément Ordre (OGEC) :</b>", bold_label),
            Paragraph(request.surveyor_order_number or "NON-VÉRIFIÉ", body_style),
        ],
        [
            Paragraph("<b>Système de Projection :</b>", bold_label),
            Paragraph(f"UTM Zone {result.utm_zone} ({result.epsg_code})", body_style),
            Paragraph("<b>Date de l'Audit :</b>", bold_label),
            Paragraph(datetime.now(timezone.utc).strftime("%d/%m/%Y %H:%M UTC"), body_style),
        ],
    ]
    meta_table = Table(meta_data, colWidths=[130, 131, 130, 132])
    meta_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), LIGHT_GRAY),
                ("GRID", (0, 0), (-1, -1), 0.5, BORDER_GRAY),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(meta_table)
    story.append(Spacer(1, 10))

    # 6. Comparative Geodetic Audit Table (Stated vs Computed)
    story.append(Paragraph("1. CONTRÔLE COMPARATIF DE SUPERFICIE (SHOELACE / SHAPELY)", section_heading))

    comp_headers = [
        Paragraph("<b>Paramètre Audit</b>", bold_label),
        Paragraph("<b>Valeur Déclarée (Plan)</b>", bold_label),
        Paragraph("<b>Valeur Calculée (Bornes)</b>", bold_label),
        Paragraph("<b>Écart / Tolérance</b>", bold_label),
        Paragraph("<b>Statut MINDCAF</b>", bold_label),
    ]

    status_color = CAM_GREEN if result.tolerance_passed else CAM_RED
    status_label = "CONFORME" if result.tolerance_passed else "REJET / FRAUDE"

    comp_rows = [
        comp_headers,
        [
            Paragraph("Superficie Totale (Area)", body_style),
            Paragraph(f"<b>{result.stated_area_sqm:,.2f} m²</b>", body_style),
            Paragraph(f"<b>{result.computed_area_sqm:,.2f} m²</b>", body_style),
            Paragraph(f"{result.discrepancy_sqm:,.2f} m² ({result.discrepancy_percentage:.2f}%)", body_style),
            Paragraph(f"<font color='{status_color}'><b>{status_label}</b></font>", body_style),
        ],
        [
            Paragraph("Périmètre Déroulé", body_style),
            Paragraph("—", body_style),
            Paragraph(f"{result.perimeter_m:,.2f} m", body_style),
            Paragraph(f"{len(result.boundary_segments)} segments", body_style),
            Paragraph("<font color='#007A3D'><b>MESURÉ</b></font>", body_style),
        ],
        [
            Paragraph("Intégrité Topologique", body_style),
            Paragraph("Polygone fermé", body_style),
            Paragraph("Non-croisé" if not result.self_intersecting else "Auto-croisé", body_style),
            Paragraph("Simple" if not result.self_intersecting else "Nœud papillon", body_style),
            Paragraph(
                "<font color='#007A3D'><b>VALIDE</b></font>"
                if not result.self_intersecting
                else "<font color='#CE1126'><b>INVALIDÉ</b></font>",
                body_style,
            ),
        ],
        [
            Paragraph("Score de Risque Cadastral", body_style),
            Paragraph("Seuil max : 15.0", body_style),
            Paragraph(f"<b>{result.risk_score:.1f} / 100</b>", body_style),
            Paragraph(f"Niveau : {result.risk_level.value}", body_style),
            Paragraph(
                f"<font color='{status_color}'><b>{result.risk_level.value}</b></font>",
                body_style,
            ),
        ],
    ]

    comp_table = Table(comp_rows, colWidths=[130, 95, 100, 110, 88])
    comp_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E9ECEF")),
                ("GRID", (0, 0), (-1, -1), 0.5, BORDER_GRAY),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    story.append(comp_table)
    story.append(Spacer(1, 10))

    # 7. Coordinates & Beacons Table
    story.append(Paragraph("2. TABLEAU OFFICIEL DES BORNES & COORDONNÉES GÉODÉSIQUES", section_heading))

    beacon_headers = [
        Paragraph("<b>Borne</b>", bold_label),
        Paragraph("<b>UTM Est (X)</b>", bold_label),
        Paragraph("<b>UTM Nord (Y)</b>", bold_label),
        Paragraph("<b>WGS84 Lat</b>", bold_label),
        Paragraph("<b>WGS84 Lon</b>", bold_label),
        Paragraph("<b>Segment</b>", bold_label),
        Paragraph("<b>Longueur</b>", bold_label),
    ]

    beacon_rows = [beacon_headers]
    for i, b in enumerate(result.beacons_wgs84):
        seg = result.boundary_segments[i] if i < len(result.boundary_segments) else None
        seg_name = f"{seg.from_borne} -> {seg.to_borne}" if seg else "N/A"
        seg_len = f"{seg.length_meters:.2f} m" if seg else "N/A"

        beacon_rows.append(
            [
                Paragraph(f"<b>{b.borne_id}</b>", body_style),
                Paragraph(f"{b.utm_x:,.2f}", body_style),
                Paragraph(f"{b.utm_y:,.2f}", body_style),
                Paragraph(f"{b.latitude:.5f}°", body_style),
                Paragraph(f"{b.longitude:.5f}°", body_style),
                Paragraph(seg_name, body_style),
                Paragraph(seg_len, body_style),
            ]
        )

    # Add centroid summary row
    beacon_rows.append(
        [
            Paragraph("<b>CENTRE</b>", bold_label),
            Paragraph(f"{result.centroid_utm['x']:,.2f}", body_style),
            Paragraph(f"{result.centroid_utm['y']:,.2f}", body_style),
            Paragraph(f"{result.centroid_wgs84['latitude']:.5f}°", body_style),
            Paragraph(f"{result.centroid_wgs84['longitude']:.5f}°", body_style),
            Paragraph("Barycentre", body_style),
            Paragraph("N/A", body_style),
        ]
    )

    beacon_table = Table(beacon_rows, colWidths=[55, 78, 78, 80, 80, 76, 76], repeatRows=1)
    beacon_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E9ECEF")),
                ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#F1F3F5")),
                ("GRID", (0, 0), (-1, -1), 0.5, BORDER_GRAY),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    story.append(beacon_table)
    story.append(Spacer(1, 10))

    # 8. Fraud Indicators & Legal Recommendations
    story.append(
        Paragraph("3. INDICATEURS D'ANOMALIE & AVIS TECHNIQUE / LEGAL ADVISORY", section_heading)
    )

    indicators_text = ""
    if result.fraud_indicators:
        for ind in result.fraud_indicators:
            indicators_text += f"• <font color='#CE1126'><b>[ANOMALIE]</b></font> {ind}<br/>"
    else:
        indicators_text = "• <font color='#007A3D'><b>[AUCUNE ANOMALIE]</b></font> Aucune falsification de coordonnées ni superficie fictive détectée."

    recomms_text = ""
    for r in result.recommendations_fr:
        recomms_text += f"• {r}<br/>"

    advisory_data = [
        [
            Paragraph("<b>Anomalies Détectées :</b>", bold_label),
            Paragraph(indicators_text, body_style),
        ],
        [
            Paragraph("<b>Recommandations :</b>", bold_label),
            Paragraph(recomms_text, body_style),
        ],
    ]
    advisory_table = Table(advisory_data, colWidths=[120, 403])
    advisory_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), LIGHT_GRAY),
                ("GRID", (0, 0), (-1, -1), 0.5, BORDER_GRAY),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(advisory_table)
    story.append(Spacer(1, 10))

    # 9. Cryptographic Seal & Verification Hash Footer
    seal_data = [
        [
            Paragraph(
                f"<b>EMPREINTE CRYPTOGRAPHIQUE SHA-256 (Anti-Falsification) :</b><br/>"
                f"<font size='7' color='#495057'><code>{result.verification_hash}</code></font><br/>"
                f"<font size='7'><i>Généré par Cadastra-Cameroon Engine v1.0 · Conforme aux normes MINDCAF & Ord. 74-1</i></font>",
                body_style,
            ),
            Paragraph(
                f"<b>HORODATAGE UTC</b><br/>"
                f"<font size='7.5'>{result.timestamp}</font><br/>"
                f"<b>STATUT : {status_label}</b>",
                ParagraphStyle("SealRight", parent=body_style, alignment=TA_RIGHT),
            ),
        ]
    ]
    seal_table = Table(seal_data, colWidths=[380, 143])
    seal_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8F9FA")),
                ("BOX", (0, 0), (-1, -1), 1, CAM_GREEN if result.tolerance_passed else CAM_RED),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(KeepTogether(seal_table))

    doc.build(story, canvasmaker=NumberedCanvas)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
