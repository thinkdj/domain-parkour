# Security Policy

## Reporting a vulnerability

Please do not open a public issue for a suspected security vulnerability.

The final private reporting address is an outstanding launch decision. The recommended address is `security@32mb.dev`. Until that address is published and monitored, contact the repository owner privately through the account that publishes this repository.

Include:

- A concise description and impact.
- Affected version/commit and edition (OSS or hosted plan).
- Reproduction steps or proof of concept.
- Whether credentials, DNS, cross-tenant access, or customer data may be exposed.
- Any safe mitigation you already identified.

Do not include real OAuth tokens, Cloudflare API tokens, admin passwords, Polar secrets, DNS recovery exports, or unrelated customer data.

## Response targets

As a solo-maintained project, response times are best-effort. The intended targets are:

- Acknowledge a complete private report within 72 hours.
- Triage critical account, credential, DNS, or cross-tenant issues as soon as practical.
- Publish a fix/advisory after coordinated validation.

These targets are not an uptime or support SLA.

## Supported versions

Before the first tagged stable release, security fixes target the current main development line. After stable release, this section will list supported release branches explicitly.

## OSS threat model

The current public Worker has three request surfaces:

- Public page rendering for attached hostnames.
- Public reads of managed R2 images under `/_assets/`.
- A privileged admin under `/_admin_/` protected by HTTP Basic Auth and Worker secrets.

Important assumptions:

- Only trusted administrators can edit configuration.
- `ADMIN_USER` and `ADMIN_PASSWORD` are strong production secrets.
- Local `admin/admin` credentials are never used in production.
- `.dev.vars`, D1 backups, R2 backups, and account-specific configuration remain private.
- Cloudflare account access is managed through Wrangler/dashboard, not pasted into the Domain Parkour browser UI.

Recommended hardening:

- Put Cloudflare Access in front of the admin path where practical.
- Protect the admin path on every hostname attached to the Worker.
- Restrict third-party scripts and use a strict Content Security Policy.
- Back up before migrations and DNS changes.
- Keep Node, pnpm, Wrangler, and dependencies current after review.
- Review logs/exports before sharing them publicly.

## Hosted security invariants

Hosted control-plane code is not shipped in this repository. Its mandatory security requirements are private maintainer material, including:

- Cloudflare Authorization Code + PKCE.
- Encrypted server-side access/refresh tokens.
- Tenant isolation in API and job layers.
- No raw Cloudflare API proxy in the browser.
- Immutable mutation plans and last-second drift checks.
- Encrypted DNS recovery snapshots before every accepted mutation.
- Conditional Undo that refuses to overwrite out-of-band changes.
- Signed/idempotent Polar webhooks.
- No hosted or billing dependency on the visitor request path.

Any violation involving token disclosure, cross-tenant access, cross-host cache leakage, or execution differing from a confirmed DNS plan is a stop-launch/disable-mutations event.

## Secrets that must never be committed

- `.dev.vars` and `.env*` with live values.
- Cloudflare OAuth client secrets.
- Cloudflare API/OAuth access or refresh tokens.
- `ADMIN_PASSWORD` production values.
- Polar Organization Access Tokens and webhook secrets.
- Encryption root keys.
- Private DNS recovery exports.
- Production customer or billing data.

If a secret is committed, remove it from current files, revoke/rotate it immediately, and assess repository history. Deleting a line in a later commit does not make the exposed value safe.

## Scope of public discussions

Public issues are appropriate for non-sensitive bugs, hardening suggestions, and documentation corrections. Redact account IDs, database UUIDs, hostnames you consider private, request headers, cookies, and personal data.
