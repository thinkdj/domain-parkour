/**
 * Visitor-page stylesheet. Every rule is a recipe from
 * parkour_design_system.html applied to the tokens in ./tokens.js.
 *
 * The five principles are load-bearing here, not decoration:
 *   the domain is the hero      - .dp-title is the hostname, in mono, never truncated
 *   calm surfaces, one accent   - primary is spent on the single action per page
 *   mono for machine truth      - hostnames, counts, and overlines only
 *   reversible by design        - nothing on a visitor page is destructive
 *   restraint over garnish      - no gradients, no glass, no entrance motion
 */

import { tokens, baseRules } from "./tokens.js";

export const coreStyles = `${tokens}${baseRules}
html {
    min-width: 320px;
    background: var(--color-surface);
    scroll-behavior: smooth;
}

body {
    min-height: 100vh;
    min-height: 100dvh;
    overflow-x: hidden;
}

/* ---- Layout ------------------------------------------------------------ */

.dp-page {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    padding: 88px 24px 32px;
}

.dp-wrap {
    width: 100%;
    max-width: 1040px;
    margin: auto;
}

.dp-wrap-narrow { max-width: 720px; }

.dp-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.16fr) minmax(300px, 0.84fr);
    gap: clamp(32px, 6vw, 64px);
    align-items: center;
}

.dp-masthead {
    min-height: 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 64px;
}

/* ---- Type -------------------------------------------------------------- */

/* Overline: 12px mono 600 +0.14em. Every small uppercase label on a visitor
   page is this one role. */
.dp-eyebrow,
.dp-panel-label,
.dp-stat .l {
    color: var(--color-muted);
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.14em;
    line-height: 1.4;
    text-transform: uppercase;
}

.dp-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

/* Small marks stay neutral here. A visitor page carries the owner's brand,
   not ours, so the cobalt accent is reserved for the product's own chrome
   (the admin) and primary is spent only on the one action that matters. */
.dp-eyebrow .dot {
    width: 6px;
    height: 6px;
    flex: 0 0 auto;
    border-radius: 50%;
    background: var(--color-muted);
}

.dp-mono {
    font-family: var(--font-mono);
    font-feature-settings: "liga" 0;
}

/* The headline is the hostname itself, so it renders in the mono role.
   Fixed-width glyphs crowd at the display face's -0.02em, so tracking stays
   neutral here. */
.dp-title {
    max-width: 18ch;
    margin-top: 20px;
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-size: clamp(2.25rem, 6vw, 3.5rem);
    font-weight: 600;
    line-height: 1.05;
    letter-spacing: -0.01em;
    overflow-wrap: anywhere;
    text-wrap: balance;
}

.dp-title-compact {
    font-size: clamp(1.75rem, 4.5vw, 2.25rem);
    line-height: 1.15;
}

.dp-heading {
    font-family: var(--font-display);
    font-size: clamp(1.35rem, 3vw, 1.625rem);
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.02em;
    text-wrap: balance;
}

/* h1: the profile display name, the one place a person outranks the host. */
.dp-name {
    margin-top: 12px;
    font-family: var(--font-display);
    font-size: clamp(1.75rem, 4.5vw, 2.25rem);
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: -0.02em;
    text-wrap: balance;
}

.dp-lede {
    max-width: 58ch;
    margin-top: 24px;
    font-size: 16px;
    line-height: 1.6;
    text-wrap: pretty;
}

.dp-copy {
    max-width: 60ch;
    margin-top: 12px;
    font-size: 14px;
    line-height: 1.5;
    text-wrap: pretty;
}

.dp-note {
    margin-top: 16px;
    color: var(--color-muted);
    font-size: 14px;
    line-height: 1.5;
}

.dp-price {
    margin-top: 12px;
    color: var(--color-ink);
    font-family: var(--font-display);
    font-size: clamp(1.75rem, 4vw, 2.25rem);
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: -0.02em;
}

/* ---- Badge ------------------------------------------------------------- */

/* A dot plus a word. Nothing here pulses: the design system reserves motion
   in a badge for "propagating", which a served page never is. */
.dp-status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: var(--radius-pill);
    background: var(--color-surface-3);
    color: var(--color-body);
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
}

.dp-status-dot {
    width: 6px;
    height: 6px;
    flex: 0 0 auto;
    border-radius: 50%;
    background: var(--color-muted);
}

.dp-status.live {
    background: var(--color-success-soft);
    color: var(--color-success);
}

.dp-status.live .dp-status-dot { background: var(--color-success); }

/* ---- Cards ------------------------------------------------------------- */

.dp-panel,
.dp-card {
    border: 1px solid var(--color-line);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    box-shadow: var(--shadow-card);
}

.dp-panel { padding: clamp(20px, 3vw, 24px); }

.dp-card {
    padding: 20px;
    transition: border-color var(--t-base) var(--ease), background-color var(--t-base) var(--ease);
}

.dp-card:hover {
    border-color: var(--color-line-strong);
    background: var(--color-surface-2);
}

.dp-feature-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin-top: 48px;
}

.dp-feature-index {
    color: var(--color-muted);
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 600;
}

.dp-feature-title {
    margin-top: 12px;
    color: var(--color-ink);
    font-size: 14px;
    font-weight: 600;
}

.dp-feature-copy {
    margin-top: 4px;
    font-size: 13px;
    line-height: 1.5;
}

/* ---- Stats / countdown ------------------------------------------------- */

.dp-stats {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(0, 1fr);
    margin-top: 24px;
    overflow: hidden;
    border: 1px solid var(--color-line);
    border-radius: var(--radius-md);
    background: var(--color-surface);
}

.dp-stat {
    min-width: 0;
    padding: 12px;
    text-align: left;
    border-left: 1px solid var(--color-line);
}

.dp-stat:first-child { border-left: 0; }

.dp-stat .v {
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-size: 15px;
    font-weight: 500;
    line-height: 1.3;
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
}

.dp-stat .l {
    margin-top: 4px;
    font-size: 10px;
    letter-spacing: 0.12em;
}

/* Countdown reaching zero replaces the cells with one plain statement. */
.dp-launched {
    padding: 16px;
    color: var(--color-ink);
    font-family: var(--font-display);
    font-size: 16px;
    font-weight: 600;
}

/* ---- Buttons and links ------------------------------------------------- */

/* One primary per screen. Hover is a color change, nothing lifts. */
.dp-button {
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0 16px;
    border: 0;
    border-radius: var(--radius-md);
    background: var(--color-primary);
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    line-height: 1;
    text-decoration: none;
    cursor: pointer;
    transition: background-color var(--t-fast) var(--ease);
}

.dp-button:hover { background: var(--color-primary-hover); }
.dp-button:active { background: var(--color-primary-active); }
.dp-button-block { width: 100%; }

.dp-link-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.dp-link {
    min-height: 52px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 16px;
    border: 1px solid var(--color-line);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-ink);
    text-decoration: none;
    transition: border-color var(--t-base) var(--ease), background-color var(--t-base) var(--ease);
}

.dp-link:hover {
    border-color: var(--color-line-strong);
    background: var(--color-surface-2);
}

.dp-link-main {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
}

.dp-link-index {
    color: var(--color-muted);
    font-family: var(--font-mono);
    font-size: 12px;
    font-variant-numeric: tabular-nums;
}

.dp-link .label {
    color: var(--color-ink);
    font-size: 14px;
    font-weight: 500;
}

.dp-link .arrow {
    flex: 0 0 auto;
    color: var(--color-muted);
    transition: color var(--t-base) var(--ease);
}

.dp-link:hover .arrow { color: var(--color-primary); }

/* ---- Socials ----------------------------------------------------------- */

.dp-socials {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-top: 24px;
}

.dp-social {
    width: 40px;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    border: 1px solid var(--color-line);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-body);
    transition: color var(--t-fast) var(--ease), border-color var(--t-fast) var(--ease), background-color var(--t-fast) var(--ease);
}

.dp-social:hover {
    color: var(--color-ink);
    border-color: var(--color-line-strong);
    background: var(--color-surface-2);
}

/* ---- Profile ----------------------------------------------------------- */

.dp-avatar {
    width: 88px;
    height: 88px;
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 1px solid var(--color-line);
    border-radius: 50%;
    background: var(--color-surface-3);
    color: var(--color-ink);
    font-family: var(--font-display);
    font-size: 26px;
    font-weight: 700;
    letter-spacing: -0.02em;
}

.dp-avatar img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
}

.dp-profile-head {
    display: flex;
    align-items: center;
    gap: 24px;
    text-align: left;
}

/* ---- Footer ------------------------------------------------------------ */

.dp-footer {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    margin-top: 64px;
    padding-top: 24px;
    border-top: 1px solid var(--color-line);
    color: var(--color-muted);
    font-size: 13px;
    line-height: 1.5;
}

.dp-footer-credit { text-align: right; }
.dp-footer a { color: var(--color-body); text-underline-offset: 3px; }
.dp-footer a:hover { color: var(--color-ink); }

/* ---- Page chrome ------------------------------------------------------- */

.dp-chrome {
    position: fixed;
    top: 20px;
    z-index: var(--z-appbar);
}

.dp-chrome-left { left: 20px; }
.dp-chrome-right { right: 20px; }

.dp-chrome-btn {
    width: 40px;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 1px solid var(--color-line-strong);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-ink);
    cursor: pointer;
    transition: background-color var(--t-fast) var(--ease);
}

.dp-chrome-btn:hover { background: var(--color-surface-2); }

.dp-theme-switcher {
    width: 210px;
    max-width: min(220px, calc(100vw - 96px));
    height: 40px;
    appearance: none;
    -webkit-appearance: none;
    padding: 0 36px 0 12px;
    border: 1px solid var(--color-line-strong);
    border-radius: var(--radius-md);
    background-color: var(--color-surface);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2398A2B3' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    color: var(--color-ink);
    font-size: 14px;
    cursor: pointer;
}

/* ---- Responsive -------------------------------------------------------- */

@media (max-width: 760px) {
    .dp-page { padding: 80px clamp(20px, 5vw, 32px) 32px; }
    .dp-masthead { margin-bottom: 48px; }
    .dp-grid { grid-template-columns: 1fr; gap: 32px; }
    .dp-title { max-width: none; }
    .dp-feature-grid { grid-template-columns: 1fr; margin-top: 32px; }
    .dp-profile-head { align-items: flex-start; }
    .dp-footer { margin-top: 48px; }
}

@media (max-width: 480px) {
    .dp-page { padding-inline: 20px; }
    .dp-masthead { margin-bottom: 40px; }
    .dp-profile-head { display: block; }
    .dp-profile-head-copy { margin-top: 20px; }
    .dp-footer { display: block; }
    .dp-footer-credit { margin-top: 8px; text-align: left; }
}
`;
