/**
 * Capture form markup. Markup only - the POST handler belongs to whichever app
 * owns the database, because the two store submissions differently.
 *
 * Carried over from the cloud runtime, which was the only implementation. The
 * honeypot, the consent gate and the field caps are part of the markup contract:
 * a handler validates all of it again server-side, but shipping the constraints
 * here keeps the two in step.
 *
 * Four kinds, one storage shape. `contact` is the general-purpose one - it is
 * what replaces publishing an address, so a visitor can write to the owner from
 * any template without the address ever reaching the HTML.
 */

import { escapeHtml } from './safety.js';
import { label, LABELS } from './defaults.js';

export const LEAD_PATH = '/_parkour/lead';
export const THANKS_PATH = '/_parkour/thanks';
export const KINDS = ['offer', 'waitlist', 'survey', 'contact'];

/** Field caps, shared by the markup and by both handlers. */
export const FIELD_LIMITS = {
  name: 120,
  email: 254,
  subject: 160,
  message: 1000,
  offer_amount: 80,
  answer: 500,
};

const SUBMIT_LABEL = {
  offer: (config) => label(config, 'offerButton'),
  waitlist: () => LABELS.waitlistButton,
  survey: () => LABELS.surveyButton,
  contact: (config) => label(config, 'contactButton'),
};

function consentField(consent) {
  if (!consent) return '';
  return `<label class="check"><input type="checkbox" name="consent" value="yes" required>`
    + `<span>${escapeHtml(consent)}</span></label>`;
}

/**
 * @param {'offer'|'waitlist'|'survey'|'contact'} kind
 * @param {{ consent?: string, survey_question?: string }} capture
 */
export function leadForm(kind, capture = {}, config = {}) {
  const tail = `<input class="dp-hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">`
    + consentField(capture.consent)
    + `<button class="dp-button dp-button-block" type="submit">${escapeHtml(
      (SUBMIT_LABEL[kind] || SUBMIT_LABEL.contact)(config),
    )}</button>`;
  const open = `<form class="dp-form" method="post" action="${LEAD_PATH}">`
    + `<input type="hidden" name="kind" value="${kind}">`;

  if (kind === 'offer') {
    return open
      + `<label>Name<input name="name" maxlength="${FIELD_LIMITS.name}" autocomplete="name"></label>`
      + `<label>Email<input type="email" name="email" maxlength="${FIELD_LIMITS.email}" autocomplete="email" required></label>`
      + `<label>Offer<input name="offer_amount" maxlength="${FIELD_LIMITS.offer_amount}" placeholder="USD 4,800"></label>`
      + `<label>Message<textarea name="message" maxlength="${FIELD_LIMITS.message}" rows="3"></textarea></label>`
      + tail + `</form>`;
  }
  if (kind === 'waitlist') {
    return open
      + `<label>Email<input type="email" name="email" maxlength="${FIELD_LIMITS.email}" autocomplete="email" required></label>`
      + tail + `</form>`;
  }
  if (kind === 'contact') {
    return open
      + `<label>Name<input name="name" maxlength="${FIELD_LIMITS.name}" autocomplete="name"></label>`
      + `<label>Email<input type="email" name="email" maxlength="${FIELD_LIMITS.email}" autocomplete="email" required></label>`
      + `<label>Subject <span class="optional">optional</span>`
      + `<input name="subject" maxlength="${FIELD_LIMITS.subject}"></label>`
      + `<label>Message<textarea name="message" maxlength="${FIELD_LIMITS.message}" rows="4" required></textarea></label>`
      + tail + `</form>`;
  }
  return open
    + `<label>${escapeHtml(capture.survey_question || '')}`
    + `<textarea name="answer" maxlength="${FIELD_LIMITS.answer}" rows="3" required></textarea></label>`
    + `<label>Email <span class="optional">optional</span>`
    + `<input type="email" name="email" maxlength="${FIELD_LIMITS.email}" autocomplete="email"></label>`
    + tail + `</form>`;
}

/**
 * Whether a kind may be submitted for this page. The renderer and the handler
 * must agree on this, so both call it - a form that renders but is refused on
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
  if (kind === 'contact') return Boolean(capture.contact);
  return kind === 'survey' && Boolean(capture.survey_question);
}
