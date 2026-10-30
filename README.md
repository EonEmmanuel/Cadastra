# Cadastra-Cameroon 🇨🇲
### Autonomous Cadastral Survey Plan & Beacon Coordinate Verification System
**Meta Global AI Developer Hackathon 2026**

---

## 📌 Executive Summary & Problem

In Cameroon, land tenure disputes and fraud represent over **65% of civil court cases** (MINDCAF - *Ministère du Cadastre et des Affaires Foncières*). The most prevalent fraud patterns are:

1. **"Superficie Fictive" (Phantom Land Area):** Paper survey plans (*Plans de Bornage*) state inflated surfaces (e.g., claiming 1,500 m² for an actual 980 m² lot) to artificially inflate bank collateral, government compensation, or scam diaspora buyers.
2. **Boundary Discrepancies & Self-Intersections:** Overlapping boundaries, inverted X/Y coordinates, or irregular bow-tie polygons that do not close mathematically.
3. **UTM Projection Misalignments:** Mixing UTM Zone 32N (`EPSG:32632`, Western/Central Cameroon) and Zone 33N (`EPSG:32633`, Northern/Eastern Cameroon).

**Cadastra-Cameroon** solves this with an autonomous AI and geodetic verification pipeline tailored to Cameroonian cadastral standards (Ordonnance 74-1 and Décret 76-165).

---

## 🏗️ System Architecture

```
[Paper Cadastral Plan Scan / Photo]
            │
            ▼
   ┌─────────────────┐
   │  Meta SAM 3.1   │ ──► Isolates Beacon Table Region-of-Interest (ROI)
   └─────────────────┘
            │
            ▼
   ┌─────────────────┐
   │ Meta Muse Spark │ ──► Structured coordinate extraction (Bornes B1..Bn, X, Y, Z, Stated Area)
   └─────────────────┘
            │
            ▼
┌────────────────────────────────────────────────────────────────────────┐
│  FastAPI Backend Geodetic Math Engine (PyProj + Shapely)               │
│  • UTM 32N / 33N ➔ WGS84 Geodetic Projection (EPSG:4326)               │
│  • Metric Shoelace & Shapely Area Calculation ($m^2$)                  │
│  • Perimeter Closure, Self-Intersection & Boundary Segment Distances   │
│  • MINDCAF 1% Allowable Tolerance & Superficie Fictive Detection       │
│  • SHA-256 Anti-Tamper Cryptographic Audit Seal                        │
└────────────────────────────────────────────────────────────────────────┘
       │                                              │
       ▼                                              ▼
┌───────────────────────────────┐     ┌─────────────────────────────────┐
│ Next.js 15 + Leaflet Frontend │     │ WhatsApp Cloud API Webhook Bot  │
│ Satellite Imagery, B1..Bn Pins│     │ Inbound Citizen Verification &  │
│ Live Coordinates & Risk Gauge │     │ Bilingual PDF Audit Certificate │
└───────────────────────────────┘     └─────────────────────────────────┘
```

---

## 🚀 Key Features

- **Geodetic Engine:** Exact metric area via Shoelace and Shapely, segment lengths ($d = \sqrt{\Delta X^2 + \Delta Y^2}$), azimuth bearings, and centroid calculation.
- **MINDCAF Cadastral Tolerance:** Automatic enforcement of Cameroon legal tolerance ($\pm 1.0\%$ or $5.0\text{ m}^2$) under Land Tenure Ordinance 74-1.
- **Official Bilingual PDF Audit Certificate:** Generated via ReportLab in French & English with Cameroon emblems, compliance status, full beacon table, and verification hash.
- **Interactive Leaflet Satellite Map:** Real-time satellite imagery overlay with interactive pins B1..Bn, boundary lines (green for compliant, red for fraud/anomalies), and edge distance labels.
- **WhatsApp Cloud API Integration:** Citizen and diaspora land buyers can text coordinates or upload plan photos to receive instant audit results and downloadable PDF reports.

---

## 📂 Project Structure

```
Hackerton-Project/
├── backend/
│   ├── .venv/                     # Python 3.12 virtual environment (managed by uv)
│   ├── engine.py                  # PyProj & Shapely geodetic math engine
│   ├── main.py                    # FastAPI app (REST, Webhooks, PDF stream)
│   ├── pdf_report.py              # ReportLab bilingual PDF audit certificate generator
│   ├── requirements.txt           # Python dependencies
│   ├── schemas.py                 # Pydantic v2 validation models
│   └── tests/                     # 30 Pytest unit & integration tests
│       ├── test_api.py            # API endpoints & WhatsApp webhook tests
│       ├── test_engine.py         # UTM 32N/33N conversion & Shoelace area tests
│       └── test_fraud_detection.py# Superficie fictive & tolerance tests
├── frontend/
│   ├── src/
│   │   ├── app/                   # Next.js 15 App Router (layout, page, globals)
│   │   ├── components/            # Leaflet map, verification panel, simulators
│   │   └── types/                 # TypeScript types
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── test_data/                     # Ground-truth Cameroon cadastral profiles
│   ├── douala_yassa_utm32n.json   # Valid Littoral parcel (980 m²)
│   ├── douala_yassa_fraud_superficie.json # Fraud profile (claimed 1500 m² vs 980 m²)
│   ├── yaounde_odza_utm32n.json   # Valid Centre parcel (2100 m², 5 beacons)
│   ├── kribi_ocean_overlap_utm32n.json # Self-intersecting bow-tie boundary
│   └── garoua_utm33n.json         # Valid Northern parcel (UTM 33N, 2000 m²)
└── README.md
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- Python 3.12+ (or use the configured virtual environment in `backend/.venv`)
- Node.js 18+ and npm

### 2. Backend Setup & Test Execution
```bash
# From workspace root
# Run all 30 unit and integration tests
backend\.venv\Scripts\pytest backend/tests -v

# Start the FastAPI server (Port 8000)
backend\.venv\Scripts\uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation is available at: `http://localhost:8000/docs`

### 3. Frontend Setup & Launch
```bash
cd frontend
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🧪 Ground-Truth Test Profiles

| Profile | Region / Locality | Projection | Declared | Real Area | Verdict |
|---|---|---|---|---|---|
| `douala_yassa_utm32n.json` | Littoral, Douala Yassa | UTM 32N | 980 m² | 980 m² | **CONFORME** (0.0% diff) |
| `douala_yassa_fraud_superficie.json` | Littoral, Douala Yassa | UTM 32N | 1,500 m² | 980 m² | **ALERTE FRAUDE** (+53.1% fictive) |
| `yaounde_odza_utm32n.json` | Centre, Yaoundé Odza | UTM 32N | 2,100 m² | 2,100 m² | **CONFORME** (5-beacon parcel) |
| `kribi_ocean_overlap_utm32n.json` | Sud, Kribi Mpalla | UTM 32N | 2,500 m² | — | **ANOMALIE** (Self-intersecting) |
| `garoua_utm33n.json` | Nord, Garoua Roumde | UTM 33N | 2,000 m² | 2,000 m² | **CONFORME** (UTM Zone 33N) |
