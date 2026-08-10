/**
 * The inbox: storage, triage, and the admin API in front of them.
 *
 * These run against the real migration through node:sqlite, so a filter that
 * SQLite would reject fails here rather than at a self-hoster's first message.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { createD1, seedSubmission } from './helpers/d1.mjs';
import {
  deleteForHostname, deleteSubmission, exportInbox, inboxCsv, KINDS, listInbox, setStatus,
  setStatusAll, STATUSES,
} from '../src/inbox.js';
import { submitLead } from '../src/leads.js';
import { handleAdmin } from '../src/admin/router.js';
import { renderAdminUI } from '../src/admin/ui.js';

const ADMIN_ENV = { ADMIN_USER: 'ada', ADMIN_PASSWORD: 's3cret' };
const AUTH = `Basic ${btoa('ada:s3cret')}`;

function adminRequest(path, init = {}) {
  return new Request(`https://example.com${path}`, {
    ...init,
    headers: { authorization: AUTH, ...(init.headers || {}) },
  });
}

async function seeded() {
  const db = createD1();
  await seedSubmission(db, { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', kind: 'contact', status: 'new', hostname: 'cdn.farm', subject: 'Still for sale?', message: 'I would like to buy this.', created_at: 300 });
  await seedSubmission(db, { id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', kind: 'offer', status: 'read', hostname: 'arcadelab.io', offer_amount: 'USD 4,800', message: 'Funds ready.', email: 'buyer@example.com', created_at: 200 });
  await seedSubmission(db, { id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', kind: 'survey', status: 'archived', hostname: 'cdn.farm', answer: 'A status page.', email: null, message: null, created_at: 100 });
  await seedSubmission(db, { id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', kind: 'waitlist', status: 'spam', hostname: 'cdn.farm', email: 'bot@example.com', message: null, created_at: 50 });
  return db;
}

test('the default view is everything still needing a decision, newest first', async () => {
  const db = await seeded();
  const page = await listInbox(db, { status: 'open' });
  assert.deepEqual(page.submissions.map((row) => row.kind), ['contact', 'offer']);
  assert.equal(page.total, 2);
  assert.deepEqual(page.counts.status, { new: 1, read: 1, archived: 1, spam: 1 });
  assert.equal(page.counts.open, 2);
  assert.deepEqual(page.hostnames, [
    { hostname: 'arcadelab.io', count: 1 },
    { hostname: 'cdn.farm', count: 3 },
  ]);
});

test('every status and kind is filterable, and the counts ignore the status filter', async () => {
  const db = await seeded();
  for (const status of STATUSES) {
    const page = await listInbox(db, { status });
    assert.ok(page.submissions.every((row) => row.status === status), status);
    assert.deepEqual(page.counts.status, { new: 1, read: 1, archived: 1, spam: 1 }, `${status}: counts`);
  }
  for (const kind of KINDS) {
    const page = await listInbox(db, { status: 'all', kind });
    assert.ok(page.submissions.every((row) => row.kind === kind), kind);
  }
  const scoped = await listInbox(db, { status: 'all', hostname: 'arcadelab.io' });
  assert.deepEqual(scoped.submissions.map((row) => row.hostname), ['arcadelab.io']);
});

test('search covers every field a person would remember, and wildcards are literal', async () => {
  const db = await seeded();
  for (const [term, expected] of [
    ['buyer@example', 1],
    ['Still for sale', 1],
    ['status page', 1],
    ['Someone', 4],
    ['%', 0],
    ['_', 0],
  ]) {
    const page = await listInbox(db, { status: 'all', search: term });
    assert.equal(page.submissions.length, expected, `search "${term}"`);
  }
});

test('triage moves a row and never invents a status', async () => {
  const db = await seeded();
  const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  assert.equal(await setStatus(db, id, 'archived'), true);
  assert.equal(await setStatus(db, id, 'archived'), false, 'a no-op change reports no change');
  assert.equal((await listInbox(db, { status: 'archived' })).submissions.length, 2);

  await assert.rejects(() => setStatus(db, id, 'burned'), /Invalid status/);
  await assert.rejects(() => setStatus(db, 'not-an-id', 'read'), /Invalid submission id/);

  const changed = await setStatusAll(db, [id, 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'], 'read');
  assert.equal(changed, 2);
});

test('deleting a page takes its inbox with it', async () => {
  const db = await seeded();
  await deleteForHostname(db, 'cdn.farm');
  const page = await listInbox(db, { status: 'all' });
  assert.deepEqual(page.submissions.map((row) => row.hostname), ['arcadelab.io']);

  assert.equal(await deleteSubmission(db, 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'), true);
  assert.equal((await listInbox(db, { status: 'all' })).total, 0);
});

test('the CSV export neutralizes spreadsheet formulas before quoting', async () => {
  const db = createD1();
  await seedSubmission(db, { name: '=SUM(1,1)', message: '@evil', offer_amount: '-42', kind: 'offer' });
  const csv = inboxCsv(await exportInbox(db, { status: 'all' }));
  assert.match(csv, /"'=SUM\(1,1\)"/);
  assert.match(csv, /"'@evil"/);
  assert.match(csv, /"'-42"/);
  assert.doesNotMatch(csv, /,"=SUM/);
  assert.match(csv.split('\r\n')[0], /^"received_utc","hostname","kind","status"/);
});

test('a contact submission is stored whole, and consent is recorded with it', async () => {
  const db = createD1();
  const site = { configured: true, mode: 'profile', config: { capture: { contact: true, consent: 'I agree.' } } };
  const body = new URLSearchParams({
    kind: 'contact',
    name: 'Jules Rivera',
    email: 'jules@example.com',
    subject: 'Is this domain still available?',
    message: 'I would like to buy it.',
    consent: 'yes',
  });
  const response = await submitLead(
    new Request('https://cdn.farm/_parkour/lead', {
      method: 'POST',
      headers: { origin: 'https://cdn.farm', 'content-type': 'application/x-www-form-urlencoded' },
      body,
    }),
    { DB: db }, 'cdn.farm', site,
  );
  assert.equal(response.status, 303);
  assert.match(response.headers.get('location'), /kind=contact/);

  const [stored] = (await listInbox(db, { status: 'all' })).submissions;
  assert.equal(stored.kind, 'contact');
  assert.equal(stored.status, 'new');
  assert.equal(stored.subject, 'Is this domain still available?');
  assert.equal(stored.message, 'I would like to buy it.');
  assert.equal(stored.consent, true);
});

test('a contact submission missing its message or consent is refused', async () => {
  const db = createD1();
  const site = { configured: true, mode: 'profile', config: { capture: { contact: true, consent: 'I agree.' } } };
  const post = (fields) => submitLead(
    new Request('https://cdn.farm/_parkour/lead', {
      method: 'POST',
      headers: { origin: 'https://cdn.farm', 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(fields),
    }),
    { DB: db }, 'cdn.farm', site,
  );

  assert.equal((await post({ kind: 'contact', email: 'a@b.co', consent: 'yes' })).status, 400);
  assert.equal((await post({ kind: 'contact', email: 'a@b.co', message: 'hi' })).status, 400);
  assert.equal((await post({ kind: 'contact', message: 'hi', consent: 'yes' })).status, 400);
  // A kind the page does not offer is not a validation error - it does not exist.
  assert.equal((await post({ kind: 'offer', email: 'a@b.co' })).status, 404);
  assert.equal((await listInbox(db, { status: 'all' })).total, 0);
});

test('the admin API lists, triages, exports and deletes', async () => {
  const db = await seeded();
  const env = { ...ADMIN_ENV, DB: db };

  const list = await handleAdmin(adminRequest('/_admin_/api/inbox?status=all&kind=offer'), env);
  assert.equal(list.status, 200);
  const payload = await list.json();
  assert.equal(payload.submissions.length, 1);
  assert.equal(payload.counts.open, 2);

  const patched = await handleAdmin(adminRequest('/_admin_/api/inbox', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ids: ['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'], status: 'archived' }),
  }), env);
  assert.equal(patched.status, 200);
  assert.deepEqual(await patched.json(), { changed: 1 });

  const csv = await handleAdmin(adminRequest('/_admin_/api/inbox.csv?status=all'), env);
  assert.equal(csv.status, 200);
  assert.match(csv.headers.get('content-type'), /text\/csv/);
  assert.match(csv.headers.get('content-disposition'), /domain-parkour-inbox\.csv/);

  const removed = await handleAdmin(adminRequest('/_admin_/api/inbox/cccccccc-cccc-4ccc-8ccc-cccccccccccc', {
    method: 'DELETE',
  }), env);
  assert.equal(removed.status, 204);
  assert.equal((await listInbox(db, { status: 'all' })).total, 3);
});

test('inbox writes refuse a cross-origin caller and an invalid status', async () => {
  const db = await seeded();
  const env = { ...ADMIN_ENV, DB: db };

  const crossOrigin = await handleAdmin(adminRequest('/_admin_/api/inbox', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', origin: 'https://attacker.example' },
    body: JSON.stringify({ ids: ['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'], status: 'read' }),
  }), env);
  assert.equal(crossOrigin.status, 403);

  const badStatus = await handleAdmin(adminRequest('/_admin_/api/inbox', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ids: ['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'], status: 'burned' }),
  }), env);
  assert.equal(badStatus.status, 400);

  // Unchanged: neither request reached the database.
  assert.equal((await listInbox(db, { status: 'new' })).submissions.length, 1);
});

test('the admin ships the inbox view and the capture switches that fill it', () => {
  const html = renderAdminUI({ presets: [] });
  assert.match(html, /data-view-panel="inbox"/);
  assert.match(html, /id="inbox-list"/);
  assert.match(html, /id="capture-contact"/);
  assert.match(html, /data-capture-mode="parking"/);
  assert.match(html, /data-capture-mode="coming-soon"/);
  assert.match(html, /id="capture-survey"/);
  assert.match(html, /id="capture-consent"/);
  // The reply path is the owner's own mail client, and the copy says so.
  assert.match(html, /never sends mail as you/);
});
