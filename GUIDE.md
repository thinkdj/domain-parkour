# Domain Parkour Self-hosting Guide

This guide is the canonical installation and operations manual for the current open-source Domain Parkour Worker.

## 1. What you will deploy

- One Cloudflare Worker named `domain-parkour`.
- One Cloudflare D1 database named `domain-parkour-db`.
- A D1 binding named `DB`.
- One private Cloudflare R2 bucket named `domain-parkour-assets`.
- An R2 binding named `ASSETS` for uploaded profile images and future page assets.
- Two Worker secrets: `ADMIN_USER` and `ADMIN_PASSWORD`.
- One or more exact Workers Custom Domains that you attach manually.

One Worker can serve multiple selected hostnames. Each hostname has its own row in D1. If an exact row does not exist, Domain Parkour checks `_default` and then uses the bundled fallback from `defaults.json`.

## 2. Requirements

### Local preview only

- Node.js 22 or newer.
- pnpm 10; the repository pins `pnpm@10.15.1` in `package.json`.

No Cloudflare account is needed for local preview.

### Production deployment

- The local requirements above.
- A Cloudflare account.
- A domain using an active Cloudflare zone.
- Permission to create a Worker and D1 database in the account.
- Permission to create an R2 bucket in the account.
- Permission to attach Workers Custom Domains to the selected zone.

Cloudflare usage is billed by Cloudflare and is independent of Domain Parkour. Review the current [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/) and [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/) before using the project for high traffic.

## 3. Clone and install

```bash
git clone <your-domain-parkour-repository-url>
cd domain-parkour
corepack enable
pnpm install --frozen-lockfile
```

If you downloaded a source archive rather than cloning, enter the extracted directory before running the pnpm commands.

Use pnpm throughout. The repository's lockfile is `pnpm-lock.yaml`.

## 4. Run locally without Cloudflare

```bash
pnpm dev:local
```

The command:

- Creates `.dev.vars` when needed.
- Uses local-only `admin` / `admin` credentials.
- Applies the D1 migration to Wrangler's local simulator.
- Starts the Worker, normally at `http://localhost:8787`.

Open:

- Public theme gallery: <http://localhost:8787/>
- Admin: <http://localhost:8787/_admin_/>

The local `admin/admin` credentials are development defaults only. Never configure them as production secrets.

To select a different port:

```bash
pnpm dev:local -- --port 9000
```

## 5. Understand local files

### `.dev.vars`

Local Wrangler secrets:

```dotenv
ADMIN_USER="admin"
ADMIN_PASSWORD="admin"
```

The file is gitignored. Do not commit it.

### `.wrangler/`

Wrangler's local state, including the simulated D1 database. It is gitignored and may be removed when you deliberately want a fresh local environment.

### `defaults.json`

The single source for bundled fallback content, per-mode wording defaults, and local gallery/admin demo presets. It is not the production database; saved hostname configuration remains in D1.

### `wrangler.toml`

Defines the Worker, production D1 binding, and R2 asset binding. Production setup replaces:

```toml
database_id = "REPLACE_WITH_YOUR_D1_DATABASE_ID"
```

with your actual D1 UUID.

The R2 binding uses a stable bucket name and needs no bucket ID:

```toml
[[r2_buckets]]
binding = "ASSETS"
bucket_name = "domain-parkour-assets"
```

Local Wrangler development stores R2 objects in local simulator state; it does not upload local profile images to the production bucket.

## 6. Automated production setup

First authenticate Wrangler:

```bash
pnpm exec wrangler login
pnpm exec wrangler whoami
```

Then run:

```bash
pnpm setup --remote
```

The current setup script:

1. Verifies the Wrangler login.
2. Finds or creates `domain-parkour-db` in the active Cloudflare account.
3. Finds or creates the private `domain-parkour-assets` R2 bucket.
4. Writes the D1 UUID into `wrangler.toml`.
5. Applies the migration locally.
6. Applies the migration remotely because `--remote` was provided.
7. Ensures `.dev.vars` exists for local development.

Review the resulting `git diff -- wrangler.toml`. A Cloudflare database UUID is installation-specific and should normally be kept in deployment configuration rather than copied into a reusable template or another user's installation.

## 7. Manual production setup

