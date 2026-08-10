/**
 * Every field the admin form can post must be accepted.
 *
 * This exists because it was not. The renderer moved into @domainparkour/pages and took a
 * stricter vocabulary with it, and strict validation rightly rejects a field it
 * does not understand — but the admin still offered controls for several that had
 * been folded away, so saving a parking page failed with
 * "Unsupported config field: pageTitleSuffix".
 *
 * A schema change and a form are two places, so something has to hold them
 * together. This is that: it reads the field names out of the admin markup itself
 * and puts every one of them through strict validation.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { renderAdminUI } from "../src/admin/ui.js";
import { MODE_DEFAULTS } from "../src/config.js";
import { validateConfig, ConfigValidationError } from "../src/safety.js";

/**
 * Every config field the admin renders a control for. There are two spellings:
 * the wording panel uses `data-config-key`, and the main form uses `id="f-<key>"`.
 * Both end up in the posted config, so both are part of the contract.
 *
 * `hostname` and `avatarFile` are not config — one is the row key, the other is an
 * upload input whose result becomes `avatarUrl`.
 */
const NOT_CONFIG = new Set(['hostname', 'avatarFile']);

function adminConfigKeys() {
  const html = renderAdminUI({ presets: [], isDefaultCreds: true });
  const keys = [
    ...[...html.matchAll(/data-config-key="([^"]+)"/g)].map((match) => match[1]),
    ...[...html.matchAll(/id="f-([A-Za-z]+)"/g)].map((match) => match[1]),
  ];
  return [...new Set(keys)].filter((key) => !NOT_CONFIG.has(key));
}

const MODES = ["parking", "coming-soon", "landing", "profile"];

test("every field the admin form offers survives strict validation", () => {
  const keys = adminConfigKeys();
  assert.ok(keys.length >= 35, `expected the whole field set, found ${keys.length}`);

  for (const mode of MODES) {
    for (const key of keys) {
      // A plausible value per field shape; the point is the field name, not the value.
      const value = /^showCredit$/.test(key) ? true
        : /Url$/i.test(key) ? "https://example.com/x"
        : /Email$/i.test(key) ? "owner@example.com"
        : /^accentColor$/.test(key) ? "#0f766e"
        : /Date$/i.test(key) ? "2030-01-01"
        : "text";
      assert.doesNotThrow(
        () => validateConfig({ [key]: value }, mode),
        `${mode}: the admin offers "${key}" but the schema rejects it`,
      );
    }
  }
});

test("the wording defaults the admin prefills are all accepted", () => {
  for (const [mode, defaults] of Object.entries(MODE_DEFAULTS)) {
    assert.doesNotThrow(
      () => validateConfig({ ...defaults }, mode),
      `${mode}: defaults.json contains a field the schema rejects`,
    );
  }
});

test("a whole realistic page round-trips through validation", () => {
  const config = {
    domainTitle: "cdn.farm",
    statusLabel: "Available",
    eyebrowText: "Premium domain",
    title: "A memorable name",
    description: "Short, brandable, and available.",
    salePrice: "30,000 USD",
    contactEmail: "owner@example.com",
    registrationDate: "2015-04-02",
    pageTitleSuffix: "For sale",
    priceLabel: "Asking price",
    trustValue: "Verified",
    trustLabel: "Secure inquiry",
    domainAgeYears: "10+",
    domainAgeLabel: "Domain age",
    accentColor: "#0f766e",
    footerText: "Enquiries welcome",
    showCredit: false,
    socialLinks: { github: "https://github.com/thinkdj" },
  };
  const validated = validateConfig(config, "parking");

  assert.equal(validated.domain_title, "cdn.farm");
  assert.equal(validated.labels.pageTitleSuffix, "For sale");
  assert.equal(validated.footer_credit, false);
  // The six flat stat fields fold into the bounded list.
  assert.deepEqual(validated.stats, [
    { value: "10+", label: "Domain age" },
    { value: "Verified", label: "Secure inquiry" },
  ]);
});

test("a genuine typo is still rejected", () => {
  assert.throws(() => validateConfig({ nonsenseField: "x" }, "parking"), ConfigValidationError);
});

test("retired countdown copy is dropped rather than refused", () => {
  // The countdown is gone, but an old row or a stale form must still save.
  const validated = validateConfig(
    { daysLabel: "Days", hoursLabel: "Hours", launchedText: "We are live." },
    "coming-soon",
  );
  assert.equal(validated.daysLabel, undefined);
  assert.equal(Object.keys(validated).some((key) => /days|hours|launched/i.test(key)), false);
});

test("the admin markup offers no control the renderer cannot honour", () => {
  // Retired fields should not merely be tolerated — they should not be on screen.
  const html = readFileSync(new URL("../src/admin/ui.js", import.meta.url), "utf8");
  for (const retired of ["daysLabel", "hoursLabel", "minutesLabel", "secondsLabel", "launchedText"]) {
    assert.doesNotMatch(
      html,
      new RegExp(`data-config-key="${retired}"`),
      `the admin still offers "${retired}", which no longer renders anywhere`,
    );
  }
});
