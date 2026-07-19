import { renderBase } from "./base.js";
import {
  renderFooter,
  renderMasthead,
  renderSocialLinks,
} from "./components.js";

function formatLaunchDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function renderCountdown(cfg) {
  if (!cfg.launchDate) return "";
  const cell = (id, label) => `
    <div class="dp-stat">
      <div class="v" id="${id}">00</div>
      <div class="l">${label}</div>
    </div>`;

  return `
    <aside id="countdown-panel" class="dp-panel fade-in-delay-2" aria-label="Launch countdown">
      <div class="dp-panel-label">${cfg.launchLabel} ${formatLaunchDate(cfg.launchDate)}</div>
      <div id="countdown" class="dp-stats" role="timer" aria-live="off">
        ${cell("days", cfg.daysLabel)}
        ${cell("hours", cfg.hoursLabel)}
        ${cell("minutes", cfg.minutesLabel)}
        ${cell("seconds", cfg.secondsLabel)}
      </div>
      ${cfg.countdownNote ? `<p class="dp-note">${cfg.countdownNote}</p>` : ""}
    </aside>`;
}

function renderCountdownScript(cfg) {
  if (!cfg.launchDate) return "";
  return `
    (function () {
      const target = new Date(${JSON.stringify(cfg.launchDate)}).getTime();
      const countdown = document.getElementById('countdown');
      const get = (id) => document.getElementById(id);
      let timer;

      function tick() {
        const diff = target - Date.now();
        if (!Number.isFinite(target) || diff <= 0) {
          if (countdown) countdown.innerHTML = '<div style="padding: 20px; color: var(--text); font-weight: 650;"></div>';
          if (countdown && countdown.firstElementChild) countdown.firstElementChild.textContent = ${JSON.stringify(cfg.launchedText)};
          if (timer) clearInterval(timer);
          return;
        }
        get('days').textContent = String(Math.floor(diff / 86400000)).padStart(2, '0');
        get('hours').textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
        get('minutes').textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
        get('seconds').textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      }

      tick();
      timer = setInterval(tick, 1000);
    })();
  `;
}

function renderFeatures(cfg) {
  if (!cfg.features?.length) return "";

  return `
    <section class="dp-feature-grid fade-in-delay-3" aria-label="What to expect">
      ${cfg.features
        .map((feature, index) => {
          const title = feature.title || feature;
          return `
        <article class="dp-card">
          <div class="dp-feature-index">${String(index + 1).padStart(2, "0")}</div>
          <h3 class="dp-feature-title">${title}</h3>
          ${feature.description ? `<p class="dp-feature-copy">${feature.description}</p>` : ""}
        </article>`;
        })
        .join("")}
    </section>`;
}

function renderContent(cfg) {
  return `
    <main class="dp-page">
      <div class="dp-wrap">
        ${renderMasthead(cfg.domainTitle, cfg.statusLabel, true)}

        <div class="dp-grid">
          <section>
            ${
              cfg.eyebrowText
                ? `<div class="dp-eyebrow fade-in"><span class="dot pulse" aria-hidden="true"></span>${cfg.eyebrowText}</div>`
                : ""
            }
            <h1 class="dp-title dp-title-compact fade-in-delay-1">${cfg.domainTitle}</h1>
            ${
              cfg.tagline
                ? `<h2 class="dp-heading fade-in-delay-1" style="margin-top: 28px;">${cfg.tagline}</h2>`
                : ""
            }
            ${
              cfg.title
                ? `<p class="dp-lede fade-in-delay-1">${cfg.title}</p>`
                : ""
            }
            ${
              cfg.description
                ? `<p class="dp-copy fade-in-delay-2">${cfg.description}</p>`
                : ""
            }
            <div class="fade-in-delay-2">${renderSocialLinks(cfg.socialLinks)}</div>
          </section>

          ${
            cfg.launchDate
              ? renderCountdown(cfg)
              : `<aside class="dp-panel fade-in-delay-2">
                   ${cfg.statusPanelLabel ? `<div class="dp-panel-label">${cfg.statusPanelLabel}</div>` : ""}
                   ${cfg.statusPanelTitle ? `<h2 class="dp-heading" style="margin-top: 12px;">${cfg.statusPanelTitle}</h2>` : ""}
                   ${cfg.statusPanelText ? `<p class="dp-copy">${cfg.statusPanelText}</p>` : ""}
                 </aside>`
          }
        </div>

        ${renderFeatures(cfg)}

        ${renderFooter(cfg.footerText, cfg.showCredit)}
      </div>
    </main>`;
}

export function generateComingSoonHTML(cfg, allThemes = null) {
  return renderBase({
    title: cfg.pageTitleSuffix ? `${cfg.domainTitle} - ${cfg.pageTitleSuffix}` : cfg.domainTitle,
    accentColor: cfg.accentColor,
    content: renderContent(cfg),
    scripts: renderCountdownScript(cfg),
    allThemes,
  });
}
