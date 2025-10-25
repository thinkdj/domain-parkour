/**
 * Get domain-specific configuration from Cloudflare KV or Environment Variables
 * Priority:
 * 1. Local dev config file (config.dev.local.json) - localhost only
 * 2. Cloudflare KV storage (DOMAIN_CONFIGS namespace)
 * 3. Environment variables (JSON string or individual properties)
 * 4. Hardcoded defaults (safe public data only)
 *
 * @param {string} hostname - The hostname from the request
 * @param {object} env - Environment variables and KV bindings
 */
async function getDomainConfig(hostname, env) {
  // Local development: Try to load config.dev.local.json for localhost
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    try {
      const localConfig = await import("../config.dev.local.json");
      if (localConfig && localConfig.default) {
        console.log("[Dev] Using config.dev.local.json");
        return { domain: hostname, ...localConfig.default };
      }
    } catch (e) {
      console.log(
        "[Dev] config.dev.local.json not found or invalid, falling back to KV/env"
      );
    }
  }

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
    mode: "parking", // 'parking', 'coming-soon', or 'landing'
    title: "Premium Domain For Sale",
    description: "This premium domain is available for purchase.",
    registrationDate: null,
    salePrice: null,
    contactEmail: null,
    accentColor: "#3b82f6", // Default blue accent
    // Coming Soon specific fields
    launchDate: null,
    tagline: null,
    features: [],
    socialLinks: {},
    // Landing page specific fields
    subtitle: null,
    links: [],
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

  const domainTitle =
    env[`${envPrefix}_DOMAIN_TITLE`] ||
    env.DOMAIN_TITLE ||
    domainConfig.domainTitle ||
    domain;

  // Extract domain extension from domainTitle (but not for IP addresses)
  const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(domainTitle);
  if (domainTitle && !isIpAddress) {
    const parts = domainTitle.split(".");
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
    domainTitle: domainTitle,
    mode:
      env[`${envPrefix}_MODE`] || env.MODE || domainConfig.mode || "parking",
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
    // Coming Soon specific fields
    launchDate:
      env[`${envPrefix}_LAUNCH_DATE`] ||
      env.LAUNCH_DATE ||
      domainConfig.launchDate,
    tagline: env[`${envPrefix}_TAGLINE`] || env.TAGLINE || domainConfig.tagline,
    features: domainConfig.features || [],
    socialLinks: domainConfig.socialLinks || {},
    // Landing page specific fields
    subtitle:
      env[`${envPrefix}_SUBTITLE`] || env.SUBTITLE || domainConfig.subtitle,
    links: domainConfig.links || [],
  };
}

/**
 * Generate the HTML for the coming soon page
 */
