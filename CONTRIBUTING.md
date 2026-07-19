# Contributing to Domain Parkour

Thanks for helping improve Domain Parkour.

## Project direction

Domain Parkour values:

- Customer-owned infrastructure and portable configuration.
- Small, fast, accessible pages.
- Safe, explicit infrastructure changes.
- A useful MIT-licensed runtime independent of the hosted service.
- Clear distinction between shipped features and roadmap ideas.

The product requirements and OSS/hosted boundary (`PRD.md`, `OSS_VS_HOSTED.md`) live in the private `domain-parkour-cloud` repository. If you are a maintainer, review them before proposing a large feature.

## Development setup

Requirements:

- Node.js 20 or newer.
- pnpm matching the `packageManager` field in `package.json`.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev:local
```

Open the public gallery and admin URLs printed by Wrangler. Local admin credentials are `admin/admin` only in development.

The complete setup guide is [`GUIDE.md`](GUIDE.md).

## Before changing code

- Search existing issues and pull requests.
- Keep unrelated user/worktree changes intact.
- For a large feature, open an issue describing user problem, scope, ownership, security implications, and tests.
- Do not implement hosted-control-plane secrets or private service code in the public repository.

## Change guidelines

### Templates and configuration

When adding or changing a field:

1. Update normalization/defaults.
2. Update the appropriate renderer.
3. Update admin load/save and mode visibility.
4. Ensure preview and deployed render use the same path.
5. Add/adjust round-trip and rendering tests.
6. Update [`docs/CONFIGURATION.md`](docs/CONFIGURATION.md).

Never interpolate untrusted content without context-appropriate escaping. Validate URLs and reject unsafe schemes.

### UI and accessibility

- Preserve keyboard operation and visible focus.
- Use semantic controls and labels.
- Meet WCAG 2.2 AA contrast expectations.
- Test reduced motion.
- Test light and dark appearances.
- Test narrow mobile widths with comfortable side gutters and no horizontal overflow.
- Keep empty, loading, dirty, success, and error states understandable without color alone.

### Cloudflare or DNS behavior

Public OSS setup may document manual Cloudflare operations. Hosted automation belongs to the private control plane and must follow the server-generated plan/confirm/snapshot/Undo contract.

Do not add:

- Browser `localStorage` Cloudflare tokens.
- Open Cloudflare API proxies.
- Preselected or automatic domain mutations.
- Deletion of resources based on name alone.
- Visitor-path calls to a hosted service or billing provider.

### Dependencies

- Prefer platform APIs and small reviewed dependencies.
- Use pnpm and commit `pnpm-lock.yaml` changes.
- Explain why a runtime dependency is necessary.
- Do not introduce external fonts/scripts into public pages without a privacy, CSP, reliability, and performance review.

## Testing

Run the automated suite for every change:

```bash
pnpm test
```

For changes that affect the editor, rendering, or Cloudflare bindings, also:

- Start `pnpm dev:local` successfully.
- Load each implemented page mode.
- Exercise admin load, live preview, save, reload, and delete using local D1.
- Check mobile and desktop preview.
- Check light and dark appearance.
- Run `pnpm exec wrangler deploy --dry-run`.

## Pull requests

Keep pull requests focused. Include:

- What changed and why.
- Screenshots for visible UI changes at desktop and mobile widths.
- Test steps and results.
- Schema/migration and rollback notes.
- Security, privacy, caching, or Cloudflare implications.
- Documentation changes.

Do not include generated local state, `.dev.vars`, backups, live Cloudflare IDs, tokens, or credentials.

## Documentation conventions

Use the status labels defined in [`docs/README.md`](docs/README.md). Do not advertise a planned feature as shipped.

- Commands belong in `GUIDE.md`.
- Current config belongs in `docs/CONFIGURATION.md`.
- Product requirements and future ideas belong in the private `domain-parkour-cloud` planning docs (`PRD.md`, `PRD_FEATURES_EXTENDED.md`).

## Security reports

Follow [`SECURITY.md`](SECURITY.md). Do not disclose a vulnerability in a public issue before a fix is available.

## License

By contributing, you agree that your contribution is licensed under the repository's MIT License.
