/**
 * GENERATED from design-system/*.css by design-system/build.mjs — do not edit.
 */

export const tokensCss = `
/* =============================================================================
 * Domain Parkour — canonical design tokens
 * v2.0.0 · Signal base theme
 *
 * THIS FILE IS THE SOURCE OF TRUTH. Everything visual in the OSS runtime, the
 * Cloud control plane, and the homepage resolves back to a value declared here.
 *
 * Both applications import this source through the workspace build. Change a
 * value here first, then regenerate; never edit generated output by hand.
 *
 *   OSS    → design-system/index.js (inlined in the admin)
 *   Cloud  → cloud/public/assets/tokens.css
 *   Pages  → pages/src/tokens.generated.js
 * ========================================================================== */

:root {
  /* Declaring both schemes is what makes light-dark() resolve. Do not remove. */
  color-scheme: light dark;

  /* ── Brand ─────────────────────────────────────────────────────────────
   * Primary is deliberately ONE flat value, not a light-dark() pair. A page
   * served for a customer's domain replaces this single hex with their accent
   * (see "Retheming" below); a pair would make that contract take two values.
   */
  --color-primary:   #E8590C;                        /* signal orange — actions, links, focus */
  --color-accent:    #2C4FE0;                        /* cobalt — small marks and indices only */

  /* Ink inverts. In light mode this is a near-black chip with white text; in
   * dark mode a near-white chip with black text. Always pair the two.
   * Without this, toasts and solid-dark buttons rendered #101828 on a #0D1220
   * surface — very nearly invisible.
   */
  --color-secondary:    light-dark(#101828, #F4F6FA);
  --color-on-secondary: light-dark(#FFFFFF, #101828);

  /* ── Neutrals ──────────────────────────────────────────────────────────── */
  --color-surface:     light-dark(#FFFFFF, #0D1220);
  --color-surface-2:   light-dark(#F8F9FB, #111726);
  --color-surface-3:   light-dark(#F1F3F6, #161D2E);
  --color-ink:         light-dark(#101828, #F4F6FA);
  --color-body:        light-dark(#475467, #A9B1C2);
  --color-muted:       light-dark(#98A2B3, #66708A);
  --color-line:        light-dark(#E6E8EE, #232B3D);
  --color-line-strong: light-dark(#D3D7E0, #313B55);

  /* ── Semantic ──────────────────────────────────────────────────────────
   * Dark-mode variants are lifted. The light values are AA on white but fall
   * to roughly 2:1 on #0D1220, which is not a legible status colour.
   */
  --color-success: light-dark(#079455, #34C77B);
  --color-warning: light-dark(#DC6803, #F79009);
  --color-danger:  light-dark(#D92D20, #F97066);

  /* The lifted variants above are for TEXT, icons and borders on a dark
   * surface. A filled button needs the opposite: white on the lifted red is
   * about 2.4:1, while white on the saturated red is 4.9:1 in either scheme.
   * So solid fills stay flat and legible; only foreground colours lift.
   */
  --color-danger-solid:  #D92D20;
  --color-success-solid: #079455;

  /* ── Derived — never author these by hand ──────────────────────────────
   * Everything below mixes a base token with ink or surface. Because ink and
   * surface are themselves light-dark(), each of these is automatically
   * correct in both schemes: mixing toward ink darkens on light and brightens
   * on dark, which is the behaviour a hover state wants either way.
   */
  --color-primary-hover:   color-mix(in oklab, var(--color-primary), var(--color-ink) 14%);
  --color-primary-active:  color-mix(in oklab, var(--color-primary), var(--color-ink) 24%);
  --color-primary-soft:    color-mix(in srgb, var(--color-primary) 9%, var(--color-surface));
  --color-primary-ring:    color-mix(in srgb, var(--color-primary) 28%, transparent);
  --color-secondary-hover: color-mix(in oklab, var(--color-secondary), var(--color-surface) 14%);
  --color-accent-soft:     color-mix(in srgb, var(--color-accent) 12%, var(--color-surface));
  --color-success-soft:    color-mix(in srgb, var(--color-success) 11%, var(--color-surface));
  --color-warning-soft:    color-mix(in srgb, var(--color-warning) 11%, var(--color-surface));
  --color-danger-soft:     color-mix(in srgb, var(--color-danger) 10%, var(--color-surface));
  --color-danger-hover:    color-mix(in oklab, var(--color-danger), var(--color-ink) 12%);

  /* ── Type ──────────────────────────────────────────────────────────────
   * Three faces, strict jobs: display for headings, sans for everything,
   * mono for machine truth (hostnames, IDs, keys, code).
   */
  --font-display: "Space Grotesk", Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-sans:    Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-mono:    "JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", ui-monospace, monospace;

  /* ── Radius ────────────────────────────────────────────────────────────
   * Four steps. Previously each repo had its own names for the same numbers
   * (Cloud's "lg" and OSS's "card" were both 14px). These names are canonical.
   */
  --radius-sm: 6px;    /* chips, badges, small inputs */
  --radius-md: 10px;   /* buttons, inputs, most things */
  --radius-lg: 14px;   /* cards, panels, tiles */
  --radius-xl: 20px;   /* hero surfaces, modals */
  --radius-pill: 999px;

  /* ── Elevation ─────────────────────────────────────────────────────────
   * Two shadows only. Borders do the separating; shadow means "floating".
   * light-dark() takes two COLORS, not two shadow values — so the scheme
   * switch lives on the colour component and the geometry stays shared.
   */
  --shadow-color-hair: light-dark(rgba(16, 24, 40, 0.05), rgba(0, 0, 0, 0.35));
  --shadow-color-cast: light-dark(rgba(16, 24, 40, 0.18), rgba(0, 0, 0, 0.55));
  --shadow-color-edge: light-dark(rgba(16, 24, 40, 0.06), rgba(0, 0, 0, 0.40));

  --shadow-card: 0 1px 2px var(--shadow-color-hair);
  --shadow-pop:  0 12px 32px -12px var(--shadow-color-cast),
                 0 2px 6px var(--shadow-color-edge);

  /* ── Motion ────────────────────────────────────────────────────────────
   * One easing, three durations. Only colour, opacity and transform animate.
   */
  --ease:    cubic-bezier(0.2, 0, 0, 1);
  --t-fast:  120ms;   /* hover, focus, small fades */
  --t-base:  160ms;   /* default transitions */
  --t-enter: 220ms;   /* toasts and panels entering */

  /* ── Layering ──────────────────────────────────────────────────────────
   * A 100-step scale so there is always room between two layers. Nothing may
   * use a bare z-index; if a new layer is needed, add it here.
   */
  --z-base:     0;
  --z-sticky:   100;   /* sticky table headers */
  --z-appbar:   200;
  --z-dropdown: 300;   /* menus, popovers, comboboxes */
  --z-overlay:  400;   /* dialog backdrop, undo bar */
  --z-modal:    500;
  --z-toast:    600;   /* always on top; it reports what just happened */

  /* ── Measure ───────────────────────────────────────────────────────────
   * Breakpoints cannot be custom properties — they are listed here as the
   * canonical constants and must be written literally in @media:
   *   sm 560px · md 820px · lg 1120px
   */
  --container:        1120px;  /* app shell and marketing sections */
  --container-narrow: 720px;   /* auth, single-column forms, error pages */
  --container-prose:  68ch;    /* running text; never wider */
}

/* Explicit override beats the OS preference. Setting color-scheme re-resolves
 * every token above; that is the whole theme switch.
 *
 * colour and background are restated deliberately. An inherited \`color\` is a
 * finished value — it does NOT re-resolve when a descendant changes scheme, so
 * a light-themed panel inside a dark page would otherwise inherit near-white
 * text onto white. Harmless when data-theme sits on <html>, wrong the moment
 * anything nests one scheme inside the other, which the docs page does on
 * every component demo.
 */
[data-theme] {
  color: var(--color-ink);
  background-color: var(--color-surface);
}
[data-theme="light"] { color-scheme: light; }
[data-theme="dark"]  { color-scheme: dark; }

/* Retheming, and its one sharp edge.
 *
 * A page rendered for a customer's domain sets a single value:
 *     :root { --color-primary: #0f766e; }
 * and every hover, tint and ring above re-derives from it.
 *
 * That works ONLY because the override lands on the same element the derived
 * tokens are declared on. Setting --color-primary on a descendant does NOT
 * re-derive them — the mixes were already computed at :root and inherit down
 * as finished values, so you get a teal button with an orange hover.
 *
 * To theme a subtree, give it [data-accent] and the derived set is recomputed
 * in that scope.
 */
:root,
[data-accent] {
  --color-primary-hover:  color-mix(in oklab, var(--color-primary), var(--color-ink) 14%);
  --color-primary-active: color-mix(in oklab, var(--color-primary), var(--color-ink) 24%);
  --color-primary-soft:   color-mix(in srgb, var(--color-primary) 9%, var(--color-surface));
  --color-primary-ring:   color-mix(in srgb, var(--color-primary) 28%, transparent);
}

/* ── Global baseline ──────────────────────────────────────────────────────
 * The few rules that are part of the token contract rather than any one
 * component: focus, selection, and the reduced-motion kill switch.
 */
::selection { background: var(--color-primary-ring); }

:where(a, button, input, select, textarea, summary, [tabindex]):focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
    scroll-behavior: auto !important;
  }
}
`;

