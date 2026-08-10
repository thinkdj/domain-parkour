-- The inbox: everything a visitor sends the owner, in one table.
--
-- The shared renderer emits contact, offer, waitlist and survey forms whenever a
-- page is configured to accept them, so the self-hosted app needs somewhere to
-- put what arrives. `/_admin_/` reads it - this is the surface that replaces
-- forwarding a public address to a mailbox.
--
-- `status` is the whole triage vocabulary: a row is new until it is read, then
-- archived when it is dealt with, or spam. Nothing is deleted implicitly.
--
-- `dedupe_key` is a hash of hostname|kind|email for a waitlist signup, so the
-- same address joining twice is one row, and a random id for everything else,
-- because two messages from one person are two messages.

CREATE TABLE IF NOT EXISTS submissions (
  id           TEXT PRIMARY KEY,
  hostname     TEXT NOT NULL,
  kind         TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'new',
  email        TEXT,
  name         TEXT,
  subject      TEXT,
  message      TEXT,
  offer_amount TEXT,
  answer       TEXT,
  consent      INTEGER NOT NULL DEFAULT 0,
  dedupe_key   TEXT NOT NULL,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(hostname, kind, dedupe_key)
);

-- The unified inbox lists every hostname at once and filters in SQL, so the
-- newest-first scan is the index that matters; the other two serve the filters.
CREATE INDEX IF NOT EXISTS idx_submissions_created
  ON submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_status_created
  ON submissions(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_host_created
  ON submissions(hostname, created_at DESC);
