import { renderBase } from './base.js';
import { renderSocialLinks } from './components.js';

/**
 * Generate the countdown HTML
 */
function renderCountdown(cfg) {
  if (!cfg.launchDate) return '';

  return `
    <!-- Countdown Timer -->
    <div id="countdown" class="flex justify-center gap-4 sm:gap-8 py-8">
      <div class="text-center">
        <div class="text-4xl sm:text-5xl font-bold dark:text-white text-black" id="days">00</div>
        <div class="text-sm dark:text-gray-500 text-gray-500 mt-2">Days</div>
      </div>
      <div class="text-4xl sm:text-5xl font-bold dark:text-gray-700 text-gray-300">:</div>
      <div class="text-center">
        <div class="text-4xl sm:text-5xl font-bold dark:text-white text-black" id="hours">00</div>
        <div class="text-sm dark:text-gray-500 text-gray-500 mt-2">Hours</div>
      </div>
      <div class="text-4xl sm:text-5xl font-bold dark:text-gray-700 text-gray-300">:</div>
      <div class="text-center">
        <div class="text-4xl sm:text-5xl font-bold dark:text-white text-black" id="minutes">00</div>
        <div class="text-sm dark:text-gray-500 text-gray-500 mt-2">Minutes</div>
      </div>
      <div class="text-4xl sm:text-5xl font-bold dark:text-gray-700 text-gray-300">:</div>
      <div class="text-center">
        <div class="text-4xl sm:text-5xl font-bold dark:text-white text-black" id="seconds">00</div>
        <div class="text-sm dark:text-gray-500 text-gray-500 mt-2">Seconds</div>
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
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
      ${cfg.features
        .map(
          (feature) => `
      <div class="p-6 rounded-xl border dark:border-gray-800 border-gray-200 dark:bg-gray-900/50 bg-gray-50/50 backdrop-blur-sm">
        <div class="text-lg font-semibold dark:text-white text-black mb-2">${
          feature.title || feature
        }</div>
        ${
          feature.description
            ? `<div class="text-sm dark:text-gray-400 text-gray-600">${feature.description}</div>`
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
    <div class="flex items-center justify-center min-h-screen px-6 py-24">
        <div class="max-w-5xl w-full">
            <!-- Status Badge -->
            <div class="flex justify-center mb-8">
                <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border dark:border-gray-800 border-gray-200 dark:bg-gray-900 bg-gray-50">
                    <div class="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>
                    <span class="text-xs font-medium dark:text-gray-400 text-gray-600">Coming Soon</span>
                </div>
            </div>

            <!-- Main Content -->
            <div class="text-center space-y-8">
                <!-- Domain/Brand Name -->
                <div class="space-y-4 float-animation">
                    <h1 class="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight dark:text-white text-black">
                        ${cfg.domainTitle}
                    </h1>
                    <div class="h-1 w-20 mx-auto accent-gradient rounded-full"></div>
                </div>

                <!-- Tagline -->
                ${
                  cfg.tagline
                    ? `
                <h2 class="text-2xl sm:text-3xl md:text-4xl font-semibold dark:text-gray-100 text-gray-900 max-w-3xl mx-auto">
                    ${cfg.tagline}
                </h2>
                `
                    : ""
                }

                <!-- Title/Subtitle -->
                <p class="text-lg sm:text-xl md:text-2xl dark:text-gray-400 text-gray-600 max-w-2xl mx-auto">
                    ${cfg.title}
                </p>

                <!-- Description -->
                ${
                  cfg.description
                    ? `
                <p class="text-base sm:text-lg dark:text-gray-500 text-gray-500 max-w-xl mx-auto">
                    ${cfg.description}
                </p>
                `
                    : ""
                }

                ${renderCountdown(cfg)}

                ${renderSocialLinks(cfg.socialLinks)}

                ${renderFeatures(cfg)}
            </div>

            <!-- Footer -->
            <div class="mt-20 text-center">
                <p class="text-sm dark:text-gray-600 text-gray-400">
                    ${
                      cfg.launchDate
                        ? "Stay tuned for our launch"
                        : "Something exciting is coming"
                    }
                </p>
            </div>
        </div>
    </div>`;
}

/**
 * Generate the HTML for the coming soon page
 */
export function generateComingSoonHTML(cfg) {
  const content = renderComingSoonContent(cfg);
  const scripts = renderCountdownScript(cfg);

  return renderBase({
    title: `${cfg.domainTitle} - Coming Soon`,
    accentColor: cfg.accentColor,
    content,
    scripts
  });
}
