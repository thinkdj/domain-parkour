import { renderBase } from "./base.js";
import {
  EXTERNAL_LINK_ICON,
  renderFooter,
  renderMasthead,
  renderSocialLinks,
} from "./components.js";

function initials(name) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function renderAvatar(cfg) {
  const displayName = cfg.name || cfg.domainTitle;
  if (cfg.avatarUrl) {
    return `<div class="dp-avatar"><img src="${cfg.avatarUrl}" alt="Portrait of ${displayName}"></div>`;
  }
  return `<div class="dp-avatar" aria-label="${displayName}">${initials(displayName)}</div>`;
}

function renderLinks(links) {
  if (!links?.length) return "";

  return `
    <nav class="dp-link-list fade-in-delay-2" style="margin-top: 30px;" aria-label="Featured links">
      ${links
        .map(
          (link, index) => `
        <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="dp-link">
          <span class="dp-link-main">
            <span class="dp-link-index">${String(index + 1).padStart(2, "0")}</span>
            <span class="label">${link.title}</span>
          </span>
          ${EXTERNAL_LINK_ICON}
        </a>`,
        )
        .join("")}
    </nav>`;
}

function renderContent(cfg) {
  const displayName = cfg.name || cfg.domainTitle;

  return `
    <main class="dp-page">
      <div class="dp-wrap dp-wrap-narrow">
        ${renderMasthead(cfg.domainTitle, cfg.statusLabel)}

        <section class="dp-panel fade-in-delay-1">
          <div class="dp-profile-head">
            <div class="fade-in">${renderAvatar(cfg)}</div>
            <div class="dp-profile-head-copy">
              ${
                cfg.role
                  ? `<div class="dp-eyebrow"><span class="dot" aria-hidden="true"></span>${cfg.role}</div>`
                  : ""
              }
              <h1 class="dp-heading" style="font-size: clamp(1.9rem, 5vw, 2.8rem); margin-top: 10px;">${displayName}</h1>
            </div>
          </div>

          ${cfg.bio ? `<p class="dp-lede fade-in-delay-1">${cfg.bio}</p>` : ""}

          ${renderLinks(cfg.links)}

          <div class="fade-in-delay-3">${renderSocialLinks(cfg.socialLinks)}</div>
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
