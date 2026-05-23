#!/usr/bin/env node
/**
 * One-command setup for Domain Parkour.
 *
 * What it does:
 *   1. Ensures you're logged in to Cloudflare (`wrangler whoami`).
 *   2. Creates a D1 database named `domain-parkour-db` (skipped if it exists).
 *   3. Writes the database_id into wrangler.toml.
 *   4. Applies migrations locally (always) and remotely (with --remote flag).
 *   5. Writes a starter .dev.vars with admin/admin credentials.
 *
 * Usage:
 *   pnpm setup           # local only
 *   pnpm setup --remote  # also apply migrations to the remote DB
 */

import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const WRANGLER_TOML = resolve(ROOT, "wrangler.toml");
const DEV_VARS = resolve(ROOT, ".dev.vars");
const DB_NAME = "domain-parkour-db";

const args = process.argv.slice(2);
const APPLY_REMOTE = args.includes("--remote");

function log(msg) {
  process.stdout.write(`\n[36m▸[0m ${msg}\n`);
}
function ok(msg) {
  process.stdout.write(`  [32m✔[0m ${msg}\n`);
}
function warn(msg) {
  process.stdout.write(`  [33m![0m ${msg}\n`);
}
function die(msg) {
  process.stderr.write(`\n[31m✗[0m ${msg}\n`);
  process.exit(1);
}

function run(cmd, opts = {}) {
  return spawnSync("npx", ["--no-install", "wrangler", ...cmd], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: opts.inherit ? "inherit" : "pipe",
    ...opts,
  });
}

function findDatabaseId(stdout) {
  // wrangler prints something like:
  //   database_id = "abc-123"
  // and/or a JSON-ish "uuid": "..."
  const tomlMatch = stdout.match(/database_id\s*=\s*"([^"]+)"/);
  if (tomlMatch) return tomlMatch[1];
  const uuidMatch = stdout.match(/"uuid":\s*"([^"]+)"/);
  if (uuidMatch) return uuidMatch[1];
  return null;
}

function patchWranglerToml(databaseId) {
  let toml = readFileSync(WRANGLER_TOML, "utf8");
  if (toml.includes(databaseId)) return false;
  toml = toml.replace(
    /database_id\s*=\s*"[^"]*"/,
    `database_id = "${databaseId}"`,
  );
  writeFileSync(WRANGLER_TOML, toml);
  return true;
}

function ensureDevVars() {
  if (existsSync(DEV_VARS)) {
    const current = readFileSync(DEV_VARS, "utf8");
    if (current.includes("ADMIN_USER") && current.includes("ADMIN_PASSWORD")) {
      ok(".dev.vars already contains ADMIN_USER / ADMIN_PASSWORD");
      return;
    }
    writeFileSync(
      DEV_VARS,
      current.trimEnd() + '\n\nADMIN_USER="admin"\nADMIN_PASSWORD="admin"\n',
    );
  } else {
    writeFileSync(
      DEV_VARS,
      '# Local-only secrets — not committed.\nADMIN_USER="admin"\nADMIN_PASSWORD="admin"\n',
    );
  }
  ok("wrote .dev.vars with admin/admin (local dev only)");
}

// ── 1. Cloudflare login ─────────────────────────────────────────────────────
log("Checking Cloudflare login");
const who = run(["whoami"]);
if (who.status !== 0) {
  warn("Not logged in. Running `wrangler login`...");
  const login = run(["login"], { inherit: true });
  if (login.status !== 0) die("Login failed.");
}
ok("Cloudflare account ready");

// ── 2. D1 database ──────────────────────────────────────────────────────────
log(`Looking for D1 database "${DB_NAME}"`);
const list = run(["d1", "list", "--json"]);
let databaseId = null;
if (list.status === 0) {
  try {
    const items = JSON.parse(list.stdout);
    const found = items.find((d) => d.name === DB_NAME);
    if (found) {
      databaseId = found.uuid || found.id || found.database_id;
      ok(`Found existing database (${databaseId})`);
    }
  } catch {
    // older wrangler versions print non-JSON; fall through to create
  }
}

if (!databaseId) {
  log(`Creating D1 database "${DB_NAME}"`);
  const create = run(["d1", "create", DB_NAME]);
  if (create.status !== 0) {
    process.stderr.write(create.stderr || "");
    die("Failed to create D1 database. Check the output above.");
  }
  process.stdout.write(create.stdout);
  databaseId = findDatabaseId(create.stdout);
  if (!databaseId) die("Could not parse database_id from wrangler output.");
  ok(`Created database (${databaseId})`);
}

// ── 3. wrangler.toml ────────────────────────────────────────────────────────
log("Updating wrangler.toml");
const patched = patchWranglerToml(databaseId);
if (patched) ok("Patched wrangler.toml with database_id");
else ok("wrangler.toml already references this database_id");

// ── 4. Migrations ───────────────────────────────────────────────────────────
log("Applying local migrations");
const localMig = run(["d1", "migrations", "apply", DB_NAME, "--local"], {
  inherit: true,
});
if (localMig.status !== 0) die("Local migration failed.");
ok("Local migrations applied");

if (APPLY_REMOTE) {
  log("Applying remote migrations");
  const remoteMig = run(["d1", "migrations", "apply", DB_NAME, "--remote"], {
    inherit: true,
  });
  if (remoteMig.status !== 0) die("Remote migration failed.");
  ok("Remote migrations applied");
} else {
  warn(
    "Skipping remote migrations. Run `pnpm setup --remote` before deploying.",
  );
}

// ── 5. .dev.vars ────────────────────────────────────────────────────────────
log("Ensuring .dev.vars");
ensureDevVars();

// ── Done ────────────────────────────────────────────────────────────────────
process.stdout.write(`
[32m✔ Setup complete.[0m

Next steps:
  • [1mpnpm dev[0m       → http://localhost:8787/_admin_/  (admin / admin)
  • [1mpnpm deploy[0m    → push to Cloudflare
  • Before deploying, set production admin creds:
        wrangler secret put ADMIN_USER
        wrangler secret put ADMIN_PASSWORD
        pnpm setup --remote

`);
