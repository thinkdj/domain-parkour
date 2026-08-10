import test from "node:test";
import assert from "node:assert/strict";

import { adminCredentials, requireAdmin } from "../src/admin/auth.js";

function req(url, user, pass) {
  const headers =
    user === undefined ? {} : { authorization: `Basic ${btoa(`${user}:${pass}`)}` };
  return new Request(url, { headers });
}

const SECRETS = { ADMIN_USER: "ada", ADMIN_PASSWORD: "s3cret" };

test("unconfigured admin is disabled on every internet-reachable hostname", async () => {
  // A fresh `wrangler deploy` lands on workers.dev before any custom domain
  // exists; it must never hand out the local admin/admin fallback.
  for (const url of [
    "https://domain-parkour.someone.workers.dev/_admin_/",
    "https://preview.domain-parkour.someone.workers.dev/_admin_/",
    "https://example.com/_admin_/",
  ]) {
    assert.equal(adminCredentials({}, new URL(url).hostname), null, url);

    const res = requireAdmin(req(url, "admin", "admin"), {});
    assert.equal(res?.status, 503, url);
    assert.doesNotMatch(res.headers.get("www-authenticate") || "", /Basic/);
  }
});

test("unconfigured admin still falls back to admin/admin on loopback only", () => {
  const creds = adminCredentials({}, "localhost");
  assert.deepEqual(creds, {
    user: "admin",
    pass: "admin",
    isDefault: true,
    configured: false,
  });
  assert.equal(requireAdmin(req("http://localhost:8787/_admin_/", "admin", "admin"), {}), null);
});

test("configured secrets authorize on any hostname and reject everything else", () => {
  const url = "https://domain-parkour.someone.workers.dev/_admin_/";
  assert.equal(requireAdmin(req(url, "ada", "s3cret"), SECRETS), null);

  assert.equal(requireAdmin(req(url, "ada", "wrong"), SECRETS).status, 401);
  assert.equal(requireAdmin(req(url, "admin", "admin"), SECRETS).status, 401);
  assert.equal(requireAdmin(req(url), SECRETS).status, 401);
});

test("half-configured secrets never enable the admin", () => {
  for (const env of [{ ADMIN_USER: "ada" }, { ADMIN_PASSWORD: "s3cret" }]) {
    assert.equal(adminCredentials(env, "example.com"), null);
    assert.equal(adminCredentials(env, "localhost").isDefault, true);
  }
});
