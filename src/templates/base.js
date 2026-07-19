import { coreStyles } from "../styles/core.js";

const SUN_ICON = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`;
const MOON_ICON = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/></svg>`;

/** Convert a six-digit hex color to the RGB tuple used by translucent accents. */
function hexToRgb(hex) {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
  return match
    ? `${parseInt(match[1], 16)}, ${parseInt(match[2], 16)}, ${parseInt(match[3], 16)}`
    : "59, 130, 246";
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
              `<option value="${index}">${theme.name || `Template ${index + 1}`}</option>`,
          )
          .join("")}
      </select>
    </div>`;
}

function renderThemeToggle() {
  return `
    <div class="dp-chrome dp-chrome-right">
      <button id="theme-toggle" class="dp-chrome-btn" type="button" aria-label="Switch color theme">
        <span id="theme-toggle-light-icon" hidden>${SUN_ICON}</span>
        <span id="theme-toggle-dark-icon" hidden>${MOON_ICON}</span>
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
  const accent = accentColor || "#e8590c";
  const accentRgb = hexToRgb(accent);
  const styles = minifyStyles(`${coreStyles}\n${additionalStyles}`);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="color-scheme" content="light dark">
    <meta name="theme-color" content="${accent}">
    <title>${title}</title>
    <script>
      (function () {
        const saved = localStorage.getItem('theme');
        const preferred = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', (saved || preferred) === 'dark');
      })();
    </script>
    <style>
        :root { --accent-color: ${accent}; --accent-color-rgb: ${accentRgb}; }
        ${styles}
    </style>
</head>
<body>
    ${renderThemeSwitcher(allThemes)}
    ${renderThemeToggle()}
    ${content}

    <script>
        ${allThemes ? `window.__ALL_THEMES__ = ${JSON.stringify(allThemes)};` : ""}

        (function () {
            const button = document.getElementById('theme-toggle');
            const sun = document.getElementById('theme-toggle-light-icon');
            const moon = document.getElementById('theme-toggle-dark-icon');
            if (!button || !sun || !moon) return;

            const apply = (theme) => {
                const isDark = theme === 'dark';
                document.documentElement.classList.toggle('dark', isDark);
                sun.hidden = !isDark;
                moon.hidden = isDark;
                button.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
                button.setAttribute('aria-pressed', String(isDark));
            };

            const saved = localStorage.getItem('theme');
            const preferred = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            apply(saved || preferred);

            button.addEventListener('click', () => {
                const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
                localStorage.setItem('theme', next);
                apply(next);
            });
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
