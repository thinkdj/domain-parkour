import { renderBase } from "./base.js";
import { escapeHtml, safeAvatarUrl, safeLinkUrl } from "../safety.js";
import {
  EXTERNAL_LINK_ICON,
  renderFooter,
  renderMasthead,
  renderSocialLinks,
} from "./components.js";

function initials(name) {
  if (!name) return "?";
  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function renderAvatar(cfg) {
  const displayName = cfg.name || cfg.domainTitle;
  const avatarUrl = safeAvatarUrl(cfg.avatarUrl);
  if (avatarUrl) {
    return `<div class="dp-avatar"><img src="${escapeHtml(avatarUrl)}" alt="Portrait of ${escapeHtml(displayName)}"></div>`;
  }
  return `<div class="dp-avatar" aria-label="${escapeHtml(displayName)}">${escapeHtml(initials(displayName))}</div>`;
}

function renderLinks(links) {
  if (!links?.length) return "";

  return `
    <nav class="dp-link-list" style="margin-top:24px" aria-label="Featured links">
      ${links
        .map((link, index) => {
          const url = safeLinkUrl(link?.url);
          if (!url) return "";
          return `
          <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="dp-link">
            <span class="dp-link-main">
              <span class="dp-link-index">${String(index + 1).padStart(2, "0")}</span>
              <span class="label">${escapeHtml(link?.title)}</span>
            </span>
            ${EXTERNAL_LINK_ICON}
          </a>`;
        })
        .join("")}
    </nav>`;
}

function renderContent(cfg) {
  const displayName = cfg.name || cfg.domainTitle;

  return `
    <main class="dp-page">
      <div class="dp-wrap dp-wrap-narrow">
        ${renderMasthead(cfg.domainTitle, cfg.statusLabel)}

        <section class="dp-panel">
          <div class="dp-profile-head">
            ${renderAvatar(cfg)}
            <div class="dp-profile-head-copy">
              ${
                cfg.role
                  ? `<div class="dp-eyebrow"><span class="dot" aria-hidden="true"></span>${escapeHtml(cfg.role)}</div>`
                  : ""
              }
              <h1 class="dp-name">${escapeHtml(displayName)}</h1>
            </div>
          </div>

          ${cfg.bio ? `<p class="dp-lede">${escapeHtml(cfg.bio)}</p>` : ""}

          ${renderLinks(cfg.links)}

          ${renderSocialLinks(cfg.socialLinks)}
        </section>

        ${renderFooter(cfg.footerText, cfg.showCredit)}
      </div>
    </main>`;
}

export function generateProfileHTML(cfg, allThemes = null) {
  // In the local gallery `name` labels the preset itself; production configs
  // still use it as the optional profile display name documented in CONFIGURATION.md.
  const profileCfg = allThemes ? { ...cfg, name: undefined } : cfg;
  return renderBase({
    title: profileCfg.name || profileCfg.domainTitle,
    accentColor: profileCfg.accentColor,
    content: renderContent(profileCfg),
    allThemes,
  });
}
