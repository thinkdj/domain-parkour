/**
 * Design tokens for the admin.
 *
 * The values are not authored here. They live in design-system/tokens.css and
 * arrive through the `@domainparkour/design-system` workspace package, which inlines the CSS
 * into JS because an admin page must ship no external requests. There is no
 * generated copy inside this app any more, so there is nothing to go stale.
 *
 * The visitor-page stylesheet moved out entirely — it is `pages/src/css.js` now,
 * shared with the hosted runtime. What remains here is the admin's own layer.
 *
 * Appearance is `color-scheme` plus `light-dark()`: one declaration per token
 * covers both schemes, which is why no page needs a script before first paint to
 * avoid a flash of the wrong theme.
 */

import { tokensCss, motionCss, componentsCss } from './design-system.js';

export const tokens = tokensCss;

/** Motion primitives and the shared component vocabulary — admin only. */
export const motion = motionCss;
export const components = componentsCss;

/**
 * Element defaults for an admin document.
 *
 * Focus, selection and the reduced-motion kill switch are NOT here — they are
 * part of the token contract and already ship in `tokens`. Repeating them would
 * be a second copy free to disagree with the first.
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
