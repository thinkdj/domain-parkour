import { renderBase } from "./base.js";
import { escapeHtml, safeLinkUrl } from "../safety.js";
import {
  EXTERNAL_LINK_ICON,
  renderFooter,
  renderMasthead,
  renderSocialLinks,
} from "./components.js";

function renderLinks(cfg) {
  const links = cfg.links;
  if (!links?.length) return "";

  const renderedLinks = links
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
    .join("");
  if (!renderedLinks) return "";

  return `
    <nav class="dp-panel" aria-label="Primary links">
      ${cfg.linksLabel ? `<div class="dp-panel-label" style="margin-bottom:16px">${escapeHtml(cfg.linksLabel)}</div>` : ""}
      <div class="dp-link-list">${renderedLinks}</div>
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
                ? `<div class="dp-eyebrow"><span class="dot" aria-hidden="true"></span>${escapeHtml(cfg.eyebrowText)}</div>`
                : ""
            }
            <h1 class="dp-title dp-title-compact dp-mono">${escapeHtml(cfg.domainTitle)}</h1>
            ${
              cfg.title
                ? `<h2 class="dp-heading" style="margin-top:24px">${escapeHtml(cfg.title)}</h2>`
                : ""
            }
            ${
              cfg.subtitle
                ? `<p class="dp-lede">${escapeHtml(cfg.subtitle)}</p>`
                : ""
            }
            ${
              cfg.description
                ? `<p class="dp-copy">${escapeHtml(cfg.description)}</p>`
                : ""
            }
            ${renderSocialLinks(cfg.socialLinks)}
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
