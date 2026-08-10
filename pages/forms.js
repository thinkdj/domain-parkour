/**
 * Capture form markup. Markup only — the POST handler belongs to whichever app
 * owns the database, because the two store submissions differently.
 *
 * Carried over from the cloud runtime, which was the only implementation. The
 * honeypot, the consent gate and the field caps are part of the markup contract:
 * a handler validates all of it again server-side, but shipping the constraints
 * here keeps the two in step.
 */

import { escapeHtml } from './safety.js';
import { label, LABELS } from './defaults.js';

export const LEAD_PATH = '/_parkour/lead';
export const THANKS_PATH = '/_parkour/thanks';
export const KINDS = ['offer', 'waitlist', 'survey'];

function consentField(consent) {
  if (!consent) return '';
  return `<label class="check"><input type="checkbox" name="consent" value="yes" required>`
    + `<span>${escapeHtml(consent)}</span></label>`;
}

/**
 * @param {'offer'|'waitlist'|'survey'} kind
 * @param {{ consent?: string, survey_question?: string }} capture
 */
export function leadForm(kind, capture = {}, config = {}) {
  const tail = `<input class="dp-hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">`
    + consentField(capture.consent)
    + `<button class="dp-button dp-button-block" type="submit">${escapeHtml(
      kind === 'offer' ? label(config, 'offerButton') : kind === 'waitlist' ? LABELS.waitlistButton : LABELS.surveyButton,
    )}</button>`;
  const open = `<form class="dp-form" method="post" action="${LEAD_PATH}">`
    + `<input type="hidden" name="kind" value="${kind}">`;

  if (kind === 'offer') {
    return open
      + `<label>Name<input name="name" maxlength="120" autocomplete="name"></label>`
      + `<label>Email<input type="email" name="email" maxlength="254" autocomplete="email" required></label>`
      + `<label>Offer<input name="offer_amount" maxlength="80" placeholder="USD 4,800"></label>`
      + `<label>Message<textarea name="message" maxlength="1000" rows="3"></textarea></label>`
      + tail + `</form>`;
  }
  if (kind === 'waitlist') {
    return open
      + `<label>Email<input type="email" name="email" maxlength="254" autocomplete="email" required></label>`
      + tail + `</form>`;
  }
  return open
    + `<label>${escapeHtml(capture.survey_question || '')}`
    + `<textarea name="answer" maxlength="500" rows="3" required></textarea></label>`
    + `<label>Email <span class="optional">optional</span>`
    + `<input type="email" name="email" maxlength="254" autocomplete="email"></label>`
    + tail + `</form>`;
}

/**
 * Whether a kind may be submitted for this page. The renderer and the handler
 * must agree on this, so both call it — a form that renders but is refused on
 * POST, or accepted on POST without ever rendering, are both bugs.
 *
 * A parking page with a contact address takes offers even without the explicit
 * flag: that is how rows written before `capture` existed behave, and it keeps
 * the owner's address off the page rather than falling back to a mailto.
 */
export function captureAllows(kind, mode, config) {
  const capture = config?.capture || {};
  if (kind === 'offer') return Boolean(capture.offer) || (mode === 'parking' && Boolean(config?.contact_email));
  if (kind === 'waitlist') return Boolean(capture.waitlist);
  return kind === 'survey' && Boolean(capture.survey_question);
}
