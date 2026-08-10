import test from "node:test";
import assert from "node:assert/strict";

import worker from "../src/index.js";
import { handleAdmin } from "../src/admin/router.js";
import { previewConfig } from "../src/config.js";
import { validateConfig } from "../src/safety.js";
import { generateParkingHTML } from "../src/templates/parking.js";
import { generateComingSoonHTML } from "../src/templates/coming-soon.js";
import { generateLandingHTML } from "../src/templates/landing.js";
import { generateProfileHTML } from "../src/templates/profile.js";

const ADMIN_ENV = { ADMIN_USER: "ada", ADMIN_PASSWORD: "s3cret" };
const AUTH = { authorization: `Basic ${btoa("ada:s3cret")}` };

function adminRequest(path, init = {}) {
  return new Request(`https://admin.example${path}`, {
    ...init,
    headers: { ...AUTH, ...(init.headers || {}) },
  });
}

function hostileConfig(mode) {
  return {
    mode,
    domainTitle: '<img src=x onerror="globalThis.pwned=1">',
    title: '</script><script>globalThis.pwned=2</script>',
    description: '<svg onload="globalThis.pwned=3">',
    footerText: '" autofocus onfocus="globalThis.pwned=4',
    accentColor: 'red; background:url(javascript:globalThis.pwned=5)',
    links: [{ title: '<b>unsafe</b>', url: 'javascript:globalThis.pwned=6' }],
    socialLinks: { github: 'javascript:globalThis.pwned=7' },
    avatarUrl: 'data:text/html,<script>globalThis.pwned=8</script>',
    contactEmail: 'x@evil.example</script><script>globalThis.pwned=9</script>',
    features: [{ title: '<img src=x onerror=10>', description: '<script>11</script>' }],
  };
}

const generators = {
  parking: generateParkingHTML,
  "coming-soon": generateComingSoonHTML,
  landing: generateLandingHTML,
  profile: generateProfileHTML,
};

test("all public templates treat hostile stored values as text and discard unsafe URLs", () => {
  for (const [mode, generate] of Object.entries(generators)) {
    const html = generate(previewConfig("example.com", hostileConfig(mode)));
    assert.doesNotMatch(html, /<img\s+src=x/i, mode);
    assert.doesNotMatch(html, /<svg\s+onload/i, mode);
    assert.doesNotMatch(html, /<\/script><script>globalThis\.pwned/i, mode);
    assert.doesNotMatch(html, /href="javascript:/i, mode);
    assert.doesNotMatch(html, /src="data:/i, mode);
    assert.match(html, /&lt;img src=x onerror/i, mode);
    // The rejected accent falls back to the base theme, and the accent reaches
    // the page only as --color-primary; everything else derives from it.
    assert.match(html, /--color-primary: #e8590c/i, mode);
    assert.doesNotMatch(html, /background:url\(javascript:/i, mode);
    // The generated favicon embeds the accent too, so it must be the safe one.
    assert.doesNotMatch(html, /rel="icon"[^>]*javascript/i, mode);
  }
});

test("inline script data cannot close its script element", () => {
  const cfg = previewConfig("example.com", { mode: "landing", domainTitle: "Example" });
  const html = generateLandingHTML(cfg, [{ name: '</script><script>globalThis.pwned=1</script>' }]);
  assert.doesNotMatch(html, /<\/script><script>globalThis\.pwned/i);
  assert.match(html, /\\u003c\/script\\u003e\\u003cscript/i);
  assert.match(html, /&lt;\/script&gt;&lt;script&gt;/i);
});

test("admin preview validates config before rendering and returns a no-store safe document", async () => {
  const unsafe = await handleAdmin(
    adminRequest("/_admin_/preview", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        hostname: "example.com",
        config: { mode: "landing", links: [{ title: "Pwn", url: "javascript:alert(1)" }] },
      }),
    }),
    ADMIN_ENV,
  );
  assert.equal(unsafe.status, 400);
  assert.match(await unsafe.text(), /safe HTTPS URL/i);

  const safeText = await handleAdmin(
    adminRequest("/_admin_/preview", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        hostname: "example.com",
        config: { mode: "landing", title: '<img src=x onerror="alert(1)">' },
      }),
    }),
    ADMIN_ENV,
  );
  assert.equal(safeText.status, 200);
  const html = await safeText.text();
  assert.match(html, /&lt;img src=x onerror=/i);
  assert.doesNotMatch(html, /<img\s+src=x/i);
  assert.match(safeText.headers.get("cache-control"), /no-store/);
  assert.match(safeText.headers.get("content-security-policy"), /object-src 'none'/);
});

