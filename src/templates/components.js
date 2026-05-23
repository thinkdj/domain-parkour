/**
 * Shared component templates used by every page mode.
 */

const LUCIDE_SOCIAL = {
  twitter: "twitter",
  facebook: "facebook",
  instagram: "instagram",
  linkedin: "linkedin",
  github: "github",
  email: "mail",
  x: "x",
};

export function renderSocialLinks(socialLinks) {
  if (!socialLinks || Object.keys(socialLinks).length === 0) return "";
  return `
    <div class="flex justify-center gap-2 mt-8">
      ${Object.entries(socialLinks)
        .map(
          ([platform, url]) => `
        <a href="${url}" target="_blank" rel="noopener noreferrer"
           class="dp-social" aria-label="${platform}">
          <i data-lucide="${LUCIDE_SOCIAL[platform.toLowerCase()] || "mail"}" width="16" height="16" stroke-width="1.8"></i>
        </a>`,
        )
        .join("")}
    </div>`;
}

export function renderFooter(footerText, showCredit = true) {
  if (footerText === "") return "";
  const credit = showCredit
    ? `<p class="mt-2" style="color: var(--text-faint); font-size: 11px;">
         Built with
         <a href="https://github.com/thinkdj/domain-parkour" target="_blank" rel="noopener noreferrer"
            class="hover:underline" style="color: var(--text-dim);">Domain Parkour</a>
         · hosted on
         <a href="https://cloudflare.com" target="_blank" rel="noopener noreferrer"
            class="hover:underline" style="color: var(--text-dim);">Cloudflare</a>
       </p>`
    : "";
  return `
    <div class="text-center mt-20 fade-in-delay-3" style="color: var(--text-faint);">
      <p style="font-size: 11px;">${footerText}</p>
      ${credit}
    </div>`;
}
