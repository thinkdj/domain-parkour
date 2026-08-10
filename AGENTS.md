# Domain Parkour contributor notes

## Scope

- This is the public MIT-licensed, self-hosted runtime. It must work without Domain Parkour Cloud, an account service, billing, or a provider control plane.
- A deployment uses one Cloudflare Worker, D1 for hostname configuration, and private R2 for managed images.
- It supports six modes: parking, coming soon, landing, profile, redirect, and maintenance. It has no application-level hostname limit; Cloudflare limits still apply.
- Capture forms (contact, offer, waitlist, survey) write into the `submissions` table, and `/_admin_/` reads them as one inbox across every hostname. Nothing is emailed: a reply is a `mailto:` handed to the operator's own client.

## Safety and ownership

- Keep all page content configuration-driven and safely escaped. Do not add raw HTML or arbitrary visitor-executed JavaScript fields.
- The production admin at /_admin_/ requires ADMIN_USER and ADMIN_PASSWORD Worker secrets. Never weaken authentication or put credentials in repository files.
- R2 remains private. Assets are served only through the Worker after validation.
- Domain attachment and DNS changes are intentionally manual. Do not add automatic DNS mutation or a hidden external control-plane dependency.
- Do not claim hosted-only features here: no Cloud entitlement tiers, paid checkout, hosted Signals, scheduled release, or fleet operations. The inbox is self-hosted and unmetered - it is not one of them.
- Never add outbound email, a webhook to a provider, or any relay of a submission off this Worker. A submission stays in the operator's D1 until they delete it.

## Design

- The Parkour design system is the contract for every pixel. Its five principles are load-bearing: the domain is the hero, calm surfaces with one accent, mono for machine truth, reversible by design, restraint over garnish.
- `src/styles/tokens.js` re-exports the workspace design system - tokens, motion, and the component layer - and the admin document inlines all of it. Buttons, badges, alerts, fields, switches, dialogs, toasts, the undo bar, choice cards and the message list come from that shared layer; only the Studio's own shell (workspace grid, preview device, form sections) is authored in `admin/ui.js`. Never fork a shared recipe to adjust it locally.
- A page's configured accent enters only as `--color-primary`; hovers, tints, and rings derive with `color-mix()`. Do not add a second authored brand value per page.
- Visitor pages fetch nothing from a third party - no webfont, no icon CDN, no analytics. Fonts name the face and fall back to the system; the icons used are inlined in `src/icons.js`.
- No gradients, glass, glow, hover lift, or entrance animation. `test/design-system.test.mjs` enforces this and the token, radius, and motion scales.

## Working conventions

- Keep the runtime dependency-light, accessible, responsive, and deployable with standard Wrangler tooling.
- Change defaults.json, migrations, validation, templates, admin UI, and tests together when their contract changes.
- Run pnpm test and pnpm test:coverage before handoff. Test public rendering, admin authentication, configuration validation, and R2 behavior when relevant.
- Keep README.md, GUIDE.md, docs/CONFIGURATION.md, and this file current when user-facing behavior changes.
