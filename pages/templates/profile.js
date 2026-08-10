/**
 * Profile — one person, one card. Straight from the OSS template, which was the
 * only implementation with an avatar, initials fallback and link list; the cloud
 * runtime rendered a bio paragraph and nothing else.
 */

import { escapeHtml } from '../safety.js';
import { footer, linkList, masthead, socials } from '../components.js';

export function needsForm() {
  return false;
}

/** Up to two initials, so an unset avatar still reads as a person. */
export function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (!parts.length) return '?';
  return parts.map((part) => [...part][0]).join('').toUpperCase();
}

function avatar(cfg, displayName) {
  if (cfg.avatar_url) {
    return `<div class="dp-avatar"><img src="${escapeHtml(cfg.avatar_url)}"`
      + ` alt="Portrait of ${escapeHtml(displayName)}" width="88" height="88"></div>`;
  }
  return `<div class="dp-avatar" aria-label="${escapeHtml(displayName)}">`
    + `${escapeHtml(initials(displayName))}</div>`;
}

export function render(view) {
  const { cfg, title, status } = view;
  const displayName = cfg.name || title;

  return `<div class="dp-wrap dp-wrap-narrow">
    ${masthead(title, status)}
    <section class="dp-panel">
      <div class="dp-profile-head">
        ${avatar(cfg, displayName)}
        <div class="dp-profile-head-copy">
          ${cfg.role
            ? `<div class="dp-eyebrow"><span class="dot" aria-hidden="true"></span>${escapeHtml(cfg.role)}</div>`
            : ''}
          <h1 class="dp-name">${escapeHtml(displayName)}</h1>
        </div>
      </div>
      ${cfg.bio ? `<p class="dp-lede">${escapeHtml(cfg.bio)}</p>` : ''}
      ${linkList(cfg.links, { bare: true })}
      ${socials(cfg.socials)}
    </section>
    ${footer(cfg.footer_text, cfg.footer_credit)}
  </div>`;
}
