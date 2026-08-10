/**
 * Parkour design tokens — re-exported from the generated design system.
 *
 * The values themselves are no longer authored here. They live in
 * design-system/tokens.css at the workspace root and arrive via
 * ./design-system.js, which `node design-system/sync.mjs` regenerates.
 * design-system.test.mjs pins the contract, so a stale copy fails the build
 * instead of drifting.
 *
 * `--color-primary` is still the one value a page replaces: templates/base.js
 * substitutes the configured accent, and every hover, tint and ring derives
 * from it with color-mix(). That override must land on `:root` — a derived
 * token is computed where it is declared, so setting the accent further down
 * the tree leaves the hovers behind on the old colour.
 *
 * Appearance is `color-scheme` plus `light-dark()`. There is no `.theme-dark`
 * block any more: one declaration per token covers both schemes, which is why
 * pages no longer need a script before first paint to avoid a flash.
 */

import { tokensCss, motionCss, componentsCss } from "./design-system.js";

export const tokens = tokensCss;

/** Motion primitives and the shared component vocabulary — admin only. */
export const motion = motionCss;
export const components = componentsCss;

/**
 * Element defaults for a Parkour document.
 *
 * Focus, selection and the reduced-motion kill switch are NOT here — they are
 * part of the token contract and already ship in `tokens`. Repeating them
 * would be a second copy free to disagree with the first.
 */
export const baseRules = `
* { box-sizing: border-box; }

html, body { margin: 0; }

body {
    font-family: var(--font-sans);
    font-size: 16px;
    line-height: 1.6;
    background: var(--color-surface);
    color: var(--color-body);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, p { margin: 0; }

h1, h2, h3 {
    font-family: var(--font-display);
    color: var(--color-ink);
    letter-spacing: -0.02em;
}

a { color: inherit; }
button, input, select, textarea { font: inherit; color: inherit; }
a, button, select, [role="tab"] { -webkit-tap-highlight-color: transparent; }
`;
