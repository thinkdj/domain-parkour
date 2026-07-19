/** Shared, deliberately small components used by every public page mode. */

const SOCIAL_GLYPHS = {
  twitter: "X",
  x: "X",
  facebook: "f",
  instagram: "IG",
  linkedin: "in",
  github: "GH",
  email: "@",
};

export const EXTERNAL_LINK_ICON = `<svg class="arrow" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10"/></svg>`;

function platformLabel(platform) {
  if (platform.toLowerCase() === "x") return "X";
  return platform.charAt(0).toUpperCase() + platform.slice(1);
}

export function renderMasthead(domainTitle, status, isLive = false) {
  return `
    <header class="dp-masthead fade-in">
      <div class="dp-brand">
        <span class="dp-brand-mark" aria-hidden="true"></span>
        <span>${domainTitle}</span>
      </div>
      <div class="dp-status">
        <span class="dp-status-dot${isLive ? " pulse" : ""}" aria-hidden="true"></span>
        <span>${status}</span>
      </div>
    </header>`;
}

export function renderSocialLinks(socialLinks) {
  if (!socialLinks || Object.keys(socialLinks).length === 0) return "";

  return `
    <nav class="dp-socials" aria-label="Social links">
      ${Object.entries(socialLinks)
        .map(([platform, url]) => {
          const label = platformLabel(platform);
          const external = !String(url).startsWith("mailto:");
          return `
        <a href="${url}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}
           class="dp-social" aria-label="${label}" title="${label}">
          <span class="dp-social-glyph" aria-hidden="true">${SOCIAL_GLYPHS[platform.toLowerCase()] || "\u2197"}</span>
        </a>`;
        })
        .join("")}
    </nav>`;
}

export function renderFooter(footerText, showCredit = true) {
  if (!footerText && !showCredit) return "";

  const credit = showCredit
    ? `<div class="dp-footer-credit">
         Built with <a href="https://github.com/thinkdj/domain-parkour" target="_blank" rel="noopener noreferrer">Domain Parkour</a>
         &middot; powered by <a href="https://cloudflare.com" target="_blank" rel="noopener noreferrer">Cloudflare</a>
       </div>`
    : "";

  return `
    <footer class="dp-footer fade-in-delay-3">
      ${footerText ? `<div>${footerText}</div>` : "<div></div>"}
      ${credit}
    </footer>`;
}
