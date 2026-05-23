# Domain Parkour

Ultra-minimal domain parking, coming-soon, and landing pages for Cloudflare Workers — with a built-in admin panel and live preview.

**One worker serves every domain you own, with per-hostname configs stored in D1 and managed from a live-preview admin UI.**

![Screenshot of domain parkour](assets/ss-parkour.png)

## TL;DR

```bash
pnpm install
npx wrangler login                  # if you haven't already
pnpm setup                       # creates D1, patches wrangler.toml, writes .dev.vars
pnpm dev                         # http://localhost:8787  +  /_admin_/  (admin / admin)
```

That's the dev loop. Deploy later with `pnpm setup --remote && pnpm deploy`.

The admin panel:

- lists every domain you've configured,
- gives you a mode-aware editor (parking / coming-soon / landing),
- renders a live iframe preview as you type,
- saves with ⌘S, deletes with one click.

## Features

- **Four modes**: `parking` (domain for sale), `coming-soon` (launch page), `landing` (simple info page), `profile` (personal bio page)
- **One deployment, many domains** — config resolved per request hostname
- **D1-backed** — queryable, exportable, no per-key gymnastics
- **Built-in admin** at `/_admin_/` with Basic Auth (worker secrets)
- **Live preview** — debounced iframe re-render as you edit
- **Preset gallery** — clone from any example in `config.dev.local.example.json`
- **Catch-all** via a `_default` hostname row
- Responsive design with auto dark/light mode

## Quick Setup

### 1. One-time

```bash
pnpm install
npx wrangler login
pnpm setup
```

`npm run setup` will:

1. Verify you're logged in to Cloudflare.
2. Create a D1 database called `domain-parkour-db` (or reuse an existing one).
3. Write the resulting `database_id` into `wrangler.toml`.
4. Apply migrations locally.
5. Write `.dev.vars` with default `admin` / `admin` credentials for local dev.

### 2. Local dev

```bash
pnpm dev
```

- Public preview: <http://localhost:8787/> — shows the local theme gallery (with switcher) by default.
- Admin panel: <http://localhost:8787/_admin_/> — log in with `admin` / `admin`.

### 3. Production

Before deploying for the first time:

```bash
wrangler secret put ADMIN_USER          # whatever username
wrangler secret put ADMIN_PASSWORD      # something strong
pnpm setup --remote               # apply migrations on the remote D1
pnpm deploy
```

Then map domains to the worker from the Cloudflare dashboard:
**Workers & Pages → your worker → Settings → Domains & Routes → Add Custom Domain**.

Open `https://<your-mapped-domain>/_admin_/` and start adding sites.

## Admin panel

Once running, the admin lets you:

- Pick an existing domain from the dropdown, or start a new one with `+ New` (or `Ctrl/⌘+N`).
- Switch modes with the tab pills — the form re-shapes itself to show only relevant fields.
- See your changes rendered live in the right pane (debounced ~220ms).
- Save with the Save button or `Ctrl/⌘+S`.
- Open the live, deployed page in a new tab with `↗ Open`.
- Browse preset configurations from `config.dev.local.example.json` under the "Presets" section.

### Auth

Admin uses HTTP Basic Auth backed by worker secrets:

| Setting           | Local dev (`.dev.vars`) | Production (`wrangler secret`) |
| ----------------- | ----------------------- | ------------------------------ |
| `ADMIN_USER`      | `admin` (default)       | required                       |
| `ADMIN_PASSWORD`  | `admin` (default)       | required                       |

In production with **either secret missing**, the admin panel responds `503 Disabled` instead of falling back to defaults. In local dev, the defaults remain so you can iterate fast — the UI shows a yellow banner reminding you to set real secrets before deploying.

## Catch-all (`_default`)

Configs are looked up by exact hostname. If a request comes in for a hostname that has no row, the worker checks for a row named `_default` and uses that. Create one in the admin to provide a sane fallback for un-configured domains.

## Schema

```sql
CREATE TABLE domains (
  hostname    TEXT PRIMARY KEY,
  mode        TEXT NOT NULL DEFAULT 'landing',
  config      TEXT NOT NULL DEFAULT '{}',   -- JSON blob
  created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at  INTEGER NOT NULL DEFAULT (unixepoch())
);
```

The `config` JSON blob holds all mode-specific fields. The denormalised `mode` column exists so the admin can list sites without parsing every blob.

## Config fields by mode

### parking

`domainTitle`, `title`, `description`, `salePrice`, `contactEmail`, `domainAgeYears`, `domainRegistration`, `accentColor`, `footerText`, `showCredit`, `socialLinks`

### coming-soon

`domainTitle`, `title`, `description`, `tagline`, `launchDate` (ISO 8601), `accentColor`, `features: [{title, description}]`, `footerText`, `showCredit`, `socialLinks`

### landing

`domainTitle`, `title`, `subtitle`, `description`, `accentColor`, `links: [{title, url}]`, `footerText`, `showCredit`, `socialLinks`

### profile

`domainTitle`, `name`, `role`, `bio`, `avatarUrl`, `accentColor`, `links: [{title, url}]`, `footerText`, `showCredit`, `socialLinks` — falls back to `domainTitle` when `name` is omitted; avatar shows initials when `avatarUrl` is empty.

Color suggestions: `#3b82f6` (blue), `#a855f7` (purple), `#10b981` (green), `#ef4444` (red), `#f97316` (orange), `#ec4899` (pink).

## Config priority

1. **Local dev theme gallery** — `config.dev.local.example.json` is used for `localhost`/`workers.dev` requests so you can preview every example by appending `?themeIndex=N`.
2. **D1** — exact hostname row, then `_default`.
3. **Hardcoded fallback** — bare "Welcome" page with the default accent.

## Scripts

| Command                       | What                                                                |
| ----------------------------- | ------------------------------------------------------------------- |
| `pnpm setup`               | Local setup — creates D1, patches `wrangler.toml`, writes `.dev.vars`. |
| `pnpm setup --remote`   | Same + applies migrations to the remote D1.                         |
| `pnpm dev`                 | `wrangler dev` on `http://localhost:8787`.                          |
| `pnpm deploy`              | `wrangler deploy`.                                                  |
| `pnpm db:migrate:local`    | Apply migrations to local D1 only.                                  |
| `pnpm db:migrate:remote`   | Apply migrations to remote D1 only.                                 |
| `pnpm db:console`          | List all configured domains in the local DB.                        |
| `pnpm tail`                | `wrangler tail` for live logs in production.                        |

## License

MIT
