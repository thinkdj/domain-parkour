import test from "node:test";
import assert from "node:assert/strict";

import { previewConfig } from "../src/config.js";
import { generateParkingHTML } from "../src/templates/parking.js";
import { generateComingSoonHTML } from "../src/templates/coming-soon.js";
import { generateLandingHTML } from "../src/templates/landing.js";
import { generateProfileHTML } from "../src/templates/profile.js";

const generators = {
  parking: generateParkingHTML,
  "coming-soon": generateComingSoonHTML,
  landing: generateLandingHTML,
  profile: generateProfileHTML,
};

function render(mode, config = {}) {
  const cfg = previewConfig("example.com", { mode, domainTitle: "Example", ...config });
  return generators[mode](cfg);
}

test("credit footer is present and independently toggleable in every template", () => {
  for (const mode of Object.keys(generators)) {
    const visible = render(mode, { footerText: "" });
    assert.match(visible, /Built with/);
    assert.match(visible, /Domain Parkour/);
    assert.match(visible, /powered by/);
    assert.match(visible, /Cloudflare/);

    const hidden = render(mode, { footerText: "", showCredit: false });
    assert.doesNotMatch(hidden, /Built with/);
  }
});

test("parking visitor copy is configurable", () => {
  const priced = render("parking", {
    salePrice: "PRICE",
    contactEmail: "hello@example.com",
    statusLabel: "STATUS",
    eyebrowText: "EYEBROW",
    priceLabel: "PRICE_LABEL",
    contactCopy: "CONTACT_COPY",
    contactButtonText: "BUTTON_COPY",
    domainAgeYears: "AGE",
    domainAgeLabel: "AGE_LABEL",
    domainExtension: ".test",
    extensionLabel: "EXT_LABEL",
    trustValue: "TRUST_VALUE",
    trustLabel: "TRUST_LABEL",
    pageTitleSuffix: "TITLE_SUFFIX",
  });
  for (const marker of ["STATUS", "EYEBROW", "PRICE_LABEL", "CONTACT_COPY", "BUTTON_COPY", "AGE_LABEL", "EXT_LABEL", "TRUST_VALUE", "TRUST_LABEL"]) {
    assert.match(priced, new RegExp(marker));
  }

  const inquiry = render("parking", {
    inquiryLabel: "INQUIRY_LABEL",
    noPriceTitle: "NO_PRICE_TITLE",
    availabilityCopy: "AVAILABILITY_COPY",
  });
  for (const marker of ["INQUIRY_LABEL", "NO_PRICE_TITLE", "AVAILABILITY_COPY"]) {
    assert.match(inquiry, new RegExp(marker));
  }
});

test("coming soon, landing, and profile visitor copy is configurable", () => {
  const countdown = render("coming-soon", {
    launchDate: "2048-01-01T00:00:00Z",
    statusLabel: "COMING_STATUS",
    eyebrowText: "COMING_EYEBROW",
    launchLabel: "LAUNCH_LABEL",
    daysLabel: "DAYS_LABEL",
    hoursLabel: "HOURS_LABEL",
    minutesLabel: "MINUTES_LABEL",
    secondsLabel: "SECONDS_LABEL",
    countdownNote: "COUNTDOWN_NOTE",
    launchedText: "LAUNCHED_TEXT",
    pageTitleSuffix: "COMING_SUFFIX",
  });
  for (const marker of ["COMING_STATUS", "COMING_EYEBROW", "LAUNCH_LABEL", "DAYS_LABEL", "HOURS_LABEL", "MINUTES_LABEL", "SECONDS_LABEL", "COUNTDOWN_NOTE", "LAUNCHED_TEXT", "COMING_SUFFIX"]) {
    assert.match(countdown, new RegExp(marker));
  }

  const fallback = render("coming-soon", {
    statusPanelLabel: "PANEL_LABEL",
    statusPanelTitle: "PANEL_TITLE",
    statusPanelText: "PANEL_TEXT",
  });
  for (const marker of ["PANEL_LABEL", "PANEL_TITLE", "PANEL_TEXT"]) assert.match(fallback, new RegExp(marker));

  const landing = render("landing", {
    statusLabel: "LANDING_STATUS",
    eyebrowText: "LANDING_EYEBROW",
    linksLabel: "LINKS_LABEL",
    links: [{ title: "Link", url: "https://example.com" }],
  });
  for (const marker of ["LANDING_STATUS", "LANDING_EYEBROW", "LINKS_LABEL"]) assert.match(landing, new RegExp(marker));

  const profile = render("profile", { statusLabel: "PROFILE_STATUS", role: "PROFILE_ROLE" });
  assert.match(profile, /PROFILE_STATUS/);
  assert.match(profile, /PROFILE_ROLE/);
});
