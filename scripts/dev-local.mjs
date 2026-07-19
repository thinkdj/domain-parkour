#!/usr/bin/env node
/**
 * Zero-account local dev for Domain Parkour.
 *
 * Unlike `pnpm setup` (which logs into Cloudflare and provisions remote D1/R2),
 * this script sets up everything needed to run the worker **entirely on your
 * machine** — no Cloudflare account, no login, no network:
 *
 *   1. Ensures `.dev.vars` defines ADMIN_USER / ADMIN_PASSWORD (admin/admin),
 *      without ever overwriting a value you've already customized.
 *   2. Applies migrations to the *local* D1 (so the admin's save/list works).
 *   3. Starts `wrangler dev`; its local R2 simulator stores uploaded images.
 *
 * The public template gallery (parking / coming-soon / landing / profile) reads
 * from defaults.json and never touches D1, so it renders even
 * before step 2. Step 2 only exists so the /_admin_/ panel can read & write.
 *
 * Usage:
 *   pnpm dev:local                 # http://localhost:8787
 *   pnpm dev:local -- --port 9000  # extra args are forwarded to `wrangler dev`
 */

import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const nodeRequire = createRequire(import.meta.url);
const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const DEV_VARS = resolve(ROOT, ".dev.vars");
const DB_NAME = "domain-parkour-db";

const passthrough = process.argv.slice(2);

function log(msg) {
  process.stdout.write(`\n\x1b[36m▸\x1b[0m ${msg}\n`);
}
function ok(msg) {
  process.stdout.write(`  \x1b[32m✔\x1b[0m ${msg}\n`);
}
function die(msg) {
  process.stderr.write(`\n\x1b[31m✗\x1b[0m ${msg}\n`);
  process.exit(1);
}

// Resolve wrangler's own entry so we can run it via `node` directly — no shell,
// no npx.cmd. That means args pass through verbatim and Ctrl+C stops cleanly
// (spawning through cmd.exe/npx.cmd on Windows triggers "Terminate batch job?").
function resolveWranglerBin() {
  try {
    const pkgPath = nodeRequire.resolve("wrangler/package.json");
    const pkg = nodeRequire(pkgPath);
    const bin = typeof pkg.bin === "string" ? pkg.bin : pkg.bin?.wrangler;
    return bin ? resolve(dirname(pkgPath), bin) : null;
  } catch {
    return null;
  }
}
const WRANGLER_BIN = resolveWranglerBin();

function wrangler(cmd) {
  const opts = {
    cwd: ROOT,
    stdio: "inherit",
    // Local dev never talks to Cloudflare; keep it that way and skip telemetry.
    env: { ...process.env, WRANGLER_SEND_METRICS: "false" },
  };
  if (WRANGLER_BIN) return spawnSync(process.execPath, [WRANGLER_BIN, ...cmd], opts);
  // Fallback if resolution ever fails: npx via shell (shell:true so Windows
  // resolves npx → npx.cmd).
  return spawnSync("npx", ["--no-install", "wrangler", ...cmd], { ...opts, shell: true });
}

// ── 1. Local admin credentials (never clobber a customized value) ────────────
log("Ensuring .dev.vars (local admin credentials)");
const current = existsSync(DEV_VARS) ? readFileSync(DEV_VARS, "utf8") : null;
const hasUser = current !== null && /^\s*ADMIN_USER\s*=/m.test(current);
const hasPass = current !== null && /^\s*ADMIN_PASSWORD\s*=/m.test(current);
const wroteBothDefaults = !hasUser && !hasPass;

if (hasUser && hasPass) {
  ok(".dev.vars already defines ADMIN_USER / ADMIN_PASSWORD (left untouched)");
} else {
  const additions = [];
  if (!hasUser) additions.push('ADMIN_USER="admin"');
  if (!hasPass) additions.push('ADMIN_PASSWORD="admin"');
  const prefix =
    current !== null
      ? current.trimEnd() + "\n\n"
      : "# Local-only secrets — gitignored, never committed.\n";
  writeFileSync(DEV_VARS, prefix + additions.join("\n") + "\n");
  ok(
    wroteBothDefaults
      ? "wrote admin/admin to .dev.vars (local dev only)"
      : "added the missing admin credential to .dev.vars (existing value kept)",
  );
}

// ── 2. Local D1 migrations (no login — writes to .wrangler/state) ────────────
log("Applying LOCAL D1 migrations (no Cloudflare account needed)");
const mig = wrangler(["d1", "migrations", "apply", DB_NAME, "--local"]);
if (mig.error) die(`Could not run wrangler: ${mig.error.message}`);
if (mig.status !== 0) {
  die(
    "Local migration failed. If you saw a prompt, answer 'y'. " +
      "This step is fully local and never contacts Cloudflare.",
  );
}
ok("Local D1 is ready (admin save/list will work)");

// ── 3. Run the worker locally ────────────────────────────────────────────────
function portFrom(args) {
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--port" || args[i] === "-p") return args[i + 1] || "8787";
    const m = /^--port=(\d+)$/.exec(args[i]);
    if (m) return m[1];
  }
  return "8787";
}
const port = portFrom(passthrough);
const creds = wroteBothDefaults ? "admin / admin" : "the credentials in your .dev.vars";

log("Starting wrangler dev  —  Ctrl+C to stop");
process.stdout.write(
  `  Public gallery : http://localhost:${port}/?themeIndex=0  (switch presets top-left)\n` +
    `  Admin panel    : http://localhost:${port}/_admin_/       (log in with ${creds})\n`,
);
const dev = wrangler(["dev", ...passthrough]);
if (dev.error) die(`Could not run wrangler: ${dev.error.message}`);
process.exit(dev.status ?? 0);
