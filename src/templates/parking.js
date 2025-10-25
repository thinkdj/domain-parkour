import { renderBase } from './base.js';

/**
 * Generate the content for the parking page
 */
function renderParkingContent(cfg) {
  return `
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
                    <span class="font-normal block mt-2 mb-4">${cfg.description}</span>
                    This domain is for sale for <strong>${cfg.salePrice}</strong>
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
