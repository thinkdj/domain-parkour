/**
 * Minimal base HTML template renderer.
 */
export function renderBase({ title, accentColor, content, scripts = '', additionalStyles = '' }) {
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
            --accent-color: ${accentColor || '#3b82f6'};
        }

        * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
        }

        /* Smooth fade-in animations */
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .fade-in {
            animation: fadeIn 0.6s ease-out forwards;
        }

        .fade-in-delay-1 {
            opacity: 0;
            animation: fadeIn 0.6s ease-out 0.1s forwards;
        }

        .fade-in-delay-2 {
            opacity: 0;
            animation: fadeIn 0.6s ease-out 0.2s forwards;
        }

        .fade-in-delay-3 {
            opacity: 0;
            animation: fadeIn 0.6s ease-out 0.3s forwards;
        }

        /* Accent underline for titles */
        .accent-underline {
            position: relative;
            display: inline-block;
        }

        .accent-underline::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 0;
            right: 0;
            height: 3px;
            background: var(--accent-color);
            border-radius: 2px;
            opacity: 0.8;
        }

        /* Accent button styles */
        .accent-button {
            background: var(--accent-color);
            transition: all 0.2s ease;
        }

        .accent-button:hover {
            opacity: 0.9;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        ${additionalStyles}
    </style>
</head>
<body class="min-h-screen dark:bg-[#191919] bg-white transition-colors duration-300">

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

        ${scripts}
    </script>
</body>
</html>`;
}