export const motionCss = `
/* =============================================================================
 * Domain Parkour — motion
 * v2.0.0 · depends on tokens.css
 *
 * One easing, three durations, four things that move. Only colour, opacity and
 * transform animate — never width, height, top or left, which cost layout on
 * every frame and stutter on the low-end phones a parked domain gets visited on.
 *
 * Nothing here loops except the two genuine progress indicators (spinner,
 * skeleton). A UI that is idling should be still.
 *
 * The reduced-motion kill switch lives in tokens.css and neutralises every
 * duration below, so no rule here needs to repeat it.
 * ========================================================================== */

/* ── Keyframes ─────────────────────────────────────────────────────────────
 * Entrances move a short distance and land. No bounce, no overshoot, no
 * parallax: the product is a control plane, not a carousel.
 */
@keyframes pk-fade-in   { from { opacity: 0; } }
@keyframes pk-rise-in   { from { opacity: 0; transform: translateY(-6px); } }
@keyframes pk-lift-in   { from { opacity: 0; transform: translateY(8px); } }
@keyframes pk-pop-in    { from { opacity: 0; transform: scale(0.96); } }
@keyframes pk-toast-in  { from { opacity: 0; transform: translate(-50%, 10px); } }
@keyframes pk-spin      { to   { transform: rotate(360deg); } }
@keyframes pk-pulse     { 50%  { opacity: 0.45; } }

/* ── Entrance utilities ────────────────────────────────────────────────────
 * Attach to something appearing for the first time. \`backwards\` holds frame
 * zero during any delay, otherwise a staggered list flashes fully-opaque
 * before it starts.
 */
.anim-fade { animation: pk-fade-in var(--t-base)  var(--ease) backwards; }
.anim-rise { animation: pk-rise-in var(--t-enter) var(--ease) backwards; }
.anim-lift { animation: pk-lift-in var(--t-enter) var(--ease) backwards; }
.anim-pop  { animation: pk-pop-in  var(--t-base)  var(--ease) backwards; }

/* Stagger for short lists only. Past ~6 items the last row arrives late enough
 * to read as lag rather than choreography, so the scale stops there. */
.anim-delay-1 { animation-delay:  40ms; }
.anim-delay-2 { animation-delay:  80ms; }
.anim-delay-3 { animation-delay: 120ms; }
.anim-delay-4 { animation-delay: 160ms; }
.anim-delay-5 { animation-delay: 200ms; }
.anim-delay-6 { animation-delay: 240ms; }

/* ── Transition utilities ──────────────────────────────────────────────────
 * The three sanctioned durations, wired to the one easing. Components should
 * reach for these rather than writing a transition by hand.
 */
.t-fast  { transition: color var(--t-fast) var(--ease),
                       background-color var(--t-fast) var(--ease),
                       border-color var(--t-fast) var(--ease),
                       opacity var(--t-fast) var(--ease); }
.t-base  { transition: color var(--t-base) var(--ease),
                       background-color var(--t-base) var(--ease),
                       border-color var(--t-base) var(--ease),
                       opacity var(--t-base) var(--ease),
                       transform var(--t-base) var(--ease); }
.t-enter { transition: opacity var(--t-enter) var(--ease),
                       transform var(--t-enter) var(--ease); }

/* ── Spinner ───────────────────────────────────────────────────────────────
 * A ring with one quarter in the foreground colour. currentColor means it is
 * legible on a button, an alert, or a bare surface without a variant each.
 */
.spinner {
  display: inline-block;
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: var(--radius-pill);
  opacity: 0.9;
  animation: pk-spin 700ms linear infinite;
}
.spinner-lg { width: 22px; height: 22px; border-width: 2.5px; }

/* ── Skeleton ──────────────────────────────────────────────────────────────
 * For content whose shape is known and whose data is not. Prefer it to a
 * spinner when you can predict the layout — it avoids the reflow jump.
 * Give every skeleton an explicit height; a zero-height one is invisible.
 */
/* Pulses rather than sweeping a gradient across itself. Principle 5 rules out
 * gradients, and the OSS suite fails a build for one — but the calmer reading
 * is that a travelling highlight is decoration on top of a loading state that
 * a plain opacity pulse already communicates. */
.skeleton {
  border-radius: var(--radius-sm);
  background-color: var(--color-surface-3);
  animation: pk-pulse 1.5s ease-in-out infinite;
}
.skeleton-text { height: 0.7em; margin: 0.25em 0; }
.skeleton-title { height: 1em; width: 42%; }
.skeleton-line-short { width: 60%; }

/* Motion-averse users get a still placeholder; the block itself still says
 * "loading". The spinner keeps turning, only slower — it is the only signal
 * that something is actually in flight, so stopping it would mislead. */
@media (prefers-reduced-motion: reduce) {
  .skeleton { animation: none; opacity: 0.7; }
  .spinner  { animation: pk-spin 1.6s linear infinite; }
}

/* ── Interaction ───────────────────────────────────────────────────────────
 * Press feedback. 1px is enough to feel; more reads as a toy.
 */
.press:active:not(:disabled) { transform: translateY(1px); }

/* A row that reveals its actions on hover. Focus-within is not optional —
 * without it the actions are unreachable by keyboard. */
.reveal { opacity: 0; transition: opacity var(--t-fast) var(--ease); }
:hover > .reveal,
:focus-within > .reveal { opacity: 1; }
@media (hover: none) {
  .reveal { opacity: 1; }   /* touch has no hover; never hide the only affordance */
}
`;