test("admin API rejects invalid hostnames, unknown fields, unsafe CSS, and cross-origin writes before D1", async () => {
  const neverUseDb = {
    prepare() {
      assert.fail("invalid admin input must not reach D1");
    },
  };
  const cases = [
    {
      path: "/_admin_/api/domains/bad%2Fhost",
      body: { mode: "landing", config: {} },
      expected: /Invalid hostname/,
    },
    {
      path: "/_admin_/api/domains/example.com",
      body: { mode: "landing", config: { accentColor: 'red; background:url(javascript:alert(1))' } },
      expected: /hex color/,
    },
    {
      path: "/_admin_/api/domains/example.com",
      body: { mode: "landing", config: { arbitraryHtml: "<script>alert(1)</script>" } },
      expected: /Unsupported config field/,
    },
  ];
  for (const { path, body, expected } of cases) {
    const response = await handleAdmin(
      adminRequest(path, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }),
      { ...ADMIN_ENV, DB: neverUseDb },
    );
    assert.equal(response.status, 400);
    assert.match(await response.text(), expected);
  }

  const crossOrigin = await handleAdmin(
    adminRequest("/_admin_/api/domains/example.com", {
      method: "PUT",
      headers: { "content-type": "application/json", origin: "https://attacker.example" },
      body: JSON.stringify({ mode: "landing", config: {} }),
    }),
    { ...ADMIN_ENV, DB: neverUseDb },
  );
  assert.equal(crossOrigin.status, 403);
});

test("a hostile legacy D1 record is repaired before it reaches the public response", async () => {
  const record = {
    hostname: "example.com",
    mode: "landing",
    config: JSON.stringify(hostileConfig("landing")),
    created_at: 1,
    updated_at: 1,
  };
  const db = {
    prepare() {
      return {
        bind() {
          return { first: async () => record };
        },
      };
    },
  };
  const response = await worker.fetch(new Request("https://example.com/"), { DB: db }, {});
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-page-mode"), "landing");
  assert.match(response.headers.get("content-security-policy"), /frame-ancestors 'none'/);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.doesNotMatch(html, /<img\s+src=x/i);
  assert.doesNotMatch(html, /href="javascript:/i);
  assert.doesNotMatch(html, /<\/script><script>globalThis\.pwned/i);
});

test("strict validation keeps normal configuration and rejects dangerous URLs", () => {
  const valid = validateConfig({
    title: "A normal title",
    accentColor: "#3cbfa3",
    contactEmail: "Owner@Example.com",
    links: [{ title: "Docs", url: "https://docs.example.com/path" }],
    socialLinks: { github: "https://github.com/thinkdj", email: "mailto:hi@example.com" },
  }, "landing");
  assert.equal(valid.contactEmail, "owner@example.com");
  assert.equal(valid.links[0].url, "https://docs.example.com/path");
  assert.equal(valid.socialLinks.email, "mailto:hi@example.com");
  assert.throws(
    () => validateConfig({ avatarUrl: "javascript:alert(1)" }, "profile"),
    /safe HTTPS URL/,
  );
  assert.throws(
    () => validateConfig({ links: [{ title: "Docs", url: "https://docs.example", html: "<script>" }] }, "landing"),
    /unsupported field/,
  );
  assert.throws(
    () => validateConfig({ socialLinks: { email: "https://attacker.example" } }, "landing"),
    /email address/,
  );
});
