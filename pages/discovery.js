/**
 * robots.txt and sitemap.xml — derived from the same config as the page, so a
 * page that says noindex cannot advertise itself in a sitemap.
 */

import { safeHostname } from './safety.js';
import { normalize } from './schema.js';
import { isIndexable } from './document.js';

const DISALLOW_ALL = 'User-agent: *\nDisallow: /\n';

/**
 * @param {string} hostname
 * @param {string} mode
 * @param {object} rawConfig
 * @param {{ configured?: boolean }} [options]
 */
export function robotsTxt(hostname, mode, rawConfig = {}, { configured = true } = {}) {
  const host = safeHostname(hostname);
  const { mode: resolved, config } = normalize(rawConfig, { mode });
  if (!configured || !host || !isIndexable(resolved, config)) return DISALLOW_ALL;
  return `User-agent: *\nAllow: /\nSitemap: https://${host}/sitemap.xml\n`;
}

/** Returns '' when there is nothing this host should claim — the caller 404s. */
export function sitemapXml(hostname, mode, rawConfig = {}, { configured = true } = {}) {
  const host = safeHostname(hostname);
  const { mode: resolved, config } = normalize(rawConfig, { mode });
  if (!configured || !host || !isIndexable(resolved, config)) return '';
  return '<?xml version="1.0" encoding="UTF-8"?>'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    + `<url><loc>https://${host}/</loc></url></urlset>`;
}
