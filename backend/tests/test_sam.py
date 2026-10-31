"""Unit tests for SAM segmentation parsing and PDF input routing helpers."""

import io

import pytest
from reportlab.pdfgen import canvas

from main import (
    _extract_embedded_pdf_text,
    _has_usable_embedded_coordinate_text,
    _parse_sam_table_box,
    _render_scanned_pdf_first_page,
)


def test_parse_sam_table_box_with_confidence():
    roi = _parse_sam_table_box(
        "<0f>1<|box;x1=100;y1=200;x2=900;y2=800;w=1000;h=1200;c=0.984375|><|mask;x=0;y=0;data=!...|>",
        width=1000,
        height=1200,
    )

    assert roi.xmin == 0.1
    assert roi.ymin == pytest.approx(1 / 6)
    assert roi.xmax == 0.9
    assert roi.ymax == pytest.approx(2 / 3)


def test_parse_sam_table_box_rejects_wrong_image_dimensions():
    with pytest.raises(RuntimeError, match="incohérente"):
        _parse_sam_table_box(
            "<0f>1<|box;x1=0;y1=0;x2=100;y2=100;w=800;h=600|>",
            width=1000,
            height=1200,
        )


def test_editable_pdf_text_requires_multiple_coordinate_rows():
    editable_plan_text = """
    PLAN DLA-2026-01 - Douala Yassa - Superficie 980 m2
    B1 583420.00 446100.00
    B2 583455.00 446100.00
    B3 583455.00 446072.00
    B4 583420.00 446072.00
    """ + (" informations cadastrales" * 12)
    assert _has_usable_embedded_coordinate_text(editable_plan_text) is True
    assert _has_usable_embedded_coordinate_text("B1 583420 446100") is False


def test_scanned_pdf_renderer_returns_png_page():
    pdf = io.BytesIO()
    page = canvas.Canvas(pdf)
    page.drawString(72, 720, "Plan cadastral scanne")
    page.save()

    rendered = _render_scanned_pdf_first_page(pdf.getvalue(), dpi=100)
    assert rendered.startswith(b"\x89PNG")


def test_editable_pdf_text_is_read_without_ocr():
    pdf = io.BytesIO()
    page = canvas.Canvas(pdf)
    page.drawString(72, 720, "PLAN DLA-2026-01")
    page.drawString(72, 700, "B1 583420.00 446100.00")
    page.drawString(72, 680, "B2 583455.00 446100.00")
    page.drawString(72, 660, "B3 583455.00 446072.00")
    page.save()

    extracted = _extract_embedded_pdf_text(pdf.getvalue())
    assert "B2 583455.00 446100.00" in extracted
