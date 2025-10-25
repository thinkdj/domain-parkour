import { renderBase } from './base.js';
import { renderSocialLinks } from './components.js';

/**
 * Generate the countdown HTML
 */
function renderCountdown(cfg) {
  if (!cfg.launchDate) return '';

  return `
    <!-- Countdown Timer -->
    <div id="countdown" class="flex justify-center gap-3 sm:gap-6 mt-12">
      <div class="px-4 py-3 rounded-lg border dark:border-gray-800 border-gray-200 dark:bg-transparent bg-white">
        <div class="text-3xl sm:text-4xl font-bold dark:text-white text-gray-900" id="days">00</div>
        <div class="text-xs dark:text-gray-500 text-gray-500 mt-1 text-center">Days</div>
      </div>
      <div class="px-4 py-3 rounded-lg border dark:border-gray-800 border-gray-200 dark:bg-transparent bg-white">
        <div class="text-3xl sm:text-4xl font-bold dark:text-white text-gray-900" id="hours">00</div>
        <div class="text-xs dark:text-gray-500 text-gray-500 mt-1 text-center">Hours</div>
      </div>
      <div class="px-4 py-3 rounded-lg border dark:border-gray-800 border-gray-200 dark:bg-transparent bg-white">
        <div class="text-3xl sm:text-4xl font-bold dark:text-white text-gray-900" id="minutes">00</div>
        <div class="text-xs dark:text-gray-500 text-gray-500 mt-1 text-center">Min</div>
      </div>
      <div class="px-4 py-3 rounded-lg border dark:border-gray-800 border-gray-200 dark:bg-transparent bg-white">
        <div class="text-3xl sm:text-4xl font-bold dark:text-white text-gray-900" id="seconds">00</div>
        <div class="text-xs dark:text-gray-500 text-gray-500 mt-1 text-center">Sec</div>
      </div>
    </div>`;
}

/**
 * Generate the countdown JavaScript
 */
function renderCountdownScript(cfg) {
  if (!cfg.launchDate) return '';

  return `
    // Countdown Timer
    const launchDate = new Date('${cfg.launchDate}').getTime();

    function updateCountdown() {
      const now = new Date().getTime();
      const distance = launchDate - now;

      if (distance < 0) {
        document.getElementById('countdown').innerHTML = '<div class="text-2xl dark:text-white text-black font-bold">We\\'re Live!</div>';
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      document.getElementById('days').textContent = days.toString().padStart(2, '0');
      document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
      document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
      document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
  `;
}

/**
 * Generate the features section
 */
function renderFeatures(cfg) {
  if (!cfg.features || cfg.features.length === 0) return '';

  return `
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-w-3xl mx-auto mt-12">
      ${cfg.features
        .map(
          (feature) => `
      <div class="p-4 rounded-lg border dark:border-gray-800 border-gray-200 dark:bg-transparent bg-white text-left">
        <div class="text-sm font-semibold dark:text-white text-gray-900 mb-1">${
          feature.title || feature
        }</div>
        ${
          feature.description
            ? `<div class="text-xs dark:text-gray-500 text-gray-600">${feature.description}</div>`
            : ""
        }
      </div>
      `
        )
        .join("")}
    </div>`;
}

/**
 * Generate the content for the coming soon page
 */
function renderComingSoonContent(cfg) {
  return `
    <!-- Main Container -->
    <div class="flex items-center justify-center min-h-screen px-6 py-20">
        <div class="w-full max-w-3xl mx-auto">

            <!-- Main Content -->
            <div class="text-center">
                <!-- Status Badge -->
                <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border dark:border-gray-800 border-gray-200 dark:bg-gray-900/50 bg-gray-50 mb-8 fade-in">
                    <div class="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>
                    <span class="text-xs font-medium dark:text-gray-400 text-gray-600">Coming Soon</span>
                </div>

                <!-- Domain/Brand Name -->
                <div class="fade-in">
                    <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight dark:text-white text-gray-900 mb-4 accent-underline">
                        ${cfg.domainTitle}
                    </h1>
                </div>

                <!-- Tagline -->
                ${
                  cfg.tagline
                    ? `
                <h2 class="text-xl sm:text-2xl font-semibold dark:text-gray-200 text-gray-800 mt-8 mb-4 fade-in-delay-1">
                    ${cfg.tagline}
                </h2>
                `
                    : ""
                }

                <!-- Title/Subtitle -->
                <p class="text-base sm:text-lg dark:text-gray-400 text-gray-600 max-w-2xl mx-auto fade-in-delay-1">
                    ${cfg.title}
                </p>

                <!-- Description -->
                ${
                  cfg.description
                    ? `
                <p class="text-sm dark:text-gray-500 text-gray-500 max-w-xl mx-auto mt-3 fade-in-delay-1">
                    ${cfg.description}
                </p>
                `
                    : ""
                }

                <div class="fade-in-delay-2">
                    ${renderCountdown(cfg)}
                </div>

                <div class="fade-in-delay-2">
                    ${renderSocialLinks(cfg.socialLinks)}
                </div>

                <div class="fade-in-delay-3">
                    ${renderFeatures(cfg)}
                </div>
            </div>

            <!-- Footer -->
            <div class="text-center mt-20 fade-in-delay-3">
                <p class="text-xs dark:text-gray-700 text-gray-400">
                    ${cfg.footerText !== undefined ? cfg.footerText : (cfg.launchDate ? "Stay tuned for our launch" : "Something exciting is coming")}
                </p>
            </div>
        </div>
    </div>`;
}

/**
 * Generate the HTML for the coming soon page
 */
export function generateComingSoonHTML(cfg, allThemes = null) {
  const content = renderComingSoonContent(cfg);
  const scripts = renderCountdownScript(cfg);

  return renderBase({
    title: `${cfg.domainTitle} - Coming Soon`,
    accentColor: cfg.accentColor,
    content,
    scripts,
    allThemes
  });
}
