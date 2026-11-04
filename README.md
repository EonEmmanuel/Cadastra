# Cadastra-Cameroon

### Autonomous Cadastral Verification & Geodetic Land Fraud Detection Engine
**Meta Global AI Developer Hackathon 2026**

---

## 1. Executive Summary & Problem Statement

In Cameroon, land tenure disputes and fraud represent over **65% of civil court dockets** according to MINDCAF (*Ministère du Cadastre et des Affaires Foncières*). Buyers, banks, and citizens routinely fall victim to three critical failure modes:

1. **"Superficie Fictive" (Phantom Land Inflation):** Paper survey plans (*Plans de Bornage*) state inflated plot sizes (e.g., claiming 1,500 m² for an actual 980 m² lot) to artificially inflate bank collateral, maximize compensation, or scam diaspora buyers.
2. **Topological Defects & Self-Intersections:** Overlapping parcel boundaries, inverted Easting/Northing coordinates, or bow-tie (figure-eight) polygons that fail to close mathematically.
3. **UTM Projection Misalignments:** Coordinate confusion between UTM Zone 32N (`EPSG:32632`, Western and Central Cameroon) and UTM Zone 33N (`EPSG:32633`, Northern and Eastern Cameroon).

**Cadastra-Cameroon** is an autonomous forensic cadastral audit engine built for Cameroonian surveyors, notaries, land buyers, and administrative reviewers. It combines Meta AI models with deterministic geodetic geometry to provide mathematical certainty and legal clarity in seconds.

---

## 2. How Meta AI Powers Cadastra

Cadastra integrates three core Meta technologies into an end-to-end verification pipeline:

| Meta Technology | Role in Cadastra-Cameroon |
|---|---|
| **Meta SAM 3.1** | Segment Anything Model segments and isolates the boundary beacon coordinate table (*cartouche de bornage*) from noisy, folded, or hand-stamped paper surveys. |
| **Meta Muse Spark / LLaMA** | 1. Direct structured extraction of boundary coordinates ($B_1 \dots B_n$, $X$, $Y$, stated area, title number).<br>2. Dynamic free-form legal and geodetic reasoning in English and French, citing Decree 76-165, Civil Code Art. 1616–1622, and Penal Code Art. 316. |
| **Meta WhatsApp Cloud API** | An automated webhook bot allowing citizens and diaspora buyers in the field to submit coordinates or upload plan images via WhatsApp to receive instant audit verdicts and certified PDF reports. |

---

## 3. System Architecture

```
[Paper Cadastral Survey Plan / Photo / PDF]
                   │
                   ▼
       ┌────────────────────────┐
       │      Meta SAM 3.1      │ ──► Isolates Beacon Table Region-of-Interest (ROI)
       └────────────────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │   Meta Muse Spark AI   │ ──► Extracts Coordinates (B1..Bn, X, Y, Stated Area)
       └────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ FastAPI Geodetic Engine (PyProj + Shapely)                             │
│ • Coordinate Transformation: UTM 32N / 33N ➔ WGS84 (EPSG:4326)        │
│ • Gauss-Shoelace Metric Area Integration (m²)                          │
│ • Perimeter Closure Verification (Sub-centimeter return tolerance)     │
│ • Topological Self-Intersection & Boundary Crossing Detection          │
│ • MINDCAF 1.0% Statutory Tolerance & Fraud Evaluation                  │
│ • SHA-256 Anti-Tamper Cryptographic Audit Seal                         │
└────────────────────────────────────────────────────────────────────────┘
       │                                              │
       ▼                                              ▼
┌────────────────────────────────┐     ┌─────────────────────────────────┐
│ Next.js 15 Web Application     │     │ WhatsApp Cloud API Webhook Bot  │
│ • Satellite Map & Beacon Pins  │     │ • Mobile Citizen Verification   │
│ • Interactive AI Q&A Analyst   │     │ • Instant WhatsApp Chat Reports │
│ • Official Bilingual PDF Export│     │ • Push Official PDF Certificate │
└────────────────────────────────┘     └─────────────────────────────────┘
```

---

## 4. Key Capabilities

### A. Mathematical Geodetic Engine
- **Gauss-Shoelace Integration:** Computes true enclosed metric area directly from projected UTM coordinates ($X, Y$) on the legal Clarke 1880 / WGS84 reference ellipsoid.
- **Topological Integrity:** Detects open boundary loops where the final beacon fails to reconnect with the initial beacon, as well as self-intersecting polygon boundaries.
- **MINDCAF Regulatory Tolerance:** Automatically validates plot integrity against the official 1.0% Cameroon legal tolerance (Decree No. 76-165 of 27 April 1976).

