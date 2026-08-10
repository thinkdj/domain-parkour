/**
 * Capture form handling for the self-hosted app.
 *
 * The shared renderer emits offer / waitlist / survey forms, so this app has to
 * accept them — a form that posts into a 404 is worse than no form. The markup
 * and the "is this kind allowed" rule come from @domainparkour/pages so the two cannot
 * disagree; everything below is storage, which is this app's own business.
 *
 * Read what arrives with `pnpm db:leads`.
 */

import { captureAllows, KINDS, plainText, safeEmail, THANKS_PATH } from '../pages/index.js';

const MAX_BODY_BYTES = 16 * 1024;

function reject(message, status) {
  return new Response(message, {
    status,
    headers: { 'content-type': 'text/plain;charset=UTF-8', 'cache-control': 'no-store' },
  });
}

function thanks(kind) {
  return new Response(null, {
    status: 303,
    headers: {
      location: `${THANKS_PATH}?kind=${encodeURIComponent(kind)}`,
      'cache-control': 'no-store',
      'referrer-policy': 'no-referrer',
    },
  });
}

async function dedupeKey(hostname, kind, email) {
  // A waitlist signup is idempotent per address, so a double submit does not
  // create two rows. Everything else is a distinct message and gets a fresh id.
  if (kind !== 'waitlist' || !email) return crypto.randomUUID();
  const bytes = new TextEncoder().encode(`${hostname}|${kind}|${email}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * @param {Request} request
 * @param {{ DB?: D1Database }} env
 * @param {string} hostname
 * @param {{ mode: string, config: object, configured: boolean }} site
 */
export async function submitLead(request, env, hostname, site) {
  if (!site.configured || !env.DB) return reject('Not found.', 404);

  const length = Number(request.headers.get('content-length') || 0);
  if (Number.isFinite(length) && length > MAX_BODY_BYTES) return reject('Form is too large.', 413);

  // Same-origin only: this form is never legitimately posted from elsewhere.
  const origin = request.headers.get('origin') || request.headers.get('referer') || '';
  try {
    if (new URL(origin).origin !== new URL(request.url).origin) return reject('Invalid form origin.', 403);
  } catch {
    return reject('Invalid form origin.', 403);
  }

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.toLowerCase().startsWith('application/x-www-form-urlencoded')) {
    return reject('Invalid form.', 400);
  }

  const form = await request.formData().catch(() => null);
  if (!form) return reject('Invalid form.', 400);

  const kind = String(form.get('kind') || '');
  if (!KINDS.includes(kind) || !captureAllows(kind, site.mode, site.config)) return reject('Not found.', 404);

  // Honeypot: a bot fills every field, so a filled one means silence, not an
  // error — telling it what tripped the check just helps it try again.
  if (plainText(form.get('website'), 200)) return thanks(kind);

  const capture = site.config.capture || {};
  if (capture.consent && form.get('consent') !== 'yes') return reject('Consent is required.', 400);

  const email = safeEmail(form.get('email'));
  const answer = plainText(form.get('answer'), 500);
  if ((kind === 'offer' || kind === 'waitlist') && !email) return reject('A valid email is required.', 400);
  if (kind === 'survey' && !answer) return reject('An answer is required.', 400);

  await env.DB.prepare(
    `INSERT OR IGNORE INTO submissions
       (id, hostname, kind, email, name, message, offer_amount, answer, dedupe_key, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    crypto.randomUUID(),
    hostname,
    kind,
    email || null,
    plainText(form.get('name'), 120) || null,
    plainText(form.get('message'), 1000) || null,
    plainText(form.get('offer_amount'), 80) || null,
    answer || null,
    await dedupeKey(hostname, kind, email),
    Math.floor(Date.now() / 1000),
  ).run();

  return thanks(kind);
}
