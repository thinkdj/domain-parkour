-- Capture form submissions: offers, waitlist signups, survey answers.
--
-- The shared renderer emits these forms whenever a page is configured to accept
-- them, so the self-hosted app needs somewhere to put what arrives. Read them
-- with `pnpm db:leads`.
--
-- `dedupe_key` is a hash of hostname|kind|email for a waitlist signup, so the
-- same address joining twice is one row, and a random id for everything else,
-- because two offers from one person are two offers.

CREATE TABLE IF NOT EXISTS submissions (
  id           TEXT PRIMARY KEY,
  hostname     TEXT NOT NULL,
  kind         TEXT NOT NULL,
  email        TEXT,
  name         TEXT,
  message      TEXT,
  offer_amount TEXT,
  answer       TEXT,
  dedupe_key   TEXT NOT NULL,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(hostname, kind, dedupe_key)
);

CREATE INDEX IF NOT EXISTS idx_submissions_host_created
  ON submissions(hostname, created_at DESC);
