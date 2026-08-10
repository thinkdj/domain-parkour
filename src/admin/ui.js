/**
 * Admin SPA — single HTML document with embedded styles and client script.
 * Talks to /_admin_/api/* for domain data and R2 uploads, then POSTs unsaved
 * configs to /_admin_/preview for the live iframe.
 *
 * Every recipe here comes from parkour_design_system.html and runs on the
 * shared tokens in ../styles/tokens.js — the admin and the pages it edits
 * are the same design system, not two that resemble each other.
 */

import { MODE_DEFAULTS } from "../config.js";
import { serializeForScript } from "../safety.js";
import { tokens, baseRules, motion } from "../styles/tokens.js";
import { icon } from "../icons.js";
import { themeScript, themeToggle } from "../../pages/index.js";

// The trail — brand mark and favicon share these exact paths. Two fading echoes
// of the stem, then the P. The echoes are stems only, not whole letters: that is
// what keeps the 3-unit gaps between them open at a 16px favicon.
// Canonical source: /brand/mark.svg at the workspace root.
const TRAIL_PATHS =
  `<path d="M9.75 10V38" opacity=".22"/>` +
  `<path d="M18.25 10V38" opacity=".45"/>` +
  `<path d="M26.75 10V38"/>` +
  `<path d="M26.75 12.75H32a6.25 6.25 0 0 1 0 12.5h-5.25"/>`;

const BRAND_GLYPH = `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="5.5" aria-hidden="true">${TRAIL_PATHS}</svg>`;

const ADMIN_FAVICON = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'>` +
    `<rect width='48' height='48' rx='11' fill='#e8590c'/>` +
    `<g fill='none' stroke='white' stroke-width='5.5'>${TRAIL_PATHS}</g>` +
    `</svg>`,
)}`;

// Canonical source: /template-glyphs.js at the workspace root (see
// parkour_design_system.html §05). Copied in verbatim — no shared package
// exists between this app and the cloud control plane yet.
const MODE_SVGS = {
  parking: `<svg class="mode-glyph" viewBox="0 0 96 54" fill="none" aria-hidden="true">
    <rect x="6" y="4" width="44" height="6" rx="3" fill="var(--color-line-strong)"/>
    <rect x="6" y="16" width="20" height="9" rx="4.5" fill="var(--color-muted)"/>
    <rect x="70" y="16" width="20" height="9" rx="4.5" fill="var(--color-line-strong)"/>
    <rect x="6" y="33" width="64" height="4" rx="2" fill="var(--color-line)"/>
    <rect x="6" y="41" width="50" height="4" rx="2" fill="var(--color-line)"/>
  </svg>`,
  comingSoon: `<svg class="mode-glyph" viewBox="0 0 96 54" fill="none" aria-hidden="true">
    <rect x="26" y="4" width="44" height="6" rx="3" fill="var(--color-line-strong)"/>
    <rect x="26" y="16" width="12" height="12" rx="2.5" fill="var(--color-line)"/>
    <rect x="42" y="16" width="12" height="12" rx="2.5" fill="var(--color-line)"/>
    <rect x="58" y="16" width="12" height="12" rx="2.5" fill="var(--color-line)"/>
    <rect x="34" y="38" width="28" height="9" rx="4.5" fill="var(--color-muted)"/>
  </svg>`,
  landing: `<svg class="mode-glyph" viewBox="0 0 96 54" fill="none" aria-hidden="true">
    <rect x="6" y="4" width="36" height="6" rx="3" fill="var(--color-line-strong)"/>
    <rect x="6" y="16" width="64" height="4" rx="2" fill="var(--color-line)"/>
    <rect x="6" y="24" width="56" height="4" rx="2" fill="var(--color-line)"/>
    <rect x="6" y="34" width="24" height="9" rx="4.5" fill="var(--color-muted)"/>
    <circle cx="38" cy="38.5" r="3" fill="var(--color-line)"/>
    <circle cx="47" cy="38.5" r="3" fill="var(--color-line)"/>
    <circle cx="56" cy="38.5" r="3" fill="var(--color-line)"/>
  </svg>`,
  profile: `<svg class="mode-glyph" viewBox="0 0 96 54" fill="none" aria-hidden="true">
    <circle cx="48" cy="10" r="8" fill="var(--color-line)"/>
    <rect x="32" y="23" width="32" height="5" rx="2.5" fill="var(--color-line-strong)"/>
    <rect x="24" y="32" width="48" height="4" rx="2" fill="var(--color-line)"/>
    <rect x="26" y="42" width="44" height="9" rx="4.5" fill="var(--color-muted)"/>
  </svg>`,
  redirect: `<svg class="mode-glyph" viewBox="0 0 96 54" fill="none" aria-hidden="true">
    <rect x="6" y="8" width="22" height="9" rx="4.5" fill="var(--color-line-strong)"/>
    <path d="M30 12.5h28" stroke="var(--color-muted)" stroke-width="4" stroke-linecap="round" stroke-dasharray="5 5"/>
    <path d="m54 5 11 7.5L54 20" stroke="var(--color-line-strong)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="68" y="8" width="22" height="9" rx="4.5" fill="var(--color-muted)"/>
    <rect x="22" y="34" width="52" height="5" rx="2.5" fill="var(--color-line)"/>
    <rect x="32" y="44" width="32" height="5" rx="2.5" fill="var(--color-line)"/>
  </svg>`,
  maintenance: `<svg class="mode-glyph" viewBox="0 0 96 54" fill="none" aria-hidden="true">
    <path d="m48 5 25 43H23L48 5Z" fill="var(--color-line)"/>
    <path d="M48 18v13" stroke="var(--color-muted)" stroke-width="5" stroke-linecap="round"/>
    <circle cx="48" cy="39" r="2.5" fill="var(--color-muted)"/>
  </svg>`,
};

/** §06.3 — the signature choice in the product: one radio card per mode. */
const MODE_CARDS = [
  { mode: "parking", glyph: MODE_SVGS.parking, name: "Parking", copy: "Price, history, contact, trust." },
  { mode: "coming-soon", glyph: MODE_SVGS.comingSoon, name: "Coming soon", copy: "Launch date and feature cards." },
  { mode: "landing", glyph: MODE_SVGS.landing, name: "Landing", copy: "Destination and social links." },
  { mode: "profile", glyph: MODE_SVGS.profile, name: "Profile", copy: "Image, bio, featured links." },
  { mode: "redirect", glyph: MODE_SVGS.redirect, name: "Redirect", copy: "Forward visitors elsewhere." },
  { mode: "maintenance", glyph: MODE_SVGS.maintenance, name: "Maintenance", copy: "Temporary 503 status page." },
];

function renderModePicker() {
  return MODE_CARDS.map(
    ({ mode, glyph, name, copy }) => `
        <label class="mode-card">
          <input type="radio" name="page-mode" value="${mode}" />
          <span class="mode-check" aria-hidden="true">${icon("check", { size: 16 })}</span>
          ${glyph}
          <span class="mode-name">${name}</span>
          <span class="mode-copy">${copy}</span>
        </label>`,
  ).join("");
}

export function renderAdminUI({ isDefaultCreds, presets } = {}) {
  const presetsJson = serializeForScript(presets || []);
  const defaultsJson = serializeForScript(MODE_DEFAULTS);
  const warnDefaultCreds = isDefaultCreds
    ? `<div id="cred-warning" class="alert alert-warning" role="status">
         ${icon("alert-triangle")}
         <div>
           <p class="alert-title">Local credentials are active</p>
           <p>Replace <code>admin / admin</code> with the <code>ADMIN_USER</code> and <code>ADMIN_PASSWORD</code> secrets before deploying.</p>
         </div>
       </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="color-scheme" content="light dark" />
  <title>Domain Parkour — Parking Page Studio</title>
  <link rel="icon" href="${ADMIN_FAVICON}" />
  <script data-theme-script>${themeScript()}</script>
  <style>${ADMIN_CSS}</style>
