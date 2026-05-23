/**
 * Core stylesheet for the public-facing pages. Defines design tokens and a
 * small library of reusable classes (`dp-*`) used by every template. Exported
 * as a string so it can be interpolated into a `<style>` block — no bundler
 * text-import rules required.
 */

export const coreStyles = `
:root {
    --accent-color: #3b82f6;
    --accent-color-rgb: 59, 130, 246;

    /* Light theme tokens */
    --bg: #fafaf9;
    --surface: #ffffff;
    --surface-hover: #f5f5f4;
    --border: #ececec;
    --border-strong: #d4d4d4;
    --text: #18181b;
    --text-dim: #6b7280;
    --text-faint: #a1a1aa;
}

html.dark {
    --bg: #191919;
    --surface: #1f1f1f;
    --surface-hover: #262626;
    --border: #2a2a2a;
    --border-strong: #3a3a3a;
    --text: #f4f4f5;
    --text-dim: #a1a1aa;
    --text-faint: #6b6b6e;
}

* { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

html, body {
    background: var(--bg);
    color: var(--text);
}

body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", "Roboto",
                 "Helvetica Neue", Arial, sans-serif;
    letter-spacing: -0.005em;
    overflow-x: hidden;
}

/* Typography */
h1, h2, h3 { color: var(--text); letter-spacing: -0.02em; }
p { color: var(--text-dim); }

.dp-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-dim);
    padding: 4px 10px;
    border: 1px solid rgba(var(--accent-color-rgb), 0.2);
    border-radius: 999px;
    background: rgba(var(--accent-color-rgb), 0.06);
}
.dp-eyebrow .dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--accent-color);
}
.dp-eyebrow .dot.pulse { animation: dp-pulse 2s ease-in-out infinite; }

@keyframes dp-pulse {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0.4; }
}

/* Accent underline (single decorative element on h1) */
.accent-underline {
    position: relative;
    display: inline-block;
}
.accent-underline::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 36px;
    height: 2px;
    background: var(--accent-color);
    border-radius: 2px;
}

/* Cards / surfaces */
.dp-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    transition: border-color 0.18s ease, background 0.18s ease;
}
.dp-card:hover {
    border-color: var(--border-strong);
    background: var(--surface-hover);
}

/* Stat / metric tiles */
.dp-stat {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px 18px;
    text-align: center;
    min-width: 80px;
    flex: 1;
    transition: border-color 0.18s ease;
}
.dp-stat:hover { border-color: var(--border-strong); }
.dp-stat .v { font-size: 18px; font-weight: 600; color: var(--accent-color); line-height: 1.1; }
.dp-stat .l {
    font-size: 11px;
    color: var(--text-faint);
    margin-top: 4px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
}

/* Buttons */
.dp-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 500;
    font-size: 14px;
    background: var(--accent-color);
    color: #fff;
    border: 1px solid var(--accent-color);
    transition: filter 0.15s ease, transform 0.08s ease;
}
.dp-button:hover { filter: brightness(1.06); }
.dp-button:active { transform: translateY(1px); }

/* Link cards (used by landing & profile) */
.dp-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border: 1px solid var(--border);
    background: var(--surface);
    border-radius: 8px;
    color: var(--text);
    text-decoration: none;
    transition: border-color 0.18s ease, background 0.18s ease;
}
.dp-link:hover {
    border-color: var(--accent-color);
    background: var(--surface-hover);
}
.dp-link .label { font-size: 14px; font-weight: 500; color: var(--text); }
.dp-link .arrow {
    display: inline-flex;
    align-items: center;
    color: var(--text-faint);
    flex-shrink: 0;
    transition: color 0.18s ease, transform 0.18s ease;
}
.dp-link:hover .arrow {
    color: var(--accent-color);
    transform: translateX(2px);
}

/* Social pills */
.dp-social {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px; height: 36px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text-dim);
    flex-shrink: 0;
    transition: color 0.18s ease, border-color 0.18s ease;
}
.dp-social:hover {
    color: var(--accent-color);
    border-color: var(--accent-color);
}

/* Accent text highlight */
.dp-accent { color: var(--accent-color); font-weight: 600; }

/* Divider */
.dp-rule {
    height: 1px;
    background: var(--border);
    border: 0;
    margin: 32px auto;
    max-width: 80px;
}

/* Avatar (profile mode) */
.dp-avatar {
    width: 96px; height: 96px;
    border-radius: 50%;
    border: 2px solid rgba(var(--accent-color-rgb), 0.25);
    background: var(--surface);
    color: var(--accent-color);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    font-weight: 600;
    letter-spacing: -0.02em;
    overflow: hidden;
}
.dp-avatar img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
}

/* Fade-in (subtle, reduced motion aware) */
@keyframes dp-fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
}
.fade-in         { animation: dp-fadeIn 0.5s ease-out forwards; }
.fade-in-delay-1 { opacity: 0; animation: dp-fadeIn 0.5s ease-out 0.08s forwards; }
.fade-in-delay-2 { opacity: 0; animation: dp-fadeIn 0.5s ease-out 0.16s forwards; }
.fade-in-delay-3 { opacity: 0; animation: dp-fadeIn 0.5s ease-out 0.24s forwards; }

@media (prefers-reduced-motion: reduce) {
    .fade-in, .fade-in-delay-1, .fade-in-delay-2, .fade-in-delay-3 {
        animation: none;
        opacity: 1;
        transform: none;
    }
    .dp-eyebrow .dot.pulse { animation: none; }
}

/* Chrome (theme toggle / switcher) */
.dp-chrome-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border-radius: 8px;
    background: transparent;
    border: 1px solid transparent;
    color: var(--text-dim);
    cursor: pointer;
    transition: color 0.15s ease, background 0.15s ease, border-color 0.15s ease;
}
.dp-chrome-btn:hover {
    color: var(--text);
    background: var(--surface);
    border-color: var(--border);
}

.dp-theme-switcher {
    appearance: none;
    -webkit-appearance: none;
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text);
    padding: 7px 28px 7px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    max-width: 180px;
    min-width: 0;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M6 9l6 6 6-6'/></svg>");
    background-repeat: no-repeat;
    background-position: right 10px center;
}
.dp-theme-switcher:hover { border-color: var(--border-strong); }
.dp-theme-switcher:focus { outline: none; border-color: var(--accent-color); }
`;
