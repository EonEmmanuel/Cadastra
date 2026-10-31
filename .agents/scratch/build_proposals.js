const fs = require('fs');
const assets = JSON.parse(fs.readFileSync('.agents/scratch/assets.json', 'utf8'));

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Maison VAKÁA — Luxury Invoice Redesign Lab</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-canvas: #EFEBE5;
      --card-bg: #FAF8F5;
      --ink: #1D120A;
      --ink-muted: #6B5E55;
      --gold: #A66B2D;
      --gold-brass: #C59A45;
      --sand-card: #F4EFE9;
      --border-subtle: #E7DED0;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: var(--bg-canvas);
      color: var(--ink);
      padding: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* TOP BAR LAB CONTROLLER */
    .lab-header {
      position: sticky;
      top: 0;
      z-index: 100;
      width: 100%;
      background: #140C06;
      color: #FAF8F5;
      padding: 14px 24px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.25);
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .lab-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 22px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .lab-badge {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 10px;
      letter-spacing: 0.08em;
      background: #C59A45;
      color: #140C06;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 700;
    }
    .tabs-wrapper {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .tab-btn {
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      color: #FAF8F5;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tab-btn:hover {
      background: rgba(255,255,255,0.16);
    }
    .tab-btn.active {
      background: #FAF8F5;
      color: #140C06;
      border-color: #FAF8F5;
      font-weight: 700;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    }
    .tab-btn .badge-pill {
      font-size: 9px;
      padding: 2px 6px;
      border-radius: 12px;
      background: #A66B2D;
      color: #FFF;
    }
    .tab-btn.active .badge-pill {
      background: #140C06;
      color: #FAF8F5;
    }

    /* PREVIEW CONTAINER */
    .preview-stage {
      padding: 30px 20px;
      width: 100%;
      display: flex;
      justify-content: center;
    }

    /* SHEET A4 FORMAT */
    .a4-sheet {
      width: 210mm;
      min-height: 297mm;
      background: #FAF8F5;
      box-shadow: 0 16px 48px rgba(29, 18, 10, 0.16);
      border-radius: 4px;
      padding: 16mm 18mm;
      display: none;
      position: relative;
    }
    .a4-sheet.active {
      display: block;
      animation: fadeIn 0.25s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .serif-display { font-family: 'Cormorant Garamond', Georgia, serif; }
    .serif-playfair { font-family: 'Playfair Display', Georgia, serif; }
    .script-hand { font-family: 'Alex Brush', cursive; }

    /* ======================================================== */
    /* DESIGN 1: WARM CONTEMPORARY (POLISHED USER REFERENCE)    */
    /* ======================================================== */
    .d1-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 22px;
      padding-bottom: 18px;
      border-bottom: 1px solid var(--border-subtle);
    }
    .d1-brand {
      display: flex;
      flex-direction: column;
    }
    .d1-logo-img {
      height: 38px;
      object-fit: contain;
      align-self: flex-start;
    }
    .d1-tagline {
      font-size: 8.5px;
      font-weight: 700;
      letter-spacing: 0.26em;
      text-transform: uppercase;
      color: var(--gold);
      margin-top: 6px;
    }
    .d1-mission {
      font-size: 8.5px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--ink-muted);
      margin-top: 4px;
    }
    .d1-meta-block {
      text-align: right;
    }
    .d1-title {
      font-size: 32px;
      font-weight: 600;
      line-height: 1;
      letter-spacing: -0.02em;
      color: var(--ink);
    }
    .d1-sub-thank {
      font-size: 11px;
      color: var(--ink-muted);
      margin-top: 4px;
      max-width: 290px;
    }
    .d1-meta-grid {
      margin-top: 12px;
      display: inline-grid;
      grid-template-columns: auto auto;
      gap: 3px 16px;
      text-align: right;
      font-size: 11px;
    }
    .d1-meta-label { color: var(--ink-muted); font-weight: 500; }
    .d1-meta-val { font-weight: 700; color: var(--ink); }
    .status-badge {
      display: inline-block;
      padding: 1px 7px;
      border-radius: 4px;
      background: #E8F5E9;
      color: #2E7D32;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.05em;
    }

    .d1-cards-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 22px;
    }
    .d1-card {
      background: var(--sand-card);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 15px 18px;
    }
    .d1-card-label {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 6px;
    }
    .d1-card-name {
      font-size: 13px;
      font-weight: 700;
      color: var(--ink);
      margin-bottom: 3px;
    }
    .d1-card-text {
      font-size: 11px;
      color: var(--ink-muted);
      line-height: 1.5;
    }

    .d1-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 22px;
    }
    .d1-table thead th {
      background: var(--ink);
      color: #FAF8F5;
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      padding: 10px 12px;
      text-align: left;
    }
    .d1-table thead th:first-child { border-top-left-radius: 6px; }
    .d1-table thead th:last-child { border-top-right-radius: 6px; text-align: right; }
    .d1-table tbody td {
      padding: 12px 12px;
      border-bottom: 1px solid var(--border-subtle);
      font-size: 11px;
      vertical-align: middle;
    }
    .d1-prod-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .d1-thumb {
      width: 46px;
      height: 46px;
      border-radius: 6px;
      object-fit: cover;
      border: 1px solid var(--border-subtle);
      background: #FFF;
      flex-shrink: 0;
    }
    .d1-prod-title {
      font-weight: 700;
      font-size: 12px;
      color: var(--ink);
    }
    .d1-prod-sku {
      font-size: 9.5px;
      color: var(--gold);
      font-weight: 600;
      letter-spacing: 0.05em;
      margin-top: 1px;
    }
    .d1-prod-desc {
      font-size: 10.5px;
      color: var(--ink-muted);
      line-height: 1.4;
      max-width: 230px;
    }
    .d1-num-cell {
      text-align: center;
      font-weight: 600;
    }
    .d1-price-cell {
      text-align: right;
      font-weight: 700;
      color: var(--ink);
      font-size: 11.5px;
    }

    .d1-bottom-row {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 20px;
      align-items: flex-start;
      margin-bottom: 26px;
    }
    .d1-script-msg {
      font-size: 40px;
      color: var(--gold);
      line-height: 1;
      margin-bottom: 10px;
    }
    .d1-support-title {
      font-size: 10.5px;
      font-weight: 700;
      color: var(--ink);
      margin-bottom: 3px;
    }
    .d1-support-info {
      font-size: 10.5px;
      color: var(--ink-muted);
      line-height: 1.55;
    }
    .d1-support-info a {
      color: var(--ink);
      text-decoration: none;
      font-weight: 600;
    }

    .d1-totals-card {
      background: var(--sand-card);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 14px 18px;
    }
    .d1-total-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0;
      font-size: 11px;
      color: var(--ink-muted);
    }
    .d1-total-line.grand-total {
      margin-top: 8px;
      padding-top: 10px;
      border-top: 1.5px solid var(--ink);
      font-size: 14px;
      font-weight: 800;
      color: var(--ink);
    }
    .d1-total-line.grand-total .d1-total-val {
      font-size: 16px;
      color: var(--ink);
    }

    .d1-legal-footer {
      border-top: 1px solid var(--border-subtle);
      padding-top: 14px;
      text-align: center;
      font-size: 9px;
      color: #8C7B70;
      line-height: 1.55;
      letter-spacing: 0.02em;
    }
    .d1-legal-footer strong {
      color: var(--ink);
    }

    /* ======================================================== */
    /* DESIGN 2: PARISIAN HAUTE COUTURE (HERMÈS / CARTIER)      */
    /* ======================================================== */
    .d2-center-header {
      text-align: center;
      padding-bottom: 22px;
      margin-bottom: 22px;
      border-bottom: 2px solid #D4A43C;
      position: relative;
    }
    .d2-center-header::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 30%;
      right: 30%;
      height: 1px;
      background: var(--ink);
    }
    .d2-logo-img {
      height: 44px;
      object-fit: contain;
      margin-bottom: 6px;
    }
    .d2-ateliers {
      font-size: 8px;
      letter-spacing: 0.35em;
      text-transform: uppercase;
      color: var(--gold);
      font-weight: 700;
    }
    .d2-doc-title {
      font-size: 18px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--ink);
      margin-top: 10px;
      font-weight: 600;
    }
    .d2-split-meta {
      display: flex;
      justify-content: space-between;
      margin-bottom: 26px;
      font-size: 11px;
      padding: 0 6px;
    }
    .d2-meta-col h4 {
      font-size: 9px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 5px;
    }
    .d2-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 28px;
    }
    .d2-table th {
      font-size: 9px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--ink);
      border-bottom: 1.5px solid var(--ink);
      padding: 8px 6px;
      text-align: left;
    }
    .d2-table td {
      padding: 12px 6px;
      border-bottom: 1px solid #ECE4D8;
      font-size: 11px;
    }
    .d2-seal-wrapper {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .d2-seal-svg {
      width: 58px;
      height: 58px;
      flex-shrink: 0;
    }
    .d2-seal-text {
      font-size: 9.5px;
      color: var(--ink-muted);
      line-height: 1.45;
      font-style: italic;
    }

    /* ======================================================== */
    /* DESIGN 3: EDITORIAL MODERNIST (VOGUE ATELIER)            */
    /* ======================================================== */
    .d3-hero-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-bottom: 3px solid var(--ink);
      padding-bottom: 14px;
      margin-bottom: 22px;
    }
    .d3-big-masthead {
      font-size: 50px;
      font-weight: 700;
      letter-spacing: -0.03em;
      line-height: 0.9;
      color: var(--ink);
    }
    .d3-edition-badge {
      text-align: right;
      font-size: 10px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--gold);
    }
    .d3-grid-dossier {
      display: grid;
      grid-template-columns: 1fr 1fr;
      border-bottom: 1px solid var(--ink);
      padding-bottom: 18px;
      margin-bottom: 22px;
    }
    .d3-dossier-item {
      padding-right: 18px;
    }
    .d3-dossier-item:last-child {
      border-left: 1px solid var(--border-subtle);
      padding-left: 18px;
      padding-right: 0;
    }

    /* ======================================================== */
    /* DESIGN 4: ARTISANAL GOLD & EARTH ATELIER                 */
    /* ======================================================== */
    .d4-bordered-frame {
      border: 1px solid #C59A45;
      padding: 10mm 12mm;
      min-height: calc(297mm - 32mm);
      position: relative;
    }
    .d4-corner-flourish {
      position: absolute;
      width: 14px;
      height: 14px;
      border: 2px solid var(--ink);
    }
    .d4-tl { top: -2px; left: -2px; border-right: 0; border-bottom: 0; }
    .d4-tr { top: -2px; right: -2px; border-left: 0; border-bottom: 0; }
    .d4-bl { bottom: -2px; left: -2px; border-right: 0; border-top: 0; }
    .d4-br { bottom: -2px; right: -2px; border-left: 0; border-top: 0; }
  </style>