</head>
<body data-mobile-view="editor">
  <header class="topbar">
    <div class="brand">
      <span class="logo" aria-hidden="true">${BRAND_GLYPH}</span>
      <span class="brand-copy">
        <span class="brand-name">Domain Parkour</span>
        <span class="brand-subtitle">Parking Page Studio</span>
      </span>
    </div>
    <div class="site-switcher">
      <label class="sr-only" for="domain-picker">Current domain</label>
      <select id="domain-picker" title="Switch domain" aria-label="Current domain"></select>
    </div>
    <div class="topbar-actions">
      <button id="new-btn" class="btn" title="New page (Ctrl/Command + N)">${icon("plus", { size: 16 })}<span>New page</span></button>
      <button id="open-btn" class="btn" title="Open the live page in a new tab">${icon("external-link", { size: 16 })}<span>Visit</span></button>
      <button id="delete-btn" class="btn btn-danger-ghost" title="Delete this page">${icon("trash", { size: 16 })}<span class="sr-only">Delete page</span></button>
      ${themeToggle({ className: 'btn btn-icon' })}
      <button id="save-btn" class="btn btn-primary" title="Save changes (Ctrl/Command + S)">
        <span id="save-label">Saved</span><kbd>Ctrl S</kbd>
      </button>
    </div>
    <div class="mobile-view-switcher" role="tablist" aria-label="Workspace view">
      <button type="button" data-mobile-view="editor" role="tab" aria-selected="true">Editor</button>
      <button type="button" data-mobile-view="preview" role="tab" aria-selected="false">Preview</button>
    </div>
  </header>

  ${warnDefaultCreds}

  <main class="workspace">
    <section class="editor" id="editor">
      <div class="editor-inner">
        <div class="editor-heading">
          <div>
            <p class="overline">Page editor</p>
            <h1>Shape the page</h1>
            <p class="editor-sub">Every change renders in the preview as you type.</p>
          </div>
          <span id="dirty-state" class="badge badge-success"><span class="badge-dot"></span><span id="dirty-label">Saved</span></span>
        </div>

        <section class="form-section" aria-labelledby="identity-heading">
          <div class="section-heading">
            <span class="section-index">01</span>
            <div>
              <h2 id="identity-heading">Identity</h2>
              <p>The hostname, the template, and the accent color.</p>
            </div>
          </div>

        <div class="field">
          <label for="f-hostname">Hostname</label>
          <input id="f-hostname" type="text" class="mono" placeholder="example.com" autocomplete="off" spellcheck="false" />
          <p class="hint">Exact host matched by the Worker. Use <code>_default</code> for the catch-all page.</p>
        </div>

        <div class="field">
          <span class="field-label" id="template-label">Template</span>
          <div class="mode-cards" role="radiogroup" aria-labelledby="template-label">${renderModePicker()}</div>
        </div>

        <div class="field row">
          <div class="col">
            <label for="f-domainTitle">Display name</label>
            <input id="f-domainTitle" type="text" placeholder="My Domain" />
          </div>
          <div class="col color-col">
            <label for="f-accentColor">Accent</label>
            <input id="f-accentColor" type="color" aria-label="Accent color" />
          </div>
        </div>
        </section>

        <section class="form-section" aria-labelledby="content-heading">
          <div class="section-heading">
            <span class="section-index">02</span>
            <div>
              <h2 id="content-heading">Content</h2>
              <p>The words this page shows a visitor.</p>
            </div>
          </div>

        <div class="common-content">
          <div class="field">
            <label id="title-label" for="f-title">Headline</label>
            <input id="f-title" type="text" placeholder="Premium domain for sale" />
          </div>

          <div class="field">
            <label id="description-label" for="f-description">Description</label>
            <textarea id="f-description" rows="3" placeholder="A short, useful description"></textarea>
          </div>
        </div>

        <!-- Mode-specific fields below -->
        <div data-mode-block="parking" class="mode-block">
          <div class="field row">
            <div class="col">
              <label for="f-salePrice">Sale price</label>
              <input id="f-salePrice" type="text" placeholder="25,000 USD" />
            </div>
            <div class="col">
              <label for="f-contactEmail">Contact email</label>
              <input id="f-contactEmail" type="email" class="mono" placeholder="you@example.com" />
            </div>
          </div>
          <div class="field row">
            <div class="col">
              <label for="f-domainAgeYears">Age label</label>
              <input id="f-domainAgeYears" type="text" placeholder="15+" />
            </div>
            <div class="col">
              <label for="f-domainExtension">Extension value</label>
              <input id="f-domainExtension" type="text" class="mono" placeholder=".com" />
            </div>
          </div>
          <div class="field">
            <label for="f-domainRegistration">Registration note</label>
            <input id="f-domainRegistration" type="text" placeholder="Registered in 2010" />
          </div>
        </div>

        <div data-mode-block="coming-soon" class="mode-block">
          <div class="field row">
            <div class="col">
              <label for="f-tagline">Tagline</label>
              <input id="f-tagline" type="text" placeholder="Launching 2026" />
            </div>
            <div class="col">
              <label for="f-launchDate">Launch date</label>
              <input id="f-launchDate" type="datetime-local" class="mono" />
            </div>
          </div>
          <div class="field">
            <span class="field-label">Feature highlights <span class="muted">Optional</span></span>
            <div id="features-list" class="repeater"></div>
            <button type="button" class="btn btn-add btn-sm" data-add="feature">${icon("plus", { size: 16 })}Add feature</button>
          </div>
        </div>

        <div data-mode-block="landing" class="mode-block">
          <div class="field">
            <label for="f-subtitle">Subtitle</label>
            <input id="f-subtitle" type="text" placeholder="Used for email and APIs" />
          </div>
          <div class="field">
            <span class="field-label">Destination links</span>
            <div id="links-list" class="repeater"></div>
            <button type="button" class="btn btn-add btn-sm" data-add="link">${icon("plus", { size: 16 })}Add link</button>
          </div>
        </div>

        <div data-mode-block="profile" class="mode-block">
          <div class="field row">
            <div class="col">
              <label for="f-name">Name</label>
              <input id="f-name" type="text" placeholder="Ada Lovelace" />
            </div>
            <div class="col">
              <label for="f-role">Role / tagline</label>
              <input id="f-role" type="text" placeholder="Designer & Engineer" />
            </div>
          </div>
          <div class="field">
            <span class="field-label">Profile image <span class="muted">PNG, JPEG, WebP, or GIF, up to 5 MB</span></span>
            <div class="avatar-uploader">
              <div id="avatar-preview" class="avatar-preview" aria-hidden="true">?</div>
              <div class="avatar-upload-actions">
                <input id="f-avatarFile" type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden />
                <div class="avatar-buttons">
                  <button id="avatar-upload-btn" type="button" class="btn btn-sm">Upload image</button>
                  <button id="avatar-remove-btn" type="button" class="btn btn-sm">Remove image</button>
                </div>
                <p id="avatar-upload-status" class="hint">Stored privately in the configured R2 bucket.</p>
              </div>
            </div>
          </div>
          <div class="field">
            <label for="f-avatarUrl">Image URL <span class="muted">Uploaded path or external URL</span></label>
            <input id="f-avatarUrl" type="text" class="mono" placeholder="https://example.com/avatar.jpg" />
          </div>
          <div class="field">
            <label for="f-bio">Bio</label>
            <textarea id="f-bio" rows="3" placeholder="A short bio"></textarea>
          </div>
          <div class="field">
            <span class="field-label">Featured links</span>
            <div id="profile-links-list" class="repeater"></div>
            <button type="button" class="btn btn-add btn-sm" data-add="profileLink">${icon("plus", { size: 16 })}Add link</button>
          </div>
        </div>

        <div data-mode-block="redirect" class="mode-block">
          <div class="field">
            <label for="redirect-target-url">Redirect target</label>
            <input id="redirect-target-url" type="url" class="mono" placeholder="https://example.com/new-home" autocomplete="off" spellcheck="false" />
            <p class="hint">HTTPS only. The target cannot be this hostname.</p>
          </div>
          <div class="field">
            <span class="field-label">Redirect behavior</span>
            <label class="toggle-row">
              <span><span class="toggle-title">Show redirect page</span><span class="toggle-copy">Show a short message before forwarding.</span></span>
              <span class="switch"><input id="redirect-show-ui" type="checkbox" /><span class="switch-track" aria-hidden="true"></span></span>
            </label>
          </div>
          <div class="field" data-redirect-ui-field>
            <label for="redirect-countdown-seconds">Redirect after</label>
            <input id="redirect-countdown-seconds" type="number" min="1" max="60" step="1" class="mono" placeholder="5" disabled />
            <p class="hint">Seconds to show the message before forwarding.</p>
          </div>
          <div class="field" data-redirect-ui-field>
            <label for="redirect-status-code">Redirect type</label>
            <select id="redirect-status-code" disabled>
              <option value="302">302 — temporary (recommended)</option>
              <option value="307">307 — temporary, keep method</option>
              <option value="301">301 — permanent</option>
              <option value="308">308 — permanent, keep method</option>
            </select>
          </div>
          <label class="toggle-row" data-redirect-ui-field>
            <span><span class="toggle-title">Preserve path</span><span class="toggle-copy">Append the incoming path to the target.</span></span>
            <span class="switch"><input id="redirect-preserve-path" type="checkbox" disabled /><span class="switch-track" aria-hidden="true"></span></span>
          </label>
          <label class="toggle-row" data-redirect-ui-field>
            <span><span class="toggle-title">Preserve query</span><span class="toggle-copy">Append incoming query parameters to the target.</span></span>
            <span class="switch"><input id="redirect-preserve-query" type="checkbox" disabled /><span class="switch-track" aria-hidden="true"></span></span>
          </label>
        </div>

        <div data-mode-block="maintenance" class="mode-block">
          <div class="field">
            <label for="maintenance-retry-after">Retry-After seconds <span class="muted">Optional</span></label>
            <input id="maintenance-retry-after" type="number" min="60" max="604800" class="mono" placeholder="3600" />
            <p class="hint">Between 60 seconds and 7 days. The page returns HTTP 503.</p>
          </div>
          <div class="field">
            <label for="maintenance-help-url">Status or help link <span class="muted">Optional</span></label>
            <input id="maintenance-help-url" type="url" class="mono" placeholder="https://status.example.com" autocomplete="off" spellcheck="false" />
          </div>
        </div>

        </section>

        <section class="form-section extras-section" aria-labelledby="extras-heading">
          <div class="section-heading">
            <span class="section-index">03</span>
            <div>
              <h2 id="extras-heading">Finishing touches</h2>
              <p>Social links, footer, wording, and starting points.</p>
            </div>
          </div>

        <details class="advanced">
          <summary><span>Social links</span><span class="summary-hint">Optional</span></summary>
          <div class="social-grid">
            <label>Twitter / X <input data-social="twitter" type="url" class="mono" placeholder="https://x.com/handle" /></label>
            <label>LinkedIn <input data-social="linkedin" type="url" class="mono" placeholder="https://linkedin.com/in/handle" /></label>
            <label>GitHub <input data-social="github" type="url" class="mono" placeholder="https://github.com/handle" /></label>
            <label>Instagram <input data-social="instagram" type="url" class="mono" placeholder="https://instagram.com/handle" /></label>
            <label>Facebook <input data-social="facebook" type="url" class="mono" placeholder="https://facebook.com/handle" /></label>
            <label>Email <input data-social="email" type="text" class="mono" placeholder="you@example.com" /></label>
          </div>
        </details>

        <details class="advanced">
          <summary><span>Template wording</span><span class="summary-hint">Fully configurable</span></summary>
          <div class="copy-settings">
            <div class="copy-block" data-copy-block="parking">
              <label>Status label<input data-config-key="statusLabel" type="text" /></label>
              <label>Eyebrow<input data-config-key="eyebrowText" type="text" /></label>
              <label>Price label<input data-config-key="priceLabel" type="text" /></label>
              <label>Inquiry label<input data-config-key="inquiryLabel" type="text" /></label>
              <label class="wide">No-price heading<input data-config-key="noPriceTitle" type="text" /></label>
              <label class="wide">Contact copy<textarea data-config-key="contactCopy" rows="2"></textarea></label>
              <label class="wide">Availability copy<textarea data-config-key="availabilityCopy" rows="2"></textarea></label>
              <label>Contact button<input data-config-key="contactButtonText" type="text" /></label>
              <label>Browser title suffix<input data-config-key="pageTitleSuffix" type="text" /></label>
              <label>Domain age label<input data-config-key="domainAgeLabel" type="text" /></label>
              <label>Extension label<input data-config-key="extensionLabel" type="text" /></label>
              <label>Trust value<input data-config-key="trustValue" type="text" /></label>
              <label>Trust label<input data-config-key="trustLabel" type="text" /></label>
            </div>
            <div class="copy-block" data-copy-block="coming-soon">
              <label>Status label<input data-config-key="statusLabel" type="text" /></label>
              <label>Eyebrow<input data-config-key="eyebrowText" type="text" /></label>
              <label>Launch label<input data-config-key="launchLabel" type="text" /></label>
              <label>Browser title suffix<input data-config-key="pageTitleSuffix" type="text" /></label>
              <label class="wide">Countdown note<textarea data-config-key="countdownNote" rows="2"></textarea></label>
              <label>Fallback panel label<input data-config-key="statusPanelLabel" type="text" /></label>
              <label class="wide">Fallback panel heading<input data-config-key="statusPanelTitle" type="text" /></label>
              <label class="wide">Fallback panel copy<textarea data-config-key="statusPanelText" rows="2"></textarea></label>
            </div>
            <div class="copy-block" data-copy-block="landing">
              <label>Status label<input data-config-key="statusLabel" type="text" /></label>
              <label>Eyebrow<input data-config-key="eyebrowText" type="text" /></label>
              <label>Links label<input data-config-key="linksLabel" type="text" /></label>
            </div>
            <div class="copy-block" data-copy-block="profile">
              <label>Status label<input data-config-key="statusLabel" type="text" /></label>
            </div>
            <div class="copy-block" data-copy-block="redirect">
              <label>Status label<input data-config-key="statusLabel" type="text" /></label>
              <label>Browser title suffix<input data-config-key="pageTitleSuffix" type="text" /></label>
            </div>
            <div class="copy-block" data-copy-block="maintenance">
              <label>Status label<input data-config-key="statusLabel" type="text" /></label>
              <label>Browser title suffix<input data-config-key="pageTitleSuffix" type="text" /></label>
            </div>
          </div>
        </details>

        <details class="advanced">
          <summary><span>Footer</span><span class="summary-hint">Optional</span></summary>
          <div class="field">
            <label for="f-footerText">Custom footer text <span class="muted">Optional</span></label>
            <input id="f-footerText" type="text" placeholder="© 2026 example.com" />
          </div>
          <label class="toggle-row">
            <span>
              <span class="toggle-title">Show footer credit</span>
              <span class="toggle-copy">“Built with Domain Parkour · powered by Cloudflare”</span>
            </span>
            <span class="switch">
              <input id="f-showCredit" type="checkbox" />
              <span class="switch-track" aria-hidden="true"></span>
            </span>
          </label>
        </details>

        <details class="advanced">
          <summary><span>Start from a template</span><span class="summary-hint">${presets?.length || 0} available</span></summary>
          <div id="presets" class="presets"></div>
        </details>

        </section>

        <p class="editor-meta" id="meta"></p>
      </div>
    </section>

    <section class="preview" id="preview" data-preview-size="desktop">
      <div class="preview-header">
        <span id="preview-badge" class="badge badge-success">
          <span class="badge-dot"></span><span id="preview-status">Live preview</span>
        </span>
        <div class="segmented" role="group" aria-label="Preview width">
          <button type="button" data-preview-size="desktop" aria-pressed="true">Desktop</button>
          <button type="button" data-preview-size="mobile" aria-pressed="false">Mobile</button>
        </div>
      </div>
      <div class="preview-canvas">
        <div class="preview-device">
          <iframe id="preview-frame" title="Live page preview" sandbox="allow-scripts allow-same-origin"></iframe>
        </div>
      </div>
    </section>
  </main>

  <dialog id="delete-dialog" class="dialog">
    <div class="dialog-mark" aria-hidden="true">${icon("trash")}</div>
    <h2>Delete this page?</h2>
    <p id="delete-message"></p>
    <div class="dialog-actions">
      <button type="button" class="btn" data-close-dialog>Keep page</button>
      <button type="button" class="btn btn-danger" id="confirm-delete">Delete page</button>
    </div>
  </dialog>

  <!-- §06.9 — every domain mutation is reversible, and the interface says so. -->
  <div id="undo-bar" class="undo-bar" role="status" hidden>
    ${icon("arrow-back-up")}
    <p id="undo-message"></p>
    <div class="undo-actions">
      <button type="button" id="undo-btn" class="btn btn-sm undo-action">Undo</button>
      <button type="button" id="undo-dismiss" class="undo-dismiss" aria-label="Dismiss">${icon("x", { size: 16 })}</button>
    </div>
  </div>

  <div id="toast" class="toast" role="status" aria-live="polite"></div>

  <script>
    window.__PRESETS__ = ${presetsJson};
    window.__MODE_DEFAULTS__ = ${defaultsJson};
  </script>
  <script>${ADMIN_JS}</script>
