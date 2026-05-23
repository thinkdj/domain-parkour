import { coreStyles } from "../styles/core.js";

/**
 * Convert hex color to "r, g, b" string (used for translucent shadows etc.)
 */
function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
  return m
    ? `${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}`
    : "59, 130, 246";
}

const SUN_SVG = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>`;

const MOON_SVG = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

function renderThemeSwitcher(allThemes) {
  if (!allThemes || allThemes.length === 0) return "";
  return `
    <div class="fixed top-4 left-4 z-50 hidden sm:block">
      <select id="theme-switcher" class="dp-theme-switcher" aria-label="Switch theme">
        ${allThemes
          .map(
            (t, i) =>
              `<option value="${i}">${t.name || `Theme ${i + 1}`}</option>`,
          )
          .join("")}
      </select>
    </div>`;
}

function renderThemeToggle() {
  return `
    <div class="fixed top-4 right-4 z-50">
      <button id="theme-toggle" class="dp-chrome-btn" aria-label="Toggle theme">
        <span id="theme-toggle-light-icon" class="hidden"><i data-lucide="sun" width="18" height="18" stroke-width="1.6" aria-hidden="true"></i></span>
        <span id="theme-toggle-dark-icon"  class="hidden"><i data-lucide="moon" width="18" height="18" stroke-width="1.6" aria-hidden="true"></i></span>
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
  const accent = accentColor || "#3b82f6";
  const accentRgb = hexToRgb(accent);

  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>tailwind.config = { darkMode: 'class' };</script>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
    <style>
        :root { --accent-color: ${accent}; --accent-color-rgb: ${accentRgb}; }
        ${coreStyles}
        ${additionalStyles}
    </style>
</head>
<body class="min-h-screen transition-colors duration-200">

    ${renderThemeSwitcher(allThemes)}
    ${renderThemeToggle()}

    ${content}

    <script>
        lucide.createIcons();

        ${allThemes ? `window.__ALL_THEMES__ = ${JSON.stringify(allThemes)};` : ""}

        // Theme toggle
        (function () {
            const btn = document.getElementById('theme-toggle');
            const sun = document.getElementById('theme-toggle-light-icon');
            const moon = document.getElementById('theme-toggle-dark-icon');
            const stored = localStorage.getItem('theme') || 'dark';
            const apply = (t) => {
                document.documentElement.classList.toggle('dark', t === 'dark');
                sun.classList.toggle('hidden', t !== 'dark');
                moon.classList.toggle('hidden', t === 'dark');
            };
            apply(stored);
            btn.addEventListener('click', () => {
                const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
                localStorage.setItem('theme', next);
                apply(next);
            });
        })();

        // Theme switcher (dev mode)
        (function () {
            const sw = document.getElementById('theme-switcher');
            if (!sw || !window.__ALL_THEMES__) return;
            const params = new URLSearchParams(location.search);
            const urlIdx = params.get('themeIndex');
            const savedIdx = localStorage.getItem('devThemeIndex') || '0';
            sw.value = urlIdx !== null ? urlIdx : savedIdx;
            sw.addEventListener('change', () => {
                localStorage.setItem('devThemeIndex', sw.value);
                const url = new URL(location.href);
                url.searchParams.set('themeIndex', sw.value);
                location.href = url.toString();
            });
        })();

        ${scripts}
    </script>
</body>
</html>`;
}
