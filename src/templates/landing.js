import { renderBase } from './base.js';

/**
 * Generate the links section with minimalist cards
 */
function renderLinks(links) {
  if (!links || links.length === 0) return '';

  return `
    <div class="flex flex-col gap-3 mt-12 max-w-xl mx-auto">
      ${links
        .map(
          (link) => `
      <a href="${link.url}" target="_blank" rel="noopener noreferrer"
         class="link-card group relative flex items-center justify-between px-4 py-3.5 rounded-lg border dark:border-gray-800 border-gray-200 dark:bg-transparent bg-white dark:hover:bg-gray-900/30 hover:bg-gray-50">
        <span class="font-medium dark:text-gray-100 text-gray-900">${link.title}</span>
        <svg class="arrow-icon w-4 h-4 dark:text-gray-500 text-gray-400 transition-all group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
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
    <div class="flex items-center justify-center min-h-screen px-6 py-20">
        <div class="w-full max-w-2xl mx-auto">

            <!-- Header Section -->
            <div class="text-center mb-16 fade-in">
                <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight dark:text-white text-gray-900 mb-4 accent-underline">
                    ${cfg.domainTitle}
                </h1>

                ${
                  cfg.title
                    ? `
                <p class="text-lg sm:text-xl dark:text-gray-400 text-gray-600 mt-6">
                    ${cfg.title}
                </p>
                `
                    : ""
                }

                ${
                  cfg.subtitle
                    ? `
                <p class="text-base dark:text-gray-500 text-gray-500 mt-3 max-w-xl mx-auto">
                    ${cfg.subtitle}
                </p>
                `
                    : ""
                }

                ${
                  cfg.description
                    ? `
                <p class="text-sm dark:text-gray-600 text-gray-400 mt-3 max-w-lg mx-auto leading-relaxed">
                    ${cfg.description}
                </p>
                `
                    : ""
                }
            </div>

            <!-- Links Section -->
            <div class="fade-in-delay-1">
                ${renderLinks(cfg.links)}
            </div>

            <!-- Footer -->
            <div class="text-center mt-20 fade-in-delay-2">
                <p class="text-xs dark:text-gray-700 text-gray-400">
                    ${cfg.domainTitle}
                </p>
            </div>
        </div>
    </div>`;
}

/**
 * Landing page specific styles
 */
const landingStyles = `
    /* Hover effect with accent */
    a.link-card {
        border-left: 2px solid transparent;
        transition: all 0.2s ease;
    }

    a.link-card:hover {
        border-left-color: var(--accent-color);
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    }

    .dark a.link-card:hover {
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
    }

    /* Accent color for link arrow on hover */
    a.link-card:hover .arrow-icon {
        color: var(--accent-color);
    }
`;

/**
 * Generate the HTML for the landing page
 */
export function generateLandingHTML(cfg) {
  const content = renderLandingContent(cfg);

  return renderBase({
    title: cfg.domainTitle,
    accentColor: cfg.accentColor,
    content,
    scripts: '',
    additionalStyles: landingStyles
  });
}
