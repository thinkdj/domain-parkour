/**
 * Capture forms: what renders, where, and what a handler is allowed to accept.
 *
 * The renderer and both storage layers agree through `captureAllows`, so the
 * cases that matter here are the ones where a form could render but not be
 * accepted, or be accepted but never render.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  captureAllows, FIELD_LIMITS, KINDS, leadForm, MODES, normalize, renderPage, renderThanks, validate,
} from '../../pages/index.js';

const HOST = 'cdn.farm';

const CONTACT_MODES = ['parking', 'coming_soon', 'landing', 'profile'];

test('contact is a kind every content template can carry', () => {
  assert.ok(KINDS.includes('contact'));
  for (const mode of CONTACT_MODES) {
    assert.equal(captureAllows('contact', mode, { capture: { contact: true } }), true, mode);
    assert.equal(captureAllows('contact', mode, {}), false, `${mode} without the switch`);
  }
});

test('every mode that can show a contact form actually renders one', () => {
  for (const mode of CONTACT_MODES) {
    const html = renderPage(mode, HOST, { capture: { contact: true } }).html;
    assert.match(html, /name="kind" value="contact"/, mode);
    assert.match(html, /name="message"/, `${mode}: message field`);
    assert.match(html, /name="subject"/, `${mode}: subject field`);
    assert.match(html, /class="dp-form"/, `${mode}: form styles are present`);
  }
});

test('a survey question renders its form wherever it is set', () => {
  for (const mode of CONTACT_MODES) {
    const html = renderPage(mode, HOST, { capture: { survey_question: 'What would you build?' } }).html;
    assert.match(html, /name="kind" value="survey"/, mode);
    assert.match(html, /What would you build\?/, `${mode}: the question is asked`);
  }
});

test('a capture form is closed, and the owner address never reaches the page', () => {
  const html = renderPage('parking', HOST, {
    contact_email: 'owner@example.com',
    capture: { contact: true },
  }).html;
  assert.doesNotMatch(html, /owner@example\.com/);
  assert.doesNotMatch(html, /mailto:/);
  assert.doesNotMatch(html, /<details class="dp-contact-disclosure[^"]*"[^>]*\bopen\b/);
});

test('only the first way to reach the owner is a filled button', () => {
  // Parking already offers the offer form, so contact and survey are outlined.
  const parking = renderPage('parking', HOST, {
    contact_email: 'owner@example.com',
    capture: { contact: true, survey_question: 'Why?' },
  }).html;
  assert.equal((parking.match(/dp-contact-disclosure dp-quiet/g) || []).length, 2);

  // A profile page has no other call to action, so its contact form is the one.
  const profile = renderPage('profile', HOST, { capture: { contact: true, survey_question: 'Why?' } }).html;
  assert.equal((profile.match(/dp-contact-disclosure dp-quiet/g) || []).length, 1);
  assert.match(profile, /class="dp-contact-disclosure"/);
});

test('a page with no capture ships no form CSS at all', () => {
  const html = renderPage('landing', HOST, {}).html;
  assert.doesNotMatch(html, /\.dp-form\{/);
  assert.doesNotMatch(html, /dp-contact-disclosure/);
});

test('the waitlist submit button is styled - its form is the only button on the page', () => {
  const html = renderPage('coming_soon', HOST, {
    launch_date: '2048-01-01',
    capture: { waitlist: true },
  }).html;
  assert.match(html, /name="kind" value="waitlist"/);
  assert.match(html, /\.dp-button\{/, 'the button recipe ships with the form');
});

test('consent is required markup-side when the owner set it', () => {
  const form = leadForm('contact', { consent: 'I agree.' }, {});
  assert.match(form, /name="consent" value="yes" required/);
  assert.doesNotMatch(leadForm('contact', {}, {}), /name="consent"/);
});

test('field caps are one contract, shared by markup and handlers', () => {
  const form = leadForm('contact', {}, {});
  assert.match(form, new RegExp(`name="subject" maxlength="${FIELD_LIMITS.subject}"`));
  assert.match(form, new RegExp(`name="message" maxlength="${FIELD_LIMITS.message}"`));
  assert.match(leadForm('offer', {}, {}), new RegExp(`name="offer_amount" maxlength="${FIELD_LIMITS.offer_amount}"`));
});

test('every kind has its own thank-you copy', () => {
  const seen = new Set();
  for (const kind of KINDS) {
    const html = renderThanks(kind, HOST).html;
    const message = html.match(/<p class="dp-copy">([^<]+)</)?.[1] || '';
    assert.ok(message, `${kind}: has a message`);
    assert.ok(!seen.has(message), `${kind}: reuses another kind's wording`);
    seen.add(message);
  }
});

test('capture survives normalize and validate in both dialects', () => {
  const { config } = normalize({ capture: { contact: true } }, { mode: 'profile' });
  assert.equal(config.capture.contact, true);

  const strict = validate({ capture: { contact: true, consent: 'I agree.' } }, 'landing');
  assert.equal(strict.capture.contact, true);
  assert.equal(strict.capture.consent, 'I agree.');

  // The pre-capture spelling of the coming-soon waitlist still lands correctly.
  assert.equal(normalize({ notify: true }, { mode: 'coming_soon' }).config.capture.waitlist, true);
});

test('a capture switch on a mode that cannot render it stays off the page', () => {
  for (const mode of MODES) {
    const html = renderPage(mode, HOST, { capture: { waitlist: true } }).html;
    if (mode === 'coming_soon') assert.match(html, /value="waitlist"/, mode);
    else assert.doesNotMatch(html, /value="waitlist"/, mode);
  }
});
