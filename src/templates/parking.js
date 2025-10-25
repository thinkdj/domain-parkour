import { renderBase } from './base.js';

/**
 * Generate the domain stats badges
 */
function renderDomainStats(cfg) {
  const stats = [];

  if (cfg.domainAgeYears) {
    stats.push({ label: 'Years Old', value: cfg.domainAgeYears });
  }

  if (cfg.domainExtension) {
    stats.push({ label: 'Extension', value: cfg.domainExtension });
  }

  stats.push({ label: 'SEO Ready', value: '✓' });

  if (stats.length === 0) return '';

  return `
    <div class="flex flex-wrap justify-center gap-3 mt-8">
      ${stats.map(stat => `
        <div class="px-4 py-2 rounded-lg border dark:border-gray-800 border-gray-200 dark:bg-transparent bg-white">
          <div class="text-sm font-semibold dark:text-white text-gray-900">${stat.value}</div>
          <div class="text-xs dark:text-gray-500 text-gray-500 mt-0.5">${stat.label}</div>
        </div>
      `).join('')}
    </div>`;
}

/**
 * Generate the content for the parking page
 */
function renderParkingContent(cfg) {
  return `
    <!-- Main Container -->
    <div class="flex items-center justify-center min-h-screen px-6 py-20">
        <div class="w-full max-w-2xl mx-auto">

            <!-- Main Content -->
            <div class="text-center fade-in">
                <!-- Domain Name -->
                <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight dark:text-white text-gray-900 mb-4 accent-underline">
                    ${cfg.domainTitle}
                </h1>

                ${
                  cfg.domainRegistration
                    ? `
                <!-- Registration Note -->
                <p class="text-xs dark:text-gray-600 text-gray-400 mt-2">
                    ${cfg.domainRegistration}
                </p>
                `
                    : ""
                }

                <!-- Domain Stats -->
                <div class="fade-in-delay-1">
                    ${renderDomainStats(cfg)}
                </div>

                <!-- Title -->
                <h2 class="text-xl sm:text-2xl font-semibold dark:text-gray-200 text-gray-800 mt-12 mb-4">
                    ${cfg.title}
                </h2>

                <!-- Description & Price -->
                <div class="space-y-3 mb-8">
                    <p class="text-base dark:text-gray-400 text-gray-600 max-w-xl mx-auto">
                        ${cfg.description}
                    </p>
                    ${cfg.salePrice ? `
                    <p class="text-lg dark:text-gray-300 text-gray-700">
                        Available for <strong class="dark:text-white text-gray-900">${cfg.salePrice}</strong>
                    </p>
                    ` : ''}
                </div>

                <!-- Contact CTA -->
                ${
                  cfg.contactEmail
                    ? `
                <div class="pt-4 fade-in-delay-2">
                    <a id="contact-link" href="#"
                       class="accent-button inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-medium">
                        <span>Get in Touch</span>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                    </a>
                </div>
                `
                    : ""
                }
            </div>

            <!-- Footer -->
            <div class="text-center mt-20 fade-in-delay-3">
                <p class="text-xs dark:text-gray-700 text-gray-400">
                    This premium domain is available for purchase
                </p>
            </div>
        </div>
    </div>`;
}

/**
 * Generate email protection script
 */
function renderParkingScripts(cfg) {
  if (!cfg.contactEmail) return '';

  return `
    // Email protection - inject mailto link via JavaScript
    (function() {
        const user = '${cfg.contactEmail.split("@")[0]}';
        const domain = '${cfg.contactEmail.split("@")[1]}';
        const email = user + '@' + domain;
        const link = document.getElementById('contact-link');
        if (link) {
            link.href = 'mailto:' + email;
        }
    })();
  `;
}

/**
 * Generate the HTML for the parking page
 */
export function generateParkingHTML(cfg) {
  console.log("[Debug] Final config passed to generateParkingHTML:", cfg);

  const content = renderParkingContent(cfg);
  const scripts = renderParkingScripts(cfg);

  return renderBase({
    title: `${cfg.domainTitle} - ${cfg.title}`,
    accentColor: cfg.accentColor,
    content,
    scripts
  });
}
