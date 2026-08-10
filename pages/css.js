/**
 * Visitor-page stylesheet, assembled per mode.
 *
 * Every rule is a recipe from design-system/parkour_design_system.html applied to
 * the tokens in ./tokens.generated.js. Carried over from the OSS `styles/core.js`,
 * which was the better of the two implementations - cloud shipped a 1 KB inline
 * string with no design system at all.
 *
 * Two changes from the OSS original:
 *   - the page chrome is intentionally small: the shared theme toggle is the
 *     only control, while appearance still follows the OS until overridden.
 *   - blocks are selected per mode, so a profile page does not carry the
 *     countdown grid and a parking page does not carry the feature cards.
 *
 * The five principles are load-bearing here, not decoration:
 *   the domain is the hero      - .dp-title is the hostname, in mono, never truncated
 *   calm surfaces, one accent   - primary is spent on the single action per page
 *   mono for machine truth      - hostnames, counts and overlines only
 *   reversible by design        - nothing on a visitor page is destructive
 *   restraint over garnish      - no gradients, no glass, no entrance motion
 */

import { pageTokens } from './tokens.generated.js';

const BASE = `
*{box-sizing:border-box}
html,body{margin:0}
html{min-width:320px;background:var(--color-surface)}
body{
  min-height:100dvh;overflow-x:hidden;
  font-family:var(--font-sans);font-size:16px;line-height:1.6;
  background:var(--color-surface);color:var(--color-body);
  -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;
}
h1,h2,h3,p{margin:0}
h1,h2,h3{font-family:var(--font-display);color:var(--color-ink);letter-spacing:-0.02em}
a{color:inherit}
button,input,select,textarea{font:inherit;color:inherit}
.dp-page{min-height:100dvh;display:flex;flex-direction:column;padding:56px 24px 32px}
.dp-wrap{width:100%;max-width:1040px;margin:auto}
.dp-wrap-narrow{max-width:720px}
.dp-grid{
  display:grid;grid-template-columns:minmax(0,1.16fr) minmax(300px,0.84fr);
  gap:clamp(32px,6vw,64px);align-items:center;
}
.dp-masthead{
  min-height:32px;display:flex;align-items:center;justify-content:space-between;
  gap:16px;margin-bottom:64px;
}
.dp-masthead-actions{display:inline-flex;align-items:center;gap:12px}
.dp-theme-toggle{
  width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;
  flex:0 0 auto;border:1px solid var(--color-line-strong);border-radius:var(--radius-pill);
  background:var(--color-surface);color:var(--color-ink);cursor:pointer;
  transition:background-color var(--t-fast) var(--ease),border-color var(--t-fast) var(--ease),color var(--t-fast) var(--ease);
}
.dp-theme-toggle:hover{background:var(--color-surface-2)}
.dp-theme-toggle:focus-visible{outline:2px solid var(--color-primary);outline-offset:2px}
.dp-theme-toggle [data-theme-icon]{display:inline-flex;align-items:center;justify-content:center}
.dp-theme-toggle [data-theme-icon][hidden]{display:none}
[data-theme="light"]{color-scheme:light}
[data-theme="dark"]{color-scheme:dark}
[data-theme="light"] .dp-theme-toggle [data-theme-icon="sun"],
[data-theme="dark"] .dp-theme-toggle [data-theme-icon="moon"]{display:none}
@media(prefers-color-scheme:light){:root:not([data-theme]) .dp-theme-toggle [data-theme-icon="sun"]{display:none}}
@media(prefers-color-scheme:dark){:root:not([data-theme]) .dp-theme-toggle [data-theme-icon="moon"]{display:none}}
.dp-eyebrow,.dp-panel-label,.dp-stat .l{
  color:var(--color-muted);font-family:var(--font-mono);font-size:12px;font-weight:600;
  letter-spacing:0.14em;line-height:1.4;text-transform:uppercase;
}
.dp-eyebrow{display:inline-flex;align-items:center;gap:8px}
.dp-eyebrow .dot{width:6px;height:6px;flex:0 0 auto;border-radius:50%;background:var(--color-muted)}
.dp-mono{font-family:var(--font-mono);font-feature-settings:"liga" 0}
.dp-title{
  max-width:18ch;margin-top:20px;color:var(--color-ink);font-family:var(--font-mono);
  font-size:clamp(2.25rem,6vw,3.5rem);font-weight:600;line-height:1.05;letter-spacing:-0.01em;
  overflow-wrap:anywhere;text-wrap:balance;
}
.dp-title-compact{font-size:clamp(1.75rem,4.5vw,2.25rem);line-height:1.15}
.dp-heading{
  margin-top:24px;font-family:var(--font-display);font-size:clamp(1.35rem,3vw,1.625rem);
  font-weight:700;line-height:1.2;letter-spacing:-0.02em;text-wrap:balance;
}
.dp-lede{max-width:58ch;margin-top:24px;font-size:16px;line-height:1.6;text-wrap:pretty}
.dp-copy{max-width:60ch;margin-top:12px;font-size:14px;line-height:1.5;text-wrap:pretty}
.dp-note{margin-top:16px;color:var(--color-muted);font-size:14px;line-height:1.5}
.dp-status{
  display:inline-flex;align-items:center;gap:6px;padding:4px 10px;
  border-radius:var(--radius-pill);background:var(--color-surface-3);color:var(--color-body);
  font-size:12px;font-weight:500;white-space:nowrap;
}
.dp-status-dot{width:6px;height:6px;flex:0 0 auto;border-radius:50%;background:var(--color-muted)}
.dp-status.live{background:var(--color-success-soft);color:var(--color-success)}
.dp-status.live .dp-status-dot{background:var(--color-success)}
.dp-footer{
  display:flex;align-items:flex-end;justify-content:space-between;gap:20px;
  margin-top:64px;padding-top:24px;border-top:1px solid var(--color-line);
  color:var(--color-muted);font-size:13px;line-height:1.5;
}
.dp-footer-credit{text-align:right}
.dp-footer a{color:var(--color-body);text-underline-offset:3px}
.dp-footer a:hover{color:var(--color-ink)}
@media(max-width:760px){
  .dp-page{padding:48px clamp(20px,5vw,32px) 32px}
  .dp-masthead{margin-bottom:48px}
  .dp-grid{grid-template-columns:1fr;gap:32px}
  .dp-title{max-width:none}
  .dp-footer{margin-top:48px}
}
@media(max-width:480px){
  .dp-page{padding-inline:20px}
  .dp-masthead{margin-bottom:40px}
  .dp-footer{display:block}
  .dp-footer-credit{margin-top:8px;text-align:left}
}`;

