/**
 * D1 helpers for the `domains` table. Config is stored as a JSON blob alongside
 * a denormalized `mode` for quick filtering in admin listings.
 */

import { normalizeHostname, normalizeMode, sanitizeStoredConfig } from "./safety.js";

const DEFAULT_HOSTNAME = "_default";

function rowToRecord(row) {
  if (!row) return null;
  let hostname;
  try {
    hostname = normalizeHostname(row.hostname);
  } catch {
    return null;
  }
  let rawConfig = {};
  try {
    rawConfig = JSON.parse(row.config || "{}");
  } catch {
    rawConfig = {};
  }
  const { mode, config } = sanitizeStoredConfig(rawConfig, normalizeMode(row.mode));
  return {
    hostname,
    mode,
    config,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getDomain(db, hostname) {
  const normalizedHostname = normalizeHostname(hostname);
  const row = await db
    .prepare("SELECT hostname, mode, config, created_at, updated_at FROM domains WHERE hostname = ?")
    .bind(normalizedHostname)
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
  return (results || []).map(rowToRecord).filter(Boolean);
}

export async function upsertDomain(db, hostname, mode, config) {
  const now = Math.floor(Date.now() / 1000);
  const normalizedHostname = normalizeHostname(hostname);
  const normalizedMode = normalizeMode(mode) || "landing";
  const normalizedConfig = sanitizeStoredConfig(config, normalizedMode).config;
  const json = JSON.stringify(normalizedConfig);
  await db
    .prepare(
      `INSERT INTO domains (hostname, mode, config, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(hostname) DO UPDATE SET
         mode = excluded.mode,
         config = excluded.config,
         updated_at = excluded.updated_at`,
    )
    .bind(normalizedHostname, normalizedMode, json, now, now)
    .run();
  return getDomain(db, normalizedHostname);
}

export async function deleteDomain(db, hostname) {
  await db.prepare("DELETE FROM domains WHERE hostname = ?").bind(normalizeHostname(hostname)).run();
}
