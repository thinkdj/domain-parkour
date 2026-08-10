# Domain Parkour Configuration Reference

| Field | Value |
| --- | --- |
| Status | Current OSS implementation |
| Last updated | 2026-08-10 |
| Storage | D1 config JSON plus R2 image objects |

This document describes fields implemented by the current runtime and admin. Private planning material may describe future work; it must not be treated as available here.

## 1. Resolution

For a public request, Domain Parkour resolves configuration in this order:

1. Local preset selected by `themeIndex` on localhost/`workers.dev` development requests.
2. Exact hostname row from D1.
3. D1 row named `_default`.
4. Bundled fallback from `defaults.json`.

Hostnames are exact. `example.com` and `www.example.com` are separate.

## 2. Stored record

```sql
hostname TEXT PRIMARY KEY
mode     TEXT NOT NULL
config   TEXT NOT NULL -- JSON object
```

The admin API stores `mode` as a column and the remaining fields in `config`.

Example:

```json
{
  "hostname": "example.com",
  "mode": "landing",
  "config": {
    "domainTitle": "example.com",
    "title": "A small useful page",
    "subtitle": "More is coming soon",
    "description": "Follow the links below.",
    "accentColor": "#2c4fe0",
    "links": [
      { "title": "Main site", "url": "https://www.example.com" }
    ],
    "showCredit": true
  }
}
```

## 3. Implemented modes

| Mode | Implemented | Admin fields | Runtime renderer |
| --- | --- | --- | --- |
| `parking` | Yes | Yes | Yes |
| `coming-soon` | Yes | Yes | Yes |
| `landing` | Yes | Yes | Yes |
| `profile` | Yes | Yes | Yes |
| `redirect` | No | No | No |
| `maintenance` | No | No | No |
| `waitlist` | No | No | No |

An unknown mode currently falls through to the landing renderer at the entrypoint. Do not rely on that as a compatibility feature; use one of the four supported values.

## 4. Common fields

| Field | Type | Default/behavior | Notes |
| --- | --- | --- | --- |
| `domainTitle` | string | Request hostname | Main display identity |
| `title` | string | Empty | Headline/supporting title, depending on mode |
| `description` | string | Empty | Supporting copy |
| `accentColor` | CSS hex color | `#e8590c` | Admin uses a color input |
| `footerText` | string | Mode-specific | Optional custom text beside the shared credit |
| `showCredit` | boolean | `true` | `false` hides “Built with Domain Parkour · powered by Cloudflare” |
| `socialLinks` | object | `{}` | Supported keys below |
| `statusLabel` | string | Mode-specific | Masthead status text |

Treat text fields as plain text. Do not enter HTML or scripts. The self-hosted admin is a trusted-author workflow; validation and output hardening requirements are tracked in this document.

### Social links

The admin exposes:

- `twitter`
- `linkedin`
- `github`
- `instagram`
- `facebook`
- `email`

Web links should use `https://`. Email should use a `mailto:` URL. Empty values are omitted.

## 5. Parking

Use for an available/for-sale domain.

| Field | Type | Behavior |
| --- | --- | --- |
| `domainTitle` | string | Domain displayed as the primary title |
| `title` | string | Optional sale headline |
| `description` | string | Sale/domain description |
| `salePrice` | string | Asking price label; not parsed as money |
| `contactEmail` | email string | Creates a mail inquiry link |
| `domainAgeYears` | string | Domain age label, such as `9+` |
| `domainExtension` | string | Extension value; inferred when omitted |
| `domainRegistration` | string | Registration note |
| `registrationDate` | date string | Runtime-only convenience; derives age/registration labels when explicit labels are absent |

Example:

```json
{
  "mode": "parking",
  "domainTitle": "example.com",
  "title": "Premium domain for sale",
  "description": "A short, memorable name for the right project.",
  "salePrice": "25,000 USD",
  "contactEmail": "owner@example.net",
  "domainAgeYears": "12+",
  "domainRegistration": "Registered in 2014",
  "accentColor": "#0f766e"
}
```

`salePrice` is display text only. Domain Parkour does not process a domain sale.

## 6. Coming soon

Use for a pre-launch announcement, optionally with a countdown and feature cards.

| Field | Type | Behavior |
| --- | --- | --- |
| `domainTitle` | string | Project/domain identity |
| `tagline` | string | Heading above supporting copy |
| `title` | string | Main supporting line |
| `description` | string | Additional copy |
| `launchDate` | ISO-compatible date/time string | Adds formatted date and live countdown |
| `features` | array | Optional cards with title/description |

Feature shape:

```json
{
  "title": "Fast by default",
  "description": "A short explanation."
}
```

Example:

```json
{
  "mode": "coming-soon",
  "domainTitle": "Project Atlas",
  "tagline": "Launching soon",
  "title": "A calmer way to organize field work.",
  "description": "The first release is taking shape.",
  "launchDate": "2027-01-15T09:00:00Z",
  "features": [
    { "title": "Offline first", "description": "Keep working without a signal." }
  ],
  "accentColor": "#0f7b5f"
}
```

The countdown reaching zero changes its display to “We are live.” It does not change mode, DNS, or launch another application.

## 7. Landing

Use for a concise information page with destination links.

| Field | Type | Behavior |
| --- | --- | --- |
| `domainTitle` | string | Primary site identity |
| `title` | string | Main headline |
| `subtitle` | string | Prominent supporting line |
| `description` | string | Body copy |
| `links` | array | External link list |