### B. Free-Form Interactive AI Forensic Analyst
- Powered by Meta AI with seamless deterministic fallback.
- Answers **any free-form question** in English or French (e.g., land subdivision rules, boundary disputes, building permits, price negotiations, or neighbor encroachment).
- Grounded in Cameroon statutory frameworks (Decree 76-165, Law 80-21 on the Order of Surveyors, Civil Code Art. 1616–1622 on acreage deficit guarantees, and Penal Code Art. 316 on fictitious property claims).

### C. Official Bilingual PDF Audit Certificates
- Generates official bilingual (English / French) cadastral audit certificates via ReportLab.
- Features complete beacon schedules, discrepancy metrics, compliance status, legal warnings, and an immutable SHA-256 cryptographic seal.
- Direct instant browser download (`Download` / `Téléchargement`) with strict wrap-resistant formatting.

### D. Dark Geodetic Instrument Visual Language
- Clean, focused interface built following strict cadastral instrument principles: Base `#060709`, Surface `#0B0E14`, Elevated `#10141D`, and Emerald Accent `#00DF8F`.
- Free of generic AI slop: zero decorative glow gradients, zero `Sparkles` icons, no rounded-full pill tags, and full responsiveness across desktop and mobile viewports.

---

## 5. Judge's Evaluation Walkthrough

Follow these simple steps to evaluate the full application locally:

### Step 1: Clone and Set Up Dependencies

```bash
# Clone the repository
git clone https://github.com/EonEmmanuel/Cadastra-Cameroon.git
cd Cadastra-Cameroon
```

### Step 2: Run the Backend Automated Test Suite
The backend contains 42 comprehensive tests covering geodetic math, UTM conversions, fraud detection, and API endpoints:

```bash
$env:PYTHONPATH="backend"
backend\.venv\Scripts\pytest -v
```
*(Expected: **42 passed, 0 failed**)*

### Step 3: Start the Backend Server (Port 8000)

```bash
backend\.venv\Scripts\uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
- Interactive API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

### Step 4: Start the Frontend Application (Port 3000)

In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Step 5: Test Key Scenarios in the UI

1. **Test a Ground-Truth Fraud Scenario:**
   - On the homepage, click **"Parcourir les jeux de données"** (or use the navigation bar to go to **Données / Datasets**).
   - Click on the profile **"Douala Yassa (Fraude Superficie)"**.
   - Observe the satellite map render with red boundary vectors and the risk badge: **ALERTE FRAUDE (+53.1% fictive)**.
2. **Download the Official Audit Certificate:**
   - In the right-hand panel, click the primary button: **"Download"** (or **"Téléchargement"** in French).
   - The verified PDF certificate will immediately download with complete calculations and SHA-256 seal.
3. **Ask the AI Forensic Analyst:**
   - Click the **"Analyste IA"** / **"AI Analyst"** tab.
   - Click any suggested prompt or type any custom question into the chat input, for example:
     - *"What are the legal remedies under Cameroon law for this 53% gap?"*
     - *"Can I negotiate the price down based on this discrepancy?"*
     - *"What happens if a neighbor moves beacon B2 at night?"*
   - Observe the immediate, tailored answer referencing Cameroonian statutes.
4. **Switch Languages:**
   - Use the **EN / FR** toggle in the top navigation bar to test complete bilingual parity across the entire application.

---

## 6. Project Structure

```
Hackerton-Project/
├── backend/
│   ├── .venv/                     # Python 3.12 virtual environment
│   ├── engine.py                  # PyProj & Shapely geodetic math engine
│   ├── main.py                    # FastAPI application (REST, AI Q&A, PDF generator)
│   ├── pdf_report.py              # ReportLab bilingual cadastral certificate generator
│   ├── requirements.txt           # Python backend dependencies
│   ├── schemas.py                 # Pydantic v2 validation models
│   └── tests/                     # 42 Pytest unit and integration tests
│       ├── test_api.py            # API routes and validation tests
│       ├── test_engine.py         # UTM projections and Gauss-Shoelace calculations
│       ├── test_fraud_detection.py# Superficie fictive and tolerance checks
│       └── test_sam.py            # SAM segmentation mock and fallback tests
├── frontend/
│   ├── src/
│   │   ├── app/                   # Next.js 15 App Router (layout, page, icon, api routes)
│   │   ├── components/
│   │   │   ├── CadastralSatelliteMap.tsx # Leaflet satellite viewport and boundary pins
│   │   │   ├── ForensicDossierPanel.tsx  # Dynamic verdict card, AI Q&A, and PDF export
│   │   │   ├── LandingHero.tsx           # Interactive audit composer and benchmarks
│   │   │   ├── Navbar.tsx                # Geodetic top bar with EN/FR language toggle
│   │   │   └── workspaces/               # Secondary tabs: Investigations, Reports, Datasets, AI
│   │   ├── i18n/                  # Complete English/French translation dictionary
│   │   └── utils/                 # API client with automatic same-origin proxy
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── test_data/                     # Official Cameroon test profiles
│   ├── douala_yassa_utm32n.json   # Compliant Littoral parcel (980 m²)
│   ├── douala_yassa_fraud_superficie.json # Fraud profile (claimed 1,500 m² vs actual 980 m²)
│   ├── yaounde_odza_utm32n.json   # Compliant Centre parcel (2,100 m², 5 beacons)
│   ├── kribi_ocean_overlap_utm32n.json    # Self-intersecting bow-tie boundary
│   └── garoua_utm33n.json         # Compliant Northern parcel (UTM Zone 33N, 2,000 m²)
├── AGENTS.md                      # Persistent design system and anti-slop rules
├── DESIGN.md                      # Cadastral audit instrument visual guidelines
└── README.md
```

---

## 7. REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/verify` | Core geodetic calculation, UTM 32N/33N projection, tolerance audit, and fraud detection. |
| `POST` | `/api/ai/qa` | Interactive cadastral forensic AI Q&A powered by Meta AI with deterministic fallback. |
| `GET` / `POST` | `/api/report/pdf` | Generates and streams official bilingual PDF audit certificates. |
| `POST` | `/api/extract` | Segments paper survey plan images and extracts structured coordinate tables via Meta AI. |
| `POST` | `/api/webhook/whatsapp` | Webhook for Meta WhatsApp Cloud API mobile citizen verification. |
| `GET` | `/api/profiles` | Returns available Cameroon ground-truth benchmark parcel profiles. |
| `GET` | `/health` | Service health status and runtime telemetry. |

