/**
 * Adapter over @domainparkour/pages for the self-hosted app.
 *
 * The content contract itself now lives in the shared renderer — this file used
 * to be 400 lines and was the better of the two implementations, which is why it
 * became the basis for `pages/src/safety.js` and `pages/src/schema.js`.
 *
 * What is left here is the names the admin already imports, mapped onto the
 * shared ones. Keeping the old spellings means `db.js`, `admin/router.js` and
 * `admin/ui.js` did not have to change when the renderer moved out.
 */

import {
  ConfigError, MODES, normalize, normalizeMode as sharedNormalizeMode, safeHostname, validate,
} from '../pages/index.js';

export {
  escapeHtml, serializeForScript, safeLinkUrl, safeImageUrl as safeAvatarUrl, SOCIAL_PLATFORMS,
} from '../pages/index.js';

/** The admin still speaks of validation errors by this name. */
export const ConfigValidationError = ConfigError;

export const SUPPORTED_MODES = new Set(MODES);

export function normalizeMode(value) {
  return sharedNormalizeMode(value) || null;
}

export function assertMode(value) {
  const mode = normalizeMode(value);
  if (!mode) throw new ConfigError('Invalid mode');
  return mode;
}

/**
 * Hostnames are the one thing the shared renderer treats as display-only, so the
 * throwing version the admin API needs stays here. `_default` is the fallback row
 * every self-hosted install has, and is not a real hostname.
 */
export function normalizeHostname(value, { allowDefault = true } = {}) {
  if (typeof value !== 'string') throw new ConfigError('Hostname is required');
  const candidate = value.trim().toLowerCase().replace(/\.$/, '');
  if (allowDefault && candidate === '_default') return candidate;
  const hostname = safeHostname(candidate);
  if (!hostname) throw new ConfigError('Invalid hostname');
  return hostname;
}

/** Strict: for anything an admin just typed. Throws. */
export function validateConfig(raw, mode) {
  return validate(raw, mode);
}

/** Lenient: repairs whatever is already in the database. Never throws. */
export function sanitizeStoredConfig(raw, mode) {
  return normalize(raw, { mode });
}
