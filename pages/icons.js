/**
 * The icons a visitor page uses, inlined as path data.
 *
 * The design system specifies Tabler outline. A webfont is a third-party request
 * the page CSP forbids, so the handful actually used ship as markup. The admin's
 * larger set stays in the app that needs it — sun/moon in particular are gone,
 * because visitors now have a shared theme toggle.
 *
 * Source: Tabler Icons v3 (MIT). 24x24 grid, 2px stroke, round caps/joins.
 */

const PATHS = {
  moon: '<path d="M12 3h.39a7.5 7.5 0 0 0 7.92 12.45A9 9 0 1 1 12 3Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m14.66-5.66-.71.71M6.34 17.66l-.7.7m0-12.02.7.7m11.32 11.32.7.7"/>',
  'external-link': '<path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"/><path d="M11 13l9 -9"/><path d="M15 4h5v5"/>',
  mail: '<path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z"/><path d="M3 7l9 6l9 -6"/>',
  'brand-x': '<path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/>',
  'brand-facebook': '<path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3"/>',
  'brand-instagram': '<path d="M8 4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4v-8a4 4 0 0 1 4 -4z"/><path d="M12 9a3 3 0 1 0 0 6a3 3 0 0 0 0 -6z"/><path d="M16.5 7.5l0 .01"/>',
  'brand-linkedin': '<path d="M8 11v5"/><path d="M8 8v.01"/><path d="M12 16v-5"/><path d="M16 16v-3a2 2 0 1 0 -4 0"/><path d="M4 7a3 3 0 0 1 3 -3h10a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3h-10a3 3 0 0 1 -3 -3z"/>',
  'brand-github': '<path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5"/>',
};

/** Always decorative — pair it with a real label or aria-label on the parent. */
export function icon(name, { size = 20, cls = '' } = {}) {
  const paths = PATHS[name];
  if (!paths) return '';
  return `<svg${cls ? ` class="${cls}"` : ''} viewBox="0 0 24 24" width="${size}" height="${size}"`
    + ` fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"`
    + ` stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}