const PANEL = `
.dp-panel,.dp-card{
  border:1px solid var(--color-line);border-radius:var(--radius-lg);
  background:var(--color-surface);box-shadow:var(--shadow-card);
}
.dp-panel{padding:clamp(20px,3vw,24px)}
.dp-price{
  margin-top:12px;color:var(--color-ink);font-family:var(--font-display);
  font-size:clamp(1.75rem,4vw,2.25rem);font-weight:700;line-height:1.15;letter-spacing:-0.02em;
}`;

const BUTTON = `
.dp-button{
  height:40px;display:inline-flex;align-items:center;justify-content:center;gap:8px;
  padding:0 16px;border:0;border-radius:var(--radius-md);background:var(--color-primary);
  color:#fff;font-size:14px;font-weight:600;line-height:1;text-decoration:none;cursor:pointer;
  transition:background-color var(--t-fast) var(--ease);
}
.dp-button:hover{background:var(--color-primary-hover)}
.dp-button:active{background:var(--color-primary-active)}
.dp-button-block{width:100%;margin-top:24px}`;

const STATS = `
.dp-stats{
  display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);margin-top:24px;
  overflow:hidden;border:1px solid var(--color-line);border-radius:var(--radius-md);
  background:var(--color-surface);
}
.dp-stat{min-width:0;padding:12px;text-align:left;border-left:1px solid var(--color-line)}
.dp-stat:first-child{border-left:0}
.dp-stat .v{
  color:var(--color-ink);font-family:var(--font-mono);font-size:15px;font-weight:500;
  line-height:1.3;font-variant-numeric:tabular-nums;overflow-wrap:anywhere;
}
.dp-stat .l{margin-top:4px;font-size:10px;letter-spacing:0.12em}`;

