/**
 * Get domain-specific configuration from Cloudflare KV or Environment Variables
 * Priority:
 * 1. Local dev config file (config.dev.local.json) - localhost only
 * 2. Cloudflare KV storage (DOMAIN_CONFIGS namespace)
 * 3. Environment variables (JSON string or individual properties)
 * 4. Hardcoded defaults (safe public data only)
 *
 * @param {string} hostname - The hostname from the request
 * @param {object} env - Environment variables and KV bindings
 */
async function getDomainConfig(hostname, env) {
  // Local development: Try to load config.dev.local.json for localhost
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    try {
      const localConfig = await import("../config.dev.local.json");
      if (localConfig && localConfig.default) {
        console.log("[Dev] Using config.dev.local.json");
        return { domain: hostname, ...localConfig.default };
      }
    } catch (e) {
      console.log(
        "[Dev] config.dev.local.json not found or invalid, falling back to KV/env"
      );
    }
  }

  // Try to get config from Cloudflare KV first (most secure)
  if (env.DOMAIN_CONFIGS) {
    try {
      const kvConfig = await env.DOMAIN_CONFIGS.get(hostname, { type: "json" });
      if (kvConfig) {
        return { domain: hostname, ...kvConfig };
      }

      // Try default config from KV
      const defaultConfig = await env.DOMAIN_CONFIGS.get("_default", {
        type: "json",
      });
      if (defaultConfig) {
        return { domain: hostname, ...defaultConfig };
      }
    } catch (e) {
      console.error(`Error fetching from KV: ${e.message}`);
    }
  }

  // Fall back to environment variables (JSON string for the specific domain)
  const envPrefix = hostname
    .replace(/\./g, "_")
    .replace(/-/g, "_")
    .toUpperCase();
  const domainEnvConfig = env[`${envPrefix}_CONFIG`];

  console.log(
    `[Debug] Hostname: ${hostname}, EnvPrefix: ${envPrefix}, Config exists: ${!!domainEnvConfig}`
  );

  if (domainEnvConfig) {
    console.log(`[Debug] Raw config string length: ${domainEnvConfig.length}`);
    console.log(
      `[Debug] Raw config (first 200 chars): ${domainEnvConfig.substring(
        0,
        200
      )}`
    );
    try {
      const parsed = JSON.parse(domainEnvConfig);
      console.log(`[Debug] Parsed config:`, parsed);
      return { domain: hostname, ...parsed };
    } catch (e) {
      console.error(`Error parsing ${envPrefix}_CONFIG: ${e.message}`);
      console.error(
        `[Debug] Char at position 185: ${domainEnvConfig.charCodeAt(185)} (${
          domainEnvConfig[185]
        })`
      );
    }
  }

  // Return minimal default (only non-sensitive data)
  return {
    domain: hostname,
    mode: "parking", // 'parking', 'coming-soon', or 'landing'
    title: "Premium Domain For Sale",
    description: "This premium domain is available for purchase.",
    registrationDate: null,
    salePrice: null,
    contactEmail: null,
    accentColor: "#3b82f6", // Default blue accent
    // Coming Soon specific fields
    launchDate: null,
    tagline: null,
    features: [],
    socialLinks: {},
    // Landing page specific fields
    subtitle: null,
    links: [],
  };
}

/**
 * Load configuration with environment variable overrides
 * @param {string} hostname - The hostname from the request
 * @param {object} env - Environment variables and KV bindings
 */
async function getConfig(hostname, env) {
  // Get base config for this domain
  const domainConfig = await getDomainConfig(hostname, env);

  // Environment variables can override per-domain settings
  // Use hostname-specific env vars first (e.g., CDN_FARM_TITLE)
  // then fall back to generic env vars (e.g., TITLE)
  const envPrefix = hostname
    .replace(/\./g, "_")
    .replace(/-/g, "_")
    .toUpperCase();

  const registrationDate =
    env[`${envPrefix}_REGISTRATION_DATE`] ||
    env.REGISTRATION_DATE ||
    domainConfig.registrationDate;

  let domainAgeYears = "";
  let domainRegistration = "";
  let domainExtension = "";

  const domain =
    env[`${envPrefix}_DOMAIN`] || env.DOMAIN || domainConfig.domain || hostname;

  const domainTitle =
    env[`${envPrefix}_DOMAIN_TITLE`] ||
    env.DOMAIN_TITLE ||
    domainConfig.domainTitle ||
    domain;

  // Extract domain extension from domainTitle (but not for IP addresses)
  const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(domainTitle);
  if (domainTitle && !isIpAddress) {
    const parts = domainTitle.split(".");
    if (parts.length > 1) {
      domainExtension = `.${parts.pop()}`;
    }
  }

  if (registrationDate) {
    const regDate = new Date(registrationDate);
    const ageInMs = Date.now() - regDate.getTime();
    const ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365.25);
    domainAgeYears = `${Math.floor(ageInYears)}+`;
    domainRegistration = `Registered in ${regDate.getFullYear()}`;
  }

  return {
    domain: domain,
    domainTitle: domainTitle,
    mode:
      env[`${envPrefix}_MODE`] || env.MODE || domainConfig.mode || "parking",
    title: env[`${envPrefix}_TITLE`] || env.TITLE || domainConfig.title,
    description:
      env[`${envPrefix}_DESCRIPTION`] ||
      env.DESCRIPTION ||
      domainConfig.description,
    domainAgeYears: domainAgeYears,
    domainRegistration: domainRegistration,
    domainExtension: domainExtension,
    salePrice:
      env[`${envPrefix}_SALE_PRICE`] ||
      env.SALE_PRICE ||
      domainConfig.salePrice,
    contactEmail:
      env[`${envPrefix}_CONTACT_EMAIL`] ||
      env.CONTACT_EMAIL ||
      domainConfig.contactEmail,
    accentColor:
      env[`${envPrefix}_ACCENT_COLOR`] ||
      env.ACCENT_COLOR ||
      domainConfig.accentColor,
    // Coming Soon specific fields
    launchDate:
      env[`${envPrefix}_LAUNCH_DATE`] ||
      env.LAUNCH_DATE ||
      domainConfig.launchDate,
    tagline: env[`${envPrefix}_TAGLINE`] || env.TAGLINE || domainConfig.tagline,
    features: domainConfig.features || [],
    socialLinks: domainConfig.socialLinks || {},
    // Landing page specific fields
    subtitle:
      env[`${envPrefix}_SUBTITLE`] || env.SUBTITLE || domainConfig.subtitle,
    links: domainConfig.links || [],
  };
}

// Import modular templates
import { generateParkingHTML } from './templates/parking.js';
import { generateComingSoonHTML } from './templates/coming-soon.js';
import { generateLandingHTML } from './templates/landing.js';

export default {
  async fetch(request, env, ctx) {
    // Extract hostname from the request
    const url = new URL(request.url);
    const hostname = url.hostname;

    // Get configuration for this specific domain
    const cfg = await getConfig(hostname, env);

    // Generate HTML based on mode
    let html;
    if (cfg.mode === "coming-soon") {
      html = generateComingSoonHTML(cfg);
    } else if (cfg.mode === "landing") {
      html = generateLandingHTML(cfg);
    } else {
      // Default to parking mode
      html = generateParkingHTML(cfg);
    }

    return new Response(html, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
        "cache-control": "public, max-age=3600",
        "x-served-domain": hostname, // Debug header to see which domain was detected
        "x-page-mode": cfg.mode, // Debug header to see which mode is active
      },
    });
  },
};
