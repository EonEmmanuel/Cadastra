const fs = require('fs');
const assets = JSON.parse(fs.readFileSync('.agents/scratch/assets.json', 'utf8'));
const artifactDir = 'C:/Users/EonEmmanuel/.gemini/antigravity/brain/02246bef-2726-42e2-b8ea-46b18aaa9cc7';

function generateOption1Refined() {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Maison VAKÁA — Option 1 Perfectionnée (Stronger Fonts & Clean Layout)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cinzel:wght@600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;0,800;0,900;1,600;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --canvas: #16120E;
      --paper: #FAF8F5;
      --card-bg: #F4EFE9;
      --card-border: #E4DBD0;
      --ink: #110B07;
      --ink-secondary: #4A3C33;
      --ink-muted: #6B5E55;
      --gold: #9E642A;
      --gold-deep: #84511E;
      --gold-accent: #C59A45;
      --border-line: #E5DDD0;
      --border-dark: #110B07;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--canvas);
      color: var(--ink);
      padding: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* TOP CONTROLLER */
    .lab-bar {
      position: sticky;
      top: 0;
      z-index: 1000;
      width: 100%;
      background: rgba(22, 18, 14, 0.95);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255,255,255,0.12);
      padding: 12px 24px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      color: #FAF8F5;
    }
    .lab-badge {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      background: #C59A45;
      color: #110B07;
      padding: 3px 8px;
      border-radius: 4px;
    }
    .toggle-group {
      display: flex;
      gap: 8px;
    }
    .toggle-btn {
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.18);
      color: #FAF8F5;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .toggle-btn:hover {
      background: rgba(255,255,255,0.18);
    }
    .toggle-btn.active {
      background: #FAF8F5;
      color: #110B07;
      font-weight: 800;
      border-color: #FAF8F5;
    }

    /* PREVIEW CONTAINER */
    .preview-container {
      padding: 30px 15px 80px;
      display: flex;
      justify-content: center;
      width: 100%;
      overflow-x: auto;
    }
    .scaler-wrap {
      transform-origin: top center;
      transition: transform 0.2s ease-out;
    }

    /* A4 SHEET */
    .a4-sheet {
      width: 210mm;
      min-height: 297mm;
      background: var(--paper);
      box-shadow: 0 24px 64px rgba(0,0,0,0.45);
      border-radius: 3px;
      padding: 16mm 18mm;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-sizing: border-box;
    }

    /* TYPOGRAPHY VARIATIONS */
    .font-playfair .hero-title,
    .font-playfair .brand-title,
    .font-playfair .grand-total-val,
    .font-playfair .section-header-title {
      font-family: 'Playfair Display', Georgia, serif;
    }
    .font-cinzel .hero-title,
    .font-cinzel .brand-title,
    .font-cinzel .grand-total-val,
    .font-cinzel .section-header-title {
      font-family: 'Cinzel', Georgia, serif;
    }

    /* 1. HEADER SECTION */
    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 20px;
      border-bottom: 2px solid var(--border-line);
      margin-bottom: 22px;
    }
    .brand-col {
      display: flex;
      flex-direction: column;
    }
    .brand-logo-img {
      height: 44px;
      object-fit: contain;
      align-self: flex-start;
    }
    .brand-motto {
      font-size: 8.5px;
      font-weight: 800;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: var(--gold);
      margin-top: 8px;
    }
    .brand-sub {
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--ink-secondary);
      margin-top: 3px;
    }

    .meta-col {
      text-align: right;
    }
    .hero-title {
      font-size: 38px;
      font-weight: 800;
      line-height: 0.95;
      letter-spacing: -0.01em;
      color: var(--ink);
      text-transform: uppercase;
    }
    .meta-badge {
      display: inline-block;
      margin-top: 8px;
      background: var(--card-bg);
      border: 1.5px solid var(--card-border);
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 800;
      color: var(--ink);
      letter-spacing: 0.05em;
    }
    .meta-grid {
      margin-top: 10px;
      display: inline-grid;
      grid-template-columns: auto auto;
      gap: 4px 16px;
      text-align: right;
      font-size: 11px;
    }
    .meta-label {
      color: var(--ink-muted);
      font-weight: 600;
      text-transform: uppercase;
      font-size: 9.5px;
      letter-spacing: 0.08em;
    }
    .meta-value {
      font-weight: 800;
      color: var(--ink);
    }
    .status-paid-pill {
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

    /* 2. DUAL INFO CARDS (BILL TO & SHIPPING) */
    .cards-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    .info-card {
      background: var(--card-bg);
      border: 1.5px solid var(--card-border);
      border-radius: 8px;
      padding: 16px 18px;
      position: relative;
    }
    .card-header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 1px solid rgba(0,0,0,0.06);
    }
    .card-label {
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--gold);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .card-badge-icon {
      font-size: 11px;
    }
    .card-name {
      font-size: 14px;
      font-weight: 800;
      color: var(--ink);
      margin-bottom: 4px;
      letter-spacing: 0.01em;
    }
    .card-line {
      font-size: 11px;
      color: var(--ink-secondary);
      line-height: 1.55;
      font-weight: 500;
    }
    .card-line strong {
      color: var(--ink);
      font-weight: 700;
    }

    /* 3. ITEM TABLE (CLEAN, SHARP & HIGH CONTRAST) */
    .items-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin-bottom: 24px;
      border: 1.5px solid var(--border-dark);
      border-radius: 8px;
      overflow: hidden;
    }
    .items-table thead th {
      background: var(--ink);
      color: #FAF8F5;
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      padding: 12px 14px;
      text-align: left;
    }
    .items-table thead th.text-right { text-align: right; }
    .items-table thead th.text-center { text-align: center; }

    .items-table tbody td {
      padding: 14px 14px;
      border-bottom: 1px solid var(--border-line);
      background: #FAF8F5;
      font-size: 11px;
      vertical-align: middle;
    }
    .items-table tbody tr:last-child td {
      border-bottom: none;
    }
    .prod-cluster {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .prod-thumb {
      width: 52px;
      height: 52px;
      border-radius: 6px;
      object-fit: cover;
      border: 1px solid var(--card-border);
      background: #FFFFFF;
      flex-shrink: 0;
      box-shadow: 0 2px 6px rgba(0,0,0,0.06);
    }
    .prod-name {
      font-size: 13.5px;
      font-weight: 800;
      color: var(--ink);
      letter-spacing: 0.01em;
    }
    .prod-ref {
      font-size: 10px;
      font-weight: 800;
      color: var(--gold-deep);
      letter-spacing: 0.08em;
      margin-top: 2px;
      font-family: 'Space Grotesk', monospace;
    }
    .prod-desc {
      font-size: 10.5px;
      color: var(--ink-secondary);
      line-height: 1.45;
      font-weight: 500;
      max-width: 250px;
    }
    .qty-cell {
      text-align: center;
      font-size: 12px;
      font-weight: 800;
      color: var(--ink);
    }
    .price-cell {
      text-align: right;
      font-size: 12px;
      font-weight: 600;
      color: var(--ink-secondary);
      font-variant-numeric: tabular-nums;
    }
    .total-cell {
      text-align: right;
      font-size: 13px;
      font-weight: 800;
      color: var(--ink);
      font-variant-numeric: tabular-nums;
    }

    /* 4. TOTALS & CONCIERGERIE ROW */
    .summary-row {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 20px;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .concierge-card {
      background: var(--card-bg);
      border: 1.5px solid var(--card-border);
      border-radius: 8px;
      padding: 16px 18px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .script-sign {
      font-family: 'Alex Brush', cursive;
      font-size: 42px;
      color: var(--gold);
      line-height: 1;
      margin-bottom: 8px;
    }
    .concierge-title {
      font-size: 11px;
      font-weight: 800;
      color: var(--ink);
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .concierge-text {
      font-size: 10.5px;
      color: var(--ink-secondary);
      line-height: 1.6;
      font-weight: 500;
    }
    .concierge-text strong {
      color: var(--ink);
      font-weight: 700;
    }
    .concierge-link {
      color: var(--ink);
      font-weight: 700;
      text-decoration: none;
    }

    .totals-card {
      background: var(--card-bg);
      border: 1.5px solid var(--card-border);
      border-radius: 8px;
      padding: 16px 18px;
    }
    .total-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 5px 0;
      font-size: 11.5px;
      color: var(--ink-secondary);
      font-weight: 600;
    }
    .total-line .val {
      font-weight: 700;
      color: var(--ink);
      font-variant-numeric: tabular-nums;
    }
    .total-line.discount {
      color: var(--gold-deep);
    }
    .total-line.discount .val {
      color: var(--gold-deep);
      font-weight: 800;
    }
    .grand-total-box {
      margin-top: 10px;
      padding-top: 12px;
      border-top: 2px solid var(--ink);
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .grand-total-label {
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--ink);
    }
    .grand-total-val {
      font-size: 20px;
      font-weight: 900;
      color: var(--ink);
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.01em;
    }

    /* 5. OFFICIAL FISCAL & LEGAL FOOTER */
    .official-footer {
      border-top: 2px solid var(--border-line);
      padding-top: 16px;
      text-align: center;
      font-size: 9.5px;
      color: var(--ink-muted);
      line-height: 1.6;
      letter-spacing: 0.02em;
    }
    .footer-company {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--ink);
      margin-bottom: 2px;
    }
    .footer-locations {
      font-weight: 600;
      color: var(--ink-secondary);
    }
    .footer-legal-notice {
      margin-top: 4px;
      font-size: 8.5px;
      color: #8C7B70;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    /* PRINT STYLES */
    @media print {
      body { background: transparent !important; padding: 0 !important; }
      .lab-bar { display: none !important; }
      .preview-container { padding: 0 !important; }
      .scaler-wrap { transform: none !important; }
      .a4-sheet { box-shadow: none !important; width: 100% !important; min-height: 100% !important; padding: 12mm 14mm !important; }
    }
  </style>
</head>
<body class="font-playfair">

  <!-- TOP BAR CONTROL -->
  <header class="lab-bar">
    <div style="display: flex; align-items: center; gap: 12px;">
      <span style="font-weight: 800; letter-spacing: 0.15em;">MAISON VAKÁA</span>
      <span class="lab-badge">OPTION 1 POLISHED & REFINED</span>
    </div>

    <!-- FONT SWITCHER -->
    <div class="toggle-group">
      <span style="font-size: 11px; color: #AAA; align-self: center; margin-right: 4px;">Typographie :</span>
      <button class="toggle-btn active" onclick="setFontFamily('font-playfair', this)">
        <span>Playfair Display Bold (700/800)</span>
      </button>
      <button class="toggle-btn" onclick="setFontFamily('font-cinzel', this)">
        <span>Cinzel Roman Imperial (800)</span>
      </button>
    </div>

    <!-- ZOOM & PRINT -->
    <div style="display: flex; gap: 8px;">
      <button class="toggle-btn" onclick="setZoom(0.8)">80%</button>
      <button class="toggle-btn" onclick="setZoom(0.95)">95%</button>
      <button class="toggle-btn" onclick="setZoom(1.0)">100%</button>
      <button class="toggle-btn" style="background: #C59A45; color: #110B07; font-weight: 800; border-color: #C59A45;" onclick="window.print()">
        🖨 Imprimer / PDF
      </button>
    </div>
  </header>

  <!-- PREVIEW CONTAINER -->
  <main class="preview-container">
    <div class="scaler-wrap" id="scaler" style="transform: scale(0.92);">
      
      <article class="a4-sheet" id="sheet">
        <div>
          <!-- 1. HEADER SECTION -->
          <header class="invoice-header">
            <div class="brand-col">
              <img src="${assets.logo}" alt="Maison VAKÁA" class="brand-logo-img" />
              <div class="brand-motto">MORE THAN A BAG, A CULTURE</div>
              <div class="brand-sub">Haute Maroquinerie d'Art Panafricaine</div>
            </div>

            <div class="meta-col">
              <h1 class="hero-title">FACTURE</h1>
              <div class="meta-badge">N° VAK-2026-0847</div>
              <div class="meta-grid">
                <span class="meta-label">Date d'émission</span>
                <span class="meta-value">26 Avril 2026</span>
                <span class="meta-label">Réf. Commande</span>
                <span class="meta-value" style="font-family: 'Space Grotesk', monospace;">AZE4E5BE44R18137</span>
                <span class="meta-label">Règlement</span>
                <span class="meta-value"><span class="status-paid-pill">● Acquittée</span></span>
              </div>
            </div>
          </header>

          <!-- 2. CLIENT & DELIVERY CARDS -->
          <section class="cards-row">
            <div class="info-card">
              <div class="card-header-bar">
                <span class="card-label"><span class="card-badge-icon">👤</span> CLIENT & FACTURATION</span>
                <span style="font-size: 8.5px; font-weight: 700; color: var(--gold-deep); text-transform: uppercase;">Compte Vérifié</span>
              </div>
              <div class="card-name">Stéphane M. Mbarga</div>
              <div class="card-line">
                Quartier Bonapriso, Rue des Palmiers<br />
                Douala, Cameroun<br />
                <strong>Courriel :</strong> lementalistsupreme019@gmail.com<br />
                <strong>Téléphone :</strong> +237 6 99 46 63 81
              </div>
            </div>

            <div class="info-card">
              <div class="card-header-bar">
                <span class="card-label"><span class="card-badge-icon">📦</span> EXPÉDITION & RÈGLEMENT</span>
                <span style="font-size: 8.5px; font-weight: 700; color: #1B5E20; text-transform: uppercase;">Paiement Sécurisé</span>
              </div>
              <div class="card-name">Colis Sécurisé Express d'Atelier</div>
              <div class="card-line">
                <strong>Mode de règlement :</strong> Mobile Money (Orange / MTN)<br />
                <strong>Passerelle :</strong> Flutterwave (ID: FLW-928471902)<br />
                <strong>Atelier expéditeur :</strong> Atelier Principal &bull; Douala Bonanjo<br />
                <strong>Remise :</strong> En main propre contre signature
              </div>
            </div>
          </section>

          <!-- 3. ITEM TABLE (CLEAN, SHARP & HIGH CONTRAST) -->
          <table class="items-table">
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
                  <div class="prod-cluster">
                    <img src="${assets.bag1}" alt="Sac Asâ" class="prod-thumb" />
                    <div>
                      <div class="prod-name">Sac Bandoulière Asâ</div>
                      <div class="prod-ref">SKU: VAK-ASA-01</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="prod-desc">Raphia naturel sauvage tressé main & cuir pleine fleur ébène tanné végétal.</div>
                </td>
                <td class="qty-cell">1</td>
                <td class="price-cell">75 000 XAF</td>
                <td class="total-cell">75 000 XAF</td>
              </tr>
              <tr>
                <td>
                  <div class="prod-cluster">
                    <img src="${assets.bag2}" alt="Baguette Indigo Savane" class="prod-thumb" />
                    <div>
                      <div class="prod-name">Baguette Indigo Savane</div>
                      <div class="prod-ref">SKU: VAK-BAG-02</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="prod-desc">Toile indigo artisanale en cuve naturelle, boucle en laiton coulé artisanal.</div>
                </td>
                <td class="qty-cell">1</td>
                <td class="price-cell">45 000 XAF</td>
                <td class="total-cell">45 000 XAF</td>
              </tr>
              <tr>
                <td>
                  <div class="prod-cluster">
                    <img src="${assets.bag3}" alt="Porte-cartes Ayá" class="prod-thumb" />
                    <div>
                      <div class="prod-name">Porte-cartes Ayá</div>
                      <div class="prod-ref">SKU: VAK-AYA-03</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="prod-desc">Cuir pleine fleur noir onyx, tranches lissées à chaud & surpiqûres sellier.</div>
                </td>
                <td class="qty-cell">1</td>
                <td class="price-cell">15 000 XAF</td>
                <td class="total-cell">15 000 XAF</td>
              </tr>
            </tbody>
          </table>

          <!-- 4. TOTALS & CONCIERGERIE ROW -->
          <section class="summary-row">
            <div class="concierge-card">
              <div>
                <div class="script-sign">Merci beaucoup !</div>
                <div class="concierge-title">Conciergerie Privée Maison VAKÁA</div>
                <div class="concierge-text">
                  Pour tout conseil d'entretien ou demande relative à votre pièce :<br />
                  ✉ Courriel : <a href="mailto:contact@vakaa.online" class="concierge-link">contact@vakaa.online</a><br />
                  ☎ Ligne Directe & WhatsApp : <strong>+237 6 70 00 00 00</strong>
                </div>
              </div>
            </div>

            <div class="totals-card">
              <div class="total-line">
                <span>Sous-total articles :</span>
                <span class="val">135 000 XAF</span>
              </div>
              <div class="total-line">
                <span>Livraison sécurisée d'atelier :</span>
                <span class="val">5 000 XAF</span>
              </div>
              <div class="total-line">
                <span>TVA incluse (19.25%) :</span>
                <span class="val">22 536 XAF</span>
              </div>
              <div class="grand-total-box">
                <span class="grand-total-label">TOTAL RÉGLÉ TTC</span>
                <span class="grand-total-val">140 000 XAF</span>
              </div>
            </div>
          </section>
        </div>

        <!-- 5. LUXURY LEGAL FOOTER -->
        <footer class="official-footer">
          <div class="footer-company">MAISON VAKÁA S.A.R.L. &bull; HAUTE MAROQUINERIE D'ART AFRICAINE</div>
          <div class="footer-locations">
            Atelier Principal : Rue des Palmiers, Bonanjo, Douala, Cameroun &bull; Bureau International : 24 Rue de la Paix, 75002 Paris
          </div>
          <div class="footer-legal-notice">
            Capital Social : 10.000.000 XAF &bull; RCCM : RC/DLA/2024/B/1842 &bull; NUI : M05241892401 &bull; Document officiel tenant lieu de reçu fiscal et certificat d'acquisition
          </div>
        </footer>
      </article>

    </div>
  </main>

  <script>
    function setFontFamily(cls, btn) {
      document.body.classList.remove('font-playfair', 'font-cinzel');
      document.body.classList.add(cls);
      document.querySelectorAll('.toggle-group .toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }

    function setZoom(factor) {
      document.getElementById('scaler').style.transform = 'scale(' + factor + ')';
    }
  </script>
</body>
</html>`;
}

fs.writeFileSync(`${artifactDir}/vakaa_invoice_option1_refined.html`, generateOption1Refined());
console.log('Refined Option 1 created successfully at ' + artifactDir + '/vakaa_invoice_option1_refined.html');
