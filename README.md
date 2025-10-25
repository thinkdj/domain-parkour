# Domain Parkour

Ultra-minimal domain parking and coming soon pages for Cloudflare Workers.

**One deployment handles multiple domains.**

![Screenshot of domain parkour](assets/ss-parkour.png)

## TL;DR

**Dev:**

- `npm install` → `npm run dev` → Open `http://localhost:8787`
- Theme switcher appears top-left to preview all examples
- Edit `config.dev.local.example.json` to customize themes for local dev (or add your own)

**Prod:**

- Create KV namespace: `wrangler kv:namespace create "YOUR_NAMESPACE_NAME"`
- Update `wrangler.toml` with KV namespace ID of the created namespace
- Add domain config: `wrangler kv:key put --namespace-id=YOUR_ID "domain.com" '{"mode":"parking","title":"For Sale"}'` (or use Cloudflare Dashboard → Workers KV)
- Deploy via: `npm run deploy`
- Add domain mapping from Cloudflare Dashboard → Compute & AI → Workers & Pages → _Your Worker_ → Settings → Domains & Routes → _Add a Custom Domain_

## Features

- **Three modes**: `parking` (domain for sale), `coming-soon` (launch page), or `landing` (simple info page)
- Multi-domain support from single deployment
- Cloudflare Worker KV + env var overrides
- Countdown timer, social links, feature grid (coming-soon mode)
- Quick links and info display (landing mode)
- Responsive design with auto dark/light mode

## Quick Setup

```bash
npm install && npx wrangler login

# Create KV namespace and update wrangler.toml with the ID
wrangler kv:namespace create "domain-parkour-kv"

# Add domain config
wrangler kv:key put --namespace-id=YOUR_KV_ID "yourdomain.com" '{"mode":"parking","title":"Premium Domain For Sale","salePrice":"25,000 USD"}'

# Deploy
npm run deploy
```

## Configuration

### Parking Mode (Domain for Sale)

```bash
wrangler kv:key put --namespace-id=YOUR_KV_ID "yourdomain.com" '{
  "mode": "parking",
  "domainTitle": "yourdomain.com",
  "title": "Premium Domain For Sale",
  "description": "A memorable and brandable domain",
  "domainAgeYears": "15+",
  "domainRegistration": "Registered in 2010",
  "salePrice": "50,000 USD",
  "contactEmail": "contact@yourdomain.com",
  "accentColor": "#3b82f6",
  "footerText": "This premium domain is available for purchase",
  "socialLinks": {
    "twitter": "https://twitter.com/handle",
    "linkedin": "https://linkedin.com/in/handle",
    "github": "https://github.com/handle"
  },
  "showCredit": false
}'
```

**Parameters:**

- `mode` - "parking"
- `domainTitle` - Override domain name display (optional)
- `title` - Main headline
- `description` - Subtitle
- `domainAgeYears` - Display age (e.g., "15+", "10+") - optional
- `domainRegistration` - Registration text (e.g., "Registered in 2010") - optional
- `salePrice` - Price text
- `contactEmail` - Contact button
- `accentColor` - Brand color (hex)
- `footerText` - Footer text or disclaimer (optional)
- `socialLinks` - Object: `{"twitter": "url", "linkedin": "url", "github": "url"}` (optional)
- `showCredit` - Show "Powered by Domain Parkour" credit line (default: true, optional)

### Coming Soon Mode (Launch Page)

**Minimal:**

```bash
wrangler kv:key put --namespace-id=YOUR_KV_ID "launching.com" '{
  "mode": "coming-soon",
  "title": "Coming Soon",
  "accentColor": "#10b981"
}'
```

**Full featured:**

```bash
wrangler kv:key put --namespace-id=YOUR_KV_ID "newproject.com" '{
  "mode": "coming-soon",
  "domainTitle": "My Project",
  "title": "We'\''re building something amazing",
  "tagline": "The Future of Innovation",
  "description": "Stay tuned for updates",
  "launchDate": "2025-12-31T00:00:00",
  "accentColor": "#a855f7",
  "features": [
    {"title": "Fast", "description": "Lightning speed"},
    {"title": "Secure", "description": "Bank-level security"}
  ],
  "socialLinks": {
    "twitter": "https://twitter.com/handle",
    "github": "https://github.com/repo"
  }
}'
```

