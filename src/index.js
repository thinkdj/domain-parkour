/**
 * Get domain-specific configuration from Cloudflare KV or Environment Variables
 * Priority:
 * 1. Cloudflare KV storage (DOMAIN_CONFIGS namespace)
 * 2. Environment variables (JSON string or individual properties)
 * 3. Hardcoded defaults (safe public data only)
 *
 * @param {string} hostname - The hostname from the request
 * @param {object} env - Environment variables and KV bindings
 */
async function getDomainConfig(hostname, env) {
  // Try to get config from Cloudflare KV first (most secure)
  if (env.DOMAIN_CONFIGS) {
    try {
      const kvConfig = await env.DOMAIN_CONFIGS.get(hostname, { type: "json" });
      if (kvConfig) {
        return { domain: hostname, ...kvConfig };
      }

      // Try default config from KV
      const defaultConfig = await env.DOMAIN_CONFIGS.get("_default", {
        type: "json",
      });
      if (defaultConfig) {
        return { domain: hostname, ...defaultConfig };
      }
    } catch (e) {
      console.error(`Error fetching from KV: ${e.message}`);
    }
  }

  // Fall back to environment variables (JSON string for the specific domain)
  const envPrefix = hostname
    .replace(/\./g, "_")
    .replace(/-/g, "_")
    .toUpperCase();
  const domainEnvConfig = env[`${envPrefix}_CONFIG`];

  console.log(
    `[Debug] Hostname: ${hostname}, EnvPrefix: ${envPrefix}, Config exists: ${!!domainEnvConfig}`
  );

  if (domainEnvConfig) {
    console.log(`[Debug] Raw config string length: ${domainEnvConfig.length}`);
    console.log(
      `[Debug] Raw config (first 200 chars): ${domainEnvConfig.substring(
        0,
        200
      )}`
    );
    try {
      const parsed = JSON.parse(domainEnvConfig);
      console.log(`[Debug] Parsed config:`, parsed);
      return { domain: hostname, ...parsed };
    } catch (e) {
      console.error(`Error parsing ${envPrefix}_CONFIG: ${e.message}`);
      console.error(
        `[Debug] Char at position 185: ${domainEnvConfig.charCodeAt(185)} (${
          domainEnvConfig[185]
        })`
      );
    }
  }

  // Return minimal default (only non-sensitive data)
  return {
    domain: hostname,
    title: "Premium Domain For Sale",
    description: "This premium domain is available for purchase.",
    registrationDate: null,
    salePrice: null,
    contactEmail: null,
    accentColor: "#3b82f6", // Default blue accent
  };
}

/**
 * Load configuration with environment variable overrides
 * @param {string} hostname - The hostname from the request
 * @param {object} env - Environment variables and KV bindings
 */
async function getConfig(hostname, env) {
  // Get base config for this domain
  const domainConfig = await getDomainConfig(hostname, env);

  // Environment variables can override per-domain settings
  // Use hostname-specific env vars first (e.g., CDN_FARM_TITLE)
  // then fall back to generic env vars (e.g., TITLE)
  const envPrefix = hostname
    .replace(/\./g, "_")
    .replace(/-/g, "_")
    .toUpperCase();

  const registrationDate =
    env[`${envPrefix}_REGISTRATION_DATE`] ||
    env.REGISTRATION_DATE ||
    domainConfig.registrationDate;

  let domainAgeYears = "";
  let domainRegistration = "";
  let domainExtension = "";

  const domain =
    env[`${envPrefix}_DOMAIN`] || env.DOMAIN || domainConfig.domain || hostname;

  // Extract domain extension (but not for IP addresses)
  const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(domain);
  if (domain && !isIpAddress) {
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
    title: env[`${envPrefix}_TITLE`] || env.TITLE || domainConfig.title,
    description:
      env[`${envPrefix}_DESCRIPTION`] ||
      env.DESCRIPTION ||
      domainConfig.description,
    domainAgeYears: domainAgeYears,
    domainRegistration: domainRegistration,
    domainExtension: domainExtension,
    salePrice:
      env[`${envPrefix}_SALE_PRICE`] ||
      env.SALE_PRICE ||
      domainConfig.salePrice,
    contactEmail:
      env[`${envPrefix}_CONTACT_EMAIL`] ||
      env.CONTACT_EMAIL ||
      domainConfig.contactEmail,
    accentColor:
      env[`${envPrefix}_ACCENT_COLOR`] ||
      env.ACCENT_COLOR ||
      domainConfig.accentColor,
  };
}

/**
 * Generate the HTML for the parking page
 */
function generateHTML(cfg) {
  console.log("[Debug] Final config passed to generateHTML:", cfg);
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
        :root {
            --accent-color: ${cfg.accentColor};
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
                    <div class="h-1 w-20 mx-auto accent-gradient rounded-full"></div>
                </div>
                
                <!-- Domain Stats -->
                ${
                  cfg.domainAgeYears || cfg.domainExtension
                    ? `
                <div class="flex flex-wrap justify-center gap-6 sm:gap-8 py-4">
                    ${
                      cfg.domainAgeYears
                        ? `
                    <div class="text-center">
                        <div class="text-2xl sm:text-3xl font-bold dark:text-white text-black">${
                          cfg.domainAgeYears
                        }</div>
                        <div class="text-sm dark:text-gray-500 text-gray-500 mt-1">Years Old</div>
                    </div>
                    ${
                      cfg.domainExtension
                        ? `<div class="hidden sm:block w-px bg-gray-800 dark:bg-gray-800"></div>`
                        : ""
                    }
                    `
                        : ""
                    }
                    ${
                      cfg.domainExtension
                        ? `
                    <div class="text-center">
                        <div class="text-2xl sm:text-3xl font-bold dark:text-white text-black">${cfg.domainExtension}</div>
                        <div class="text-sm dark:text-gray-500 text-gray-500 mt-1">Extension</div>
                    </div>
                    `
                        : ""
                    }
                    ${
                      cfg.domainAgeYears || cfg.domainExtension
                        ? `<div class="hidden sm:block w-px bg-gray-800 dark:bg-gray-800"></div>`
                        : ""
                    }
                    <div class="text-center">
                        <div class="text-2xl sm:text-3xl font-bold dark:text-white text-black">SEO</div>
                        <div class="text-sm dark:text-gray-500 text-gray-500 mt-1">Friendly</div>
                    </div>
                </div>
                `
                    : ""
                }
                
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
                       class="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg accent-bg text-white font-medium transition-all hover:scale-105 hover:shadow-lg">
                        <span>Reach Out</span>
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
    // Extract hostname from the request
    const url = new URL(request.url);
    const hostname = url.hostname;

    // Get configuration for this specific domain
    const cfg = await getConfig(hostname, env);

    const html = generateHTML(cfg);

    return new Response(html, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
        "cache-control": "public, max-age=3600",
        "x-served-domain": hostname, // Debug header to see which domain was detected
      },
    });
  },
};
