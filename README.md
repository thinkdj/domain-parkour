# Domain Parkour

Domain Parkour is an MIT-licensed, self-hosted Cloudflare Worker for making unused domains useful. Run one Worker with D1-backed configuration, attach the exact hostnames you own, and manage each page from the built-in live-preview admin.

It is deliberately independent: your Worker, D1 data, R2 assets, traffic, and Cloudflare bill stay in your account. There is no Domain Parkour account, hosted control-plane dependency, payment system, or application-level hostname limit.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/thinkdj/domain-parkour)

![Domain Parkour screenshot](assets/ss-parkour.png)

## Included

| Mode | Use it for |
| --- | --- |
| parking | A clear for-sale or holding page |
| coming-soon | A launch announcement and countdown |
| landing | A focused information page and destination |
| profile | A personal profile with links and an uploaded image |

- Exact-hostname configuration in D1, with an intentional _default fallback.
- A password-protected admin at /_admin_/ with live preview, presets, and mode-aware fields.
- Private R2 image uploads delivered through the Worker.
- Responsive light/dark rendering, safe configuration, local assets, and a configurable credit footer.
- One shared design system across the pages and the admin, with no webfont, icon CDN, or other third-party request on a visitor page.
- Manual Cloudflare deployment and domain attachment, with no external runtime dependency.
- `defaults.json` supplies the bundled fallback, per-mode wording, and local gallery presets.

Domain Parkour itself does not manage sales, payments, email, DNS changes, hosted analytics, inboxes, schedules, or Cloud plans. Those are not part of the self-hosted runtime.

## Start locally

Requirements: Node 22+ and pnpm 10.

    corepack enable
    pnpm install --frozen-lockfile
    pnpm dev:local

Open:

- Gallery: http://localhost:8787/
- Admin: http://localhost:8787/_admin_/
- Local credentials: admin / admin

Local development uses Wrangler's D1 and R2 simulators. It does not require a Cloudflare account or modify remote resources.

## Deploy

    pnpm exec wrangler login
    pnpm setup --remote
    pnpm deploy
    pnpm exec wrangler secret put ADMIN_USER
    pnpm exec wrangler secret put ADMIN_PASSWORD

The setup command creates or finds the D1 database and private R2 bucket, writes the identifiers into wrangler.toml, and applies the migrations. Attach each hostname as a Workers Custom Domain in Cloudflare after deployment.

Set both admin secrets before using production. The admin remains disabled until they are configured.

## Commands

| Command | Purpose |
| --- | --- |
| pnpm test | Run the Node test suite |
| pnpm test:coverage | Run the Node test suite with coverage |
| pnpm dev:local | Prepare local D1/R2 and start the local Worker |
| pnpm dev | Start Wrangler directly |
| pnpm setup | Prepare local configuration and migrations |
| pnpm setup --remote | Also provision/apply the remote setup |
| pnpm deploy | Deploy the Worker |
| pnpm db:migrate:local | Apply local D1 migrations |
| pnpm db:migrate:remote | Apply remote D1 migrations |
| pnpm db:console | List local hostname records |
| pnpm tail | Stream Worker logs |

## Architecture

    request
      -> /_assets/* : private R2 asset delivery
      -> /_admin_/* : Basic Auth admin and JSON API
      -> public page : exact D1 hostname -> _default -> bundled fallback

Apex and www are separate hostnames. Domain Parkour never attaches or changes DNS for you. Cloudflare's own product limits still apply, but Domain Parkour does not impose a hostname quota.

## Documentation

- [GUIDE.md](GUIDE.md) - deployment, operations, backup, rollback, and removal.
- [docs/CONFIGURATION.md](docs/CONFIGURATION.md) - fields, modes, defaults, and storage.
- [SECURITY.md](SECURITY.md) - security model and reporting.
- [CONTRIBUTING.md](CONTRIBUTING.md) - contribution workflow.
- [AGENTS.md](AGENTS.md) - contributor guardrails.

## License

MIT © 2026 Deepak Thomas. See [LICENSE](LICENSE).
