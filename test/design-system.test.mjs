/**
 * The Parkour design system, made executable.
 *
 * These assert the rules that are easy to break by accident and hard to see
 * in a diff. Each one names the section of parkour_design_system.html it
 * enforces. If a rule here is wrong, change the design system first.
 */

import test from "node:test";
import assert from "node:assert/strict";

import { previewConfig } from "../src/config.js";
import { generateParkingHTML } from "../src/templates/parking.js";
import { generateComingSoonHTML } from "../src/templates/coming-soon.js";
import { generateLandingHTML } from "../src/templates/landing.js";
import { generateProfileHTML } from "../src/templates/profile.js";
import { renderAdminUI } from "../src/admin/ui.js";

const generators = {
  parking: generateParkingHTML,
  "coming-soon": generateComingSoonHTML,
  landing: generateLandingHTML,
  profile: generateProfileHTML,
};

function renderPage(mode) {
  return generators[mode](
    previewConfig("cdn.farm", {
      mode,
      domainTitle: "cdn.farm",
      salePrice: "30,000 USD",
      contactEmail: "hello@example.com",
      launchDate: "2048-01-01T00:00",
      links: [{ title: "Portfolio", url: "https://example.com" }],
      socialLinks: { github: "https://github.com/thinkdj" },
      features: [{ title: "One", description: "Two" }],
    }),
  );
}

const documents = () => [
  ...Object.keys(generators).map((mode) => [mode, renderPage(mode)]),
  ["admin", renderAdminUI({ isDefaultCreds: true, presets: [] })],
];

// Page CSS ships minified, admin CSS ships as written; compare them the same way.
const styleOf = (html) =>
  (html.match(/<style>([\s\S]*?)<\/style>/g) || [])
    .join("\n")
    .replace(/\s*([{}:;,])\s*/g, "$1");

