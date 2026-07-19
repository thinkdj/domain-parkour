# Domain Parkour

One Cloudflare Worker, many domains, four useful ways to land.

Domain Parkour is an MIT-licensed, self-hosted domain page system for Cloudflare. Attach the hostnames you own, choose a template for each one, and manage their content from a built-in live-preview editor. The Worker renders every page directly from D1 configuration, while R2 stores uploaded profile images.

It is intentionally small: no external origin, no framework runtime, no account service, and no dependency on a Domain Parkour server after deployment. Your Worker, data, assets, traffic, and Cloudflare bill stay in your account.

![Domain Parkour screenshot](assets/ss-parkour.png)

## What it provides

| Template | Purpose |
| --- | --- |
| `parking` | Present a domain for sale with pricing, history, contact, and trust details |
| `coming-soon` | Announce a launch with optional countdown and feature cards |
| `landing` | Publish a concise information page with destination and social links |
| `profile` | Publish a personal profile with an uploaded image, bio, and featured links |

Every template includes:

- Responsive light and dark appearances.
- A configurable accent color and visitor-facing wording.
- Optional social links and custom footer text.
- A toggleable `Built with Domain Parkour · powered by Cloudflare` credit.
- A live preview in the self-hosted admin.

The admin at `/_admin_/` supports exact-hostname records, an intentional `_default` fallback, mode-aware fields, demo presets, image uploads, and immediate preview updates.

## How it works

```text
visitor request
      |
      +-- /_assets/*  -> private R2 object served by the Worker
      |
      +-- /_admin_/*  -> Basic Auth admin and JSON API
      |
      `-- page request
             |
             +-- exact D1 hostname
             +-- _default D1 row
             `-- defaults.json fallback
                    |
                    `-- selected template -> HTML response
```

One deployment can serve multiple explicitly attached hostnames. Apex and `www` are separate records, and Domain Parkour does not alter DNS or attach domains automatically.

## Try it locally

Requirements: Node.js 20 or newer and pnpm 10.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev:local
```

Open:

- Gallery: <http://localhost:8787/>
- Admin: <http://localhost:8787/_admin_/>
- Local credentials: `admin` / `admin`

Local development uses Wrangler's local D1 and R2 simulators. It does not require a Cloudflare account and does not write uploaded images to the production bucket.

## Deploy to Cloudflare

```bash
pnpm exec wrangler login
pnpm setup --remote
pnpm deploy
pnpm exec wrangler secret put ADMIN_USER
pnpm exec wrangler secret put ADMIN_PASSWORD
```

`pnpm setup --remote` finds or creates:

- D1 database `domain-parkour-db` bound as `DB`.
- Private R2 bucket `domain-parkour-assets` bound as `ASSETS`.
- Local and remote D1 schema from `migrations/`.

After deployment, attach each hostname as a Workers Custom Domain in Cloudflare. Read [GUIDE.md](GUIDE.md) before changing a live hostname; it covers prerequisites, manual provisioning, domain attachment, backups, upgrades, rollback, and removal.

## Defaults and demos

All bundled content defaults live in [defaults.json](defaults.json):

| Section | Used for |
| --- | --- |
| `fallback` | Public page when neither an exact D1 row nor `_default` exists |
| `modes` | Default visitor-facing wording for all four templates |
| `presets` | Local gallery and admin template examples |

This is the first file to edit when changing demo content or baseline wording. Changes are bundled with the Worker, so restart local development or redeploy after editing it.

Saved page records remain in D1 as a `mode` plus a JSON configuration object. Uploaded profile images remain private in R2 and are exposed only through the Worker's `/_assets/` route. Replacing or deleting a saved profile removes its previous managed image.

The complete field reference is in [docs/CONFIGURATION.md](docs/CONFIGURATION.md).

## Security and ownership

- Production admin access is disabled until both `ADMIN_USER` and `ADMIN_PASSWORD` Worker secrets are configured.
- Local `admin` / `admin` credentials are development-only.
- R2 is private; no public bucket URL is required.
- Visitor requests are served by infrastructure in your Cloudflare account.
- Domain Parkour does not process domain sales, payments, email, or DNS changes.
- Back up D1 and R2 before upgrades or removal.

For the threat model and reporting process, read [SECURITY.md](SECURITY.md).

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm test` | Run defaults, template, footer, and R2 tests |
| `pnpm dev:local` | Prepare local D1 and start the Worker with local R2 |
| `pnpm dev` | Start Wrangler directly |
| `pnpm setup` | Provision/find D1 and R2, then apply local migrations |
| `pnpm setup --remote` | Also apply D1 migrations remotely |
| `pnpm deploy` | Deploy the Worker |
| `pnpm db:migrate:local` | Apply D1 migrations locally |
| `pnpm db:migrate:remote` | Apply D1 migrations remotely |
| `pnpm db:console` | List locally configured hostname records |
| `pnpm tail` | Stream deployed Worker logs |

## Project layout

```text
defaults.json            fallback, wording defaults, and demo presets
migrations/              D1 schema migrations
scripts/                 local development and Cloudflare setup
src/index.js             Worker entrypoint
src/config.js            hostname resolution and default application
src/templates/           four public renderers and shared components
src/admin/               self-hosted editor, API, and authentication
src/assets.js            R2 upload validation and public asset delivery
test/                    Node test suite
```

## Documentation

- [GUIDE.md](GUIDE.md) - installation and operations.
- [docs/CONFIGURATION.md](docs/CONFIGURATION.md) - modes, fields, defaults, and storage behavior.
- [SECURITY.md](SECURITY.md) - security model and vulnerability reporting.
- [CONTRIBUTING.md](CONTRIBUTING.md) - contribution workflow.

## Contributing

Issues and focused pull requests are welcome. Preserve the project's core properties: small pages, user-owned infrastructure, accessible output, safe configuration, and no external runtime dependency.

## License

MIT © 2026 Deepak Thomas. See [LICENSE](LICENSE).
