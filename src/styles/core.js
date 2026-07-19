/**
 * Shared public-page design system. Kept intentionally small and dependency-free
 * so every template has the same rhythm, accessibility, and responsive behavior.
 */

export const coreStyles = `
:root {
    --accent-color: #3b82f6;
    --accent-color-rgb: 59, 130, 246;
    --bg: #f7f7f5;
    --surface: #ffffff;
    --surface-raised: #ffffff;
    --surface-hover: #f3f3f0;
    --border: #e5e5e1;
    --border-strong: #cecec8;
    --text: #18191b;
    --text-dim: #62656a;
    --text-faint: #92959a;
    --shadow: 0 20px 50px rgba(24, 25, 27, 0.06);
}

html.dark {
    --bg: #111214;
    --surface: #18191c;
    --surface-raised: #1b1c20;
    --surface-hover: #202126;
    --border: #292b30;
    --border-strong: #3b3e45;
    --text: #f2f3f4;
    --text-dim: #a7aab0;
    --text-faint: #696c73;
    --shadow: 0 24px 60px rgba(0, 0, 0, 0.24);
}

* { box-sizing: border-box; }

html {
    min-width: 320px;
    background: var(--bg);
    color-scheme: light;
    scroll-behavior: smooth;
}

html.dark { color-scheme: dark; }

html, body {
    margin: 0;
    background: var(--bg);
    color: var(--text);
}

body {
    min-height: 100vh;
    min-height: 100dvh;
    font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI",
                 Helvetica, Arial, sans-serif;
    letter-spacing: -0.01em;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-image: radial-gradient(circle at 50% -20%, rgba(var(--accent-color-rgb), 0.09), transparent 34rem);
}

body::before {
    content: '';
    position: fixed;
    inset: 0 0 auto;
    height: 2px;
    background: var(--accent-color);
    z-index: 60;
}

a, button, select { -webkit-tap-highlight-color: transparent; }
a { color: inherit; }
button, select { font: inherit; }
::selection { background: rgba(var(--accent-color-rgb), 0.2); }

h1, h2, h3, p { margin: 0; }
h1, h2, h3 { color: var(--text); letter-spacing: -0.04em; }
p { color: var(--text-dim); }

.dp-page {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    padding: 88px 24px 28px;
}

.dp-wrap {
    width: 100%;
    max-width: 1040px;
    margin: auto;
}

.dp-wrap-narrow { max-width: 720px; }

.dp-masthead {
    min-height: 34px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 64px;
}

.dp-brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    color: var(--text);
    font-size: 13px;
    font-weight: 650;
    letter-spacing: -0.01em;
}

.dp-brand-mark {
    width: 9px;
    height: 9px;
    flex: 0 0 auto;
    border-radius: 3px;
    background: var(--accent-color);
    box-shadow: 0 0 0 5px rgba(var(--accent-color-rgb), 0.1);
}

.dp-status {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: var(--text-faint);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    white-space: nowrap;
}

.dp-status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent-color);
}

.dp-status-dot.pulse { animation: dp-pulse 2.4s ease-in-out infinite; }

@keyframes dp-pulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(var(--accent-color-rgb), 0.2); }
    50% { opacity: 0.55; box-shadow: 0 0 0 5px rgba(var(--accent-color-rgb), 0); }
}

.dp-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.16fr) minmax(300px, 0.84fr);
    gap: clamp(36px, 7vw, 88px);
    align-items: center;
}

.dp-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--text-faint);
    font-size: 11px;
    font-weight: 650;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

.dp-eyebrow .dot {
    width: 5px;
    height: 5px;
    border-radius: 1.5px;
    background: var(--accent-color);
}

.dp-eyebrow .dot.pulse { animation: dp-pulse 2.4s ease-in-out infinite; }

.accent-underline { display: inline; }

.dp-title {
    max-width: 14ch;
    margin-top: 20px;
    font-size: clamp(2.8rem, 7vw, 5.4rem);
    font-weight: 720;
    line-height: 0.98;
    letter-spacing: -0.065em;
    overflow-wrap: anywhere;
}

.dp-title-compact {
    font-size: clamp(2.35rem, 5vw, 4.1rem);
    line-height: 1.02;
}

.dp-heading {
    font-size: clamp(1.35rem, 3vw, 1.9rem);
    font-weight: 680;
    line-height: 1.18;
}

.dp-lede {
    max-width: 58ch;
    margin-top: 24px;
    font-size: clamp(1rem, 1.8vw, 1.12rem);
    line-height: 1.7;
}

.dp-copy {
    max-width: 60ch;
    margin-top: 12px;
    font-size: 14px;
    line-height: 1.7;
}

.dp-note {
    margin-top: 18px;
    color: var(--text-faint);
    font-size: 12px;
    line-height: 1.6;
}

.dp-panel,
.dp-card {
    background: color-mix(in srgb, var(--surface-raised) 94%, transparent);
    border: 1px solid var(--border);
    border-radius: 18px;
}

.dp-panel {
    padding: clamp(24px, 4vw, 34px);
    box-shadow: var(--shadow);
}

.dp-card {
    padding: 20px;
    transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
}

.dp-card:hover {
    border-color: var(--border-strong);
    background: var(--surface-hover);
    transform: translateY(-1px);
}

.dp-panel-label {
    color: var(--text-faint);
    font-size: 10px;
    font-weight: 650;
    letter-spacing: 0.13em;
    text-transform: uppercase;
}

.dp-price {
    margin-top: 10px;
    color: var(--text);
    font-size: clamp(1.85rem, 4vw, 2.6rem);
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: -0.045em;
}

.dp-stats {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(0, 1fr);
    margin-top: 28px;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface);
}

.dp-stat {
    min-width: 0;
    padding: 14px 12px;
    text-align: left;
    border-left: 1px solid var(--border);
}

.dp-stat:first-child { border-left: 0; }

.dp-stat .v {
    color: var(--text);
    font-size: 16px;
    font-weight: 650;
    line-height: 1.2;
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
}

.dp-stat .l {
    margin-top: 5px;
    color: var(--text-faint);
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.09em;
    text-transform: uppercase;
}

.dp-button {
    min-height: 46px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    padding: 11px 20px;
    border: 1px solid var(--accent-color);
    border-radius: 11px;
    background: var(--accent-color);
    color: #fff;
    box-shadow: 0 8px 20px rgba(var(--accent-color-rgb), 0.18), inset 0 1px rgba(255,255,255,0.18);
    font-size: 14px;
    font-weight: 650;
    line-height: 1;
    text-decoration: none;
    cursor: pointer;
    transition: filter 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
}

.dp-button:hover {
    filter: brightness(1.06);
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(var(--accent-color-rgb), 0.23), inset 0 1px rgba(255,255,255,0.18);
}

.dp-button:active { transform: translateY(0); }
.dp-button-block { width: 100%; }

.dp-link-list {
    display: flex;
    flex-direction: column;
    gap: 9px;
}

.dp-link {
    min-height: 54px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 13px 15px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface);
    color: var(--text);
    text-decoration: none;
    transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
}

.dp-link:hover {
    border-color: var(--border-strong);
    background: var(--surface-hover);
    transform: translateX(2px);
}

.dp-link-main {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
}

.dp-link-index {
    color: var(--text-faint);
    font-size: 10px;
    font-variant-numeric: tabular-nums;
}

.dp-link .label {
    color: var(--text);
    font-size: 14px;
    font-weight: 600;
}

.dp-link .arrow {
    display: inline-flex;
    flex: 0 0 auto;
    color: var(--text-faint);
    transition: color 0.18s ease, transform 0.18s ease;
}

.dp-link:hover .arrow {
    color: var(--accent-color);
    transform: translateX(2px);
}

.dp-button:focus-visible,
.dp-link:focus-visible,
.dp-social:focus-visible,
.dp-chrome-btn:focus-visible,
.dp-theme-switcher:focus-visible {
    outline: 3px solid rgba(var(--accent-color-rgb), 0.32);
    outline-offset: 3px;
}

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
    border: 1px solid var(--border);
    border-radius: 11px;
    background: var(--surface);
    color: var(--text-dim);
    transition: color 0.18s ease, border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
}

.dp-social:hover {
    color: var(--accent-color);
    border-color: var(--border-strong);
    background: var(--surface-hover);
    transform: translateY(-1px);
}

.dp-social-glyph {
    font-size: 11px;
    font-weight: 750;
    letter-spacing: -0.04em;
}

.dp-rule {
    width: 100%;
    height: 1px;
    margin: 24px 0;
    border: 0;
    background: var(--border);
}

.dp-accent { color: var(--accent-color); }

.dp-feature-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin-top: 48px;
}

.dp-feature-index {
    color: var(--accent-color);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
}

.dp-feature-title {
    margin-top: 18px;
    color: var(--text);
    font-size: 14px;
    font-weight: 650;
    letter-spacing: -0.015em;
}

.dp-feature-copy {
    margin-top: 7px;
    color: var(--text-dim);
    font-size: 12px;
    line-height: 1.55;
}

.dp-avatar {
    width: 92px;
    height: 92px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 26px;
    background: var(--surface);
    color: var(--accent-color);
    box-shadow: 0 0 0 5px rgba(var(--accent-color-rgb), 0.09);
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.04em;
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

.dp-footer {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    margin-top: 64px;
    padding-top: 22px;
    border-top: 1px solid var(--border);
    color: var(--text-faint);
    font-size: 11px;
    line-height: 1.6;
}

.dp-footer-credit { text-align: right; }
.dp-footer a { color: var(--text-dim); text-underline-offset: 3px; }
.dp-footer a:hover { color: var(--text); }

@keyframes dp-fadeIn {
    from { opacity: 0; transform: translateY(7px); }
    to { opacity: 1; transform: translateY(0); }
}

.fade-in { animation: dp-fadeIn 0.48s ease-out both; }
.fade-in-delay-1 { animation: dp-fadeIn 0.48s ease-out 0.07s both; }
.fade-in-delay-2 { animation: dp-fadeIn 0.48s ease-out 0.14s both; }
.fade-in-delay-3 { animation: dp-fadeIn 0.48s ease-out 0.21s both; }

.dp-chrome {
    position: fixed;
    top: 16px;
    z-index: 50;
}

.dp-chrome-left { left: 16px; }
.dp-chrome-right { right: 16px; }

.dp-chrome-btn {
    width: 40px;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: color-mix(in srgb, var(--surface) 88%, transparent);
    color: var(--text-dim);
    box-shadow: 0 8px 24px rgba(0,0,0,0.05);
    backdrop-filter: blur(12px);
    cursor: pointer;
    transition: color 0.15s ease, background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
}

.dp-chrome-btn:hover {
    color: var(--text);
    background: var(--surface);
    border-color: var(--border-strong);
    transform: translateY(-1px);
}

.dp-theme-switcher {
    width: 210px;
    max-width: min(220px, calc(100vw - 96px));
    height: 40px;
    appearance: none;
    -webkit-appearance: none;
    padding: 0 34px 0 13px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background-color: color-mix(in srgb, var(--surface) 88%, transparent);
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M6 9l6 6 6-6'/></svg>");
    background-repeat: no-repeat;
    background-position: right 11px center;
    color: var(--text);
    box-shadow: 0 8px 24px rgba(0,0,0,0.05);
    backdrop-filter: blur(12px);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
}

.dp-theme-switcher:hover { border-color: var(--border-strong); }

@media (max-width: 760px) {
    .dp-page { padding: 76px clamp(24px, 6vw, 32px) 28px; }
    .dp-masthead { margin-bottom: 46px; }
    .dp-grid { grid-template-columns: 1fr; gap: 34px; }
    .dp-title { max-width: none; }
    .dp-feature-grid { grid-template-columns: 1fr; margin-top: 36px; }
    .dp-profile-head { align-items: flex-start; }
    .dp-footer { margin-top: 48px; }
}

@media (max-width: 480px) {
    .dp-page { padding-inline: 24px; }
    .dp-masthead { margin-bottom: 38px; }
    .dp-title { font-size: clamp(2.5rem, 13vw, 3.4rem); }
    .dp-panel { padding: 22px; border-radius: 16px; }
    .dp-profile-head { display: block; }
    .dp-profile-head-copy { margin-top: 24px; }
    .dp-footer { display: block; }
    .dp-footer-credit { margin-top: 10px; text-align: left; }
}

@media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
`;
