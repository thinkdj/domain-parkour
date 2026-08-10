/**
 * Admin SPA - a single HTML document with embedded styles and client script.
 *
 * Two views live here, switched without a page load:
 *   Pages   the editor and its live preview, talking to /_admin_/api/domains
 *   Inbox   everything visitors have sent, from /_admin_/api/inbox
 *
 * The component vocabulary is the design system's, imported through
 * ../styles/tokens.js and inlined because an admin page must ship no external
 * request. What is left in ADMIN_CSS below is only what this Studio has and no
 * other product would want unchanged - the two-pane workspace, the preview
 * device, and the form sections.
 */

import { MODE_DEFAULTS } from "../config.js";
import { serializeForScript } from "../safety.js";
import { tokens, baseRules, motion, components } from "../styles/tokens.js";
import { icon } from "../icons.js";
import { themeScript, themeToggle } from "../../pages/index.js";

// The trail - brand mark and favicon share these exact paths. Two fading echoes
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
// parkour_design_system.html §05). Copied in verbatim - no shared package
// exists between this app and the cloud control plane yet.
const MODE_SVGS = {
  parking: `<svg class="choice-glyph" viewBox="0 0 96 54" fill="none" aria-hidden="true">
    <rect x="6" y="4" width="44" height="6" rx="3" fill="var(--color-line-strong)"/>
    <rect x="6" y="16" width="20" height="9" rx="4.5" fill="var(--color-muted)"/>
    <rect x="70" y="16" width="20" height="9" rx="4.5" fill="var(--color-line-strong)"/>
    <rect x="6" y="33" width="64" height="4" rx="2" fill="var(--color-line)"/>
    <rect x="6" y="41" width="50" height="4" rx="2" fill="var(--color-line)"/>
  </svg>`,
  comingSoon: `<svg class="choice-glyph" viewBox="0 0 96 54" fill="none" aria-hidden="true">
    <rect x="26" y="4" width="44" height="6" rx="3" fill="var(--color-line-strong)"/>
    <rect x="26" y="16" width="12" height="12" rx="2.5" fill="var(--color-line)"/>
    <rect x="42" y="16" width="12" height="12" rx="2.5" fill="var(--color-line)"/>
    <rect x="58" y="16" width="12" height="12" rx="2.5" fill="var(--color-line)"/>
    <rect x="34" y="38" width="28" height="9" rx="4.5" fill="var(--color-muted)"/>
  </svg>`,
  landing: `<svg class="choice-glyph" viewBox="0 0 96 54" fill="none" aria-hidden="true">
    <rect x="6" y="4" width="36" height="6" rx="3" fill="var(--color-line-strong)"/>
    <rect x="6" y="16" width="64" height="4" rx="2" fill="var(--color-line)"/>
    <rect x="6" y="24" width="56" height="4" rx="2" fill="var(--color-line)"/>
    <rect x="6" y="34" width="24" height="9" rx="4.5" fill="var(--color-muted)"/>
    <circle cx="38" cy="38.5" r="3" fill="var(--color-line)"/>
    <circle cx="47" cy="38.5" r="3" fill="var(--color-line)"/>
    <circle cx="56" cy="38.5" r="3" fill="var(--color-line)"/>
  </svg>`,
  profile: `<svg class="choice-glyph" viewBox="0 0 96 54" fill="none" aria-hidden="true">
    <circle cx="48" cy="10" r="8" fill="var(--color-line)"/>
    <rect x="32" y="23" width="32" height="5" rx="2.5" fill="var(--color-line-strong)"/>
    <rect x="24" y="32" width="48" height="4" rx="2" fill="var(--color-line)"/>
    <rect x="26" y="42" width="44" height="9" rx="4.5" fill="var(--color-muted)"/>
  </svg>`,
  redirect: `<svg class="choice-glyph" viewBox="0 0 96 54" fill="none" aria-hidden="true">
    <rect x="6" y="8" width="22" height="9" rx="4.5" fill="var(--color-line-strong)"/>
    <path d="M30 12.5h28" stroke="var(--color-muted)" stroke-width="4" stroke-linecap="round" stroke-dasharray="5 5"/>
    <path d="m54 5 11 7.5L54 20" stroke="var(--color-line-strong)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="68" y="8" width="22" height="9" rx="4.5" fill="var(--color-muted)"/>
    <rect x="22" y="34" width="52" height="5" rx="2.5" fill="var(--color-line)"/>
    <rect x="32" y="44" width="32" height="5" rx="2.5" fill="var(--color-line)"/>
  </svg>`,
  maintenance: `<svg class="choice-glyph" viewBox="0 0 96 54" fill="none" aria-hidden="true">
    <path d="m48 5 25 43H23L48 5Z" fill="var(--color-line)"/>
    <path d="M48 18v13" stroke="var(--color-muted)" stroke-width="5" stroke-linecap="round"/>
    <circle cx="48" cy="39" r="2.5" fill="var(--color-muted)"/>
  </svg>`,
};

/** §06.3 - the signature choice in the product: one radio card per mode. */
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
        <label class="choice-card">
          <input type="radio" name="page-mode" value="${mode}" />
          <span class="choice-check" aria-hidden="true">${icon("check", { size: 16 })}</span>
          ${glyph}
          <span class="choice-name">${name}</span>
          <span class="choice-desc">${copy}</span>
        </label>`,
  ).join("");
}

/**
 * A bordered switch row, the design system's §06.2 recipe.
 *
 * `disabled` is rendered into the markup rather than only applied by script, so
 * a control that depends on another starts out visibly inert.
 */
function switchRow(id, title, copy, { mode = "", disabled = false } = {}) {
  return `<label class="switch-row"${mode ? ` data-capture-mode="${mode}"` : ""}>
    <span><span class="switch-title">${title}</span><span class="switch-desc">${copy}</span></span>
    <span class="switch"><input id="${id}" type="checkbox"${disabled ? " disabled" : ""} /><span class="switch-track" aria-hidden="true"></span></span>
  </label>`;
}

export function renderAdminUI({ isDefaultCreds, presets } = {}) {
  const presetsJson = serializeForScript(presets || []);
  const defaultsJson = serializeForScript(MODE_DEFAULTS);
  const warnDefaultCreds = isDefaultCreds
    ? `<div id="cred-warning" class="alert alert-warning" role="status">
         ${icon("alert-triangle")}
         <div class="alert-body">
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
  <title>Domain Parkour - Parking Page Studio</title>
  <link rel="icon" href="${ADMIN_FAVICON}" />
  <script data-theme-script>${themeScript()}</script>
  <style>${ADMIN_CSS}</style>
