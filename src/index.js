/**
 * Domain Parkour worker entrypoint.
 *
 * Three request surfaces:
 *   1. /_assets/* - public reads for managed R2 objects
 *   2. /_admin_/* - self-hosted admin panel (Basic Auth)
 *   3. everything else - public parking/coming-soon/landing/profile page,
 *      chosen by the request hostname.
 */

import { resolveConfig } from './config.js';
import { handleAdmin } from './admin/router.js';
import { generateParkingHTML } from './templates/parking.js';
import { generateComingSoonHTML } from './templates/coming-soon.js';
import { generateLandingHTML } from './templates/landing.js';
import { generateProfileHTML } from './templates/profile.js';
import { handleAssetRequest } from './assets.js';

export default {
  async fetch(request, env, ctx) {
    const assetResponse = await handleAssetRequest(request, env);
    if (assetResponse) return assetResponse;

    const adminResponse = await handleAdmin(request, env);
    if (adminResponse) return adminResponse;

    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405, headers: { allow: "GET, HEAD" } });
    }

    const url = new URL(request.url);
    const hostname = url.hostname;

    const { config: cfg, allThemes } = await resolveConfig(hostname, env, request);

    let html;
    if (cfg.mode === 'coming-soon') html = generateComingSoonHTML(cfg, allThemes);
    else if (cfg.mode === 'landing') html = generateLandingHTML(cfg, allThemes);
    else if (cfg.mode === 'profile') html = generateProfileHTML(cfg, allThemes);
    else html = generateParkingHTML(cfg, allThemes);

    return new Response(request.method === "HEAD" ? null : html, {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
        'cache-control': 'public, max-age=3600',
        'content-security-policy': "default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' https: data:; connect-src 'none'; font-src 'self' data:; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
        'permissions-policy': 'geolocation=(), microphone=(), camera=(), payment=()',
        'referrer-policy': 'strict-origin-when-cross-origin',
        'x-content-type-options': 'nosniff',
        'x-frame-options': 'DENY',
        'x-served-domain': hostname,
        'x-page-mode': cfg.mode,
      },
    });
  },
};
