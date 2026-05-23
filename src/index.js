/**
 * Domain Parkour worker entrypoint.
 *
 * Two surfaces:
 *   1. /_admin_/*   — admin panel (Basic Auth)
 *   2. everything else — public-facing parking/coming-soon/landing/profile page,
 *      chosen by the request hostname.
 */

import { resolveConfig } from './config.js';
import { handleAdmin } from './admin/router.js';
import { generateParkingHTML } from './templates/parking.js';
import { generateComingSoonHTML } from './templates/coming-soon.js';
import { generateLandingHTML } from './templates/landing.js';
import { generateProfileHTML } from './templates/profile.js';

export default {
  async fetch(request, env, ctx) {
    const adminResponse = await handleAdmin(request, env);
    if (adminResponse) return adminResponse;

    const url = new URL(request.url);
    const hostname = url.hostname;

    const { config: cfg, allThemes } = await resolveConfig(hostname, env, request);

    let html;
    if (cfg.mode === 'coming-soon') html = generateComingSoonHTML(cfg, allThemes);
    else if (cfg.mode === 'landing') html = generateLandingHTML(cfg, allThemes);
    else if (cfg.mode === 'profile') html = generateProfileHTML(cfg, allThemes);
    else html = generateParkingHTML(cfg, allThemes);

    return new Response(html, {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
        'cache-control': 'public, max-age=3600',
        'x-served-domain': hostname,
        'x-page-mode': cfg.mode,
      },
    });
  },
};
