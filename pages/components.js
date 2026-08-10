/**
 * The small pieces every mode shares. Carried over from the OSS
 * `templates/components.js`, plus the stats row that used to be inline in the
 * parking template.
 */

import { escapeHtml } from './safety.js';
import { icon } from './icons.js';
import { LABELS } from './defaults.js';
import { themeToggle } from './theme.js';

const SOCIAL_ICONS = {
  twitter: 'brand-x', x: 'brand-x', facebook: 'brand-facebook',
  instagram: 'brand-instagram', linkedin: 'brand-linkedin', github: 'brand-github',
  email: 'mail',
};

/** The accessible name, spelled the way the platform spells it. */
const SOCIAL_LABELS = {
  twitter: 'X', x: 'X', facebook: 'Facebook', instagram: 'Instagram',
  linkedin: 'LinkedIn', github: 'GitHub', email: 'Email',
};

export const EXTERNAL_LINK_ICON = icon('external-link', { size: 18, cls: 'arrow' });

/**
 * The chrome line above the page: the hostname in mono, and one status badge.
 * `live` picks the success variant. Nothing here pulses — the design system
 * reserves badge motion for "propagating", which a served page never is.
 */
export function masthead(title, status, live = false) {
  return `<header class="dp-masthead"><span class="dp-mono">${escapeHtml(title)}</span>`
    + `<div class="dp-masthead-actions"><span class="dp-status${live ? ' live' : ''}">`
    + `<span class="dp-status-dot" aria-hidden="true"></span>`
    + `<span>${escapeHtml(status)}</span></span>${themeToggle()}</div></header>`;
}

export function eyebrow(text) {
  if (!text) return '';
  return `<div class="dp-eyebrow"><span class="dot" aria-hidden="true"></span>${escapeHtml(text)}</div>`;
}

export function stats(rows) {
  if (!rows?.length) return '';
  const cells = rows.map(({ value, label }) => (
    `<div class="dp-stat"><div class="v">${escapeHtml(value)}</div>`
    + `<div class="l">${escapeHtml(label)}</div></div>`
  )).join('');
  return `<div class="dp-stats" aria-label="${escapeHtml(LABELS.statsRegion)}">${cells}</div>`;
}

export function socials(links) {
  const entries = Object.entries(links || {});
  if (!entries.length) return '';
  const items = entries.map(([platform, url]) => {
    const label = SOCIAL_LABELS[platform] || platform;
    const external = !url.startsWith('mailto:');
    return `<a href="${escapeHtml(url)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}`
      + ` class="dp-social" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}">`
      + `${icon(SOCIAL_ICONS[platform] || 'external-link')}</a>`;
  }).join('');
  return `<nav class="dp-socials" aria-label="${escapeHtml(LABELS.socialsRegion)}">${items}</nav>`;
}

/**
 * `bare` drops the panel wrapper, for a caller that is already inside one —
 * profile puts its links in the same card as the avatar.
 */
export function linkList(links, { label = '', bare = false } = {}) {
  if (!links?.length) return '';
  const items = links.map(({ title, url }, index) => (
    `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="dp-link">`
    + `<span class="dp-link-main">`
    + `<span class="dp-link-index">${String(index + 1).padStart(2, '0')}</span>`
    + `<span class="label">${escapeHtml(title)}</span></span>`
    + `${EXTERNAL_LINK_ICON}</a>`
  )).join('');
  const list = `<div class="dp-link-list"${bare ? ' style="margin-top:24px"' : ''}>${items}</div>`;
  if (bare) return list;
  return `<nav class="dp-panel" aria-label="${escapeHtml(LABELS.linksRegion)}">`
    + (label ? `<div class="dp-panel-label" style="margin-bottom:16px">${escapeHtml(label)}</div>` : '')
    + `${list}</nav>`;
}

export function features(list) {
  if (!list?.length) return '';
  const cards = list.map(({ title, description }, index) => (
    `<article class="dp-card">`
    + `<div class="dp-feature-index">${String(index + 1).padStart(2, '0')}</div>`
    + `<h3 class="dp-feature-title">${escapeHtml(title)}</h3>`
    + (description ? `<p class="dp-feature-copy">${escapeHtml(description)}</p>` : '')
    + `</article>`
  )).join('');
  return `<section class="dp-feature-grid" aria-label="${escapeHtml(LABELS.featuresRegion)}">${cards}</section>`;
}

export function footer(text, credit = true) {
  if (!text && !credit) return '';
  const mark = credit
    ? `<div class="dp-footer-credit">Built with `
      + `<a href="https://github.com/thinkdj/domain-parkour" target="_blank" rel="noopener noreferrer">Domain Parkour</a>`
      + ` &middot; powered by <a href="https://cloudflare.com" target="_blank" rel="noopener noreferrer">Cloudflare</a>`
      + `</div>`
    : '';
  return `<footer class="dp-footer">${text ? `<div>${escapeHtml(text)}</div>` : '<div></div>'}${mark}</footer>`;
}
