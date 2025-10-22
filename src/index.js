import config from "../config.json";

/**
 * Load configuration with environment variable overrides
 */
function getConfig(env) {
  const registrationDate = env.REGISTRATION_DATE || config.registrationDate;
  let domainAgeYears = "";
  let domainRegistration = "";
  let domainExtension = "";

  const domain = env.DOMAIN || config.domain;
  if (domain) {
    const parts = domain.split(".");
    if (parts.length > 1) {
      domainExtension = `.${parts.pop()}`;
    }
  }

  if (registrationDate) {
    const regDate = new Date(registrationDate);
    const ageInMs = Date.now() - regDate.getTime();
    const ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365.25);
    domainAgeYears = `${Math.floor(ageInYears)}+`;
    domainRegistration = `Registered in ${regDate.getFullYear()}`;
  }

  return {
    domain: domain,
    title: env.TITLE || config.title,
    description: env.DESCRIPTION || config.description,
    domainAgeYears: domainAgeYears,
    domainRegistration: domainRegistration,
    domainExtension: domainExtension,
    salePrice: env.SALE_PRICE || config.salePrice,
    contactEmail: env.CONTACT_EMAIL || config.contactEmail,
    backgroundColor: env.BG_COLOR || config.backgroundColor,
    textColor: env.TEXT_COLOR || config.textColor,
    accentColor: env.ACCENT_COLOR || config.accentColor,
  };
}

/**
 * Generate the HTML for the parking page
 */
function generateHTML(cfg) {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${cfg.domain} - ${cfg.title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
        }
    </script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
            transition: background-color 0.3s ease, color 0.3s ease;
        }
        
        .bg-gradient {
            background: radial-gradient(ellipse 100% 60% at 80% 110%, rgba(59, 130, 246, 0.1), transparent 80%),
                        radial-gradient(ellipse 100% 60% at 80% -10%, rgba(168, 85, 247, 0.1), transparent 80%);
        }
        
        .dark .bg-gradient {
            background: radial-gradient(ellipse 100% 60% at 80% 110%, rgba(59, 130, 246, 0.2), transparent 80%),
                        radial-gradient(ellipse 100% 60% at 80% -10%, rgba(168, 85, 247, 0.2), transparent 80%);
        }
        
        .vercel-border {
            position: relative;
        }
        
        .vercel-border::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 0.5rem;
            padding: 1px;
            background: linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
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

    <!-- Main Container -->
    <div class="flex items-center justify-center min-h-screen px-6 py-24">
        <div class="max-w-4xl w-full">
            <!-- Domain Badge -->
            ${
              cfg.domainRegistration
                ? `
            <div class="flex justify-center mb-8">
                <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border dark:border-gray-800 border-gray-200 dark:bg-gray-900 bg-gray-50">
                    <div class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span class="text-xs font-medium dark:text-gray-400 text-gray-600">${cfg.domainRegistration}</span>
                </div>
            </div>
            `
                : ""
            }
            
            <!-- Main Content -->
            <div class="text-center space-y-8">
                <!-- Domain Name -->
                <div class="space-y-4">
                    <h1 class="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight dark:text-white text-black">
                        ${cfg.domain}
                    </h1>
                    <div class="h-1 w-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                </div>
                
                <!-- Domain Stats -->
                <div class="flex flex-wrap justify-center gap-6 sm:gap-8 py-4">
                    <div class="text-center">
                        <div class="text-2xl sm:text-3xl font-bold dark:text-white text-black">${
                          cfg.domainAgeYears
                        }</div>
                        <div class="text-sm dark:text-gray-500 text-gray-500 mt-1">Years Old</div>
                    </div>
                    <div class="hidden sm:block w-px bg-gray-800 dark:bg-gray-800"></div>
                    <div class="text-center">
                        <div class="text-2xl sm:text-3xl font-bold dark:text-white text-black">${
                          cfg.domainExtension
                        }</div>
                        <div class="text-sm dark:text-gray-500 text-gray-500 mt-1">Extension</div>
                    </div>
                    <div class="hidden sm:block w-px bg-gray-800 dark:bg-gray-800"></div>
                    <div class="text-center">
                        <div class="text-2xl sm:text-3xl font-bold dark:text-white text-black">SEO</div>
                        <div class="text-sm dark:text-gray-500 text-gray-500 mt-1">Friendly</div>
                    </div>
                </div>
                
                <!-- Title -->
                <h2 class="text-2xl sm:text-3xl md:text-4xl font-semibold dark:text-gray-100 text-gray-900 max-w-3xl mx-auto">
                    ${cfg.title}
                </h2>
                
                <!-- Description -->
                <p class="text-lg sm:text-xl md:text-2xl dark:text-gray-400 text-gray-600 max-w-2xl mx-auto">
                    <span class="font-normal block mt-2 mb-4">${
                      cfg.description
                    }</span>
                    This domain is for sale for <strong>${
                      cfg.salePrice
                    }</strong>
                    </p>
                
                <!-- Contact CTA -->
                ${
                  cfg.contactEmail
                    ? `
                <div class="pt-6">
                    <a id="contact-link" href="#" 
                       class="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg dark:bg-white bg-black dark:text-black text-white font-medium transition-all hover:scale-105 hover:shadow-lg dark:hover:shadow-white/20 hover:shadow-black/20">
                        <span>Contact Us</span>
                        <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                        </svg>
                    </a>
                </div>
                `
                    : ""
                }
            </div>
            
            <!-- Footer -->
            <div class="mt-20 text-center">
                <p class="text-sm dark:text-gray-600 text-gray-400">
                    This domain is available for purchase
                </p>
            </div>
        </div>
    </div>

    <script>
        // Email protection - inject mailto link via JavaScript
        ${
          cfg.contactEmail
            ? `
        (function() {
            const user = '${cfg.contactEmail.split("@")[0]}';
            const domain = '${cfg.contactEmail.split("@")[1]}';
            const email = user + '@' + domain;
            const link = document.getElementById('contact-link');
            if (link) {
                link.href = 'mailto:' + email;
            }
        })();
        `
            : ""
        }
        
        // Dark mode toggle functionality
        const themeToggleBtn = document.getElementById('theme-toggle');
        const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
        const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
        
        // Check for saved theme preference or default to dark mode
        const currentTheme = localStorage.getItem('theme') || 'dark';
        
        if (currentTheme === 'dark') {
            document.documentElement.classList.add('dark');
            themeToggleLightIcon.classList.remove('hidden');
        } else {
            document.documentElement.classList.remove('dark');
            themeToggleDarkIcon.classList.remove('hidden');
        }
        
        themeToggleBtn.addEventListener('click', function() {
            // Toggle icons
            themeToggleDarkIcon.classList.toggle('hidden');
            themeToggleLightIcon.classList.toggle('hidden');
            
            // Toggle dark mode
            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            }
        });
    </script>
</body>
</html>`;
}

export default {
  async fetch(request, env, ctx) {
    const cfg = getConfig(env);

    const html = generateHTML(cfg);

    return new Response(html, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
        "cache-control": "public, max-age=3600",
      },
    });
  },
};
