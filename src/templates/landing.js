import { renderBase } from "./base.js";
import { renderSocialLinks, renderFooter } from "./components.js";

const ARROW = `<i data-lucide="chevron-right" class="arrow" width="14" height="14" stroke-width="2"></i>`;

function renderLinks(links) {
  if (!links || !links.length) return "";
  return `
    <div class="flex flex-col gap-2 mt-8 sm:mt-10 max-w-md mx-auto fade-in-delay-1">
      ${links
        .map(
          (l) => `
        <a href="${l.url}" target="_blank" rel="noopener noreferrer" class="dp-link">
          <span class="label">${l.title}</span>
          ${ARROW}
        </a>`,
        )
        .join("")}
    </div>`;
}

function renderContent(cfg) {
  return `
    <main class="flex items-center justify-center min-h-screen px-4 sm:px-6 py-16 sm:py-20">
      <div class="w-full max-w-xl mx-auto text-center">

        <h1 class="fade-in" style="font-size: clamp(2rem, 5.5vw, 3rem); font-weight: 700; line-height: 1.1;">
          <span class="accent-underline">${cfg.domainTitle}</span>
        </h1>

        ${
          cfg.title
            ? `<p class="mt-8 fade-in" style="font-size: 16px; color: var(--text);">${cfg.title}</p>`
            : ""
        }

        ${
          cfg.subtitle
            ? `<p class="mt-3 max-w-md mx-auto fade-in-delay-1" style="font-size: 14px; line-height: 1.6;">${cfg.subtitle}</p>`
            : ""
        }

        ${
          cfg.description
            ? `<p class="mt-3 max-w-md mx-auto fade-in-delay-1" style="font-size: 13px; color: var(--text-faint); line-height: 1.6;">${cfg.description}</p>`
            : ""
        }

        ${renderLinks(cfg.links)}

        <div class="fade-in-delay-2">${renderSocialLinks(cfg.socialLinks)}</div>

        ${renderFooter(
          cfg.footerText !== undefined ? cfg.footerText : cfg.domainTitle,
          cfg.showCredit !== false,
        )}
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
