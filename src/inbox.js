/**
 * The inbox: reading and triaging what the capture forms wrote.
 *
 * One table, every hostname. The admin asks for a filtered page and the counts
 * beside each filter in the same round trip, because a lead desk that needs two
 * requests to draw one screen feels slow at exactly the moment it matters.
 *
 * Timestamps are seconds here, matching `domains` and D1's `unixepoch()`.
 */

import { ConfigValidationError, normalizeHostname } from './safety.js';

/** The whole triage vocabulary. A row is one of these, always. */
export const STATUSES = ['new', 'read', 'archived', 'spam'];

/** Kinds, in the order the admin lists them. Mirrors KINDS in @domainparkour/pages. */
export const KINDS = ['contact', 'offer', 'waitlist', 'survey'];

const COLUMNS = 'id, hostname, kind, status, email, name, subject, message, offer_amount, answer,'
  + ' consent, created_at, updated_at';

const MAX_PAGE = 200;
const DEFAULT_PAGE = 50;

const ID = /^[a-f0-9-]{16,64}$/i;

/** D1 has no boolean, so consent comes back as 0/1 and leaves as a boolean. */
function rowToRecord(row) {
  return {
    id: row.id,
    hostname: row.hostname,
    kind: row.kind,
    status: row.status,
    email: row.email || '',
    name: row.name || '',
    subject: row.subject || '',
    message: row.message || '',
    offerAmount: row.offer_amount || '',
    answer: row.answer || '',
    consent: row.consent === 1,
    createdAt: Number(row.created_at) || 0,
    updatedAt: Number(row.updated_at) || 0,
  };
}

/**
 * Build the shared WHERE clause. Every filter is optional and an unknown value
 * is dropped rather than rejected, so a stale bookmark still renders a list.
 */
