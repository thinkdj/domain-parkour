import { renderBase } from "./base.js";
import { renderSocialLinks, renderFooter } from "./components.js";

const ARROW = `<i data-lucide="chevron-right" class="arrow" width="14" height="14" stroke-width="2"></i>`;

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function renderAvatar(cfg) {
  if (cfg.avatarUrl) {
    return `<div class="dp-avatar"><img src="${cfg.avatarUrl}" alt="${cfg.name || cfg.domainTitle}"/></div>`;
  }
  return `<div class="dp-avatar">${initials(cfg.name || cfg.domainTitle)}</div>`;
}

function renderLinks(links) {
  if (!links || !links.length) return "";
  return `
    <div class="flex flex-col gap-2 mt-8 max-w-md mx-auto fade-in-delay-2">
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
  const displayName = cfg.name || cfg.domainTitle;
  return `
    <main class="flex items-center justify-center min-h-screen px-4 sm:px-6 py-16 sm:py-20">
      <div class="w-full max-w-md mx-auto text-center">

        <div class="fade-in">${renderAvatar(cfg)}</div>

        <h1 class="mt-6 fade-in" style="font-size: 28px; font-weight: 700; line-height: 1.1;">
          <span class="accent-underline">${displayName}</span>
        </h1>

        ${
          cfg.role
            ? `<p class="mt-6 fade-in-delay-1" style="font-size: 13px; letter-spacing: 0.04em; text-transform: uppercase; color: var(--text-faint);">${cfg.role}</p>`
            : ""
        }

        ${
          cfg.bio
            ? `<p class="mt-4 max-w-sm mx-auto fade-in-delay-1" style="font-size: 14px; line-height: 1.65;">${cfg.bio}</p>`
            : ""
        }

        ${renderLinks(cfg.links)}

        <div class="fade-in-delay-3">${renderSocialLinks(cfg.socialLinks)}</div>

        ${renderFooter(
          cfg.footerText !== undefined ? cfg.footerText : "",
          cfg.showCredit !== false,
        )}
      </div>
    </main>`;
}

export function generateProfileHTML(cfg, allThemes = null) {
  return renderBase({
    title: cfg.name || cfg.domainTitle,
    accentColor: cfg.accentColor,
    content: renderContent(cfg),
    allThemes,
  });
}