**Parameters:**

- `mode` - "coming-soon"
- `domainTitle` - Override domain name display (optional)
- `title` - Main headline
- `tagline` - Large hero text (optional)
- `description` - Subtitle
- `launchDate` - ISO 8601 date (enables countdown timer, optional)
- `accentColor` - Brand color (hex)
- `footerText` - Footer text or disclaimer (optional)
- `features` - Array: `[{"title": "...", "description": "..."}]` (optional)
- `socialLinks` - Object: `{"twitter": "url", "github": "url", ...}` (optional)

**Color suggestions:** `#3b82f6` (blue), `#a855f7` (purple), `#10b981` (green), `#ef4444` (red), `#f97316` (orange), `#ec4899` (pink)

### Landing Mode (Simple Info Page)

**Use case:** Domains used for email, APIs, or backend services that need a simple front page.

```bash
wrangler kv:key put --namespace-id=YOUR_KV_ID "api.example.com" '{
  "mode": "landing",
  "domainTitle": "api.example.com",
  "title": "API & Email Services",
  "subtitle": "This domain is used for backend services",
  "description": "For support, visit our main website",
  "accentColor": "#06b6d4",
  "footerText": "© 2025 example.com",
  "links": [
    {"title": "Main Website", "url": "https://example.com"},
    {"title": "Documentation", "url": "https://docs.example.com"},
    {"title": "Support", "url": "https://support.example.com"}
  ],
  "socialLinks": {
    "twitter": "https://twitter.com/example",
    "github": "https://github.com/example",
    "linkedin": "https://linkedin.com/company/example"
  }
}'
```

**Parameters:**

- `mode` - "landing"
- `domainTitle` - Domain or brand name
- `title` - Main headline
- `subtitle` - Secondary headline (optional)
- `description` - Additional info (optional)
- `accentColor` - Brand color (hex)
- `footerText` - Footer text (optional)
- `links` - Array: `[{"title": "...", "url": "..."}]` (optional)
- `socialLinks` - Object: `{"twitter": "url", "github": "url", "linkedin": "url"}` (optional)

### Environment Variables (Optional)

For local dev, create `.dev.vars`:

```bash
# Option 1: JSON config
127_0_0_1_CONFIG='{"mode":"coming-soon","domainTitle":"Local Dev","title":"Testing"}'

# Option 2: Individual vars
LOCALHOST_MODE="coming-soon"
LOCALHOST_DOMAIN_TITLE="My Project"
LOCALHOST_TITLE="Coming Soon"
```

**Hostname transformation:** `example.com` → `EXAMPLE_COM_`, `cdn-farm.io` → `CDN_FARM_IO_`

## Development

```bash
npm run dev  # Starts on localhost:8787
```

**Local config:** The project uses `config.dev.local.example.json` which contains multiple theme examples. When running locally, a theme switcher dropdown appears in the top-left corner allowing you to preview all available themes instantly.

**Theme Switcher Features:**

- Switch between parking, coming-soon, and landing page examples
- Multiple pre-configured examples for each mode
- Instant preview without editing config files
- Theme selection persists in localStorage

You can customize `config.dev.local.example.json` to add your own theme examples.

## Config Priority

1. **Local Dev** - `config.dev.local.example.json` (localhost only, with theme switcher)
2. **Cloudflare KV** - `DOMAIN_CONFIGS` namespace (exact hostname match)
3. **KV Default** - `_default` key
4. **Environment Variables** - Domain-specific or global
5. **Hardcoded Defaults** - Safe fallback

## Commands

```bash
# List domains
wrangler kv:key list --namespace-id=YOUR_KV_ID

# View config
wrangler kv:key get --namespace-id=YOUR_KV_ID "example.com"

# Update config
wrangler kv:key put --namespace-id=YOUR_KV_ID "example.com" '{...}'

# Delete config
wrangler kv:key delete --namespace-id=YOUR_KV_ID "example.com"

# Live logs
wrangler tail
```

## License

MIT

