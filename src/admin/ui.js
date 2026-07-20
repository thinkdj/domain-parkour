/**
 * Admin SPA — single HTML document with embedded styles and client script.
 * Talks to /_admin_/api/* for domain data and R2 uploads, then POSTs unsaved
 * configs to /_admin_/preview for the live iframe.
 */

import { MODE_DEFAULTS } from "../config.js";

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
};

export function renderAdminUI({ isDefaultCreds, presets } = {}) {
  const presetsJson = JSON.stringify(presets || []);
  const defaultsJson = JSON.stringify(MODE_DEFAULTS);
  const warnDefaultCreds = isDefaultCreds
    ? '<div id="cred-warning" role="status"><span class="warning-mark">!</span><span><strong>Local credentials are active.</strong> Replace <code>admin / admin</code> with <code>ADMIN_USER</code> and <code>ADMIN_PASSWORD</code> secrets before deploying.</span></div>'
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="color-scheme" content="light dark" />
  <title>Domain Parkour — Page Studio</title>
  <style>${ADMIN_CSS}</style>
</head>
<body data-mobile-view="editor">
  <header class="topbar">
    <div class="brand">
      <span class="logo" aria-hidden="true">P</span>
      <span class="brand-copy">
        <span class="brand-name">Domain Parkour</span>
        <span class="brand-subtitle">Page Studio</span>
      </span>
    </div>
    <div class="site-switcher">
      <label class="sr-only" for="domain-picker">Current domain</label>
      <select id="domain-picker" title="Switch domain" aria-label="Current domain"></select>
    </div>
    <div class="topbar-actions">
      <button id="new-btn" class="btn ghost" title="New domain (Ctrl/Command + N)">New page</button>
      <button id="open-btn" class="btn ghost" title="Open live page in a new tab">Open live</button>
      <button id="delete-btn" class="btn danger ghost" title="Delete domain">Delete</button>
      <button id="save-btn" class="btn primary" title="Save (Ctrl/Command + S)">
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
            <p class="eyebrow">Page editor</p>
            <h1>Shape the page</h1>
            <p>Configure the content and review every change live.</p>
          </div>
          <span id="dirty-state" class="status-pill">Saved</span>
        </div>

        <section class="form-section" aria-labelledby="identity-heading">
          <div class="section-heading">
            <span class="section-index">01</span>
            <div>
              <h2 id="identity-heading">Identity</h2>
              <p>Choose the hostname, page type, and visual accent.</p>
            </div>
          </div>

        <div class="field">
          <label for="f-hostname">Hostname</label>
          <input id="f-hostname" type="text" placeholder="example.com" autocomplete="off" spellcheck="false" />
          <p class="hint">Exact host matched by the worker. Use <code>_default</code> for the catch-all page.</p>
        </div>

        <div class="field">
          <label>Page type</label>
          <div class="mode-tabs" role="tablist" aria-label="Page type">
            <button class="mode-tab" data-mode="parking" type="button" role="tab" aria-selected="false">${MODE_SVGS.parking}<span>Parking</span></button>
            <button class="mode-tab" data-mode="coming-soon" type="button" role="tab" aria-selected="false">${MODE_SVGS.comingSoon}<span>Coming soon</span></button>
            <button class="mode-tab" data-mode="landing" type="button" role="tab" aria-selected="false">${MODE_SVGS.landing}<span>Landing</span></button>
            <button class="mode-tab" data-mode="profile" type="button" role="tab" aria-selected="false">${MODE_SVGS.profile}<span>Profile</span></button>
          </div>
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
              <p>Write the message and add details for this page type.</p>
            </div>
          </div>

        <div class="common-content">
          <div class="field">
            <label id="title-label" for="f-title">Headline</label>
            <input id="f-title" type="text" placeholder="Premium Domain For Sale" />
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
              <input id="f-contactEmail" type="email" placeholder="you@example.com" />
            </div>
          </div>
          <div class="field row">
            <div class="col">
              <label for="f-domainAgeYears">Age label</label>
              <input id="f-domainAgeYears" type="text" placeholder="15+" />
            </div>
            <div class="col">
              <label for="f-domainExtension">Extension value</label>
              <input id="f-domainExtension" type="text" placeholder=".com" />
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
              <input id="f-launchDate" type="datetime-local" />
            </div>
          </div>
          <div class="field">
            <label>Feature highlights <span class="muted">Optional</span></label>
            <div id="features-list" class="repeater"></div>
            <button type="button" class="btn add-button small" data-add="feature">+ Add feature</button>
          </div>
        </div>

        <div data-mode-block="landing" class="mode-block">
          <div class="field">
            <label for="f-subtitle">Subtitle</label>
            <input id="f-subtitle" type="text" placeholder="Used for email and APIs" />
          </div>
          <div class="field">
            <label>Destination links</label>
            <div id="links-list" class="repeater"></div>
            <button type="button" class="btn add-button small" data-add="link">+ Add link</button>
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
            <label>Profile image <span class="muted">PNG, JPEG, WebP, or GIF; up to 5 MB</span></label>
            <div class="avatar-uploader">
              <div id="avatar-preview" class="avatar-preview" aria-hidden="true">?</div>
              <div class="avatar-upload-actions">
                <input id="f-avatarFile" type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden />
                <div class="avatar-buttons">
                  <button id="avatar-upload-btn" type="button" class="btn small">Upload image</button>
                  <button id="avatar-remove-btn" type="button" class="btn small ghost">Remove</button>
                </div>
                <p id="avatar-upload-status" class="hint">Stored privately in the configured R2 bucket.</p>
              </div>
            </div>
          </div>
          <div class="field">
            <label for="f-avatarUrl">Image URL <span class="muted">Uploaded path or external URL</span></label>
            <input id="f-avatarUrl" type="text" placeholder="https://example.com/avatar.jpg" />
          </div>
          <div class="field">
            <label for="f-bio">Bio</label>
            <textarea id="f-bio" rows="3" placeholder="A short bio"></textarea>
          </div>
          <div class="field">
            <label>Featured links</label>
            <div id="profile-links-list" class="repeater"></div>
            <button type="button" class="btn add-button small" data-add="profileLink">+ Add link</button>
          </div>
        </div>

        </section>

        <section class="form-section extras-section" aria-labelledby="extras-heading">
          <div class="section-heading">
            <span class="section-index">03</span>
            <div>
              <h2 id="extras-heading">Finishing touches</h2>
              <p>Optional social, footer, and template settings.</p>
            </div>
          </div>

        <details class="advanced">
          <summary><span>Social links</span><span class="summary-hint">Optional</span></summary>
          <div class="social-grid">
            <label>Twitter / X <input data-social="twitter" type="url" placeholder="https://x.com/handle" /></label>
            <label>LinkedIn <input data-social="linkedin" type="url" placeholder="https://linkedin.com/in/handle" /></label>
            <label>GitHub <input data-social="github" type="url" placeholder="https://github.com/handle" /></label>
            <label>Instagram <input data-social="instagram" type="url" placeholder="https://instagram.com/handle" /></label>
            <label>Facebook <input data-social="facebook" type="url" placeholder="https://facebook.com/handle" /></label>
            <label>Email <input data-social="email" type="text" placeholder="mailto:you@example.com" /></label>
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
              <label>Days label<input data-config-key="daysLabel" type="text" /></label>
              <label>Hours label<input data-config-key="hoursLabel" type="text" /></label>
              <label>Minutes label<input data-config-key="minutesLabel" type="text" /></label>
              <label>Seconds label<input data-config-key="secondsLabel" type="text" /></label>
              <label class="wide">Countdown note<textarea data-config-key="countdownNote" rows="2"></textarea></label>
              <label>Countdown complete<input data-config-key="launchedText" type="text" /></label>
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
          </div>
        </details>

        <details class="advanced">
          <summary><span>Footer</span><span class="summary-hint">Optional</span></summary>
          <div class="field">
            <label for="f-footerText">Custom footer text <span class="muted">Optional</span></label>
            <input id="f-footerText" type="text" placeholder="© 2026 example.com" />
          </div>
          <div class="field">
            <label class="checkbox">
              <span class="switch">
                <input id="f-showCredit" type="checkbox" />
                <span class="switch-track" aria-hidden="true"></span>
              </span>
              <span>Show “Built with Domain Parkour · powered by Cloudflare”</span>
            </label>
          </div>
        </details>

        <details class="advanced">
          <summary><span>Start from a template</span><span class="summary-hint">${presets?.length || 0} available</span></summary>
          <div id="presets" class="presets"></div>
        </details>

        </section>

        <div class="editor-meta"><span class="meta-dot"></span><span class="meta" id="meta"></span></div>
      </div>
    </section>

    <section class="preview" id="preview" data-preview-size="desktop">
      <div class="preview-header">
        <div class="preview-status-wrap">
          <span class="dot live"></span>
          <span id="preview-status">Live preview</span>
        </div>
        <div class="preview-sizes" role="group" aria-label="Preview width">
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
    <div class="dialog-mark" aria-hidden="true">!</div>
    <h2>Delete this page?</h2>
    <p id="delete-message">This removes the saved configuration. The action cannot be undone.</p>
    <div class="dialog-actions">
      <button type="button" class="btn ghost" data-close-dialog>Cancel</button>
      <button type="button" class="btn danger-solid" id="confirm-delete">Delete page</button>
    </div>
  </dialog>

  <div id="toast" class="toast" role="status" aria-live="polite"></div>

  <script>
    window.__PRESETS__ = ${presetsJson};
    window.__MODE_DEFAULTS__ = ${defaultsJson};
  </script>
  <script>${ADMIN_JS}</script>
</body>
</html>`;
}

const ADMIN_CSS = `
  :root {
    /* Signal — Domain Parkour's base theme (parkour_design_system.html).
       Bridging aliases at the end let the canonical template-glyph SVGs
       (template-glyphs.js) be copied in without modification. */
    --bg: #f8f9fb;
    --panel: #ffffff;
    --panel-soft: #f8f9fb;
    --panel-hover: #f1f3f6;
    --ink: #101828;
    --ink-dim: #475467;
    --ink-faint: #98a2b3;
    --line: #e6e8ee;
    --line-strong: #d3d7e0;
    --accent: #e8590c;
    --accent-soft: color-mix(in srgb, var(--accent) 9%, var(--panel));
    --danger: #d92d20;
    --danger-soft: color-mix(in srgb, var(--danger) 10%, var(--panel));
    --good: #079455;
    --warning: #dc6803;
    --radius: 10px;
    --radius-lg: 14px;
    --shadow: 0 16px 40px rgba(16, 24, 40, 0.08);
    --mono: ui-monospace, "JetBrains Mono", SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
    --color-line: var(--line);
    --color-line-strong: var(--line-strong);
    --color-muted: var(--ink-faint);
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #111726;
      --panel: #0d1220;
      --panel-soft: #111726;
      --panel-hover: #161d2e;
      --ink: #f4f6fa;
      --ink-dim: #a9b1c2;
      --ink-faint: #66708a;
      --line: #232b3d;
      --line-strong: #313b55;
      --shadow: 0 20px 50px rgba(0, 0, 0, 0.32);
    }
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; height: 100%; }
  body {
    font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: var(--bg);
    color: var(--ink);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .topbar {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 18px;
    background: var(--panel);
    border-bottom: 1px solid var(--line);
  }
  .brand { display: flex; align-items: center; gap: 10px; }
  .logo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px; height: 26px;
    border-radius: 6px;
    background: var(--accent);
    color: #fff;
    font-weight: 700;
    font-size: 14px;
  }
  .brand-name { font-weight: 600; letter-spacing: -0.01em; }
  .brand-tag {
    font-size: 11px;
    color: var(--ink-dim);
    border: 1px solid var(--line);
    border-radius: 4px;
    padding: 1px 6px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .topbar-actions { display: flex; gap: 8px; align-items: center; }
  select, input, textarea, button {
    font-family: inherit;
    font-size: 13px;
    color: var(--ink);
  }
  select, input[type="text"], input[type="email"], input[type="datetime-local"], textarea {
    background: var(--panel);
    border: 1px solid var(--line-strong);
    border-radius: var(--radius);
    padding: 8px 10px;
    width: 100%;
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }
  select { padding-right: 28px; min-width: 200px; cursor: pointer; }
  input:focus, textarea:focus, select:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }
  textarea { resize: vertical; min-height: 56px; }
  .btn {
    background: var(--panel);
    border: 1px solid var(--line-strong);
    color: var(--ink);
    border-radius: var(--radius);
    padding: 7px 14px;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.12s ease, border-color 0.12s ease, transform 0.08s ease;
  }
  .btn:hover { border-color: var(--accent); }
  .btn:active { transform: translateY(1px); }
  .btn.primary {
    background: var(--accent);
    border-color: var(--accent);
    color: #fff;
  }
  .btn.primary:hover { filter: brightness(1.05); }
  .btn.ghost { background: transparent; }
  .btn.danger { color: var(--danger); border-color: transparent; }
  .btn.danger:hover { background: color-mix(in srgb, var(--danger) 8%, transparent); border-color: var(--danger); }
  .btn.small { padding: 4px 10px; font-size: 12px; }
  #cred-warning {
    background: #fffbeb;
    color: #92400e;
    border-bottom: 1px solid #fde68a;
    padding: 8px 18px;
    font-size: 12px;
  }
  #cred-warning code {
    background: color-mix(in srgb, var(--warning) 12%, transparent);
    padding: 1px 5px;
    border-radius: 3px;
    font-family: var(--mono);
  }
  @media (prefers-color-scheme: dark) {
    #cred-warning code { background: color-mix(in srgb, var(--warning) 18%, transparent); }
  }
  .workspace {
    flex: 1 1 auto;
    display: grid;
    grid-template-columns: minmax(360px, 460px) 1fr;
    overflow: hidden;
  }
  .editor {
    border-right: 1px solid var(--line);
    overflow-y: auto;
    background: var(--bg);
  }
  .editor-inner {
    padding: 22px 22px 80px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .field { display: flex; flex-direction: column; gap: 6px; }
  .field.row { flex-direction: row; gap: 12px; }
  .field.row .col { flex: 1; display: flex; flex-direction: column; gap: 6px; }
  .field.row .color-col { flex: 0 0 80px; }
  label {
    font-size: 12px;
    font-weight: 600;
    color: var(--ink-dim);
    letter-spacing: 0.01em;
  }
  label.checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-weight: 500;
    color: var(--ink);
  }
  .hint, .muted { color: var(--ink-dim); font-size: 11px; margin: 0; }
  .mode-tabs {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
    background: var(--line);
    padding: 3px;
    border-radius: var(--radius);
  }
  .mode-tab {
    background: transparent;
    border: none;
    padding: 7px 10px;
    border-radius: 5px;
    cursor: pointer;
    color: var(--ink-dim);
    font-weight: 500;
  }
  .mode-tab:hover { color: var(--ink); }
  .mode-tab.active { background: var(--panel); color: var(--ink); box-shadow: var(--shadow); }
  input[type="color"] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 38px;
    border: 1px solid var(--line-strong);
    border-radius: var(--radius);
    padding: 2px;
    background: var(--panel);
    cursor: pointer;
  }
  input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
  input[type="color"]::-webkit-color-swatch { border: none; border-radius: 5px; }
  .mode-block { display: none; flex-direction: column; gap: 16px; }
  .mode-block.active { display: flex; }
  .repeater { display: flex; flex-direction: column; gap: 6px; }
  .repeater-row {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 6px;
  }
  .repeater-row input { font-size: 12px; padding: 6px 8px; }
  .repeater-row .del {
    background: transparent;
    border: 1px dashed var(--line-strong);
    color: var(--ink-dim);
    border-radius: var(--radius);
    cursor: pointer;
    width: 32px;
  }
  .repeater-row .del:hover { color: var(--danger); border-color: var(--danger); border-style: solid; }
  details.advanced {
    border-top: 1px solid var(--line);
    padding-top: 12px;
  }
  details.advanced summary {
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    color: var(--ink-dim);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    list-style: none;
    margin-bottom: 12px;
  }
  details.advanced summary::-webkit-details-marker { display: none; }
  details.advanced summary::before {
    content: '▸ ';
    display: inline-block;
    transition: transform 0.15s ease;
    color: var(--ink-dim);
  }
  details.advanced[open] summary::before { transform: rotate(90deg); }
  .social-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .social-grid label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-weight: 500;
    color: var(--ink);
    font-size: 12px;
  }
  .social-grid input { font-size: 12px; padding: 6px 8px; }
  .presets {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .preset-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 10px;
    border: 1px solid var(--line);
    border-radius: var(--radius);
    cursor: pointer;
    transition: border-color 0.12s ease, background 0.12s ease;
  }
  .preset-row:hover { border-color: var(--accent); background: var(--accent-soft); }
  .preset-row .preset-mode {
    font-size: 11px;
    color: var(--ink-dim);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .meta { font-size: 11px; color: var(--ink-dim); margin-top: 8px; }
  .preview {
    display: flex;
    flex-direction: column;
    background: var(--bg);
    overflow: hidden;
  }
  .preview-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-bottom: 1px solid var(--line);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--ink-dim);
    background: var(--panel);
  }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ink-dim); }
  .dot.live { background: var(--good); box-shadow: 0 0 6px var(--good); }
  .dot.pending { background: var(--warning); }
  iframe {
    flex: 1 1 auto;
    border: none;
    background: #fff;
  }
  .toast {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: var(--ink);
    color: var(--bg);
    padding: 8px 16px;
    border-radius: var(--radius);
    font-size: 12px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.2);
    opacity: 0;
    transition: opacity 0.2s ease, transform 0.2s ease;
    pointer-events: none;
    z-index: 100;
  }
  .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
  .toast.error { background: var(--danger); color: #fff; }
  @media (max-width: 900px) {
    .workspace { grid-template-columns: 1fr; grid-template-rows: 1fr 1fr; }
    .editor { border-right: none; border-bottom: 1px solid var(--line); }
  }

  html { color-scheme: light; }
  @media (prefers-color-scheme: dark) { html { color-scheme: dark; } }
  body {
    font: 14px/1.5 Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    letter-spacing: -0.006em;
  }
  button, input, textarea, select { font: inherit; }
  button, select { -webkit-tap-highlight-color: transparent; }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  .topbar {
    min-height: 68px;
    display: grid;
    grid-template-columns: auto minmax(220px, 1fr) auto;
    gap: 18px;
    padding: 12px 18px;
    position: relative;
    z-index: 20;
    box-shadow: 0 1px rgba(0,0,0,0.02);
  }
  .brand { gap: 11px; min-width: 172px; }
  .logo {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: var(--accent);
    font-size: 13px;
    box-shadow: inset 0 1px rgba(255,255,255,0.15);
  }
  .brand-copy { display: flex; flex-direction: column; line-height: 1.2; }
  .brand-name { font-size: 13px; font-weight: 700; }
  .brand-subtitle { margin-top: 3px; color: var(--ink-faint); font-size: 10px; font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase; }
  .site-switcher { width: min(100%, 420px); justify-self: center; }
  .site-switcher select {
    width: 100%;
    min-width: 0;
    height: 42px;
    background: var(--panel-soft);
    border-color: var(--line);
    font-weight: 600;
  }
  .topbar-actions { gap: 7px; }
  .btn {
    min-height: 38px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    padding: 8px 13px;
    border-color: var(--line);
    border-radius: 10px;
    font-size: 12px;
    font-weight: 650;
  }
  .btn:hover { border-color: var(--line-strong); background: var(--panel-hover); }
  .btn:focus-visible,
  .mode-tab:focus-visible,
  .preview-sizes button:focus-visible,
  .mobile-view-switcher button:focus-visible,
  summary:focus-visible,
  .preset-row:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--accent) 30%, transparent);
    outline-offset: 2px;
  }
  .btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
  .btn.primary { box-shadow: 0 7px 18px color-mix(in srgb, var(--accent) 20%, transparent), inset 0 1px rgba(255,255,255,0.16); }
  .btn.primary:hover { background: var(--accent); border-color: var(--accent); }
  .btn.primary:disabled {
    background: var(--panel-hover);
    border-color: var(--line);
    color: var(--ink-faint);
    box-shadow: none;
    opacity: 1;
  }
  .btn.primary kbd {
    padding: 2px 5px;
    border: 1px solid rgba(255,255,255,0.22);
    border-radius: 5px;
    background: rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.76);
    font: 9px/1.3 var(--mono);
  }
  .btn.add-button {
    width: max-content;
    margin-top: 2px;
    border-style: dashed;
    background: transparent;
    color: var(--ink-dim);
  }
  .btn.danger { color: var(--danger); }
  .btn.danger-solid { background: var(--danger); border-color: var(--danger); color: #fff; }
  .btn.danger-solid:hover { filter: brightness(1.05); background: var(--danger); border-color: var(--danger); }
  #cred-warning {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 18px;
    background: color-mix(in srgb, var(--warning) 10%, var(--panel));
    border-bottom-color: color-mix(in srgb, var(--warning) 28%, var(--line));
    color: color-mix(in srgb, var(--warning) 78%, var(--ink));
  }
  .warning-mark {
    width: 20px;
    height: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    border-radius: 50%;
    background: var(--warning);
    color: #fff;
    font-weight: 800;
  }
  .mobile-view-switcher { display: none; }
  .workspace { grid-template-columns: minmax(480px, 540px) minmax(0, 1fr); }
  .editor { background: var(--bg); scrollbar-width: thin; scrollbar-color: var(--line-strong) transparent; }
  .editor-inner { max-width: 540px; margin: 0 auto; padding: 32px 28px 56px; gap: 18px; }
  .editor-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 2px 2px 8px;
  }
  .eyebrow {
    margin: 0 0 7px;
    color: var(--accent);
    font-size: 10px;
    font-weight: 750;
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }
  .editor-heading h1 { margin: 0; font-size: 24px; line-height: 1.2; letter-spacing: -0.04em; }
  .editor-heading p:not(.eyebrow) { max-width: 350px; margin: 8px 0 0; color: var(--ink-dim); font-size: 12px; }
  .status-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 2px;
    padding: 5px 9px;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: var(--panel);
    color: var(--ink-faint);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .status-pill::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--good); }
  .status-pill.dirty { color: var(--warning); border-color: color-mix(in srgb, var(--warning) 30%, var(--line)); background: color-mix(in srgb, var(--warning) 7%, var(--panel)); }
  .status-pill.dirty::before { background: var(--warning); }
  .form-section {
    display: flex;
    flex-direction: column;
    gap: 17px;
    padding: 22px;
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    background: var(--panel);
    box-shadow: 0 1px 1px rgba(0,0,0,0.015);
  }
  .section-heading { display: flex; align-items: flex-start; gap: 12px; padding-bottom: 2px; }
  .section-index {
    width: 26px;
    height: 26px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    border-radius: 8px;
    background: var(--accent-soft);
    color: var(--accent);
    font-size: 9px;
    font-weight: 750;
    font-variant-numeric: tabular-nums;
  }
  .section-heading h2 { margin: 0; font-size: 14px; letter-spacing: -0.015em; }
  .section-heading p { margin: 3px 0 0; color: var(--ink-faint); font-size: 11px; }
  .field { gap: 7px; }
  .field.row { gap: 10px; }
  .field.row .color-col { flex-basis: 88px; }
  label { color: var(--ink-dim); font-size: 11px; font-weight: 650; }
  .hint, .muted { color: var(--ink-faint); font-size: 10px; line-height: 1.5; }
  .muted { margin-left: 4px; font-weight: 500; }
  .hint code { padding: 1px 4px; border-radius: 4px; background: var(--panel-hover); color: var(--ink-dim); font-family: var(--mono); }
  select,
  input:not([type="color"]):not([type="checkbox"]),
  textarea {
    min-height: 42px;
    padding: 9px 11px;
    border-color: var(--line-strong);
    border-radius: 10px;
    background: var(--panel-soft);
    color: var(--ink);
  }
  input::placeholder, textarea::placeholder { color: var(--ink-faint); opacity: 0.72; }
  textarea { min-height: 76px; line-height: 1.55; }
  input:focus, textarea:focus, select:focus { background: var(--panel); }
  .mode-tabs { gap: 5px; padding: 5px; border-radius: 13px; background: var(--panel-hover); }
  .mode-tab {
    min-height: 78px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 9px 6px;
    border-radius: 10px;
    font-size: 10px;
    font-weight: 650;
    line-height: 1.15;
  }
  /* Neutral by design (see parkour_design_system.html §05): the glyph never
     recolors on hover/active. The tab's own background/shadow and the label
     text below carry the selected state instead. */
  .mode-tab .mode-glyph {
    width: min(72px, 100%);
    height: auto;
    transition: transform 0.16s ease;
  }
  .mode-tab.active { background: var(--panel); color: var(--ink); box-shadow: 0 2px 7px rgba(0,0,0,0.08); }
  .mode-tab.active .mode-glyph { transform: translateY(-1px); }
  .mode-tab.active span { color: var(--accent); }
  input[type="color"] { height: 42px; border-color: var(--line-strong); border-radius: 10px; background: var(--panel-soft); }
  input[type="color"]::-webkit-color-swatch { border-radius: 7px; }
  /* The domain is the hero: the hostname is the one machine-readable value
     in this form, so it renders in the mono role (see design principle
     "mono for machine truth"). */
  #f-hostname { font-family: var(--mono); letter-spacing: -0.01em; }
  .common-content { display: flex; flex-direction: column; gap: 17px; }
  .common-content.is-hidden { display: none; }
  .mode-block { gap: 17px; }
  .avatar-uploader { display: flex; align-items: center; gap: 14px; }
  .avatar-preview {
    width: 68px;
    height: 68px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    overflow: hidden;
    border: 1px solid var(--line-strong);
    border-radius: 50%;
    background: var(--panel-soft);
    color: var(--ink-faint);
    font-size: 18px;
    font-weight: 700;
  }
  .avatar-preview img { width: 100%; height: 100%; object-fit: cover; }
  .avatar-upload-actions { min-width: 0; display: flex; flex-direction: column; gap: 7px; }
  .avatar-buttons { display: flex; flex-wrap: wrap; gap: 7px; }
  .copy-settings { margin: 14px; }
  .copy-block { display: none; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 11px; }
  .copy-block.active { display: grid; }
  .copy-block label { min-width: 0; display: flex; flex-direction: column; gap: 6px; }
  .copy-block .wide { grid-column: 1 / -1; }
  .repeater { gap: 8px; }
  .repeater-row { grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr) 36px; gap: 7px; }
  .repeater-row input { min-width: 0; font-size: 11px; }
  .repeater-row .del { width: 36px; border-style: solid; border-color: var(--line); border-radius: 9px; font-size: 18px; }
  .repeater-row .del:hover { background: var(--danger-soft); }
  .extras-section { gap: 10px; }
  details.advanced { padding: 0; border: 1px solid var(--line); border-radius: 11px; background: var(--panel-soft); overflow: hidden; }
  details.advanced summary {
    min-height: 46px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin: 0;
    padding: 11px 13px;
    color: var(--ink);
    font-size: 11px;
    font-weight: 650;
    letter-spacing: 0;
    text-transform: none;
  }
  details.advanced summary::before { display: none; }
  details.advanced summary::after { content: '+'; color: var(--ink-faint); font-size: 17px; font-weight: 400; order: 3; }
  details.advanced[open] summary::after { content: '−'; }
  details.advanced[open] summary { border-bottom: 1px solid var(--line); background: var(--panel); }
  .summary-hint { margin-left: auto; color: var(--ink-faint); font-size: 9px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
  details.advanced > .field,
  details.advanced > .social-grid,
  details.advanced > .presets { margin: 14px; }
  details.advanced > .field + .field { margin-top: 0; }
  .social-grid { gap: 10px; }
  .social-grid label { color: var(--ink-dim); font-size: 10px; }
  label.checkbox { min-height: 38px; gap: 10px; color: var(--ink); }
  .switch { position: relative; display: inline-flex; flex: 0 0 auto; width: 38px; height: 22px; }
  .switch input { position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; opacity: 0; cursor: pointer; }
  .switch-track {
    position: absolute; inset: 0;
    border-radius: 999px;
    background: var(--line-strong);
    transition: background-color 0.15s ease;
  }
  .switch-track::after {
    content: '';
    position: absolute; top: 2px; left: 2px;
    width: 18px; height: 18px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);
    transition: transform 0.15s ease;
  }
  .switch input:checked + .switch-track { background: var(--accent); }
  .switch input:checked + .switch-track::after { transform: translateX(16px); }
  .switch input:focus-visible + .switch-track { outline: 2px solid var(--accent); outline-offset: 2px; }
  .presets { gap: 7px; }
  .preset-row {
    width: 100%;
    min-height: 42px;
    padding: 9px 11px;
    background: var(--panel);
    color: var(--ink);
    text-align: left;
  }
  .preset-row:hover { border-color: var(--line-strong); background: var(--panel-hover); }
  .preset-row .preset-mode { font-size: 9px; }
  .editor-meta { display: flex; align-items: center; gap: 8px; padding: 4px 4px 0; }
  .meta-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--good); }
  .meta { margin: 0; color: var(--ink-faint); font-size: 10px; }
  .preview { background: var(--panel-soft); }
  .preview-header {
    min-height: 54px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 9px 16px;
    background: var(--panel);
    font-size: 10px;
    font-weight: 650;
  }
  .preview-status-wrap { display: flex; align-items: center; gap: 8px; }
  .dot { flex: 0 0 auto; }
  .dot.live { box-shadow: 0 0 0 4px color-mix(in srgb, var(--good) 12%, transparent); }
  .dot.pending { box-shadow: 0 0 0 4px color-mix(in srgb, var(--warning) 12%, transparent); }
  .preview-sizes { display: inline-flex; padding: 3px; border-radius: 9px; background: var(--panel-hover); }
  .preview-sizes button,
  .mobile-view-switcher button {
    border: 0;
    border-radius: 7px;
    background: transparent;
    color: var(--ink-faint);
    cursor: pointer;
    font-size: 10px;
    font-weight: 650;
  }
  .preview-sizes button { padding: 6px 9px; }
  .preview-sizes button[aria-pressed="true"],
  .mobile-view-switcher button[aria-selected="true"] { background: var(--panel); color: var(--ink); box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
  .preview-canvas {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    align-items: stretch;
    justify-content: center;
    padding: 20px;
    overflow: auto;
    background-color: var(--bg);
    background-image: radial-gradient(var(--line-strong) 0.6px, transparent 0.6px);
    background-size: 14px 14px;
  }
  .preview-device {
    width: 100%;
    height: 100%;
    min-height: 520px;
    overflow: hidden;
    border: 1px solid var(--line-strong);
    border-radius: 15px;
    background: #fff;
    box-shadow: var(--shadow);
    transition: width 0.24s ease, border-radius 0.24s ease;
  }
  .preview[data-preview-size="mobile"] .preview-device { width: min(390px, 100%); border-radius: 22px; }
  iframe { width: 100%; height: 100%; display: block; }
  .dialog {
    width: min(420px, calc(100vw - 32px));
    padding: 26px;
    border: 1px solid var(--line);
    border-radius: 18px;
    background: var(--panel);
    color: var(--ink);
    box-shadow: 0 28px 80px rgba(0,0,0,0.28);
  }
  .dialog::backdrop { background: rgba(8,9,11,0.58); backdrop-filter: blur(3px); }
  .dialog-mark { width: 36px; height: 36px; display: inline-flex; align-items: center; justify-content: center; border-radius: 10px; background: var(--danger-soft); color: var(--danger); font-weight: 800; }
  .dialog h2 { margin: 18px 0 0; font-size: 20px; letter-spacing: -0.03em; }
  .dialog p { margin: 9px 0 0; color: var(--ink-dim); font-size: 12px; line-height: 1.6; }
  .dialog-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 24px; }
  .toast { bottom: 24px; padding: 10px 15px; border-radius: 10px; background: var(--ink); color: var(--panel); font-size: 11px; font-weight: 650; }

  @media (max-width: 1080px) {
    .workspace { grid-template-columns: minmax(440px, 480px) minmax(0, 1fr); }
    .editor-inner { padding-inline: 22px; }
    .topbar { gap: 12px; }
    .brand { min-width: 150px; }
  }
  @media (max-width: 900px) {
    .topbar { grid-template-columns: auto minmax(180px, 1fr) auto; gap: 10px; }
    .workspace { display: block; overflow: hidden; }
    .editor, .preview { width: 100%; height: 100%; border: 0; }
    .editor-inner { max-width: 640px; }
    .mobile-view-switcher {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3px;
      padding: 3px;
      border-radius: 10px;
      background: var(--panel-hover);
    }
    .mobile-view-switcher button { min-height: 34px; }
    body[data-mobile-view="editor"] .preview { display: none; }
    body[data-mobile-view="preview"] .editor { display: none; }
  }
  @media (max-width: 680px) {
    .topbar { grid-template-columns: auto 1fr; padding: 10px; }
    .brand { min-width: 0; }
    .brand-copy { display: none; }
    .site-switcher { grid-column: 1 / -1; grid-row: 2; width: 100%; }
    .topbar-actions { justify-self: end; gap: 4px; }
    .topbar-actions .btn { min-height: 34px; padding: 7px 9px; font-size: 10px; }
    .btn.primary kbd { display: none; }
    .mobile-view-switcher { grid-row: 3; }
    #cred-warning { padding: 8px 10px; font-size: 10px; }
    .editor-inner { padding: 24px 14px 40px; }
    .form-section { padding: 18px 16px; border-radius: 14px; }
    .field.row { flex-direction: column; }
    .field.row .color-col { flex-basis: auto; }
    .copy-block { grid-template-columns: 1fr; }
    .copy-block .wide { grid-column: auto; }
    .social-grid { grid-template-columns: 1fr; }
    .preview-header { min-height: 48px; }
    .preview-canvas { padding: 10px; }
    .preview-device { min-height: 460px; border-radius: 12px; }
    .repeater-row { grid-template-columns: 1fr 36px; }
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
    iframe: $('preview-frame'),
    preview: $('preview'),
    status: $('preview-status'),
    toast: $('toast'),
    deleteDialog: $('delete-dialog'),
    deleteMessage: $('delete-message'),
    confirmDelete: $('confirm-delete'),
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
    document.querySelectorAll('.mode-tab').forEach((tab) => {
      const active = tab.dataset.mode === mode;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
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
    };
    $('title-label').textContent = labels[mode][0];
    $('description-label').textContent = labels[mode][1];
    scheduleRender();
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

  function addRepeaterRow(container, kind, value = {}) {
    const row = document.createElement('div');
    row.className = 'repeater-row';
    const aPh = kind === 'feature' ? 'Title' : 'Title';
    const bPh = kind === 'feature' ? 'Description (optional)' : 'https://...';
    const aVal = (kind === 'feature' ? value.title : value.title) || '';
    const bVal = (kind === 'feature' ? value.description : value.url) || '';
    row.innerHTML =
      '<input data-k="a" type="text" placeholder="' + aPh + '" />' +
      '<input data-k="b" type="text" placeholder="' + bPh + '" />' +
      '<button type="button" class="del" aria-label="Remove row">&times;</button>';
    row.querySelector('[data-k="a"]').value = aVal;
    row.querySelector('[data-k="b"]').value = bVal;
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
        const source = blockMode === mode && Object.prototype.hasOwnProperty.call(cfg, key)
          ? cfg
          : defaults;
        input.value = source[key] != null ? source[key] : '';
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

  function avatarInitials() {
    const value = els.name.value.trim() || els.domainTitle.value.trim() || '?';
    return value.split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join('').toUpperCase();
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
    els.avatarUploadStatus.textContent = 'Uploading image...';
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
    // types) so switching the mode tab never drops previously filled-in data.
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
    Object.keys(cfg).forEach((k) => cfg[k] === undefined && delete cfg[k]);
    state.fullConfig = cfg;
    return cfg;
  }

  function applyConfig(record) {
    const cfg = (record && record.config) || {};
    const mode = (record && record.mode) || cfg.mode || 'landing';
    const defaults = MODE_DEFAULTS[mode] || {};
    state.fullConfig = { ...cfg, mode };
    els.hostname.value = (record && record.hostname) || '';
    els.domainTitle.value = cfg.domainTitle || '';
    els.title.value = cfg.title || '';
    els.description.value = cfg.description || '';
    els.accentColor.value = cfg.accentColor || '#e8590c';
    els.salePrice.value = cfg.salePrice || '';
    els.contactEmail.value = cfg.contactEmail || '';
    els.domainAgeYears.value = cfg.domainAgeYears || '';
    els.domainExtension.value = cfg.domainExtension || '';
    els.domainRegistration.value = cfg.domainRegistration || '';
    els.tagline.value = cfg.tagline || '';
    els.launchDate.value = cfg.launchDate ? cfg.launchDate.slice(0, 16) : '';
    els.subtitle.value = cfg.subtitle || '';
    els.name.value = cfg.name || '';
    els.role.value = Object.prototype.hasOwnProperty.call(cfg, 'role') ? cfg.role : (defaults.role || '');
    els.avatarUrl.value = cfg.avatarUrl || '';
    state.avatarObjectKey = cfg.avatarObjectKey || null;
    els.bio.value = cfg.bio || '';
    els.footerText.value = Object.prototype.hasOwnProperty.call(cfg, 'footerText')
      ? cfg.footerText
      : (defaults.footerText || '');
    els.showCredit.checked = cfg.showCredit !== false;
    applyCopySettings(mode, cfg);
    renderFeatures(cfg.features);
    renderLinks(mode === 'profile' ? [] : cfg.links);
    renderProfileLinks(mode === 'profile' ? cfg.links : []);
    const social = cfg.socialLinks || {};
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
    if (!record || !record.updatedAt) { els.meta.textContent = 'New page — not saved yet'; return; }
    const upd = record.updatedAt ? new Date(record.updatedAt * 1000).toLocaleString() : '—';
    els.meta.textContent = 'Last saved ' + upd;
  }

  function markDirty() {
    state.isDirty = true;
    updateSaveButton();
  }
  function updateSaveButton() {
    els.saveLabel.textContent = state.isDirty ? 'Save changes' : 'Saved';
    els.saveBtn.disabled = !state.isDirty;
    els.dirtyState.textContent = state.isDirty ? 'Unsaved' : 'Saved';
    els.dirtyState.classList.toggle('dirty', state.isDirty);
    els.openBtn.disabled = !state.current;
    els.deleteBtn.disabled = !state.current;
  }

  // ---- Live preview via debounced POST + iframe.srcdoc ----
  let renderTimer = null;
  let renderInFlight = false;
  function scheduleRender() {
    els.status.textContent = 'Updating preview…';
    document.querySelector('.dot').classList.remove('live');
    document.querySelector('.dot').classList.add('pending');
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
      els.status.textContent = 'Live preview';
      document.querySelector('.dot').classList.remove('pending');
      document.querySelector('.dot').classList.add('live');
    } catch (e) {
      els.status.textContent = 'Preview unavailable';
      console.error(e);
    } finally {
      renderInFlight = false;
    }
  }

  function rgbFromHex(hex) {
    const match = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex || '');
    return match
      ? parseInt(match[1], 16) + ', ' + parseInt(match[2], 16) + ', ' + parseInt(match[3], 16)
      : '59, 130, 246';
  }

  function syncPreviewAccent() {
    const accent = els.accentColor.value || '#e8590c';
    try {
      const doc = els.iframe.contentDocument;
      if (!doc) return;
      doc.documentElement.style.setProperty('--accent-color', accent);
      doc.documentElement.style.setProperty('--accent-color-rgb', rgbFromHex(accent));
      const themeColor = doc.querySelector('meta[name="theme-color"]');
      if (themeColor) themeColor.setAttribute('content', accent);
    } catch {
      // The debounced render still produces the correct HTML if the iframe is not readable yet.
    }
  }

  // ---- Data loading ----
  async function loadDomains() {
    const res = await fetch(BASE + '/api/domains');
    if (!res.ok) { toast('Failed to load domains', true); return; }
    const data = await res.json();
    state.domains = data.domains || [];
    refreshPicker();
  }

  function refreshPicker() {
    els.picker.innerHTML = '';
    if (state.domains.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = '— no domains yet —';
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
    if (!res.ok) { toast('Failed to load ' + hostname, true); return; }
    const data = await res.json();
    state.current = hostname;
    applyConfig(data);
    scheduleRender();
  }

  async function saveCurrent() {
    const hostname = els.hostname.value.trim();
    if (!hostname) { toast('Hostname required', true); return; }
    const cfg = gatherConfig();
    els.saveLabel.textContent = 'Saving…';
    els.saveBtn.disabled = true;
    const res = await fetch(BASE + '/api/domains/' + encodeURIComponent(hostname), {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode: state.mode, config: cfg }),
    });
    if (!res.ok) {
      const t = await res.text();
      toast('Save failed: ' + t, true);
      updateSaveButton();
      return;
    }
    state.current = hostname;
    state.isDirty = false;
    updateSaveButton();
    toast('Saved ' + hostname);
    await loadDomains();
    els.picker.value = hostname;
    const data = await res.json();
    renderMeta(data);
  }

  function requestDelete() {
    if (!state.current) { toast('Save this page before deleting it'); return; }
    els.deleteMessage.textContent = 'This will permanently remove the saved configuration for ' + state.current + '.';
    els.deleteDialog.showModal();
  }

  async function deleteCurrent() {
    if (!state.current) { toast('Nothing to delete'); return; }
    const res = await fetch(BASE + '/api/domains/' + encodeURIComponent(state.current), { method: 'DELETE' });
    if (!res.ok) { toast('Delete failed', true); return; }
    toast('Deleted');
    state.current = null;
    await loadDomains();
    newDomain();
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
    const record = {
      hostname: els.hostname.value || '',
      mode: rest.mode || 'landing',
      config: rest,
    };
    applyConfig(record);
    markDirty();
    scheduleRender();
    toast('Loaded preset: ' + (name || rest.mode));
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
  document.querySelectorAll('.mode-tab').forEach((tab) => {
    tab.addEventListener('click', () => { setMode(tab.dataset.mode); markDirty(); });
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
  document.querySelector('[data-close-dialog]').addEventListener('click', () => els.deleteDialog.close());
  els.openBtn.addEventListener('click', () => {
    if (state.current) {
      window.open('//' + state.current, '_blank');
    } else {
      toast('Save first to open it live');
    }
  });

  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); saveCurrent(); }
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') { e.preventDefault(); if (canDiscardChanges()) newDomain(); }
  });

  document.querySelectorAll('[data-preview-size]').forEach((button) => {
    if (!button.closest('.preview-sizes')) return;
    button.addEventListener('click', () => {
      const size = button.dataset.previewSize;
      els.preview.dataset.previewSize = size;
      document.querySelectorAll('.preview-sizes [data-preview-size]').forEach((item) => {
        item.setAttribute('aria-pressed', String(item.dataset.previewSize === size));
      });
    });
  });

  document.querySelectorAll('[data-mobile-view]').forEach((button) => {
    if (!button.closest('.mobile-view-switcher')) return;
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