function generateComingSoonHTML(cfg) {
  // Calculate countdown if launch date is provided
  let countdownScript = "";
  let countdownHTML = "";

  if (cfg.launchDate) {
    countdownHTML = `
    <!-- Countdown Timer -->
    <div id="countdown" class="flex justify-center gap-4 sm:gap-8 py-8">
      <div class="text-center">
        <div class="text-4xl sm:text-5xl font-bold dark:text-white text-black" id="days">00</div>
        <div class="text-sm dark:text-gray-500 text-gray-500 mt-2">Days</div>
      </div>
      <div class="text-4xl sm:text-5xl font-bold dark:text-gray-700 text-gray-300">:</div>
      <div class="text-center">
        <div class="text-4xl sm:text-5xl font-bold dark:text-white text-black" id="hours">00</div>
        <div class="text-sm dark:text-gray-500 text-gray-500 mt-2">Hours</div>
      </div>
      <div class="text-4xl sm:text-5xl font-bold dark:text-gray-700 text-gray-300">:</div>
      <div class="text-center">
        <div class="text-4xl sm:text-5xl font-bold dark:text-white text-black" id="minutes">00</div>
        <div class="text-sm dark:text-gray-500 text-gray-500 mt-2">Minutes</div>
      </div>
      <div class="text-4xl sm:text-5xl font-bold dark:text-gray-700 text-gray-300">:</div>
      <div class="text-center">
        <div class="text-4xl sm:text-5xl font-bold dark:text-white text-black" id="seconds">00</div>
        <div class="text-sm dark:text-gray-500 text-gray-500 mt-2">Seconds</div>
      </div>
    </div>`;

    countdownScript = `
    // Countdown Timer
    const launchDate = new Date('${cfg.launchDate}').getTime();
    
    function updateCountdown() {
      const now = new Date().getTime();
      const distance = launchDate - now;
      
      if (distance < 0) {
        document.getElementById('countdown').innerHTML = '<div class="text-2xl dark:text-white text-black font-bold">We\\'re Live!</div>';
        return;
      }
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      document.getElementById('days').textContent = days.toString().padStart(2, '0');
      document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
      document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
      document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
    `;
  }

  // Features section
  let featuresHTML = "";
  if (cfg.features && cfg.features.length > 0) {
    featuresHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
      ${cfg.features
        .map(
          (feature) => `
      <div class="p-6 rounded-xl border dark:border-gray-800 border-gray-200 dark:bg-gray-900/50 bg-gray-50/50 backdrop-blur-sm">
        <div class="text-lg font-semibold dark:text-white text-black mb-2">${
          feature.title || feature
        }</div>
        ${
          feature.description
            ? `<div class="text-sm dark:text-gray-400 text-gray-600">${feature.description}</div>`
            : ""
        }
      </div>
      `
        )
        .join("")}
    </div>`;
  }

  // Social links
  let socialHTML = "";
  if (cfg.socialLinks && Object.keys(cfg.socialLinks).length > 0) {
    const socialIcons = {
      twitter:
        '<path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>',
      facebook:
        '<path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>',
      instagram:
        '<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>',
      linkedin:
        '<path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/>',
      github:
        '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>',
      email:
        '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
    };

    socialHTML = `
    <div class="flex justify-center gap-4 mt-8">
      ${Object.entries(cfg.socialLinks)
        .map(
          ([platform, url]) => `
      <a href="${url}" target="_blank" rel="noopener noreferrer" 
         class="p-3 rounded-lg border dark:border-gray-800 border-gray-200 dark:bg-gray-900 bg-gray-50 dark:hover:bg-gray-800 hover:bg-gray-100 transition-all duration-200">
        <svg class="w-5 h-5 dark:text-gray-400 text-gray-600" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          ${socialIcons[platform.toLowerCase()] || socialIcons.email}
        </svg>
      </a>
      `
        )
        .join("")}
    </div>`;
  }

  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${cfg.domainTitle} - Coming Soon</title>
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
            background: radial-gradient(ellipse 100% 60% at 50% 110%, color-mix(in srgb, var(--accent-color) 15%, transparent), transparent 80%),
                        radial-gradient(ellipse 100% 60% at 50% -10%, color-mix(in srgb, var(--accent-color) 15%, transparent), transparent 80%);
        }

        .dark .bg-gradient {
            background: radial-gradient(ellipse 100% 60% at 50% 110%, color-mix(in srgb, var(--accent-color) 25%, transparent), transparent 80%),
                        radial-gradient(ellipse 100% 60% at 50% -10%, color-mix(in srgb, var(--accent-color) 25%, transparent), transparent 80%);
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

    <!-- Main Container -->
    <div class="flex items-center justify-center min-h-screen px-6 py-24">
        <div class="max-w-5xl w-full">
            <!-- Status Badge -->
            <div class="flex justify-center mb-8">
                <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border dark:border-gray-800 border-gray-200 dark:bg-gray-900 bg-gray-50">
                    <div class="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>
                    <span class="text-xs font-medium dark:text-gray-400 text-gray-600">Coming Soon</span>
                </div>
            </div>
            
            <!-- Main Content -->
            <div class="text-center space-y-8">
                <!-- Domain/Brand Name -->
                <div class="space-y-4 float-animation">
                    <h1 class="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight dark:text-white text-black">
                        ${cfg.domainTitle}
                    </h1>
                    <div class="h-1 w-20 mx-auto accent-gradient rounded-full"></div>
                </div>
                
                <!-- Tagline -->
                ${
                  cfg.tagline
                    ? `
                <h2 class="text-2xl sm:text-3xl md:text-4xl font-semibold dark:text-gray-100 text-gray-900 max-w-3xl mx-auto">
                    ${cfg.tagline}
                </h2>
                `
                    : ""
                }
                
                <!-- Title/Subtitle -->
                <p class="text-lg sm:text-xl md:text-2xl dark:text-gray-400 text-gray-600 max-w-2xl mx-auto">
                    ${cfg.title}
                </p>
                
                <!-- Description -->
                ${
                  cfg.description
                    ? `
                <p class="text-base sm:text-lg dark:text-gray-500 text-gray-500 max-w-xl mx-auto">
                    ${cfg.description}
                </p>
                `
                    : ""
                }
                
                ${countdownHTML}
                
                ${socialHTML}
                
                ${featuresHTML}
            </div>
            
            <!-- Footer -->
            <div class="mt-20 text-center">
                <p class="text-sm dark:text-gray-600 text-gray-400">
                    ${
                      cfg.launchDate
                        ? "Stay tuned for our launch"
                        : "Something exciting is coming"
                    }
                </p>
            </div>
        </div>
    </div>

    <script>
        ${countdownScript}
        
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
    </script>
</body>
</html>`;
}

/**
 * Generate the HTML for the landing page
 */
function generateLandingHTML(cfg) {
  // Links section
  let linksHTML = "";
  if (cfg.links && cfg.links.length > 0) {
    linksHTML = `
    <div class="flex flex-wrap justify-center gap-4 mt-12 max-w-2xl mx-auto">
      ${cfg.links
        .map(
          (link) => `
      <a href="${link.url}" target="_blank" rel="noopener noreferrer" 
         class="inline-flex items-center gap-2 px-6 py-3 rounded-lg border dark:border-gray-800 border-gray-200 dark:bg-gray-900 bg-gray-50 dark:hover:bg-gray-800 hover:bg-gray-100 transition-all duration-200 group">
        <span class="font-medium dark:text-white text-black">${link.title}</span>
        <svg class="w-4 h-4 dark:text-gray-400 text-gray-600 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
        </svg>
      </a>
      `
        )
        .join("")}
    </div>`;
  }

  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${cfg.domainTitle}</title>
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
            background: radial-gradient(ellipse 100% 60% at 50% 110%, color-mix(in srgb, var(--accent-color) 10%, transparent), transparent 80%),
                        radial-gradient(ellipse 100% 60% at 50% -10%, color-mix(in srgb, var(--accent-color) 10%, transparent), transparent 80%);
        }

        .dark .bg-gradient {
            background: radial-gradient(ellipse 100% 60% at 50% 110%, color-mix(in srgb, var(--accent-color) 20%, transparent), transparent 80%),
                        radial-gradient(ellipse 100% 60% at 50% -10%, color-mix(in srgb, var(--accent-color) 20%, transparent), transparent 80%);
        }

        .accent-gradient {
            background: linear-gradient(to right, var(--accent-color), color-mix(in srgb, var(--accent-color), #a855f7 50%));
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
        <div class="max-w-4xl w-full text-center">
            <!-- Domain Name -->
            <div class="space-y-4">
                <h1 class="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight dark:text-white text-black">
                    ${cfg.domainTitle}
                </h1>
                <div class="h-1 w-20 mx-auto accent-gradient rounded-full"></div>
            </div>
            
            <!-- Title -->
            <h2 class="text-2xl sm:text-3xl md:text-4xl font-semibold dark:text-gray-100 text-gray-900 max-w-3xl mx-auto mt-8">
                ${cfg.title}
            </h2>
            
            <!-- Subtitle/Description -->
            ${
              cfg.subtitle
                ? `
            <p class="text-lg sm:text-xl dark:text-gray-400 text-gray-600 max-w-2xl mx-auto mt-6">
                ${cfg.subtitle}
            </p>
            `
                : ""
            }
            
            ${
              cfg.description
                ? `
            <p class="text-base sm:text-lg dark:text-gray-500 text-gray-500 max-w-xl mx-auto mt-4">
                ${cfg.description}
            </p>
            `
                : ""
            }
            
            ${linksHTML}
            
            <!-- Footer -->
            <div class="mt-20 text-center">
                <p class="text-sm dark:text-gray-600 text-gray-400">
                    ${cfg.domainTitle}
                </p>
            </div>
        </div>
    </div>

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
    </script>
</body>
</html>`;
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
    <title>${cfg.domainTitle} - ${cfg.title}</title>
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
                        ${cfg.domainTitle}
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

    // Generate HTML based on mode
    let html;
    if (cfg.mode === "coming-soon") {
      html = generateComingSoonHTML(cfg);
    } else if (cfg.mode === "landing") {
      html = generateLandingHTML(cfg);
    } else {
      // Default to parking mode
      html = generateHTML(cfg);
    }

    return new Response(html, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
        "cache-control": "public, max-age=3600",
        "x-served-domain": hostname, // Debug header to see which domain was detected
        "x-page-mode": cfg.mode, // Debug header to see which mode is active
      },
    });
  },
};
