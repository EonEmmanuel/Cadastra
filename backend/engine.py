"""Geodetic math and cadastral integrity verification engine for Cameroon.

Supports:
- UTM Zone 32N (EPSG:32632) and UTM Zone 33N (EPSG:32633) conversion to WGS84 (EPSG:4326).
- Exact Shoelace and Shapely metric area calculations.
- Boundary closure, self-intersection, and segment distance verification.
- Cameroon national bounding box validation and coordinate inversion detection.
- Superficie fictive (land fraud) detection against MINDCAF cadastral tolerances.
"""

from __future__ import annotations
import math
import hashlib
from datetime import datetime, timezone
from typing import List, Tuple, Dict, Any, Optional

import pyproj
from shapely.geometry import Polygon, LineString

from schemas import (
    BeaconInput,
    BeaconWGS84,
    BoundarySegment,
    PlanVerificationRequest,
    PlanVerificationResponse,
    RiskLevel,
    UTMZoneEnum,
)

# Geographic bounding box for Cameroon in WGS84
# Southernmost point ~1.6°N, Northernmost ~13.1°N
# Westernmost ~8.4°E, Easternmost ~16.2°E
CAMEROON_BBOX = {
    "min_lat": 1.5,
    "max_lat": 13.5,
    "min_lon": 8.3,
    "max_lon": 16.5,
}

# Regional bounding boxes for detecting location mismatches ("fraude de localisation")
CAMEROON_REGIONS_BBOX: Dict[str, Dict[str, float]] = {
    "littoral": {"min_lat": 3.4, "max_lat": 5.1, "min_lon": 9.2, "max_lon": 10.7},
    "centre": {"min_lat": 3.1, "max_lat": 5.1, "min_lon": 11.0, "max_lon": 13.1},
    "sud": {"min_lat": 2.1, "max_lat": 3.5, "min_lon": 9.8, "max_lon": 13.5},
    "ouest": {"min_lat": 4.9, "max_lat": 6.1, "min_lon": 9.8, "max_lon": 11.3},
    "nord-ouest": {"min_lat": 5.6, "max_lat": 7.2, "min_lon": 9.6, "max_lon": 11.3},
    "sud-ouest": {"min_lat": 4.0, "max_lat": 5.9, "min_lon": 8.7, "max_lon": 10.1},
    "adamaoua": {"min_lat": 6.0, "max_lat": 8.1, "min_lon": 11.3, "max_lon": 15.6},
    "nord": {"min_lat": 7.8, "max_lat": 10.3, "min_lon": 12.4, "max_lon": 15.9},
    "extreme-nord": {"min_lat": 9.9, "max_lat": 13.2, "min_lon": 13.4, "max_lon": 15.8},
    "est": {"min_lat": 2.2, "max_lat": 5.9, "min_lon": 12.8, "max_lon": 16.3},
}

# Standard MINDCAF allowable tolerance for cadastral plan surveys:
# Relative tolerance: 1.0% (0.01)
# Absolute floor tolerance: 5.0 m² for small residential parcels
CADASTRAL_RELATIVE_TOLERANCE = 0.01  # 1%
CADASTRAL_MIN_TOLERANCE_SQM = 5.0   # 5 m²