</head>
<body>

  <!-- LAB CONTROLLER TOP BAR -->
  <header class="lab-header">
    <div class="lab-title">
      <span>❖ MAISON VAKÁA</span>
      <span class="lab-badge">INVOICE LAB PREVIEWS</span>
    </div>
    <div class="tabs-wrapper">
      <button class="tab-btn active" onclick="showDesign('design1', this)">
        <span>Option 1: Warm Contemporary</span>
        <span class="badge-pill">Polished Version of Your Reference</span>
      </button>
      <button class="tab-btn" onclick="showDesign('design2', this)">
        <span>Option 2: Parisian Minimalist</span>
        <span class="badge-pill">Hermès / Cartier Style</span>
      </button>
      <button class="tab-btn" onclick="showDesign('design3', this)">
        <span>Option 3: Editorial Modernist</span>
        <span class="badge-pill">Céline / Vogue Style</span>
      </button>
      <button class="tab-btn" onclick="showDesign('design4', this)">
        <span>Option 4: Artisanal Gold Frame</span>
        <span class="badge-pill">African Heritage</span>
      </button>
    </div>
  </header>

  <main class="preview-stage">

    <!-- ============================================================== -->
    <!-- OPTION 1: WARM CONTEMPORARY (POLISHED USER REFERENCE)          -->
    <!-- ============================================================== -->
    <article id="design1" class="a4-sheet active">
      <!-- Header -->
      <header class="d1-header">
        <div class="d1-brand">
          <img src="${assets.logo}" alt="VAKÁA" class="d1-logo-img" />
          <div class="d1-tagline">MORE THAN A BAG, A CULTURE</div>
          <div class="d1-mission">Artisanal African Handcrafts for a Modern World</div>
        </div>
        <div class="d1-meta-block">
          <h1 class="d1-title serif-display">Invoice</h1>
          <p class="d1-sub-thank">Thank you for supporting African craftsmanship. Here is your order summary.</p>
          <div class="d1-meta-grid">
            <span class="d1-meta-label">Invoice No.</span>
            <span class="d1-meta-val">#VAK-2026-0847</span>
            <span class="d1-meta-label">Date Issued</span>
            <span class="d1-meta-val">April 26, 2026</span>
            <span class="d1-meta-label">Payment Status</span>
            <span class="d1-meta-val"><span class="status-badge">● Paid</span></span>
            <span class="d1-meta-label">Order Reference</span>
            <span class="d1-meta-val">AZE4E5BE44R18137</span>
          </div>
        </div>
      </header>

      <!-- Dual Cards (Client & Atelier Shipping) -->
      <section class="d1-cards-row">
        <div class="d1-card">
          <div class="d1-card-label">
            <span>👤 BILL TO / CLIENT</span>
          </div>
          <div class="d1-card-name">Eon Emmanuel Trésor</div>
          <div class="d1-card-text">
            Quartier Bonapriso, Rue des Palmiers<br />
            Douala, Cameroun<br />
            eon@example.com &bull; +237 6 99 46 63 81
          </div>
        </div>

        <div class="d1-card">
          <div class="d1-card-label">
            <span>📦 DELIVERY & PAYMENT</span>
          </div>
          <div class="d1-card-name">DHL Express &bull; Remise contre signature</div>
          <div class="d1-card-text">
            Mode de règlement : Mobile Money (Orange / MTN)<br />
            Réf. transaction : FLW-928471902<br />
            Atelier d'expédition : Bonapriso Leather Atelier
          </div>
        </div>
      </section>

      <!-- Product Table -->
      <table class="d1-table">
        <thead>
          <tr>
            <th style="width: 38%;">PRODUCT</th>
            <th style="width: 32%;">DESCRIPTION & CRAFT</th>
            <th style="width: 10%; text-align: center;">QTY</th>
            <th style="width: 20%; text-align: right;">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="d1-prod-cell">
                <img src="${assets.bag1}" alt="Sac Asa" class="d1-thumb" />
                <div>
                  <div class="d1-prod-title">Sac Bandoulière Asa</div>
                  <div class="d1-prod-sku">SKU: VAK-ASA-01</div>
                </div>
              </div>
            </td>
            <td>
              <div class="d1-prod-desc">Raphia naturel sauvage tissé main avec finitions en cuir pleine fleur ébène.</div>
            </td>
            <td class="d1-num-cell">1</td>
            <td class="d1-price-cell">75 000 XAF</td>
          </tr>
          <tr>
            <td>
              <div class="d1-prod-cell">
                <img src="${assets.bag2}" alt="Baguette Indigo" class="d1-thumb" />
                <div>
                  <div class="d1-prod-title">Baguette Indigo Savane</div>
                  <div class="d1-prod-sku">SKU: VAK-BAG-02</div>
                </div>
              </div>
            </td>
            <td>
              <div class="d1-prod-desc">Tissu artisanal indigo teinté cuve naturelle, boucle en laiton coulé artisanal.</div>
            </td>
            <td class="d1-num-cell">1</td>
            <td class="d1-price-cell">45 000 XAF</td>
          </tr>
          <tr>
            <td>
              <div class="d1-prod-cell">
                <img src="${assets.bag3}" alt="Porte-cartes Aya" class="d1-thumb" />
                <div>
                  <div class="d1-prod-title">Porte-cartes Aya</div>
                  <div class="d1-prod-sku">SKU: VAK-AYA-03</div>
                </div>
              </div>
            </td>
            <td>
              <div class="d1-prod-desc">Cuir à tannage végétal, tranches lissées à chaud et surpiqûres sellier.</div>
            </td>
            <td class="d1-num-cell">1</td>
            <td class="d1-price-cell">15 000 XAF</td>
          </tr>
        </tbody>
      </table>

      <!-- Bottom Row: Thanks & Totals -->
      <section class="d1-bottom-row">
        <div class="d1-thanks-block">
          <div class="d1-script-msg script-hand">Merci beaucoup !</div>
          <div class="d1-support-title">Questions sur votre commande ou entretien ?</div>
          <div class="d1-support-info">
            Notre conciergerie privée est à votre entière disposition :<br />
            ✉ <a href="mailto:concierge@vakaa.store">concierge@vakaa.store</a><br />
            ☎ +237 6 99 46 63 81 (WhatsApp Privilège)
          </div>
        </div>

        <div class="d1-totals-card">
          <div class="d1-total-line">
            <span>Sous-total articles</span>
            <span style="font-weight: 600; color: var(--ink);">135 000 XAF</span>
          </div>
          <div class="d1-total-line">
            <span>Livraison sécurisée DHL</span>
            <span style="font-weight: 600; color: var(--ink);">5 000 XAF</span>
          </div>
          <div class="d1-total-line">
            <span>TVA incluse (19.25%)</span>
            <span style="font-weight: 500;">22 536 XAF</span>
          </div>
          <div class="d1-total-line grand-total">
            <span>Total TTC</span>
            <span class="d1-total-val">140 000 XAF</span>
          </div>
        </div>
      </section>

      <!-- CLEAN LUXURY LEGAL FOOTER (NO WEBSITE NAVIGATION, NO SOCIAL BUTTONS) -->
      <footer class="d1-legal-footer">
        <strong>MAISON VAKÁA S.A.S.</strong> &bull; Haute Maroquinerie d'Art Africaine<br />
        Ateliers & Salons : Rue des Palmiers, Bonapriso, Douala &bull; Bureau International : 14 Rue de la Paix, Paris 75002<br />
        RC/DLA/2024/B/1842 &bull; N° Contribuable M05241892401 &bull; Document officiel tenant lieu de reçu fiscal et certificat d'acquisition
      </footer>
    </article>

    <!-- ============================================================== -->
    <!-- OPTION 2: PARISIAN HAUTE COUTURE (HERMÈS / CARTIER)            -->
    <!-- ============================================================== -->
    <article id="design2" class="a4-sheet">
      <header class="d2-center-header">
        <img src="${assets.logo}" alt="VAKÁA" class="d2-logo-img" /><br />
        <span class="d2-ateliers">PARIS &bull; DOUALA &bull; ABIDJAN</span>
        <div class="d2-doc-title serif-display">Titre d'Acquisition &bull; Facture N° 0847</div>
      </header>

      <section class="d2-split-meta">
        <div class="d2-meta-col">
          <h4>TITULAIRE DU COMPTE</h4>
          <strong>Monsieur Eon Emmanuel Trésor</strong><br />
          Bonapriso, Douala &bull; Cameroun<br />
          eon@example.com
        </div>
        <div class="d2-meta-col" style="text-align: right;">
          <h4>RÉFÉRENCES D'ATELIER</h4>
          Date : <strong>26 Avril 2026</strong><br />
          Dossier : <strong>AZE4E5BE44R18137</strong><br />
          Règlement : <strong>Acquitté en intégralité</strong>
        </div>
      </section>

      <table class="d2-table">
        <thead>
          <tr>
            <th style="width: 60%;">DÉSIGNATION DE L'OUVRAGE</th>
            <th style="width: 15%; text-align: center;">UNITÉS</th>
            <th style="width: 25%; text-align: right;">MONTANT</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong class="serif-display" style="font-size: 14px;">Sac Bandoulière Asa</strong><br />
              <span style="font-size: 9.5px; color: #7A685D;">Raphia naturel des forêts équatoriales & cuir chocolat</span>
            </td>
            <td style="text-align: center;">1</td>
            <td style="text-align: right; font-weight: 700;">75 000 XAF</td>
          </tr>
          <tr>
            <td>
              <strong class="serif-display" style="font-size: 14px;">Baguette Indigo Savane</strong><br />
              <span style="font-size: 9.5px; color: #7A685D;">Teinture végétale indigo & boucle laiton patinée</span>
            </td>
            <td style="text-align: center;">1</td>
            <td style="text-align: right; font-weight: 700;">45 000 XAF</td>
          </tr>
          <tr>
            <td>
              <strong class="serif-display" style="font-size: 14px;">Porte-cartes Aya</strong><br />
              <span style="font-size: 9.5px; color: #7A685D;">Maroquinerie fine, couture sellier main</span>
            </td>
            <td style="text-align: center;">1</td>
            <td style="text-align: right; font-weight: 700;">15 000 XAF</td>
          </tr>
        </tbody>
      </table>

      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 36px;">
        <div class="d2-seal-wrapper">
          <svg class="d2-seal-svg" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="#D4A43C" stroke-width="1.5" stroke-dasharray="3 2" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#1D120A" stroke-width="1" />
            <path d="M50 22 L55 35 L68 35 L57 44 L61 57 L50 49 L39 57 L43 44 L32 35 L45 35 Z" fill="#D4A43C" />
            <text x="50" y="72" text-anchor="middle" font-family="'Cormorant Garamond', serif" font-size="8" font-weight="700" letter-spacing="2" fill="#1D120A">VAKÁA ATELIER</text>
            <text x="50" y="80" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="5" font-weight="600" letter-spacing="1" fill="#A66B2D">AUTHENTICITÉ</text>
          </svg>
          <div class="d2-seal-text">
            Ouvrages confectionnés à la main selon les règles de l'artisanat d'excellence.<br />
            Chaque pièce est unique et protégée par notre garantie d'atelier.
          </div>
        </div>

        <div style="width: 240px; text-align: right;">
          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px; color: #6B5E55;">
            <span>Sous-total</span>
            <span style="font-weight: 600; color: #1D120A;">135 000 XAF</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 10px; color: #6B5E55;">
            <span>Livraison Spéciale</span>
            <span style="font-weight: 600; color: #1D120A;">5 000 XAF</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; border-top: 1px solid #1D120A; padding-top: 10px; color: #1D120A;">
            <span>Total Général</span>
            <span>140 000 XAF</span>
          </div>
        </div>
      </div>

      <footer style="border-top: 1px solid #EFE9E1; padding-top: 16px; text-align: center; font-size: 8.5px; color: #8C7B70; letter-spacing: 0.1em; text-transform: uppercase;">
        Maison VAKÁA &bull; Société par Actions Simplifiée &bull; Ateliers Paris &bull; Douala &bull; www.vakaa.store
      </footer>
    </article>

    <!-- ============================================================== -->
    <!-- OPTION 3: EDITORIAL MODERNIST (VOGUE RUNWAY / CÉLINE)          -->
    <!-- ============================================================== -->
    <article id="design3" class="a4-sheet">
      <div class="d3-hero-row">
        <div>
          <div style="font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold); font-weight: 700; margin-bottom: 4px;">CATALOGUE & ACQUISITION</div>
          <div class="d3-big-masthead serif-display">VAKÁA</div>
        </div>
        <div class="d3-edition-badge">
          <div>DOCUMENT N° 0847</div>
          <div style="color: var(--ink); font-size: 13px; font-weight: 800; margin-top: 2px;">26 . 04 . 2026</div>
        </div>
      </div>

      <div class="d3-grid-dossier">
        <div class="d3-dossier-item">
          <div style="font-size: 9px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 6px; color: var(--gold);">DOSSIER CLIENT</div>
          <strong style="font-size: 13px;">Eon Emmanuel Trésor</strong><br />
          <span style="font-size: 11px; color: var(--ink-muted);">Douala, Cameroun &bull; eon@example.com</span>
        </div>
        <div class="d3-dossier-item">
          <div style="font-size: 9px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 6px; color: var(--gold);">DOSSIER EXPÉDITION</div>
          <strong style="font-size: 13px;">DHL Worldwide Express Priority</strong><br />
          <span style="font-size: 11px; color: var(--ink-muted);">Règlement validé Mobile Money &bull; Ref: AZE4E5BE44R18137</span>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
        <thead>
          <tr style="border-bottom: 2px solid var(--ink);">
            <th style="text-align: left; padding: 8px 0; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase;">PIÈCES D'ARTISANAT</th>
            <th style="text-align: center; padding: 8px 0; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase;">QTE</th>
            <th style="text-align: right; padding: 8px 0; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase;">TOTAL (XAF)</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #E7DED0;">
            <td style="padding: 14px 0;">
              <div style="display: flex; gap: 14px; align-items: center;">
                <img src="${assets.bag1}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />
                <div>
                  <strong style="font-size: 13px;">01 / Sac Bandoulière Asa</strong><br />
                  <span style="font-size: 10px; color: var(--ink-muted);">Matières : Raphia sauvage & Cuir tanné végétal</span>
                </div>
              </div>
            </td>
            <td style="text-align: center; font-weight: 600;">1</td>
            <td style="text-align: right; font-weight: 800; font-size: 13px;">75 000</td>
          </tr>
          <tr style="border-bottom: 1px solid #E7DED0;">
            <td style="padding: 14px 0;">
              <div style="display: flex; gap: 14px; align-items: center;">
                <img src="${assets.bag2}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />
                <div>
                  <strong style="font-size: 13px;">02 / Baguette Indigo Savane</strong><br />
                  <span style="font-size: 10px; color: var(--ink-muted);">Matières : Toile indigo artisanale & Laiton patiné</span>
                </div>
              </div>
            </td>
            <td style="text-align: center; font-weight: 600;">1</td>
            <td style="text-align: right; font-weight: 800; font-size: 13px;">45 000</td>
          </tr>
          <tr style="border-bottom: 1px solid #E7DED0;">
            <td style="padding: 14px 0;">
              <div style="display: flex; gap: 14px; align-items: center;">
                <img src="${assets.bag3}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />
                <div>
                  <strong style="font-size: 13px;">03 / Porte-cartes Aya</strong><br />
                  <span style="font-size: 10px; color: var(--ink-muted);">Matières : Cuir véritable, surpiqûres sellier</span>
                </div>
              </div>
            </td>
            <td style="text-align: center; font-weight: 600;">1</td>
            <td style="text-align: right; font-weight: 800; font-size: 13px;">15 000</td>
          </tr>
        </tbody>
      </table>

      <div style="display: flex; justify-content: flex-end; margin-bottom: 30px;">
        <div style="width: 260px;">
          <div style="display: flex; justify-content: space-between; font-size: 11px; padding: 4px 0; color: var(--ink-muted);">
            <span>Sous-total HT</span>
            <span>135 000 XAF</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; padding: 4px 0; color: var(--ink-muted);">
            <span>Expédition Express</span>
            <span>5 000 XAF</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 800; border-top: 2px solid var(--ink); border-bottom: 2px solid var(--ink); padding: 8px 0; margin-top: 8px;">
            <span>TOTAL TTC</span>
            <span>140 000 XAF</span>
          </div>
        </div>
      </div>

      <footer style="font-size: 9px; color: #8C7B70; text-align: center; border-top: 1px solid var(--border-subtle); padding-top: 14px;">
        Maison VAKÁA &bull; Créations de haute maroquinerie africaine &bull; Douala &bull; Paris &bull; concierge@vakaa.store
      </footer>
    </article>

    <!-- ============================================================== -->
    <!-- OPTION 4: ARTISANAL GOLD & EARTH ATELIER                       -->
    <!-- ============================================================== -->
    <article id="design4" class="a4-sheet">
      <div class="d4-bordered-frame">
        <div class="d4-corner-flourish d4-tl"></div>
        <div class="d4-corner-flourish d4-tr"></div>
        <div class="d4-corner-flourish d4-bl"></div>
        <div class="d4-corner-flourish d4-br"></div>

        <div style="text-align: center; margin-bottom: 24px;">
          <img src="${assets.logo}" style="height: 44px;" /><br />
          <div style="font-size: 8.5px; letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold-brass); font-weight: 700; margin-top: 6px;">BORDEREAU D'ACQUISITION OFFICIEL</div>
          <div style="font-size: 11px; color: var(--ink-muted); font-style: italic; margin-top: 2px;">Ateliers de maroquinerie d'art d'Afrique Centrale</div>
        </div>

        <div style="display: flex; justify-content: space-between; border-top: 1px solid #D4A43C; border-bottom: 1px solid #D4A43C; padding: 10px 0; margin-bottom: 20px; font-size: 11px;">
          <div>
            <span style="color: var(--gold); font-weight: 700;">CLIENT :</span> Eon Emmanuel Trésor &bull; Douala
          </div>
          <div>
            <span style="color: var(--gold); font-weight: 700;">FACTURE :</span> VAK-2026-0847 &bull; 26/04/2026
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr style="background: #F4EFE9;">
              <th style="padding: 8px; text-align: left; font-size: 9.5px; color: var(--ink);">PIÈCE D'ATELIER</th>
              <th style="padding: 8px; text-align: center; font-size: 9.5px; color: var(--ink);">SKU</th>
              <th style="padding: 8px; text-align: center; font-size: 9.5px; color: var(--ink);">QTE</th>
              <th style="padding: 8px; text-align: right; font-size: 9.5px; color: var(--ink);">MONTANT</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px dashed #D4A43C;">
              <td style="padding: 10px 8px;"><strong>Sac Bandoulière Asa</strong> (Raphia & Cuir ébène)</td>
              <td style="text-align: center; font-size: 10px; color: var(--gold); font-weight: 600;">VAK-ASA-01</td>
              <td style="text-align: center;">1</td>
              <td style="text-align: right; font-weight: 700;">75 000 XAF</td>
            </tr>
            <tr style="border-bottom: 1px dashed #D4A43C;">
              <td style="padding: 10px 8px;"><strong>Baguette Indigo Savane</strong> (Indigo & Laiton)</td>
              <td style="text-align: center; font-size: 10px; color: var(--gold); font-weight: 600;">VAK-BAG-02</td>
              <td style="text-align: center;">1</td>
              <td style="text-align: right; font-weight: 700;">45 000 XAF</td>
            </tr>
            <tr style="border-bottom: 1px dashed #D4A43C;">
              <td style="padding: 10px 8px;"><strong>Porte-cartes Aya</strong> (Cuir sellier)</td>
              <td style="text-align: center; font-size: 10px; color: var(--gold); font-weight: 600;">VAK-AYA-03</td>
              <td style="text-align: center;">1</td>
              <td style="text-align: right; font-weight: 700;">15 000 XAF</td>
            </tr>
          </tbody>
        </table>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
          <div style="font-size: 32px; color: var(--gold);" class="script-hand">Merci infiniment</div>
          <div style="text-align: right;">
            <div style="font-size: 11px; color: var(--ink-muted);">Total Articles : 135 000 XAF</div>
            <div style="font-size: 11px; color: var(--ink-muted);">Livraison Express : 5 000 XAF</div>
            <div style="font-size: 16px; font-weight: 800; color: #1D120A; margin-top: 4px;">TOTAL : 140 000 XAF</div>
          </div>
        </div>

        <div style="margin-top: 28px; border-top: 1px solid #E7DED0; padding-top: 12px; font-size: 8.5px; color: #8C7B70; text-align: center;">
          Certifié conforme par les Ateliers Maison VAKÁA &bull; Douala &bull; Paris &bull; Document fiscal officiel
        </div>
      </div>
    </article>

  </main>

  <script>
    function showDesign(id, btn) {
      document.querySelectorAll('.a4-sheet').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
      document.getElementById(id).classList.add('active');
      btn.classList.add('active');
    }
  </script>
</body>
</html>`;

fs.writeFileSync('C:/Users/EonEmmanuel/.gemini/antigravity/brain/02246bef-2726-42e2-b8ea-46b18aaa9cc7/vakaa_invoice_interactive_proposals.html', htmlContent);
console.log('Interactive HTML created successfully!');
