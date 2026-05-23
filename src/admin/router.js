/**
 * Admin panel router — mounted under /_admin_/.
 *
 * Routes:
 *   GET    /_admin_/                       → SPA HTML
 *   GET    /_admin_/api/domains            → list all
 *   GET    /_admin_/api/domains/:hostname  → fetch one
 *   PUT    /_admin_/api/domains/:hostname  → upsert
 *   DELETE /_admin_/api/domains/:hostname  → remove
 *   POST   /_admin_/preview                → render arbitrary unsaved config
 */

import { requireAdmin, adminCredentials } from "./auth.js";
import { renderAdminUI } from "./ui.js";
import { listDomains, getDomain, upsertDomain, deleteDomain } from "../db.js";
import { previewConfig } from "../config.js";
import { generateParkingHTML } from "../templates/parking.js";
import { generateComingSoonHTML } from "../templates/coming-soon.js";
import { generateLandingHTML } from "../templates/landing.js";
import { generateProfileHTML } from "../templates/profile.js";

const PREFIX = "/_admin_";

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "content-type": "application/json", ...(init.headers || {}) },
  });
}

function notFound() {
  return new Response("Not found", { status: 404 });
}

function methodNotAllowed() {
  return new Response("Method not allowed", { status: 405 });
}

function renderConfigToHTML(cfg) {
  if (cfg.mode === "parking") return generateParkingHTML(cfg);
  if (cfg.mode === "coming-soon") return generateComingSoonHTML(cfg);
  if (cfg.mode === "profile") return generateProfileHTML(cfg);
  return generateLandingHTML(cfg);
}

async function loadPresets() {
  try {
    const mod = await import("../../config.dev.local.example.json");
    const themes = mod?.default;
    if (Array.isArray(themes)) return themes;
  } catch {
    // no-op
  }
  return [];
}

function ensureDB(env) {
  if (!env.DB) {
    return new Response(
      "D1 binding `DB` is not configured. Run `npm run setup` and update wrangler.toml.",
      { status: 503, headers: { "content-type": "text/plain;charset=UTF-8" } },
    );
  }
  return null;
}

/**
 * Returns a Response if this request belongs to the admin router; null otherwise.
 */
export async function handleAdmin(request, env) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith(PREFIX)) return null;

  const authResp = requireAdmin(request, env);
  if (authResp) return authResp;

  const path = url.pathname.slice(PREFIX.length) || "/";

  // GET /_admin_/  → SPA
  if ((path === "/" || path === "") && request.method === "GET") {
    const creds = adminCredentials(env, url.hostname);
    const presets = await loadPresets();
    const html = renderAdminUI({
      isDefaultCreds: creds?.isDefault === true,
      presets,
    });
    return new Response(html, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
        "cache-control": "no-store",
        "x-robots-tag": "noindex, nofollow",
      },
    });
  }

  // POST /_admin_/preview  → render unsaved config
  if (path === "/preview" && request.method === "POST") {
    let payload;
    try {
      payload = await request.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }
    const hostname = (payload?.hostname || "preview.local").toString();
    const cfg = previewConfig(hostname, payload?.config || {});
    const html = renderConfigToHTML(cfg);
    return new Response(html, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
        "cache-control": "no-store",
      },
    });
  }

  // Beyond this point we need D1
  const dbErr = ensureDB(env);
  if (dbErr) return dbErr;

  // GET /_admin_/api/domains
  if (path === "/api/domains" && request.method === "GET") {
    const domains = await listDomains(env.DB);
    return json({ domains });
  }

  // /_admin_/api/domains/:hostname
  const m = path.match(/^\/api\/domains\/([^/]+)$/);
  if (m) {
    const hostname = decodeURIComponent(m[1]);
    if (request.method === "GET") {
      const record = await getDomain(env.DB, hostname);
      if (!record)
        return json({
          hostname,
          mode: "landing",
          config: {},
          createdAt: null,
          updatedAt: null,
        });
      return json(record);
    }
    if (request.method === "PUT") {
      let payload;
      try {
        payload = await request.json();
      } catch {
        return new Response("Invalid JSON", { status: 400 });
      }
      const mode = payload?.mode || "landing";
      const config = payload?.config || {};
      if (!["parking", "coming-soon", "landing", "profile"].includes(mode)) {
        return new Response("Invalid mode", { status: 400 });
      }
      const record = await upsertDomain(env.DB, hostname, mode, config);
      return json(record);
    }
    if (request.method === "DELETE") {
      await deleteDomain(env.DB, hostname);
      return new Response(null, { status: 204 });
    }
    return methodNotAllowed();
  }

  return notFound();
}