Use this path if you prefer explicit commands or the setup script fails.

### 7.1 Create D1

```bash
pnpm exec wrangler d1 create domain-parkour-db
```

Wrangler prints a D1 configuration block containing a UUID. Put the UUID into the existing `[[d1_databases]]` block in `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "domain-parkour-db"
database_id = "YOUR-D1-UUID"
migrations_dir = "migrations"
```

Do not add a second `DB` binding.

### 7.2 Create R2

```bash
pnpm exec wrangler r2 bucket create domain-parkour-assets
```

Keep the bucket private. Domain Parkour serves uploaded objects through its own `/_assets/` route, so an R2 public development URL or custom bucket domain is not required.

### 7.3 Apply migrations

```bash
pnpm db:migrate:local
pnpm db:migrate:remote
```

The initial migration creates:

```sql
CREATE TABLE domains (
  hostname TEXT PRIMARY KEY,
  mode TEXT NOT NULL DEFAULT 'landing',
  config TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
```

## 8. Deploy the Worker

Deploy first with the admin disabled:

```bash
pnpm deploy
```

Production intentionally returns `503 Disabled` for `/_admin_/` until both admin secrets exist.

Set strong, unique values:

```bash
pnpm exec wrangler secret put ADMIN_USER
pnpm exec wrangler secret put ADMIN_PASSWORD
```

Wrangler prompts for each value without requiring it on the command line. Avoid shell history, screenshots, issue comments, and CI logs containing the secret.

Verify the deployment in the Cloudflare Workers dashboard before attaching a production hostname.

## 9. Attach a domain

Workers Custom Domains are the recommended self-hosted attachment method for parked domains.

In the Cloudflare dashboard:

1. Open **Workers & Pages**.
2. Select the `domain-parkour` Worker.
3. Open **Settings** → **Domains & Routes**.
4. Choose **Add** → **Custom Domain**.
5. Enter one exact hostname, such as `example.com`.
6. Review any existing-record warning carefully.
7. Confirm and wait for certificate provisioning.

Attach `www.example.com` separately if you want the Worker to serve it. Apex and `www` are distinct hostnames.

Cloudflare Custom Domains make the Worker the origin for all HTTP/S paths on that exact hostname. Do not attach a hostname currently serving an application unless that is intentional. Existing CNAME records can block attachment. Read the current [Custom Domains documentation](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/) before replacing production DNS.

Domain Parkour OSS does not currently capture the previous DNS values for you. Before changing a live hostname, export or record its relevant A/AAAA/CNAME records so you can restore them manually.

## 10. Configure the first page

After the Custom Domain is active, open:

```text
https://example.com/_admin_/
```

Authenticate with the production secrets, then:

1. Choose **New**.
2. Enter the exact hostname, for example `example.com`.
3. Select a page type.
4. Fill in its fields.
5. Review the live preview.
6. Save.
7. Open the public hostname in a private browser window.

For Profile pages, enter the hostname before choosing **Upload image**. The upload is written to R2 immediately; saving the page stores its returned asset path in the D1-backed page configuration.

If `www.example.com` is also attached, create a separate row for it or create a suitable `_default` fallback.

### Supported page types

| Mode | Use |
| --- | --- |
| `parking` | Domain-for-sale or parked page |
| `coming-soon` | Pre-launch announcement/countdown content |
| `landing` | Small information/links page |
| `profile` | Personal profile/link page |
| `redirect` | Forward visitors to another URL |
| `maintenance` | Temporary 503 status page |

The complete implemented configuration fields are documented in [`docs/CONFIGURATION.md`](docs/CONFIGURATION.md).

## 11. Collect messages, and read them

Section **03 Messages** in the page editor decides which forms a page shows:

| Switch | Renders on | What arrives |
| --- | --- | --- |
| Contact form | every content page | name, email, subject, message |
| Offer form | parking | name, email, amount, message |
| Waitlist form | coming soon | email only |
| Survey question | every content page | one free-text answer, email optional |

Consent text is optional and applies to every form on the page; when set, the
checkbox is required and the answer is stored with the message.

