"""Tests for cadastral fraud detection and tolerance verification."""

import pytest
from engine import CadastralEngine
from schemas import BeaconInput, PlanVerificationRequest, RiskLevel, UTMZoneEnum


@pytest.fixture
def engine():
    return CadastralEngine()


def test_compliant_parcel_verification(engine):
    """Verify that a genuine parcel with matching stated area passes with LOW risk."""
    req = PlanVerificationRequest(
        plan_id="DLA-TEST-001",
        title_number="TF 48291/Wouri",
        locality="Douala - Yassa",
        region="Littoral",
        utm_zone=UTMZoneEnum.ZONE_32N,
        stated_area_sqm=980.0,
        surveyor_order_number="OGEC-142",
        beacons=[
            BeaconInput(borne_id="B1", x=583420.0, y=446100.0),
            BeaconInput(borne_id="B2", x=583455.0, y=446100.0),
            BeaconInput(borne_id="B3", x=583455.0, y=446072.0),
            BeaconInput(borne_id="B4", x=583420.0, y=446072.0),
        ],
    )
    res = engine.verify_plan(req)

    assert res.is_valid is True
    assert res.superficie_fictive_detected is False
    assert res.computed_area_sqm == 980.0
    assert res.discrepancy_sqm == 0.0
    assert res.tolerance_passed is True
    assert res.risk_level == RiskLevel.LOW
    assert res.self_intersecting is False
    assert len(res.fraud_indicators) == 0


def test_superficie_fictive_detection(engine):
    """Detect fraudulent inflated area (seller claims 1500 m² for an actual 980 m² lot)."""
    req = PlanVerificationRequest(
        plan_id="DLA-FRAUD-002",
        title_number="TF 48291/Wouri-LITIGE",
        locality="Douala - Yassa",
        region="Littoral",
        utm_zone=UTMZoneEnum.ZONE_32N,
        stated_area_sqm=1500.0,  # Claimed 1500 m² vs 980 m² real (+53%)
        surveyor_order_number="INVALIDE",
        beacons=[
            BeaconInput(borne_id="B1", x=583420.0, y=446100.0),
            BeaconInput(borne_id="B2", x=583455.0, y=446100.0),
            BeaconInput(borne_id="B3", x=583455.0, y=446072.0),
            BeaconInput(borne_id="B4", x=583420.0, y=446072.0),
        ],
    )
    res = engine.verify_plan(req)

    assert res.is_valid is False
    assert res.superficie_fictive_detected is True
    assert res.computed_area_sqm == 980.0
    assert res.discrepancy_sqm == 520.0
    assert res.tolerance_passed is False
    # Discrepancy > 15% MUST strictly be CRITICAL_FRAUD
    assert res.risk_level == RiskLevel.CRITICAL_FRAUD
    assert res.risk_score >= 70.0
    assert any("Superficie fictive" in ind for ind in res.fraud_indicators)


def test_self_intersecting_polygon_detection(engine):
    """Detect invalid bow-tie self-intersecting boundary line."""
    req = PlanVerificationRequest(
        plan_id="KRI-ERR-003",
        locality="Kribi",
        region="Sud",
        utm_zone=UTMZoneEnum.ZONE_32N,
        stated_area_sqm=2500.0,
        beacons=[
            BeaconInput(borne_id="B1", x=605100.0, y=325100.0),
            BeaconInput(borne_id="B2", x=605200.0, y=325000.0),  # Crossed diagonal
            BeaconInput(borne_id="B3", x=605200.0, y=325100.0),
            BeaconInput(borne_id="B4", x=605100.0, y=325000.0),
        ],
    )
    res = engine.verify_plan(req)

    assert res.self_intersecting is True
    assert res.is_valid is False
    assert res.polygon_closed is False
    assert res.risk_level == RiskLevel.CRITICAL_FRAUD
    assert any("auto-intersecte" in ind for ind in res.fraud_indicators)


