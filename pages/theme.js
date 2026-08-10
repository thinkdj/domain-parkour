import { icon } from './icons.js';

export const THEME_STORAGE_KEY = 'parkour-theme';

/**
 * The shared light/dark control used by the visitor masthead and the OSS admin.
 * The class is supplied by the host surface; markup and behavior stay shared.
 */
export function themeToggle({ className = 'dp-theme-toggle' } = {}) {
  return `<button type="button" class="${className}" data-theme-toggle aria-pressed="false" aria-label="Switch to dark mode" title="Switch to dark mode">
    <span data-theme-icon="moon">${icon('moon', { size: 16 })}</span>
    <span data-theme-icon="sun" hidden>${icon('sun', { size: 16 })}</span>
  </button>`;
}

/**
 * Inline, dependency-free progressive enhancement. It runs in the head so a
 * saved choice is applied before the first paint, then wires controls once the
 * body exists. No user data is interpolated into this script.
 */
export function themeScript() {
  return `(() => {
  const root = document.documentElement;
  const key = '${THEME_STORAGE_KEY}';
  const prefersDark = matchMedia('(prefers-color-scheme: dark)');
  try {
    const saved = localStorage.getItem(key);
    if (saved === 'light' || saved === 'dark') root.dataset.theme = saved;
  } catch (e) {}

  const isDark = () => root.dataset.theme
    ? root.dataset.theme === 'dark'
    : prefersDark.matches;

  const sync = () => {
    const dark = isDark();
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.querySelectorAll('[data-theme-icon]').forEach((node) => {
        node.hidden = node.dataset.themeIcon !== (dark ? 'sun' : 'moon');
      });
      button.setAttribute('aria-pressed', String(dark));
      button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      button.setAttribute('title', dark ? 'Switch to light mode' : 'Switch to dark mode');
    });
  };

  const wire = () => {
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      if (button.dataset.themeWired) return;
      button.dataset.themeWired = 'true';
      button.addEventListener('click', () => {
        const next = isDark() ? 'light' : 'dark';
        root.dataset.theme = next;
        try { localStorage.setItem(key, next); } catch (e) {}
        sync();
      });
    });
    sync();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire, { once: true });
  } else {
    wire();
  }
  prefersDark.addEventListener('change', () => {
    if (!root.dataset.theme) sync();
  });
})();`;
}
