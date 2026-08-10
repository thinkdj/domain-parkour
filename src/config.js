/**
 * Resolve the config for a hostname.
 *
 * Priority:
 *   1. Bundled demo presets — localhost and *.workers.dev only
 *   2. D1: the exact hostname row, then the `_default` row
 *   3. The bundled fallback
 *
 * Everything returned is already in the shared vocabulary: `normalize` folds the
 * older camelCase spellings in defaults.json into canonical keys, so the presets
 * did not have to be rewritten.
 */

import { normalize } from '../pages/index.js';
import { getDomainOrDefault } from './db.js';
import defaults from '../defaults.json' with { type: 'json' };

export const FALLBACK_DEFAULT = defaults.fallback;
export const DEMO_PRESETS = defaults.presets;

/**
 * Per-mode starting copy for the admin form. Not schema: the renderer has its own
 * defaults for all of it. These only prefill the fields an admin sees, so a new
 * page reads well before anything is typed.
 */
export const MODE_DEFAULTS = defaults.modes;

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0']);

function isLocalHost(hostname) {
  return LOCAL_HOSTS.has(hostname) || hostname.endsWith('.workers.dev');
}

/**
 * The local gallery renders a preset chosen by ?preset=N. The loopback-only
 * template switcher submits that query with a plain GET form, so it needs no
 * additional client script.
 */
function presetFor(request) {
  if (!request) return null;
  const requested = new URL(request.url).searchParams.get('preset');
  if (requested === null) return null;
  const index = Number.parseInt(requested, 10);
  return Number.isInteger(index) && index >= 0 && index < DEMO_PRESETS.length
    ? DEMO_PRESETS[index]
    : null;
}

/**
 * @param {string} hostname
 * @param {{ DB?: D1Database }} env
 * @param {Request} [request]
 * @returns {Promise<{ mode: string, config: object, configured: boolean }>}
 */
export async function resolveConfig(hostname, env, request) {
  if (isLocalHost(hostname)) {
    const preset = presetFor(request) || DEMO_PRESETS[0];
    if (preset) return { ...normalize(preset, { mode: preset.mode }), configured: true };
  }

  if (env.DB) {
    try {
      const record = await getDomainOrDefault(env.DB, hostname);
      if (record) return { mode: record.mode, config: record.config, configured: true };
    } catch (error) {
      console.error(`D1 lookup failed: ${error.message}`);
    }
  }

  // Nothing is configured for this host. It still renders, but `configured:false`
  // stops an unknown Host header becoming a canonical URL or a sitemap entry.
  return { ...normalize(FALLBACK_DEFAULT, { mode: FALLBACK_DEFAULT.mode }), configured: false };
}

/** Render unsaved admin edits without touching the database. */
export function previewConfig(raw) {
  return normalize(raw, { mode: raw?.mode });
}
