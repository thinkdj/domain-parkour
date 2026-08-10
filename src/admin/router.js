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
 *   POST   /_admin_/api/uploads/profile-image → validate and store in R2
 */

import { requireAdmin, adminCredentials } from "./auth.js";
import { renderAdminUI } from "./ui.js";
import { listDomains, getDomain, upsertDomain, deleteDomain } from "../db.js";
import { DEMO_PRESETS } from "../config.js";
import {
  ConfigValidationError,
  assertMode,
  normalizeHostname,
  validateConfig,
} from "../safety.js";
import { renderPage } from "../../pages/index.js";
import { deleteManagedAvatar, storeProfileImage } from "../assets.js";

const PREFIX = "/_admin_";
const MAX_JSON_BYTES = 64 * 1024;

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json;charset=UTF-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...(init.headers || {}),
    },
  });
}

function notFound() {
  return new Response("Not found", { status: 404 });
}

function methodNotAllowed() {
  return new Response("Method not allowed", { status: 405 });
}

function requestTooLarge(request) {
  const length = Number(request.headers.get("content-length"));
  return Number.isFinite(length) && length > MAX_JSON_BYTES;
}

async function readJson(request) {
  if (requestTooLarge(request)) throw new ConfigValidationError("Request body is too large");
  try {
    const payload = await request.json();
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new ConfigValidationError("Request body must be an object");
    }
    return payload;
  } catch (error) {
    if (error instanceof ConfigValidationError) throw error;
    throw new ConfigValidationError("Invalid JSON");
  }
}

function mutationOriginError(request) {
  const origin = request.headers.get("origin");
  if (!origin) {
    // CLI/API clients do not send Origin. Browsers that do identify the
    // request as cross-site are never allowed to mutate an admin session.
    return request.headers.get("sec-fetch-site") === "cross-site"
      ? new Response("Cross-origin admin requests are not allowed", { status: 403 })
      : null;
  }
  try {
    return new URL(origin).origin === new URL(request.url).origin
      ? null
      : new Response("Cross-origin admin requests are not allowed", { status: 403 });
  } catch {
    return new Response("Cross-origin admin requests are not allowed", { status: 403 });
  }
}

function plainResponse(message, status) {
  return new Response(message, {
    status,
    headers: { "content-type": "text/plain;charset=UTF-8", "cache-control": "no-store" },
  });
}

/**
 * A bound but unmigrated database is the most common way a fresh checkout fails,
 * and it used to surface as a 500 with a stack trace — which says nothing about
 * the one command that fixes it. Every admin API route funnels through here, so
 * one guard covers all of them.
 */
function isMissingSchema(error) {
  return /no such table/i.test(String(error?.message || ""));
}

function configurationError(error) {
  if (isMissingSchema(error)) {
    return plainResponse(
      "The database has no schema yet. Run `pnpm db:migrate:local` for local "
      + "development, or `pnpm db:migrate:remote` for a deployed database, then retry.",
      503,
    );
  }
  if (!(error instanceof ConfigValidationError)) throw error;
  return plainResponse(error.message, 400);
}

function decodeHostname(segment) {
  try {
    return normalizeHostname(decodeURIComponent(segment));
  } catch (error) {
    if (error instanceof ConfigValidationError) throw error;
    throw new ConfigValidationError("Invalid hostname");
  }
}

function renderConfigToHTML(hostname, mode, config) {
  // The admin preview and the served page are the same call, so what an admin
  // approves is exactly what a visitor gets.
  return renderPage(mode, hostname, config, { configured: false }).html;
}

function ensureDB(env) {
  if (!env.DB) {
    return new Response(
      "D1 binding `DB` is not configured. Run `pnpm setup` and update wrangler.toml.",
      { status: 503, headers: { "content-type": "text/plain;charset=UTF-8" } },
    );
  }
  return null;
}

async function cleanupManagedAvatar(env, config) {
  try {
    await deleteManagedAvatar(env.ASSETS, config);
  } catch (error) {
    console.error(`R2 avatar cleanup failed: ${error.message}`);
  }
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
    const html = renderAdminUI({
      isDefaultCreds: creds?.isDefault === true,
      presets: DEMO_PRESETS,
    });
    return new Response(html, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
        "cache-control": "no-store",
        "content-security-policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
        "referrer-policy": "no-referrer",
        "x-content-type-options": "nosniff",
        "x-frame-options": "DENY",
        "x-robots-tag": "noindex, nofollow",
      },
    });
  }

  // POST /_admin_/preview  → render unsaved config
  if (path === "/preview" && request.method === "POST") {
    try {
      const originError = mutationOriginError(request);
      if (originError) return originError;
      const payload = await readJson(request);
      const rawConfig = payload.config === undefined ? {} : payload.config;
      const hostname = normalizeHostname(payload.hostname === undefined ? "preview.local" : payload.hostname);
      const mode = assertMode(rawConfig?.mode === undefined ? "landing" : rawConfig.mode);
      const config = validateConfig(rawConfig, mode);
      const html = renderConfigToHTML(hostname, mode, config);
      return new Response(html, {
        headers: {
          "content-type": "text/html;charset=UTF-8",
          "cache-control": "no-store",
          "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; img-src 'self' https: data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
          "x-content-type-options": "nosniff",
        },
      });
    } catch (error) {
      return configurationError(error);
    }
  }

  // POST /_admin_/api/uploads/profile-image -> store a profile image in R2
  if (path === "/api/uploads/profile-image" && request.method === "POST") {
    if (!env.ASSETS) {
      return json({ error: "R2 binding `ASSETS` is not configured." }, { status: 503 });
    }
    try {
      const originError = mutationOriginError(request);
      if (originError) return originError;
      const form = await request.formData();
      const result = await storeProfileImage(
        env.ASSETS,
        form.get("image"),
        normalizeHostname(form.get("hostname")),
      );
      return json(result, { status: 201 });
    } catch (error) {
      return json({ error: error.message || "Image upload failed." }, { status: 400 });
    }
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
    try {
      const hostname = decodeHostname(m[1]);
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
        const originError = mutationOriginError(request);
        if (originError) return originError;
        const payload = await readJson(request);
        const rawConfig = payload.config === undefined ? {} : payload.config;
        const mode = assertMode(payload.mode === undefined ? "landing" : payload.mode);
        const config = validateConfig(rawConfig, mode);
        const previous = await getDomain(env.DB, hostname);
        const record = await upsertDomain(env.DB, hostname, mode, config);
        if (previous?.config?.avatarObjectKey !== config.avatarObjectKey) {
          await cleanupManagedAvatar(env, previous?.config);
        }
        return json(record);
      }
      if (request.method === "DELETE") {
        const originError = mutationOriginError(request);
        if (originError) return originError;
        const previous = await getDomain(env.DB, hostname);
        await deleteDomain(env.DB, hostname);
        await cleanupManagedAvatar(env, previous?.config);
        return new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
      }
      return methodNotAllowed();
    } catch (error) {
      return configurationError(error);
    }
  }

  return notFound();
}
