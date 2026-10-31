const fs = require('fs');
const assets = JSON.parse(fs.readFileSync('.agents/scratch/assets.json', 'utf8'));

const templateCode = `export const vakaaInvoiceTemplate = \`
<!DOCTYPE html>
<html lang="fr" style="margin: 0; padding: 0;">
<head>
  <meta charset="utf-8" />
  <title>Facture {{ invoicePrefix }}{{ invoiceNumber }} - {{ order.code }} - Maison VAKÁA</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 12mm 14mm 12mm 14mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    :root {
      --paper: #FAF8F5;
      --surface-card: #F5EFEB;
      --border-card: #E4DBD1;
      --border-subtle: #ECE4DA;
      --ink: #140C06;
      --ink-sec: #4A3A2F;
      --ink-muted: #736357;
      --gold: #9B6327;
      --gold-dark: #7D4C18;
      --border-dark: #140C06;
    }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: var(--ink);
      background: var(--paper);
      margin: 0;
      padding: 0;
      font-size: 10.5px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }
    .font-serif { font-family: 'Playfair Display', Georgia, serif; }
    .font-mono { font-family: 'Space Grotesk', monospace; }
    .font-hand { font-family: 'Alex Brush', cursive; }

    /* 1. HEADER SECTION */
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
    .fallback-thumb {
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--surface-card);
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
  </style>
</head>
<body>

  <!-- 1. HEADER SECTION -->
  <header class="header-block">
    <div class="brand-section">
      <img src="${assets.logo}" alt="Maison VAKÁA" class="brand-logo" />
      <div class="brand-tagline">MORE THAN A BAG, A CULTURE</div>
      <div class="brand-heritage">Haute Maroquinerie d'Art Panafricaine</div>
    </div>

    <div class="doc-meta-section">
      {{#if isCreditInvoice}}
        <h1 class="doc-title font-serif" style="color: #991B1B;">AVOIR</h1>
        <div class="doc-number-badge" style="color: #991B1B; border-color: #F87171;">N° AV-{{ invoiceNumber }}</div>
      {{else}}
        <h1 class="doc-title font-serif">FACTURE</h1>
        <div class="doc-number-badge">N° {{ invoicePrefix }}{{ invoiceNumber }}</div>
      {{/if}}
      <div class="meta-table">
        <span class="meta-term">Date d'émission</span>
        <span class="meta-def">{{ orderDate }}</span>
        <span class="meta-term">Réf. Commande</span>
        <span class="meta-def font-mono">#{{ order.code }}</span>
        {{#if originalInvoiceNumber}}
          <span class="meta-term">Facture d'origine</span>
          <span class="meta-def font-mono">VAK-{{ originalInvoiceNumber }}</span>
        {{/if}}
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
        {{#if order.customer}}
          <div class="card-main-name">{{ order.customer.firstName }} {{ order.customer.lastName }}</div>
          <div class="card-detail-line"><strong>Courriel :</strong> {{ order.customer.emailAddress }}</div>
        {{/if}}
        {{#if order.shippingAddress}}
          {{#unless order.customer}}
            <div class="card-main-name">{{ order.shippingAddress.fullName }}</div>
          {{/unless}}
          <div class="card-detail-line">
            {{ order.shippingAddress.streetLine1 }}{{#if order.shippingAddress.streetLine2}}, {{ order.shippingAddress.streetLine2 }}{{/if}}<br />
            {{ order.shippingAddress.city }}{{#if order.shippingAddress.postalCode}}, {{ order.shippingAddress.postalCode }}{{/if}} &bull; {{ order.shippingAddress.country }}<br />
            {{#if order.shippingAddress.phoneNumber}}
              <strong>Téléphone :</strong> {{ order.shippingAddress.phoneNumber }}
            {{/if}}
          </div>
        {{/if}}
      </div>
    </div>

    <div class="client-card">
      <div class="card-title-bar">
        <span class="card-heading">📦 LIVRAISON & RÈGLEMENT</span>
        <span class="card-status-note" style="color: #1E6B24;">Paiement Sécurisé</span>
      </div>
      <div>
        <div class="card-main-name">{{ shippingMethodName }}</div>
        <div class="card-detail-line">
          <strong>Mode de règlement :</strong> {{ paymentMethodName }}<br />
          <strong>Devise de transaction :</strong> {{ order.currencyCode }}<br />
          <strong>Atelier expéditeur :</strong> Atelier Principal &bull; Douala Bonanjo<br />
          <strong>Remise :</strong> En main propre sous coffret d'art VAKÁA
        </div>
      </div>
    </div>
  </section>

  <!-- 3. ITEM TABLE (HARMONIOUS & CRISP) -->
  <section class="items-container">
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 44%;">ARTICLE & CONFECTION</th>
          <th style="width: 26%;">MATIÈRES & FINITION</th>
          <th style="width: 10%; text-align: center;">QTÉ</th>
          <th style="width: 10%; text-align: right;">PRIX UNIT.</th>
          <th style="width: 10%; text-align: right;">TOTAL</th>
        </tr>
      </thead>
      <tbody>
        {{#each formattedLines}}
        <tr>
          <td>
            <div class="item-entity">
              {{#if thumbnail}}
                <img src="{{ thumbnail }}" alt="{{ name }}" class="item-thumbnail" />
              {{else}}
                <div class="item-thumbnail fallback-thumb">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9B6327" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                </div>
              {{/if}}
              <div>
                <div class="item-title">{{ name }}</div>
                <div class="item-sku font-mono">{{ sku }}</div>
              </div>
            </div>
          </td>
          <td>
            <div class="item-spec">
              {{#if variantName}}
                Finition Atelier : {{ variantName }} &bull;
              {{/if}}
              Raphia naturel & cuirs nobles tannage végétal.
            </div>
          </td>
          <td class="item-qty">{{ quantity }}</td>
          <td class="item-price">{{ unitPrice }}</td>
          <td class="item-total">{{ linePrice }}</td>
        </tr>
        {{/each}}
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
        Courriel : <strong>contact@vakaa.online</strong> &bull; Ligne Directe : <strong>+237 6 70 00 00 00</strong>
      </div>
    </div>

    <div class="totals-box">
      <div class="financial-line">
        <span>Sous-total articles :</span>
        <span class="figure">{{ formattedSubTotal }}</span>
      </div>
      <div class="financial-line">
        <span>Livraison sécurisée d'atelier :</span>
        <span class="figure">{{ formattedShipping }}</span>
      </div>
      {{#if formattedDiscount}}
      <div class="financial-line" style="color: #7D4C18;">
        <span>Privilège Maison déduit :</span>
        <span class="figure" style="color: #7D4C18;">-{{ formattedDiscount }}</span>
      </div>
      {{/if}}
      <div class="grand-total-row">
        <span class="grand-total-tag">TOTAL TTC RÉGLÉ</span>
        <span class="grand-total-num">{{ formattedTotal }}</span>
      </div>
    </div>
  </section>

  <!-- 5. LEGAL FOOTER -->
  <footer class="legal-footer">
    <div class="legal-company-name">MAISON VAKÁA S.A.R.L. &bull; HAUTE MAROQUINERIE D'ART AFRICAINE</div>
    <div class="legal-addresses">
      Atelier Principal : Rue des Palmiers, Bonanjo, Douala, Cameroun &bull; Bureau International : 24 Rue de la Paix, 75002 Paris
    </div>
    <div class="legal-registration">
      Capital Social : 10.000.000 XAF &bull; RCCM : RC/DLA/2024/B/1842 &bull; NUI : M05241892401 &bull; Document officiel tenant lieu de reçu fiscal d'acquisition
    </div>
  </footer>

</body>
</html>
\`;
`;

fs.writeFileSync('apps/server/src/plugins/invoice/vakaa-invoice.template.ts', templateCode);
console.log('Successfully updated apps/server/src/plugins/invoice/vakaa-invoice.template.ts!');
