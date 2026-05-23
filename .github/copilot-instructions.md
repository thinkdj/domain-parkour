# Domain Parkour - Cloudflare Workers Domain Parking Page

## Project Overview

Ultra minimal domain parking and coming soon page built for Cloudflare Workers with multiple page modes.

- built to run on Cloudflare Workers
- uses Cloudflare D1 for per-hostname configuration (managed via the built-in admin panel at `/_admin_/`)
- supports environment variables / `.dev.vars` for local development and overrides
- four page modes: "parking" (domain for sale), "coming-soon" (launch pages), "landing" (simple info page), and "profile" (personal bio page)

