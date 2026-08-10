import { escapeHtml } from '../pages/index.js';

const MODE_LABELS = {
  parking: 'Parking / for sale',
  coming_soon: 'Coming soon',
  landing: 'Landing',
  profile: 'Profile',
  redirect: 'Redirect',
  maintenance: 'Maintenance',
};

export const DEV_SWITCHER_CSS = `
.dp-dev-switcher{
  position:absolute;top:16px;left:16px;z-index:10;display:flex;align-items:center;gap:8px;
  padding:6px 8px;border:1px solid var(--color-line-strong);border-radius:var(--radius-md);
  background:var(--color-surface);box-shadow:var(--shadow-card);font:500 11px var(--font-mono);
}
.dp-dev-switcher-label{color:var(--color-primary);letter-spacing:.08em;text-transform:uppercase}
.dp-dev-switcher select,.dp-dev-switcher button{
  height:30px;border:1px solid var(--color-line-strong);border-radius:var(--radius-sm);
  background:var(--color-surface);color:var(--color-ink);font:500 12px var(--font-sans);
}
.dp-dev-switcher select{max-width:150px;padding:0 24px 0 8px}
.dp-dev-switcher button{padding:0 10px;background:var(--color-primary);border-color:var(--color-primary);color:#fff;cursor:pointer}
.dp-dev-switcher button:hover{background:var(--color-primary-hover)}
@media(max-width:480px){
  .dp-dev-switcher{top:10px;left:10px;right:10px}
  .dp-dev-switcher select{min-width:0;flex:1;max-width:none}
}`;

export function isLoopbackHost(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1'
    || hostname === '0.0.0.0' || hostname === '[::1]';
}

/** One first-party demo preset per shipped mode, shown only in local development. */
export function devTemplateSwitcher(presets = [], currentMode = '') {
  const seen = new Set();
  const options = presets.map((preset, index) => {
    const mode = String(preset?.mode || '').replace('-', '_');
    if (!MODE_LABELS[mode] || seen.has(mode)) return '';
    seen.add(mode);
    const selected = mode === currentMode ? ' selected' : '';
    return `<option value="${index}"${selected}>${escapeHtml(MODE_LABELS[mode])}</option>`;
  }).join('');
  if (!options) return '';

  return `<div class="dp-dev-switcher" data-dev-switcher>
    <span class="dp-dev-switcher-label">Dev</span>
    <form method="get" action="/">
      <label class="sr-only" for="dp-dev-template">Preview template</label>
      <select id="dp-dev-template" name="preset" aria-label="Preview template">${options}</select>
      <button type="submit">Preview</button>
    </form>
  </div>`;
}

export function addDevTemplateSwitcher(page, hostname, presets) {
  if (!isLoopbackHost(hostname)) return page;
  const switcher = devTemplateSwitcher(presets, page.mode);
  if (!switcher) return page;
  return {
    ...page,
    html: page.html
      .replace('</head>', `<style>${DEV_SWITCHER_CSS}</style></head>`)
      .replace('<main class="dp-page">', `<main class="dp-page">${switcher}`),
  };
}