</head>
<body data-view="pages" data-mobile-view="editor">
  <header class="topbar">
    <div class="brand">
      <span class="logo" aria-hidden="true">${BRAND_GLYPH}</span>
      <span class="brand-copy">
        <span class="brand-name">Domain Parkour</span>
        <span class="brand-subtitle">Parking Page Studio</span>
      </span>
    </div>

    <div class="segmented view-switcher" role="tablist" aria-label="Workspace">
      <button type="button" role="tab" data-view="pages" aria-selected="true">Pages</button>
      <button type="button" role="tab" data-view="inbox" aria-selected="false">
        Inbox<span class="filter-count" id="inbox-unread" hidden></span>
      </button>
    </div>

    <div class="site-switcher" data-view-only="pages">
      <label class="sr-only" for="domain-picker">Current domain</label>
      <select id="domain-picker" class="select mono" title="Switch domain" aria-label="Current domain"></select>
    </div>

    <div class="topbar-actions" data-view-only="pages">
      <button id="new-btn" class="btn btn-sm" title="New page (Ctrl/Command + N)">${icon("plus", { size: 16 })}<span class="btn-label">New page</span></button>
      <button id="open-btn" class="btn btn-sm" title="Open the live page in a new tab">${icon("external-link", { size: 16 })}<span class="btn-label">Visit</span></button>
      <button id="delete-btn" class="btn btn-sm btn-icon btn-danger-ghost" title="Delete this page">${icon("trash", { size: 16 })}<span class="sr-only">Delete page</span></button>
      ${themeToggle({ className: 'btn btn-sm btn-icon' })}
      <button id="save-btn" class="btn btn-sm btn-primary" title="Save changes (Ctrl/Command + S)">
        <span id="save-label">Saved</span><kbd>Ctrl S</kbd>
      </button>
    </div>

    <div class="topbar-actions" data-view-only="inbox">
      <button id="inbox-refresh" class="btn btn-sm" title="Reload the inbox">${icon("refresh", { size: 16 })}<span class="btn-label">Refresh</span></button>
      <a id="inbox-export" class="btn btn-sm" href="/_admin_/api/inbox.csv" download>${icon("download", { size: 16 })}<span class="btn-label">Export CSV</span></a>
      ${themeToggle({ className: 'btn btn-sm btn-icon' })}
      <button id="inbox-read-all" class="btn btn-sm btn-primary">${icon("mail-opened", { size: 16 })}<span class="btn-label">Mark all read</span></button>
    </div>

    <div class="segmented mobile-view-switcher" role="tablist" aria-label="Pane" data-view-only="pages">
      <button type="button" data-mobile-view="editor" role="tab" aria-selected="true">Editor</button>
      <button type="button" data-mobile-view="preview" role="tab" aria-selected="false">Preview</button>
    </div>
  </header>

  ${warnDefaultCreds}

  <main class="workspace" data-view-panel="pages">
    <section class="editor" id="editor">
      <div class="editor-inner">
        <div class="editor-heading">
          <div>
            <p class="eyebrow">Page editor</p>
            <h1>Shape the page</h1>
            <p class="editor-sub">Every change renders in the preview as you type.</p>
          </div>
          <span id="dirty-state" class="badge badge-success"><span id="dirty-label">Saved</span></span>
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
          <label class="label" for="f-hostname">Hostname</label>
          <input id="f-hostname" type="text" class="input mono" placeholder="example.com" autocomplete="off" spellcheck="false" />
          <p class="help">Exact host matched by the Worker. Use <code>_default</code> for the catch-all page.</p>
        </div>

        <div class="field">
          <span class="label" id="template-label">Template</span>
          <div class="choice-grid" role="radiogroup" aria-labelledby="template-label">${renderModePicker()}</div>
        </div>

        <div class="field row">
          <div class="col">
            <label class="label" for="f-domainTitle">Display name</label>
            <input id="f-domainTitle" type="text" class="input" placeholder="My Domain" />
          </div>
          <div class="col color-col">
            <label class="label" for="f-accentColor">Accent</label>
            <input id="f-accentColor" type="color" class="input-color" aria-label="Accent color" />
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
            <label class="label" id="title-label" for="f-title">Headline</label>
            <input id="f-title" type="text" class="input" placeholder="Premium domain for sale" />
          </div>

          <div class="field">
            <label class="label" id="description-label" for="f-description">Description</label>
            <textarea id="f-description" class="textarea" rows="3" placeholder="A short, useful description"></textarea>
          </div>
        </div>

        <!-- Mode-specific fields below -->
        <div data-mode-block="parking" class="mode-block">
          <div class="field row">
            <div class="col">
              <label class="label" for="f-salePrice">Sale price</label>
              <input id="f-salePrice" type="text" class="input" placeholder="25,000 USD" />
            </div>
            <div class="col">
              <label class="label" for="f-contactEmail">Contact email</label>
              <input id="f-contactEmail" type="email" class="input mono" placeholder="you@example.com" />
            </div>
          </div>
          <div class="field row">
            <div class="col">
              <label class="label" for="f-domainAgeYears">Age label</label>
              <input id="f-domainAgeYears" type="text" class="input" placeholder="15+" />
            </div>
            <div class="col">
              <label class="label" for="f-domainExtension">Extension value</label>
              <input id="f-domainExtension" type="text" class="input mono" placeholder=".com" />
            </div>
          </div>
          <div class="field">
            <label class="label" for="f-domainRegistration">Registration note</label>
            <input id="f-domainRegistration" type="text" class="input" placeholder="Registered in 2010" />
          </div>
        </div>

        <div data-mode-block="coming-soon" class="mode-block">
          <div class="field row">
            <div class="col">
              <label class="label" for="f-tagline">Tagline</label>
              <input id="f-tagline" type="text" class="input" placeholder="Launching 2026" />
            </div>
            <div class="col">
              <label class="label" for="f-launchDate">Launch date</label>
              <input id="f-launchDate" type="datetime-local" class="input mono" />
            </div>
          </div>
          <div class="field">
            <span class="label">Feature highlights <span class="muted">Optional</span></span>
            <div id="features-list" class="repeater"></div>
            <button type="button" class="btn btn-sm btn-add" data-add="feature">${icon("plus", { size: 16 })}Add feature</button>
          </div>
        </div>

        <div data-mode-block="landing" class="mode-block">
          <div class="field">
            <label class="label" for="f-subtitle">Subtitle</label>
            <input id="f-subtitle" type="text" class="input" placeholder="Used for email and APIs" />
          </div>
          <div class="field">
            <span class="label">Destination links</span>
            <div id="links-list" class="repeater"></div>
            <button type="button" class="btn btn-sm btn-add" data-add="link">${icon("plus", { size: 16 })}Add link</button>
          </div>
        </div>

        <div data-mode-block="profile" class="mode-block">
          <div class="field row">
            <div class="col">
              <label class="label" for="f-name">Name</label>
              <input id="f-name" type="text" class="input" placeholder="Ada Lovelace" />
            </div>
            <div class="col">
              <label class="label" for="f-role">Role / tagline</label>
              <input id="f-role" type="text" class="input" placeholder="Designer & Engineer" />
            </div>
          </div>
          <div class="field">
            <span class="label">Profile image <span class="muted">PNG, JPEG, WebP, or GIF, up to 5 MB</span></span>
            <div class="uploader">
              <div id="avatar-preview" class="uploader-preview" aria-hidden="true">?</div>
              <div class="uploader-actions">
                <input id="f-avatarFile" type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden />
                <div class="cluster cluster-tight">
                  <button id="avatar-upload-btn" type="button" class="btn btn-sm">Upload image</button>
                  <button id="avatar-remove-btn" type="button" class="btn btn-sm">Remove image</button>
                </div>
                <p id="avatar-upload-status" class="help">Stored privately in the configured R2 bucket.</p>
              </div>
            </div>
          </div>
          <div class="field">
            <label class="label" for="f-avatarUrl">Image URL <span class="muted">Uploaded path or external URL</span></label>
            <input id="f-avatarUrl" type="text" class="input mono" placeholder="https://example.com/avatar.jpg" />
          </div>
          <div class="field">
            <label class="label" for="f-bio">Bio</label>
            <textarea id="f-bio" class="textarea" rows="3" placeholder="A short bio"></textarea>
          </div>
          <div class="field">
            <span class="label">Featured links</span>
            <div id="profile-links-list" class="repeater"></div>
            <button type="button" class="btn btn-sm btn-add" data-add="profileLink">${icon("plus", { size: 16 })}Add link</button>
          </div>
        </div>

        <div data-mode-block="redirect" class="mode-block">
          <div class="field">
            <label class="label" for="redirect-target-url">Redirect target</label>
            <input id="redirect-target-url" type="url" class="input mono" placeholder="https://example.com/new-home" autocomplete="off" spellcheck="false" />
            <p class="help">HTTPS only. The target cannot be this hostname.</p>
          </div>
          <div class="field">
            <span class="label">Redirect behavior</span>
            ${switchRow("redirect-show-ui", "Show redirect page", "Show a short message before forwarding.")}
          </div>
          <div class="field" data-redirect-ui-field>
            <label class="label" for="redirect-countdown-seconds">Redirect after</label>
            <input id="redirect-countdown-seconds" type="number" min="1" max="60" step="1" class="input mono" placeholder="5" disabled />
            <p class="help">Seconds to show the message before forwarding.</p>
          </div>
          <div class="field" data-redirect-ui-field>
            <label class="label" for="redirect-status-code">Redirect type</label>
            <select id="redirect-status-code" class="select" disabled>
              <option value="302">302 - temporary (recommended)</option>
              <option value="307">307 - temporary, keep method</option>
              <option value="301">301 - permanent</option>
              <option value="308">308 - permanent, keep method</option>
            </select>
          </div>
          <div class="switch-stack" data-redirect-ui-field>
            ${switchRow("redirect-preserve-path", "Preserve path", "Append the incoming path to the target.", { disabled: true })}
            ${switchRow("redirect-preserve-query", "Preserve query", "Append incoming query parameters to the target.", { disabled: true })}
          </div>
        </div>

        <div data-mode-block="maintenance" class="mode-block">
          <div class="field">
            <label class="label" for="maintenance-retry-after">Retry-After seconds <span class="muted">Optional</span></label>
            <input id="maintenance-retry-after" type="number" min="60" max="604800" class="input mono" placeholder="3600" />
            <p class="help">Between 60 seconds and 7 days. The page returns HTTP 503.</p>
          </div>
          <div class="field">
            <label class="label" for="maintenance-help-url">Status or help link <span class="muted">Optional</span></label>
            <input id="maintenance-help-url" type="url" class="input mono" placeholder="https://status.example.com" autocomplete="off" spellcheck="false" />
          </div>
        </div>

        </section>

        <section class="form-section" aria-labelledby="messages-heading">
          <div class="section-heading">
            <span class="section-index">03</span>
            <div>
              <h2 id="messages-heading">Messages</h2>
              <p>Which forms this page shows. Everything sent lands in the Inbox.</p>
            </div>
          </div>

          <div class="switch-stack">
            ${switchRow("capture-contact", "Contact form", "A visitor can write to you without your address ever appearing on the page.")}
            ${switchRow("capture-offer", "Offer form", "Name, email, amount and message, beside the asking price.", { mode: "parking" })}
            ${switchRow("capture-waitlist", "Waitlist form", "One email field under the launch date.", { mode: "coming-soon" })}
          </div>

          <div class="field">
            <label class="label" for="capture-survey">Survey question <span class="muted">Optional</span></label>
            <input id="capture-survey" type="text" class="input" maxlength="180" placeholder="What would you want this domain to become?" />
            <p class="help">Asked in its own short form. Leave empty for no survey.</p>
          </div>

          <div class="field">
            <label class="label" for="capture-consent">Consent text <span class="muted">Optional</span></label>
            <input id="capture-consent" type="text" class="input" maxlength="240" placeholder="I agree that the owner may reply about this domain." />
            <p class="help">When set, every form requires this checkbox and records the answer with the message.</p>
          </div>
        </section>

        <section class="form-section extras-section" aria-labelledby="extras-heading">
          <div class="section-heading">
            <span class="section-index">04</span>
            <div>
              <h2 id="extras-heading">Finishing touches</h2>
              <p>Social links, footer, wording, and starting points.</p>
            </div>
          </div>

        <details class="advanced">
          <summary><span>Social links</span><span class="summary-hint">Optional</span></summary>
          <div class="social-grid">
            <label class="label">Twitter / X <input data-social="twitter" type="url" class="input mono" placeholder="https://x.com/handle" /></label>
            <label class="label">LinkedIn <input data-social="linkedin" type="url" class="input mono" placeholder="https://linkedin.com/in/handle" /></label>
            <label class="label">GitHub <input data-social="github" type="url" class="input mono" placeholder="https://github.com/handle" /></label>
            <label class="label">Instagram <input data-social="instagram" type="url" class="input mono" placeholder="https://instagram.com/handle" /></label>
            <label class="label">Facebook <input data-social="facebook" type="url" class="input mono" placeholder="https://facebook.com/handle" /></label>
            <label class="label">Email <input data-social="email" type="text" class="input mono" placeholder="you@example.com" /></label>
          </div>
        </details>

        <details class="advanced">
          <summary><span>Template wording</span><span class="summary-hint">Fully configurable</span></summary>
          <div class="copy-settings">
            <div class="copy-block" data-copy-block="parking">
              <label class="label">Status label<input data-config-key="statusLabel" type="text" class="input" /></label>
              <label class="label">Eyebrow<input data-config-key="eyebrowText" type="text" class="input" /></label>
              <label class="label">Price label<input data-config-key="priceLabel" type="text" class="input" /></label>
              <label class="label">Inquiry label<input data-config-key="inquiryLabel" type="text" class="input" /></label>
              <label class="label wide">No-price heading<input data-config-key="noPriceTitle" type="text" class="input" /></label>
              <label class="label wide">Contact copy<textarea data-config-key="contactCopy" class="textarea" rows="2"></textarea></label>
              <label class="label wide">Availability copy<textarea data-config-key="availabilityCopy" class="textarea" rows="2"></textarea></label>
              <label class="label">Contact button<input data-config-key="contactButtonText" type="text" class="input" /></label>
              <label class="label">Browser title suffix<input data-config-key="pageTitleSuffix" type="text" class="input" /></label>
              <label class="label">Domain age label<input data-config-key="domainAgeLabel" type="text" class="input" /></label>
              <label class="label">Extension label<input data-config-key="extensionLabel" type="text" class="input" /></label>
              <label class="label">Trust value<input data-config-key="trustValue" type="text" class="input" /></label>
              <label class="label">Trust label<input data-config-key="trustLabel" type="text" class="input" /></label>
            </div>
            <div class="copy-block" data-copy-block="coming-soon">
              <label class="label">Status label<input data-config-key="statusLabel" type="text" class="input" /></label>
              <label class="label">Eyebrow<input data-config-key="eyebrowText" type="text" class="input" /></label>
              <label class="label">Launch label<input data-config-key="launchLabel" type="text" class="input" /></label>
              <label class="label">Browser title suffix<input data-config-key="pageTitleSuffix" type="text" class="input" /></label>
              <label class="label wide">Countdown note<textarea data-config-key="countdownNote" class="textarea" rows="2"></textarea></label>
              <label class="label">Fallback panel label<input data-config-key="statusPanelLabel" type="text" class="input" /></label>
              <label class="label wide">Fallback panel heading<input data-config-key="statusPanelTitle" type="text" class="input" /></label>
              <label class="label wide">Fallback panel copy<textarea data-config-key="statusPanelText" class="textarea" rows="2"></textarea></label>
            </div>
            <div class="copy-block" data-copy-block="landing">
              <label class="label">Status label<input data-config-key="statusLabel" type="text" class="input" /></label>
              <label class="label">Eyebrow<input data-config-key="eyebrowText" type="text" class="input" /></label>
              <label class="label">Links label<input data-config-key="linksLabel" type="text" class="input" /></label>
            </div>
            <div class="copy-block" data-copy-block="profile">
              <label class="label">Status label<input data-config-key="statusLabel" type="text" class="input" /></label>
            </div>
            <div class="copy-block" data-copy-block="redirect">
              <label class="label">Status label<input data-config-key="statusLabel" type="text" class="input" /></label>
              <label class="label">Browser title suffix<input data-config-key="pageTitleSuffix" type="text" class="input" /></label>
            </div>
            <div class="copy-block" data-copy-block="maintenance">
              <label class="label">Status label<input data-config-key="statusLabel" type="text" class="input" /></label>
              <label class="label">Browser title suffix<input data-config-key="pageTitleSuffix" type="text" class="input" /></label>
            </div>
          </div>
        </details>

        <details class="advanced">
          <summary><span>Footer</span><span class="summary-hint">Optional</span></summary>
          <div class="field">
            <label class="label" for="f-footerText">Custom footer text <span class="muted">Optional</span></label>
            <input id="f-footerText" type="text" class="input" placeholder="© 2026 example.com" />
          </div>
          ${switchRow("f-showCredit", "Show footer credit", "&ldquo;Built with Domain Parkour · powered by Cloudflare&rdquo;")}
        </details>

        <details class="advanced">
          <summary><span>Start from a template</span><span class="summary-hint">${presets?.length || 0} available</span></summary>
          <div id="presets" class="presets"></div>
        </details>

        </section>

        <p class="help" id="meta"></p>
      </div>
    </section>

    <section class="preview" id="preview" data-preview-size="desktop">
      <div class="preview-header">
        <span id="preview-badge" class="badge badge-success"><span id="preview-status">Live preview</span></span>
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

  <!-- Everything visitors have sent, from every hostname, in one list. -->
  <section class="inbox-view" data-view-panel="inbox" hidden>
    <div class="inbox-inner">
      <div class="page-heading">
        <div>
          <p class="eyebrow">One desk</p>
          <h1 class="page-title">Inbox</h1>
          <p class="lede">Contact messages, offers, waitlist signups and survey answers from every page this Worker serves. Nothing leaves your D1.</p>
        </div>
      </div>

      <div class="filter-bar">
        <nav class="filter-tabs" id="inbox-status-tabs" aria-label="Filter by status"></nav>
      </div>

      <div class="cluster inbox-filters">
        <label class="search-wrap">
          <span class="sr-only">Search the inbox</span>
          ${icon("search", { size: 16, cls: "icon" })}
          <input id="inbox-search" type="search" class="input search" placeholder="Search name, address, subject or message" />
        </label>
        <label class="sr-only" for="inbox-hostname">Domain</label>
        <select id="inbox-hostname" class="select"><option value="">All domains</option></select>
        <label class="sr-only" for="inbox-kind">Type</label>
        <select id="inbox-kind" class="select">
          <option value="">All types</option>
          <option value="contact">Message</option>
          <option value="offer">Offer</option>
          <option value="waitlist">Waitlist</option>
          <option value="survey">Survey</option>
        </select>
      </div>

      <div id="inbox-list" class="msg-list" hidden></div>

      <div id="inbox-empty" class="card empty-state">
        <span class="empty-state-icon">${icon("inbox")}</span>
        <p class="empty-state-title">Nothing here</p>
        <p class="empty-state-body">Turn on a form under <strong>Messages</strong> in the page editor. Everything a visitor sends arrives here - offers, questions, waitlist signups - and never leaves your database.</p>
      </div>

      <p class="help">Replies open in your own mail client. Domain Parkour never sends mail as you, and never keeps a copy of what you send.</p>
    </div>
  </section>

  <dialog id="delete-dialog" class="dialog">
    <div class="dialog-mark" aria-hidden="true">${icon("trash")}</div>
    <h2 class="dialog-title">Delete this page?</h2>
    <p class="dialog-body" id="delete-message"></p>
    <div class="dialog-actions">
      <button type="button" class="btn" data-close-dialog>Keep page</button>
      <button type="button" class="btn btn-danger" id="confirm-delete">Delete page</button>
    </div>
  </dialog>

  <!-- §06.9 - every destructive action is reversible, and the interface says so. -->
  <div id="undo-bar" class="undo-bar" role="status" hidden>
    ${icon("arrow-back-up")}
    <p id="undo-message"></p>
    <div class="undo-actions">
      <button type="button" id="undo-btn" class="btn btn-sm">Undo</button>
      <button type="button" id="undo-dismiss" class="undo-dismiss" aria-label="Dismiss">${icon("x", { size: 16 })}</button>
    </div>
  </div>

  <div id="toast" class="toast" role="status" aria-live="polite" hidden></div>

  <script>
    window.__PRESETS__ = ${presetsJson};
    window.__MODE_DEFAULTS__ = ${defaultsJson};
  </script>
  <script>${ADMIN_JS}</script>
