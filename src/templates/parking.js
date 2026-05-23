import { renderBase } from "./base.js";
import { renderSocialLinks, renderFooter } from "./components.js";

function renderStats(cfg) {
  const stats = [];
  if (cfg.domainAgeYears) stats.push({ v: cfg.domainAgeYears, l: "Years Old" });
  if (cfg.domainExtension)
    stats.push({ v: cfg.domainExtension, l: "Extension" });
  stats.push({ v: "✓", l: "SEO Ready" });
  if (!stats.length) return "";
  return `
    <div class="flex flex-wrap justify-center gap-2 sm:gap-3 mt-10 fade-in-delay-1">
      ${stats
        .map(
          (s) => `
        <div class="dp-stat" style="min-width: 96px;">
          <div class="v">${s.v}</div>
          <div class="l">${s.l}</div>
        </div>`,
        )
        .join("")}
    </div>`;
}

function renderParkingContent(cfg) {
  const mailIcon = `<i data-lucide="mail" width="15" height="15" stroke-width="2"></i>`;

  return `
    <main class="flex items-center justify-center min-h-screen px-4 sm:px-6 py-16 sm:py-20">
      <div class="w-full max-w-2xl mx-auto text-center">

        <div class="fade-in">
          <span class="dp-eyebrow"><span class="dot"></span>For sale</span>
        </div>

        <h1 class="mt-8 fade-in" style="font-size: clamp(2.25rem, 6vw, 3.5rem); font-weight: 700; line-height: 1.1;">
          <span class="accent-underline">${cfg.domainTitle}</span>
        </h1>

        ${
          cfg.domainRegistration
            ? `<p class="mt-6 fade-in" style="font-size: 12px; color: var(--text-faint);">${cfg.domainRegistration}</p>`
            : ""
        }

        ${renderStats(cfg)}

        <hr class="dp-rule" />

        <h2 class="fade-in-delay-1" style="font-size: 18px; font-weight: 600;">${cfg.title || ""}</h2>

        ${
          cfg.description
            ? `<p class="mt-3 fade-in-delay-1 max-w-xl mx-auto" style="font-size: 14px; line-height: 1.6;">${cfg.description}</p>`
            : ""
        }

        ${
          cfg.salePrice
            ? `<p class="mt-6 fade-in-delay-2" style="font-size: 15px;">
                 Available for <span class="dp-accent">${cfg.salePrice}</span>
               </p>`
            : ""
        }

        ${
          cfg.contactEmail
            ? `<div class="mt-8 fade-in-delay-2">
                 <a id="contact-link" href="#" class="dp-button">
                   <span>Get in touch</span>
                   ${mailIcon}
                 </a>
               </div>`
            : ""
        }

        <div class="fade-in-delay-2">${renderSocialLinks(cfg.socialLinks)}</div>

        ${renderFooter(
          cfg.footerText !== undefined
            ? cfg.footerText
            : "This premium domain is available for purchase",
          cfg.showCredit !== false,
        )}
      </div>
    </main>`;
}

function renderParkingScripts(cfg) {
  if (!cfg.contactEmail) return "";
  return `
    (function () {
      const u = '${cfg.contactEmail.split("@")[0]}';
      const d = '${cfg.contactEmail.split("@")[1]}';
      const link = document.getElementById('contact-link');
      if (link) link.href = 'mailto:' + u + '@' + d;
    })();
  `;
}

export function generateParkingHTML(cfg, allThemes = null) {
  return renderBase({
    title: `${cfg.domainTitle} — ${cfg.title || "For sale"}`,
    accentColor: cfg.accentColor,
    content: renderParkingContent(cfg),
    scripts: renderParkingScripts(cfg),
    allThemes,
  });
}
