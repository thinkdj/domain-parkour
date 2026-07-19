# Domain Parkour Documentation

This directory documents the shipped behavior of the public OSS runtime.

## Start here

| Document | Status | Purpose |
| --- | --- | --- |
| [`../README.md`](../README.md) | Current | Project overview and local quick start |
| [`../GUIDE.md`](../GUIDE.md) | Current | Canonical OSS self-hosting and operations guide |
| [`CONFIGURATION.md`](CONFIGURATION.md) | Current | Implemented page modes and fields |

Repository policy documents:

- [`../LICENSE`](../LICENSE)
- [`../SECURITY.md`](../SECURITY.md)
- [`../CONTRIBUTING.md`](../CONTRIBUTING.md)

## Product and hosted planning docs

Product requirements, hosted-platform architecture, launch planning, the OSS/hosted
boundary, decision log, and post-launch roadmap live in the private
`domain-parkour-cloud` repository (`domain-parkour-cloud/docs/`), not in this public
repository:

- `PRD.md` — authoritative OSS + hosted product requirements
- `HOSTED_PLATFORM_PRD.md` — OAuth, tenancy, provisioning, DNS safety, Undo, Polar
- `LAUNCH_PLAN.md` — phases, workstreams, release gates, launch checklists
- `OSS_VS_HOSTED.md` — public/private code, ownership, costs, eject boundary
- `DECISIONS.md` — locked product and architecture choices
- `PRD_FEATURES_EXTENDED.md` — non-committed post-launch roadmap

## Status vocabulary

- **Current / shipped:** implemented in this public repository now.
- **Approved launch direction:** agreed requirement for work that may not be implemented yet.
- **Ready for implementation:** sequenced plan with exit criteria.
- **Exploratory:** an idea with no delivery or pricing commitment.

Do not describe a roadmap feature as available unless its code, migration, documentation, and acceptance tests are present.

## Source-of-truth rules

- Installation commands live in `GUIDE.md`.
- Implemented modes and fields live in `CONFIGURATION.md`.
- Product launch behavior, hosted implementation, execution status, and OSS/hosted
  ownership boundaries live in the private `domain-parkour-cloud` docs.

## Documentation maintenance

When changing a shipped page field:

1. Update schema/defaults and renderer.
2. Update admin and preview.
3. Add or update automated round-trip/rendering tests.
4. Update `CONFIGURATION.md`.

When changing self-hosted setup:

1. Verify from a clean environment.
2. Update `GUIDE.md`.
3. Keep README OSS-focused, accurate, and runnable from a clean checkout.