test("restraint over garnish: no gradients, glass, or filter tricks (§principles 5)", () => {
  for (const [name, html] of documents()) {
    const css = styleOf(html);
    assert.doesNotMatch(css, /-gradient\(/i, name);
    assert.doesNotMatch(css, /backdrop-filter/i, name);
    assert.doesNotMatch(css, /filter:\s*brightness/i, name);
  }
});

test("pages ship self-contained: no third-party request of any kind (§principles 5)", () => {
  for (const [name, html] of documents()) {
    // Only the two first-party origins the Worker itself serves may appear as
    // links; nothing may be *fetched* from another host.
    assert.doesNotMatch(html, /@import/i, name);
    assert.doesNotMatch(html, /<link[^>]+rel="stylesheet"/i, name);
    assert.doesNotMatch(html, /<script[^>]+src=/i, name);
    assert.doesNotMatch(html, /fonts\.(googleapis|gstatic)\.com/i, name);
    assert.doesNotMatch(html, /cdn\.jsdelivr\.net|unpkg\.com/i, name);
    assert.doesNotMatch(styleOf(html), /url\(\s*["']?https?:/i, name);
  }
});

test("one variable rethemes a page: the accent arrives only as --color-primary (§02)", () => {
  const html = generateLandingHTML(
    previewConfig("cdn.farm", { mode: "landing", domainTitle: "cdn.farm", accentColor: "#0f766e" }),
  );
  assert.match(html, /--color-primary: ?#0f766e/i);
  // Hovers, tints, and rings must derive rather than be authored per page.
  assert.doesNotMatch(html, /--color-primary-hover: ?#/i);
  assert.match(styleOf(html), /--color-primary-hover:color-mix/i);
  // The pre-token names are gone for good.
  assert.doesNotMatch(html, /--accent-color|--text-dim|--surface-raised/i);

  // ...and it must WIN. The token block declares its own --color-primary, so
  // presence in the document proves nothing: an accent emitted above it loses
  // the cascade and the page renders brand orange while this file looks green.
  const css = styleOf(html);
  const accentAt = css.lastIndexOf("--color-primary:#0f766e");
  const brandAt = css.lastIndexOf("--color-primary:#E8590C");
  assert.ok(accentAt > -1, "accent not emitted");
  assert.ok(
    brandAt === -1 || accentAt > brandAt,
    "the configured accent is overridden by the base token that follows it",
  );
});

test("mono for machine truth: the hostname headline is monospace (§principles 3)", () => {
  for (const mode of ["parking", "coming-soon", "landing"]) {
    assert.match(renderPage(mode), /class="dp-title[^"]*"[^>]*>cdn\.farm</, mode);
  }
  assert.match(styleOf(renderPage("landing")), /\.dp-title\{[^}]*font-family:var\(--font-mono\)/);
});

test("motion: transitions use the three sanctioned durations only (§08)", () => {
  for (const [name, html] of documents()) {
    for (const [decl] of styleOf(html).matchAll(/transition:[^;}]+/g)) {
      // The reduced-motion block switches everything off; that is the point.
      if (/^transition:none\b/.test(decl)) continue;
      assert.match(decl, /var\(--t-(fast|base|enter)\)/, `${name}: ${decl}`);
      assert.match(decl, /var\(--ease\)/, `${name}: ${decl}`);
    }
  }
});

test("radius comes from the scale, never a loose value (§04)", () => {
  // Canonical names are sm/md/lg/xl/pill. The old set had "card" and a bare
  // "--radius" for the same numbers Cloud called something else again.
  const CORNER = /^(var\(--radius-(sm|md|lg|xl|pill)\)|0|50%|inherit)$/;
  for (const [name, html] of documents()) {
    for (const [, value] of styleOf(html).matchAll(/border-radius:([^;}]+)/g)) {
      for (const corner of value.trim().split(/\s+(?![^(]*\))/)) {
        assert.match(corner, CORNER, `${name}: border-radius:${value}`);
      }
    }
  }
});

test("layering comes from the z-index scale (§04)", () => {
  for (const [name, html] of documents()) {
    for (const [, value] of styleOf(html).matchAll(/z-index:([^;}]+)/g)) {
      assert.match(value.trim(), /^var\(--z-[a-z]+\)$/, `${name}: z-index:${value}`);
    }
  }
});

test("the admin and the pages it edits share one token block (§02, §07)", () => {
  const page = styleOf(renderPage("landing"));
  const admin = styleOf(renderAdminUI({ presets: [] }));
  // Both documents inline the same generated copy of design-system/tokens.css.
  for (const token of [
    "--color-surface:light-dark(#FFFFFF,#0D1220)",
    "--color-ink:light-dark(#101828,#F4F6FA)",
    "--color-body:light-dark(#475467,#A9B1C2)",
    "--color-muted:light-dark(#98A2B3,#66708A)",
    "--color-line:light-dark(#E6E8EE,#232B3D)",
    "--color-line-strong:light-dark(#D3D7E0,#313B55)",
    "--color-success:light-dark(#079455,#34C77B)",
    "--color-danger:light-dark(#D92D20,#F97066)",
  ]) {
    assert.ok(page.includes(token), `page missing ${token}`);
    assert.ok(admin.includes(token), `admin missing ${token}`);
  }
});

test("appearance is one declaration per token, not a second palette (§07)", () => {
  for (const [name, html] of documents()) {
    const css = styleOf(html);
    // The old shape: a whole duplicate set of neutrals under a scope class or
    // a media query, free to drift from the first set. Both are gone.
    assert.doesNotMatch(css, /\.theme-dark/, name);
    assert.doesNotMatch(css, /prefers-color-scheme/, name);
    assert.match(css, /color-scheme:light dark/, name);
    assert.match(css, /light-dark\(/, name);
    // The entire switch: an attribute that changes color-scheme and nothing else.
    assert.match(css, /\[data-theme="dark"\]\{color-scheme:dark;?\}/, name);
  }
});

test("solid ink surfaces invert rather than hardcode white (§02)", () => {
  // #101828 on a #0D1220 surface is invisible. --color-on-secondary is the fix,
  // so no rule may pair the ink background with a literal foreground.
  const admin = styleOf(renderAdminUI({ presets: [] }));
  for (const [decl] of admin.matchAll(/background:var\(--color-secondary\)[^}]*/g)) {
    assert.doesNotMatch(decl, /color:#(fff|ffffff)\b/i, decl);
  }
});

test("reversible by design: deleting a page offers undo (§principles 4, §06.9)", () => {
  const html = renderAdminUI({ presets: [] });
  assert.match(html, /id="undo-bar"/);
  assert.match(html, /id="undo-btn"[^>]*>|>Undo</);
  // The old copy promised the opposite of the principle.
  assert.doesNotMatch(html, /cannot be undone/i);
});
