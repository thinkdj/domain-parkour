/**
 * The only boundary between stored page configuration and HTML.
 *
 * Config is plain data that may have come from an older runtime, a hand-written
 * D1 row, an API client, or a current editor request, so rendering never assumes
 * it was validated before. Everything here is total: it returns a safe value or
 * an empty one, and never throws.
 *
 * Adapted from the OSS `src/safety.js`, which was the stronger of the two
 * implementations — the cloud runtime only coerced.
 */

export const SOCIAL_PLATFORMS = new Set([
  'twitter', 'x', 'facebook', 'instagram', 'linkedin', 'github', 'email',
]);

const MAX_URL_LENGTH = 2048;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MANAGED_ASSET_RE = /^\/_assets\/[A-Za-z0-9._/-]+$/;
const CONTROL_RE = /[\u0000-\u001F\u007F]/;
const CONTROL_GLOBAL_RE = /[\u0000-\u001F\u007F]/g;
const HOST_LABEL_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

/** Escape a value for HTML text or a double-quoted attribute. */
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]
  ));
}

/**
 * Serialize JSON for an inline script context without allowing a closing tag or
 * a JS line terminator. Used for JSON-LD, which is data rather than code.
 */
export function serializeForScript(value) {
  let serialized;
  try {
    serialized = JSON.stringify(value);
  } catch {
    serialized = 'null';
  }
  return (serialized || 'null').replace(/[<>&\u2028\u2029]/g, (character) => ({
    '<': '\\u003c',
    '>': '\\u003e',
    '&': '\\u0026',
    '\u2028': '\\u2028',
    '\u2029': '\\u2029',
  }[character]));
}

export function hasControlCharacters(value) {
  return CONTROL_RE.test(String(value ?? ''));
}

/** A prototype-safe plain-object test — a `__proto__` payload must not pass. */
export function isPlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function object(value) {
  return isPlainObject(value) ? value : {};
}

export function bool(value, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

/** Trimmed, length-capped, control-character-free text. Anything empty becomes ''. */
export function plainText(value, max = 500) {
  if (value === undefined || value === null || typeof value === 'object') return '';
  const text = String(value).replace(CONTROL_GLOBAL_RE, '').trim();
  return text.length > max ? text.slice(0, max) : text;
}

export function safeHttpsUrl(value) {
  const input = plainText(value, MAX_URL_LENGTH);
  if (!input) return '';
  try {
    const url = new URL(input);
    if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) return '';
    return url.toString();
  } catch {
    return '';
  }
}

export function safeEmail(value) {
  const email = plainText(value, 254).toLowerCase();
  return EMAIL_RE.test(email) ? email : '';
}

/** A visitor link: HTTPS, or a bare address / mailto: turned into a mailto. */
export function safeLinkUrl(value) {
  const input = plainText(value, MAX_URL_LENGTH);
  if (!input) return '';
  if (input.toLowerCase().startsWith('mailto:')) {
    const email = safeEmail(input.slice(7));
    return email ? `mailto:${email}` : '';
  }
  if (EMAIL_RE.test(input)) {
    const email = safeEmail(input);
    return email ? `mailto:${email}` : '';
  }
  return safeHttpsUrl(input);
}

/**
 * Email is a mailto and only a mailto; every other platform must be HTTPS.
 *
 * The email slot renders behind an envelope icon, so accepting an https URL
 * there would put a link to somewhere else behind a "mail me" affordance.
 */
export function safeSocialUrl(platform, value) {
  if (platform !== 'email') return safeHttpsUrl(value);
  const input = plainText(value, MAX_URL_LENGTH);
  const email = safeEmail(input.toLowerCase().startsWith('mailto:') ? input.slice(7) : input);
  return email ? `mailto:${email}` : '';
}

/** A managed asset path served by the app itself, or an external HTTPS image. */
export function safeImageUrl(value) {
  const input = plainText(value, MAX_URL_LENGTH);
  if (!input) return '';
  if (MANAGED_ASSET_RE.test(input) && !input.includes('..') && !input.includes('//')) return input;
  return safeHttpsUrl(input);
}

/** The one theme knob. Hex only — a full color grammar is an injection surface. */
export function safeAccentColor(value) {
  const color = plainText(value, 9).toLowerCase();
  return /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/.test(color) ? color : '';
}

/** A hostname safe to place in a canonical URL, a sitemap, or a visible label. */
export function safeHostname(value) {
  const hostname = plainText(value, 253).toLowerCase().replace(/\.$/, '');
  if (!hostname) return '';
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)) {
    return hostname.split('.').every((part) => Number(part) <= 255) ? hostname : '';
  }
  return hostname.split('.').every((label) => HOST_LABEL_RE.test(label)) ? hostname : '';
}
