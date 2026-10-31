const fs = require('fs');
const assets = JSON.parse(fs.readFileSync('.agents/scratch/assets.json', 'utf8'));
const artifactDir = 'C:/Users/EonEmmanuel/.gemini/antigravity/brain/02246bef-2726-42e2-b8ea-46b18aaa9cc7';

const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Maison VAKÁA — Comparatif Option 1 : Originale vs Raffinée</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cinzel:wght@600;700;800;900&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,600;0,700;0,800;0,900;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #140F0B;
      --paper: #FAF8F5;
      --card-bg: #F4EFE9;
      --card-border: #E4DBD0;
      --ink: #110B07;
      --ink-sec: #4A3C33;
      --ink-muted: #6B5E55;
      --gold: #9E642A;
      --gold-deep: #84511E;
      --border: #E5DDD0;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: var(--bg);
      color: #FAF8F5;
      padding: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* TOP COMPARISON BAR */
    .comp-bar {
      position: sticky;
      top: 0;
      z-index: 1000;
      width: 100%;
      background: rgba(20, 15, 11, 0.95);
      backdrop-filter: blur(14px);
      border-bottom: 1px solid rgba(255,255,255,0.12);
      padding: 12px 24px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .comp-title {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .comp-badge {
      font-size: 10px;
      background: #C59A45;
      color: #110B07;
      padding: 2px 7px;
      border-radius: 4px;
      font-weight: 800;
    }

    .view-toggles {
      display: flex;
      gap: 8px;
    }
    .view-btn {
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.18);
      color: #FAF8F5;
      padding: 7px 16px;
      border-radius: 6px;
      font-size: 11.5px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
    }
    .view-btn:hover {
      background: rgba(255,255,255,0.16);
    }
    .view-btn.active {
      background: #FAF8F5;
      color: #110B07;
      font-weight: 800;
      border-color: #FAF8F5;
      box-shadow: 0 4px 14px rgba(0,0,0,0.3);
    }

    .tools-cluster {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .tool-btn {
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.18);
      color: #FAF8F5;
      padding: 6px 10px;
      border-radius: 5px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
    }
    .tool-btn:hover { background: rgba(255,255,255,0.18); }

    /* PREVIEW CONTAINER */
    .preview-stage {
      padding: 30px 15px 80px;
      width: 100%;
      display: flex;
      justify-content: center;
      overflow-x: auto;
    }
    .scaler {
      transform-origin: top center;
      transition: transform 0.2s ease-out;
    }

    /* A4 SHEET */
    .sheet {
      width: 210mm;
      min-height: 297mm;
      background: #FAF8F5;
      color: #110B07;
      box-shadow: 0 24px 60px rgba(0,0,0,0.5);
      border-radius: 2px;
      padding: 16mm 18mm;
      box-sizing: border-box;
      display: none;
      position: relative;
    }
    .sheet.active {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      animation: fadeIn 0.2s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* TYPOGRAPHY */
    .font-cormorant { font-family: 'Cormorant Garamond', Georgia, serif; }
    .font-playfair { font-family: 'Playfair Display', Georgia, serif; }
    .font-cinzel { font-family: 'Cinzel', Georgia, serif; }
    .script-hand { font-family: 'Alex Brush', cursive; }
    .mono { font-family: 'Space Grotesk', monospace; }

    /* ======================================================== */
    /* STYLES : REFINED OPTION (STRONGER FONTS & CLEAN LAYOUT)  */
    /* ======================================================== */
    .r-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 20px;
      border-bottom: 2px solid #E5DDD0;
      margin-bottom: 22px;
    }
    .r-logo { height: 44px; object-fit: contain; }
    .r-motto {
      font-size: 8.5px;
      font-weight: 800;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: #9E642A;
      margin-top: 8px;
    }
    .r-submotto {
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #4A3C33;
      margin-top: 3px;
    }

    .r-title {
      font-size: 40px;
      font-weight: 800;
      line-height: 0.95;
      letter-spacing: -0.01em;
      color: #110B07;
      text-transform: uppercase;
    }
    .r-badge {
      display: inline-block;
      margin-top: 8px;
      background: #F4EFE9;
      border: 1.5px solid #E4DBD0;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 800;
      color: #110B07;
      letter-spacing: 0.05em;
    }
    .r-meta-grid {
      margin-top: 10px;
      display: inline-grid;
      grid-template-columns: auto auto;
      gap: 4px 16px;
      text-align: right;
      font-size: 11px;
    }
    .r-meta-label {
      color: #6B5E55;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 9.5px;
      letter-spacing: 0.08em;
    }
    .r-meta-val {
      font-weight: 800;
      color: #110B07;
    }
    .r-status {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: #E8F5E9;
      color: #1B5E20;
      border: 1px solid #C8E6C9;
      font-size: 9.5px;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 4px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .r-cards-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    .r-card {
      background: #F4EFE9;
      border: 1.5px solid #E4DBD0;
      border-radius: 8px;
      padding: 16px 18px;
    }
    .r-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 1px solid rgba(0,0,0,0.06);
    }
    .r-card-label {
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #9E642A;
    }
    .r-card-name {
      font-size: 14px;
      font-weight: 800;
      color: #110B07;
      margin-bottom: 4px;
    }
    .r-card-text {
      font-size: 11px;
      color: #4A3C33;
      line-height: 1.55;
      font-weight: 500;
    }

    .r-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin-bottom: 24px;
      border: 1.5px solid #110B07;
      border-radius: 8px;
      overflow: hidden;
    }
    .r-table thead th {
      background: #110B07;
      color: #FAF8F5;
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      padding: 12px 14px;
      text-align: left;
    }
    .r-table tbody td {
      padding: 14px 14px;
      border-bottom: 1px solid #E5DDD0;
      background: #FAF8F5;
      font-size: 11px;
      vertical-align: middle;
    }
    .r-table tbody tr:last-child td { border-bottom: none; }
    .r-thumb {
      width: 52px;
      height: 52px;
      border-radius: 6px;
      object-fit: cover;
      border: 1px solid #E4DBD0;
      box-shadow: 0 2px 6px rgba(0,0,0,0.06);
      flex-shrink: 0;
    }
    .r-prod-name { font-size: 13.5px; font-weight: 800; color: #110B07; }
    .r-prod-sku { font-size: 10px; font-weight: 800; color: #84511E; margin-top: 2px; }
    .r-prod-desc { font-size: 10.5px; color: #4A3C33; line-height: 1.45; font-weight: 500; max-width: 250px; }
    .r-price { font-size: 12px; font-weight: 600; color: #4A3C33; text-align: right; }
    .r-total { font-size: 13px; font-weight: 800; color: #110B07; text-align: right; }

    .r-bottom-grid {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 20px;
      align-items: flex-start;
      margin-bottom: 24px;
    }
    .r-concierge {
      background: #F4EFE9;
      border: 1.5px solid #E4DBD0;
      border-radius: 8px;
      padding: 16px 18px;
    }
    .r-script {
      font-family: 'Alex Brush', cursive;
      font-size: 42px;
      color: #9E642A;
      line-height: 1;
      margin-bottom: 8px;
    }
    .r-totals-box {
      background: #F4EFE9;
      border: 1.5px solid #E4DBD0;
      border-radius: 8px;
      padding: 16px 18px;
    }
    .r-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 5px 0;
      font-size: 11.5px;
      color: #4A3C33;
      font-weight: 600;
    }
    .r-grand {
      margin-top: 10px;
      padding-top: 12px;
      border-top: 2px solid #110B07;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .r-grand-title {
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #110B07;
    }
    .r-grand-val {
      font-size: 20px;
      font-weight: 900;
      color: #110B07;
      letter-spacing: -0.01em;
    }

    .r-footer {
      border-top: 2px solid #E5DDD0;
      padding-top: 16px;
      text-align: center;
      font-size: 9.5px;
      color: #6B5E55;
      line-height: 1.6;
    }

    /* ======================================================== */
    /* STYLES : ORIGINAL OPTION 1                               */
    /* ======================================================== */
    .orig-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 22px; padding-bottom: 18px; border-bottom: 1px solid #E7DED0; }
    .orig-title { font-size: 34px; font-weight: 600; color: #1D120A; line-height: 1; }
    .orig-card { background: #F4EFE9; border: 1px solid #E7DED0; border-radius: 8px; padding: 14px 16px; }
    .orig-table { width: 100%; border-collapse: collapse; margin-bottom: 22px; }
    .orig-table thead th { background: #1D120A; color: #FAF8F5; font-size: 9px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; padding: 10px 12px; text-align: left; }
    .orig-table tbody td { padding: 12px 12px; border-bottom: 1px solid #E7DED0; font-size: 11px; }

    @media print {
      body { background: transparent !important; padding: 0 !important; }
      .comp-bar { display: none !important; }
      .preview-stage { padding: 0 !important; }
      .scaler { transform: none !important; }
      .sheet { box-shadow: none !important; width: 100% !important; min-height: 100% !important; padding: 12mm 14mm !important; }
      .sheet:not(.active) { display: none !important; }
    }
  </style>
</head>
<body>

  <!-- TOP BAR COMPARISON CONTROL -->
  <header class="comp-bar">
    <div class="comp-title">
      <span>MAISON VAKÁA</span>
      <span class="comp-badge">COMPARATIF DESIGN</span>
    </div>

    <div class="view-toggles">
      <button class="view-btn active" onclick="switchView('view-refined-playfair', this)">
        <span>✨ Option 1 Raffinée (Playfair Display 800)</span>
      </button>
      <button class="view-btn" onclick="switchView('view-refined-cinzel', this)">
        <span>🏛 Option 1 Raffinée (Cinzel Bold 800)</span>
      </button>
      <button class="view-btn" onclick="switchView('view-original', this)">
        <span>Option 1 Originale (Cormorant 600)</span>
      </button>
    </div>

    <div class="tools-cluster">
      <button class="tool-btn" onclick="setZoom(0.8)">80%</button>
      <button class="tool-btn" onclick="setZoom(0.92)">92%</button>
      <button class="tool-btn" onclick="setZoom(1.0)">100%</button>
      <button class="tool-btn" style="background: #C59A45; color: #110B07; font-weight: 800; border-color: #C59A45;" onclick="window.print()">
        🖨 Imprimer / PDF
      </button>
    </div>
  </header>

  <!-- PREVIEW STAGE -->
  <main class="preview-stage">
    <div class="scaler" id="scaler" style="transform: scale(0.92);">

      <!-- ============================================================== -->
      <!-- VIEW 1: REFINED WITH PLAYFAIR DISPLAY BOLD                     -->
      <!-- ============================================================== -->
      <article id="view-refined-playfair" class="sheet active font-playfair">
        <div>
          <!-- Header -->
          <header class="r-header">
            <div>
              <img src="${assets.logo}" alt="Maison VAKÁA" class="r-logo" />
              <div class="r-motto">MORE THAN A BAG, A CULTURE</div>
              <div class="r-submotto">Haute Maroquinerie d'Art Panafricaine</div>
            </div>

            <div style="text-align: right;">
              <h1 class="r-title">FACTURE</h1>
              <div class="r-badge">N° VAK-2026-0847</div>
              <div class="r-meta-grid">
                <span class="r-meta-label">Date d'émission</span>
                <span class="r-meta-val">26 Avril 2026</span>
                <span class="r-meta-label">Réf. Commande</span>
                <span class="r-meta-val mono">AZE4E5BE44R18137</span>
                <span class="r-meta-label">Règlement</span>
                <span class="r-meta-val"><span class="r-status">● Acquittée</span></span>
              </div>
            </div>
          </header>

          <!-- Dual Cards -->
          <section class="r-cards-grid">
            <div class="r-card">
              <div class="r-card-header">
                <span class="r-card-label">👤 CLIENT & FACTURATION</span>
                <span style="font-size: 8.5px; font-weight: 800; color: #84511E; text-transform: uppercase;">Compte Vérifié</span>
              </div>
              <div class="r-card-name">Stéphane M. Mbarga</div>
              <div class="r-card-text">
                Quartier Bonapriso, Rue des Palmiers<br />
                Douala, Cameroun<br />
                <strong>Courriel :</strong> lementalistsupreme019@gmail.com<br />
                <strong>Téléphone :</strong> +237 6 99 46 63 81
              </div>
            </div>

            <div class="r-card">
              <div class="r-card-header">
                <span class="r-card-label">📦 EXPÉDITION & RÈGLEMENT</span>
                <span style="font-size: 8.5px; font-weight: 800; color: #1B5E20; text-transform: uppercase;">Paiement Sécurisé</span>
              </div>
              <div class="r-card-name">Colis Sécurisé Express d'Atelier</div>
              <div class="r-card-text">
                <strong>Mode de règlement :</strong> Mobile Money (Orange / MTN)<br />
                <strong>Passerelle :</strong> Flutterwave (ID: FLW-928471902)<br />
                <strong>Atelier expéditeur :</strong> Atelier Principal &bull; Douala Bonanjo<br />
                <strong>Remise :</strong> En main propre contre signature
              </div>
            </div>
          </section>

          <!-- High-Contrast Clean Table -->
          <table class="r-table">
            <thead>
              <tr>
                <th style="width: 44%;">ARTICLE & CONFECTION</th>
                <th style="width: 26%;">MATIÈRES & FINITION</th>
                <th style="width: 8%; text-align: center;">QTÉ</th>
                <th style="width: 11%; text-align: right;">PRIX UNIT.</th>
                <th style="width: 11%; text-align: right;">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: 14px;">
                    <img src="${assets.bag1}" alt="Sac Asâ" class="r-thumb" />
                    <div>
                      <div class="r-prod-name">Sac Bandoulière Asâ</div>
                      <div class="r-prod-sku mono">SKU: VAK-ASA-01</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="r-prod-desc">Raphia naturel sauvage tressé main & cuir pleine fleur ébène tanné végétal.</div>
                </td>
                <td style="text-align: center; font-size: 12px; font-weight: 800;">1</td>
                <td class="r-price">75 000 XAF</td>
                <td class="r-total">75 000 XAF</td>
              </tr>
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: 14px;">
                    <img src="${assets.bag2}" alt="Baguette Indigo" class="r-thumb" />
                    <div>
                      <div class="r-prod-name">Baguette Indigo Savane</div>
                      <div class="r-prod-sku mono">SKU: VAK-BAG-02</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="r-prod-desc">Toile indigo artisanale en cuve naturelle, boucle en laiton coulé artisanal.</div>
                </td>
                <td style="text-align: center; font-size: 12px; font-weight: 800;">1</td>
                <td class="r-price">45 000 XAF</td>
                <td class="r-total">45 000 XAF</td>
              </tr>
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: 14px;">
                    <img src="${assets.bag3}" alt="Porte-cartes Ayá" class="r-thumb" />
                    <div>
                      <div class="r-prod-name">Porte-cartes Ayá</div>
                      <div class="r-prod-sku mono">SKU: VAK-AYA-03</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="r-prod-desc">Cuir pleine fleur noir onyx, tranches lissées à chaud & surpiqûres sellier.</div>
                </td>
                <td style="text-align: center; font-size: 12px; font-weight: 800;">1</td>
                <td class="r-price">15 000 XAF</td>
                <td class="r-total">15 000 XAF</td>
              </tr>
            </tbody>
          </table>

          <!-- Bottom Summary -->
          <section class="r-bottom-grid">
            <div class="r-concierge">
              <div class="r-script">Merci beaucoup !</div>
              <div style="font-size: 11px; font-weight: 800; color: #110B07; text-transform: uppercase; margin-bottom: 4px;">Conciergerie Privée Maison VAKÁA</div>
              <div style="font-size: 10.5px; color: #4A3C33; line-height: 1.6; font-weight: 500;">
                Pour tout conseil d'entretien ou demande relative à votre pièce :<br />
                ✉ Courriel : <strong>contact@vakaa.online</strong><br />
                ☎ Ligne Directe & WhatsApp : <strong>+237 6 70 00 00 00</strong>
              </div>
            </div>

            <div class="r-totals-box">
              <div class="r-line">
                <span>Sous-total articles :</span>
                <span style="font-weight: 700; color: #110B07;">135 000 XAF</span>
              </div>
              <div class="r-line">
                <span>Livraison sécurisée d'atelier :</span>
                <span style="font-weight: 700; color: #110B07;">5 000 XAF</span>
              </div>
              <div class="r-line">
                <span>TVA incluse (19.25%) :</span>
                <span style="font-weight: 600;">22 536 XAF</span>
              </div>
              <div class="r-grand">
                <span class="r-grand-title">TOTAL RÉGLÉ TTC</span>
                <span class="r-grand-val">140 000 XAF</span>
              </div>
            </div>
          </section>
        </div>

        <!-- Official Footer -->
        <footer class="r-footer">
          <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: #110B07; margin-bottom: 2px;">
            MAISON VAKÁA S.A.R.L. &bull; HAUTE MAROQUINERIE D'ART AFRICAINE
          </div>
          <div style="font-weight: 600; color: #4A3C33;">
            Atelier Principal : Rue des Palmiers, Bonanjo, Douala, Cameroun &bull; Bureau International : 24 Rue de la Paix, 75002 Paris
          </div>
          <div style="margin-top: 4px; font-size: 8.5px; color: #8C7B70; text-transform: uppercase; letter-spacing: 0.06em;">
            Capital Social : 10.000.000 XAF &bull; RCCM : RC/DLA/2024/B/1842 &bull; NUI : M05241892401 &bull; Document officiel tenant lieu de reçu fiscal et certificat d'acquisition
          </div>
        </footer>
      </article>

      <!-- ============================================================== -->
      <!-- VIEW 2: REFINED WITH CINZEL BOLD (ROMAN IMPERIAL)              -->
      <!-- ============================================================== -->
      <article id="view-refined-cinzel" class="sheet font-cinzel">
        <div>
          <!-- Header -->
          <header class="r-header">
            <div>
              <img src="${assets.logo}" alt="Maison VAKÁA" class="r-logo" />
              <div class="r-motto">MORE THAN A BAG, A CULTURE</div>
              <div class="r-submotto">Haute Maroquinerie d'Art Panafricaine</div>
            </div>

            <div style="text-align: right;">
              <h1 class="r-title" style="letter-spacing: 0.08em;">FACTURE</h1>
              <div class="r-badge">N° VAK-2026-0847</div>
              <div class="r-meta-grid">
                <span class="r-meta-label">Date d'émission</span>
                <span class="r-meta-val">26 Avril 2026</span>
                <span class="r-meta-label">Réf. Commande</span>
                <span class="r-meta-val mono">AZE4E5BE44R18137</span>
                <span class="r-meta-label">Règlement</span>
                <span class="r-meta-val"><span class="r-status">● Acquittée</span></span>
              </div>
            </div>
          </header>

          <!-- Dual Cards -->
          <section class="r-cards-grid">
            <div class="r-card">
              <div class="r-card-header">
                <span class="r-card-label">👤 CLIENT & FACTURATION</span>
                <span style="font-size: 8.5px; font-weight: 800; color: #84511E; text-transform: uppercase;">Compte Vérifié</span>
              </div>
              <div class="r-card-name">Stéphane M. Mbarga</div>
              <div class="r-card-text">
                Quartier Bonapriso, Rue des Palmiers<br />
                Douala, Cameroun<br />
                <strong>Courriel :</strong> lementalistsupreme019@gmail.com<br />
                <strong>Téléphone :</strong> +237 6 99 46 63 81
              </div>
            </div>

            <div class="r-card">
              <div class="r-card-header">
                <span class="r-card-label">📦 EXPÉDITION & RÈGLEMENT</span>
                <span style="font-size: 8.5px; font-weight: 800; color: #1B5E20; text-transform: uppercase;">Paiement Sécurisé</span>
              </div>
              <div class="r-card-name">Colis Sécurisé Express d'Atelier</div>
              <div class="r-card-text">
                <strong>Mode de règlement :</strong> Mobile Money (Orange / MTN)<br />
                <strong>Passerelle :</strong> Flutterwave (ID: FLW-928471902)<br />
                <strong>Atelier expéditeur :</strong> Atelier Principal &bull; Douala Bonanjo<br />
                <strong>Remise :</strong> En main propre contre signature
              </div>
            </div>
          </section>

          <!-- Table -->
          <table class="r-table">
            <thead>
              <tr>
                <th style="width: 44%;">ARTICLE & CONFECTION</th>
                <th style="width: 26%;">MATIÈRES & FINITION</th>
                <th style="width: 8%; text-align: center;">QTÉ</th>
                <th style="width: 11%; text-align: right;">PRIX UNIT.</th>
                <th style="width: 11%; text-align: right;">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: 14px;">
                    <img src="${assets.bag1}" alt="Sac Asâ" class="r-thumb" />
                    <div>
                      <div class="r-prod-name">Sac Bandoulière Asâ</div>
                      <div class="r-prod-sku mono">SKU: VAK-ASA-01</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="r-prod-desc">Raphia naturel sauvage tressé main & cuir pleine fleur ébène tanné végétal.</div>
                </td>
                <td style="text-align: center; font-size: 12px; font-weight: 800;">1</td>
                <td class="r-price">75 000 XAF</td>
                <td class="r-total">75 000 XAF</td>
              </tr>
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: 14px;">
                    <img src="${assets.bag2}" alt="Baguette Indigo" class="r-thumb" />
                    <div>
                      <div class="r-prod-name">Baguette Indigo Savane</div>
                      <div class="r-prod-sku mono">SKU: VAK-BAG-02</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="r-prod-desc">Toile indigo artisanale en cuve naturelle, boucle en laiton coulé artisanal.</div>
                </td>
                <td style="text-align: center; font-size: 12px; font-weight: 800;">1</td>
                <td class="r-price">45 000 XAF</td>
                <td class="r-total">45 000 XAF</td>
              </tr>
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: 14px;">
                    <img src="${assets.bag3}" alt="Porte-cartes Ayá" class="r-thumb" />
                    <div>
                      <div class="r-prod-name">Porte-cartes Ayá</div>
                      <div class="r-prod-sku mono">SKU: VAK-AYA-03</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="r-prod-desc">Cuir pleine fleur noir onyx, tranches lissées à chaud & surpiqûres sellier.</div>
                </td>
                <td style="text-align: center; font-size: 12px; font-weight: 800;">1</td>
                <td class="r-price">15 000 XAF</td>
                <td class="r-total">15 000 XAF</td>
              </tr>
            </tbody>
          </table>

          <!-- Bottom Summary -->
          <section class="r-bottom-grid">
            <div class="r-concierge">
              <div class="r-script">Merci beaucoup !</div>
              <div style="font-size: 11px; font-weight: 800; color: #110B07; text-transform: uppercase; margin-bottom: 4px;">Conciergerie Privée Maison VAKÁA</div>
              <div style="font-size: 10.5px; color: #4A3C33; line-height: 1.6; font-weight: 500;">
                Pour tout conseil d'entretien ou demande relative à votre pièce :<br />
                ✉ Courriel : <strong>contact@vakaa.online</strong><br />
                ☎ Ligne Directe & WhatsApp : <strong>+237 6 70 00 00 00</strong>
              </div>
            </div>

            <div class="r-totals-box">
              <div class="r-line">
                <span>Sous-total articles :</span>
                <span style="font-weight: 700; color: #110B07;">135 000 XAF</span>
              </div>
              <div class="r-line">
                <span>Livraison sécurisée d'atelier :</span>
                <span style="font-weight: 700; color: #110B07;">5 000 XAF</span>
              </div>
              <div class="r-line">
                <span>TVA incluse (19.25%) :</span>
                <span style="font-weight: 600;">22 536 XAF</span>
              </div>
              <div class="r-grand">
                <span class="r-grand-title">TOTAL RÉGLÉ TTC</span>
                <span class="r-grand-val">140 000 XAF</span>
              </div>
            </div>
          </section>
        </div>

        <!-- Official Footer -->
        <footer class="r-footer">
          <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: #110B07; margin-bottom: 2px;">
            MAISON VAKÁA S.A.R.L. &bull; HAUTE MAROQUINERIE D'ART AFRICAINE
          </div>
          <div style="font-weight: 600; color: #4A3C33;">
            Atelier Principal : Rue des Palmiers, Bonanjo, Douala, Cameroun &bull; Bureau International : 24 Rue de la Paix, 75002 Paris
          </div>
          <div style="margin-top: 4px; font-size: 8.5px; color: #8C7B70; text-transform: uppercase; letter-spacing: 0.06em;">
            Capital Social : 10.000.000 XAF &bull; RCCM : RC/DLA/2024/B/1842 &bull; NUI : M05241892401 &bull; Document officiel tenant lieu de reçu fiscal et certificat d'acquisition
          </div>
        </footer>
      </article>

      <!-- ============================================================== -->
      <!-- VIEW 3: ORIGINAL OPTION 1                                      -->
      <!-- ============================================================== -->
      <article id="view-original" class="sheet font-cormorant">
        <div>
          <header class="orig-header">
            <div>
              <img src="${assets.logo}" alt="Maison VAKÁA" style="height: 40px;" />
              <div style="font-size: 8.5px; font-weight: 700; letter-spacing: 0.24em; text-transform: uppercase; color: #A66B2D; margin-top: 6px;">MORE THAN A BAG, A CULTURE</div>
              <div style="font-size: 8px; letter-spacing: 0.12em; text-transform: uppercase; color: #6B5E55; margin-top: 3px;">Artisanal African Handcrafts for a Modern World</div>
            </div>
            <div style="text-align: right;">
              <h1 class="orig-title">Facture</h1>
              <p style="font-size: 11px; color: #6B5E55; margin-top: 4px; font-family: 'Plus Jakarta Sans', sans-serif;">Merci pour votre confiance et votre soutien aux artisans africains.</p>
              <div style="margin-top: 12px; display: inline-grid; grid-template-columns: auto auto; gap: 3px 14px; text-align: right; font-size: 11px; font-family: 'Plus Jakarta Sans', sans-serif;">
                <span style="color: #6B5E55;">Facture N°</span>
                <span style="font-weight: 700;">#VAK-2026-0847</span>
                <span style="color: #6B5E55;">Date d'émission</span>
                <span style="font-weight: 700;">26 Avril 2026</span>
                <span style="color: #6B5E55;">Statut</span>
                <span style="font-weight: 700; color: #2E7D32;">● Acquittée</span>
                <span style="color: #6B5E55;">Réf. Commande</span>
                <span style="font-weight: 700;">AZE4E5BE44R18137</span>
              </div>
            </div>
          </header>

          <section style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 22px; font-family: 'Plus Jakarta Sans', sans-serif;">
            <div class="orig-card">
              <div style="font-size: 9px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #A66B2D; margin-bottom: 6px;">👤 FACTURÉ À</div>
              <div style="font-size: 13px; font-weight: 700; color: #1D120A; margin-bottom: 3px;">Stéphane M. Mbarga</div>
              <div style="font-size: 11px; color: #6B5E55; line-height: 1.5;">
                Quartier Bonapriso, Rue des Palmiers<br />Douala, Cameroun<br />lementalistsupreme019@gmail.com &bull; +237 6 99 46 63 81
              </div>
            </div>
            <div class="orig-card">
              <div style="font-size: 9px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #A66B2D; margin-bottom: 6px;">📦 LIVRAISON & RÈGLEMENT</div>
              <div style="font-size: 13px; font-weight: 700; color: #1D120A; margin-bottom: 3px;">Colis Sécurisé Express</div>
              <div style="font-size: 11px; color: #6B5E55; line-height: 1.5;">
                Règlement : Flutterwave &bull; Mobile Money (Orange / MTN)<br />ID Transaction : FLW-928471902<br />Atelier Principal VAKÁA &bull; Douala Bonanjo
              </div>
            </div>
          </section>

          <table class="orig-table" style="font-family: 'Plus Jakarta Sans', sans-serif;">
            <thead>
              <tr>
                <th style="width: 38%;">ARTICLE & CRÉATION</th>
                <th style="width: 32%;">MATIÈRES & SAVOIR-FAIRE</th>
                <th style="width: 10%; text-align: center;">QTÉ</th>
                <th style="width: 20%; text-align: right;">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <img src="${assets.bag1}" style="width: 48px; height: 48px; border-radius: 6px; object-fit: cover;" />
                    <div>
                      <div style="font-weight: 700; font-size: 12px;">Sac Bandoulière Asâ</div>
                      <div style="font-size: 9.5px; color: #A66B2D; font-weight: 600;">REF: VAK-ASA-01</div>
                    </div>
                  </div>
                </td>
                <td style="font-size: 10.5px; color: #6B5E55;">Raphia naturel sauvage tissé main & cuir pleine fleur ébène.</td>
                <td style="text-align: center; font-weight: 600;">1</td>
                <td style="text-align: right; font-weight: 700;">75 000 XAF</td>
              </tr>
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <img src="${assets.bag2}" style="width: 48px; height: 48px; border-radius: 6px; object-fit: cover;" />
                    <div>
                      <div style="font-weight: 700; font-size: 12px;">Baguette Indigo Savane</div>
                      <div style="font-size: 9.5px; color: #A66B2D; font-weight: 600;">REF: VAK-BAG-02</div>
                    </div>
                  </div>
                </td>
                <td style="font-size: 10.5px; color: #6B5E55;">Toile indigo artisanale cuve naturelle, boucle laiton coulé.</td>
                <td style="text-align: center; font-weight: 600;">1</td>
                <td style="text-align: right; font-weight: 700;">45 000 XAF</td>
              </tr>
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <img src="${assets.bag3}" style="width: 48px; height: 48px; border-radius: 6px; object-fit: cover;" />
                    <div>
                      <div style="font-weight: 700; font-size: 12px;">Porte-cartes Ayá</div>
                      <div style="font-size: 9.5px; color: #A66B2D; font-weight: 600;">REF: VAK-AYA-03</div>
                    </div>
                  </div>
                </td>
                <td style="font-size: 10.5px; color: #6B5E55;">Cuir pleine fleur noir onyx, couture sellier.</td>
                <td style="text-align: center; font-weight: 600;">1</td>
                <td style="text-align: right; font-weight: 700;">15 000 XAF</td>
              </tr>
            </tbody>
          </table>

          <section style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 20px; align-items: flex-start; margin-bottom: 24px; font-family: 'Plus Jakarta Sans', sans-serif;">
            <div>
              <div class="script-hand" style="font-size: 42px; color: #A66B2D; line-height: 1;">Merci beaucoup !</div>
              <div style="font-size: 10.5px; font-weight: 700; color: #1D120A; margin-top: 6px;">Questions sur vos pièces ou entretien ?</div>
              <div style="font-size: 10.5px; color: #6B5E55; line-height: 1.55;">contact@vakaa.online &bull; +237 6 70 00 00 00</div>
            </div>
            <div class="orig-card">
              <div style="display: flex; justify-content: space-between; font-size: 11px; color: #6B5E55; padding: 4px 0;">
                <span>Sous-total articles</span>
                <span style="font-weight: 600; color: #1D120A;">135 000 XAF</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; color: #6B5E55; padding: 4px 0;">
                <span>Livraison</span>
                <span style="font-weight: 600; color: #1D120A;">5 000 XAF</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 800; color: #1D120A; border-top: 1.5px solid #1D120A; padding-top: 8px; margin-top: 6px;">
                <span>Total TTC</span>
                <span style="font-size: 16px;">140 000 XAF</span>
              </div>
            </div>
          </section>
        </div>

        <footer style="border-top: 1px solid #E7DED0; padding-top: 14px; text-align: center; font-size: 9px; color: #8C7B70; line-height: 1.55; font-family: 'Plus Jakarta Sans', sans-serif;">
          <strong>MAISON VAKÁA S.A.R.L.</strong> &bull; Haute Maroquinerie d'Art Africaine &bull; Capital : 10.000.000 XAF<br />
          RC/DLA/2024/B/1842 &bull; NUI : M05241892401 &bull; Document officiel tenant lieu de reçu fiscal
        </footer>
      </article>

    </div>
  </main>

  <script>
    function switchView(viewId, btn) {
      document.querySelectorAll('.sheet').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.view-btn').forEach(el => el.classList.remove('active'));
      document.getElementById(viewId).classList.add('active');
      btn.classList.add('active');
    }

    function setZoom(factor) {
      document.getElementById('scaler').style.transform = 'scale(' + factor + ')';
    }
  </script>
</body>
</html>`;

fs.writeFileSync(`${artifactDir}/vakaa_invoice_option1_comparison.html`, html);
console.log('Comparison HTML created successfully!');
