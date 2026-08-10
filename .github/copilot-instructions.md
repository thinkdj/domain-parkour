# Domain Parkour repository instructions

## Project shape

This public MIT repository contains the self-hosted Domain Parkour runtime:

- Cloudflare Worker entrypoint in `src/index.js`.
- Per-hostname configuration in Cloudflare D1 and managed image assets in R2.
- Self-hosted Basic Auth admin under `/_admin_/`.
- Four implemented modes: `parking`, `coming-soon`, `landing`, and `profile`.
- Bundled fallback content, mode wording, and demo presets in `defaults.json`.
- Shared templates/styles used by admin preview and public rendering.
- pnpm-based setup and deployment tooling.

Hosted-control-plane code is private and excluded from this repository. Do not add OAuth client secrets, Polar integration secrets, encrypted-token storage, multi-tenant provider state, or private hosted operations here.

## Canonical documentation

- `GUIDE.md`: current self-hosting commands and operations.
- `docs/CONFIGURATION.md`: implemented modes and fields.

Product launch requirements, the hosted implementation contract, and future
roadmap are private maintainer material and are not part of this repository.

Do not describe roadmap features as shipped.

## Current runtime invariants

- Resolve exact request hostname, then `_default`, then the `defaults.json` fallback.
- D1 is the authoritative configuration store; R2 is the managed blob store.
- Public requests must not depend on a hosted service, Cloudflare management API, or billing provider.
- Preview and deployed output should share normalization and renderer logic.
- The current Basic Auth admin is a trusted-author workflow. Any untrusted ingestion path must add context-aware escaping and URL/scheme validation before publication.
- Preserve responsive mobile gutters, dark/light behavior, reduced motion, keyboard focus, and accessible semantics.

## Hosted safety invariants

Any future hosted work must follow the hosted PRD:

- Cloudflare OAuth tokens are server-side and encrypted, never in browser localStorage.
- No domain or hostname is preselected.
- DNS/Custom Domain mutations use server-generated plans, confirmation, last-second state comparison, durable before-state, audit, and conditional Undo.
- Undo refuses to overwrite out-of-band drift.
- Cancellation never deletes customer resources or stops existing pages.
- KV is not required at launch; D1 is authoritative.

## Development conventions

- Use pnpm; do not introduce npm/yarn lockfiles.
- Keep changes focused and preserve unrelated worktree edits.
- Update `docs/CONFIGURATION.md` whenever a shipped field/mode changes.
- Add tests for config round-trip, preview/render parity, escaping, mobile layout, and cache isolation where applicable.
- Never commit `.dev.vars`, production IDs, backups, tokens, credentials, or hosted secrets.
