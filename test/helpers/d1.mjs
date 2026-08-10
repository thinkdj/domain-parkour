/**
 * A D1-shaped adapter over node:sqlite, seeded from the real migrations.
 *
 * The inbox is mostly SQL — filters, counts, an escaped LIKE — so a hand-rolled
 * stub would only ever assert that the code calls the stub. This runs the same
 * statements against the same schema SQLite gives the Worker.
 */

import { DatabaseSync } from 'node:sqlite';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const MIGRATIONS = fileURLToPath(new URL('../../migrations/', import.meta.url));

/** node:sqlite rejects undefined and booleans; D1 accepts null and 0/1. */
function clean(params) {
  return params.map((value) => {
    if (value === undefined || value === null) return null;
    if (typeof value === 'boolean') return value ? 1 : 0;
    return value;
  });
}

export function createD1() {
  const db = new DatabaseSync(':memory:');
  for (const file of readdirSync(MIGRATIONS).filter((name) => name.endsWith('.sql')).sort()) {
    db.exec(readFileSync(join(MIGRATIONS, file), 'utf8'));
  }

  const run = (sql, params) => {
    const statement = db.prepare(sql);
    const args = clean(params);
    return {
      all: async () => ({ results: statement.all(...args), success: true }),
      first: async () => statement.all(...args)[0] ?? null,
      run: async () => ({ success: true, meta: { changes: Number(statement.run(...args).changes) || 0 } }),
    };
  };

  return {
    prepare(sql) {
      return { ...run(sql, []), bind: (...params) => run(sql, params) };
    },
  };
}

/** Insert one submission, with everything not named left at a sensible default. */
export async function seedSubmission(db, overrides = {}) {
  const row = {
    id: crypto.randomUUID(),
    hostname: 'cdn.farm',
    kind: 'contact',
    status: 'new',
    email: 'someone@example.com',
    name: 'Someone',
    subject: null,
    message: 'Hello there.',
    offer_amount: null,
    answer: null,
    consent: 0,
    dedupe_key: crypto.randomUUID(),
    created_at: Math.floor(Date.now() / 1000),
    ...overrides,
  };
  await db.prepare(
    `INSERT INTO submissions
       (id, hostname, kind, status, email, name, subject, message, offer_amount, answer,
        consent, dedupe_key, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    row.id, row.hostname, row.kind, row.status, row.email, row.name, row.subject, row.message,
    row.offer_amount, row.answer, row.consent, row.dedupe_key, row.created_at, row.created_at,
  ).run();
  return row;
}
