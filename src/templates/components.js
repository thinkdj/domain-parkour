/**
 * Shared component templates
 */

/**
 * Social media icon paths
 */
const SOCIAL_ICONS = {
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
  x: '<path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/>',
};

/**
 * Render social links component with minimal design
 * @param {Object} socialLinks - Object with platform: url pairs
 * @returns {string} HTML for social links
 */
export function renderSocialLinks(socialLinks) {
  if (!socialLinks || Object.keys(socialLinks).length === 0) return "";

  return `
    <div class="flex justify-center gap-2 mt-8">
      ${Object.entries(socialLinks)
        .map(
          ([platform, url]) => `
      <a href="${url}" target="_blank" rel="noopener noreferrer"
         class="p-2.5 rounded-lg border dark:border-gray-800 border-gray-200 dark:bg-transparent bg-white dark:hover:bg-gray-900/30 hover:bg-gray-50 transition-all duration-200"
         aria-label="${platform}">
        <svg class="w-4 h-4 dark:text-gray-400 text-gray-600" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          ${SOCIAL_ICONS[platform.toLowerCase()] || SOCIAL_ICONS.email}
        </svg>
      </a>
      `
        )
        .join("")}
    </div>`;
}

/**
 * Render footer component with text and optional credit
 * @param {string} footerText - Footer text to display
 * @param {boolean} showCredit - Whether to show "Powered by" credit line (default: true)
 * @returns {string} HTML for footer
 */
export function renderFooter(footerText, showCredit = true) {
  // If footerText is empty string, hide footer completely
  if (footerText === "") return "";

  const creditLine = showCredit
    ? `
      <p class="text-xs mt-2">
        Built with <a href="https://github.com/thinkdj/domain-parkour" target="_blank" rel="noopener noreferrer" class="hover:underline">Domain Parkour</a> and hosted on <a href="https://cloudflare.com" target="_blank" rel="noopener noreferrer" class="hover:underline">Cloudflare</a>.
      </p>`
    : "";

  return `
    <div class="text-center mt-20 fade-in-delay-3 dark:text-gray-700 text-gray-400">
      <p class="text-xs">
        ${footerText}
      </p>
      ${creditLine}
    </div>`;
}
