/**
 * Resolve the rendered config for a hostname.
 *
 * Priority:
 *   1. Local demo presets from defaults.json - only on localhost
 *   2. D1 — exact hostname row, then `_default` row
 *   3. Bundled fallback from defaults.json
 */

import { getDomainOrDefault } from "./db.js";
import defaults from "../defaults.json" with { type: "json" };

export const FALLBACK_DEFAULT = defaults.fallback;
export const MODE_DEFAULTS = defaults.modes;
export const DEMO_PRESETS = defaults.presets;

const LOCAL_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
]);

function isLocalHost(hostname) {
  return LOCAL_HOSTS.has(hostname) || hostname.endsWith(".workers.dev");
}

function applyModeDefaults(cfg) {
  const defaults = MODE_DEFAULTS[cfg.mode] || MODE_DEFAULTS.landing;
  for (const [key, value] of Object.entries(defaults)) {
    if (cfg[key] === undefined) cfg[key] = value;
  }
}

function withDerived(hostname, raw) {
  const cfg = { domain: hostname, ...raw };
  const domainTitle = cfg.domainTitle || cfg.domain || hostname;
  cfg.domainTitle = domainTitle;

  const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(domainTitle);
  if (cfg.domainExtension === undefined && !isIp && domainTitle.includes(".")) {
    cfg.domainExtension = `.${domainTitle.split(".").pop()}`;
  }

  if (cfg.registrationDate && !cfg.domainAgeYears) {
    const regDate = new Date(cfg.registrationDate);
    if (!isNaN(regDate.getTime())) {
      const years = (Date.now() - regDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      cfg.domainAgeYears = `${Math.floor(years)}+`;
      cfg.domainRegistration = cfg.domainRegistration || `Registered in ${regDate.getFullYear()}`;
    }
  }

  cfg.mode = cfg.mode || "landing";
  cfg.accentColor = cfg.accentColor || FALLBACK_DEFAULT.accentColor;
  cfg.features = cfg.features || [];
  cfg.socialLinks = cfg.socialLinks || {};
  cfg.links = cfg.links || [];
  cfg.showCredit = cfg.showCredit !== false;
  applyModeDefaults(cfg);
  return cfg;
}

/**
 * @param {string} hostname
 * @param {{ DB?: D1Database }} env
 * @param {Request} [request]
 */
export async function resolveConfig(hostname, env, request) {
  // 1. Local dev theme gallery (only when no admin/preview override is set)
  if (isLocalHost(hostname)) {
    const themes = DEMO_PRESETS;
    if (themes) {
      let idx = 0;
      if (request) {
        const url = new URL(request.url);
        const param = url.searchParams.get("themeIndex");
        if (param !== null) {
          const n = parseInt(param, 10);
          if (!isNaN(n) && n >= 0 && n < themes.length) idx = n;
        }
      }
      return {
        config: withDerived(hostname, themes[idx]),
        allThemes: themes,
      };
    }
  }

  // 2. D1
  if (env.DB) {
    try {
      const record = await getDomainOrDefault(env.DB, hostname);
      if (record) {
        return { config: withDerived(hostname, { ...record.config, mode: record.mode }) };
      }
    } catch (e) {
      console.error(`D1 lookup failed: ${e.message}`);
    }
  }

  // 3. Bundled fallback from defaults.json
  return { config: withDerived(hostname, FALLBACK_DEFAULT) };
}

/**
 * Resolve a config from an arbitrary raw object (used by /preview API to render
 * unsaved edits live).
 */
export function previewConfig(hostname, raw) {
  return withDerived(hostname, raw || {});
}
