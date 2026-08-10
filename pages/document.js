/**
 * The complete document: head, metadata, and one template's body.
 *
 * The SEO and social block comes from the cloud runtime, which was the only side
 * that had one. `configured` exists because a hostile Host header must not become
 * a canonical URL or a sitemap entry — an unconfigured host renders, but claims
 * nothing about itself.
 */

import { escapeHtml, safeAccentColor, serializeForScript } from './safety.js';
import { derive, DEFAULT_MODE, MODES, normalize } from './schema.js';
import { pageCss } from './css.js';
import { ACCENT, EYEBROW, label, LABELS, STATUS } from './defaults.js';
import * as parking from './templates/parking.js';
import * as comingSoon from './templates/coming-soon.js';
import * as landing from './templates/landing.js';
import * as profile from './templates/profile.js';
import * as redirect from './templates/redirect.js';
import * as maintenance from './templates/maintenance.js';

const TEMPLATES = {
  parking, coming_soon: comingSoon, landing, profile, redirect, maintenance,
};

/** Only a page that is genuinely a destination should invite indexing. */
export function isIndexable(mode, config) {
  const indexing = config?.seo?.indexing || 'default';
  if (indexing === 'index') return true;
  if (indexing === 'noindex') return false;
  return mode === 'landing' || mode === 'profile';
}

function buildView(mode, hostname, config) {
  const { host, title, stats } = derive(hostname, mode, config);
  return {
    mode,
    host,
    title,
    cfg: config,
    stats,
    status: config.status_label || STATUS[mode] || '',
    eyebrowText: config.eyebrow === undefined ? EYEBROW[mode] || '' : config.eyebrow,
  };
}

/**
 * The body fragment only — what the editor preview shows inside its panel.
 * Same code path as the served page, so the preview cannot drift from production.
 */
export function renderBody(mode, hostname, rawConfig = {}) {
  const normalized = normalize(rawConfig, { mode });
  const template = TEMPLATES[normalized.mode] || TEMPLATES[DEFAULT_MODE];
  return template.render(buildView(normalized.mode, hostname, normalized.config));
}

function jsonLd(mode, view, title, description) {
  const url = `https://${view.host}/`;
  if (mode === 'profile') {
    return { '@context': 'https://schema.org', '@type': 'Person', name: title, description, url };
  }
  // A price makes the page a real offer, which is what a marketplace or an agent
  // reads. Domain Parkour still never processes the sale.
  if (mode === 'parking' && view.cfg.price) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: view.title,
      description,
      offers: { '@type': 'Offer', price: view.cfg.price, availability: 'https://schema.org/InStock', url },
    };
  }
  return { '@context': 'https://schema.org', '@type': 'WebPage', name: title, description, url };
}

function metadata(mode, view, { configured }) {
  const seo = view.cfg.seo || {};
  // An explicit seo.title is the whole title. Otherwise the browser tab reads
  // "example.com - For sale", which is what the suffix is for.
  const suffix = label(view.cfg, 'pageTitleSuffix');
  const base = view.cfg.headline || view.title;
  const title = seo.title || (suffix ? `${base} - ${suffix}` : base);
  const description = seo.description || view.cfg.subhead || view.cfg.bio
    || `${view.title} is managed with Domain Parkour.`;
  const canonical = configured && view.host ? `https://${view.host}/` : '';
  const indexable = configured && isIndexable(mode, view.cfg);
  const image = seo.og_image_url;
  const favicon = view.cfg.brand?.favicon_url;

  const tags = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}">`,
    `<meta name="robots" content="${indexable ? 'index,follow' : 'noindex,nofollow'}">`,
    canonical ? `<link rel="canonical" href="${escapeHtml(canonical)}">` : '',
    favicon ? `<link rel="icon" href="${escapeHtml(favicon)}">` : '',
    '<meta property="og:type" content="website">',
    view.host ? `<meta property="og:site_name" content="${escapeHtml(view.host)}">` : '',
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    canonical ? `<meta property="og:url" content="${escapeHtml(canonical)}">` : '',
    image ? `<meta property="og:image" content="${escapeHtml(image)}">` : '',
    image && seo.og_image_alt ? `<meta property="og:image:alt" content="${escapeHtml(seo.og_image_alt)}">` : '',
    `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">`,
    image ? `<meta name="twitter:image" content="${escapeHtml(image)}">` : '',
    configured
      ? `<script type="application/ld+json">${serializeForScript(jsonLd(mode, view, title, description))}</script>`
      : '',
  ];
  return { head: tags.filter(Boolean).join(''), title, description, indexable };
}

/**
 * @param {string} mode
 * @param {string} hostname
 * @param {object} rawConfig
 * @param {{ configured?: boolean }} [options] false for an unknown Host or a preview
 * @returns {{ html: string, title: string, description: string, indexable: boolean, mode: string }}
 */
export function renderPage(mode, hostname, rawConfig = {}, { configured = true } = {}) {
  const normalized = normalize(rawConfig, { mode });
  const resolved = MODES.includes(normalized.mode) ? normalized.mode : DEFAULT_MODE;
  const template = TEMPLATES[resolved];
  const view = buildView(resolved, hostname, normalized.config);
  const meta = metadata(resolved, view, { configured });
  const accent = safeAccentColor(normalized.config.theme?.accent) || ACCENT;
  const css = pageCss(resolved, { accent, withForm: template.needsForm(normalized.config) });

  const html = '<!doctype html><html lang="en"><head><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
    + `<meta name="theme-color" content="${escapeHtml(accent)}">`
    + meta.head
    + `<style>${css}</style></head><body><main class="dp-page">`
    + template.render(view)
    + '</main></body></html>';

  return { html, title: meta.title, description: meta.description, indexable: meta.indexable, mode: resolved };
}

/**
 * The pieces the control plane's editor panel shows while someone types.
 *
 * The panel is a styled box inside the admin, not a page, so it wants the parts
 * rather than a document — but they come from the same normalization and the same
 * templates, so what it shows cannot describe a page the renderer would not
 * produce.
 *
 * ponytail: a panel is a summary, not production. True parity needs the page in
 * an iframe served by its own route with its own CSP (the admin's `style-src
 * 'self'` blocks the inline styles of a srcdoc). Worth doing when preview
 * fidelity starts costing real mistakes; see docs/ROADMAP_AND_FEATURES.MD §8.
 */
export function renderPreviewParts(mode, hostname, rawConfig = {}) {
  const normalized = normalize(rawConfig, { mode });
  const resolved = MODES.includes(normalized.mode) ? normalized.mode : DEFAULT_MODE;
  const view = buildView(resolved, hostname, normalized.config);
  return {
    headline: normalized.config.headline || view.title,
    sub: normalized.config.subhead || '',
    mid: TEMPLATES[resolved].render(view),
    footer: normalized.config.footer_credit === false ? '' : 'Built with Domain Parkour',
  };
}

/**
 * The confirmation shown after a capture form is submitted.
 *
 * It borrows the maintenance layout — a narrow card with a heading and a line of
 * copy — rather than earning a seventh template. `configured: false` keeps it out
 * of the index and off the canonical URL.
 */
export function renderThanks(kind, hostname = '') {
  const message = kind === 'offer' ? LABELS.thanksOffer
    : kind === 'waitlist' ? LABELS.thanksWaitlist : LABELS.thanksSurvey;
  return renderPage('maintenance', hostname, {
    status_label: 'Received',
    headline: LABELS.thanksTitle,
    subhead: message,
    footer_credit: false,
    seo: { indexing: 'noindex' },
  }, { configured: false });
}
