import { renderBase } from './base.js';

/**
 * Generate the links section
 */
function renderLinks(links) {
  if (!links || links.length === 0) return '';

  return `
    <div class="flex flex-wrap justify-center gap-4 mt-12 max-w-2xl mx-auto">
      ${links
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

/**
 * Generate the content for the landing page
 */
function renderLandingContent(cfg) {
  return `
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

            ${renderLinks(cfg.links)}

            <!-- Footer -->
            <div class="mt-20 text-center">
                <p class="text-sm dark:text-gray-600 text-gray-400">
                    ${cfg.domainTitle}
                </p>
            </div>
        </div>
    </div>`;
}

/**
 * Generate the HTML for the landing page
 */
export function generateLandingHTML(cfg) {
  const content = renderLandingContent(cfg);

  return renderBase({
    title: cfg.domainTitle,
    accentColor: cfg.accentColor,
    content,
    scripts: ''
  });
}
