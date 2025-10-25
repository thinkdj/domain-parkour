/**
 * Base HTML layout with common head, styles, and structure
 */
export function renderBase({ title, accentColor, content, scripts = '' }) {
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
            --accent-color: ${accentColor};
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
            transition: background-color 0.3s ease, color 0.3s ease;
        }

        .bg-gradient {
            background: radial-gradient(ellipse 100% 60% at 80% 110%, color-mix(in srgb, var(--accent-color) 10%, transparent), transparent 80%),
                        radial-gradient(ellipse 100% 60% at 80% -10%, color-mix(in srgb, var(--accent-color) 10%, transparent), transparent 80%);
        }

        .dark .bg-gradient {
            background: radial-gradient(ellipse 100% 60% at 80% 110%, color-mix(in srgb, var(--accent-color) 20%, transparent), transparent 80%),
                        radial-gradient(ellipse 100% 60% at 80% -10%, color-mix(in srgb, var(--accent-color) 20%, transparent), transparent 80%);
        }

        .accent-gradient {
            background: linear-gradient(to right, var(--accent-color), color-mix(in srgb, var(--accent-color), #a855f7 50%));
        }

        .accent-bg {
            background-color: var(--accent-color);
        }

        .accent-bg:hover {
            background-color: color-mix(in srgb, var(--accent-color), black 10%);
        }

        .dark .accent-bg:hover {
            background-color: color-mix(in srgb, var(--accent-color), white 10%);
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }

        .float-animation {
            animation: float 6s ease-in-out infinite;
        }
    </style>
</head>
<body class="min-h-screen transition-colors dark:bg-black bg-white">
    <div class="fixed inset-0 bg-gradient pointer-events-none"></div>

    <!-- Dark Mode Toggle -->
    <div class="fixed top-6 right-6 z-50">
        <button id="theme-toggle" class="p-2.5 rounded-lg border dark:border-gray-800 border-gray-200 dark:bg-gray-900 bg-gray-50 dark:hover:bg-gray-800 hover:bg-gray-100 transition-all duration-200">
            <svg id="theme-toggle-dark-icon" class="hidden w-5 h-5 dark:text-gray-400 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
            </svg>
            <svg id="theme-toggle-light-icon" class="hidden w-5 h-5 dark:text-gray-400 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fill-rule="evenodd" clip-rule="evenodd"></path>
            </svg>
        </button>
    </div>

    ${content}

    <script>
        // Dark mode toggle functionality
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

        ${scripts}
    </script>
</body>
</html>`;
}
