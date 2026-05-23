/**
 * Admin SPA — single HTML document with embedded styles and client script.
 * Talks to /_admin_/api/* for data, and POSTs unsaved configs to
 * /_admin_/preview for the live iframe.
 */

export function renderAdminUI({ isDefaultCreds, presets } = {}) {
  const presetsJson = JSON.stringify(presets || []);
  const warnDefaultCreds = isDefaultCreds
    ? '<div id="cred-warning">Using default credentials <strong>admin / admin</strong>. Set <code>ADMIN_USER</code> and <code>ADMIN_PASSWORD</code> secrets before going to production.</div>'
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Domain Parkour — Admin</title>
  <style>${ADMIN_CSS}</style>
</head>
<body>
  <header class="topbar">
    <div class="brand">
      <span class="logo">▲</span>
      <span class="brand-name">Domain Parkour</span>
      <span class="brand-tag">admin</span>
    </div>
    <div class="topbar-actions">
      <select id="domain-picker" title="Switch domain"></select>
      <button id="new-btn" class="btn ghost" title="New domain (n)">+ New</button>
      <button id="open-btn" class="btn ghost" title="Open in new tab">↗ Open</button>
      <button id="delete-btn" class="btn danger ghost" title="Delete domain">Delete</button>
      <button id="save-btn" class="btn primary" title="Save (⌘S)">Save</button>
    </div>
  </header>

  ${warnDefaultCreds}

  <main class="workspace">
    <section class="editor" id="editor">
      <div class="editor-inner">
        <div class="field">
          <label for="f-hostname">Hostname</label>
          <input id="f-hostname" type="text" placeholder="example.com" autocomplete="off" />
          <p class="hint">Exact host the worker matches against. Use <code>_default</code> for the catch-all.</p>
        </div>

        <div class="field">
          <label>Mode</label>
          <div class="mode-tabs" role="tablist">
            <button class="mode-tab" data-mode="parking" type="button">Parking</button>
            <button class="mode-tab" data-mode="coming-soon" type="button">Coming Soon</button>
            <button class="mode-tab" data-mode="landing" type="button">Landing</button>
            <button class="mode-tab" data-mode="profile" type="button">Profile</button>
          </div>
        </div>

        <div class="field row">
          <div class="col">
            <label for="f-domainTitle">Display name</label>
            <input id="f-domainTitle" type="text" placeholder="My Domain" />
          </div>
          <div class="col color-col">
            <label for="f-accentColor">Accent</label>
            <input id="f-accentColor" type="color" />
          </div>
        </div>

        <div class="field">
          <label for="f-title">Title</label>
          <input id="f-title" type="text" placeholder="Premium Domain For Sale" />
        </div>

        <div class="field">
          <label for="f-description">Description</label>
          <textarea id="f-description" rows="2" placeholder="A short subtitle"></textarea>
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
              <label for="f-domainRegistration">Registration label</label>
              <input id="f-domainRegistration" type="text" placeholder="Registered in 2010" />
            </div>
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
            <label>Features <span class="muted">(title + description per row)</span></label>
            <div id="features-list" class="repeater"></div>
            <button type="button" class="btn ghost small" data-add="feature">+ Add feature</button>
          </div>
        </div>

        <div data-mode-block="landing" class="mode-block">
          <div class="field">
            <label for="f-subtitle">Subtitle</label>
            <input id="f-subtitle" type="text" placeholder="Used for email and APIs" />
          </div>
          <div class="field">
            <label>Links</label>
            <div id="links-list" class="repeater"></div>
            <button type="button" class="btn ghost small" data-add="link">+ Add link</button>
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
            <label for="f-avatarUrl">Avatar URL <span class="muted">(optional — falls back to initials)</span></label>
            <input id="f-avatarUrl" type="url" placeholder="https://…/avatar.jpg" />
          </div>
          <div class="field">
            <label for="f-bio">Bio</label>
            <textarea id="f-bio" rows="3" placeholder="A short bio"></textarea>
          </div>
          <div class="field">
            <label>Links</label>
            <div id="profile-links-list" class="repeater"></div>
            <button type="button" class="btn ghost small" data-add="profileLink">+ Add link</button>
          </div>
        </div>

        <details class="advanced">
          <summary>Social links</summary>
          <div class="social-grid">
            <label>Twitter <input data-social="twitter" type="text" placeholder="https://twitter.com/handle" /></label>
            <label>LinkedIn <input data-social="linkedin" type="text" placeholder="https://linkedin.com/in/handle" /></label>
            <label>GitHub <input data-social="github" type="text" placeholder="https://github.com/handle" /></label>
            <label>Instagram <input data-social="instagram" type="text" placeholder="https://instagram.com/handle" /></label>
            <label>Facebook <input data-social="facebook" type="text" placeholder="https://facebook.com/handle" /></label>
            <label>Email <input data-social="email" type="text" placeholder="mailto:you@example.com" /></label>
          </div>
        </details>

        <details class="advanced">
          <summary>Footer</summary>
          <div class="field">
            <label for="f-footerText">Footer text <span class="muted">(empty = hidden)</span></label>
            <input id="f-footerText" type="text" placeholder="© 2026 example.com" />
          </div>
          <div class="field">
            <label class="checkbox">
              <input id="f-showCredit" type="checkbox" />
              Show "Built with Domain Parkour" credit
            </label>
          </div>
        </details>

        <details class="advanced">
          <summary>Presets / templates</summary>
          <div id="presets" class="presets"></div>
        </details>

        <div class="meta" id="meta"></div>
      </div>
    </section>

    <section class="preview">
      <div class="preview-header">
        <span class="dot live"></span>
        <span id="preview-status">live preview</span>
      </div>
      <iframe id="preview-frame" sandbox="allow-scripts allow-same-origin"></iframe>
    </section>
  </main>

  <div id="toast" class="toast"></div>

  <script>
    window.__PRESETS__ = ${presetsJson};
  </script>
  <script>${ADMIN_JS}</script>
</body>
</html>`;
}

const ADMIN_CSS = `
  :root {
    --bg: #fafaf9;
    --panel: #ffffff;
    --ink: #1f2937;
    --ink-dim: #6b7280;
    --line: #e5e7eb;
    --line-strong: #d1d5db;
    --accent: #3b82f6;
    --accent-soft: #eff6ff;
    --danger: #dc2626;
    --good: #10b981;
    --radius: 8px;
    --shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
    --mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0c0c0d;
      --panel: #161618;
      --ink: #e5e7eb;
      --ink-dim: #9ca3af;
      --line: #1f2024;
      --line-strong: #2a2b30;
      --accent: #3b82f6;
      --accent-soft: rgba(59, 130, 246, 0.12);
      --shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
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
  .btn.danger:hover { background: rgba(220, 38, 38, 0.08); border-color: var(--danger); }
  .btn.small { padding: 4px 10px; font-size: 12px; }
  #cred-warning {
    background: #fffbeb;
    color: #92400e;
    border-bottom: 1px solid #fde68a;
    padding: 8px 18px;
    font-size: 12px;
  }
  #cred-warning code {
    background: rgba(146, 64, 14, 0.1);
    padding: 1px 5px;
    border-radius: 3px;
    font-family: var(--mono);
  }
  @media (prefers-color-scheme: dark) {
    #cred-warning {
      background: rgba(251, 191, 36, 0.08);
      color: #fde68a;
      border-bottom-color: rgba(251, 191, 36, 0.2);
    }
    #cred-warning code { background: rgba(253, 230, 138, 0.12); }
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
  .dot.pending { background: #f59e0b; }
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
`;

const ADMIN_JS = `
  const BASE = '/_admin_';
  const $ = (id) => document.getElementById(id);

  const els = {
    picker: $('domain-picker'),
    newBtn: $('new-btn'),
    saveBtn: $('save-btn'),
    deleteBtn: $('delete-btn'),
    openBtn: $('open-btn'),
    iframe: $('preview-frame'),
    status: $('preview-status'),
    toast: $('toast'),
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
    domainRegistration: $('f-domainRegistration'),
    tagline: $('f-tagline'),
    launchDate: $('f-launchDate'),
    featuresList: $('features-list'),
    subtitle: $('f-subtitle'),
    linksList: $('links-list'),
    name: $('f-name'),
    role: $('f-role'),
    avatarUrl: $('f-avatarUrl'),
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
      tab.classList.toggle('active', tab.dataset.mode === mode);
    });
    document.querySelectorAll('.mode-block').forEach((block) => {
      block.classList.toggle('active', block.dataset.modeBlock === mode);
    });
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
      '<button type="button" class="del" aria-label="Remove">×</button>';
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

  function gatherConfig() {
    const cfg = {
      mode: state.mode,
      domainTitle: els.domainTitle.value.trim() || undefined,
      title: els.title.value.trim() || undefined,
      description: els.description.value.trim() || undefined,
      accentColor: els.accentColor.value,
      footerText: els.footerText.value !== '' ? els.footerText.value : undefined,
      showCredit: els.showCredit.checked,
      socialLinks: collectSocial(),
    };
    if (state.mode === 'parking') {
      cfg.salePrice = els.salePrice.value.trim() || undefined;
      cfg.contactEmail = els.contactEmail.value.trim() || undefined;
      cfg.domainAgeYears = els.domainAgeYears.value.trim() || undefined;
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
      cfg.role = els.role.value.trim() || undefined;
      cfg.avatarUrl = els.avatarUrl.value.trim() || undefined;
      cfg.bio = els.bio.value.trim() || undefined;
      cfg.links = collectRepeater(els.profileLinksList, 'profileLink');
    }
    Object.keys(cfg).forEach((k) => cfg[k] === undefined && delete cfg[k]);
    return cfg;
  }

  function applyConfig(record) {
    const cfg = (record && record.config) || {};
    const mode = (record && record.mode) || cfg.mode || 'landing';
    els.hostname.value = (record && record.hostname) || '';
    els.domainTitle.value = cfg.domainTitle || '';
    els.title.value = cfg.title || '';
    els.description.value = cfg.description || '';
    els.accentColor.value = cfg.accentColor || '#3b82f6';
    els.salePrice.value = cfg.salePrice || '';
    els.contactEmail.value = cfg.contactEmail || '';
    els.domainAgeYears.value = cfg.domainAgeYears || '';
    els.domainRegistration.value = cfg.domainRegistration || '';
    els.tagline.value = cfg.tagline || '';
    els.launchDate.value = cfg.launchDate ? cfg.launchDate.slice(0, 16) : '';
    els.subtitle.value = cfg.subtitle || '';
    els.name.value = cfg.name || '';
    els.role.value = cfg.role || '';
    els.avatarUrl.value = cfg.avatarUrl || '';
    els.bio.value = cfg.bio || '';
    els.footerText.value = cfg.footerText != null ? cfg.footerText : '';
    els.showCredit.checked = cfg.showCredit !== false;
    renderFeatures(cfg.features);
    renderLinks(mode === 'profile' ? [] : cfg.links);
    renderProfileLinks(mode === 'profile' ? cfg.links : []);
    const social = cfg.socialLinks || {};
    document.querySelectorAll('[data-social]').forEach((el) => {
      el.value = social[el.dataset.social] || '';
    });
    setMode(mode);
    renderMeta(record);
    state.isDirty = false;
    updateSaveButton();
  }

  function renderMeta(record) {
    if (!record) { els.meta.textContent = 'New domain — unsaved.'; return; }
    const upd = record.updatedAt ? new Date(record.updatedAt * 1000).toLocaleString() : '—';
    els.meta.textContent = 'Last updated: ' + upd;
  }

  function markDirty() {
    state.isDirty = true;
    updateSaveButton();
  }
  function updateSaveButton() {
    els.saveBtn.textContent = state.isDirty ? 'Save *' : 'Save';
  }

  // ---- Live preview via debounced POST + iframe.srcdoc ----
  let renderTimer = null;
  let renderInFlight = false;
  function scheduleRender() {
    els.status.textContent = 'rendering...';
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
      els.status.textContent = 'live preview';
      document.querySelector('.dot').classList.remove('pending');
      document.querySelector('.dot').classList.add('live');
    } catch (e) {
      els.status.textContent = 'preview failed';
      console.error(e);
    } finally {
      renderInFlight = false;
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
    const res = await fetch(BASE + '/api/domains/' + encodeURIComponent(hostname), {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode: state.mode, config: cfg }),
    });
    if (!res.ok) {
      const t = await res.text();
      toast('Save failed: ' + t, true);
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

  async function deleteCurrent() {
    if (!state.current) { toast('Nothing to delete'); return; }
    if (!confirm('Delete ' + state.current + '?')) return;
    const res = await fetch(BASE + '/api/domains/' + encodeURIComponent(state.current), { method: 'DELETE' });
    if (!res.ok) { toast('Delete failed', true); return; }
    toast('Deleted');
    state.current = null;
    await loadDomains();
    newDomain();
  }

  function newDomain() {
    state.current = null;
    applyConfig({ hostname: '', mode: 'landing', config: { accentColor: '#3b82f6', showCredit: true } });
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
      const row = document.createElement('div');
      row.className = 'preset-row';
      row.innerHTML = '<span>' + (p.name || '(unnamed)') + '</span><span class="preset-mode">' + (p.mode || '') + '</span>';
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
  // Any input/textarea change in the editor triggers re-render
  $('editor').addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
      scheduleRender();
      markDirty();
    }
  });
  els.picker.addEventListener('change', () => loadDomain(els.picker.value));
  els.newBtn.addEventListener('click', newDomain);
  els.saveBtn.addEventListener('click', saveCurrent);
  els.deleteBtn.addEventListener('click', deleteCurrent);
  els.openBtn.addEventListener('click', () => {
    if (state.current) {
      window.open('//' + state.current, '_blank');
    } else {
      toast('Save first to open it live');
    }
  });

  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); saveCurrent(); }
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') { e.preventDefault(); newDomain(); }
  });

  // ---- Boot ----
  (async function init() {
    renderPresets();
    await loadDomains();
    if (state.domains.length) loadDomain(state.domains[0].hostname);
    else newDomain();
  })();
`;
