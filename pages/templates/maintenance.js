/**
 * Maintenance — the owner took the site down on purpose.
 *
 * From the cloud runtime, which was the only implementation. Its real substance
 * is not the markup: the handler pairs this with a 503 and a Retry-After, so
 * crawlers treat it as temporary instead of de-indexing the host.
 */

import { escapeHtml } from '../safety.js';
import { footer, masthead } from '../components.js';
import { LABELS } from '../defaults.js';

export function needsForm() {
  return false;
}

export function render(view) {
  const { cfg, title, status } = view;
  const help = cfg.delivery?.maintenance?.help_url || '';

  return `<div class="dp-wrap dp-wrap-narrow">
    ${masthead(title, status)}
    <section class="dp-panel">
      <h1 class="dp-heading" style="margin-top:0">${escapeHtml(cfg.headline || LABELS.maintenanceTitle)}</h1>
      <p class="dp-copy">${escapeHtml(cfg.subhead || LABELS.maintenanceCopy)}</p>
      ${help
        ? `<p style="margin-top:24px"><a class="dp-button" href="${escapeHtml(help)}"`
          + ` rel="noopener noreferrer">${escapeHtml(LABELS.maintenanceHelp)}</a></p>`
        : ''}
    </section>
    ${footer(cfg.footer_text, cfg.footer_credit)}
  </div>`;
}
