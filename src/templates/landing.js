import { renderBase } from "./base.js";
import {
  EXTERNAL_LINK_ICON,
  renderFooter,
  renderMasthead,
  renderSocialLinks,
} from "./components.js";

function renderLinks(cfg) {
  const links = cfg.links;
  if (!links?.length) return "";

  return `
    <nav class="dp-panel fade-in-delay-2" aria-label="Primary links">
      ${cfg.linksLabel ? `<div class="dp-panel-label" style="margin-bottom: 16px;">${cfg.linksLabel}</div>` : ""}
      <div class="dp-link-list">
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
      </div>
    </nav>`;
}

function renderContent(cfg) {
  const hasLinks = Boolean(cfg.links?.length);

  return `
    <main class="dp-page">
      <div class="dp-wrap">
        ${renderMasthead(cfg.domainTitle, cfg.statusLabel, true)}

        <div class="${hasLinks ? "dp-grid" : "dp-wrap-narrow"}">
          <section>
            ${
              cfg.eyebrowText
                ? `<div class="dp-eyebrow fade-in"><span class="dot" aria-hidden="true"></span>${cfg.eyebrowText}</div>`
                : ""
            }
            <h1 class="dp-title dp-title-compact dp-mono fade-in-delay-1">${cfg.domainTitle}</h1>
            ${
              cfg.title
                ? `<h2 class="dp-heading fade-in-delay-1" style="margin-top: 30px;">${cfg.title}</h2>`
                : ""
            }
            ${
              cfg.subtitle
                ? `<p class="dp-lede fade-in-delay-1">${cfg.subtitle}</p>`
                : ""
            }
            ${
              cfg.description
                ? `<p class="dp-copy fade-in-delay-2">${cfg.description}</p>`
                : ""
            }
            <div class="fade-in-delay-2">${renderSocialLinks(cfg.socialLinks)}</div>
          </section>

          ${renderLinks(cfg)}
        </div>

        ${renderFooter(cfg.footerText, cfg.showCredit)}
      </div>
    </main>`;
}

export function generateLandingHTML(cfg, allThemes = null) {
  return renderBase({
    title: cfg.domainTitle,
    accentColor: cfg.accentColor,
    content: renderContent(cfg),
    allThemes,
  });
}
