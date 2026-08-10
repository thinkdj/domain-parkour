/**
 * Domain Parkour worker entrypoint.
 *
 * Request surfaces, in order:
 *   1. /_assets/*   - public reads for managed R2 objects
 *   2. /_admin_/*   - self-hosted admin panel (Basic Auth)
 *   3. /_parkour/*  - capture form POST, its thank-you page, outbound handoffs
 *   4. robots.txt, sitemap.xml
 *   5. everything else - the visitor page for this hostname
 *
 * The page itself comes from @domainparkour/pages, the same renderer the hosted runtime
 * serves, so a self-hosted page and a hosted one are byte-identical for the same
 * config. What is local to this file is how a page is stored and served.
 */

import {
  CHECKOUT_PATH, DESTINATION_PATH, KINDS, LEAD_PATH, renderPage, renderThanks, resolveRedirect,
  robotsTxt, sitemapXml, THANKS_PATH,
} from '../pages/index.js';
import { resolveConfig } from './config.js';
import { handleAdmin } from './admin/router.js';
import { handleAssetRequest } from './assets.js';
import { submitLead } from './leads.js';

/**
 * No script-src at all: the renderer emits no executable script, and saying so
 * in the policy is what keeps it that way.
 */
const PAGE_HEADERS = {
  'content-type': 'text/html;charset=UTF-8',
  'content-security-policy':
    "default-src 'none'; style-src 'unsafe-inline'; img-src 'self' https: data:; "
    + "form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'no-referrer',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
};

function text(body, status, headers = {}) {
  return new Response(body, {
    status,
    headers: { 'content-type': 'text/plain;charset=UTF-8', 'cache-control': 'no-store', ...headers },
  });
}

/** Public page content stays uncached until cache isolation is proven. */
function pageResponse(request, page) {
  const headers = new Headers({
    ...PAGE_HEADERS,
    'cache-control': 'no-store',
    'x-page-mode': page.mode,
  });
  return new Response(request.method === 'HEAD' ? null : page.html, { headers });
}

export default {
  async fetch(request, env, ctx) {
    const assetResponse = await handleAssetRequest(request, env);
    if (assetResponse) return assetResponse;

    const adminResponse = await handleAdmin(request, env);
    if (adminResponse) return adminResponse;

    const url = new URL(request.url);
    const hostname = url.hostname;

    if (url.pathname === LEAD_PATH) {
      if (request.method !== 'POST') return text('Method not allowed.', 405, { allow: 'POST' });
      const site = await resolveConfig(hostname, env, request);
      return submitLead(request, env, hostname, site);
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return text('Method not allowed.', 405, { allow: 'GET, HEAD' });
    }

    if (url.pathname === THANKS_PATH) {
      const kind = url.searchParams.get('kind');
      if (!KINDS.includes(kind)) return text('Not found.', 404);
      const page = renderThanks(kind, hostname);
      return new Response(request.method === 'HEAD' ? null : page.html, {
        headers: { ...PAGE_HEADERS, 'cache-control': 'no-store' },
      });
    }

    const site = await resolveConfig(hostname, env, request);
    const { mode, config, configured } = site;

    if (url.pathname === CHECKOUT_PATH || url.pathname === DESTINATION_PATH) {
      const target = url.pathname === CHECKOUT_PATH ? config.checkout_url : config.destination_url;
      if (!target) return text('Not found.', 404);
      return new Response(null, {
        status: 302,
        headers: { location: target, 'cache-control': 'no-store', 'referrer-policy': 'no-referrer' },
      });
    }

    if (url.pathname === '/robots.txt') {
      return text(robotsTxt(hostname, mode, config, { configured }), 200, {
        'x-robots-tag': 'noindex',
      });
    }

    if (url.pathname === '/sitemap.xml') {
      const sitemap = sitemapXml(hostname, mode, config, { configured });
      if (!sitemap) return text('Not found.', 404);
      return new Response(request.method === 'HEAD' ? null : sitemap, {
        headers: { 'content-type': 'application/xml;charset=UTF-8', 'cache-control': 'no-store' },
      });
    }

    let redirectLocation = '';
    if (mode === 'redirect') {
      const { location, status } = resolveRedirect(request.url, config);
      redirectLocation = location;
      if (location) {
        if (config.delivery?.redirect?.show_ui !== true) {
          return new Response(null, {
            status,
            headers: { location, 'cache-control': 'no-store', 'referrer-policy': 'no-referrer' },
          });
        }
      }
      // No usable destination: fall through and render the page, which says so.
    }

    const page = renderPage(mode, hostname, config, { configured, redirectUrl: redirectLocation });

    if (mode === 'maintenance') {
      const headers = new Headers({ ...PAGE_HEADERS, 'cache-control': 'no-store' });
      const retry = config.delivery?.maintenance?.retry_after_seconds;
      if (retry) headers.set('retry-after', String(retry));
      return new Response(request.method === 'HEAD' ? null : page.html, { status: 503, headers });
    }

    return pageResponse(request, page);
  },
};