const FEATURES = `
.dp-card{padding:20px;transition:border-color var(--t-base) var(--ease),background-color var(--t-base) var(--ease)}
.dp-card:hover{border-color:var(--color-line-strong);background:var(--color-surface-2)}
.dp-feature-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:48px}
.dp-feature-index{color:var(--color-muted);font-family:var(--font-mono);font-size:12px;font-weight:600}
.dp-feature-title{margin-top:12px;color:var(--color-ink);font-size:14px;font-weight:600}
.dp-feature-copy{margin-top:4px;font-size:13px;line-height:1.5}
@media(max-width:760px){.dp-feature-grid{grid-template-columns:1fr;margin-top:32px}}`;

const LINKS = `
.dp-link-list{display:flex;flex-direction:column;gap:8px}
.dp-link{
  min-height:52px;display:flex;align-items:center;justify-content:space-between;gap:16px;
  padding:12px 16px;border:1px solid var(--color-line);border-radius:var(--radius-md);
  background:var(--color-surface);color:var(--color-ink);text-decoration:none;
  transition:border-color var(--t-base) var(--ease),background-color var(--t-base) var(--ease);
}
.dp-link:hover{border-color:var(--color-line-strong);background:var(--color-surface-2)}
.dp-link-main{display:flex;align-items:center;gap:12px;min-width:0}
.dp-link-index{
  color:var(--color-muted);font-family:var(--font-mono);font-size:12px;
  font-variant-numeric:tabular-nums;
}
.dp-link .label{color:var(--color-ink);font-size:14px;font-weight:500}
.dp-link .arrow{flex:0 0 auto;color:var(--color-muted);transition:color var(--t-base) var(--ease)}
.dp-link:hover .arrow{color:var(--color-primary)}`;

const SOCIALS = `
.dp-socials{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:24px}
.dp-social{
  width:40px;height:40px;display:inline-flex;align-items:center;justify-content:center;
  flex:0 0 auto;border:1px solid var(--color-line);border-radius:var(--radius-md);
  background:var(--color-surface);color:var(--color-body);
  transition:color var(--t-fast) var(--ease),border-color var(--t-fast) var(--ease),background-color var(--t-fast) var(--ease);
}
.dp-social:hover{color:var(--color-ink);border-color:var(--color-line-strong);background:var(--color-surface-2)}`;

const PROFILE = `
.dp-avatar{
  width:88px;height:88px;flex:0 0 auto;display:inline-flex;align-items:center;
  justify-content:center;overflow:hidden;border:1px solid var(--color-line);border-radius:50%;
  background:var(--color-surface-3);color:var(--color-ink);font-family:var(--font-display);
  font-size:26px;font-weight:700;letter-spacing:-0.02em;
}
.dp-avatar img{width:100%;height:100%;display:block;object-fit:cover}
.dp-profile-head{display:flex;align-items:center;gap:24px;text-align:left}
.dp-name{
  margin-top:12px;font-family:var(--font-display);font-size:clamp(1.75rem,4.5vw,2.25rem);
  font-weight:700;line-height:1.15;letter-spacing:-0.02em;text-wrap:balance;
}
@media(max-width:760px){.dp-profile-head{align-items:flex-start}}
@media(max-width:480px){
  .dp-profile-head{display:block}
  .dp-profile-head-copy{margin-top:20px}
}`;

/**
 * Forms and the disclosures that hold them. One block, because a disclosure only
 * ever wraps a capture form - shipping its 600 bytes to a page with no form was
 * the difference between the parking template fitting the raw budget and not.
 */
