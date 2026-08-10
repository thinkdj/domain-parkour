/** Shared, deliberately small components used by every public page mode. */

import { escapeHtml, safeSocialUrl, SOCIAL_PLATFORMS } from "../safety.js";
import { icon } from "../icons.js";

const SOCIAL_ICONS = {
  twitter: "brand-x",
  x: "brand-x",
  facebook: "brand-facebook",
  instagram: "brand-instagram",
  linkedin: "brand-linkedin",
  github: "brand-github",
  email: "mail",
};

export const EXTERNAL_LINK_ICON = icon("external-link", { size: 18, cls: "arrow" });
export const MAIL_ICON = icon("mail", { size: 18 });

/** The accessible name for the link, spelled the way the platform spells it. */
const PLATFORM_LABELS = {
  twitter: "X",
  x: "X",
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  github: "GitHub",
  email: "Email",
};

function platformLabel(platform) {
  const key = platform.toLowerCase();
  return PLATFORM_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1);
}

/**
 * The chrome line above the page: the hostname in mono, and one status badge.
 * `isLive` picks the success variant; nothing here pulses, because the design
 * system reserves badge motion for "propagating".
 */
export function renderMasthead(domainTitle, status, isLive = false) {
  return `
    <header class="dp-masthead">
      <span class="dp-mono">${escapeHtml(domainTitle)}</span>
      <span class="dp-status${isLive ? " live" : ""}">
        <span class="dp-status-dot" aria-hidden="true"></span>
        <span>${escapeHtml(status)}</span>
      </span>
    </header>`;
}

export function renderSocialLinks(socialLinks) {
  if (!socialLinks || Object.keys(socialLinks).length === 0) return "";

  return `
    <nav class="dp-socials" aria-label="Social links">
      ${Object.entries(socialLinks)
        .map(([platform, value]) => {
          if (!SOCIAL_PLATFORMS.has(platform)) return "";
          const url = safeSocialUrl(platform, value);
          if (!url) return "";
          const label = platformLabel(platform);
          const external = !url.startsWith("mailto:");
          return `
        <a href="${escapeHtml(url)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}
           class="dp-social" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}">
          ${icon(SOCIAL_ICONS[platform.toLowerCase()] || "external-link")}
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
    <footer class="dp-footer">
      ${footerText ? `<div>${escapeHtml(footerText)}</div>` : "<div></div>"}
      ${credit}
    </footer>`;
}