---

## 8. Benchmark Cadastral Test Datasets

| Dataset | Locality & Region | UTM Zone | Stated Area | True Area | Verdict |
|---|---|---|---|---|---|
| `douala_yassa_utm32n.json` | Douala Yassa, Littoral | UTM 32N | 980.0 m² | 980.0 m² | **CONFORME** (0.0% gap, Low Risk) |
| `douala_yassa_fraud_superficie.json` | Douala Yassa, Littoral | UTM 32N | 1,500.0 m² | 980.0 m² | **FRAUDE CRITIQUE** (+53.1% fictitious area) |
| `yaounde_odza_utm32n.json` | Yaoundé Odza, Centre | UTM 32N | 2,100.0 m² | 2,100.0 m² | **CONFORME** (5-beacon closed boundary) |
| `kribi_ocean_overlap_utm32n.json` | Kribi Mpalla, Sud | UTM 32N | 2,500.0 m² | 0.0 m² | **ANOMALIE** (Self-intersecting figure-8) |
| `garoua_utm33n.json` | Garoua Roumde, Nord | UTM 33N | 2,000.0 m² | 2,000.0 m² | **CONFORME** (UTM 33N legal projection) |

---

## 9. Statutory Legal Foundations

Cadastra-Cameroon directly encodes and enforces the following statutory instruments:

- **Ordonnance n° 74-1 du 6 juillet 1974:** Regulates land tenure in Cameroon and establishes the legal requirement for accurate physical demarcation.
- **Décret n° 76-165 du 27 avril 1976:** Defines cadastral boundary procedures, beacon installation norms, and the official 1.0% allowable measurement tolerance.
- **Loi n° 80-21 du 14 juillet 1980:** Establishes the Order of Surveyors (*Ordre des Géomètres du Cameroun - OGEC*) and regulates surveyor licensing.
- **Code Civil Camerounais (Articles 1616–1622):** Sets buyer guarantees against land size deficits (*déficit de contenance*) and grants legal right to price reduction or sale cancellation for gaps exceeding 5%.
- **Code Pénal Camerounais (Articles 316 & 318):** Penalizes fraudulent displacement of cadastral beacons and deceptive sales of non-existent land acreage.
