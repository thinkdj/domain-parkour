import coreStyles from "../styles/core.css?raw";

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '59, 130, 246'; // Default blue RGB
}

/**
 * Render theme switcher for dev mode
 */
function renderThemeSwitcher(allThemes) {
  if (!allThemes || allThemes.length === 0) return '';

  return `
    <!-- Theme Switcher (Dev Mode Only) -->
    <div class="fixed top-6 left-6 z-50">
      <div class="relative">
        <select id="theme-switcher"
                class="px-4 py-2 pr-8 rounded-md dark:bg-gray-800 bg-white dark:text-gray-200 text-gray-800 border dark:border-gray-700 border-gray-300 text-sm font-medium appearance-none cursor-pointer hover:dark:bg-gray-700 hover:bg-gray-50 transition-all duration-200"
                style="min-width: 200px;">
          ${allThemes.map((theme, index) => `
            <option value="${index}">${theme.name}</option>
          `).join('')}
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 dark:text-gray-400 text-gray-600">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>
    </div>
  `;
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
    <script>
        tailwind.config = {
            darkMode: 'class',
        }
    </script>
    <style>
        :root {
            --accent-color: ${accent};
            --accent-color-rgb: ${accentRgb};
        }

        ${coreStyles}

        ${additionalStyles}
    </style>
</head>
<body class="min-h-screen dark:bg-[#191919] bg-white transition-colors duration-300">

    <!-- Theme Switcher (Dev Mode) -->
    ${renderThemeSwitcher(allThemes)}

    <!-- Theme Toggle - Minimalist -->
    <div class="fixed top-6 right-6 z-50">
        <button id="theme-toggle"
                class="p-2 rounded-md dark:text-gray-400 text-gray-600 dark:hover:text-gray-200 hover:text-gray-900 dark:hover:bg-gray-800 hover:bg-gray-100 transition-all duration-200"
                aria-label="Toggle theme">
            <svg id="theme-toggle-dark-icon" class="hidden w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
            </svg>
            <svg id="theme-toggle-light-icon" class="hidden w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fill-rule="evenodd" clip-rule="evenodd"></path>
            </svg>
        </button>
    </div>

    ${content}

    <script>
        // Embed theme data for dev mode
        ${allThemes ? `window.__ALL_THEMES__ = ${JSON.stringify(allThemes)};` : ''}

        // Dark mode toggle
        const themeToggleBtn = document.getElementById('theme-toggle');
        const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
        const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

        const currentTheme = localStorage.getItem('theme') || 'dark';

        if (currentTheme === 'dark') {
            document.documentElement.classList.add('dark');
            themeToggleLightIcon.classList.remove('hidden');
        } else {
            document.documentElement.classList.remove('dark');
            themeToggleDarkIcon.classList.remove('hidden');
        }

        themeToggleBtn.addEventListener('click', function() {
            themeToggleDarkIcon.classList.toggle('hidden');
            themeToggleLightIcon.classList.toggle('hidden');

            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            }
        });

        // Theme switcher for dev mode
        const themeSwitcher = document.getElementById('theme-switcher');
        if (themeSwitcher && window.__ALL_THEMES__) {
            // Get current theme index from URL or localStorage
            const urlParams = new URLSearchParams(window.location.search);
            const urlThemeIndex = urlParams.get('themeIndex');
            const savedThemeIndex = localStorage.getItem('devThemeIndex') || '0';
            const currentThemeIndex = urlThemeIndex !== null ? urlThemeIndex : savedThemeIndex;

            themeSwitcher.value = currentThemeIndex;

            themeSwitcher.addEventListener('change', function() {
                const themeIndex = this.value;
                // Save to localStorage
                localStorage.setItem('devThemeIndex', themeIndex);

                // Reload with query parameter
                const newUrl = new URL(window.location);
                newUrl.searchParams.set('themeIndex', themeIndex);
                window.location.href = newUrl.toString();
            });
        }

        ${scripts}
    </script>
</body>
</html>`;
}
