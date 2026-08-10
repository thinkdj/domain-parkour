/**
 * Landing - the domain is in use and points somewhere, or lists a few links.
 *
 * OSS's layout, plus the cloud runtime's single-destination CTA. The masthead
 * badge is the live variant here: this is the one mode where the hostname is
 * actually serving something.
 */

import { escapeHtml } from '../safety.js';
import { captureBlock, captureNeedsForm, eyebrow, footer, linkList, masthead, socials } from '../components.js';
import { LABELS } from '../defaults.js';

export const DESTINATION_PATH = '/_parkour/go/destination';

export function needsForm(config) {
  return captureNeedsForm('landing', config);
}

export function render(view) {
  const { cfg, title, status, eyebrowText } = view;
  const links = linkList(cfg.links, { label: cfg.links_label });

  return `<div class="dp-wrap">
    ${masthead(title, status, true)}
    <div class="${links ? 'dp-grid' : 'dp-wrap-narrow'}">
      <section>
        ${eyebrow(eyebrowText)}
        <h1 class="dp-title dp-title-compact dp-mono">${escapeHtml(title)}</h1>
        ${cfg.headline ? `<h2 class="dp-heading">${escapeHtml(cfg.headline)}</h2>` : ''}
        ${cfg.subhead ? `<p class="dp-lede">${escapeHtml(cfg.subhead)}</p>` : ''}
        ${cfg.body ? `<p class="dp-copy">${escapeHtml(cfg.body)}</p>` : ''}
        ${cfg.destination_url
          ? `<p style="margin-top:24px"><a class="dp-button" href="${DESTINATION_PATH}">`
            + `${escapeHtml(LABELS.continueButton)}</a></p>`
          : ''}
        ${socials(cfg.socials)}
        ${captureBlock('landing', cfg)}
      </section>
      ${links}
    </div>
    ${footer(cfg.footer_text, cfg.footer_credit)}
  </div>`;
}