Your address is never printed on a page. Everything submitted goes straight into
the `submissions` table in your own D1 and appears under the **Inbox** tab in the
admin - one list across every hostname this Worker serves, with unread/archived/
spam triage, search by name, address, subject or body, per-domain and per-type
filters, and a CSV export of whatever the current filter shows.

**Replying is deliberately not automated.** The Worker sends no mail. The Reply
button opens a pre-addressed message in your own mail client, so the reply comes
from you, arrives with your own deliverability, and leaves no copy behind.

## 12. `_default` fallback

Resolution order is:

1. Exact normalized hostname.
2. D1 row named `_default`.
3. Bundled `defaults.json` fallback.

Create `_default` only when you intentionally want unconfigured attached hostnames to share a fallback page. It is not a substitute for attaching DNS/Custom Domains; it affects only requests that already reach the Worker.

## 13. Admin security

The current OSS admin uses HTTP Basic Auth. Treat `/_admin_/` as a privileged operational interface.

Required practices:

- Use long unique production credentials.
- Never reuse the local `admin/admin` pair.
- Keep `.dev.vars` and secret values out of Git.
- Rotate credentials when a collaborator no longer needs access.
- Do not embed Cloudflare API tokens in page config or browser code.
- Prefer a separate operational hostname and Cloudflare Access as an additional layer where your routing setup allows it.
- If the Worker is attached to multiple public hostnames, remember the admin path is technically present on each; protect every exposed path, not only your favorite admin URL.
- Keep Wrangler and dependencies updated after reviewing release notes.

See [`SECURITY.md`](SECURITY.md) for vulnerability reporting and the project threat model.

## 14. Inspect the database

List configured rows in the local database:

```bash
pnpm db:console
```

List the newest inbox rows in the local database:

```bash
pnpm db:inbox
```

For a remote read-only inspection:

```bash
pnpm exec wrangler d1 execute domain-parkour-db --remote --command "SELECT hostname, mode, updated_at FROM domains ORDER BY updated_at DESC"
```

Avoid pasting untrusted strings into SQL commands. Prefer the admin UI for routine edits.

## 15. Back up

Back up before upgrades, mass edits, DNS changes, or uninstall.

Export the remote D1 database:

```bash
pnpm exec wrangler d1 export domain-parkour-db --remote --output domain-parkour-backup.sql
```

Store the export securely. It contains everything visitors sent through your capture forms - names, email addresses, offers and messages - alongside contact addresses, links, descriptions, and other page content.

Also record:

- The deployed Worker version/date.
- Current `wrangler.toml` binding configuration.
- Every attached Custom Domain.
- Relevant DNS before changing or removing a hostname.

R2 objects are not included in a D1 export. Back up `domain-parkour-assets` separately when profile images must be preserved.

Do not commit backups; `.gitignore` does not cover every possible backup filename.

## 16. Restore

Restore into a disposable/local database first when possible.

For a remote restore, review the SQL file before running it. Depending on whether the export contains schema statements and whether the destination is empty, you may need to apply migrations first.

```bash
pnpm db:migrate:remote
pnpm exec wrangler d1 execute domain-parkour-db --remote --file domain-parkour-backup.sql
```

Restoring into a non-empty database can conflict with existing primary keys. Make a fresh backup first and decide whether you intend a merge or replacement. The current project does not provide a transactional merge wizard.

After restore, verify at least one exact hostname and `_default` behavior.

## 17. Upgrade

For a Git clone:

1. Read release notes and migration notes.
2. Back up remote D1.
3. Record the current Worker deployment/version.
4. Pull the intended tagged release.
5. Install the pinned lockfile.
6. Apply remote migrations.
7. Deploy.
8. Test admin, preview, and every page mode you use.

Typical commands:

```bash
git pull --ff-only
pnpm install --frozen-lockfile
pnpm db:migrate:remote
pnpm deploy
```

Do not run a new migration against production until you understand its rollback/compatibility implications.

## 18. Roll back the Worker

If a deployment breaks rendering but did not make an incompatible D1 migration, use Cloudflare's Workers deployment history to restore the prior Worker version. Current Wrangler releases may also expose deployment rollback commands; verify the command against the installed Wrangler version before using it.

Database migrations and Worker versions are separate. Rolling back Worker code does not automatically roll back D1.

## 19. Remove a hostname

Before detaching:

