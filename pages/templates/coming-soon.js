/**
 * Coming soon — a launch date, what to expect, and optionally a waitlist.
 *
 * OSS's layout and feature cards. The ticking countdown is deliberately gone: it
 * was the page's only reason to run script, and a visitor page now ships none.
 * The date renders formatted and static, which is also what the hosted runtime
 * already did.
 *
 * ponytail: static date instead of a live countdown. To bring the clock back
 * without loosening the CSP, put the target in a data attribute so the script
 * text is constant, hash it at build time, and add that hash to script-src.
 */

import { escapeHtml } from '../safety.js';
import { eyebrow, features, footer, masthead, socials, stats } from '../components.js';
import { captureAllows, leadForm } from '../forms.js';
import { label, LABELS } from '../defaults.js';

export function needsForm(config) {
  return captureAllows('waitlist', 'coming_soon', config);
}

/** A launch date the owner typed, shown the way a reader expects it. */
export function formatLaunchDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  try {
    return new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

function panel(view) {
  const { cfg } = view;
  const wantsWaitlist = captureAllows('waitlist', 'coming_soon', cfg);

  if (cfg.launch_date) {
    return `<aside class="dp-panel" aria-label="Launch">
      <div class="dp-panel-label">${escapeHtml(label(cfg, 'launchLabel'))}</div>
      <h2 class="dp-heading">${escapeHtml(formatLaunchDate(cfg.launch_date))}</h2>
      ${cfg.launch_note ? `<p class="dp-note">${escapeHtml(cfg.launch_note)}</p>` : ''}
      ${stats(view.stats)}
      ${wantsWaitlist ? `<p class="dp-copy">${escapeHtml(LABELS.waitlistCopy)}</p>${leadForm('waitlist', cfg.capture || {})}` : ''}
    </aside>`;
  }

  const status = cfg.status_panel || {};
  const hasStatus = status.label || status.title || status.text;
  if (!hasStatus && !wantsWaitlist) return '';
  return `<aside class="dp-panel" aria-label="Status">
    ${status.label ? `<div class="dp-panel-label">${escapeHtml(status.label)}</div>` : ''}
    ${status.title ? `<h2 class="dp-heading">${escapeHtml(status.title)}</h2>` : ''}
    ${status.text ? `<p class="dp-copy">${escapeHtml(status.text)}</p>` : ''}
    ${wantsWaitlist ? `<p class="dp-copy">${escapeHtml(LABELS.waitlistCopy)}</p>${leadForm('waitlist', cfg.capture || {})}` : ''}
  </aside>`;
}

export function render(view) {
  const { cfg, title, status, eyebrowText } = view;
  const side = panel(view);

  return `<div class="dp-wrap">
    ${masthead(title, status)}
    <div class="${side ? 'dp-grid' : ''}">
      <section>
        ${eyebrow(eyebrowText)}
        <h1 class="dp-title dp-title-compact dp-mono">${escapeHtml(title)}</h1>
        ${cfg.headline ? `<h2 class="dp-heading">${escapeHtml(cfg.headline)}</h2>` : ''}
        ${cfg.subhead ? `<p class="dp-lede">${escapeHtml(cfg.subhead)}</p>` : ''}
        ${cfg.body ? `<p class="dp-copy">${escapeHtml(cfg.body)}</p>` : ''}
        ${socials(cfg.socials)}
      </section>
      ${side}
    </div>
    ${features(cfg.features)}
    ${footer(cfg.footer_text, cfg.footer_credit)}
  </div>`;
}
