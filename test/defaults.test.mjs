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
  const local = await resolveConfig(
    "localhost",
    {},
    new Request("http://localhost/?themeIndex=1"),
  );
  assert.equal(local.config.mode, DEMO_PRESETS[1].mode);
  assert.equal(local.config.domainTitle, DEMO_PRESETS[1].domainTitle);
  assert.equal(local.allThemes.length, DEMO_PRESETS.length);

  const fallback = await resolveConfig("unconfigured.example", {});
  assert.equal(fallback.config.mode, FALLBACK_DEFAULT.mode);
  assert.equal(fallback.config.title, FALLBACK_DEFAULT.title);
  assert.equal(fallback.config.description, FALLBACK_DEFAULT.description);
});

test("README presents the OSS project without SaaS positioning", () => {
  const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
  assert.match(readme, /MIT-licensed, self-hosted/);
  assert.match(readme, /defaults\.json/);
  assert.doesNotMatch(readme, /Domain Parkour Cloud|hosted control plane|SaaS/i);
});