class CadastralEngine:
    """Core geodetic calculation and cadastral fraud detection engine."""

    def __init__(self):
        # Initialize pyproj transformers for UTM zones 32N and 33N to WGS84
        # always_xy=True ensures transform takes (x, y) = (easting, northing)
        # and returns (longitude, latitude)
        self.transformer_32n = pyproj.Transformer.from_crs(
            "EPSG:32632", "EPSG:4326", always_xy=True
        )
        self.transformer_33n = pyproj.Transformer.from_crs(
            "EPSG:32633", "EPSG:4326", always_xy=True
        )

    def get_transformer(self, utm_zone: UTMZoneEnum | str) -> Tuple[pyproj.Transformer, str]:
        """Returns the pyproj Transformer and EPSG string for the given zone."""
        zone_str = utm_zone.value if isinstance(utm_zone, UTMZoneEnum) else str(utm_zone)
        if "33" in zone_str:
            return self.transformer_33n, "EPSG:32633"
        return self.transformer_32n, "EPSG:32632"

    def utm_to_wgs84(
        self, x: float, y: float, utm_zone: UTMZoneEnum | str = UTMZoneEnum.ZONE_32N
    ) -> Tuple[float, float]:
        """Convert UTM (Easting, Northing) to WGS84 (Longitude, Latitude).

        Returns:
            Tuple of (longitude, latitude) in decimal degrees.
        """
        transformer, _ = self.get_transformer(utm_zone)
        lon, lat = transformer.transform(x, y)
        return lon, lat

    def wgs84_to_utm(
        self, lon: float, lat: float, utm_zone: UTMZoneEnum | str = UTMZoneEnum.ZONE_32N
    ) -> Tuple[float, float]:
        """Convert WGS84 (Longitude, Latitude) to UTM (Easting, Northing)."""
        _, epsg = self.get_transformer(utm_zone)
        rev_transformer = pyproj.Transformer.from_crs(
            "EPSG:4326", epsg, always_xy=True
        )
        x, y = rev_transformer.transform(lon, lat)
        return x, y

    def compute_shoelace_area(self, coords: List[Tuple[float, float]]) -> float:
        """Compute polygon area in square meters using the classic Shoelace formula.

        Args:
            coords: List of (x, y) tuples forming the polygon perimeter.
        Returns:
            Area in square meters (always positive).
        """
        n = len(coords)
        if n < 3:
            return 0.0

        # Remove duplicate closing vertex if present
        pts = list(coords)
        if pts[0] == pts[-1] and len(pts) > 3:
            pts = pts[:-1]
            n = len(pts)

        area = 0.0
        for i in range(n):
            j = (i + 1) % n
            area += pts[i][0] * pts[j][1]
            area -= pts[j][0] * pts[i][1]
        return abs(area) / 2.0

    def compute_segment_distance(self, p1: Tuple[float, float], p2: Tuple[float, float]) -> float:
        """Calculate Euclidean distance between two UTM coordinate points in meters."""
        return math.sqrt((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2)

    def compute_bearing(self, p1: Tuple[float, float], p2: Tuple[float, float]) -> float:
        """Compute azimuth/bearing from p1 to p2 in degrees (0 = North, 90 = East)."""
        dx = p2[0] - p1[0]
        dy = p2[1] - p1[1]
        bearing = math.degrees(math.atan2(dx, dy))
        return (bearing + 360.0) % 360.0

    def verify_plan(self, request: PlanVerificationRequest) -> PlanVerificationResponse:
        """Conduct complete cadastral audit and verification for a survey plan."""
        fraud_indicators: List[str] = []
        recommendations_fr: List[str] = []
        recommendations_en: List[str] = []

        beacons = request.beacons
        if len(beacons) < 3:
            raise ValueError("Au moins 3 bornes sont nécessaires pour former un polygone cadastral.")

        # Check if first and last beacon are explicitly the same
        is_explicitly_closed = (
            beacons[0].borne_id == beacons[-1].borne_id
            or (
                math.isclose(beacons[0].x, beacons[-1].x, abs_tol=1e-3)
                and math.isclose(beacons[0].y, beacons[-1].y, abs_tol=1e-3)
            )
        )

        # Standardize unique perimeter vertices
        unique_beacons = beacons[:-1] if is_explicitly_closed and len(beacons) > 3 else list(beacons)
        # If user passed 3 beacons where first equals last, that's only 2 distinct points
        if len(unique_beacons) < 3 or (len(unique_beacons) == 3 and math.isclose(unique_beacons[0].x, unique_beacons[2].x, abs_tol=1e-3) and math.isclose(unique_beacons[0].y, unique_beacons[2].y, abs_tol=1e-3)):
            fraud_indicators.append(
                "Le bornage ne contient pas au moins 3 bornes géodésiques distinctes pour enclore une surface 2D."
            )

        raw_coords = [(b.x, b.y) for b in unique_beacons]

        # Check for duplicate consecutive beacons or zero-length segments
        has_zero_length_segment = False
        for i in range(len(unique_beacons)):
            next_i = (i + 1) % len(unique_beacons)
            d = self.compute_segment_distance(
                (unique_beacons[i].x, unique_beacons[i].y),
                (unique_beacons[next_i].x, unique_beacons[next_i].y),
            )
            if d < 0.05:  # less than 5 cm
                has_zero_length_segment = True
                fraud_indicators.append(
                    f"Borne dupliquée ou segment nul détecté entre {unique_beacons[i].borne_id} et {unique_beacons[next_i].borne_id} (distance = {d:.3f} m)."
                )

        # Check if input coordinates were provided in WGS84 decimal degrees instead of UTM meters
        is_decimal_degrees = all(abs(b.x) <= 180.0 and abs(b.y) <= 90.0 for b in unique_beacons)
        if is_decimal_degrees:
            fraud_indicators.append(
                "Coordonnées exprimées en degrés décimaux (WGS84 / GPS) au lieu des coordonnées projetées UTM métriques attendues (EPSG:32632 ou EPSG:32633)."
            )

        # 1. Coordinate inversion / Cameroon bounding box check
        transformer, epsg_code = self.get_transformer(request.utm_zone)
        beacons_wgs84: List[BeaconWGS84] = []
        out_of_bounds_count = 0
        inverted_coords_detected = False

        for b in unique_beacons:
            # Check for inverted coordinates or UTM out of physical range in Cameroon:
            # In Cameroon UTM: Easting is typically 165,000 - 850,000 m. Northing is 170,000 - 1,460,000 m.
            if not is_decimal_degrees:
                if b.x > 850000.0 or b.x < 160000.0 or b.y < 160000.0 or b.y > 1500000.0:
                    inverted_coords_detected = True

            lon, lat = self.utm_to_wgs84(b.x, b.y, request.utm_zone)

            # Check bounding box
            if not (
                CAMEROON_BBOX["min_lat"] <= lat <= CAMEROON_BBOX["max_lat"]
                and CAMEROON_BBOX["min_lon"] <= lon <= CAMEROON_BBOX["max_lon"]
            ):
                out_of_bounds_count += 1

            beacons_wgs84.append(
                BeaconWGS84(
                    borne_id=b.borne_id,
                    utm_x=round(b.x, 3),
                    utm_y=round(b.y, 3),
                    latitude=round(lat, 6),
                    longitude=round(lon, 6),
                    elevation_m=b.z,
                    description=b.description,
                )
            )

        if inverted_coords_detected:
            fraud_indicators.append(
                "Inversion probable des coordonnées X (Easting) et Y (Northing) ou fuseau UTM inadapté."
            )

        if out_of_bounds_count > 0:
            fraud_indicators.append(
                f"{out_of_bounds_count} borne(s) se situent hors des frontières nationales du Cameroun ou en zone maritime."
            )

        # 2. Geometric calculations via Shapely and Shoelace
        shoelace_area = self.compute_shoelace_area(raw_coords)

        # Construct Shapely Polygon for advanced topological checks
        # Shapely requires closed ring
        closed_coords = raw_coords + [raw_coords[0]]
        shapely_poly = Polygon(closed_coords)

        computed_area_sqm = round(shapely_poly.area if shapely_poly.is_valid else shoelace_area, 2)
        is_self_intersecting = not shapely_poly.is_valid or not shapely_poly.is_simple or has_zero_length_segment

        if is_self_intersecting and not has_zero_length_segment:
            fraud_indicators.append(
                "Le périmètre du polygone s'auto-intersecte (bornage en nœud de papillon ou croisement de limites anormal)."
            )

        # 3. Boundary segments and perimeter
        boundary_segments: List[BoundarySegment] = []
        total_perimeter = 0.0

        n_pts = len(unique_beacons)
        for i in range(n_pts):
            p1 = unique_beacons[i]
            p2 = unique_beacons[(i + 1) % n_pts]
            dist = self.compute_segment_distance((p1.x, p1.y), (p2.x, p2.y))
            bearing = self.compute_bearing((p1.x, p1.y), (p2.x, p2.y))
            total_perimeter += dist
            boundary_segments.append(
                BoundarySegment(
                    from_borne=p1.borne_id,
                    to_borne=p2.borne_id,
                    length_meters=round(dist, 2),
                    bearing_degrees=round(bearing, 1),
                )
            )

        # 4. Centroid
        if shapely_poly.is_valid and not shapely_poly.is_empty:
            c_x = shapely_poly.centroid.x
            c_y = shapely_poly.centroid.y
        else:
            c_x = sum(b.x for b in unique_beacons) / len(unique_beacons)
            c_y = sum(b.y for b in unique_beacons) / len(unique_beacons)

        c_lon, c_lat = self.utm_to_wgs84(c_x, c_y, request.utm_zone)
        centroid_utm = {"x": round(c_x, 3), "y": round(c_y, 3)}
        centroid_wgs84 = {"latitude": round(c_lat, 6), "longitude": round(c_lon, 6)}

        # Regional bounding box check (Location mismatch / Fraude de localisation)
        norm_region = (request.region or "").strip().lower().replace("é", "e").replace("è", "e")
        if norm_region in CAMEROON_REGIONS_BBOX and not is_decimal_degrees:
            r_bbox = CAMEROON_REGIONS_BBOX[norm_region]
            if not (r_bbox["min_lat"] <= c_lat <= r_bbox["max_lat"] and r_bbox["min_lon"] <= c_lon <= r_bbox["max_lon"]):
                fraud_indicators.append(
                    f"Incohérence de localisation : Les coordonnées calculées se situent hors des limites de la Région déclarée ({request.region})."
                )

        # 5. Superficie Fictive & Tolerance Analysis
        stated_area = request.stated_area_sqm
        discrepancy_sqm = round(abs(stated_area - computed_area_sqm), 2)
        discrepancy_percentage = (
            round((discrepancy_sqm / computed_area_sqm) * 100.0, 2)
            if computed_area_sqm > 0
            else 100.0
        )

        # Cadastral tolerance under MINDCAF norms:
        # Maximum of 1% of the computed surface or 5 m²
        allowed_tolerance_sqm = max(
            CADASTRAL_MIN_TOLERANCE_SQM,
            computed_area_sqm * CADASTRAL_RELATIVE_TOLERANCE,
        )
        tolerance_passed = (discrepancy_sqm <= allowed_tolerance_sqm) and (computed_area_sqm > 0)

        superficie_fictive_detected = False
        if not tolerance_passed:
            if stated_area > computed_area_sqm:
                superficie_fictive_detected = True
                fraud_indicators.append(
                    f"Superficie fictive détectée : Le plan revendique {stated_area:,.2f} m² alors que les bornes n'enclosent que {computed_area_sqm:,.2f} m² (surévaluation frauduleuse de +{discrepancy_percentage:.1f}%)."
                )
            else:
                fraud_indicators.append(
                    f"Écart de superficie non conforme : La superficie calculée ({computed_area_sqm:,.2f} m²) dépasse la superficie annoncée ({stated_area:,.2f} m²) de {discrepancy_sqm:.2f} m²."
                )

        # 6. Risk Scoring Algorithm (0 - 100 scale)
        risk_score = 0.0

        # Discrepancy penalty (calibrated to match RiskLevel thresholds)
        # <= 1%: 0 pts
        # 1% to 5%: 15 to 30 pts (MEDIUM)
        # 5% to 15%: 35 to 65 pts (HIGH)
        # > 15%: 70 to 95 pts (CRITICAL_FRAUD)
        if discrepancy_percentage <= 1.0 and tolerance_passed:
            disc_penalty = 0.0
        elif discrepancy_percentage <= 5.0:
            disc_penalty = 15.0 + (discrepancy_percentage - 1.0) * 3.75
        elif discrepancy_percentage <= 15.0:
            disc_penalty = 35.0 + (discrepancy_percentage - 5.0) * 3.0
        else:
            disc_penalty = min(95.0, 70.0 + (discrepancy_percentage - 15.0) * 0.8)

        risk_score += disc_penalty

        # Self-intersection or degenerate topology penalty (40 pts)
        if is_self_intersecting or computed_area_sqm <= 0.0:
            risk_score += 40.0

        # Out of bounds / Inverted coords penalty (40 pts)
        if out_of_bounds_count > 0 or inverted_coords_detected or is_decimal_degrees:
            risk_score += 40.0

        # Surveyor registration check (10 pts)
        if not request.surveyor_order_number or "INVALIDE" in (request.surveyor_order_number or "").upper():
            risk_score += 10.0
            fraud_indicators.append(
                "Le numéro d'inscription du géomètre-expert à l'OGEC est absent ou non homologué."
            )

        risk_score = min(100.0, max(0.0, round(risk_score, 1)))

        # Assign Risk Level based on both score and critical fraud thresholds
        if (
            discrepancy_percentage > 15.0
            or is_self_intersecting
            or out_of_bounds_count > 0
            or inverted_coords_detected
            or is_decimal_degrees
            or computed_area_sqm <= 0.0
            or risk_score > 65.0
        ):
            risk_level = RiskLevel.CRITICAL_FRAUD
        elif risk_score > 35.0 or discrepancy_percentage > 5.0:
            risk_level = RiskLevel.HIGH
        elif risk_score > 15.0 or not tolerance_passed:
            risk_level = RiskLevel.MEDIUM
        else:
            risk_level = RiskLevel.LOW

        # 7. Generate bilingual recommendations
        if risk_level == RiskLevel.LOW:
            recommendations_fr.append(
                "Plan conforme aux normes cadastrales MINDCAF. Les coordonnées géodésiques et la superficie concordent."
            )
            recommendations_fr.append(
                "La parcelle peut être soumise à l'immatriculation foncière ou à la signature notariale."
            )
            recommendations_en.append(
                "Survey plan complies with MINDCAF cadastral standards. Geodetic coordinates and surface area match."
            )
            recommendations_en.append(
                "The parcel is cleared for land title registration or notarial conveyance."
            )
        elif risk_level == RiskLevel.MEDIUM:
            recommendations_fr.append(
                "Un écart mineur est constaté. Exiger du géomètre-expert un procès-verbal de rectification de bornage."
            )
            recommendations_en.append(
                "Minor boundary discrepancy observed. Require the licensed surveyor to provide an amended boundary report."
            )
        else:
            recommendations_fr.append(
                "ALERTE FRAUDE : Ne pas engager de transaction financière ni signer d'acte notarié sur la base de ce plan."
            )
            recommendations_fr.append(
                "Solliciter une contre-expertise contradictoire auprès du Service Départemental du Cadastre du MINDCAF."
            )
            recommendations_en.append(
                "FRAUD ALERT: Do not execute monetary transactions or sign notarial deeds based on this survey plan."
            )
            recommendations_en.append(
                "Request a contradictory counter-survey from the divisional cadastral service of MINDCAF."
            )

        # Polygon closure integrity
        polygon_closed = bool(
            shapely_poly.is_valid
            and computed_area_sqm > 0
            and not is_self_intersecting
            and len(unique_beacons) >= 3
        )

        # 8. Cryptographic hash for certificate integrity
        hasher = hashlib.sha256()
        raw_repr = f"{request.plan_id}:{computed_area_sqm}:{stated_area}:{raw_coords}:{request.surveyor_order_number}"
        hasher.update(raw_repr.encode("utf-8"))
        verification_hash = hasher.hexdigest()

        return PlanVerificationResponse(
            plan_id=request.plan_id,
            is_valid=(risk_level == RiskLevel.LOW),
            superficie_fictive_detected=superficie_fictive_detected,
            stated_area_sqm=stated_area,
            computed_area_sqm=computed_area_sqm,
            discrepancy_sqm=discrepancy_sqm,
            discrepancy_percentage=discrepancy_percentage,
            tolerance_passed=tolerance_passed,
            polygon_closed=polygon_closed,
            self_intersecting=is_self_intersecting,
            perimeter_m=round(total_perimeter, 2),
            centroid_utm=centroid_utm,
            centroid_wgs84=centroid_wgs84,
            utm_zone=request.utm_zone.value if isinstance(request.utm_zone, UTMZoneEnum) else str(request.utm_zone),
            epsg_code=epsg_code,
            beacons_wgs84=beacons_wgs84,
            boundary_segments=boundary_segments,
            risk_score=risk_score,
            risk_level=risk_level,
            fraud_indicators=fraud_indicators,
            recommendations_fr=recommendations_fr,
            recommendations_en=recommendations_en,
            verification_hash=verification_hash,
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
