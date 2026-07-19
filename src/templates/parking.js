import { renderBase } from "./base.js";
import {
  EXTERNAL_LINK_ICON,
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
          <div class="v">${value}</div>
          <div class="l">${label}</div>
        </div>`,
        )
        .join("")}
    </div>`;
}

function renderOfferPanel(cfg) {
  const hasPrice = Boolean(cfg.salePrice);
  const hasEmail = Boolean(cfg.contactEmail);
  const panelLabel = hasPrice ? cfg.priceLabel : cfg.inquiryLabel;
  const panelCopy = hasEmail ? cfg.contactCopy : cfg.availabilityCopy;

  return `
    <aside class="dp-panel fade-in-delay-2" aria-label="Purchase inquiry">
      ${panelLabel ? `<div class="dp-panel-label">${panelLabel}</div>` : ""}
      ${
        hasPrice
          ? `<div class="dp-price">${cfg.salePrice}</div>`
          : cfg.noPriceTitle
            ? `<h2 class="dp-heading" style="margin-top: 10px;">${cfg.noPriceTitle}</h2>`
            : ""
      }
      ${panelCopy ? `<p class="dp-copy">${panelCopy}</p>` : ""}
      ${
        hasEmail && cfg.contactButtonText
          ? `<a id="contact-link" href="#" class="dp-button dp-button-block" style="margin-top: 24px;">
               <span>${cfg.contactButtonText}</span>
               ${EXTERNAL_LINK_ICON}
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
                ? `<div class="dp-eyebrow fade-in"><span class="dot" aria-hidden="true"></span>${cfg.eyebrowText}</div>`
                : ""
            }
            <h1 class="dp-title fade-in-delay-1">${cfg.domainTitle}</h1>
            ${
              cfg.title
                ? `<h2 class="dp-heading fade-in-delay-1" style="margin-top: 30px;">${cfg.title}</h2>`
                : ""
            }
            ${
              cfg.description
                ? `<p class="dp-lede fade-in-delay-1">${cfg.description}</p>`
                : ""
            }
            ${
              cfg.domainRegistration
                ? `<p class="dp-note fade-in-delay-2">${cfg.domainRegistration}</p>`
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
  if (!cfg.contactEmail) return "";
  return `
    (function () {
      const link = document.getElementById('contact-link');
      if (link) link.href = 'mailto:' + ${JSON.stringify(cfg.contactEmail)};
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