Link shape:

```json
{
  "title": "Documentation",
  "url": "https://docs.example.com"
}
```

Links open in a new tab with `noopener noreferrer`.

## 8. Profile

Use for a personal profile or link page.

| Field | Type | Behavior |
| --- | --- | --- |
| `domainTitle` | string | Site/domain identity and fallback name |
| `name` | string | Person/display name; falls back to `domainTitle` |
| `role` | string | Role or short tagline; falls back to `Independent` |
| `bio` | string | Profile copy |
| `avatarUrl` | URL or `/_assets/` path | Uploaded R2 image or external image; empty uses initials |
| `avatarObjectKey` | string | Managed R2 key written by the admin uploader |
| `links` | array | Featured links using the standard link shape |

If `avatarUrl` is empty, initials are derived from `name` or `domainTitle`.

Admin uploads accept PNG, JPEG, WebP, and GIF files up to 5 MB. The Worker validates the file signature, stores the object under `profiles/<hostname>/` in the `ASSETS` R2 binding, and writes the returned path and object key into the profile config. Replacing or deleting a saved profile cleans up its prior managed avatar. R2 objects are private; visitor access goes through the Worker.

## 9. Template wording

Visitor-facing template labels are configurable in the admin under **Finishing touches → Template wording**. Empty values intentionally hide optional wording.

| Mode | Configurable wording fields |
| --- | --- |
| Parking | `statusLabel`, `eyebrowText`, `priceLabel`, `inquiryLabel`, `noPriceTitle`, `contactCopy`, `availabilityCopy`, `contactButtonText`, `domainAgeLabel`, `extensionLabel`, `trustValue`, `trustLabel`, `pageTitleSuffix` |
| Coming soon | `statusLabel`, `eyebrowText`, `launchLabel`, `daysLabel`, `hoursLabel`, `minutesLabel`, `secondsLabel`, `countdownNote`, `launchedText`, `statusPanelLabel`, `statusPanelTitle`, `statusPanelText`, `pageTitleSuffix` |
| Landing | `statusLabel`, `eyebrowText`, `linksLabel` |
| Profile | `statusLabel`; `role` controls the profile eyebrow |

## 10. Derived values

At render time:

- `domain` is set from the request hostname.
- `domainTitle` falls back to `domain`.
- `domainExtension` is inferred from the final dot-separated label when possible.
- `domainAgeYears` and `domainRegistration` can be derived from `registrationDate`.
- `features`, `links`, and `socialLinks` default to empty collections.
- `showCredit` is true unless explicitly false.

Derived values are not necessarily written back to D1.

## 11. Presets

`defaults.json` contains the fallback configuration, per-mode wording defaults, and a `presets` array. A preset's `name` labels it in the gallery; it is not a universal runtime content field.

The intentionally blank Defaults preset is useful for testing normalization. Presets can include the same fields documented above.

## 12. Local gallery

On localhost/`workers.dev` development requests:

```text
/?themeIndex=0
/?themeIndex=1
```

selects a preset by zero-based index when the index exists. This development behavior takes precedence over D1 on those hosts.

Do not use the `workers.dev` gallery URL as a production customer domain.

## 13. Appearance

- Templates declare both light and dark color schemes. Dark swaps the eight neutral tokens under a `.theme-dark` class on the document element; brand and semantic colors are unchanged.
- The page offers an appearance control where implemented by the shared base template, and remembers the choice.
- `accentColor` sets `--color-primary` and nothing else. Hover, active, soft-background, and focus-ring values derive from it with `color-mix()`, so one value rethemes the page across both appearances.
- Tokens live in `src/styles/tokens.js` and are shared by the visitor templates and the admin.
- Pages request nothing from a third party. Font stacks name Space Grotesk, Inter, and JetBrains Mono and fall back to system faces, so no webfont is downloaded and no visitor is reported to a font CDN. Icons are inlined from `src/icons.js`.
- Mobile layouts preserve a readable content gutter.
- Transitions use three durations (120ms, 160ms, 220ms) and one easing curve, and `prefers-reduced-motion` disables all of them.

## 14. Validation expectations

Configuration is normalized at one boundary before it is saved and again before any stored record is rendered. This applies to current admin payloads, hand-written D1 rows, and records created by older Workers.

New admin payloads are rejected unless they satisfy all of the following:

- `mode` is one of parking, coming-soon, landing, or profile; the hostname is a normalized exact hostname or `_default`.
- Configuration is a plain object with only allowlisted fields, supported social platforms, expected item object shapes, and bounded strings/arrays.
- Accent colors are three- or six-digit hex values.
- Dates are valid date/time values and emails are normalized.
- External links and avatar URLs use HTTPS without embedded credentials. General links may also be a normalized `mailto:` address; non-email social links remain HTTPS-only.

Saved configuration is treated as untrusted even if it predates this validation. Legacy records are sanitized rather than trusted: unsupported or unsafe values do not reach a renderer, and recoverable legacy values are normalized within the same bounds.

Every renderer also escapes text and quoted attributes contextually, validates URL use at the output boundary, and serializes inline script data so it cannot terminate a script element. This is defense in depth, not permission to store HTML or scripts in configuration.

## 15. Compatibility

Future schema versions may add explicit `schemaVersion` and content revisions. Older runtimes should ignore unknown safe fields, and import/publish tooling must reject configuration newer than the running Worker supports.