</body>
</html>`;
}

// Tokens, element defaults, motion, then the shared component layer - the same
// four files the control plane links as static assets, inlined here because every
// page this runtime serves must be self-contained.
//
// What follows is only what the Studio has and no second product would want: the
// two-pane workspace, the preview device, the numbered form sections, and the
// inbox shell. Every button, badge, alert, field, switch, dialog, toast and undo
// bar above comes from components.css, so there is one implementation of each in
// the product rather than two that happen to agree today.
const ADMIN_CSS = `${tokens}${baseRules}${motion}${components}
  html, body { height: 100%; }
  body {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--color-surface-2);
    font-size: 14px;
    line-height: 1.5;
  }
  code, kbd { font-family: var(--font-mono); }
  /* A banner spanning the window, not a card floating in it. */
  body > .alert { flex: 0 0 auto; border-radius: 0; border-bottom: 1px solid var(--color-line); padding: 14px 20px; }
  .help code {
    padding: 1px 5px;
    border-radius: var(--radius-sm);
    background: var(--color-surface-3);
    font-size: 12px;
  }

  /* ---- §06.10 App bar: 56px, border-bottom, no shadow ---- */
  .topbar {
    flex: 0 0 auto;
    min-height: 56px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    padding: 8px 20px;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-line);
  }
  .brand { display: flex; align-items: center; gap: 10px; min-width: 0; }
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
  .view-switcher button { min-width: 78px; }
  /* The unread count rides the tab it belongs to. */
  .view-switcher .filter-count { margin-left: 6px; color: var(--color-primary); font-weight: 700; }
  .site-switcher { flex: 1 1 200px; min-width: 0; max-width: 420px; margin-left: auto; }
  .site-switcher .select { height: 32px; font-size: 13px; }
  .topbar-actions { display: flex; align-items: center; gap: 8px; margin-left: auto; }
  .btn kbd {
    padding: 2px 5px;
    border: 1px solid rgba(255, 255, 255, 0.24);
    border-radius: var(--radius-sm);
    background: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.8);
    font-size: 10px;
    font-weight: 500;
  }
  /* A dashed button reads as "there is not one of these yet". */
  .btn-add { border-style: dashed; color: var(--color-body); }
  body[data-view="pages"] [data-view-only="inbox"],
  body[data-view="inbox"] [data-view-only="pages"] { display: none; }

  /* ---- Workspace: form left, live page right ---- */
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
  /* The section is a flex column with its own rhythm, so the shared field
     margin would add a second, larger gap under every control. */
  .form-section .field { margin-bottom: 0; }
  .form-section .section-heading { align-items: flex-start; margin-bottom: 0; }
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
  .section-heading p { margin-top: 2px; color: var(--color-muted); font-size: 13px; font-family: var(--font-sans); font-weight: 400; }
  .common-content { display: flex; flex-direction: column; gap: 20px; }
  .common-content.is-hidden { display: none; }
  .mode-block { display: none; flex-direction: column; gap: 20px; }
  .mode-block.active { display: flex; }
  .switch-stack { display: grid; gap: 10px; }
  .field.row { display: flex; flex-direction: row; gap: 16px; }
  .field.row .col { flex: 1; min-width: 0; }
  .field.row .color-col { flex: 0 0 88px; }
  .repeater-row { display: grid; grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr) 40px; gap: 8px; }
  .repeater-row .input { min-width: 0; font-size: 13px; }

  /* ---- Disclosures ---- */
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
  details.advanced > .switch-row,
  details.advanced > .social-grid,
  details.advanced > .copy-settings,
  details.advanced > .presets { margin: 16px; }
  .social-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .copy-block { display: none; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .copy-block.active { display: grid; }
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

  /* ---- Preview pane ---- */
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
    transition: opacity var(--t-enter) var(--ease);
  }
  .preview[data-preview-size="mobile"] .preview-device { width: min(390px, 100%); }
  iframe { width: 100%; height: 100%; display: block; border: 0; }

  /* ---- Inbox ---- */
  .inbox-view { flex: 1 1 auto; overflow-y: auto; }
  .inbox-inner { width: min(100% - 40px, var(--container)); margin: 0 auto; padding: 32px 0 72px; }
  .inbox-filters { margin-bottom: 16px; }
  .inbox-filters .search-wrap { flex: 1 1 240px; min-width: 0; }
  .inbox-filters .select { flex: 0 1 auto; width: auto; min-width: 168px; }
  .inbox-view .empty-state { margin-top: 8px; }
  .inbox-view .help { margin-top: 16px; }

  /* The dialog's warning chip. The shared layer has no equivalent: an icon in a
     danger tint is specific to a confirmation this small. */
  .dialog-mark {
    width: 40px; height: 40px;
    display: grid;
    place-items: center;
    margin-bottom: 16px;
    border-radius: var(--radius-md);
    background: var(--color-danger-soft);
    color: var(--color-danger);
  }

  /* The undo bar owns bottom-center while it is up; the toast steps above it. */
  body:has(#undo-bar:not([hidden])) .toast { bottom: 88px; }
  .toast.error { background: var(--color-danger-solid); color: #fff; }

  /* ---- Responsive ---- */
  .mobile-view-switcher { display: none; }
  @media (max-width: 1080px) {
    .workspace { grid-template-columns: minmax(420px, 480px) minmax(0, 1fr); }
  }
  @media (max-width: 900px) {
    .workspace { display: block; overflow: hidden; }
    .editor, .preview { width: 100%; height: 100%; border: 0; }
    .editor-inner { max-width: 640px; }
    .mobile-view-switcher { display: inline-flex; order: 5; }
    body[data-mobile-view="editor"] .preview { display: none; }
    body[data-mobile-view="preview"] .editor { display: none; }
  }
  @media (max-width: 680px) {
    .topbar { padding: 8px 12px; }
    .brand-copy { display: none; }
    .site-switcher { order: 4; flex-basis: 100%; max-width: none; margin-left: 0; }
    /* Only the labels collapse - an icon-only button still has to keep its
       icon, and the one primary action keeps its words. */
    .topbar-actions .btn-label { display: none; }
    .topbar-actions .btn { width: 32px; padding: 0; }
    .topbar-actions .btn-primary { width: auto; padding: 6px 12px; }
    .topbar-actions .btn-primary .btn-label { display: inline; }
    .btn kbd { display: none; }
    .editor-inner { padding: 24px 16px 48px; }
    .form-section { padding: 20px 16px; }
    .field.row { flex-direction: column; }
    .field.row .color-col { flex-basis: auto; }
    .copy-block, .social-grid { grid-template-columns: 1fr; }
    .copy-block .wide { grid-column: auto; }
    .preview-canvas { padding: 12px; }
    .repeater-row { grid-template-columns: 1fr 40px; }
    .repeater-row .input[data-k="b"] { grid-column: 1 / -1; grid-row: 2; }
    .repeater-row .btn { grid-column: 2; grid-row: 1; }
    .inbox-inner { width: min(100% - 24px, var(--container)); padding-top: 24px; }
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
    captureContact: $('capture-contact'),
    captureOffer: $('capture-offer'),
    captureWaitlist: $('capture-waitlist'),
    captureSurvey: $('capture-survey'),
    captureConsent: $('capture-consent'),
    footerText: $('f-footerText'),
    showCredit: $('f-showCredit'),
    inboxList: $('inbox-list'),
    inboxEmpty: $('inbox-empty'),
    inboxTabs: $('inbox-status-tabs'),
    inboxSearch: $('inbox-search'),
    inboxHostname: $('inbox-hostname'),
    inboxKind: $('inbox-kind'),
    inboxUnread: $('inbox-unread'),
    inboxExport: $('inbox-export'),
    inboxRefresh: $('inbox-refresh'),
    inboxReadAll: $('inbox-read-all'),
  };

  let state = {
    domains: [],
    current: null,           // hostname currently being edited (null = unsaved new)
    mode: 'landing',
    isDirty: false,
    avatarObjectKey: null,
    fullConfig: {},          // accumulates fields from every mode so switching tabs never drops data
    undo: null,              // last deleted record, restorable until dismissed
    view: 'pages',
    inbox: { status: 'open', kind: '', hostname: '', q: '' },
    inboxLoaded: false,
  };

  function toast(msg, isError = false) {
    els.toast.textContent = msg;
    els.toast.classList.toggle('error', isError);
    els.toast.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { els.toast.hidden = true; }, 2200);
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
    // A form that only ever renders on one template is hidden on the others,
    // rather than offered as a switch that quietly does nothing.
    document.querySelectorAll('[data-capture-mode]').forEach((row) => {
      row.hidden = row.dataset.captureMode !== mode;
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
      '<input data-k="a" type="text" class="input" placeholder="Title" />' +
      '<input data-k="b" type="text" class="input' + (isFeature ? '' : ' mono') + '" placeholder="' +
        (isFeature ? 'Description (optional)' : 'https://...') + '" />' +
      '<button type="button" class="btn btn-icon btn-quiet" data-remove-row aria-label="Remove row">' + DELETE_ROW_ICON + '</button>';
    row.querySelector('[data-k="a"]').value = value.title || '';
    row.querySelector('[data-k="b"]').value = (isFeature ? value.description : value.url) || '';
    row.querySelector('[data-remove-row]').addEventListener('click', () => {
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

  /**
   * Only the forms this template can actually render are stored. An offer
   * switch left on from a previous template would otherwise be saved for a
   * landing page, where the renderer never shows it.
   */
  function collectCapture() {
    const capture = {
      contact: els.captureContact.checked,
      offer: state.mode === 'parking' && els.captureOffer.checked,
      waitlist: state.mode === 'coming-soon' && els.captureWaitlist.checked,
      survey_question: els.captureSurvey.value.trim(),
      consent: els.captureConsent.value.trim(),
    };
    const wanted = capture.contact || capture.offer || capture.waitlist || capture.survey_question;
    return wanted ? capture : undefined;
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
    cfg.capture = collectCapture();
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
    const capture = cfg.capture || {};
    els.captureContact.checked = capture.contact === true;
    els.captureOffer.checked = capture.offer === true;
    // "notify" is what the coming-soon waitlist was called before capture existed.
    els.captureWaitlist.checked = capture.waitlist === true || cfg.notify === true;
    els.captureSurvey.value = capture.survey_question || '';
    els.captureConsent.value = capture.consent || '';
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
    if (!record || !record.updatedAt) { els.meta.textContent = 'New page - not saved yet.'; return; }
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
    els.dirtyState.className = 'badge ' + (state.isDirty ? 'badge-warning badge-pulse' : 'badge-success');
    els.openBtn.disabled = !state.current;
    els.deleteBtn.disabled = !state.current;
  }

  // ---- Live preview via debounced POST + iframe.srcdoc ----
  let renderTimer = null;
  let renderInFlight = false;
  function setPreviewState(text, variant) {
    els.status.textContent = text;
    els.previewBadge.className = 'badge badge-' + variant + (variant === 'warning' ? ' badge-pulse' : '');
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
      ', and every message its forms collected. You can undo the page itself until you dismiss the notice.';
    els.deleteDialog.showModal();
  }

  async function deleteCurrent() {
    if (!state.current) return;
    const hostname = state.current;
    const record = { hostname, mode: state.mode, config: { ...state.fullConfig } };
    const res = await fetch(BASE + '/api/domains/' + encodeURIComponent(hostname), { method: 'DELETE' });
    if (!res.ok) { toast('Not deleted - nothing was changed', true); return; }
    state.current = null;
    await loadDomains();
    newDomain();
    showUndo(hostname, record);
    state.inboxLoaded = false;
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
    els.presets.replaceChildren();
    if (!presets.length) {
      const note = document.createElement('p');
      note.className = 'help';
      note.textContent = 'No presets configured.';
      els.presets.appendChild(note);
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

  // ---- Inbox ----------------------------------------------------------------
  const KIND_LABEL = { contact: 'Message', offer: 'Offer', waitlist: 'Waitlist', survey: 'Survey' };
  const STATUS_TABS = [
    ['open', 'Open'],
    ['new', 'Unread'],
    ['archived', 'Archived'],
    ['spam', 'Spam'],
    ['all', 'Everything'],
  ];

  function inboxQuery(extra = {}) {
    const params = new URLSearchParams();
    const filters = { ...state.inbox, ...extra };
    params.set('status', filters.status);
    if (filters.kind) params.set('kind', filters.kind);
    if (filters.hostname) params.set('hostname', filters.hostname);
    if (filters.q) params.set('q', filters.q);
    return params.toString();
  }

  function relativeTime(seconds) {
    const elapsed = Math.max(0, Date.now() - Number(seconds) * 1000);
    if (elapsed < 60000) return 'just now';
    if (elapsed < 3600000) return Math.floor(elapsed / 60000) + 'm ago';
    if (elapsed < 86400000) return Math.floor(elapsed / 3600000) + 'h ago';
    return Math.floor(elapsed / 86400000) + 'd ago';
  }

  function utc(seconds) {
    if (!seconds) return '-';
    return new Date(Number(seconds) * 1000).toISOString().replace(/\\.\\d{3}Z$/, 'Z');
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  /** The one line a reader scans. Built as nodes - none of it is our text. */
  function previewNodes(item) {
    const nodes = [];
    if (item.kind === 'offer') {
      if (item.offerAmount) nodes.push(el('b', null, item.offerAmount), document.createTextNode(' - '));
      nodes.push(document.createTextNode(item.message || 'No message'));
    } else if (item.kind === 'survey') {
      nodes.push(document.createTextNode(item.answer || ''));
    } else if (item.kind === 'waitlist') {
      nodes.push(document.createTextNode('Joined the waitlist'));
    } else {
      if (item.subject) nodes.push(el('b', null, item.subject), document.createTextNode(' - '));
      nodes.push(document.createTextNode(item.message || ''));
    }
    return nodes;
  }

  function bodyText(item) {
    if (item.kind === 'survey') return item.answer || '';
    if (item.kind === 'waitlist') return 'This address asked to be told when the domain goes live.';
    return item.message || '';
  }

  function actionButton(label, glyph, handler, extra) {
    const button = el('button', 'btn btn-sm' + (extra ? ' ' + extra : ''));
    button.type = 'button';
    button.innerHTML = glyph;
    button.append(document.createTextNode(' ' + label));
    button.addEventListener('click', handler);
    return button;
  }

  const INBOX_ICONS = ${serializeForScript({
    mail: icon("mail", { size: 16 }),
    read: icon("mail-opened", { size: 16 }),
    archive: icon("archive", { size: 16 }),
    spam: icon("ban", { size: 16 }),
    inbox: icon("inbox", { size: 16 }),
    trash: icon("trash", { size: 16 }),
  })};

  function messageRow(item) {
    const details = el('details', 'msg');
    details.dataset.status = item.status;

    const summary = document.createElement('summary');
    summary.append(el('span', 'msg-mark'));
    summary.append(el('span', 'msg-from', item.name ? item.name + ' · ' + (item.email || 'no address') : (item.email || 'Anonymous')));
    const preview = el('span', 'msg-preview');
    preview.append(...previewNodes(item));
    summary.append(preview);
    const meta = el('span', 'msg-meta');
    meta.append(el('span', 'badge badge-plain', KIND_LABEL[item.kind] || item.kind));
    meta.append(el('span', 'mono', item.hostname));
    meta.append(el('span', null, relativeTime(item.createdAt)));
    summary.append(meta);
    details.append(summary);

    const body = el('div', 'msg-body');
    body.append(el('p', 'msg-text', bodyText(item) || 'No message body.'));

    const facts = el('dl', 'kv-list');
    const fact = (key, value) => { facts.append(el('dt', null, key), el('dd', null, value)); };
    fact('Received', utc(item.createdAt));
    fact('Domain', item.hostname);
    fact('Type', KIND_LABEL[item.kind] || item.kind);
    if (item.email) fact('Email', item.email);
    if (item.offerAmount) fact('Offer', item.offerAmount);
    if (item.consent) fact('Consent', 'Given with this submission');
    body.append(facts);

    const actions = el('div', 'msg-actions');
    if (item.email) {
      const subject = item.subject || (item.kind === 'offer'
        ? 'Your offer for ' + item.hostname
        : 'Re: ' + item.hostname);
      const reply = el('a', 'btn btn-sm btn-primary');
      reply.href = 'mailto:' + encodeURIComponent(item.email) + '?subject=' + encodeURIComponent(subject);
      reply.innerHTML = INBOX_ICONS.mail;
      reply.append(document.createTextNode(' Reply'));
      actions.append(reply);
    }
    // Only the moves that make sense from where this message already is.
    const moves = item.status === 'new'
      ? [['read', 'Mark read', INBOX_ICONS.read, ''], ['archived', 'Archive', INBOX_ICONS.archive, ''], ['spam', 'Spam', INBOX_ICONS.spam, 'btn-danger-ghost']]
      : item.status === 'read'
        ? [['new', 'Mark unread', INBOX_ICONS.mail, ''], ['archived', 'Archive', INBOX_ICONS.archive, ''], ['spam', 'Spam', INBOX_ICONS.spam, 'btn-danger-ghost']]
        : item.status === 'archived'
          ? [['read', 'Move to inbox', INBOX_ICONS.inbox, ''], ['spam', 'Spam', INBOX_ICONS.spam, 'btn-danger-ghost']]
          : [['read', 'Not spam', INBOX_ICONS.inbox, '']];
    moves.forEach(([status, label, glyph, extra]) => {
      actions.append(actionButton(label, glyph, () => setInboxStatus([item.id], status), extra));
    });
    actions.append(actionButton('Delete', INBOX_ICONS.trash, () => deleteMessage(item), 'btn-danger-ghost'));
    body.append(actions);

    details.append(body);
    return details;
  }

  function renderStatusTabs(counts) {
    els.inboxTabs.replaceChildren();
    STATUS_TABS.forEach(([value, label]) => {
      const tab = el('button', 'filter-tab', label);
      tab.type = 'button';
      if (state.inbox.status === value) tab.setAttribute('aria-current', 'page');
      const count = value === 'all'
        ? Object.values(counts.status || {}).reduce((sum, n) => sum + n, 0)
        : value === 'open' ? counts.open : (counts.status || {})[value];
      if (Number.isFinite(count)) tab.append(el('span', 'filter-count', String(count)));
      tab.addEventListener('click', () => {
        state.inbox.status = value;
        loadInbox();
      });
      els.inboxTabs.append(tab);
    });
  }

  function renderHostnameOptions(hostnames) {
    const current = state.inbox.hostname;
    els.inboxHostname.replaceChildren();
    const all = document.createElement('option');
    all.value = '';
    all.textContent = 'All domains';
    els.inboxHostname.append(all);
    hostnames.forEach((row) => {
      const option = document.createElement('option');
      option.value = row.hostname;
      option.textContent = row.hostname + ' (' + row.count + ')';
      els.inboxHostname.append(option);
    });
    els.inboxHostname.value = current;
  }

  async function loadInbox() {
    const query = inboxQuery();
    const res = await fetch(BASE + '/api/inbox?' + query);
    if (!res.ok) { toast('Could not load the inbox', true); return; }
    const data = await res.json();
    state.inboxLoaded = true;
    els.inboxExport.href = BASE + '/api/inbox.csv?' + query;

    renderStatusTabs(data.counts || {});
    renderHostnameOptions(data.hostnames || []);

    const unread = (data.counts && data.counts.status && data.counts.status.new) || 0;
    els.inboxUnread.textContent = String(unread);
    els.inboxUnread.hidden = unread === 0;
    els.inboxReadAll.disabled = unread === 0;

    els.inboxList.replaceChildren(...(data.submissions || []).map(messageRow));
    const hasRows = (data.submissions || []).length > 0;
    els.inboxList.hidden = !hasRows;
    els.inboxEmpty.hidden = hasRows;
    if (!hasRows && (state.inbox.q || state.inbox.kind || state.inbox.hostname || state.inbox.status !== 'open')) {
      els.inboxEmpty.querySelector('.empty-state-title').textContent = 'Nothing matches';
      els.inboxEmpty.querySelector('.empty-state-body').textContent = 'No message matches this filter. Try “Everything”, or clear the search.';
    }
  }

  async function setInboxStatus(ids, status) {
    const res = await fetch(BASE + '/api/inbox', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ids, status }),
    });
    if (!res.ok) { toast('Could not update the message', true); return; }
    await loadInbox();
  }

  async function markAllRead() {
    const res = await fetch(BASE + '/api/inbox?' + inboxQuery({ status: 'new' }));
    if (!res.ok) { toast('Could not update the inbox', true); return; }
    const data = await res.json();
    const ids = (data.submissions || []).map((item) => item.id);
    if (!ids.length) return;
    await setInboxStatus(ids, 'read');
    toast('Marked ' + ids.length + ' read');
  }

  async function deleteMessage(item) {
    const res = await fetch(BASE + '/api/inbox/' + encodeURIComponent(item.id), { method: 'DELETE' });
    if (!res.ok) { toast('Could not delete the message', true); return; }
    toast('Deleted');
    await loadInbox();
  }

  function setView(view) {
    state.view = view;
    document.body.dataset.view = view;
    document.querySelectorAll('[data-view-panel]').forEach((panel) => {
      panel.hidden = panel.dataset.viewPanel !== view;
    });
    document.querySelectorAll('.view-switcher [data-view]').forEach((button) => {
      button.setAttribute('aria-selected', String(button.dataset.view === view));
    });
    if (view === 'inbox' && !state.inboxLoaded) loadInbox();
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

  let searchTimer = null;
  els.inboxSearch.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.inbox.q = els.inboxSearch.value.trim();
      loadInbox();
    }, 250);
  });
  els.inboxHostname.addEventListener('change', () => {
    state.inbox.hostname = els.inboxHostname.value;
    loadInbox();
  });
  els.inboxKind.addEventListener('change', () => {
    state.inbox.kind = els.inboxKind.value;
    loadInbox();
  });
  els.inboxRefresh.addEventListener('click', loadInbox);
  els.inboxReadAll.addEventListener('click', markAllRead);

  document.querySelectorAll('.view-switcher [data-view]').forEach((button) => {
    button.addEventListener('click', () => setView(button.dataset.view));
  });

  window.addEventListener('keydown', (e) => {
    if (state.view !== 'pages') return;
    if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); saveCurrent(); }
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') { e.preventDefault(); if (canDiscardChanges()) newDomain(); }
  });

  document.querySelectorAll('[data-preview-size]').forEach((button) => {
    if (button.tagName !== 'BUTTON') return;
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
    // The unread count is part of the chrome, so the inbox is polled once even
    // when the Pages view is the one on screen.
    loadInbox().catch(() => {});
  })();
`;
