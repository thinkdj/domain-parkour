/**
 * Parking — the domain is for sale, or simply held.
 *
 * OSS's two-column layout (hostname as hero, offer panel beside it), with the
 * cloud runtime's capture form and checkout handoff in place of the mailto link
 * OSS assembled with script.
 *
 * There is no mailto fallback. A parked page is exactly the surface spam harvests
 * from, so if the owner is reachable at all it is through the form — the address
 * never reaches the HTML. The app that stores submissions owns the POST handler.
 */

import { escapeHtml } from '../safety.js';
import { eyebrow, footer, masthead, socials, stats } from '../components.js';
import { captureAllows, leadForm } from '../forms.js';
import { label, LABELS } from '../defaults.js';

export const CHECKOUT_PATH = '/_parkour/go/checkout';

export function needsForm(config) {
  return captureAllows('offer', 'parking', config);
}

export function render(view) {
  const { cfg, title, status, eyebrowText } = view;
  const hasPrice = Boolean(cfg.price);
  const takesOffers = captureAllows('offer', 'parking', cfg);

  const panel = [
    `<div class="dp-panel-label">${escapeHtml(hasPrice ? label(cfg, 'priceLabel') : label(cfg, 'inquiryLabel'))}</div>`,
    hasPrice
      ? `<div class="dp-price">${escapeHtml(cfg.price)}</div>`
      : `<h2 class="dp-heading">${escapeHtml(label(cfg, 'noPriceTitle'))}</h2>`,
    `<p class="dp-copy">${escapeHtml(takesOffers ? label(cfg, 'contactCopy') : label(cfg, 'availabilityCopy'))}</p>`,
    cfg.checkout_url
      ? `<a class="dp-button dp-button-block" href="${CHECKOUT_PATH}">${escapeHtml(LABELS.checkoutButton)}</a>`
      : '',
    stats(view.stats),
    socials(cfg.socials),
    takesOffers
      ? `<details class="dp-contact-disclosure"><summary>Reach out</summary>${leadForm('offer', cfg.capture || {}, cfg)}</details>`
      : '',
  ].join('');

  return `<div class="dp-wrap">
    ${masthead(title, status)}
    <div class="dp-grid">
      <section>
        ${eyebrow(eyebrowText)}
        <h1 class="dp-title dp-mono">${escapeHtml(title)}</h1>
        ${cfg.headline ? `<h2 class="dp-heading">${escapeHtml(cfg.headline)}</h2>` : ''}
        ${cfg.subhead ? `<p class="dp-lede">${escapeHtml(cfg.subhead)}</p>` : ''}
        ${cfg.body ? `<p class="dp-copy">${escapeHtml(cfg.body)}</p>` : ''}
        ${cfg.note ? `<p class="dp-note">${escapeHtml(cfg.note)}</p>` : ''}
      </section>
      <aside class="dp-panel" aria-label="${escapeHtml(LABELS.offerRegion)}">${panel}</aside>
    </div>
    ${footer(cfg.footer_text, cfg.footer_credit)}
  </div>`;
}
