"""Unit tests for geodetic math engine and coordinate conversions."""

import math
import pytest
from engine import CadastralEngine, CAMEROON_BBOX
from schemas import BeaconInput, PlanVerificationRequest, UTMZoneEnum


@pytest.fixture
def engine():
    return CadastralEngine()


def test_utm32n_to_wgs84_conversion(engine):
    """Douala Yassa coordinates in UTM 32N should project into Douala/Littoral (approx 4.0°N, 9.75°E)."""
    # Douala Yassa B1: 583420.0, 446100.0
    lon, lat = engine.utm_to_wgs84(583420.0, 446100.0, UTMZoneEnum.ZONE_32N)

    # Douala is at approx latitude 4.03°N and longitude 9.75°E
    assert 3.9 <= lat <= 4.2, f"Latitude {lat} out of expected Douala range"
    assert 9.6 <= lon <= 9.9, f"Longitude {lon} out of expected Douala range"


def test_utm33n_to_wgs84_conversion(engine):
    """Garoua coordinates in UTM 33N should project into North Cameroon (approx 9.3°N, 13.4°E)."""
    # Garoua B1: 324200.0, 1028400.0 in UTM 33N
    lon, lat = engine.utm_to_wgs84(324200.0, 1028400.0, UTMZoneEnum.ZONE_33N)

    assert 9.1 <= lat <= 9.5, f"Latitude {lat} out of expected Garoua range"
    assert 13.2 <= lon <= 13.6, f"Longitude {lon} out of expected Garoua range"

    # Yagoua / Far-North B1: 544100.0, 1028200.0 in UTM 33N
    y_lon, y_lat = engine.utm_to_wgs84(544100.0, 1028200.0, UTMZoneEnum.ZONE_33N)
    assert 9.1 <= y_lat <= 9.5
    assert 15.2 <= y_lon <= 15.6


def test_roundtrip_coordinate_conversion(engine):
    """Converting from UTM to WGS84 and back to UTM should preserve coordinates within 1mm."""
    orig_x, orig_y = 583420.0, 446100.0
    lon, lat = engine.utm_to_wgs84(orig_x, orig_y, UTMZoneEnum.ZONE_32N)
    back_x, back_y = engine.wgs84_to_utm(lon, lat, UTMZoneEnum.ZONE_32N)

    assert math.isclose(orig_x, back_x, abs_tol=1e-3)
    assert math.isclose(orig_y, back_y, abs_tol=1e-3)


def test_shoelace_area_calculation(engine):
    """A rectangular parcel 35m x 28m must yield exactly 980.0 m²."""
    coords = [
        (0.0, 0.0),
        (35.0, 0.0),
        (35.0, 28.0),
        (0.0, 28.0),
    ]
    area = engine.compute_shoelace_area(coords)
    assert math.isclose(area, 980.0, abs_tol=1e-5)


def test_shoelace_with_closed_loop(engine):
    """Shoelace formula should handle polygons with repeating final vertex gracefully."""
    coords = [
        (0.0, 0.0),
        (35.0, 0.0),
        (35.0, 28.0),
        (0.0, 28.0),
        (0.0, 0.0),  # Repeating B1
    ]
    area = engine.compute_shoelace_area(coords)
    assert math.isclose(area, 980.0, abs_tol=1e-5)


def test_segment_distance_and_perimeter(engine):
    """Euclidean distance between (0, 0) and (30, 40) must be 50.0 m."""
    dist = engine.compute_segment_distance((0.0, 0.0), (30.0, 40.0))
    assert math.isclose(dist, 50.0, abs_tol=1e-5)


def test_bearing_calculation(engine):
    """Bearings should accurately reflect cardinal and intermediate compass directions."""
    # Due North: dx=0, dy>0 -> 0 degrees
    assert math.isclose(engine.compute_bearing((0, 0), (0, 10)), 0.0, abs_tol=1e-3)
    # Due East: dx>0, dy=0 -> 90 degrees
    assert math.isclose(engine.compute_bearing((0, 0), (10, 0)), 90.0, abs_tol=1e-3)
    # Due South: dx=0, dy<0 -> 180 degrees
    assert math.isclose(engine.compute_bearing((0, 0), (0, -10)), 180.0, abs_tol=1e-3)
    # Due West: dx<0, dy=0 -> 270 degrees
    assert math.isclose(engine.compute_bearing((0, 0), (-10, 0)), 270.0, abs_tol=1e-3)


def test_shoelace_orientation_invariance(engine):
    """Area should be identical whether points are ordered clockwise or counter-clockwise."""
    cw = [(0.0, 0.0), (0.0, 20.0), (30.0, 20.0), (30.0, 0.0)]
    ccw = [(0.0, 0.0), (30.0, 0.0), (30.0, 20.0), (0.0, 20.0)]
    assert math.isclose(engine.compute_shoelace_area(cw), 600.0, abs_tol=1e-5)
    assert math.isclose(engine.compute_shoelace_area(ccw), 600.0, abs_tol=1e-5)


def test_large_multipage_parcel_pdf_generation(engine):
    """Parcels with 30 beacons should produce a clean multipage PDF without layout overflow."""
    from pdf_report import generate_cadastral_pdf
    beacons_30 = []
    for i in range(30):
        beacons_30.append(BeaconInput(
            borne_id=f"B{i+1}",
            x=583400.0 + (i % 6) * 15.0,
            y=446000.0 + (i // 6) * 15.0,
            z=25.0,
            description=f"Borne périphérique B{i+1}"
        ))

    req = PlanVerificationRequest(
        plan_id="LARGE-30-PARCEL",
        locality="Douala",
        region="Littoral",
        utm_zone=UTMZoneEnum.ZONE_32N,
        stated_area_sqm=4500.0,
        surveyor_name="Ing. Test Multipage",
        surveyor_order_number="OGEC-777",
        beacons=beacons_30,
    )
    res = engine.verify_plan(req)
    pdf_bytes = generate_cadastral_pdf(res, req)
    assert len(pdf_bytes) > 2000
    assert pdf_bytes[:4] == b"%PDF"