export const componentsCss = `
/* =============================================================================
 * Domain Parkour — component layer
 * v2.0.0 · depends on tokens.css and motion.css
 *
 * The shared vocabulary: everything the OSS admin, the Cloud control plane and
 * the marketing site all need. Class names are deliberately UNPREFIXED and
 * match the names both apps had already converged on (.btn, .card, .alert…),
 * so adopting this file is mostly deleting a duplicate rule, not renaming
 * markup.
 *
 * App-specific components stay in the app. If a thing exists in one product
 * only — plan pickers, zone candidates, health findings — it does not belong
 * here. The test is whether a second product would want it unchanged.
 *
 * Visitor pages are NOT styled from this file. Those documents belong to the
 * domain's owner, use the .dp-* namespace, and ship their own minimal CSS.
 * ========================================================================== */

/* ── Base ────────────────────────────────────────────────────────────────── */
.pk-body {
  margin: 0;
  background: var(--color-surface);
  color: var(--color-body);
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
}
.mono, .machine { font-family: var(--font-mono); }
.muted { color: var(--color-muted); }
.fine  { font-size: 12.5px; }
.lede  { font-size: 15px; line-height: 1.6; color: var(--color-body); }

/* A hostname is machine truth: never truncated, never abbreviated. */
.machine-title {
  font-family: var(--font-mono);
  font-size: 15px;
  color: var(--color-ink);
  word-break: break-all;
}
.eyebrow {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-muted);
}

/* First thing in the tab order, visible only when it has focus. */
.skip-link {
  position: fixed;
  top: 8px;
  left: 8px;
  z-index: var(--z-toast);
  border-radius: var(--radius-md);
  padding: 9px 14px;
  background: var(--color-ink);
  color: var(--color-surface);
  font-size: 13px;
  font-weight: 600;
  transform: translateY(-200%);
}
.skip-link:focus { transform: none; }

/* ── Buttons ─────────────────────────────────────────────────────────────
 * One primary per screen. Labels are verbs. 40px default, 32 small, 44 large.
 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  /* min-height, not height: a label that wraps must grow the button rather
     than overflow it. Both apps had already settled on this. */
  min-height: 40px;
  padding: 8px 16px;
  border: 1px solid var(--color-line-strong);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-ink);
  font: 600 14px/1 var(--font-sans);
  white-space: nowrap;
  /* Links are buttons often enough (nav CTAs, "Read the docs") that the reset
     belongs here rather than at every call site. */
  text-decoration: none;
  cursor: pointer;
  transition: background-color var(--t-fast) var(--ease),
              border-color var(--t-fast) var(--ease),
              color var(--t-fast) var(--ease);
}
.btn:hover:not(:disabled) { background: var(--color-surface-2); }
.btn:active:not(:disabled) { transform: translateY(1px); }
.btn:disabled { opacity: 0.45; cursor: not-allowed; }

.btn-primary {
  border-color: transparent;
  background: var(--color-primary);
  color: #fff;
}
.btn-primary:hover:not(:disabled) { background: var(--color-primary-hover); }
.btn-primary:active:not(:disabled) { background: var(--color-primary-active); }

/* Ink button. Uses the inverting pair, so it is a dark chip on light and a
 * light chip on dark — never invisible against its own surface. */
.btn-ink {
  border-color: transparent;
  background: var(--color-secondary);
  color: var(--color-on-secondary);
}
.btn-ink:hover:not(:disabled) { background: var(--color-secondary-hover); }

.btn-ghost {
  border-color: transparent;
  background: transparent;
  color: var(--color-primary);
}
.btn-ghost:hover:not(:disabled) { background: var(--color-primary-soft); }

/* -solid, not --color-danger: the lifted dark-mode red would put white text at
 * ~2.4:1. Foregrounds lift, fills do not. */
.btn-danger {
  border-color: transparent;
  background: var(--color-danger-solid);
  color: #fff;
}
.btn-danger:hover:not(:disabled) { background: color-mix(in oklab, var(--color-danger-solid), #000 12%); }

.btn-danger-ghost { border-color: transparent; background: transparent; color: var(--color-danger); }
.btn-danger-ghost:hover:not(:disabled) { background: var(--color-danger-soft); }

.btn-sm { min-height: 32px; padding: 6px 12px; font-size: 13px; gap: 6px; }
.btn-lg { min-height: 44px; padding: 11px 20px; font-size: 15px; }
.btn-icon { width: 40px; padding: 0; }
.btn-icon.btn-sm { width: 32px; }
.btn-block { width: 100%; }

/* ── Forms ───────────────────────────────────────────────────────────────
 * Label above, help below, 40px controls. Machine values switch to mono.
 */
.field { display: block; margin-bottom: 18px; }
.label {
  display: block;
  margin-bottom: 6px;
  color: var(--color-ink);
  font-size: 13px;
  font-weight: 500;
}
.label-req::after { content: " *"; color: var(--color-danger); }
.help { margin-top: 6px; color: var(--color-muted); font-size: 13px; }

.input, .textarea, .select {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--color-line-strong);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-ink);
  font: 400 14px/1 var(--font-sans);
  transition: border-color var(--t-fast) var(--ease);
}
.textarea { height: auto; min-height: 84px; padding: 10px 12px; line-height: 1.6; resize: vertical; }
.input::placeholder, .textarea::placeholder { color: var(--color-muted); }
.input:disabled, .textarea:disabled, .select:disabled {
  background: var(--color-surface-2);
  border-color: var(--color-line);
  color: var(--color-muted);
  opacity: 0.72;
  cursor: not-allowed;
  box-shadow: none;
}
.input:disabled::placeholder, .textarea:disabled::placeholder { color: var(--color-muted); }
.input:disabled:focus, .textarea:disabled:focus, .select:disabled:focus {
  outline: none;
}
input[type="checkbox"]:disabled, input[type="radio"]:disabled {
  cursor: not-allowed;
  accent-color: var(--color-line-strong);
}
input[type="color"]:disabled {
  border-color: var(--color-line);
  background: var(--color-surface-2);
  cursor: not-allowed;
  opacity: 0.72;
}
.input.mono, .textarea.mono { font-family: var(--font-mono); font-size: 13px; }

/* The chevron is an inline data: URI so a page can stay request-free. */
.select {
  appearance: none;
  padding-right: 34px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2398A2B3' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}

/* Invalid state is announced by aria-invalid, so style that rather than a
 * class — the two can never disagree. */
.input[aria-invalid="true"], .textarea[aria-invalid="true"], .select[aria-invalid="true"] {
  border-color: var(--color-danger);
}
.field-error {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  color: var(--color-danger);
  font-size: 13px;
  font-weight: 500;
}

/* Affixed input: https:// or a .example.com suffix welded to the control. */
.input-group { display: flex; }
.input-group .input { border-radius: 0; }
.input-group > :first-child { border-top-left-radius: var(--radius-md); border-bottom-left-radius: var(--radius-md); }
.input-group > :last-child  { border-top-right-radius: var(--radius-md); border-bottom-right-radius: var(--radius-md); }
.input-affix {
  display: inline-flex;
  align-items: center;
  padding: 0 12px;
  border: 1px solid var(--color-line-strong);
  background: var(--color-surface-2);
  color: var(--color-muted);
  font: 400 13px/1 var(--font-mono);
  white-space: nowrap;
}
.input-group .input-affix + .input { border-left: 0; }
.input-group .input:has(+ .input-affix) { border-right: 0; }

.search-wrap { position: relative; }
.search-wrap .icon {
  position: absolute;
  top: 50%;
  left: 12px;
  translate: 0 -50%;
  color: var(--color-muted);
  pointer-events: none;
}
.search { padding-left: 36px; }

/* Switch — the control itself is a real checkbox, visually hidden. */
.switch { position: relative; display: inline-flex; flex: 0 0 auto; }
.switch input { position: absolute; inset: 0; opacity: 0; margin: 0; cursor: pointer; }
.switch-track {
  width: 40px;
  height: 24px;
  border-radius: var(--radius-pill);
  background: var(--color-line-strong);
  transition: background-color var(--t-base) var(--ease);
}
.switch-track::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-pill);
  background: #fff;
  box-shadow: var(--shadow-card);
  transition: transform var(--t-base) var(--ease);
}
.switch input:checked + .switch-track { background: var(--color-primary); }
.switch input:checked + .switch-track::after { transform: translateX(16px); }
.switch input:focus-visible + .switch-track { outline: 2px solid var(--color-primary); outline-offset: 2px; }
.switch:has(input:disabled), .switch-row:has(input:disabled), .checkbox-row:has(input:disabled) { cursor: not-allowed; }
.switch input:disabled + .switch-track {
  background: var(--color-line);
  opacity: 0.72;
  cursor: not-allowed;
}
.switch-row:has(input:disabled) .switch-title,
.switch-row:has(input:disabled) .switch-desc,
.checkbox-row:has(input:disabled) { opacity: 0.72; }

/* Switch in a bordered row with a title and description. */
.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  cursor: pointer;
}
.switch-title { display: block; color: var(--color-ink); font-size: 14px; font-weight: 500; }
.switch-desc  { display: block; margin-top: 2px; color: var(--color-muted); font-size: 13px; }

.checkbox-row { display: flex; align-items: flex-start; gap: 10px; cursor: pointer; }
.checkbox-row input { margin-top: 2px; width: 16px; height: 16px; accent-color: var(--color-primary); }

.form-actions { display: flex; align-items: center; gap: 10px; margin-top: 22px; }

/* ── Cards & surfaces ────────────────────────────────────────────────────
 * Border-first. A shadow means the thing floats; it is not decoration.
 */
.card {
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}
.card-pad { padding: 22px; }
.card-actions {
  display: flex;
  gap: 10px;
  border-top: 1px solid var(--color-line);
  padding: 14px 22px;
}
.section-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  color: var(--color-ink);
  font: 600 15px/1.3 var(--font-display);
}

/* List: rows that are not tabular. Hairline between, none at the ends. */
.list-card { border: 1px solid var(--color-line); border-radius: var(--radius-lg); background: var(--color-surface); overflow: hidden; }
.list-row {
  display: flex;
  align-items: center;
  gap: 14px;
  border-top: 1px solid var(--color-line);
  padding: 14px 18px;
}
.list-row:first-child { border-top: 0; }
.list-row-title { color: var(--color-ink); font-size: 14px; font-weight: 500; }

/* Key/value: definition pairs. Grid keeps every value on one column. */
.kv-list { display: grid; grid-template-columns: auto 1fr; gap: 10px 18px; font-size: 13px; }
.kv-list dt { color: var(--color-muted); }
.kv-list dd { margin: 0; color: var(--color-ink); font-family: var(--font-mono); word-break: break-all; }

/* Stat tile. The number is the point, so it gets display type and tabular
 * figures — otherwise a counter ticking 9→10 shifts everything beside it. */
.stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 14px; }
.stat-card { border: 1px solid var(--color-line); border-radius: var(--radius-lg); background: var(--color-surface); padding: 18px 20px; }
.stat-label { color: var(--color-muted); font-size: 12.5px; font-weight: 600; }
.stat-value {
  margin-top: 8px;
  color: var(--color-ink);
  font: 700 28px/1 var(--font-display);
  font-variant-numeric: tabular-nums;
}
.stat-denominator { color: var(--color-muted); font-size: 16px; font-weight: 500; }
.stat-detail { margin-top: 6px; color: var(--color-muted); font-size: 12.5px; }

/* Meter. <progress> so it is announced; appearance reset for consistency. */
.progress { -webkit-appearance: none; appearance: none; display: block; width: 100%; height: 6px; border: 0; border-radius: var(--radius-pill); background: var(--color-surface-3); overflow: hidden; }
.progress::-webkit-progress-bar { background: var(--color-surface-3); }
/* No transition on the value: animating width costs layout on every frame, and
 * a usage meter re-renders on navigation anyway — there is nothing to tween. */
.progress::-webkit-progress-value { background: var(--color-primary); }
.progress::-moz-progress-bar { background: var(--color-primary); }
.progress-warn::-webkit-progress-value { background: var(--color-warning); }
.progress-warn::-moz-progress-bar { background: var(--color-warning); }

/* ── Table ───────────────────────────────────────────────────────────────
 * Wrapped in .table-scroll so a wide table scrolls itself instead of the page.
 */
.table-card { border: 1px solid var(--color-line); border-radius: var(--radius-lg); background: var(--color-surface); overflow: hidden; }
.table-head { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 14px 18px; border-bottom: 1px solid var(--color-line); }
.table-title { color: var(--color-ink); font: 600 14px var(--font-display); }
.table-scroll { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
.table th {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  background: var(--color-surface-2);
  color: var(--color-muted);
  font-size: 12px;
  font-weight: 600;
  text-align: left;
  white-space: nowrap;
}
.table th, .table td { padding: 12px 18px; border-bottom: 1px solid var(--color-line); }
.table tbody tr:last-child td { border-bottom: 0; }
.table tbody tr:hover { background: var(--color-surface-2); }
.num-cell { text-align: right; font-family: var(--font-mono); font-variant-numeric: tabular-nums; }
.actions-cell { width: 1%; white-space: nowrap; text-align: right; }

/* ── Badges ──────────────────────────────────────────────────────────────
 * A dot carries the status so it never rests on hue alone.
 */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: var(--radius-sm);
  padding: 3px 8px;
  background: var(--color-surface-3);
  color: var(--color-body);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}
.badge::before { content: ""; width: 6px; height: 6px; border-radius: var(--radius-pill); background: currentColor; }
.badge-plain::before { display: none; }
.badge-success { background: var(--color-success-soft); color: var(--color-success); }
.badge-warning { background: var(--color-warning-soft); color: var(--color-warning); }
.badge-danger  { background: var(--color-danger-soft);  color: var(--color-danger); }
.badge-info    { background: var(--color-accent-soft);  color: var(--color-accent); }

.icon-chip {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  border-radius: var(--radius-md);
  background: var(--color-surface-3);
  color: var(--color-body);
}
.avatar {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 30px;
  height: 30px;
  border-radius: var(--radius-pill);
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

/* ── Alerts ──────────────────────────────────────────────────────────────
 * Soft background, plain words, an action when there is one. No exclamations.
 */
.alert {
  display: flex;
  gap: 12px;
  border-radius: var(--radius-md);
  padding: 14px 16px;
  font-size: 13.5px;
}
.alert-icon { flex: 0 0 auto; margin-top: 1px; }
.alert-body { min-width: 0; }
.alert-title { display: block; margin-bottom: 2px; color: var(--color-ink); font-weight: 600; }
.alert-info    { background: var(--color-surface-2);   color: var(--color-body); }
.alert-success { background: var(--color-success-soft); color: var(--color-success); }
.alert-warning { background: var(--color-warning-soft); color: var(--color-warning); }
.alert-danger  { background: var(--color-danger-soft);  color: var(--color-danger); }

/* ── Empty state ─────────────────────────────────────────────────────────
 * Says what is missing and offers the one action that fixes it.
 */
.empty-state { display: grid; justify-items: center; gap: 6px; padding: 48px 24px; text-align: center; }
.empty-state-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  margin-bottom: 6px;
  border-radius: var(--radius-lg);
  background: var(--color-surface-3);
  color: var(--color-muted);
}
.empty-state-title { color: var(--color-ink); font: 600 15px var(--font-display); }
.empty-state-body { max-width: 42ch; color: var(--color-muted); font-size: 13.5px; }

/* ── Toast ───────────────────────────────────────────────────────────────
 * Reports what just happened. Above everything, dismisses itself.
 */
.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  z-index: var(--z-toast);
  max-width: min(420px, calc(100vw - 36px));
  translate: -50% 0;
  border-radius: var(--radius-md);
  padding: 11px 16px;
  background: var(--color-secondary);
  color: var(--color-on-secondary);
  box-shadow: var(--shadow-pop);
  font-size: 13px;
  font-weight: 500;
  animation: pk-toast-in var(--t-enter) var(--ease);
}
.toast.leaving {
  opacity: 0;
  translate: -50% 8px;
  transition: opacity var(--t-enter) var(--ease), translate var(--t-enter) var(--ease);
}

/* ── Undo bar ────────────────────────────────────────────────────────────
 * Reversible by design: every destructive action leaves one of these.
 */
.undo-bar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  z-index: var(--z-overlay);
  display: flex;
  align-items: center;
  gap: 14px;
  width: min(560px, calc(100vw - 32px));
  translate: -50% 0;
  border-radius: var(--radius-md);
  padding: 12px 16px;
  background: var(--color-secondary);
  color: var(--color-on-secondary);
  box-shadow: var(--shadow-pop);
  font-size: 13.5px;
  animation: pk-toast-in var(--t-enter) var(--ease);
}
.undo-bar[hidden] { display: none; }
.undo-actions { display: flex; align-items: center; gap: 6px; margin-left: auto; }
.undo-dismiss {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: color-mix(in srgb, var(--color-on-secondary) 65%, transparent);
  cursor: pointer;
  transition: background-color var(--t-fast) var(--ease), color var(--t-fast) var(--ease);
}
.undo-dismiss:hover {
  background: color-mix(in srgb, var(--color-on-secondary) 12%, transparent);
  color: var(--color-on-secondary);
}

/* ── Dialog ──────────────────────────────────────────────────────────────
 * Native <dialog>: focus trapping, Esc, and inertness come free.
 */
.dialog {
  width: min(460px, calc(100vw - 32px));
  border: 1px solid var(--color-line);
  border-radius: var(--radius-xl);
  padding: 24px;
  background: var(--color-surface);
  color: var(--color-body);
  box-shadow: var(--shadow-pop);
}
.dialog::backdrop { background: color-mix(in srgb, #101828 55%, transparent); }
.dialog[open] { animation: pk-pop-in var(--t-base) var(--ease); }
.dialog-title { margin: 0 0 6px; color: var(--color-ink); font: 700 17px/1.3 var(--font-display); }
.dialog-body { font-size: 13.5px; }
.dialog-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 22px; }

/* ── Navigation ──────────────────────────────────────────────────────── */
.appbar {
  position: sticky;
  top: 0;
  z-index: var(--z-appbar);
  border-bottom: 1px solid var(--color-line);
  background: var(--color-surface);
}
.appbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  width: min(100% - 32px, var(--container));
  height: 56px;
  margin: 0 auto;
}
.brand { display: flex; align-items: center; gap: 9px; color: var(--color-ink); text-decoration: none; white-space: nowrap; }
.brand-mark {
  display: grid;
  place-items: center;
  width: 27px;
  height: 27px;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: #fff;
}
.brand-mark svg { width: 25px; height: 25px; }
.brand-name { font: 650 14px/1 var(--font-display); letter-spacing: -0.02em; }

.nav { display: flex; align-items: center; gap: 4px; }
.nav a {
  border-radius: var(--radius-sm);
  padding: 7px 9px;
  color: var(--color-muted);
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: background-color var(--t-fast) var(--ease), color var(--t-fast) var(--ease);
}
.nav a:hover, .nav a[aria-current="page"] { background: var(--color-surface-3); color: var(--color-ink); }

/* Tabs — a view switcher. aria-selected is the state, not a class. */
.tabs { display: flex; gap: 2px; border-bottom: 1px solid var(--color-line); }
.tabs button {
  border: 0;
  border-bottom: 2px solid transparent;
  background: none;
  padding: 10px 14px;
  color: var(--color-muted);
  font: 600 13.5px var(--font-sans);
  cursor: pointer;
  transition: color var(--t-fast) var(--ease), border-color var(--t-fast) var(--ease);
}
.tabs button:hover { color: var(--color-ink); }
.tabs button[aria-selected="true"] { border-bottom-color: var(--color-primary); color: var(--color-ink); }

/* Segmented — mutually exclusive options, all visible at once. */
.segmented { display: inline-flex; gap: 2px; border-radius: var(--radius-md); padding: 3px; background: var(--color-surface-3); }
.segmented button {
  border: 0;
  border-radius: var(--radius-sm);
  background: none;
  padding: 6px 12px;
  color: var(--color-muted);
  font: 600 12.5px var(--font-sans);
  cursor: pointer;
  transition: background-color var(--t-fast) var(--ease), color var(--t-fast) var(--ease);
}
.segmented button[aria-pressed="true"] { background: var(--color-surface); color: var(--color-ink); box-shadow: var(--shadow-card); }

.breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--color-muted); }
.breadcrumb a { color: var(--color-muted); text-decoration: none; }
.breadcrumb a:hover { color: var(--color-ink); }
.breadcrumb li + li::before { content: "/"; margin-right: 6px; color: var(--color-line-strong); }
.breadcrumb ol { display: flex; align-items: center; gap: 6px; margin: 0; padding: 0; list-style: none; }

.pagination { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 18px; border-top: 1px solid var(--color-line); font-size: 13px; color: var(--color-muted); }
.pagination-pages { display: flex; gap: 4px; }

/* Menu — pair with a [popover] or a details/summary; this is only the surface. */
.menu {
  z-index: var(--z-dropdown);
  min-width: 190px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  padding: 5px;
  background: var(--color-surface);
  box-shadow: var(--shadow-pop);
  animation: pk-rise-in var(--t-fast) var(--ease);
}
.menu-item {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  border: 0;
  border-radius: var(--radius-sm);
  background: none;
  padding: 8px 10px;
  color: var(--color-body);
  font: 500 13.5px var(--font-sans);
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}
.menu-item:hover { background: var(--color-surface-2); color: var(--color-ink); }
.menu-item-danger { color: var(--color-danger); }
.menu-item-danger:hover { background: var(--color-danger-soft); color: var(--color-danger); }
.menu-sep { height: 1px; margin: 5px 0; background: var(--color-line); }

/* Tooltip — supplementary only. Never put the sole copy of anything in here;
 * it is unreachable on touch and by many assistive technologies. */
.tooltip { position: relative; }
.tooltip::after {
  content: attr(data-tip);
  position: absolute;
  bottom: calc(100% + 7px);
  left: 50%;
  z-index: var(--z-dropdown);
  translate: -50% 0;
  border-radius: var(--radius-sm);
  padding: 5px 9px;
  background: var(--color-secondary);
  color: var(--color-on-secondary);
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--t-fast) var(--ease);
}
.tooltip:hover::after, .tooltip:focus-visible::after { opacity: 1; }

/* ── Stepper ─────────────────────────────────────────────────────────── */
.step-list { display: grid; gap: 12px; }
.step-card { display: flex; gap: 14px; border: 1px solid var(--color-line); border-radius: var(--radius-lg); background: var(--color-surface); padding: 18px 20px; }
.step-marker {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 26px;
  height: 26px;
  border-radius: var(--radius-pill);
  background: var(--color-surface-3);
  color: var(--color-muted);
  font: 600 12.5px var(--font-mono);
}
.step-card[data-state="active"] { border-color: var(--color-primary); }
.step-card[data-state="active"] .step-marker { background: var(--color-primary); color: #fff; }
.step-card[data-state="done"] .step-marker { background: var(--color-success-soft); color: var(--color-success); }
.step-title { color: var(--color-ink); font-size: 14px; font-weight: 600; }

/* ── Settings & danger zone ──────────────────────────────────────────── */
.settings-row { display: flex; align-items: center; justify-content: space-between; gap: 18px; border-top: 1px solid var(--color-line); padding: 16px 0; }
.settings-row:first-child { border-top: 0; }
.settings-copy { min-width: 0; }
.settings-copy strong { display: block; color: var(--color-ink); font-size: 14px; font-weight: 500; }
.settings-copy span { color: var(--color-muted); font-size: 13px; }

/* Bordered in danger, not filled: the page is not an emergency until you act. */
.danger-zone { border: 1px solid var(--color-danger-soft); border-radius: var(--radius-lg); background: var(--color-surface); }
.danger-zone > .section-heading { padding: 16px 20px 0; color: var(--color-danger); }
.danger-row { display: flex; align-items: center; justify-content: space-between; gap: 18px; border-top: 1px solid var(--color-line); padding: 16px 20px; }

/* Diff rows — what a change will do, before it does it. */
.diff-row { display: flex; align-items: center; justify-content: space-between; gap: 14px; border-bottom: 1px solid var(--color-line); padding: 10px 0; font-size: 13.5px; }
.diff-row:last-child { border-bottom: 0; }
.diff-success { color: var(--color-success); }
.diff-danger  { color: var(--color-danger); }
.diff-muted   { color: var(--color-muted); }

/* ── Repeater ────────────────────────────────────────────────────────── */
.repeater { display: grid; gap: 10px; }
.repeater-row { display: flex; align-items: center; gap: 10px; }
.repeater-row .input { flex: 1 1 auto; }

/* ── Uploader ────────────────────────────────────────────────────────── */
.uploader { display: flex; align-items: center; gap: 16px; }
.uploader-preview {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 64px;
  height: 64px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
  background: var(--color-surface-2);
  color: var(--color-muted);
  overflow: hidden;
}
.uploader-preview img { width: 100%; height: 100%; object-fit: cover; }
.dropzone {
  display: grid;
  place-items: center;
  gap: 4px;
  border: 1px dashed var(--color-line-strong);
  border-radius: var(--radius-lg);
  padding: 26px;
  background: var(--color-surface-2);
  color: var(--color-muted);
  font-size: 13px;
  text-align: center;
  transition: border-color var(--t-fast) var(--ease), background-color var(--t-fast) var(--ease);
}
.dropzone[data-dragover="true"] { border-color: var(--color-primary); background: var(--color-primary-soft); }

/* ── Preview frame ───────────────────────────────────────────────────── */
.preview-frame { border: 1px solid var(--color-line); border-radius: var(--radius-lg); background: var(--color-surface); overflow: hidden; }
.preview-chrome { display: flex; align-items: center; gap: 8px; border-bottom: 1px solid var(--color-line); padding: 9px 12px; background: var(--color-surface-2); }
.preview-dot { width: 9px; height: 9px; border-radius: var(--radius-pill); background: var(--color-line-strong); }
.preview-url {
  flex: 1 1 auto;
  border-radius: var(--radius-sm);
  padding: 4px 10px;
  background: var(--color-surface);
  color: var(--color-muted);
  font: 400 11.5px var(--font-mono);
  text-align: center;
}

/* ── Accordion ───────────────────────────────────────────────────────── */
.accordion { border: 1px solid var(--color-line); border-radius: var(--radius-lg); background: var(--color-surface); overflow: hidden; }
.accordion details { border-top: 1px solid var(--color-line); }
.accordion details:first-child { border-top: 0; }
.accordion summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 15px 18px;
  color: var(--color-ink);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  list-style: none;
}
.accordion summary::-webkit-details-marker { display: none; }
.accordion summary::after {
  content: "";
  flex: 0 0 auto;
  width: 8px;
  height: 8px;
  border-right: 1.5px solid var(--color-muted);
  border-bottom: 1.5px solid var(--color-muted);
  rotate: 45deg;
  transition: rotate var(--t-base) var(--ease);
}
.accordion details[open] summary::after { rotate: 225deg; }
.accordion-body { padding: 0 18px 16px; font-size: 13.5px; }

/* ── Code ────────────────────────────────────────────────────────────── */
.codeblock {
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  padding: 15px 18px;
  background: var(--color-surface-2);
  color: var(--color-ink);
  font: 400 12.5px/1.7 var(--font-mono);
  overflow-x: auto;
}
.codeblock .c { color: var(--color-muted); }
.codeblock .k { color: var(--color-primary); }
.codeblock .v { color: var(--color-warning); }
.code-card { border: 1px solid var(--color-line); border-radius: var(--radius-lg); overflow: hidden; }
.code-card-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 1px solid var(--color-line); padding: 10px 16px; background: var(--color-surface-2); font: 500 12px var(--font-mono); color: var(--color-muted); }
.code-card .codeblock { border: 0; border-radius: 0; }

/* ── Page shells ─────────────────────────────────────────────────────── */
.page-shell { width: min(100% - 32px, var(--container)); margin: 0 auto; padding: 34px 0 72px; }
.page-shell.narrow { max-width: var(--container-narrow); }
.page-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 18px; margin-bottom: 22px; }
.page-title { margin: 0; color: var(--color-ink); font: 700 24px/1.2 var(--font-display); letter-spacing: -0.02em; }
.auth-shell { display: grid; place-items: center; min-height: 76vh; }
/* radius-lg, matching .card. An auth card is a card that happens to be centred;
   giving it xl made it the only surface in the product with 20px corners. */
.auth-card { width: min(420px, 100%); border: 1px solid var(--color-line); border-radius: var(--radius-lg); background: var(--color-surface); padding: 30px; box-shadow: var(--shadow-card); }
.editor-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 22px; align-items: start; }
.page-footer { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 10px; width: min(100% - 32px, var(--container)); margin: 0 auto; padding: 22px 0 34px; border-top: 1px solid var(--color-line); color: var(--color-muted); font-size: 12.5px; }
.error-shell { display: grid; place-items: center; gap: 10px; min-height: 66vh; text-align: center; }
.error-code { color: var(--color-muted); font: 700 46px/1 var(--font-mono); }

/* ── Responsive ──────────────────────────────────────────────────────────
 * Canonical breakpoints: 560 (sm) · 820 (md) · 1120 (lg).
 */
@media (max-width: 820px) {
  .editor-grid { grid-template-columns: 1fr; }
  .stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .nav { display: none; }
}
@media (max-width: 560px) {
  .page-shell, .appbar-inner, .page-footer { width: min(100% - 24px, var(--container)); }
  .page-heading, .settings-row, .danger-row { flex-direction: column; align-items: stretch; }
  .stat-grid { grid-template-columns: 1fr; }
  .btn { width: 100%; }
  .form-actions .btn, .dialog-actions .btn { width: auto; }
}
`;

