import { renderBase } from "./base.js";
import { escapeHtml, normalizeEmail, serializeForScript } from "../safety.js";
import {
  MAIL_ICON,
  renderFooter,
  renderMasthead,
  renderSocialLinks,
} from "./components.js";

function renderStats(cfg) {
  const stats = [];
  if (cfg.domainAgeYears) stats.push({ value: cfg.domainAgeYears, label: cfg.domainAgeLabel });
  if (cfg.domainExtension) stats.push({ value: cfg.domainExtension, label: cfg.extensionLabel });
  if (cfg.trustValue || cfg.trustLabel) {
    stats.push({ value: cfg.trustValue, label: cfg.trustLabel });
  }

  return `
    <div class="dp-stats" aria-label="Domain details">
      ${stats
        .map(
          ({ value, label }) => `
        <div class="dp-stat">
          <div class="v">${escapeHtml(value)}</div>
          <div class="l">${escapeHtml(label)}</div>
        </div>`,
        )
        .join("")}
    </div>`;
}

function renderOfferPanel(cfg) {
  const hasPrice = Boolean(cfg.salePrice);
  const hasEmail = Boolean(normalizeEmail(cfg.contactEmail));
  const panelLabel = hasPrice ? cfg.priceLabel : cfg.inquiryLabel;
  const panelCopy = hasEmail ? cfg.contactCopy : cfg.availabilityCopy;

  return `
    <aside class="dp-panel" aria-label="Purchase inquiry">
      ${panelLabel ? `<div class="dp-panel-label">${escapeHtml(panelLabel)}</div>` : ""}
      ${
        hasPrice
          ? `<div class="dp-price">${escapeHtml(cfg.salePrice)}</div>`
          : cfg.noPriceTitle
            ? `<h2 class="dp-heading" style="margin-top:12px">${escapeHtml(cfg.noPriceTitle)}</h2>`
            : ""
      }
      ${panelCopy ? `<p class="dp-copy">${escapeHtml(panelCopy)}</p>` : ""}
      ${
        hasEmail && cfg.contactButtonText
          ? `<a id="contact-link" href="#" class="dp-button dp-button-block" style="margin-top:24px">
               <span>${escapeHtml(cfg.contactButtonText)}</span>
               ${MAIL_ICON}
             </a>`
          : ""
      }
      ${renderStats(cfg)}
      ${renderSocialLinks(cfg.socialLinks)}
    </aside>`;
}

function renderParkingContent(cfg) {
  return `
    <main class="dp-page">
      <div class="dp-wrap">
        ${renderMasthead(cfg.domainTitle, cfg.statusLabel)}

        <div class="dp-grid">
          <section>
            ${
              cfg.eyebrowText
                ? `<div class="dp-eyebrow"><span class="dot" aria-hidden="true"></span>${escapeHtml(cfg.eyebrowText)}</div>`
                : ""
            }
            <h1 class="dp-title dp-mono">${escapeHtml(cfg.domainTitle)}</h1>
            ${
              cfg.title
                ? `<h2 class="dp-heading" style="margin-top:24px">${escapeHtml(cfg.title)}</h2>`
                : ""
            }
            ${
              cfg.description
                ? `<p class="dp-lede">${escapeHtml(cfg.description)}</p>`
                : ""
            }
            ${
              cfg.domainRegistration
                ? `<p class="dp-note">${escapeHtml(cfg.domainRegistration)}</p>`
                : ""
            }
          </section>

          ${renderOfferPanel(cfg)}
        </div>

        ${renderFooter(cfg.footerText, cfg.showCredit)}
      </div>
    </main>`;
}

function renderParkingScripts(cfg) {
  const email = normalizeEmail(cfg.contactEmail);
  if (!email) return "";
  return `
    (function () {
      const link = document.getElementById('contact-link');
      if (link) link.href = 'mailto:' + ${serializeForScript(email)};
    })();
  `;
}

export function generateParkingHTML(cfg, allThemes = null) {
  return renderBase({
    title: cfg.pageTitleSuffix
      ? `${cfg.domainTitle} - ${cfg.pageTitleSuffix}`
      : cfg.domainTitle,
    accentColor: cfg.accentColor,
    content: renderParkingContent(cfg),
    scripts: renderParkingScripts(cfg),
    allThemes,
  });
}
