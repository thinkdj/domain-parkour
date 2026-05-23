/**
 * D1 helpers for the `domains` table. Config is stored as a JSON blob alongside
 * a denormalized `mode` for quick filtering in admin listings.
 */

const DEFAULT_HOSTNAME = "_default";

function rowToRecord(row) {
  if (!row) return null;
  let config = {};
  try {
    config = JSON.parse(row.config || "{}");
  } catch {
    config = {};
  }
  return {
    hostname: row.hostname,
    mode: row.mode,
    config,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getDomain(db, hostname) {
  const row = await db
    .prepare("SELECT hostname, mode, config, created_at, updated_at FROM domains WHERE hostname = ?")
    .bind(hostname)
    .first();
  return rowToRecord(row);
}

export async function getDomainOrDefault(db, hostname) {
  const exact = await getDomain(db, hostname);
  if (exact) return exact;
  return getDomain(db, DEFAULT_HOSTNAME);
}

export async function listDomains(db) {
  const { results } = await db
    .prepare(
      "SELECT hostname, mode, config, created_at, updated_at FROM domains ORDER BY updated_at DESC",
    )
    .all();
  return (results || []).map(rowToRecord);
}

export async function upsertDomain(db, hostname, mode, config) {
  const now = Math.floor(Date.now() / 1000);
  const json = JSON.stringify(config || {});
  await db
    .prepare(
      `INSERT INTO domains (hostname, mode, config, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(hostname) DO UPDATE SET
         mode = excluded.mode,
         config = excluded.config,
         updated_at = excluded.updated_at`,
    )
    .bind(hostname, mode || "landing", json, now, now)
    .run();
  return getDomain(db, hostname);
}

export async function deleteDomain(db, hostname) {
  await db.prepare("DELETE FROM domains WHERE hostname = ?").bind(hostname).run();
}