export const datavizCss = `
/* =============================================================================
 * Domain Parkour — data visualisation
 * v2.0.0 · depends on tokens.css
 *
 * Every value below was produced by the palette validator, not by eye. Do not
 * adjust a hex here without re-running it:
 *
 *   node scripts/validate_palette.js "<hex,hex,…>" --mode light
 *   node scripts/validate_palette.js "<hex,hex,…>" --mode dark
 *
 * Chart colour is not brand colour. --color-primary is the action colour and
 * appears on one control per screen; a chart may put eight marks on screen at
 * once, which is a different problem with different constraints (a lightness
 * band, a chroma floor, and colour-vision-deficiency separation).
 * ========================================================================== */

:root {
  /* ── Categorical — identity, not magnitude ───────────────────────────────
   * Fixed order. Slot 1 is the brand orange; it validates flat in both
   * schemes, so the product's own colour leads every chart. The remaining
   * seven are stepped per scheme — the dark column is the same hues chosen
   * for the dark band, never an automatic flip of the light ones.
   *
   * Assign in order and never cycle. Colour follows the entity, so filtering
   * a series out must not repaint the survivors.
   */
  --viz-1: #E8590C;                          /* orange — brand, flat both modes */
  --viz-2: light-dark(#2A78D6, #3987E5);     /* blue    */
  --viz-3: light-dark(#1BAF7A, #199E70);     /* aqua    */
  --viz-4: light-dark(#EDA100, #C98500);     /* yellow  */
  --viz-5: light-dark(#E87BA4, #D55181);     /* magenta */
  --viz-6: #008300;                          /* green   */
  --viz-7: light-dark(#4A3AA7, #9085E9);     /* violet  */
  --viz-8: light-dark(#E34948, #E66767);     /* red     */

  /* ── Sequential — magnitude ──────────────────────────────────────────────
   * One hue, light to dark, monotonic in lightness. Never a rainbow: a hue
   * ramp has no inherent order, so readers invent one.
   */
  --viz-seq-1: light-dark(#FDEBDD, #2A1810);
  --viz-seq-2: light-dark(#FBCFAF, #5A2F13);
  --viz-seq-3: light-dark(#F5A272, #8A4517);
  --viz-seq-4: light-dark(#E8590C, #B85A18);
  --viz-seq-5: light-dark(#A93F07, #E8590C);

  /* ── Diverging — polarity around a meaningful zero ───────────────────────
   * Two hues with a NEUTRAL GRAY midpoint. A coloured midpoint reads as a
   * third category and destroys the "no change" signal.
   */
  --viz-div-neg-2: light-dark(#1B5FA8, #2A78D6);
  --viz-div-neg-1: light-dark(#8FBCE6, #1F4E7A);
  --viz-div-mid:   light-dark(#E6E8EE, #232B3D);   /* neutral, = --color-line */
  --viz-div-pos-1: light-dark(#F5A272, #8A4517);
  --viz-div-pos-2: light-dark(#C2490A, #E8590C);

  /* ── Chart furniture ─────────────────────────────────────────────────────
   * Recessive by construction: the marks carry the data, the grid does not
   * compete with them.
   */
  --viz-grid:      light-dark(#EDEFF3, #1A2233);
  --viz-axis:      var(--color-line-strong);
  --viz-label:     var(--color-muted);
  --viz-value:     var(--color-ink);
  --viz-surface:   var(--color-surface);
  /* Ring drawn between overlapping marks and between stacked segments. */
  --viz-gap:       var(--color-surface);
}

/* Status colours are RESERVED. They mean state, never "series 4", and they
 * always ship with an icon or a label so the meaning never rests on hue. */
:root {
  --viz-good:     var(--color-success);
  --viz-warning:  var(--color-warning);
  --viz-critical: var(--color-danger);
}

/* ── Marks ──────────────────────────────────────────────────────────────── */
.viz-bar      { rx: 4px; }                    /* rounded data-end only */
.viz-line     { fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.viz-point    { r: 4; stroke: var(--viz-gap); stroke-width: 2; }
.viz-grid-line{ stroke: var(--viz-grid); stroke-width: 1; }
.viz-axis-line{ stroke: var(--viz-axis); stroke-width: 1; }
.viz-tick     { fill: var(--viz-label); font: 400 11px var(--font-mono); font-variant-numeric: tabular-nums; }
.viz-label    { fill: var(--viz-value); font: 500 12px var(--font-sans); }

/* A 2px surface gap between adjacent fills — stacked segments and neighbouring
 * bars alike — so two similar hues never touch and blur into one shape. */
.viz-stack > * { stroke: var(--viz-gap); stroke-width: 2; }

/* ── Legend ─────────────────────────────────────────────────────────────── */
.viz-legend { display: flex; flex-wrap: wrap; gap: 6px 16px; margin-bottom: 12px; }
.viz-legend-item { display: inline-flex; align-items: center; gap: 7px; color: var(--color-body); font-size: 12.5px; }
.viz-legend-swatch { width: 10px; height: 10px; border-radius: 3px; flex: 0 0 auto; }

/* ── Texture ─────────────────────────────────────────────────────────────
 * The fallback when colour cannot carry identity: print, forced-colors, or a
 * reader who needs more than hue. Applied at 45° and 135°.
 */
.viz-texture-a {
  background-image: repeating-linear-gradient(45deg, transparent 0 3px, var(--viz-gap) 3px 5px);
}
.viz-texture-b {
  background-image: repeating-linear-gradient(135deg, transparent 0 3px, var(--viz-gap) 3px 5px);
}

@media (forced-colors: active) {
  .viz-legend-swatch, .viz-bar { forced-color-adjust: none; }
}
`;
