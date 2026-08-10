import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  DEMO_PRESETS,
  FALLBACK_DEFAULT,
  MODE_DEFAULTS,
  resolveConfig,
} from "../src/config.js";
import { renderAdminUI } from "../src/admin/ui.js";

const MODES = ["parking", "coming-soon", "landing", "profile"];

test("defaults.json is the single source for fallback, wording, and demos", () => {
  const defaults = JSON.parse(readFileSync(new URL("../defaults.json", import.meta.url), "utf8"));
  assert.deepEqual(defaults.fallback, FALLBACK_DEFAULT);
  assert.deepEqual(defaults.modes, MODE_DEFAULTS);
  assert.deepEqual(defaults.presets, DEMO_PRESETS);
  assert.deepEqual(Object.keys(defaults.modes).sort(), [...MODES].sort());
});

test("demo presets cover every shipped page mode", () => {
  const covered = new Set(DEMO_PRESETS.map((preset) => preset.mode).filter(Boolean));
  for (const mode of MODES) assert.equal(covered.has(mode), true, `missing ${mode} demo preset`);
});

test("every configurable wording default has an admin control", () => {
  const html = renderAdminUI({ presets: DEMO_PRESETS });
  const separatelyControlled = new Set(["footerText", "role"]);

  for (const [mode, defaults] of Object.entries(MODE_DEFAULTS)) {
    const block = html.match(new RegExp(`data-copy-block="${mode}"[\\s\\S]*?</div>`))?.[0] || "";
    for (const key of Object.keys(defaults)) {
      if (separatelyControlled.has(key)) continue;
      assert.match(block, new RegExp(`data-config-key="${key}"`), `${mode}.${key} has no admin control`);
    }
  }
});

test("local gallery and public fallback resolve from defaults.json", async () => {
  const local = await resolveConfig("localhost", {}, new Request("http://localhost/?preset=1"));
  assert.equal(local.mode, DEMO_PRESETS[1].mode.replace("-", "_"));
  assert.equal(local.config.domain_title, DEMO_PRESETS[1].domainTitle);
  assert.equal(local.configured, true);

  const fallback = await resolveConfig("unconfigured.example", {});
  assert.equal(fallback.mode, FALLBACK_DEFAULT.mode);
  // Nothing is configured for that host, so the page may claim nothing about it.
  assert.equal(fallback.configured, false);
  // `title` is the OSS spelling for the heading; it folds into `headline`.
  assert.equal(fallback.config.headline, FALLBACK_DEFAULT.title);
  // `description` is the OSS spelling; it folds into the canonical `body`.
  assert.equal(fallback.config.body, FALLBACK_DEFAULT.description);
});

test("README presents the OSS project without SaaS positioning", () => {
  const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
  assert.match(readme, /MIT-licensed, self-hosted/);
  assert.match(readme, /defaults\.json/);
  assert.doesNotMatch(readme, /Domain Parkour Cloud|hosted control plane|SaaS/i);
});