const FORM = `
.dp-capture{display:grid;gap:12px;margin-top:24px;max-width:60ch}
.dp-contact-disclosure{
  overflow:hidden;border:1px solid var(--color-primary);border-radius:var(--radius-md);
}
.dp-panel .dp-contact-disclosure{margin-top:24px}
.dp-capture .dp-contact-disclosure{margin-top:0}
.dp-contact-disclosure summary{
  min-height:48px;display:flex;align-items:center;justify-content:space-between;gap:12px;
  padding:0 16px;background:var(--color-primary);color:#fff;font-size:14px;font-weight:600;
  cursor:pointer;list-style:none;transition:background-color var(--t-fast) var(--ease);
}
.dp-contact-disclosure summary:hover{background:var(--color-primary-hover)}
.dp-contact-disclosure summary::-webkit-details-marker{display:none}
.dp-contact-disclosure summary::after{
  content:'';width:8px;height:8px;flex:0 0 auto;
  border-right:1.5px solid currentColor;border-bottom:1.5px solid currentColor;
  transform:translateY(-2px) rotate(45deg);transition:transform var(--t-fast) var(--ease);
}
.dp-contact-disclosure[open] summary::after{transform:translateY(2px) rotate(225deg)}
.dp-disclosure-body{
  padding:16px;background:var(--color-surface);border-top:1px solid var(--color-line);
}
/* Only the first way to reach the owner is a filled button. A page offering
 * two of them is a wall of orange that says nothing about which one to use. */
.dp-quiet{border-color:var(--color-line-strong)}
.dp-quiet summary{background:var(--color-surface-2);color:var(--color-ink)}
.dp-quiet summary:hover{background:var(--color-surface-3)}
.dp-disclosure-body .dp-copy{margin-top:0}
.dp-form{display:grid;gap:12px;text-align:left}
/* A form sitting straight in a panel - the waitlist - needs the panel's rhythm.
 * Inside a disclosure the padding already provides it, and that rule wins by
 * coming second at equal specificity. */
.dp-panel .dp-form{margin-top:24px}
.dp-disclosure-body .dp-form{margin-top:16px}
.dp-form label{display:grid;gap:6px;color:var(--color-body);font-size:13px}
.dp-form input,.dp-form textarea{
  width:100%;padding:10px 12px;border:1px solid var(--color-line-strong);
  border-radius:var(--radius-md);background:var(--color-surface);color:var(--color-ink);
}
.dp-form textarea{resize:vertical}
.dp-form .check{display:flex;align-items:flex-start;gap:8px;font-size:13px}
.dp-form .check input{width:auto;margin-top:3px}
.dp-form .optional{color:var(--color-muted)}
.dp-hp{position:absolute!important;left:-10000px!important}`;

/** Which blocks each mode needs. Anything absent is dead weight on that page. */
const BLOCKS = {
  parking: [PANEL, BUTTON, STATS, SOCIALS],
  coming_soon: [PANEL, STATS, FEATURES, SOCIALS],
  landing: [PANEL, BUTTON, LINKS, SOCIALS],
  profile: [PANEL, LINKS, SOCIALS, PROFILE],
  maintenance: [PANEL, BUTTON],
  redirect: [],
};

function minify(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

/**
 * @param {string} mode
 * @param {{ accent?: string, withForm?: boolean }} [options]
 */
export function pageCss(mode, { accent = '', withForm = false } = {}) {
  // A Set, because a form needs the button recipe and most modes already carry
  // it - pushing blindly shipped `.dp-button` twice on a parking page and not at
  // all on a coming-soon one, where the waitlist submit is the only button.
  const blocks = new Set([BASE, ...(BLOCKS[mode] || BLOCKS.parking)]);
  if (withForm) {
    blocks.add(PANEL);
    blocks.add(BUTTON);
    blocks.add(FORM);
  }
  // The accent override must land on :root, where the derived mixes are declared;
  // set further down the tree the hovers stay on the old colour.
  const override = accent ? `:root{--color-primary:${accent}}` : '';
  return pageTokens + minify([...blocks].join('\n')) + override;
}
