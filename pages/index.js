/**
 * @domainparkour/pages - the visitor page, in one place.
 *
 * Both apps import this and nothing deeper. The self-hosted Worker and the
 * hosted control plane's editor preview import it directly; the customer Worker
 * receives it bundled to source text, because a script uploaded through the
 * Cloudflare API cannot import anything at runtime.
 *
 * What lives here: templates, CSS, the config vocabulary, safety primitives,
 * form markup, robots/sitemap. What does not: storage, routing, headers, form
 * handling, analytics - those differ legitimately between the two apps.
 */

export { renderPage, renderBody, renderPreviewParts, renderThanks, isIndexable } from './document.js';
export { robotsTxt, sitemapXml } from './discovery.js';
export { resolveRedirect } from './templates/redirect.js';
export { leadForm, captureAllows, FIELD_LIMITS, KINDS, LEAD_PATH, THANKS_PATH } from './forms.js';
export { CHECKOUT_PATH } from './templates/parking.js';
export { DESTINATION_PATH } from './templates/landing.js';
export {
  MODES, DEFAULT_MODE, SCHEMA_VERSION, ConfigError, normalize, validate, normalizeMode, derive,
} from './schema.js';
export {
  escapeHtml, plainText, safeEmail, safeHostname, safeHttpsUrl, safeImageUrl, safeLinkUrl,
  serializeForScript, SOCIAL_PLATFORMS,
} from './safety.js';
export { pageCss } from './css.js';
export { themeToggle, themeScript, THEME_STORAGE_KEY } from './theme.js';

/**
 * The promise is small pages, so the size is a gate rather than an intention.
 * The shared theme control adds a small inline script and two icons to every
 * document; the raw ceiling leaves measured headroom for that reusable chrome.
 *
 * Raised from 16 KB / 5 KB when capture forms became a first-class surface: a
 * page that lets a visitor write to the owner carries roughly a kilobyte of
 * markup and CSS that a page with no form does not. Gzip is what actually
 * crosses the wire and is still the tighter of the two gates.
 */
export const PAGE_BUDGET_BYTES = 18432;
export const PAGE_BUDGET_GZIP_BYTES = 5632;

/** Bumped when rendered output changes in a way a cached page must not survive. */
export const RENDERER_VERSION = 'pages-1.0';