1. Back up D1.
2. Record the current Custom Domain and DNS state.
3. Decide whether the D1 config row should remain for later reuse.
4. Remove the Custom Domain from **Settings** → **Domains & Routes**.
5. Restore the intended origin records if the hostname should serve another site.
6. Verify DNS and HTTPS from outside your local cache.

Removing a Workers Custom Domain can leave a generated certificate visible in Cloudflare. Consult Cloudflare documentation before deleting unrelated certificates.

## 20. Uninstall

Uninstall is destructive. Export D1 and record DNS/Custom Domains first.

Safe order:

1. Remove or replace every Custom Domain/route intentionally.
2. Verify each hostname serves its intended new destination.
3. Export D1.
4. Delete the Worker.
5. Delete D1 only after confirming the backup is usable.
6. Empty and delete the R2 bucket only after confirming uploaded images are backed up or no longer needed.

Commands for the final resource deletion are typically:

```bash
pnpm exec wrangler delete domain-parkour
pnpm exec wrangler d1 delete domain-parkour-db
pnpm exec wrangler r2 bucket delete domain-parkour-assets
```

Wrangler may prompt for confirmation. Resource deletion is not undone by Git. Never delete a same-name Worker or D1 unless you verified its binding and ownership.

## 21. Troubleshooting

### Admin returns `503 Disabled`

One or both production secrets are missing. Set both:

```bash
pnpm exec wrangler secret put ADMIN_USER
pnpm exec wrangler secret put ADMIN_PASSWORD
```

### Admin repeatedly asks for credentials

- Verify the secret values were set on the correct Worker/account.
- Check for a password manager or browser caching an old Basic Auth pair.
- Try a private browser window after rotating deliberately.

### Admin says D1 is not configured

- Confirm the `DB` binding exists in `wrangler.toml`.
- Confirm the UUID belongs to the active account.
- Apply remote migrations and redeploy.

```bash
pnpm db:migrate:remote
pnpm deploy
```

### Profile image upload says R2 is not configured

- Confirm the `ASSETS` binding exists in `wrangler.toml`.
- Confirm `domain-parkour-assets` exists in the active Cloudflare account.
- Run `pnpm setup`, then redeploy the Worker.

### Public page shows fallback instead of saved content

- Confirm the saved hostname exactly matches the request hostname.
- Check whether you are visiting apex or `www`.
- Confirm the request reaches the intended Worker.
- Query D1 for the row.
- Check whether a `_default` row is masking the expected `defaults.json` fallback.

### Custom Domain will not attach

- Confirm the Cloudflare zone is active.
- Inspect existing A/AAAA/CNAME and Worker attachments.
- A CNAME on the same exact hostname is a common blocker.
- Do not delete a record until you know what currently uses it and have recorded the value.

### Certificate is pending

Cloudflare certificate provisioning is asynchronous. Wait, refresh the Custom Domain status, and inspect any validation conflict. Repeatedly deleting/recreating the domain can make diagnosis harder.

### Local database looks empty after a restart

Make sure you launched from the same repository directory and did not remove `.wrangler/`. Local D1 is separate from remote D1.

## 22. Command reference

| Command | Purpose |
| --- | --- |
| `pnpm dev:local` | Create local secrets/migrations and start local Worker |
| `pnpm dev` | Start Wrangler directly; local D1 migration may be needed first |
| `pnpm setup` | Provision/find remote D1 and R2, patch config, apply local migration |
| `pnpm setup --remote` | Same, plus apply remote D1 migration |
| `pnpm deploy` | Deploy Worker |
| `pnpm db:migrate:local` | Apply migrations to local D1 |
| `pnpm db:migrate:remote` | Apply migrations to remote D1 |
| `pnpm db:console` | List configured local domains |
| `pnpm db:inbox` | List the newest local inbox rows |
| `pnpm tail` | Tail the deployed Worker logs |

## 23. Getting help

- Review this guide and the [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/).
- Search existing repository issues before opening a new one.
- Include Node, pnpm, Wrangler, operating system, and the failing command.
- Remove account IDs, database UUIDs, DNS values you consider sensitive, and every secret/token from logs before sharing.
- Security issues should follow [`SECURITY.md`](SECURITY.md), not a public issue.
