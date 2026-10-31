const fs = require('fs');
const assets = JSON.parse(fs.readFileSync('.agents/scratch/assets.json', 'utf8'));
const artifactDir = 'C:/Users/EonEmmanuel/.gemini/antigravity/brain/02246bef-2726-42e2-b8ea-46b18aaa9cc7';

function buildStandalone(title, bodyContent, customCss = '') {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Maison VAKÁA — ${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --ink: #1D120A;
      --ink-muted: #6B5E55;
      --gold: #A66B2D;
      --gold-brass: #C59A45;
      --sand-card: #F4EFE9;
      --border-subtle: #E7DED0;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #ECE7DF;
      color: var(--ink);
      padding: 30px 15px;
      display: flex;
      justify-content: center;
      min-height: 100vh;
    }
    .a4-sheet {
      width: 210mm;
      min-height: 297mm;
      background: #FAF8F5;
      box-shadow: 0 16px 48px rgba(0,0,0,0.18);
      border-radius: 3px;
      padding: 16mm 18mm;
      position: relative;
    }
    .serif-display { font-family: 'Cormorant Garamond', Georgia, serif; }
    .serif-playfair { font-family: 'Playfair Display', Georgia, serif; }
    .script-hand { font-family: 'Alex Brush', cursive; }
    .mono-code { font-family: 'Space Grotesk', monospace; }

    @media print {
      body { background: transparent; padding: 0; }
      .a4-sheet { box-shadow: none; width: 100%; min-height: 100%; padding: 12mm 14mm; }
    }
    ${customCss}
  </style>
</head>
<body>
  <article class="a4-sheet">
    ${bodyContent}
  </article>
</body>
</html>`;
}

// OPTION 1
const opt1Css = `
  .d1-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 22px; padding-bottom: 18px; border-bottom: 1px solid var(--border-subtle); }
  .d1-brand { display: flex; flex-direction: column; }
  .d1-logo-img { height: 40px; object-fit: contain; align-self: flex-start; }
  .d1-tagline { font-size: 8.5px; font-weight: 700; letter-spacing: 0.24em; text-transform: uppercase; color: var(--gold); margin-top: 6px; }
  .d1-mission { font-size: 8px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-muted); margin-top: 3px; }
  .d1-meta-block { text-align: right; }
  .d1-title { font-size: 34px; font-weight: 600; line-height: 1; letter-spacing: -0.02em; color: var(--ink); }
  .d1-sub-thank { font-size: 11px; color: var(--ink-muted); margin-top: 4px; max-width: 300px; }
  .d1-meta-grid { margin-top: 12px; display: inline-grid; grid-template-columns: auto auto; gap: 3px 14px; text-align: right; font-size: 11px; }
  .d1-meta-label { color: var(--ink-muted); font-weight: 500; }
  .d1-meta-val { font-weight: 700; color: var(--ink); }
  .status-badge { display: inline-block; padding: 1px 7px; border-radius: 4px; background: #E8F5E9; color: #2E7D32; font-size: 10px; font-weight: 700; letter-spacing: 0.05em; }
  .d1-cards-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 22px; }
  .d1-card { background: var(--sand-card); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 14px 16px; }
  .d1-card-label { font-size: 9px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--gold); margin-bottom: 6px; }
  .d1-card-name { font-size: 13px; font-weight: 700; color: var(--ink); margin-bottom: 3px; }
  .d1-card-text { font-size: 11px; color: var(--ink-muted); line-height: 1.5; }
  .d1-table { width: 100%; border-collapse: collapse; margin-bottom: 22px; }
  .d1-table thead th { background: var(--ink); color: #FAF8F5; font-size: 9px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; padding: 10px 12px; text-align: left; }
  .d1-table thead th:first-child { border-top-left-radius: 6px; }
  .d1-table thead th:last-child { border-top-right-radius: 6px; text-align: right; }
  .d1-table tbody td { padding: 12px 12px; border-bottom: 1px solid var(--border-subtle); font-size: 11px; vertical-align: middle; }
  .d1-prod-cell { display: flex; align-items: center; gap: 12px; }
  .d1-thumb { width: 48px; height: 48px; border-radius: 6px; object-fit: cover; border: 1px solid var(--border-subtle); background: #FFF; flex-shrink: 0; }
  .d1-prod-title { font-weight: 700; font-size: 12px; color: var(--ink); }
  .d1-prod-sku { font-size: 9.5px; color: var(--gold); font-weight: 600; letter-spacing: 0.05em; margin-top: 1px; }
  .d1-prod-desc { font-size: 10.5px; color: var(--ink-muted); line-height: 1.4; max-width: 230px; }
  .d1-num-cell { text-align: center; font-weight: 600; }
  .d1-price-cell { text-align: right; font-weight: 700; color: var(--ink); font-size: 11.5px; }
  .d1-bottom-row { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 20px; align-items: flex-start; margin-bottom: 24px; }
  .d1-script-msg { font-size: 42px; color: var(--gold); line-height: 1; margin-bottom: 10px; }
  .d1-support-title { font-size: 10.5px; font-weight: 700; color: var(--ink); margin-bottom: 3px; }
  .d1-support-info { font-size: 10.5px; color: var(--ink-muted); line-height: 1.55; }
  .d1-support-info a { color: var(--ink); text-decoration: none; font-weight: 600; }
  .d1-totals-card { background: var(--sand-card); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 14px 18px; }
  .d1-total-line { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; font-size: 11px; color: var(--ink-muted); }
  .d1-total-line.grand-total { margin-top: 8px; padding-top: 10px; border-top: 1.5px solid var(--ink); font-size: 14px; font-weight: 800; color: var(--ink); }
  .d1-total-line.grand-total .d1-total-val { font-size: 16px; color: var(--ink); }
  .d1-legal-footer { border-top: 1px solid var(--border-subtle); padding-top: 14px; text-align: center; font-size: 9px; color: #8C7B70; line-height: 1.55; letter-spacing: 0.02em; }
  .d1-legal-footer strong { color: var(--ink); }
`;

const opt1Html = `
  <header class="d1-header">
    <div class="d1-brand">
      <img src="${assets.logo}" alt="VAKÁA" class="d1-logo-img" />
      <div class="d1-tagline">MORE THAN A BAG, A CULTURE</div>
      <div class="d1-mission">Artisanal African Handcrafts for a Modern World</div>
    </div>
    <div class="d1-meta-block">
      <h1 class="d1-title serif-display">Facture</h1>
      <p class="d1-sub-thank">Merci pour votre confiance et votre soutien aux artisans africains.</p>
      <div class="d1-meta-grid">
        <span class="d1-meta-label">Facture N°</span>
        <span class="d1-meta-val">#VAK-2026-0847</span>
        <span class="d1-meta-label">Date d'émission</span>
        <span class="d1-meta-val">26 Avril 2026</span>
        <span class="d1-meta-label">Statut</span>
        <span class="d1-meta-val"><span class="status-badge">● Acquittée</span></span>
        <span class="d1-meta-label">Réf. Commande</span>
        <span class="d1-meta-val">AZE4E5BE44R18137</span>
      </div>
    </div>
  </header>

  <section class="d1-cards-row">
    <div class="d1-card">
      <div class="d1-card-label">👤 FACTURÉ À</div>
      <div class="d1-card-name">Stéphane M. Mbarga</div>
      <div class="d1-card-text">
        Quartier Bonapriso, Rue des Palmiers<br />
        Douala, Cameroun<br />
        lementalistsupreme019@gmail.com &bull; +237 6 99 46 63 81
      </div>
    </div>

    <div class="d1-card">
      <div class="d1-card-label">📦 LIVRAISON & RÈGLEMENT</div>
      <div class="d1-card-name">Colis Sécurisé Express &bull; Remise contre signature</div>
      <div class="d1-card-text">
        Règlement : Flutterwave &bull; Mobile Money (Orange / MTN)<br />
        ID Transaction : FLW-928471902 &bull; Expédié par :<br />
        Atelier Principal VAKÁA &bull; Douala Bonanjo
      </div>
    </div>
  </section>

  <table class="d1-table">
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
          <div class="d1-prod-cell">
            <img src="${assets.bag1}" alt="Sac Asa" class="d1-thumb" />
            <div>
              <div class="d1-prod-title">Sac Bandoulière Asâ</div>
              <div class="d1-prod-sku">REF: VAK-ASA-01</div>
            </div>
          </div>
        </td>
        <td>
          <div class="d1-prod-desc">Raphia naturel sauvage tissé main & cuir pleine fleur ébène tanné végétal.</div>
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
              <div class="d1-prod-sku">REF: VAK-BAG-02</div>
            </div>
          </div>
        </td>
        <td>
          <div class="d1-prod-desc">Toile indigo artisanale cuve naturelle, boucle laiton coulé artisanal.</div>
        </td>
        <td class="d1-num-cell">1</td>
        <td class="d1-price-cell">45 000 XAF</td>
      </tr>
      <tr>
        <td>
          <div class="d1-prod-cell">
            <img src="${assets.bag3}" alt="Porte-cartes Aya" class="d1-thumb" />
            <div>
              <div class="d1-prod-title">Porte-cartes Ayá</div>
              <div class="d1-prod-sku">REF: VAK-AYA-03</div>
            </div>
          </div>
        </td>
        <td>
          <div class="d1-prod-desc">Cuir pleine fleur noir onyx, tranches lissées à chaud & surpiqûres sellier.</div>
        </td>
        <td class="d1-num-cell">1</td>
        <td class="d1-price-cell">15 000 XAF</td>
      </tr>
    </tbody>
  </table>

  <section class="d1-bottom-row">
    <div class="d1-thanks-block">
      <div class="d1-script-msg script-hand">Merci beaucoup !</div>
      <div class="d1-support-title">Une question sur vos pièces ou leur entretien ?</div>
      <div class="d1-support-info">
        Notre conciergerie privée d'atelier est à votre écoute :<br />
        ✉ <a href="mailto:contact@vakaa.online">contact@vakaa.online</a><br />
        ☎ +237 6 70 00 00 00 &bull; WhatsApp Privilège
      </div>
    </div>

    <div class="d1-totals-card">
      <div class="d1-total-line">
        <span>Sous-total articles</span>
        <span style="font-weight: 600; color: var(--ink);">135 000 XAF</span>
      </div>
      <div class="d1-total-line">
        <span>Livraison express d'atelier</span>
        <span style="font-weight: 600; color: var(--ink);">5 000 XAF</span>
      </div>
      <div class="d1-total-line">
        <span>TVA incluse (19.25%)</span>
        <span style="font-weight: 500;">22 536 XAF</span>
      </div>
      <div class="d1-total-line grand-total">
        <span>Total TTC Réglé</span>
        <span class="d1-total-val">140 000 XAF</span>
      </div>
    </div>
  </section>

  <footer class="d1-legal-footer">
    <strong>MAISON VAKÁA S.A.R.L.</strong> &bull; Haute Maroquinerie d'Art Africaine &bull; Capital : 10.000.000 XAF<br />
    Atelier Principal : Rue des Palmiers, Bonanjo, Douala, Cameroun &bull; Bureau International : 24 Rue de la Paix, 75002 Paris<br />
    RCCM : RC/DLA/2024/B/1842 &bull; NUI : M05241892401 &bull; Document officiel tenant lieu de reçu fiscal d'acquisition
  </footer>
`;

fs.writeFileSync(`${artifactDir}/option1_warm_contemporary.html`, buildStandalone("Option 1 : L'Atelier Contemporain", opt1Html, opt1Css));
console.log('Option 1 saved.');

// OPTION 2: HAUTE MAROQUINERIE
const opt2Css = `
  .d2-center-header { text-align: center; padding-bottom: 20px; margin-bottom: 22px; border-bottom: 1.5px solid #D4A43C; position: relative; }
  .d2-center-header::after { content: ''; position: absolute; bottom: -4px; left: 28%; right: 28%; height: 1px; background: #1D120A; }
  .d2-logo-img { height: 46px; object-fit: contain; margin-bottom: 6px; }
  .d2-ateliers { font-size: 8px; letter-spacing: 0.35em; text-transform: uppercase; color: var(--gold); font-weight: 700; }
  .d2-doc-title { font-size: 20px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--ink); margin-top: 10px; font-weight: 600; }
  .d2-split-meta { display: flex; justify-content: space-between; margin-bottom: 26px; font-size: 11px; padding: 0 4px; }
  .d2-meta-col h4 { font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold); margin-bottom: 5px; }
  .d2-table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
  .d2-table th { font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink); border-bottom: 1.5px solid var(--ink); padding: 8px 6px; text-align: left; }
  .d2-table td { padding: 14px 6px; border-bottom: 1px solid #ECE4D8; font-size: 11px; }
  .d2-seal-wrapper { display: flex; align-items: center; gap: 14px; }
  .d2-seal-svg { width: 58px; height: 58px; flex-shrink: 0; }
  .d2-seal-text { font-size: 9.5px; color: var(--ink-muted); line-height: 1.45; font-style: italic; }
`;

const opt2Html = `
  <header class="d2-center-header">
    <img src="${assets.logo}" alt="VAKÁA" class="d2-logo-img" /><br />
    <span class="d2-ateliers">PARIS &bull; DOUALA &bull; ABIDJAN</span>
    <div class="d2-doc-title serif-display">Titre d'Acquisition &bull; Facture N° 0847</div>
  </header>

  <section class="d2-split-meta">
    <div class="d2-meta-col">
      <h4>ACQUÉREUR</h4>
      <strong style="font-size: 13px;">Monsieur Stéphane M. Mbarga</strong><br />
      Bonapriso, Douala &bull; Cameroun<br />
      <span style="color: #6B5E55;">lementalistsupreme019@gmail.com</span>
    </div>
    <div class="d2-meta-col" style="text-align: right;">
      <h4>RÉFÉRENCES D'ATELIER</h4>
      Date d'enregistrement : <strong>26 Avril 2026</strong><br />
      Réf. dossier : <strong>AZE4E5BE44R18137</strong><br />
      Règlement : <strong>Acquitté en intégralité</strong>
    </div>
  </section>

  <table class="d2-table">
    <thead>
      <tr>
        <th style="width: 58%;">DÉSIGNATION DE L'OUVRAGE</th>
        <th style="width: 14%; text-align: center;">UNITÉS</th>
        <th style="width: 28%; text-align: right;">MONTANT (XAF)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <div style="display: flex; gap: 12px; align-items: center;">
            <img src="${assets.bag1}" style="width: 42px; height: 42px; object-fit: cover; border-radius: 2px;" />
            <div>
              <strong class="serif-display" style="font-size: 15px;">Sac Bandoulière Asâ</strong><br />
              <span style="font-size: 9.5px; color: #7A685D;">Raphia sauvage des forêts équatoriales & cuir chocolat</span>
            </div>
          </div>
        </td>
        <td style="text-align: center; font-weight: 600;">1</td>
        <td style="text-align: right; font-weight: 700;">75 000</td>
      </tr>
      <tr>
        <td>
          <div style="display: flex; gap: 12px; align-items: center;">
            <img src="${assets.bag2}" style="width: 42px; height: 42px; object-fit: cover; border-radius: 2px;" />
            <div>
              <strong class="serif-display" style="font-size: 15px;">Baguette Indigo Savane</strong><br />
              <span style="font-size: 9.5px; color: #7A685D;">Teinture végétale indigo naturelle & boucle laiton coulé</span>
            </div>
          </div>
        </td>
        <td style="text-align: center; font-weight: 600;">1</td>
        <td style="text-align: right; font-weight: 700;">45 000</td>
      </tr>
      <tr>
        <td>
          <div style="display: flex; gap: 12px; align-items: center;">
            <img src="${assets.bag3}" style="width: 42px; height: 42px; object-fit: cover; border-radius: 2px;" />
            <div>
              <strong class="serif-display" style="font-size: 15px;">Porte-cartes Ayá</strong><br />
              <span style="font-size: 9.5px; color: #7A685D;">Maroquinerie fine, surpiqûres sellier traditionnelles</span>
            </div>
          </div>
        </td>
        <td style="text-align: center; font-weight: 600;">1</td>
        <td style="text-align: right; font-weight: 700;">15 000</td>
      </tr>
    </tbody>
  </table>

  <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 34px;">
    <div class="d2-seal-wrapper">
      <svg class="d2-seal-svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="46" fill="none" stroke="#D4A43C" stroke-width="1.5" stroke-dasharray="3 2" />
        <circle cx="50" cy="50" r="40" fill="none" stroke="#1D120A" stroke-width="1" />
        <path d="M50 22 L55 35 L68 35 L57 44 L61 57 L50 49 L39 57 L43 44 L32 35 L45 35 Z" fill="#D4A43C" />
        <text x="50" y="72" text-anchor="middle" font-family="'Cormorant Garamond', serif" font-size="8" font-weight="700" letter-spacing="2" fill="#1D120A">VAKÁA ATELIER</text>
        <text x="50" y="80" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="5" font-weight="600" letter-spacing="1" fill="#A66B2D">AUTHENTICITÉ</text>
      </svg>
      <div class="d2-seal-text">
        Ouvrages façonnés à la main selon les règles de l'artisanat d'excellence.<br />
        Chaque pièce est certifiée conforme et garantie par la Maison VAKÁA.
      </div>
    </div>

    <div style="width: 250px; text-align: right;">
      <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px; color: #6B5E55;">
        <span>Sous-total HT</span>
        <span style="font-weight: 600; color: #1D120A;">135 000 XAF</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px; color: #6B5E55;">
        <span>Frais d'acheminement</span>
        <span style="font-weight: 600; color: #1D120A;">5 000 XAF</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; border-top: 1.5px solid #1D120A; padding-top: 10px; color: #1D120A;">
        <span>Total Général TTC</span>
        <span>140 000 XAF</span>
      </div>
    </div>
  </div>

  <footer style="border-top: 1px solid #ECE4D8; padding-top: 16px; text-align: center; font-size: 8.5px; color: #8C7B70; letter-spacing: 0.14em; text-transform: uppercase;">
    Maison VAKÁA &bull; Société par Actions &bull; Salons Paris &bull; Douala &bull; www.vakaa.online
  </footer>
`;

fs.writeFileSync(`${artifactDir}/option2_haute_couture_minimalist.html`, buildStandalone("Option 2 : Haute Maroquinerie", opt2Html, opt2Css));
console.log('Option 2 saved.');

// OPTION 3: ÉDITORIAL MODERNIST
const opt3Css = `
  .d3-hero-row { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid var(--ink); padding-bottom: 14px; margin-bottom: 22px; }
  .d3-big-masthead { font-size: 52px; font-weight: 700; letter-spacing: -0.03em; line-height: 0.88; color: var(--ink); }
  .d3-edition-badge { text-align: right; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; font-weight: 700; color: var(--gold); }
  .d3-grid-dossier { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid var(--ink); padding-bottom: 18px; margin-bottom: 22px; }
  .d3-dossier-item { padding-right: 18px; }
  .d3-dossier-item:last-child { border-left: 1px solid var(--border-subtle); padding-left: 18px; padding-right: 0; }
`;

const opt3Html = `
  <div class="d3-hero-row">
    <div>
      <div style="font-size: 9px; letter-spacing: 0.32em; text-transform: uppercase; color: var(--gold); font-weight: 800; margin-bottom: 4px;">CATALOGUE & BORDEREAU</div>
      <div class="d3-big-masthead serif-display">VAKÁA</div>
    </div>
    <div class="d3-edition-badge">
      <div>ACQUISITION N° 0847</div>
      <div style="color: var(--ink); font-size: 14px; font-weight: 800; margin-top: 2px;">26 . 04 . 2026</div>
    </div>
  </div>

  <div class="d3-grid-dossier">
    <div class="d3-dossier-item">
      <div style="font-size: 9px; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 6px; color: var(--gold);">DOSSIER DESTINATAIRE</div>
      <strong style="font-size: 13px;">Stéphane M. Mbarga</strong><br />
      <span style="font-size: 11px; color: var(--ink-muted);">Douala, Cameroun &bull; lementalistsupreme019@gmail.com</span>
    </div>
    <div class="d3-dossier-item">
      <div style="font-size: 9px; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 6px; color: var(--gold);">DOSSIER EXPÉDITION & PAIEMENT</div>
      <strong style="font-size: 13px;">Colis Sécurisé Prioritaire</strong><br />
      <span style="font-size: 11px; color: var(--ink-muted);">Règlement Mobile Money validé &bull; Réf: AZE4E5BE44R18137</span>
    </div>
  </div>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
    <thead>
      <tr style="border-bottom: 2px solid var(--ink);">
        <th style="text-align: left; padding: 8px 0; font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase;">PIÈCES SÉLECTIONNÉES</th>
        <th style="text-align: center; padding: 8px 0; font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase;">QTÉ</th>
        <th style="text-align: right; padding: 8px 0; font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase;">MONTANT (XAF)</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid #E7DED0;">
        <td style="padding: 14px 0;">
          <div style="display: flex; gap: 14px; align-items: center;">
            <img src="${assets.bag1}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 4px;" />
            <div>
              <strong style="font-size: 13px;">01 / Sac Bandoulière Asâ</strong><br />
              <span style="font-size: 10px; color: var(--ink-muted);">Raphia sauvage noué main & cuir pleine fleur</span>
            </div>
          </div>
        </td>
        <td style="text-align: center; font-weight: 600;">1</td>
        <td style="text-align: right; font-weight: 800; font-size: 13px;">75 000</td>
      </tr>
      <tr style="border-bottom: 1px solid #E7DED0;">
        <td style="padding: 14px 0;">
          <div style="display: flex; gap: 14px; align-items: center;">
            <img src="${assets.bag2}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 4px;" />
            <div>
              <strong style="font-size: 13px;">02 / Baguette Indigo Savane</strong><br />
              <span style="font-size: 10px; color: var(--ink-muted);">Tissage indigo artisanal & boucle laiton gravée</span>
            </div>
          </div>
        </td>
        <td style="text-align: center; font-weight: 600;">1</td>
        <td style="text-align: right; font-weight: 800; font-size: 13px;">45 000</td>
      </tr>
      <tr style="border-bottom: 1px solid #E7DED0;">
        <td style="padding: 14px 0;">
          <div style="display: flex; gap: 14px; align-items: center;">
            <img src="${assets.bag3}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 4px;" />
            <div>
              <strong style="font-size: 13px;">03 / Porte-cartes Ayá</strong><br />
              <span style="font-size: 10px; color: var(--ink-muted);">Maroquinerie d'artisanat d'exception</span>
            </div>
          </div>
        </td>
        <td style="text-align: center; font-weight: 600;">1</td>
        <td style="text-align: right; font-weight: 800; font-size: 13px;">15 000</td>
      </tr>
    </tbody>
  </table>

  <div style="display: flex; justify-content: flex-end; margin-bottom: 30px;">
    <div style="width: 270px;">
      <div style="display: flex; justify-content: space-between; font-size: 11px; padding: 4px 0; color: var(--ink-muted);">
        <span>Sous-total articles</span>
        <span>135 000 XAF</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 11px; padding: 4px 0; color: var(--ink-muted);">
        <span>Expédition sécurisée</span>
        <span>5 000 XAF</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 800; border-top: 2px solid var(--ink); border-bottom: 2px solid var(--ink); padding: 8px 0; margin-top: 8px;">
        <span>TOTAL TTC</span>
        <span>140 000 XAF</span>
      </div>
    </div>
  </div>

  <footer style="font-size: 9px; color: #8C7B70; text-align: center; border-top: 1px solid var(--border-subtle); padding-top: 14px;">
    Maison VAKÁA &bull; Haute Maroquinerie Panafricaine &bull; Douala &bull; Paris &bull; contact@vakaa.online
  </footer>
`;

fs.writeFileSync(`${artifactDir}/option3_editorial_modernist.html`, buildStandalone("Option 3 : Éditorial Modernist", opt3Html, opt3Css));
console.log('Option 3 saved.');

// OPTION 4: HÉRITAGE DORÉ
const opt4Css = `
  .d4-bordered-frame { border: 1.5px solid #C59A45; padding: 10mm 12mm; min-height: calc(297mm - 34mm); position: relative; }
  .d4-corner-flourish { position: absolute; width: 14px; height: 14px; border: 2px solid var(--ink); }
  .d4-tl { top: -2px; left: -2px; border-right: 0; border-bottom: 0; }
  .d4-tr { top: -2px; right: -2px; border-left: 0; border-bottom: 0; }
  .d4-bl { bottom: -2px; left: -2px; border-right: 0; border-top: 0; }
  .d4-br { bottom: -2px; right: -2px; border-left: 0; border-top: 0; }
`;

const opt4Html = `
  <div class="d4-bordered-frame">
    <div class="d4-corner-flourish d4-tl"></div>
    <div class="d4-corner-flourish d4-tr"></div>
    <div class="d4-corner-flourish d4-bl"></div>
    <div class="d4-corner-flourish d4-br"></div>

    <div style="text-align: center; margin-bottom: 22px;">
      <img src="${assets.logo}" style="height: 42px;" /><br />
      <div style="font-size: 8.5px; letter-spacing: 0.32em; text-transform: uppercase; color: var(--gold-brass); font-weight: 800; margin-top: 6px;">BORDEREAU D'ACQUISITION CERTIFIÉ</div>
      <div style="font-size: 11px; color: var(--ink-muted); font-style: italic; margin-top: 2px;">Ateliers de haute maroquinerie d'Afrique Centrale</div>
    </div>

    <div style="display: flex; justify-content: space-between; border-top: 1px solid #D4A43C; border-bottom: 1px solid #D4A43C; padding: 10px 0; margin-bottom: 22px; font-size: 11px;">
      <div>
        <span style="color: var(--gold); font-weight: 700;">DESTINATAIRE :</span> Stéphane M. Mbarga &bull; Douala
      </div>
      <div>
        <span style="color: var(--gold); font-weight: 700;">ACTE FISCAL :</span> VAK-2026-0847 &bull; 26/04/2026
      </div>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <thead>
        <tr style="background: #F4EFE9;">
          <th style="padding: 9px; text-align: left; font-size: 9.5px; color: var(--ink);">PIÈCE D'ATELIER</th>
          <th style="padding: 9px; text-align: center; font-size: 9.5px; color: var(--ink);">RÉF.</th>
          <th style="padding: 9px; text-align: center; font-size: 9.5px; color: var(--ink);">QTÉ</th>
          <th style="padding: 9px; text-align: right; font-size: 9.5px; color: var(--ink);">MONTANT</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px dashed #D4A43C;">
          <td style="padding: 10px 8px;">
            <div style="display: flex; gap: 10px; align-items: center;">
              <img src="${assets.bag1}" style="width: 38px; height: 38px; object-fit: cover; border-radius: 3px; border: 1px solid #D4A43C;" />
              <div>
                <strong>Sac Bandoulière Asâ</strong><br />
                <span style="font-size: 9.5px; color: var(--ink-muted);">Raphia sauvage noué & Cuir ébène</span>
              </div>
            </div>
          </td>
          <td style="text-align: center; font-size: 10px; color: var(--gold); font-weight: 600;">VAK-ASA-01</td>
          <td style="text-align: center;">1</td>
          <td style="text-align: right; font-weight: 700;">75 000 XAF</td>
        </tr>
        <tr style="border-bottom: 1px dashed #D4A43C;">
          <td style="padding: 10px 8px;">
            <div style="display: flex; gap: 10px; align-items: center;">
              <img src="${assets.bag2}" style="width: 38px; height: 38px; object-fit: cover; border-radius: 3px; border: 1px solid #D4A43C;" />
              <div>
                <strong>Baguette Indigo Savane</strong><br />
                <span style="font-size: 9.5px; color: var(--ink-muted);">Toile indigo artisanale & Laiton</span>
              </div>
            </div>
          </td>
          <td style="text-align: center; font-size: 10px; color: var(--gold); font-weight: 600;">VAK-BAG-02</td>
          <td style="text-align: center;">1</td>
          <td style="text-align: right; font-weight: 700;">45 000 XAF</td>
        </tr>
        <tr style="border-bottom: 1px dashed #D4A43C;">
          <td style="padding: 10px 8px;">
            <div style="display: flex; gap: 10px; align-items: center;">
              <img src="${assets.bag3}" style="width: 38px; height: 38px; object-fit: cover; border-radius: 3px; border: 1px solid #D4A43C;" />
              <div>
                <strong>Porte-cartes Ayá</strong><br />
                <span style="font-size: 9.5px; color: var(--ink-muted);">Cuir pleine fleur, couture sellier</span>
              </div>
            </div>
          </td>
          <td style="text-align: center; font-size: 10px; color: var(--gold); font-weight: 600;">VAK-AYA-03</td>
          <td style="text-align: center;">1</td>
          <td style="text-align: right; font-weight: 700;">15 000 XAF</td>
        </tr>
      </tbody>
    </table>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px;">
      <div style="font-size: 38px; color: var(--gold);" class="script-hand">Merci infiniment</div>
      <div style="text-align: right;">
        <div style="font-size: 11px; color: var(--ink-muted);">Total Articles : 135 000 XAF</div>
        <div style="font-size: 11px; color: var(--ink-muted);">Livraison Express : 5 000 XAF</div>
        <div style="font-size: 16px; font-weight: 800; color: #1D120A; margin-top: 6px;">TOTAL ACQUITTÉ : 140 000 XAF</div>
      </div>
    </div>

    <div style="margin-top: 30px; border-top: 1px solid #E7DED0; padding-top: 14px; font-size: 8.5px; color: #8C7B70; text-align: center;">
      Certifié conforme par les Ateliers Maison VAKÁA &bull; Douala &bull; Paris &bull; Document fiscal officiel
    </div>
  </div>
`;

fs.writeFileSync(`${artifactDir}/option4_artisanal_heritage.html`, buildStandalone("Option 4 : Héritage Doré", opt4Html, opt4Css));
console.log('Option 4 saved.');

// OPTION 5: MONOCHROME STUDIO PRIVÉ
const opt5Css = `
  .d5-header { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 16px; border-bottom: 2px solid #000000; margin-bottom: 24px; }
  .d5-logotype { font-size: 26px; font-weight: 800; letter-spacing: 0.28em; text-transform: uppercase; line-height: 1; }
  .d5-subtitle { font-size: 8px; letter-spacing: 0.35em; text-transform: uppercase; color: #777777; margin-top: 6px; font-weight: 600; }
  .d5-meta-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; padding: 14px 0; border-bottom: 1px solid #000000; margin-bottom: 26px; font-size: 10px; }
  .d5-meta-cell h5 { font-size: 8px; letter-spacing: 0.2em; text-transform: uppercase; color: #666666; margin-bottom: 4px; font-weight: 600; }
  .d5-meta-cell strong { font-size: 11px; font-weight: 700; color: #000000; }
  .d5-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
  .d5-table th { border-bottom: 1px solid #000000; font-size: 8.5px; letter-spacing: 0.22em; text-transform: uppercase; padding: 8px 4px; text-align: left; font-weight: 700; }
  .d5-table td { padding: 14px 4px; border-bottom: 1px solid #E5E5E5; font-size: 11px; vertical-align: middle; }
`;

const opt5Html = `
  <header class="d5-header">
    <div>
      <div class="d5-logotype">MAISON VAKÁA</div>
      <div class="d5-subtitle">STUDIO PRIVÉ &bull; DOUALA & PARIS</div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 16px; font-weight: 800; letter-spacing: 0.1em;">FACTURE N° 0847</div>
      <div style="font-size: 10px; color: #555555; margin-top: 3px;">26 AVRIL 2026</div>
    </div>
  </header>

  <section class="d5-meta-bar">
    <div class="d5-meta-cell">
      <h5>CLIENT</h5>
      <strong>Stéphane M. Mbarga</strong>
    </div>
    <div class="d5-meta-cell">
      <h5>DESTINATION</h5>
      <strong>Douala, Cameroun</strong>
    </div>
    <div class="d5-meta-cell">
      <h5>DOSSIER</h5>
      <strong>AZE4E5BE44R18137</strong>
    </div>
    <div class="d5-meta-cell">
      <h5>STATUT</h5>
      <strong style="background: #000; color: #FFF; padding: 2px 6px; border-radius: 2px;">RÉGLÉ 100%</strong>
    </div>
  </section>

  <table class="d5-table">
    <thead>
      <tr>
        <th style="width: 55%;">DESCRIPTION DU PRODUIT</th>
        <th style="width: 20%;">RÉFÉRENCE</th>
        <th style="width: 10%; text-align: center;">QTÉ</th>
        <th style="width: 15%; text-align: right;">PRIX</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <div style="display: flex; gap: 12px; align-items: center;">
            <img src="${assets.bag1}" style="width: 44px; height: 44px; object-fit: cover; filter: grayscale(10%); border: 1px solid #EEE;" />
            <div>
              <strong style="font-size: 12px; text-transform: uppercase;">Sac Bandoulière Asâ</strong><br />
              <span style="font-size: 10px; color: #666;">Raphia naturel & finitions cuir pleine fleur</span>
            </div>
          </div>
        </td>
        <td class="mono-code" style="font-size: 10.5px;">VAK-ASA-01</td>
        <td style="text-align: center; font-weight: 700;">1</td>
        <td style="text-align: right; font-weight: 700;">75 000 XAF</td>
      </tr>
      <tr>
        <td>
          <div style="display: flex; gap: 12px; align-items: center;">
            <img src="${assets.bag2}" style="width: 44px; height: 44px; object-fit: cover; filter: grayscale(10%); border: 1px solid #EEE;" />
            <div>
              <strong style="font-size: 12px; text-transform: uppercase;">Baguette Indigo Savane</strong><br />
              <span style="font-size: 10px; color: #666;">Toile indigo artisanale & boucle laiton</span>
            </div>
          </div>
        </td>
        <td class="mono-code" style="font-size: 10.5px;">VAK-BAG-02</td>
        <td style="text-align: center; font-weight: 700;">1</td>
        <td style="text-align: right; font-weight: 700;">45 000 XAF</td>
      </tr>
      <tr>
        <td>
          <div style="display: flex; gap: 12px; align-items: center;">
            <img src="${assets.bag3}" style="width: 44px; height: 44px; object-fit: cover; filter: grayscale(10%); border: 1px solid #EEE;" />
            <div>
              <strong style="font-size: 12px; text-transform: uppercase;">Porte-cartes Ayá</strong><br />
              <span style="font-size: 10px; color: #666;">Cuir noir noble, couture sellier main</span>
            </div>
          </div>
        </td>
        <td class="mono-code" style="font-size: 10.5px;">VAK-AYA-03</td>
        <td style="text-align: center; font-weight: 700;">1</td>
        <td style="text-align: right; font-weight: 700;">15 000 XAF</td>
      </tr>
    </tbody>
  </table>

  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 34px;">
    <div style="max-width: 320px;">
      <div style="font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; font-weight: 800; margin-bottom: 6px;">CERTIFICAT NUMÉRIQUE</div>
      <div style="font-size: 10px; color: #666; line-height: 1.5;">
        Facture et titre de propriété horodatés sur les serveurs de la Maison VAKÁA. Ce document certifie l'authenticité des pièces d'artisanat acquises.
      </div>
    </div>

    <div style="width: 260px;">
      <div style="display: flex; justify-content: space-between; font-size: 11px; padding: 4px 0; color: #666;">
        <span>Sous-total</span>
        <span style="font-weight: 600; color: #000;">135 000 XAF</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 11px; padding: 4px 0; color: #666;">
        <span>Livraison</span>
        <span style="font-weight: 600; color: #000;">5 000 XAF</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 900; border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 8px 0; margin-top: 6px;">
        <span>TOTAL NET TTC</span>
        <span>140 000 XAF</span>
      </div>
    </div>
  </div>

  <footer style="border-top: 1px solid #E5E5E5; padding-top: 14px; text-align: center; font-size: 8.5px; color: #888888; letter-spacing: 0.1em; text-transform: uppercase;">
    Maison VAKÁA &bull; Société par Actions &bull; Douala &bull; Paris &bull; contact@vakaa.online
  </footer>
`;

fs.writeFileSync(`${artifactDir}/option5_monochrome_studio_prive.html`, buildStandalone("Option 5 : Monochrome Studio Privé", opt5Html, opt5Css));
console.log('All 5 individual options saved successfully!');

