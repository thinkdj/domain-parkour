import { coreStyles } from "../styles/core.js";
import { icon } from "../icons.js";
import { escapeHtml, safeAccentColor, serializeForScript } from "../safety.js";

/**
 * The design system's mark on a tile in the configured accent — see
 * /brand/mark.svg. The accent is the owner's, already through safeAccentColor.
 */
function favicon(accent) {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'>` +
    `<rect width='48' height='48' rx='11' fill='${accent}'/>` +
    `<g fill='none' stroke='white' stroke-width='5.5'>` +
    `<path d='M9.75 10V38' opacity='.22'/>` +
    `<path d='M18.25 10V38' opacity='.45'/>` +
    `<path d='M26.75 10V38'/>` +
    `<path d='M26.75 12.75H32a6.25 6.25 0 0 1 0 12.5h-5.25'/>` +
    `</g></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function minifyStyles(styles) {
  return styles
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

function renderThemeSwitcher(allThemes) {
  if (!allThemes?.length) return "";

  return `
    <div class="dp-chrome dp-chrome-left">
      <select id="theme-switcher" class="dp-theme-switcher" aria-label="Preview another template">
        ${allThemes
          .map(
            (theme, index) =>
              `<option value="${index}">${escapeHtml(theme?.name || `Template ${index + 1}`)}</option>`,
          )
          .join("")}
      </select>
    </div>`;
}

function renderThemeToggle() {
  return `
    <div class="dp-chrome dp-chrome-right">
      <button id="theme-toggle" class="dp-chrome-btn" type="button" aria-label="Switch color theme">
        <span id="theme-toggle-light-icon" hidden>${icon("sun", { size: 18 })}</span>
        <span id="theme-toggle-dark-icon" hidden>${icon("moon", { size: 18 })}</span>
      </button>
    </div>`;
}

export function renderBase({
  title,
  accentColor,
  content,
  scripts = "",
  additionalStyles = "",
  allThemes = null,
}) {
  // The configured accent replaces --color-primary and nothing else. Hovers,
  // tints, rings, and soft backgrounds derive from it with color-mix().
  const accent = safeAccentColor(accentColor) || "#e8590c";
  const styles = minifyStyles(`${coreStyles}\n${additionalStyles}`);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="color-scheme" content="light dark">
    <meta name="theme-color" content="${escapeHtml(accent)}">
    <link rel="icon" href="${escapeHtml(favicon(accent))}">
    <title>${escapeHtml(title)}</title>
    <script>
      /* Only an explicit choice needs restoring. Without one the page follows
         the OS through color-scheme, so there is nothing to set before paint
         and no flash of the wrong appearance to prevent. */
      (function () {
        try {
          const saved = localStorage.getItem('theme');
          if (saved) document.documentElement.dataset.theme = saved;
        } catch (e) {}
      })();
    </script>
    <style>
        ${styles}
        /* Last, not first. The token block declares its own --color-primary,
           so an accent placed above it loses the cascade and the page silently
           renders in brand orange. Declared here it wins, and because every
           hover/tint/ring is a color-mix() of --color-primary on this same
           :root, they all re-derive from the owner's colour. */
        :root { --color-primary: ${accent}; }
    </style>
</head>
<body>
    ${renderThemeSwitcher(allThemes)}
    ${renderThemeToggle()}
    ${content}

    <script>
        ${allThemes ? `window.__ALL_THEMES__ = ${serializeForScript(allThemes)};` : ""}

        (function () {
            const button = document.getElementById('theme-toggle');
            const sun = document.getElementById('theme-toggle-light-icon');
            const moon = document.getElementById('theme-toggle-dark-icon');
            if (!button || !sun || !moon) return;

            const root = document.documentElement;
            const media = matchMedia('(prefers-color-scheme: dark)');
            /* No stored choice means no attribute at all and the OS decides,
               so the current state has to be read from the resolved scheme. */
            const isDark = () => root.dataset.theme
                ? root.dataset.theme === 'dark'
                : media.matches;

            const syncButton = () => {
                const dark = isDark();
                sun.hidden = !dark;
                moon.hidden = dark;
                button.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
                button.setAttribute('aria-pressed', String(dark));
            };
            syncButton();

            button.addEventListener('click', () => {
                const next = isDark() ? 'light' : 'dark';
                root.dataset.theme = next;
                try { localStorage.setItem('theme', next); } catch (e) {}
                syncButton();
            });
            media.addEventListener('change', () => { if (!root.dataset.theme) syncButton(); });
        })();

        (function () {
            const switcher = document.getElementById('theme-switcher');
            if (!switcher || !window.__ALL_THEMES__) return;

            const params = new URLSearchParams(location.search);
            const requested = params.get('themeIndex');
            const saved = localStorage.getItem('devThemeIndex') || '0';
            switcher.value = requested !== null ? requested : saved;
            switcher.addEventListener('change', () => {
                localStorage.setItem('devThemeIndex', switcher.value);
                const url = new URL(location.href);
                url.searchParams.set('themeIndex', switcher.value);
                location.href = url.toString();
            });
        })();

        ${scripts}
    </script>
</body>
</html>`;

  return html.replace(/>\s+</g, "><").trim();
}
