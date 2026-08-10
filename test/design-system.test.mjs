/**
 * The Parkour design system, made executable.
 *
 * The page-level rules moved to pages/test/design-system.test.js with the
 * renderer, where they cover both apps at once. These are the admin's own.
 *
 * These assert the rules that are easy to break by accident and hard to see
 * in a diff. Each one names the section of parkour_design_system.html it
 * enforces. If a rule here is wrong, change the design system first.
 */

import test from "node:test";
import assert from "node:assert/strict";

import { renderPage as renderSharedPage } from "../pages/index.js";
import { renderAdminUI } from "../src/admin/ui.js";

function renderPage(mode) {
  // Through @domainparkour/pages, so this asserts the same document a visitor receives.
  return renderSharedPage(mode, "cdn.farm", {
    domain_title: "cdn.farm",
    price: "30,000 USD",
    contact_email: "hello@example.com",
    links: [{ title: "Portfolio", url: "https://example.com" }],
  }).html;
}

const documents = () => [
  ["landing", renderPage("landing")],
  ["admin", renderAdminUI({ isDefaultCreds: true, presets: [] })],
];

// Page CSS ships minified, admin CSS ships as written; compare them the same way.
const styleOf = (html) =>
  (html.match(/<style>([\s\S]*?)<\/style>/g) || [])
    .join("\n")
    .replace(/\s*([{}:;,])\s*/g, "$1");

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

test("the admin renders from the shared component layer, not a copy of it (§06)", () => {
  const admin = styleOf(renderAdminUI({ presets: [] }));
  // The generated component layer is inlined verbatim, so these are its rules,
  // not lookalikes: if the admin ever forks one, the duplicate shows up here.
  for (const rule of [
    ".btn{", ".btn-primary{", ".badge{", ".badge-success{", ".alert{", ".alert-warning{",
    ".input,.textarea,.select{", ".switch-track{", ".dialog{", ".toast{", ".undo-bar{",
    ".choice-card{", ".msg-list{", ".filter-tab{", ".empty-state{", ".repeater{",
  ]) {
    assert.ok(admin.includes(rule), `admin is missing the shared ${rule} recipe`);
  }
  // One implementation, not two: nothing may open a second rule for these.
  // Anchored on a rule boundary so `.card-actions .btn{...}` is not a match.
  for (const selector of ["btn", "badge", "alert", "switch-track", "toast", "undo-bar", "choice-card"]) {
    const opens = admin.match(new RegExp(`(?:^|\\}|\\n)\\.${selector}\\{`, "g")) || [];
    assert.equal(opens.length, 1, `.${selector} opens ${opens.length} rules, expected 1`);
  }
});

test("the admin and the pages it edits share one token block (§02, §07)", () => {
  const page = styleOf(renderPage("landing"));
  const admin = styleOf(renderAdminUI({ presets: [] }));
  // Both resolve to the same design-system/tokens.css values, though the page
  // carries only the subset it uses (pages/build-tokens.mjs) - danger and
  // warning belong to the admin, so they are not in this list.
  for (const token of [
    "--color-surface:light-dark(#FFFFFF,#0D1220)",
    "--color-ink:light-dark(#101828,#F4F6FA)",
    "--color-body:light-dark(#475467,#A9B1C2)",
    "--color-muted:light-dark(#98A2B3,#66708A)",
    "--color-line:light-dark(#E6E8EE,#232B3D)",
    "--color-line-strong:light-dark(#D3D7E0,#313B55)",
    "--color-success:light-dark(#079455,#34C77B)",
  ]) {
    assert.ok(page.includes(token), `page missing ${token}`);
    assert.ok(admin.includes(token), `admin missing ${token}`);
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

test("disabled form controls are visibly and behaviorally muted (§06.3)", () => {
  const admin = styleOf(renderAdminUI({ presets: [] }));
  assert.match(admin, /select:disabled[^{]*\{[^}]*background:var\(--color-surface-2\)/);
  assert.match(admin, /select:disabled[^{]*\{[^}]*cursor:not-allowed/);
  assert.match(admin, /input\[type="checkbox"\]:disabled/);
  assert.match(admin, /\.switch input:disabled\s*\+\s*\.switch-track/);
  assert.match(admin, /\.switch input:disabled\s*\+\s*\.switch-track[^}]*opacity:0\.72/);
});

test("reversible by design: deleting a page offers undo (§principles 4, §06.9)", () => {
  const html = renderAdminUI({ presets: [] });
  assert.match(html, /id="undo-bar"/);
  assert.match(html, /id="undo-btn"[^>]*>|>Undo</);
  // The old copy promised the opposite of the principle.
  assert.doesNotMatch(html, /cannot be undone/i);
});
