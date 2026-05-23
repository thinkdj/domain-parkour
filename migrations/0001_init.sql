-- Domain Parkour D1 schema
-- One row per hostname; `config` is a JSON blob with mode-specific fields.

CREATE TABLE IF NOT EXISTS domains (
  hostname    TEXT PRIMARY KEY,
  mode        TEXT NOT NULL DEFAULT 'landing',
  config      TEXT NOT NULL DEFAULT '{}',
  created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_domains_updated ON domains(updated_at DESC);
