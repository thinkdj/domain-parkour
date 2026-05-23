import { renderBase } from "./base.js";
import { renderSocialLinks, renderFooter } from "./components.js";

function renderCountdown(cfg) {
  if (!cfg.launchDate) return "";
  const cell = (id, label) => `
    <div class="dp-stat" style="min-width: 74px;">
      <div class="v" id="${id}" style="font-variant-numeric: tabular-nums; font-size: 24px;">00</div>
      <div class="l">${label}</div>
    </div>`;
  return `
    <div id="countdown" class="flex flex-wrap justify-center gap-2 sm:gap-3 mt-10 fade-in-delay-2">
      ${cell("days", "Days")}
      ${cell("hours", "Hours")}
      ${cell("minutes", "Min")}
      ${cell("seconds", "Sec")}
    </div>`;
}

function renderCountdownScript(cfg) {
  if (!cfg.launchDate) return "";
  return `
    (function () {
      const target = new Date('${cfg.launchDate}').getTime();
      const $ = (id) => document.getElementById(id);
      function tick() {
        const diff = target - Date.now();
        if (diff < 0) {
          $('countdown').innerHTML = '<div style="font-size: 22px; font-weight: 600; color: var(--text);">We\\'re live</div>';
          return;
        }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        $('days').textContent    = String(d).padStart(2, '0');
        $('hours').textContent   = String(h).padStart(2, '0');
        $('minutes').textContent = String(m).padStart(2, '0');
        $('seconds').textContent = String(s).padStart(2, '0');
      }
      tick();
      setInterval(tick, 1000);
    })();
  `;
}

function renderFeatures(cfg) {
  if (!cfg.features || !cfg.features.length) return "";
  return `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl mx-auto mt-12 fade-in-delay-3">
      ${cfg.features
        .map(
          (f) => `
        <div class="dp-card p-4 text-left">
          <div style="font-size: 14px; font-weight: 600; color: var(--text);">${
            f.title || f
          }</div>
          ${
            f.description
              ? `<div class="mt-1" style="font-size: 12px; color: var(--text-dim); line-height: 1.5;">${f.description}</div>`
              : ""
          }
        </div>`,
        )
        .join("")}
    </div>`;
}

function renderContent(cfg) {
  return `
    <main class="flex items-center justify-center min-h-screen px-4 sm:px-6 py-16 sm:py-20">
      <div class="w-full max-w-3xl mx-auto text-center">

        <div class="fade-in">
          <span class="dp-eyebrow"><span class="dot pulse"></span>Coming soon</span>
        </div>

        <h1 class="mt-8 fade-in" style="font-size: clamp(2.25rem, 6vw, 3.5rem); font-weight: 700; line-height: 1.1;">
          <span class="accent-underline">${cfg.domainTitle}</span>
        </h1>

        ${
          cfg.tagline
            ? `<h2 class="mt-8 fade-in-delay-1" style="font-size: 18px; font-weight: 600;">${cfg.tagline}</h2>`
            : ""
        }

        ${
          cfg.title
            ? `<p class="mt-4 max-w-2xl mx-auto fade-in-delay-1" style="font-size: 15px; line-height: 1.6;">${cfg.title}</p>`
            : ""
        }

        ${
          cfg.description
            ? `<p class="mt-3 max-w-xl mx-auto fade-in-delay-1" style="font-size: 13px; color: var(--text-faint); line-height: 1.6;">${cfg.description}</p>`
            : ""
        }

        ${renderCountdown(cfg)}

        <div class="fade-in-delay-2">${renderSocialLinks(cfg.socialLinks)}</div>

        ${renderFeatures(cfg)}

        ${renderFooter(
          cfg.footerText !== undefined
            ? cfg.footerText
            : cfg.launchDate
              ? "Stay tuned for our launch"
              : "Something exciting is coming",
          cfg.showCredit !== false,
        )}
      </div>
    </main>`;
}

export function generateComingSoonHTML(cfg, allThemes = null) {
  return renderBase({
    title: `${cfg.domainTitle} — Coming soon`,
    accentColor: cfg.accentColor,
    content: renderContent(cfg),
    scripts: renderCountdownScript(cfg),
    allThemes,
  });
}
