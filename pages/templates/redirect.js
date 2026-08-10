/**
 * Redirect — not really a page.
 *
 * The handler answers with a Location header and no body, so this renders only
 * for the editor preview and for the case where the target turned out to be
 * unusable and something still has to be served. `redirectResponse` below is the
 * part that matters, and both apps use it so the rules cannot drift.
 */

import { escapeHtml } from '../safety.js';
import { footer, masthead } from '../components.js';

export function needsForm() {
  return false;
}

export function render(view) {
  const { cfg, title, status } = view;
  const rule = cfg.delivery?.redirect || {};
  const target = rule.target_url || '';
  const showUi = rule.show_ui === true;
  const seconds = rule.countdown_seconds || 5;

  return `<div class="dp-wrap dp-wrap-narrow">
    ${masthead(title, status)}
    <section class="dp-panel">
      <div class="dp-panel-label">Redirect</div>
      <h1 class="dp-heading">${escapeHtml(target ? 'This domain forwards on.' : 'No destination is set.')}</h1>
      ${target && showUi
        ? `<p class="dp-copy">You will be redirected to <a href="${escapeHtml(target)}" rel="noopener noreferrer">${escapeHtml(target)}</a> in <strong>${seconds} seconds</strong>.</p>`
        : target ? `<p class="dp-copy dp-mono">${escapeHtml(target)}</p>` : ''}
    </section>
    ${footer(cfg.footer_text, cfg.footer_credit)}
  </div>`;
}

/**
 * Resolve the Location for a request, or '' when the redirect must not happen.
 *
 * Refusing a same-host target is the loop guard: without it a misconfigured
 * apex sends the visitor back to itself until the browser gives up.
 *
 * @param {string} requestUrl
 * @param {object} config normalized config
 * @returns {{ location: string, status: number }}
 */
export function resolveRedirect(requestUrl, config) {
  const rule = config?.delivery?.redirect;
  if (!rule?.target_url) return { location: '', status: 0 };
  let target;
  let from;
  try {
    target = new URL(rule.target_url);
    from = new URL(requestUrl);
  } catch {
    return { location: '', status: 0 };
  }
  if (target.hostname === from.hostname) return { location: '', status: 0 };
  if (rule.preserve_path && from.pathname !== '/') {
    target.pathname = target.pathname.replace(/\/$/, '') + from.pathname;
  }
  if (rule.preserve_query) {
    for (const [key, value] of from.searchParams) target.searchParams.append(key, value);
  }
  return { location: target.toString(), status: rule.status_code || 302 };
}