</body>
</html>`;
}

// Tokens, element defaults, the shared motion primitives, then the Studio's own
// rules. Inlined rather than linked because every page this runtime serves must
// be self-contained.
//
// The shared COMPONENT layer is deliberately not included. The Studio already
// implements the same §06 recipes against the same tokens, and it predates the
// extracted layer. Injecting components.css underneath it was measured: it moved
// ~8% of pixels — a doubled status dot, and a cascade of small shifts from
// properties the shared rules set that the Studio's equivalents never did
// (`display` on .field, spacing on .help). It would have bought the deletion of
// eleven duplicate rules in exchange for a visual delta and permanent coupling
// between two component sets that are already both correct.
//
// What actually has to agree is the tokens, and design-system.test.mjs enforces
// that. Fold the Studio onto components.css when a screen is next redesigned,
// not as a refactor of working UI.
const ADMIN_CSS = `${tokens}${baseRules}${motion}
  html, body { height: 100%; }
  body {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--color-surface-2);
    font-size: 14px;
    line-height: 1.5;
  }
  .sr-only {
    position: absolute;
    width: 1px; height: 1px;
    padding: 0; margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  .mono, code, kbd { font-family: var(--font-mono); }

  /* ---- §06.10 App bar: 56px, border-bottom, no shadow ---- */
  .topbar {
    flex: 0 0 auto;
    min-height: 56px;
    display: grid;
    grid-template-columns: auto minmax(200px, 1fr) auto;
    align-items: center;
    gap: 16px;
    padding: 8px 20px;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-line);
  }
  .topbar > .brand,
  .topbar > .site-switcher,
  .topbar > .topbar-actions { align-self: center; }
  .brand { display: flex; align-items: center; gap: 10px; min-width: 160px; }
  .logo {
    width: 28px; height: 28px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border-radius: var(--radius-md);
    background: var(--color-primary);
    color: #fff;
  }
  /* The mark carries its own padding inside a 48 grid, so it fills the tile. */
  .logo svg { width: 26px; height: 26px; }
  .brand-copy { display: flex; flex-direction: column; line-height: 1.2; }
  .brand-name { font-family: var(--font-display); font-size: 15px; font-weight: 600; letter-spacing: -0.02em; color: var(--color-ink); }
  .brand-subtitle { color: var(--color-muted); font-size: 12px; }
  .site-switcher { width: min(100%, 420px); justify-self: center; display: flex; align-items: center; }
  .site-switcher #domain-picker { height: 32px; min-height: 32px; }
  .topbar-actions { display: flex; align-items: center; gap: 8px; }

  /* ---- §06.1 Buttons: 40 default, 32 small, radius 10, hover is color ---- */
  .btn {
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0 16px;
    border: 1px solid var(--color-line-strong);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-ink);
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;
    transition: background-color var(--t-fast) var(--ease), border-color var(--t-fast) var(--ease), color var(--t-fast) var(--ease);
  }
  .btn:hover { background: var(--color-surface-2); }
  .btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .btn:disabled:hover { background: var(--color-surface); }
  .btn-sm { height: 32px; padding: 0 12px; font-size: 13px; }
  .btn-icon { width: 40px; padding: 0; }
  .btn-primary {
    border-color: var(--color-primary);
    background: var(--color-primary);
    color: #fff;
  }
  .btn-primary:hover { background: var(--color-primary-hover); border-color: var(--color-primary-hover); }
  .btn-primary:active { background: var(--color-primary-active); border-color: var(--color-primary-active); }
  .btn-primary:disabled { background: var(--color-surface-3); border-color: var(--color-line); color: var(--color-muted); opacity: 1; }
  .btn-primary:disabled:hover { background: var(--color-surface-3); }
  .btn-danger {
    border-color: var(--color-danger);
    background: var(--color-danger);
    color: #fff;
  }
  .btn-danger:hover { background: var(--color-danger-hover); border-color: var(--color-danger-hover); }
  .btn-danger-ghost { border-color: var(--color-line-strong); color: var(--color-danger); }
  .btn-danger-ghost:hover { background: var(--color-danger-soft); border-color: var(--color-danger); }
  .btn-add { border-style: dashed; color: var(--color-body); align-self: start; }
  .btn kbd {
    padding: 2px 5px;
    border: 1px solid rgba(255,255,255,0.24);
    border-radius: var(--radius-sm);
    background: rgba(255,255,255,0.12);
    color: rgba(255,255,255,0.8);
    font-size: 10px;
    font-weight: 500;
  }
  .topbar-actions .btn { height: 32px; padding: 0 12px; font-size: 13px; }
  .topbar-actions .btn-icon { width: 32px; padding: 0; }

  /* ---- §06.2 Forms: label above, help below, 40px controls ---- */
  .field { display: flex; flex-direction: column; gap: 6px; }
  .field.row { flex-direction: row; gap: 16px; }
  .field.row .col { flex: 1; display: flex; flex-direction: column; gap: 6px; }
  .field.row .color-col { flex: 0 0 88px; }
  label, .field-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--color-ink);
  }
  .hint { color: var(--color-muted); font-size: 13px; }
  .muted { color: var(--color-muted); font-weight: 400; }
  .hint code {
    padding: 1px 5px;
    border-radius: var(--radius-sm);
    background: var(--color-surface-3);
    font-size: 12px;
  }
  select,
  input:not([type="color"]):not([type="checkbox"]):not([type="radio"]),
  textarea {
    width: 100%;
    min-height: 40px;
    padding: 8px 12px;
    border: 1px solid var(--color-line-strong);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-ink);
    font-size: 14px;
    outline: none;
    transition: border-color var(--t-fast) var(--ease);
  }
  /* Machine values render in the mono role, at the mono size. */
  input.mono, textarea.mono, select.mono { font-family: var(--font-mono); font-size: 13px; }
  input::placeholder, textarea::placeholder { color: var(--color-muted); }
  select:disabled,
  input:not([type="color"]):not([type="checkbox"]):not([type="radio"]):disabled,
  textarea:disabled {
    background: var(--color-surface-2);
    border-color: var(--color-line);
    color: var(--color-muted);
    opacity: 0.72;
    cursor: not-allowed;
    box-shadow: none;
  }
  select:disabled:focus,
  input:not([type="color"]):not([type="checkbox"]):not([type="radio"]):disabled:focus,
  textarea:disabled:focus { outline: none; }
  input[type="checkbox"]:disabled, input[type="radio"]:disabled {
    cursor: not-allowed;
    accent-color: var(--color-line-strong);
  }
  textarea { min-height: 76px; resize: vertical; line-height: 1.6; }
  select {
    appearance: none;
    -webkit-appearance: none;
    padding-right: 36px;
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2398A2B3' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
  }
  #domain-picker { font-family: var(--font-mono); font-size: 13px; }
  input[type="color"] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 40px;
    padding: 3px;
    border: 1px solid var(--color-line-strong);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    cursor: pointer;
  }
  input[type="color"]:disabled {
    border-color: var(--color-line);
    background: var(--color-surface-2);
    cursor: not-allowed;
    opacity: 0.72;
  }
  input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
  input[type="color"]::-webkit-color-swatch { border: none; border-radius: var(--radius-sm); }

  /* Toggle */
  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px;
    border: 1px solid var(--color-line);
    border-radius: var(--radius-md);
    cursor: pointer;
  }
  .toggle-title { display: block; font-size: 14px; font-weight: 500; color: var(--color-ink); }
  .toggle-copy { display: block; margin-top: 2px; font-size: 13px; color: var(--color-muted); }
  .switch { position: relative; display: inline-flex; flex: 0 0 auto; width: 40px; height: 24px; }
  .switch input { position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; opacity: 0; cursor: pointer; }
  .switch-track {
    position: absolute; inset: 0;
    border-radius: var(--radius-pill);
    background: var(--color-line-strong);
    transition: background-color var(--t-fast) var(--ease);
  }
  .switch-track::after {
    content: '';
    position: absolute; top: 2px; left: 2px;
    width: 20px; height: 20px;
    border-radius: 50%;
    background: #fff;
    box-shadow: var(--shadow-card);
    transition: transform var(--t-fast) var(--ease);
  }
  .switch input:checked + .switch-track { background: var(--color-primary); }
  .switch input:checked + .switch-track::after { transform: translateX(16px); }
  .switch input:focus-visible + .switch-track { outline: 2px solid var(--color-primary); outline-offset: 2px; }
  .switch:has(input:disabled), .toggle-row:has(input:disabled) { cursor: not-allowed; }
  .switch input:disabled + .switch-track {
    background: var(--color-line);
    opacity: 0.72;
    cursor: not-allowed;
  }
  .toggle-row:has(input:disabled) .toggle-title,
  .toggle-row:has(input:disabled) .toggle-copy { opacity: 0.72; }

  /* ---- §06.3 Template picker: radio cards ---- */
  .mode-cards { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .mode-card {
    position: relative;
    padding: 16px;
    border: 1px solid var(--color-line);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    cursor: pointer;
    transition: border-color var(--t-fast) var(--ease), background-color var(--t-fast) var(--ease);
  }
  .mode-card:hover { border-color: var(--color-line-strong); }
  /* Hidden from sight, not from focus or the accessibility tree. */
  .mode-card input {
    position: absolute;
    width: 1px; height: 1px;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
  }
  .mode-card:has(:checked) { border-color: var(--color-primary); background: var(--color-primary-soft); }
  .mode-card:has(:focus-visible) { outline: 2px solid var(--color-primary); outline-offset: 2px; }
  .mode-check { position: absolute; right: 12px; top: 12px; color: var(--color-primary); visibility: hidden; }
  .mode-card:has(:checked) .mode-check { visibility: visible; }
  /* Neutral by design (§05): the glyph never recolors. The card border and
     background carry the selected state. */
  .mode-glyph { width: 100%; max-width: 96px; height: auto; display: block; }
  .mode-name { display: block; margin-top: 12px; font-size: 14px; font-weight: 600; color: var(--color-ink); }
  .mode-copy { display: block; margin-top: 2px; font-size: 13px; line-height: 1.35; color: var(--color-muted); }

  /* ---- §06.4 Badges: a dot plus a word ---- */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: var(--radius-pill);
    background: var(--color-surface-3);
    color: var(--color-body);
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
  }
  /* An explicit element rather than the shared layer's ::before dot: this one
     animates while work is in flight, which needs a real node to target. */
  .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--color-muted); }
  .badge-success { background: var(--color-success-soft); color: var(--color-success); }
  .badge-success .badge-dot { background: var(--color-success); }
  .badge-warning { background: var(--color-warning-soft); color: var(--color-warning); }
  /* The one thing that moves: work still in flight. */
  .badge-warning .badge-dot { background: var(--color-warning); animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
  .badge-danger { background: var(--color-danger-soft); color: var(--color-danger); }
  .badge-danger .badge-dot { background: var(--color-danger); }
  @keyframes pulse { 50% { opacity: 0.35; } }

  /* ---- §06.7 Alerts ---- */
  .alert {
    flex: 0 0 auto;
    display: flex;
    gap: 12px;
    padding: 16px 20px;
    font-size: 14px;
    line-height: 1.5;
  }
  .alert svg { flex: 0 0 auto; margin-top: 2px; }
  .alert-title { font-weight: 600; color: var(--color-ink); }
  .alert code { padding: 1px 5px; border-radius: var(--radius-sm); background: color-mix(in srgb, var(--color-ink) 7%, transparent); font-size: 12px; }
  .alert-warning { background: var(--color-warning-soft); color: var(--color-body); border-bottom: 1px solid var(--color-line); }
  .alert-warning > svg { color: var(--color-warning); }

  /* ---- Workspace ---- */
  .workspace {
    flex: 1 1 auto;
    display: grid;
    grid-template-columns: minmax(480px, 540px) minmax(0, 1fr);
    overflow: hidden;
  }
  .editor {
    border-right: 1px solid var(--color-line);
    overflow-y: auto;
    background: var(--color-surface-2);
    scrollbar-width: thin;
    scrollbar-color: var(--color-line-strong) transparent;
  }
  .editor-inner {
    max-width: 540px;
    margin: 0 auto;
    padding: 32px 24px 64px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .editor-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
  .overline {
    color: var(--color-accent);
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  .editor-heading h1 { margin-top: 8px; font-size: 26px; line-height: 1.2; }
  .editor-sub { margin-top: 4px; color: var(--color-muted); font-size: 14px; }
  .form-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 24px;
    border: 1px solid var(--color-line);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    box-shadow: var(--shadow-card);
  }
  .section-heading { display: flex; align-items: flex-start; gap: 12px; }
  /* Accent: section indices and small marks. Never a button, never a surface. */
  .section-index {
    flex: 0 0 auto;
    color: var(--color-accent);
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 600;
    line-height: 1.6;
  }
  .section-heading h2 { font-size: 18px; font-weight: 600; line-height: 1.35; }
  .section-heading p { margin-top: 2px; color: var(--color-muted); font-size: 13px; }
  .common-content { display: flex; flex-direction: column; gap: 20px; }
  .common-content.is-hidden { display: none; }
  .mode-block { display: none; flex-direction: column; gap: 20px; }
  .mode-block.active { display: flex; }

  /* Repeater rows */
  .repeater { display: flex; flex-direction: column; gap: 8px; }
  .repeater-row { display: grid; grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr) 40px; gap: 8px; }
  .repeater-row input { min-width: 0; font-size: 13px; }
  .repeater-row .del {
    width: 40px; height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 1px solid var(--color-line-strong);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-muted);
    cursor: pointer;
    transition: color var(--t-fast) var(--ease), background-color var(--t-fast) var(--ease), border-color var(--t-fast) var(--ease);
  }
  .repeater-row .del:hover { color: var(--color-danger); border-color: var(--color-danger); background: var(--color-danger-soft); }

  /* Avatar */
  .avatar-uploader { display: flex; align-items: center; gap: 16px; }
  .avatar-preview {
    width: 64px; height: 64px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    overflow: hidden;
    border: 1px solid var(--color-line);
    border-radius: 50%;
    background: var(--color-surface-3);
    color: var(--color-ink);
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 600;
  }
  .avatar-preview img { width: 100%; height: 100%; object-fit: cover; }
  .avatar-upload-actions { min-width: 0; display: flex; flex-direction: column; gap: 8px; }
  .avatar-buttons { display: flex; flex-wrap: wrap; gap: 8px; }

  /* Disclosures */
  .extras-section { gap: 12px; }
  details.advanced {
    border: 1px solid var(--color-line);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    overflow: hidden;
  }
  details.advanced summary {
    min-height: 44px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    color: var(--color-ink);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    list-style: none;
  }
  details.advanced summary::-webkit-details-marker { display: none; }
  details.advanced summary::after {
    content: '';
    width: 16px; height: 16px;
    flex: 0 0 auto;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2398A2B3' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") center / contain no-repeat;
    transition: transform var(--t-fast) var(--ease);
  }
  details.advanced[open] summary::after { transform: rotate(180deg); }
  details.advanced[open] summary { border-bottom: 1px solid var(--color-line); }
  .summary-hint { margin-left: auto; color: var(--color-muted); font-size: 13px; font-weight: 400; }
  details.advanced > .field,
  details.advanced > .toggle-row,
  details.advanced > .social-grid,
  details.advanced > .copy-settings,
  details.advanced > .presets { margin: 16px; }
  .social-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .social-grid label { display: flex; flex-direction: column; gap: 6px; }
  .copy-block { display: none; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .copy-block.active { display: grid; }
  .copy-block label { min-width: 0; display: flex; flex-direction: column; gap: 6px; }
  .copy-block .wide { grid-column: 1 / -1; }
  .presets { display: flex; flex-direction: column; gap: 8px; }
  .preset-row {
    width: 100%;
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 12px;
    border: 1px solid var(--color-line);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-ink);
    font-size: 14px;
    text-align: left;
    cursor: pointer;
    transition: border-color var(--t-fast) var(--ease), background-color var(--t-fast) var(--ease);
  }
  .preset-row:hover { border-color: var(--color-line-strong); background: var(--color-surface-2); }
  .preset-row .preset-mode { color: var(--color-muted); font-family: var(--font-mono); font-size: 12px; }
  .editor-meta { color: var(--color-muted); font-size: 13px; }

  /* ---- Preview ---- */
  .preview { display: flex; flex-direction: column; background: var(--color-surface-2); overflow: hidden; }
  .preview-header {
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 16px;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-line);
  }
  .segmented { display: inline-flex; padding: 3px; border-radius: var(--radius-md); background: var(--color-surface-3); }
  .segmented button {
    height: 26px;
    padding: 0 10px;
    border: 0;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--color-body);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color var(--t-fast) var(--ease), color var(--t-fast) var(--ease);
  }
  .segmented button[aria-pressed="true"],
  .segmented button[aria-selected="true"] { background: var(--color-surface); color: var(--color-ink); }
  .preview-canvas {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    justify-content: center;
    padding: 24px;
    overflow: auto;
  }
  .preview-device {
    width: 100%;
    height: 100%;
    min-height: 520px;
    overflow: hidden;
    border: 1px solid var(--color-line-strong);
    border-radius: var(--radius-lg);
    background: #fff;
    transition: width var(--t-enter) var(--ease);
  }
  .preview[data-preview-size="mobile"] .preview-device { width: min(390px, 100%); }
  iframe { width: 100%; height: 100%; display: block; border: 0; }

  /* ---- Dialog: modal radius 20, floats, no glass ---- */
  .dialog {
    width: min(420px, calc(100vw - 32px));
    padding: 24px;
    border: 1px solid var(--color-line);
    border-radius: var(--radius-xl);
    background: var(--color-surface);
    color: var(--color-body);
    box-shadow: var(--shadow-pop);
  }
  .dialog::backdrop { background: rgba(16, 24, 40, 0.5); }
  .dialog-mark {
    width: 40px; height: 40px;
    display: grid;
    place-items: center;
    border-radius: var(--radius-md);
    background: var(--color-danger-soft);
    color: var(--color-danger);
  }
  .dialog h2 { margin-top: 16px; font-size: 18px; font-weight: 600; }
  .dialog p { margin-top: 8px; font-size: 14px; line-height: 1.5; }
  .dialog-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 24px; }

  /* ---- §06.9 Undo bar ---- */
  .undo-bar {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: var(--z-overlay);
    width: min(576px, calc(100vw - 32px));
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 16px;
    border-radius: var(--radius-lg);
    background: var(--color-secondary);
    color: var(--color-on-secondary);
    box-shadow: var(--shadow-pop);
    font-size: 14px;
  }
  .undo-bar[hidden] { display: none; }
  .undo-bar > svg { flex: 0 0 auto; color: rgba(255,255,255,0.7); }
  .undo-bar .mono { font-family: var(--font-mono); font-size: 13px; }
  .undo-actions { margin-left: auto; display: flex; align-items: center; gap: 4px; }
  .undo-action { border-color: #fff; background: #fff; color: var(--color-ink); }
  .undo-action:hover { background: rgba(255,255,255,0.9); }
  .undo-dismiss {
    width: 32px; height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: var(--radius-sm);
    background: transparent;
    color: rgba(255,255,255,0.6);
    cursor: pointer;
    transition: background-color var(--t-fast) var(--ease), color var(--t-fast) var(--ease);
  }
  .undo-dismiss:hover { background: rgba(255,255,255,0.1); color: #fff; }

  /* ---- Toast ---- */
  .toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    z-index: var(--z-toast);
    transform: translateX(-50%) translateY(12px);
    padding: 10px 16px;
    border-radius: var(--radius-lg);
    background: var(--color-secondary);
    color: var(--color-on-secondary);
    box-shadow: var(--shadow-pop);
    font-size: 13px;
    font-weight: 500;
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--t-enter) var(--ease), transform var(--t-enter) var(--ease);
  }
  .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
  .toast.error { background: var(--color-danger); }
  /* The undo bar owns bottom-center while it is up; the toast steps above it. */
  body:has(#undo-bar:not([hidden])) .toast { bottom: 88px; }

  /* ---- Responsive ---- */
  .mobile-view-switcher { display: none; }
  @media (max-width: 1080px) {
    .workspace { grid-template-columns: minmax(420px, 480px) minmax(0, 1fr); }
  }
  @media (max-width: 900px) {
    .topbar { grid-template-columns: auto minmax(160px, 1fr) auto; gap: 12px; }
    .workspace { display: block; overflow: hidden; }
    .editor, .preview { width: 100%; height: 100%; border: 0; }
    .editor-inner { max-width: 640px; }
    .mobile-view-switcher {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3px;
      padding: 3px;
      border-radius: var(--radius-md);
      background: var(--color-surface-3);
    }
    .mobile-view-switcher button {
      height: 32px;
      border: 0;
      border-radius: var(--radius-sm);
      background: transparent;
      color: var(--color-body);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
    }
    .mobile-view-switcher button[aria-selected="true"] { background: var(--color-surface); color: var(--color-ink); }
    body[data-mobile-view="editor"] .preview { display: none; }
    body[data-mobile-view="preview"] .editor { display: none; }
  }
  @media (max-width: 680px) {
    .topbar { grid-template-columns: auto 1fr; padding: 8px 12px; }
    .brand { min-width: 0; }
    .brand-copy { display: none; }
    .site-switcher { grid-column: 1 / -1; grid-row: 2; width: 100%; }
    .topbar-actions { justify-self: end; }
    .topbar-actions .btn span:not(.sr-only) { display: none; }
    .topbar-actions .btn { padding: 0 10px; }
    .topbar-actions .btn-primary span { display: inline; }
    .btn kbd { display: none; }
    .mobile-view-switcher { grid-row: 3; }
    .editor-inner { padding: 24px 16px 48px; }
    .form-section { padding: 20px 16px; }
    .field.row { flex-direction: column; }
    .field.row .color-col { flex-basis: auto; }
    .mode-cards, .copy-block, .social-grid { grid-template-columns: 1fr; }
    .copy-block .wide { grid-column: auto; }
    .preview-canvas { padding: 12px; }
    .repeater-row { grid-template-columns: 1fr 40px; }
    .repeater-row input[data-k="b"] { grid-column: 1 / -1; grid-row: 2; }
    .repeater-row .del { grid-column: 2; grid-row: 1; }
  }
`;

const ADMIN_JS = `
  const BASE = '/_admin_';
  const MODE_DEFAULTS = window.__MODE_DEFAULTS__ || {};
  const $ = (id) => document.getElementById(id);

  const els = {
    picker: $('domain-picker'),
    newBtn: $('new-btn'),
    saveBtn: $('save-btn'),
    saveLabel: $('save-label'),
    deleteBtn: $('delete-btn'),
    openBtn: $('open-btn'),
    dirtyState: $('dirty-state'),
    dirtyLabel: $('dirty-label'),
    iframe: $('preview-frame'),
    preview: $('preview'),
    previewBadge: $('preview-badge'),
    status: $('preview-status'),
    toast: $('toast'),
    deleteDialog: $('delete-dialog'),
    deleteMessage: $('delete-message'),
    confirmDelete: $('confirm-delete'),
    undoBar: $('undo-bar'),
    undoMessage: $('undo-message'),
    undoBtn: $('undo-btn'),
    undoDismiss: $('undo-dismiss'),
    meta: $('meta'),
    presets: $('presets'),
    hostname: $('f-hostname'),
    domainTitle: $('f-domainTitle'),
    title: $('f-title'),
    description: $('f-description'),
    accentColor: $('f-accentColor'),
    salePrice: $('f-salePrice'),
    contactEmail: $('f-contactEmail'),
    domainAgeYears: $('f-domainAgeYears'),
    domainExtension: $('f-domainExtension'),
    domainRegistration: $('f-domainRegistration'),
    tagline: $('f-tagline'),
    launchDate: $('f-launchDate'),
    featuresList: $('features-list'),
    subtitle: $('f-subtitle'),
    linksList: $('links-list'),
    name: $('f-name'),
    role: $('f-role'),
    avatarUrl: $('f-avatarUrl'),
    avatarFile: $('f-avatarFile'),
    avatarPreview: $('avatar-preview'),
    avatarUploadBtn: $('avatar-upload-btn'),
    avatarRemoveBtn: $('avatar-remove-btn'),
    avatarUploadStatus: $('avatar-upload-status'),
    bio: $('f-bio'),
    profileLinksList: $('profile-links-list'),
    redirectTargetUrl: $('redirect-target-url'),
    redirectStatusCode: $('redirect-status-code'),
    redirectPreservePath: $('redirect-preserve-path'),
    redirectPreserveQuery: $('redirect-preserve-query'),
    redirectShowUi: $('redirect-show-ui'),
    redirectCountdownSeconds: $('redirect-countdown-seconds'),
    maintenanceRetryAfter: $('maintenance-retry-after'),
    maintenanceHelpUrl: $('maintenance-help-url'),
    footerText: $('f-footerText'),
    showCredit: $('f-showCredit'),
  };

  let state = {
    domains: [],
    current: null,           // hostname currently being edited (null = unsaved new)
    mode: 'landing',
    isDirty: false,
    avatarObjectKey: null,
    fullConfig: {},          // accumulates fields from every mode so switching tabs never drops data
    undo: null,              // last deleted record, restorable until dismissed
  };

  function toast(msg, isError = false) {
    els.toast.textContent = msg;
    els.toast.classList.toggle('error', isError);
    els.toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => els.toast.classList.remove('show'), 2200);
  }

  function setMode(mode) {
    state.mode = mode;
    document.querySelectorAll('[name="page-mode"]').forEach((radio) => {
      radio.checked = radio.value === mode;
    });
    document.querySelectorAll('.mode-block').forEach((block) => {
      block.classList.toggle('active', block.dataset.modeBlock === mode);
    });
    document.querySelectorAll('[data-copy-block]').forEach((block) => {
      block.classList.toggle('active', block.dataset.copyBlock === mode);
    });
    document.querySelector('.common-content').classList.toggle('is-hidden', mode === 'profile');
    const labels = {
      parking: ['Offer headline', 'Domain description'],
      'coming-soon': ['Announcement', 'Supporting details'],
      landing: ['Headline', 'Additional context'],
      profile: ['Headline', 'Description'],
      redirect: ['Redirect', 'Destination details'],
      maintenance: ['Maintenance headline', 'Maintenance details'],
    };
    $('title-label').textContent = (labels[mode] || labels.landing)[0];
    $('description-label').textContent = (labels[mode] || labels.landing)[1];
    syncRedirectUi();
    scheduleRender();
  }

  function syncRedirectUi() {
    const enabled = els.redirectShowUi.checked;
    document.querySelectorAll('[data-redirect-ui-field] input, [data-redirect-ui-field] select').forEach((field) => {
      field.disabled = !enabled;
      field.setAttribute('aria-disabled', String(!enabled));
    });
  }

  function renderFeatures(features) {
    els.featuresList.innerHTML = '';
    (features || []).forEach((f) => addRepeaterRow(els.featuresList, 'feature', f));
  }
  function renderLinks(links) {
    els.linksList.innerHTML = '';
    (links || []).forEach((l) => addRepeaterRow(els.linksList, 'link', l));
  }
  function renderProfileLinks(links) {
    els.profileLinksList.innerHTML = '';
    (links || []).forEach((l) => addRepeaterRow(els.profileLinksList, 'profileLink', l));
  }

  const DELETE_ROW_ICON = ${serializeForScript(icon("x", { size: 16 }))};

  function addRepeaterRow(container, kind, value = {}) {
    const row = document.createElement('div');
    row.className = 'repeater-row';
    const isFeature = kind === 'feature';
    row.innerHTML =
      '<input data-k="a" type="text" placeholder="Title" />' +
      '<input data-k="b" type="text" class="' + (isFeature ? '' : 'mono') + '" placeholder="' +
        (isFeature ? 'Description (optional)' : 'https://...') + '" />' +
      '<button type="button" class="del" aria-label="Remove row">' + DELETE_ROW_ICON + '</button>';
    row.querySelector('[data-k="a"]').value = value.title || '';
    row.querySelector('[data-k="b"]').value = (isFeature ? value.description : value.url) || '';
    row.querySelector('.del').addEventListener('click', () => {
      row.remove();
      scheduleRender();
      markDirty();
    });
    row.addEventListener('input', () => { scheduleRender(); markDirty(); });
    container.appendChild(row);
  }

  function collectRepeater(container, kind) {
    return Array.from(container.querySelectorAll('.repeater-row'))
      .map((row) => {
        const a = row.querySelector('[data-k="a"]').value.trim();
        const b = row.querySelector('[data-k="b"]').value.trim();
        if (!a && !b) return null;
        return kind === 'feature' ? { title: a, description: b } : { title: a, url: b };
      })
      .filter(Boolean);
  }

  function collectSocial() {
    const out = {};
    document.querySelectorAll('[data-social]').forEach((el) => {
      const v = el.value.trim();
      if (v) out[el.dataset.social] = v;
    });
    return out;
  }

  function applyCopySettings(mode, cfg) {
    document.querySelectorAll('[data-copy-block]').forEach((block) => {
      const blockMode = block.dataset.copyBlock;
      const defaults = MODE_DEFAULTS[blockMode] || {};
      block.querySelectorAll('[data-config-key]').forEach((input) => {
        const key = input.dataset.configKey;
        const canonicalKey = {
          statusLabel: 'status_label',
          eyebrowText: 'eyebrow',
          launchLabel: 'labels',
          pageTitleSuffix: 'labels',
        }[key];
        let value;
        if (blockMode === mode) {
          if (canonicalKey === 'labels') value = cfg.labels?.[key];
          else value = configValue(cfg, key, canonicalKey);
        }
        input.value = value != null ? value : (defaults[key] != null ? defaults[key] : '');
      });
    });
  }

  function collectCopySettings(cfg) {
    const block = document.querySelector('[data-copy-block="' + state.mode + '"]');
    if (!block) return;
    block.querySelectorAll('[data-config-key]').forEach((input) => {
      cfg[input.dataset.configKey] = input.value.trim();
    });
  }

  function configValue(cfg, legacyKey, canonicalKey) {
    if (cfg[legacyKey] !== undefined) return cfg[legacyKey];
    if (canonicalKey && cfg[canonicalKey] !== undefined) return cfg[canonicalKey];
    return undefined;
  }

  function avatarInitials() {
    const value = els.name.value.trim() || els.domainTitle.value.trim() || '?';
    return value.split(/\\s+/).slice(0, 2).map((part) => part.charAt(0)).join('').toUpperCase();
  }

  function updateAvatarPreview() {
    const url = els.avatarUrl.value.trim();
    els.avatarPreview.replaceChildren();
    if (url) {
      const image = document.createElement('img');
      image.src = url;
      image.alt = '';
      image.addEventListener('error', () => {
        els.avatarPreview.textContent = avatarInitials();
      }, { once: true });
      els.avatarPreview.appendChild(image);
    } else {
      els.avatarPreview.textContent = avatarInitials();
    }
    els.avatarRemoveBtn.disabled = !url;
  }

  async function uploadProfileImage() {
    const file = els.avatarFile.files && els.avatarFile.files[0];
    if (!file) return;
    const hostname = els.hostname.value.trim();
    if (!hostname) {
      toast('Enter a hostname before uploading', true);
      els.avatarFile.value = '';
      return;
    }
    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type) || file.size > 5 * 1024 * 1024) {
      toast('Use a PNG, JPEG, WebP, or GIF up to 5 MB', true);
      els.avatarFile.value = '';
      return;
    }

    const body = new FormData();
    body.append('image', file);
    body.append('hostname', hostname);
    els.avatarUploadBtn.disabled = true;
    els.avatarUploadStatus.textContent = 'Uploading image…';
    try {
      const res = await fetch(BASE + '/api/uploads/profile-image', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Image upload failed');
      els.avatarUrl.value = data.url;
      state.avatarObjectKey = data.key;
      els.avatarUploadStatus.textContent = 'Uploaded to R2. Save the page to keep this image.';
      updateAvatarPreview();
      markDirty();
      scheduleRender();
    } catch (error) {
      els.avatarUploadStatus.textContent = error.message || 'Image upload failed.';
      toast(error.message || 'Image upload failed', true);
    } finally {
      els.avatarUploadBtn.disabled = false;
      els.avatarFile.value = '';
    }
  }

  function gatherConfig() {
    // Start from everything already known (incl. fields belonging to other page
    // types) so switching the mode card never drops previously filled-in data.
    const cfg = { ...state.fullConfig, mode: state.mode };
    cfg.domainTitle = els.domainTitle.value.trim() || undefined;
    cfg.title = els.title.value.trim() || undefined;
    cfg.description = els.description.value.trim() || undefined;
    cfg.accentColor = els.accentColor.value;
    cfg.footerText = els.footerText.value;
    cfg.showCredit = els.showCredit.checked;
    cfg.socialLinks = collectSocial();
    collectCopySettings(cfg);
    if (state.mode === 'parking') {
      cfg.salePrice = els.salePrice.value.trim() || undefined;
      cfg.contactEmail = els.contactEmail.value.trim() || undefined;
      cfg.domainAgeYears = els.domainAgeYears.value.trim() || undefined;
      cfg.domainExtension = els.domainExtension.value.trim();
      cfg.domainRegistration = els.domainRegistration.value.trim() || undefined;
    }
    if (state.mode === 'coming-soon') {
      cfg.tagline = els.tagline.value.trim() || undefined;
      cfg.launchDate = els.launchDate.value || undefined;
      cfg.features = collectRepeater(els.featuresList, 'feature');
    }
    if (state.mode === 'landing') {
      cfg.subtitle = els.subtitle.value.trim() || undefined;
      cfg.links = collectRepeater(els.linksList, 'link');
    }
    if (state.mode === 'profile') {
      cfg.name = els.name.value.trim() || undefined;
      cfg.role = els.role.value.trim();
      cfg.avatarUrl = els.avatarUrl.value.trim() || undefined;
      cfg.avatarObjectKey = state.avatarObjectKey || undefined;
      cfg.bio = els.bio.value.trim() || undefined;
      cfg.links = collectRepeater(els.profileLinksList, 'profileLink');
    }
    if (state.mode === 'redirect') {
      cfg.delivery = {
        ...(cfg.delivery || {}),
        redirect: {
          ...((cfg.delivery && cfg.delivery.redirect) || {}),
          target_url: els.redirectTargetUrl.value.trim() || undefined,
          status_code: Number(els.redirectStatusCode.value || 302),
          preserve_path: els.redirectPreservePath.checked,
          preserve_query: els.redirectPreserveQuery.checked,
          show_ui: els.redirectShowUi.checked,
          countdown_seconds: Number(els.redirectCountdownSeconds.value || 5),
        },
      };
    }
    if (state.mode === 'maintenance') {
      const retryAfter = els.maintenanceRetryAfter.value.trim();
      cfg.delivery = {
        ...(cfg.delivery || {}),
        maintenance: {
          ...((cfg.delivery && cfg.delivery.maintenance) || {}),
          retry_after_seconds: retryAfter ? Number(retryAfter) : undefined,
          help_url: els.maintenanceHelpUrl.value.trim() || undefined,
        },
      };
    }
    Object.keys(cfg).forEach((k) => cfg[k] === undefined && delete cfg[k]);
    state.fullConfig = cfg;
    return cfg;
  }

  function applyConfig(record) {
    const cfg = (record && record.config) || {};
    // The API speaks the renderer's canonical mode names (coming_soon); this form
    // has always used hyphens, and so do its radio values, copy blocks and
    // defaults keys. Converting once here beats renaming all of them.
    const raw = (record && record.mode) || cfg.mode || 'landing';
    const mode = String(raw).replace(/_/g, '-');
    const defaults = MODE_DEFAULTS[mode] || {};
    state.fullConfig = { ...cfg, mode };
    els.hostname.value = (record && record.hostname) || '';
    els.domainTitle.value = configValue(cfg, 'domainTitle', 'domain_title') || '';
    els.title.value = configValue(cfg, 'title', 'headline') || '';
    els.description.value = configValue(cfg, 'description', 'body') || '';
    els.accentColor.value = configValue(cfg, 'accentColor') || cfg.theme?.accent || '#e8590c';
    els.salePrice.value = configValue(cfg, 'salePrice', 'price') || '';
    els.contactEmail.value = configValue(cfg, 'contactEmail', 'contact_email') || '';
    els.domainAgeYears.value = cfg.domainAgeYears || '';
    els.domainExtension.value = cfg.domainExtension || '';
    els.domainRegistration.value = configValue(cfg, 'domainRegistration', 'note') || '';
    els.tagline.value = configValue(cfg, 'tagline', 'headline') || '';
    const launchDate = configValue(cfg, 'launchDate', 'launch_date');
    els.launchDate.value = launchDate ? launchDate.slice(0, 16) : '';
    els.subtitle.value = configValue(cfg, 'subtitle', 'subhead') || '';
    els.name.value = cfg.name || '';
    els.role.value = Object.prototype.hasOwnProperty.call(cfg, 'role') ? cfg.role : (defaults.role || '');
    els.avatarUrl.value = configValue(cfg, 'avatarUrl', 'avatar_url') || '';
    state.avatarObjectKey = cfg.avatarObjectKey || null;
    els.bio.value = cfg.bio || '';
    els.footerText.value = Object.prototype.hasOwnProperty.call(cfg, 'footerText') || Object.prototype.hasOwnProperty.call(cfg, 'footer_text')
      ? configValue(cfg, 'footerText', 'footer_text')
      : (defaults.footerText || '');
    els.showCredit.checked = configValue(cfg, 'showCredit', 'footer_credit') !== false;
    const delivery = cfg.delivery || {};
    const redirect = delivery.redirect || {};
    const maintenance = delivery.maintenance || {};
    els.redirectTargetUrl.value = redirect.target_url || '';
    els.redirectStatusCode.value = String(redirect.status_code || 302);
    els.redirectPreservePath.checked = redirect.preserve_path === true;
    els.redirectPreserveQuery.checked = redirect.preserve_query === true;
    els.redirectShowUi.checked = redirect.show_ui === true;
    els.redirectCountdownSeconds.value = redirect.countdown_seconds || 5;
    els.maintenanceRetryAfter.value = maintenance.retry_after_seconds || '';
    els.maintenanceHelpUrl.value = maintenance.help_url || '';
    applyCopySettings(mode, cfg);
    renderFeatures(cfg.features);
    renderLinks(mode === 'profile' ? [] : cfg.links);
    renderProfileLinks(mode === 'profile' ? cfg.links : []);
    const social = cfg.socialLinks || cfg.socials || {};
    document.querySelectorAll('[data-social]').forEach((el) => {
      el.value = social[el.dataset.social] || '';
    });
    els.avatarUploadStatus.textContent = 'Stored privately in the configured R2 bucket.';
    updateAvatarPreview();
    setMode(mode);
    renderMeta(record);
    state.isDirty = false;
    updateSaveButton();
  }

  function renderMeta(record) {
    if (!record || !record.updatedAt) { els.meta.textContent = 'New page — not saved yet.'; return; }
    els.meta.textContent = 'Last saved ' + new Date(record.updatedAt * 1000).toLocaleString() + '.';
  }

  function markDirty() {
    state.isDirty = true;
    updateSaveButton();
  }
  function updateSaveButton() {
    els.saveLabel.textContent = state.isDirty ? 'Save changes' : 'Saved';
    els.saveBtn.disabled = !state.isDirty;
    els.dirtyLabel.textContent = state.isDirty ? 'Unsaved' : 'Saved';
    els.dirtyState.className = 'badge ' + (state.isDirty ? 'badge-warning' : 'badge-success');
    els.openBtn.disabled = !state.current;
    els.deleteBtn.disabled = !state.current;
  }

  // ---- Live preview via debounced POST + iframe.srcdoc ----
  let renderTimer = null;
  let renderInFlight = false;
  function setPreviewState(text, variant) {
    els.status.textContent = text;
    els.previewBadge.className = 'badge badge-' + variant;
  }
  function scheduleRender() {
    setPreviewState('Updating', 'warning');
    clearTimeout(renderTimer);
    renderTimer = setTimeout(doRender, 220);
  }
  async function doRender() {
    if (renderInFlight) { scheduleRender(); return; }
    renderInFlight = true;
    try {
      const cfg = gatherConfig();
      const hostname = els.hostname.value.trim() || 'preview.local';
      const res = await fetch(BASE + '/preview', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ hostname, config: cfg }),
      });
      const html = await res.text();
      els.iframe.srcdoc = html;
      syncPreviewAccent();
      setPreviewState('Live preview', 'success');
    } catch (e) {
      setPreviewState('Preview unavailable', 'danger');
      console.error(e);
    } finally {
      renderInFlight = false;
    }
  }

  // One variable rethemes the page: every hover, tint, and ring derives from it.
  function syncPreviewAccent() {
    const accent = els.accentColor.value || '#e8590c';
    try {
      const doc = els.iframe.contentDocument;
      if (!doc) return;
      doc.documentElement.style.setProperty('--color-primary', accent);
      const themeColor = doc.querySelector('meta[name="theme-color"]');
      if (themeColor) themeColor.setAttribute('content', accent);
    } catch {
      // The debounced render still produces the correct HTML if the iframe is not readable yet.
    }
  }

  // ---- Data loading ----
  async function loadDomains() {
    const res = await fetch(BASE + '/api/domains');
    if (!res.ok) { toast('Could not load domains', true); return; }
    const data = await res.json();
    state.domains = data.domains || [];
    refreshPicker();
  }

  function refreshPicker() {
    els.picker.innerHTML = '';
    if (state.domains.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'No pages yet';
      els.picker.appendChild(opt);
      return;
    }
    state.domains.forEach((d) => {
      const opt = document.createElement('option');
      opt.value = d.hostname;
      opt.textContent = d.hostname + '  (' + d.mode + ')';
      els.picker.appendChild(opt);
    });
    if (state.current) els.picker.value = state.current;
  }

  async function loadDomain(hostname) {
    if (!hostname) return;
    const res = await fetch(BASE + '/api/domains/' + encodeURIComponent(hostname));
    if (!res.ok) { toast('Could not load ' + hostname, true); return; }
    const data = await res.json();
    state.current = hostname;
    applyConfig(data);
    scheduleRender();
  }

  async function putDomain(hostname, mode, config) {
    return fetch(BASE + '/api/domains/' + encodeURIComponent(hostname), {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode, config }),
    });
  }

  async function saveCurrent() {
    const hostname = els.hostname.value.trim();
    if (!hostname) { toast('Enter a hostname first', true); return; }
    const cfg = gatherConfig();
    els.saveLabel.textContent = 'Saving…';
    els.saveBtn.disabled = true;
    const res = await putDomain(hostname, state.mode, cfg);
    if (!res.ok) {
      toast('Not saved: ' + (await res.text()), true);
      updateSaveButton();
      return;
    }
    state.current = hostname;
    state.isDirty = false;
    updateSaveButton();
    toast('Saved ' + hostname);
    await loadDomains();
    els.picker.value = hostname;
    renderMeta(await res.json());
  }

  // ---- Delete, reversible until dismissed (§06.9) ----
  // The hostname is set as text, never markup: this renderer makes no
  // assumption that the value was validated upstream.
  function showUndo(hostname, restore) {
    state.undo = restore;
    const host = document.createElement('span');
    host.className = 'mono';
    host.textContent = hostname;
    els.undoMessage.replaceChildren('Deleted ', host, '.');
    els.undoBar.hidden = false;
  }
  function hideUndo() {
    state.undo = null;
    els.undoBar.hidden = true;
  }

  function requestDelete() {
    if (!state.current) { toast('Save this page before deleting it'); return; }
    els.deleteMessage.textContent =
      'This removes the saved configuration for ' + state.current +
      '. You can undo it until you dismiss the notice.';
    els.deleteDialog.showModal();
  }

  async function deleteCurrent() {
    if (!state.current) return;
    const hostname = state.current;
    const record = { hostname, mode: state.mode, config: { ...state.fullConfig } };
    const res = await fetch(BASE + '/api/domains/' + encodeURIComponent(hostname), { method: 'DELETE' });
    if (!res.ok) { toast('Not deleted — nothing was changed', true); return; }
    state.current = null;
    await loadDomains();
    newDomain();
    showUndo(hostname, record);
  }

  async function undoDelete() {
    const record = state.undo;
    if (!record) return;
    hideUndo();
    const res = await putDomain(record.hostname, record.mode, record.config);
    if (!res.ok) { toast('Could not restore ' + record.hostname, true); return; }
    toast('Restored ' + record.hostname);
    await loadDomains();
    await loadDomain(record.hostname);
  }

  function canDiscardChanges() {
    return !state.isDirty || confirm('Discard your unsaved changes?');
  }

  function newDomain() {
    state.current = null;
    applyConfig({ hostname: '', mode: 'landing', config: { accentColor: '#e8590c', showCredit: true } });
    els.picker.value = '';
    els.hostname.focus();
    scheduleRender();
  }

  function applyPreset(preset) {
    const { name, ...rest } = preset;
    applyConfig({
      hostname: els.hostname.value || '',
      mode: rest.mode || 'landing',
      config: rest,
    });
    markDirty();
    scheduleRender();
    toast('Loaded ' + (name || rest.mode));
  }

  function renderPresets() {
    const presets = window.__PRESETS__ || [];
    els.presets.innerHTML = '';
    if (!presets.length) {
      els.presets.innerHTML = '<p class="hint">No presets configured.</p>';
      return;
    }
    presets.forEach((p) => {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'preset-row';
      const label = document.createElement('span');
      label.textContent = p.name || '(unnamed)';
      const mode = document.createElement('span');
      mode.className = 'preset-mode';
      mode.textContent = p.mode || '';
      row.append(label, mode);
      row.addEventListener('click', () => applyPreset(p));
      els.presets.appendChild(row);
    });
  }

  // ---- Event wiring ----
  document.querySelectorAll('[name="page-mode"]').forEach((radio) => {
    radio.addEventListener('change', () => { setMode(radio.value); markDirty(); });
  });
  document.querySelectorAll('[data-add]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const kind = btn.dataset.add;
      let container;
      if (kind === 'feature') container = els.featuresList;
      else if (kind === 'profileLink') container = els.profileLinksList;
      else container = els.linksList;
      addRepeaterRow(container, kind);
      markDirty();
    });
  });
  // Keep the preview live while typing. Color pickers get explicit listeners
  // because delegated editor events are inconsistent across native pickers.
  const handleEditorInput = (e) => {
    if (e.target === els.accentColor || e.target === els.avatarFile) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
      scheduleRender();
      markDirty();
    }
  };
  const handleAccentColorInput = () => {
    syncPreviewAccent();
    scheduleRender();
    markDirty();
  };
  $('editor').addEventListener('input', handleEditorInput);
  els.accentColor.addEventListener('input', handleAccentColorInput);
  els.accentColor.addEventListener('change', handleAccentColorInput);
  els.avatarUploadBtn.addEventListener('click', () => els.avatarFile.click());
  els.avatarFile.addEventListener('change', uploadProfileImage);
  els.redirectShowUi.addEventListener('change', syncRedirectUi);
  els.avatarRemoveBtn.addEventListener('click', () => {
    els.avatarUrl.value = '';
    state.avatarObjectKey = null;
    els.avatarUploadStatus.textContent = 'Image removed from this page. Save to apply.';
    updateAvatarPreview();
    markDirty();
    scheduleRender();
  });
  els.avatarUrl.addEventListener('input', () => {
    if (els.avatarUrl.value.trim() !== '/_assets/' + (state.avatarObjectKey || '')) {
      state.avatarObjectKey = null;
    }
    updateAvatarPreview();
  });
  els.name.addEventListener('input', updateAvatarPreview);
  els.domainTitle.addEventListener('input', updateAvatarPreview);
  els.iframe.addEventListener('load', syncPreviewAccent);
  els.picker.addEventListener('change', () => {
    if (!canDiscardChanges()) {
      els.picker.value = state.current || '';
      return;
    }
    loadDomain(els.picker.value);
  });
  els.newBtn.addEventListener('click', () => {
    if (canDiscardChanges()) newDomain();
  });
  els.saveBtn.addEventListener('click', saveCurrent);
  els.deleteBtn.addEventListener('click', requestDelete);
  els.confirmDelete.addEventListener('click', async () => {
    els.deleteDialog.close();
    await deleteCurrent();
  });
  els.undoBtn.addEventListener('click', undoDelete);
  els.undoDismiss.addEventListener('click', hideUndo);
  document.querySelector('[data-close-dialog]').addEventListener('click', () => els.deleteDialog.close());
  els.openBtn.addEventListener('click', () => {
    if (state.current) window.open('//' + state.current, '_blank');
    else toast('Save this page before visiting it');
  });

  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); saveCurrent(); }
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') { e.preventDefault(); if (canDiscardChanges()) newDomain(); }
  });

  document.querySelectorAll('.segmented [data-preview-size]').forEach((button) => {
    button.addEventListener('click', () => {
      const size = button.dataset.previewSize;
      els.preview.dataset.previewSize = size;
      document.querySelectorAll('.segmented [data-preview-size]').forEach((item) => {
        item.setAttribute('aria-pressed', String(item.dataset.previewSize === size));
      });
    });
  });

  document.querySelectorAll('.mobile-view-switcher [data-mobile-view]').forEach((button) => {
    button.addEventListener('click', () => {
      const view = button.dataset.mobileView;
      document.body.dataset.mobileView = view;
      document.querySelectorAll('.mobile-view-switcher [data-mobile-view]').forEach((item) => {
        item.setAttribute('aria-selected', String(item.dataset.mobileView === view));
      });
    });
  });

  window.addEventListener('beforeunload', (e) => {
    if (!state.isDirty) return;
    e.preventDefault();
    e.returnValue = '';
  });

  // ---- Boot ----
  (async function init() {
    renderPresets();
    await loadDomains();
    if (state.domains.length) loadDomain(state.domains[0].hostname);
    else newDomain();
  })();
`;
