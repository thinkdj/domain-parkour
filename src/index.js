/**
 * Get domain-specific configuration from Cloudflare KV or Environment Variables
 * Priority:
 * 1. Local dev config file (config.dev.local.example.json) - localhost only
 * 2. Cloudflare KV storage (DOMAIN_CONFIGS namespace)
 * 3. Environment variables (JSON string or individual properties)
 * 4. Hardcoded defaults (safe public data only)
 *
 * @param {string} hostname - The hostname from the request
 * @param {object} env - Environment variables and KV bindings
 * @returns {Promise<{config: object, allThemes?: Array}>} - Returns config and optionally all themes for dev mode
 */
async function getDomainConfig(hostname, env) {
  // Local development: Try to load config.dev.local.example.json for localhost
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "domain-parkour.apiary.workers.dev"
  ) {
    try {
      const localConfigModule = await import(
        "../config.dev.local.example.json"
      );
      if (localConfigModule && localConfigModule.default) {
        const themes = localConfigModule.default;
        console.log(
          "[Dev] Using config.dev.local.example.json with",
          Array.isArray(themes) ? themes.length : 0,
          "themes"
        );

        // If it's an array, return the first theme as default, but pass all themes
        if (Array.isArray(themes) && themes.length > 0) {
          return {
            config: { domain: hostname, ...themes[0] },
            allThemes: themes,
          };
        } else {
          // Fallback for old format
          return {
            config: { domain: hostname, ...themes },
          };
        }
      }
    } catch (e) {
      console.log(
        "[Dev] config.dev.local.example.json not found or invalid, falling back to KV/env"
      );
    }
  }

  // Try to get config from Cloudflare KV first (most secure)
  if (env.DOMAIN_CONFIGS) {
    try {
      const kvConfig = await env.DOMAIN_CONFIGS.get(hostname, { type: "json" });
      if (kvConfig) {
        return { config: { domain: hostname, ...kvConfig } };
      }

      // Try default config from KV
      const defaultConfig = await env.DOMAIN_CONFIGS.get("_default", {
        type: "json",
      });
      if (defaultConfig) {
        return { config: { domain: hostname, ...defaultConfig } };
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
      return { config: { domain: hostname, ...parsed } };
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
    config: {
      domain: hostname,
      mode: "landing", // 'parking', 'coming-soon', or 'landing'
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
    },
  };
}

/**
 * Load configuration with environment variable overrides
 * @param {string} hostname - The hostname from the request
 * @param {object} env - Environment variables and KV bindings
 * @param {Request} request - The request object (to check for theme override cookie)
 * @returns {Promise<{config: object, allThemes?: Array}>}
 */
async function getConfig(hostname, env, request = null) {
  // Get base config for this domain
  let { config: domainConfig, allThemes } = await getDomainConfig(
    hostname,
    env
  );

  // If in dev mode with multiple themes, check for theme index override
  if (allThemes && allThemes.length > 0 && request) {
    const url = new URL(request.url);
    const themeIndexParam = url.searchParams.get("themeIndex");

    if (themeIndexParam !== null) {
      const themeIndex = parseInt(themeIndexParam);
      if (themeIndex >= 0 && themeIndex < allThemes.length) {
        domainConfig = { domain: hostname, ...allThemes[themeIndex] };
      }
    }
  }

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

  const finalConfig = {
    domain: domain,
    domainTitle: domainTitle,
    mode:
      env[`${envPrefix}_MODE`] || env.MODE || domainConfig.mode || "parking",
    title: env[`${envPrefix}_TITLE`] || env.TITLE || domainConfig.title,
    description:
      env[`${envPrefix}_DESCRIPTION`] ||
      env.DESCRIPTION ||
      domainConfig.description,
    domainAgeYears: domainConfig.domainAgeYears || domainAgeYears,
    domainRegistration: domainConfig.domainRegistration || domainRegistration,
    domainExtension: domainConfig.domainExtension || domainExtension,
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
    // Footer text
    footerText:
      env[`${envPrefix}_FOOTER_TEXT`] ||
      env.FOOTER_TEXT ||
      domainConfig.footerText,
    // Show credit (defaults to true if not specified)
    showCredit: domainConfig.showCredit !== undefined ? domainConfig.showCredit : true,
  };

  // Return config along with allThemes if in dev mode
  return {
    config: finalConfig,
    allThemes: allThemes,
  };
}

// Import modular templates
import { generateParkingHTML } from "./templates/parking.js";
import { generateComingSoonHTML } from "./templates/coming-soon.js";
import { generateLandingHTML } from "./templates/landing.js";

export default {
  async fetch(request, env, ctx) {
    // Extract hostname from the request
    const url = new URL(request.url);
    const hostname = url.hostname;

    // Get configuration for this specific domain
    const { config: cfg, allThemes } = await getConfig(hostname, env, request);

    // Generate HTML based on mode
    let html;
    if (cfg.mode === "coming-soon") {
      html = generateComingSoonHTML(cfg, allThemes);
    } else if (cfg.mode === "landing") {
      html = generateLandingHTML(cfg, allThemes);
    } else {
      // Default to parking mode
      html = generateParkingHTML(cfg, allThemes);
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
