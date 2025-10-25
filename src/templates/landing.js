import { renderBase } from './base.js';

/**
 * Generate the links section with minimalist cards
 */
function renderLinks(links) {
  if (!links || links.length === 0) return '';

  return `
    <div class="flex flex-col gap-2 mt-12 max-w-xl mx-auto">
      ${links
        .map(
          (link) => `
      <a href="${link.url}" target="_blank" rel="noopener noreferrer"
         class="link-card group relative flex items-center justify-between px-4 py-3 rounded-md dark:bg-transparent bg-transparent">
        <span class="text-sm font-medium dark:text-gray-300 text-gray-700">${link.title}</span>
        <svg class="arrow-icon w-3.5 h-3.5 dark:text-gray-600 text-gray-400 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    ${cfg.footerText || cfg.domainTitle}
                </p>
            </div>
        </div>
    </div>`;
}

/**
 * Landing page specific styles
 */
const landingStyles = `
    /* Subtle minimal link cards */
    a.link-card {
        transition: all 0.2s ease;
        border: 1px solid transparent;
    }

    a.link-card:hover {
        border-color: var(--accent-color);
        background: transparent !important;
    }

    .dark a.link-card:hover {
        background: rgba(255, 255, 255, 0.02) !important;
    }

    /* Accent color for link arrow on hover */
    a.link-card:hover .arrow-icon {
        color: var(--accent-color);
        transform: translateX(2px);
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
