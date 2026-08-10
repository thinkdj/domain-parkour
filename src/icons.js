/**
 * The Tabler outline icons this product uses, inlined as path data.
 *
 * parkour_design_system.html §05 specifies Tabler outline. The webfont is a
 * third-party request the visitor-page CSP forbids and principle 5 rules out,
 * so the handful actually used ship as markup instead of a font. Add an entry
 * only when an icon earns its place - an icon appears only when it adds
 * meaning.
 *
 * Source: Tabler Icons v3 (MIT). 24x24 grid, 2px stroke, round caps/joins.
 */

const PATHS = {
  route: '<path d="M3 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M18 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M5 19h7a4 4 0 0 0 0 -8h-4a4 4 0 0 1 0 -8h8"/>',
  sun: '<path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/><path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7"/>',
  moon: '<path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"/>',
  "external-link": '<path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"/><path d="M11 13l9 -9"/><path d="M15 4h5v5"/>',
  "arrow-back-up": '<path d="M9 14l-4 -4l4 -4"/><path d="M5 10h11a4 4 0 1 1 0 8h-1"/>',
  plus: '<path d="M12 5l0 14"/><path d="M5 12l14 0"/>',
  check: '<path d="M5 12l5 5l10 -10"/>',
  x: '<path d="M18 6l-12 12"/><path d="M6 6l12 12"/>',
  trash: '<path d="M4 7l16 0"/><path d="M10 11l0 6"/><path d="M14 11l0 6"/><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/>',
  "alert-triangle": '<path d="M12 9v4"/><path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z"/><path d="M12 16h.01"/>',
  mail: '<path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z"/><path d="M3 7l9 6l9 -6"/>',
  "mail-opened": '<path d="M3 9l9 -6l9 6v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z"/><path d="M3 9l9 6l9 -6"/>',
  inbox: '<path d="M4 13h4l2 3h4l2 -3h4"/><path d="M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2z"/>',
  archive: '<path d="M3 4m0 1a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1z"/><path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-10"/><path d="M10 12l4 0"/>',
  ban: '<path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M5.7 5.7l12.6 12.6"/>',
  search: '<path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"/><path d="M21 21l-6 -6"/>',
  download: '<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"/><path d="M7 11l5 5l5 -5"/><path d="M12 4l0 12"/>',
  refresh: '<path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4"/><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"/>',
  "brand-x": '<path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/>',
  "brand-facebook": '<path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3"/>',
  "brand-instagram": '<path d="M8 4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4v-8a4 4 0 0 1 4 -4z"/><path d="M12 9a3 3 0 1 0 0 6a3 3 0 0 0 0 -6z"/><path d="M16.5 7.5l0 .01"/>',
  "brand-linkedin": '<path d="M8 11v5"/><path d="M8 8v.01"/><path d="M12 16v-5"/><path d="M16 16v-3a2 2 0 1 0 -4 0"/><path d="M4 7a3 3 0 0 1 3 -3h10a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3h-10a3 3 0 0 1 -3 -3z"/>',
  "brand-github": '<path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5"/>',
};

/**
 * Render one icon. 20px in buttons and lists, 16px inline with text (§05).
 * Always decorative - pair it with a real label or aria-label on the parent.
 */
export function icon(name, { size = 20, cls = "" } = {}) {
  const paths = PATHS[name];
  if (!paths) return "";
  return `<svg${cls ? ` class="${cls}"` : ""} viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}