def test_tolerance_boundary_cases(engine):
    """Verify allowable cadastral tolerance threshold: <= 1% is accepted, > 1% is flagged."""
    # Real area = 1000 m²
    # 0.5% deviation (1005 m²) should pass
    req_pass = PlanVerificationRequest(
        plan_id="TOL-PASS",
        locality="Yaoundé",
        region="Centre",
        utm_zone=UTMZoneEnum.ZONE_32N,
        stated_area_sqm=1005.0,
        surveyor_order_number="OGEC-088",
        beacons=[
            BeaconInput(borne_id="B1", x=700000.0, y=400000.0),
            BeaconInput(borne_id="B2", x=700050.0, y=400000.0),
            BeaconInput(borne_id="B3", x=700050.0, y=400020.0),
            BeaconInput(borne_id="B4", x=700000.0, y=400020.0),
        ],
    )
    res_pass = engine.verify_plan(req_pass)
    assert res_pass.tolerance_passed is True

    # 10% deviation (1100 m²) should fail tolerance
    req_fail = PlanVerificationRequest(
        plan_id="TOL-FAIL",
        locality="Yaoundé",
        region="Centre",
        utm_zone=UTMZoneEnum.ZONE_32N,
        stated_area_sqm=1100.0,
        surveyor_order_number="OGEC-088",
        beacons=[
            BeaconInput(borne_id="B1", x=700000.0, y=400000.0),
            BeaconInput(borne_id="B2", x=700050.0, y=400000.0),
            BeaconInput(borne_id="B3", x=700050.0, y=400020.0),
            BeaconInput(borne_id="B4", x=700000.0, y=400020.0),
        ],
    )
    res_fail = engine.verify_plan(req_fail)
    assert res_fail.tolerance_passed is False
    assert res_fail.superficie_fictive_detected is True
    assert res_fail.risk_level == RiskLevel.HIGH


def test_duplicate_consecutive_beacons_detected(engine):
    """Duplicate consecutive beacons creating a 0m segment should be flagged."""
    req = PlanVerificationRequest(
        plan_id="DUP-BEACON-001",
        locality="Douala",
        region="Littoral",
        utm_zone=UTMZoneEnum.ZONE_32N,
        stated_area_sqm=980.0,
        surveyor_order_number="OGEC-142",
        beacons=[
            BeaconInput(borne_id="B1", x=583420.0, y=446100.0),
            BeaconInput(borne_id="B2", x=583455.0, y=446100.0),
            BeaconInput(borne_id="B2_bis", x=583455.0, y=446100.0),  # exact duplicate point
            BeaconInput(borne_id="B3", x=583455.0, y=446072.0),
            BeaconInput(borne_id="B4", x=583420.0, y=446072.0),
        ],
    )
    res = engine.verify_plan(req)
    assert any("dupliquée" in ind for ind in res.fraud_indicators)
    assert res.self_intersecting is True
    assert res.is_valid is False


def test_wgs84_decimal_degrees_flagged(engine):
    """Input coordinates given in WGS84 decimal degrees should be flagged explicitly."""
    req = PlanVerificationRequest(
        plan_id="DEG-TEST-001",
        locality="Douala",
        region="Littoral",
        utm_zone=UTMZoneEnum.ZONE_32N,
        stated_area_sqm=980.0,
        beacons=[
            BeaconInput(borne_id="B1", x=9.7512, y=4.0345),
            BeaconInput(borne_id="B2", x=9.7520, y=4.0345),
            BeaconInput(borne_id="B3", x=9.7520, y=4.0335),
            BeaconInput(borne_id="B4", x=9.7512, y=4.0335),
        ],
    )
    res = engine.verify_plan(req)
    assert any("degrés décimaux" in ind for ind in res.fraud_indicators)
    assert res.is_valid is False
    assert res.risk_level == RiskLevel.CRITICAL_FRAUD


def test_regional_location_mismatch_detected(engine):
    """Coordinates situated in North Cameroon but claimed to be in Littoral should trigger location fraud."""
    # Garoua coordinates in Zone 32N or 33N but claimed region = "Littoral"
    req = PlanVerificationRequest(
        plan_id="MISMATCH-001",
        locality="Douala - Bonapriso",
        region="Littoral",
        utm_zone=UTMZoneEnum.ZONE_33N,
        stated_area_sqm=2000.0,
        beacons=[
            BeaconInput(borne_id="B1", x=324200.0, y=1028400.0),
            BeaconInput(borne_id="B2", x=324250.0, y=1028400.0),
            BeaconInput(borne_id="B3", x=324250.0, y=1028360.0),
            BeaconInput(borne_id="B4", x=324200.0, y=1028360.0),
        ],
    )
    res = engine.verify_plan(req)
    assert any("Incohérence de localisation" in ind for ind in res.fraud_indicators)


def test_degenerate_collinear_polygon(engine):
    """Degenerate collinear beacons producing 0 area should not be closed or valid."""
    req = PlanVerificationRequest(
        plan_id="COLLINEAR-001",
        locality="Douala",
        region="Littoral",
        utm_zone=UTMZoneEnum.ZONE_32N,
        stated_area_sqm=500.0,
        beacons=[
            BeaconInput(borne_id="B1", x=583420.0, y=446100.0),
            BeaconInput(borne_id="B2", x=583440.0, y=446100.0),
            BeaconInput(borne_id="B3", x=583460.0, y=446100.0),
        ],
    )
    res = engine.verify_plan(req)
    assert res.computed_area_sqm == 0.0
    assert res.polygon_closed is False
    assert res.is_valid is False
    assert res.risk_level == RiskLevel.CRITICAL_FRAUD