function where({ status, kind, hostname, search } = {}) {
  const clauses = [];
  const binds = [];
  if (STATUSES.includes(status)) {
    clauses.push('status = ?');
    binds.push(status);
  } else if (status === 'open') {
    // The default view: everything still needing a decision.
    clauses.push("status IN ('new', 'read')");
  }
  if (KINDS.includes(kind)) {
    clauses.push('kind = ?');
    binds.push(kind);
  }
  if (hostname) {
    clauses.push('hostname = ?');
    binds.push(hostname);
  }
  const term = String(search || '').trim().slice(0, 120);
  if (term) {
    const fields = ['email', 'name', 'subject', 'message', 'answer'];
    clauses.push(`(${fields.map((field) => `${field} LIKE ? ESCAPE '\\'`).join(' OR ')})`);
    // LIKE treats % and _ as wildcards, so a typed one has to be escaped or a
    // search for "50%" matches everything.
    const pattern = `%${term.replace(/[\\%_]/g, '\\$&')}%`;
    for (const _field of fields) binds.push(pattern);
  }
  return { sql: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', binds };
}

/**
 * A page of submissions plus everything the admin needs to draw the filter rail:
 * per-status counts, per-kind counts, and the hostnames that have ever written.
 */
export async function listInbox(db, filters = {}) {
  const limit = Math.min(Math.max(Number(filters.limit) || DEFAULT_PAGE, 1), MAX_PAGE);
  const offset = Math.max(Number(filters.offset) || 0, 0);
  const hostname = filters.hostname ? normalizeHostname(filters.hostname) : '';
  const scope = { ...filters, hostname };
  const { sql, binds } = where(scope);

  const [rows, total, statusCounts, kindCounts, hostnames] = await Promise.all([
    db.prepare(`SELECT ${COLUMNS} FROM submissions ${sql} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`)
      .bind(...binds, limit, offset).all(),
    db.prepare(`SELECT COUNT(*) AS n FROM submissions ${sql}`).bind(...binds).first(),
    // Counts ignore the status filter - they are what the status filter offers.
    db.prepare('SELECT status, COUNT(*) AS n FROM submissions GROUP BY status').all(),
    db.prepare('SELECT kind, COUNT(*) AS n FROM submissions GROUP BY kind').all(),
    db.prepare('SELECT hostname, COUNT(*) AS n FROM submissions GROUP BY hostname ORDER BY hostname').all(),
  ]);

  const tally = (result, key) => Object.fromEntries(
    (result.results || []).map((row) => [row[key], Number(row.n) || 0]),
  );
  const byStatus = tally(statusCounts, 'status');

  return {
    submissions: (rows.results || []).map(rowToRecord),
    total: Number(total?.n) || 0,
    limit,
    offset,
    counts: {
      status: Object.fromEntries(STATUSES.map((name) => [name, byStatus[name] || 0])),
      open: (byStatus.new || 0) + (byStatus.read || 0),
      kind: tally(kindCounts, 'kind'),
    },
    hostnames: (hostnames.results || []).map((row) => ({
      hostname: row.hostname,
      count: Number(row.n) || 0,
    })),
  };
}

/** Every row matching the filters, newest first - the CSV export. */
export async function exportInbox(db, filters = {}) {
  const hostname = filters.hostname ? normalizeHostname(filters.hostname) : '';
  const { sql, binds } = where({ ...filters, hostname });
  const { results } = await db
    .prepare(`SELECT ${COLUMNS} FROM submissions ${sql} ORDER BY created_at DESC, id DESC LIMIT ?`)
    .bind(...binds, 10_000).all();
  return (results || []).map(rowToRecord);
}

function assertId(id) {
  if (!ID.test(String(id || ''))) throw new ConfigValidationError('Invalid submission id');
  return id;
}

/** @returns {boolean} whether a row actually changed. */
export async function setStatus(db, id, status) {
  assertId(id);
  if (!STATUSES.includes(status)) throw new ConfigValidationError('Invalid status');
  const result = await db
    .prepare('UPDATE submissions SET status = ?, updated_at = ? WHERE id = ? AND status != ?')
    .bind(status, Math.floor(Date.now() / 1000), id, status).run();
  return Number(result.meta?.changes || 0) > 0;
}

/** Bulk triage - one statement, because marking 50 rows read is one action. */
export async function setStatusAll(db, ids, status) {
  const clean = [...new Set((Array.isArray(ids) ? ids : []).map(assertId))].slice(0, MAX_PAGE);
  if (!clean.length) return 0;
  if (!STATUSES.includes(status)) throw new ConfigValidationError('Invalid status');
  const result = await db.prepare(
    `UPDATE submissions SET status = ?, updated_at = ?
     WHERE id IN (${clean.map(() => '?').join(', ')})`,
  ).bind(status, Math.floor(Date.now() / 1000), ...clean).run();
  return Number(result.meta?.changes || 0);
}

export async function deleteSubmission(db, id) {
  assertId(id);
  const result = await db.prepare('DELETE FROM submissions WHERE id = ?').bind(id).run();
  return Number(result.meta?.changes || 0) > 0;
}

/** Deleting a domain takes its inbox with it - nothing is left addressed to a page that is gone. */
export async function deleteForHostname(db, hostname) {
  await db.prepare('DELETE FROM submissions WHERE hostname = ?')
    .bind(normalizeHostname(hostname)).run();
}

/**
 * CSV, with the leading-formula guard applied before quoting so a downloaded
 * export stays inert when a spreadsheet opens it.
 */
export function inboxCsv(records) {
  const cell = (value) => {
    let text = String(value ?? '');
    if (/^[=+\-@]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  const header = ['received_utc', 'hostname', 'kind', 'status', 'email', 'name', 'subject',
    'message', 'offer_amount', 'answer', 'consent'];
  const lines = records.map((record) => [
    record.createdAt ? new Date(record.createdAt * 1000).toISOString() : '',
    record.hostname, record.kind, record.status, record.email, record.name, record.subject,
    record.message, record.offerAmount, record.answer, record.consent ? 'yes' : 'no',
  ].map(cell).join(','));
  return [header.map(cell).join(','), ...lines].join('\r\n');
}
