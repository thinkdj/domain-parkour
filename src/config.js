/**
 * Resolve the rendered config for a hostname.
 *
 * Priority:
 *   1. Local dev themes (config.dev.local.example.json) — only on localhost
 *   2. D1 — exact hostname row, then `_default` row
 *   3. Hardcoded fallback (safe public defaults)
 */

import { getDomain, getDomainOrDefault } from "./db.js";

const LOCAL_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
]);

function isLocalHost(hostname) {
  return LOCAL_HOSTS.has(hostname) || hostname.endsWith(".workers.dev");
}

async function loadLocalThemes() {
  try {
    const mod = await import("../config.dev.local.example.json");
    const themes = mod?.default;
    if (Array.isArray(themes) && themes.length) return themes;
    if (themes && typeof themes === "object") return [themes];
  } catch {
    // optional
  }
  return null;
}

const HARDCODED_DEFAULT = {
  mode: "landing",
  title: "Welcome",
  description: "Your gateway to something amazing.",
  accentColor: "#3b82f6",
  features: [],
  socialLinks: {},
  links: [],
};

function withDerived(hostname, raw) {
  const cfg = { domain: hostname, ...raw };
  const domainTitle = cfg.domainTitle || cfg.domain || hostname;
  cfg.domainTitle = domainTitle;

  const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(domainTitle);
  if (!cfg.domainExtension && !isIp && domainTitle.includes(".")) {
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
  cfg.accentColor = cfg.accentColor || HARDCODED_DEFAULT.accentColor;
  cfg.features = cfg.features || [];
  cfg.socialLinks = cfg.socialLinks || {};
  cfg.links = cfg.links || [];
  cfg.showCredit = cfg.showCredit !== false;
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
    const themes = await loadLocalThemes();
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

  // 3. Hardcoded fallback
  return { config: withDerived(hostname, HARDCODED_DEFAULT) };
}

/**
 * Resolve a config from an arbitrary raw object (used by /preview API to render
 * unsaved edits live).
 */
export function previewConfig(hostname, raw) {
  return withDerived(hostname, raw || {});
}

/**
 * Load a stored config without applying the dev-theme override. Used by the
 * admin panel's "open in preview iframe" flow.
 */
export async function loadStoredConfig(hostname, env) {
  if (env.DB) {
    const record = await getDomain(env.DB, hostname);
    if (record) return withDerived(hostname, { ...record.config, mode: record.mode });
  }
  return withDerived(hostname, HARDCODED_DEFAULT);
}
