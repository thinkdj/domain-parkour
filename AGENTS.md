# Domain Parkour contributor notes

## Scope

- This is the public MIT-licensed, self-hosted runtime. It must work without Domain Parkour Cloud, an account service, billing, or a provider control plane.
- A deployment uses one Cloudflare Worker, D1 for hostname configuration, and private R2 for managed images.
- It supports four modes: parking, coming soon, landing, and profile. It has no application-level hostname limit; Cloudflare limits still apply.

## Safety and ownership

- Keep all page content configuration-driven and safely escaped. Do not add raw HTML or arbitrary visitor-executed JavaScript fields.
- The production admin at /_admin_/ requires ADMIN_USER and ADMIN_PASSWORD Worker secrets. Never weaken authentication or put credentials in repository files.
- R2 remains private. Assets are served only through the Worker after validation.
- Domain attachment and DNS changes are intentionally manual. Do not add automatic DNS mutation or a hidden external control-plane dependency.
- Do not claim hosted-only features here: no Cloud entitlement tiers, paid checkout, hosted Signals, lead inbox, scheduled release, or fleet operations.

## Design

- The Parkour design system is the contract for every pixel. Its five principles are load-bearing: the domain is the hero, calm surfaces with one accent, mono for machine truth, reversible by design, restraint over garnish.
- `src/styles/tokens.js` is the single source of color, type, radius, elevation, and motion, and it is shared by the visitor templates and the admin. Change a value there, never in a component.
- A page's configured accent enters only as `--color-primary`; hovers, tints, and rings derive with `color-mix()`. Do not add a second authored brand value per page.
- Visitor pages fetch nothing from a third party — no webfont, no icon CDN, no analytics. Fonts name the face and fall back to the system; the icons used are inlined in `src/icons.js`.
- No gradients, glass, glow, hover lift, or entrance animation. `test/design-system.test.mjs` enforces this and the token, radius, and motion scales.

## Working conventions

- Keep the runtime dependency-light, accessible, responsive, and deployable with standard Wrangler tooling.
- Change defaults.json, migrations, validation, templates, admin UI, and tests together when their contract changes.
- Run pnpm test and pnpm test:coverage before handoff. Test public rendering, admin authentication, configuration validation, and R2 behavior when relevant.
- Keep README.md, GUIDE.md, docs/CONFIGURATION.md, and this file current when user-facing behavior changes.
