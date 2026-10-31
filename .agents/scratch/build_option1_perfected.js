const fs = require('fs');
const assets = JSON.parse(fs.readFileSync('.agents/scratch/assets.json', 'utf8'));
const artifactDir = 'C:/Users/EonEmmanuel/.gemini/antigravity/brain/02246bef-2726-42e2-b8ea-46b18aaa9cc7';

function generatePerfectedOption1() {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Maison VAKÁA — Facture Officielle N° VAK-2026-0847</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-stage: #140E0A;
      --paper: #FAF8F5;
      --surface-card: #F5EFEB;
      --border-card: #E4DBD1;
      --border-subtle: #ECE4DA;
      --ink: #140C06;
      --ink-sec: #4A3A2F;
      --ink-muted: #736357;
      --gold: #9B6327;
      --gold-dark: #7D4C18;
      --gold-brass: #C59A45;
      --border-dark: #140C06;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg-stage);
      color: var(--ink);
      padding: 0;
      margin: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* TOP BAR LAB CONTROLLER */
    .lab-controller {
      position: sticky;
      top: 0;
      z-index: 100;
      width: 100%;
      background: rgba(20, 14, 10, 0.95);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      padding: 12px 28px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      color: #FAF8F5;
    }
    .lab-brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .lab-brand-title {
      font-weight: 800;
      font-size: 13px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }
    .lab-tag {
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      background: #C59A45;
      color: #140C06;
      padding: 2px 7px;
      border-radius: 3px;
    }
    .lab-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .ctrl-btn {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.16);
      color: #FAF8F5;
      padding: 6px 12px;
      border-radius: 5px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .ctrl-btn:hover {
      background: rgba(255, 255, 255, 0.18);
    }
    .ctrl-btn-primary {
      background: #C59A45;
      color: #140C06;
      border-color: #C59A45;
      font-weight: 800;
    }
    .ctrl-btn-primary:hover {
      background: #D9AC52;
    }

    /* PREVIEW VIEWPORT */
    .viewport {
      padding: 32px 16px 80px;
      display: flex;
      justify-content: center;
      width: 100%;
      overflow-x: auto;
    }
    .zoom-wrapper {
      transform-origin: top center;
      transition: transform 0.2s ease-out;
    }

    /* A4 PAGE SPECIFICATION */
    .a4-page {
      width: 210mm;
      min-height: 297mm;
      background: var(--paper);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
      border-radius: 2px;
      padding: 16mm 18mm;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-sizing: border-box;
    }

    /* TYPOGRAPHY */
    .font-serif {
      font-family: 'Playfair Display', Georgia, serif;
    }
    .font-mono {
      font-family: 'Space Grotesk', monospace;
    }
    .font-hand {
      font-family: 'Alex Brush', cursive;
    }

    /* 1. HEADER */
    .header-block {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 18px;
      border-bottom: 1px solid var(--border-card);
      margin-bottom: 20px;
    }
    .brand-section {
      display: flex;
      flex-direction: column;
    }
    .brand-logo {
      height: 42px;
      object-fit: contain;
      align-self: flex-start;
    }
    .brand-tagline {
      font-size: 8.5px;
      font-weight: 800;
      letter-spacing: 0.24em;
      text-transform: uppercase;
      color: var(--gold);
      margin-top: 8px;
    }
    .brand-heritage {
      font-size: 8.5px;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--ink-sec);
      margin-top: 3px;
    }

    .doc-meta-section {
      text-align: right;
    }
    .doc-title {
      font-size: 34px;
      font-weight: 800;
      line-height: 1;
      letter-spacing: -0.01em;
      color: var(--ink);
      text-transform: uppercase;
      margin: 0;
    }
    .doc-number-badge {
      display: inline-block;
      margin-top: 6px;
      background: var(--surface-card);
      border: 1px solid var(--border-card);
      padding: 3px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 800;
      color: var(--ink);
      letter-spacing: 0.05em;
    }
    .meta-table {
      margin-top: 8px;
      display: inline-grid;
      grid-template-columns: auto auto;
      gap: 3px 14px;
      text-align: right;
      font-size: 10.5px;
      align-items: center;
    }
    .meta-term {
      color: var(--ink-muted);
      font-weight: 600;
      text-transform: uppercase;
      font-size: 9px;
      letter-spacing: 0.08em;
    }
    .meta-def {
      font-weight: 800;
      color: var(--ink);
    }
    .status-settled-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #EAF5EA;
      color: #1E6B24;
      border: 1px solid #C4E3C6;
      font-size: 9px;
      font-weight: 800;
      padding: 1px 6px;
      border-radius: 3px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    /* 2. DUAL UNIFORM CARDS */
    .cards-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .client-card {
      background: var(--surface-card);
      border: 1px solid var(--border-card);
      border-radius: 6px;
      padding: 15px 18px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .card-title-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    }
    .card-heading {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--gold);
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .card-status-note {
      font-size: 8px;
      font-weight: 700;
      color: var(--gold-dark);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .card-main-name {
      font-size: 13.5px;
      font-weight: 800;
      color: var(--ink);
      margin-bottom: 3px;
    }
    .card-detail-line {
      font-size: 10.5px;
      color: var(--ink-sec);
      line-height: 1.55;
      font-weight: 500;
    }
    .card-detail-line strong {
      color: var(--ink);
      font-weight: 700;
    }

    /* 3. ITEM TABLE (HARMONIOUS & CRISP) */
    .items-container {
      width: 100%;
      border: 1px solid var(--border-dark);
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 20px;
      background: #FFFFFF;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
    }
    .items-table thead th {
      background: var(--ink);
      color: #FAF8F5;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      padding: 10px 14px;
      text-align: left;
    }
    .items-table thead th.text-center { text-align: center; }
    .items-table thead th.text-right { text-align: right; }

    .items-table tbody td {
      padding: 12px 14px;
      border-bottom: 1px solid var(--border-subtle);
      font-size: 10.5px;
      vertical-align: middle;
      background: #FAF8F5;
    }
    .items-table tbody tr:last-child td {
      border-bottom: none;
    }
    .item-entity {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .item-thumbnail {
      width: 46px;
      height: 46px;
      border-radius: 4px;
      object-fit: cover;
      border: 1px solid var(--border-card);
      background: #FFFFFF;
      flex-shrink: 0;
    }
    .item-title {
      font-size: 12.5px;
      font-weight: 800;
      color: var(--ink);
    }
    .item-sku {
      font-size: 9.5px;
      font-weight: 700;
      color: var(--gold-dark);
      letter-spacing: 0.08em;
      margin-top: 1px;
    }
    .item-spec {
      font-size: 10px;
      color: var(--ink-sec);
      line-height: 1.45;
      font-weight: 500;
      max-width: 240px;
    }
    .item-qty {
      text-align: center;
      font-size: 11.5px;
      font-weight: 800;
      color: var(--ink);
    }
    .item-price {
      text-align: right;
      font-size: 11.5px;
      font-weight: 600;
      color: var(--ink-sec);
      font-variant-numeric: tabular-nums;
    }
    .item-total {
      text-align: right;
      font-size: 12.5px;
      font-weight: 800;
      color: var(--ink);
      font-variant-numeric: tabular-nums;
    }

    /* 4. BOTTOM SECTION: CONCIERGE & TOTALS */
    .summary-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .concierge-box {
      background: var(--surface-card);
      border: 1px solid var(--border-card);
      border-radius: 6px;
      padding: 15px 18px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .handwritten-thanks {
      font-size: 34px;
      color: var(--gold);
      line-height: 1;
      margin-bottom: 6px;
    }
    .concierge-heading {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--ink);
      margin-bottom: 3px;
    }
    .concierge-desc {
      font-size: 10px;
      color: var(--ink-sec);
      line-height: 1.55;
      font-weight: 500;
    }
    .concierge-desc strong {
      color: var(--ink);
      font-weight: 700;
    }

    .totals-box {
      background: var(--surface-card);
      border: 1px solid var(--border-card);
      border-radius: 6px;
      padding: 15px 18px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .financial-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 3.5px 0;
      font-size: 11px;
      color: var(--ink-sec);
      font-weight: 600;
    }
    .financial-line .figure {
      font-weight: 700;
      color: var(--ink);
      font-variant-numeric: tabular-nums;
    }
    .grand-total-row {
      margin-top: 8px;
      padding-top: 10px;
      border-top: 1.5px solid var(--ink);
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .grand-total-tag {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--ink);
    }
    .grand-total-num {
      font-size: 17px;
      font-weight: 900;
      color: var(--ink);
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.01em;
    }

    /* 5. LEGAL FOOTER */
    .legal-footer {
      border-top: 1px solid var(--border-card);
      padding-top: 14px;
      text-align: center;
      font-size: 9px;
      color: var(--ink-muted);
      line-height: 1.6;
    }
    .legal-company-name {
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--ink);
      margin-bottom: 2px;
    }
    .legal-addresses {
      font-weight: 600;
      color: var(--ink-sec);
    }
    .legal-registration {
      margin-top: 3px;
      font-size: 8px;
      color: #8C7B70;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    /* PRINT RULE */
    @media print {
      body { background: transparent !important; padding: 0 !important; }
      .lab-controller { display: none !important; }
      .viewport { padding: 0 !important; }
      .zoom-wrapper { transform: none !important; }
      .a4-page { box-shadow: none !important; width: 100% !important; min-height: 100% !important; padding: 12mm 14mm !important; }
    }
  </style>
</head>
<body>

  <!-- LAB CONTROLLER TOP BAR -->
  <header class="lab-controller">
    <div class="lab-brand">
      <span class="lab-brand-title">MAISON VAKÁA</span>
      <span class="lab-tag">OPTION 1 HARMONISÉE</span>
    </div>

    <div style="font-size: 11.5px; color: #D6CCC2;">
      Alignement géométrique uniforme &bull; Typographie Playfair Bold &bull; Espacement 16px calibré
    </div>

    <div class="lab-actions">
      <button class="ctrl-btn" onclick="setZoom(0.8)">80%</button>
      <button class="ctrl-btn" onclick="setZoom(0.92)">92%</button>
      <button class="ctrl-btn" onclick="setZoom(1.0)">100%</button>
      <button class="ctrl-btn ctrl-btn-primary" onclick="window.print()">
        🖨 Imprimer / PDF
      </button>
    </div>
  </header>

  <!-- VIEWPORT -->
  <main class="viewport">
    <div class="zoom-wrapper" id="zoomWrapper" style="transform: scale(0.92);">
      
      <article class="a4-page">
        <div>
          <!-- 1. HEADER SECTION -->
          <header class="header-block">
            <div class="brand-section">
              <img src="${assets.logo}" alt="Maison VAKÁA" class="brand-logo" />
              <div class="brand-tagline">MORE THAN A BAG, A CULTURE</div>
              <div class="brand-heritage">Haute Maroquinerie d'Art Panafricaine</div>
            </div>

            <div class="doc-meta-section">
              <h1 class="doc-title font-serif">FACTURE</h1>
              <div class="doc-number-badge">N° VAK-2026-0847</div>
              <div class="meta-table">
                <span class="meta-term">Date d'émission</span>
                <span class="meta-def">26 Avril 2026</span>
                <span class="meta-term">Réf. Commande</span>
                <span class="meta-def font-mono">AZE4E5BE44R18137</span>
                <span class="meta-term">Règlement</span>
                <span class="meta-def"><span class="status-settled-pill">● Acquittée</span></span>
              </div>
            </div>
          </header>

          <!-- 2. DUAL UNIFORM CARDS -->
          <section class="cards-grid">
            <div class="client-card">
              <div class="card-title-bar">
                <span class="card-heading">👤 FACTURÉ À</span>
                <span class="card-status-note">Client Vérifié</span>
              </div>
              <div>
                <div class="card-main-name">Stéphane M. Mbarga</div>
                <div class="card-detail-line">
                  Quartier Bonapriso, Rue des Palmiers<br />
                  Douala, Cameroun<br />
                  <strong>Courriel :</strong> lementalistsupreme019@gmail.com<br />
                  <strong>Téléphone :</strong> +237 6 99 46 63 81
                </div>
              </div>
            </div>

            <div class="client-card">
              <div class="card-title-bar">
                <span class="card-heading">📦 LIVRAISON & RÈGLEMENT</span>
                <span class="card-status-note" style="color: #1E6B24;">Paiement Sécurisé</span>
              </div>
              <div>
                <div class="card-main-name">Colis Sécurisé Express d'Atelier</div>
                <div class="card-detail-line">
                  <strong>Mode de règlement :</strong> Mobile Money (Orange / MTN)<br />
                  <strong>Transaction ID :</strong> FLW-928471902<br />
                  <strong>Atelier expéditeur :</strong> Atelier Principal &bull; Douala Bonanjo<br />
                  <strong>Remise :</strong> En main propre contre signature
                </div>
              </div>
            </div>
          </section>

          <!-- 3. ITEM TABLE (HARMONIOUS & CRISP) -->
          <section class="items-container">
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 42%;">ARTICLE & CONFECTION</th>
                  <th style="width: 28%;">MATIÈRES & FINITION</th>
                  <th style="width: 10%; text-align: center;">QTÉ</th>
                  <th style="width: 10%; text-align: right;">PRIX UNIT.</th>
                  <th style="width: 10%; text-align: right;">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div class="item-entity">
                      <img src="${assets.bag1}" alt="Sac Asâ" class="item-thumbnail" />
                      <div>
                        <div class="item-title">Sac Bandoulière Asâ</div>
                        <div class="item-sku font-mono">SKU: VAK-ASA-01</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="item-spec">Raphia naturel sauvage tressé main & cuir pleine fleur ébène tanné végétal.</div>
                  </td>
                  <td class="item-qty">1</td>
                  <td class="item-price">75 000 XAF</td>
                  <td class="item-total">75 000 XAF</td>
                </tr>
                <tr>
                  <td>
                    <div class="item-entity">
                      <img src="${assets.bag2}" alt="Baguette Indigo Savane" class="item-thumbnail" />
                      <div>
                        <div class="item-title">Baguette Indigo Savane</div>
                        <div class="item-sku font-mono">SKU: VAK-BAG-02</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="item-spec">Toile indigo artisanale en cuve naturelle, boucle en laiton coulé artisanal.</div>
                  </td>
                  <td class="item-qty">1</td>
                  <td class="item-price">45 000 XAF</td>
                  <td class="item-total">45 000 XAF</td>
                </tr>
                <tr>
                  <td>
                    <div class="item-entity">
                      <img src="${assets.bag3}" alt="Porte-cartes Ayá" class="item-thumbnail" />
                      <div>
                        <div class="item-title">Porte-cartes Ayá</div>
                        <div class="item-sku font-mono">SKU: VAK-AYA-03</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="item-spec">Cuir pleine fleur noir onyx, tranches lissées à chaud & surpiqûres sellier.</div>
                  </td>
                  <td class="item-qty">1</td>
                  <td class="item-price">15 000 XAF</td>
                  <td class="item-total">15 000 XAF</td>
                </tr>
              </tbody>
            </table>
          </section>

          <!-- 4. BOTTOM SECTION: CONCIERGE & TOTALS -->
          <section class="summary-grid">
            <div class="concierge-box">
              <div class="handwritten-thanks font-hand">Merci beaucoup !</div>
              <div class="concierge-heading">Conciergerie Privée Maison VAKÁA</div>
              <div class="concierge-desc">
                Chaque création Maison VAKÁA est façonnée avec passion par nos maîtres artisans.<br />
                Pour tout conseil d'entretien ou service après-vente :<br />
                Courriel : <strong>contact@vakaa.online</strong> &bull; Tél & WhatsApp : <strong>+237 6 70 00 00 00</strong>
              </div>
            </div>

            <div class="totals-box">
              <div class="financial-line">
                <span>Sous-total maroquinerie :</span>
                <span class="figure">135 000 XAF</span>
              </div>
              <div class="financial-line">
                <span>Livraison sécurisée d'atelier :</span>
                <span class="figure">5 000 XAF</span>
              </div>
              <div class="financial-line">
                <span>TVA incluse (19.25%) :</span>
                <span class="figure" style="font-weight: 500;">22 536 XAF</span>
              </div>
              <div class="grand-total-row">
                <span class="grand-total-tag">TOTAL TTC RÉGLÉ</span>
                <span class="grand-total-num">140 000 XAF</span>
              </div>
            </div>
          </section>
        </div>

        <!-- 5. LEGAL FOOTER -->
        <footer class="legal-footer">
          <div class="legal-company-name">MAISON VAKÁA S.A.R.L. &bull; HAUTE MAROQUINERIE D'ART AFRICAINE</div>
          <div class="legal-addresses">
            Atelier Principal : Rue des Palmiers, Bonanjo, Douala, Cameroun &bull; Bureau International : 24 Rue de la Paix, 75002 Paris
          </div>
          <div class="legal-registration">
            Capital Social : 10.000.000 XAF &bull; RCCM : RC/DLA/2024/B/1842 &bull; NUI : M05241892401 &bull; Document officiel tenant lieu de reçu fiscal et certificat d'acquisition
          </div>
        </footer>
      </article>

    </div>
  </main>

  <script>
    function setZoom(factor) {
      document.getElementById('zoomWrapper').style.transform = 'scale(' + factor + ')';
    }
  </script>
</body>
</html>`;
}

fs.writeFileSync(`${artifactDir}/vakaa_invoice_option1_perfected.html`, generatePerfectedOption1());
console.log('Option 1 Perfected written to ' + artifactDir + '/vakaa_invoice_option1_perfected.html');
