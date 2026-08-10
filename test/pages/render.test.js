import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';
import {
  MODES, PAGE_BUDGET_BYTES, PAGE_BUDGET_GZIP_BYTES, renderBody, renderPage, renderThanks, resolveRedirect,
  robotsTxt, sitemapXml,
} from '../../pages/index.js';

const HOST = 'example.com';

const FIXTURES = {
  parking: {
    headline: 'Premium domain for sale',
    subhead: 'A short, memorable name.',
    price: 'USD 4,800',
    contact_email: 'owner@example.com',
    registration_date: '2015-04-02',
    socials: { github: 'https://github.com/thinkdj', email: 'hi@example.com' },
    theme: { accent: '#0f766e' },
  },
  coming_soon: {
    headline: 'Something is coming',
    subhead: 'Launching soon.',
    launch_date: '2048-01-01T00:00:00Z',
    launch_note: 'Check back then.',
    features: [{ title: 'Fast', description: 'Very' }, { title: 'Small' }],
    capture: { waitlist: true, consent: 'Email me once at launch.' },
  },
  landing: {
    headline: 'Email and API services',
    subhead: 'This domain serves infrastructure.',
    destination_url: 'https://www.example.com/',
    links_label: 'Explore',
    links: [{ title: 'Main site', url: 'https://www.example.com' }, { title: 'Docs', url: 'https://docs.example.com' }],
  },
  profile: {
    name: 'Ada Example',
    role: 'Designer & Engineer',
    bio: 'Building delightful tools.',
    links: [{ title: 'Portfolio', url: 'https://example.com' }, { title: 'Mail', url: 'hi@example.com' }],
  },
  maintenance: {
    headline: 'Back shortly',
    delivery: { maintenance: { retry_after_seconds: 600, help_url: 'https://status.example.com' } },
  },
  redirect: {
    delivery: { redirect: { target_url: 'https://product.example.net/', status_code: 301 } },
  },
};

test('every mode renders a complete document', () => {
  for (const mode of MODES) {
    const page = renderPage(mode, HOST, FIXTURES[mode]);
    assert.equal(page.mode, mode, `${mode}: mode round-trips`);
    assert.match(page.html, /^<!doctype html><html lang="en">/, `${mode}: doctype`);
    assert.match(page.html, /<\/body><\/html>$/, `${mode}: closes`);
    assert.match(page.html, /<title>[^<]+<\/title>/, `${mode}: has a title`);
    assert.ok(page.title.length > 0, `${mode}: title is not empty`);
    assert.ok(page.description.length > 0, `${mode}: description is not empty`);
  }
});

test('tags are balanced in every mode', () => {
  for (const mode of MODES) {
    const html = renderPage(mode, HOST, FIXTURES[mode]).html;
    for (const tag of ['div', 'section', 'aside', 'nav', 'main', 'form', 'label', 'header', 'footer']) {
      const open = (html.match(new RegExp(`<${tag}[\\s>]`, 'g')) || []).length;
      const close = (html.match(new RegExp(`</${tag}>`, 'g')) || []).length;
      assert.equal(open, close, `${mode}: <${tag}> opened ${open} times, closed ${close}`);
    }
  }
});

test('no mode ships executable script', () => {
  for (const mode of MODES) {
    const html = renderPage(mode, HOST, FIXTURES[mode]).html;
    const scripts = [...html.matchAll(/<script([^>]*)>/g)].map((m) => m[1]);
    for (const attrs of scripts) {
      assert.match(attrs, /type="application\/ld\+json"/, `${mode}: only JSON-LD may use a script tag`);
    }
    assert.doesNotMatch(html, /\son[a-z]+=/i, `${mode}: no inline event handlers`);
    assert.doesNotMatch(html, /javascript:/i, `${mode}: no javascript: urls`);
  }
});

test('indexing defaults are conservative', () => {
  const noindex = ['parking', 'coming_soon', 'maintenance', 'redirect'];
  for (const mode of noindex) {
    assert.equal(renderPage(mode, HOST, FIXTURES[mode]).indexable, false, `${mode} must not invite indexing`);
  }
  for (const mode of ['landing', 'profile']) {
    assert.equal(renderPage(mode, HOST, FIXTURES[mode]).indexable, true, `${mode} is a real destination`);
  }
  assert.equal(renderPage('parking', HOST, { ...FIXTURES.parking, seo: { indexing: 'index' } }).indexable, true);
  assert.equal(renderPage('landing', HOST, { ...FIXTURES.landing, seo: { indexing: 'noindex' } }).indexable, false);
});

test('an unconfigured host claims nothing about itself', () => {
  const page = renderPage('parking', 'attacker.invalid', FIXTURES.parking, { configured: false });
  assert.doesNotMatch(page.html, /rel="canonical"/);
  assert.doesNotMatch(page.html, /application\/ld\+json/);
  assert.equal(page.indexable, false);
});

test('the preview body is the same code path as the page', () => {
  const body = renderBody('parking', HOST, FIXTURES.parking);
  assert.ok(renderPage('parking', HOST, FIXTURES.parking).html.includes(body));
});

test('parking with a price is a schema.org Offer', () => {
  const html = renderPage('parking', HOST, FIXTURES.parking).html;
  assert.match(html, /"@type":"Product"/);
  assert.match(html, /"price":"USD 4,800"/);
  const withoutPrice = renderPage('parking', HOST, { ...FIXTURES.parking, price: '' }).html;
  assert.match(withoutPrice, /"@type":"WebPage"/);
});

test('a reachable owner gets a form, and their address never reaches the page', () => {
  for (const config of [
    { ...FIXTURES.parking, capture: { offer: true } },
    { ...FIXTURES.parking, capture: {} }, // contact_email alone is enough
  ]) {
    const html = renderPage('parking', HOST, config).html;
    assert.match(html, /action="\/_parkour\/lead"/);
    assert.match(html, /name="website"/, 'honeypot present');
    // contact_email is a private routing address and must never be published.
    // socials.email is different: the owner chose to put that one on the page.
    assert.doesNotMatch(html, /owner@example\.com/, 'the routing address stays off the page');
    assert.doesNotMatch(html, /mailto:owner@/, 'no mailto fallback for a harvester to scrape');
    assert.match(html, /mailto:hi@example\.com/, 'a social email the owner published still renders');
  }
});

test('an unreachable parking page offers no form at all', () => {
  const html = renderPage('parking', HOST, { price: 'USD 100' }).html;
  assert.doesNotMatch(html, /<form/);
  assert.match(html, /This domain is available for purchase\./);
});

test('consent is required when the owner asked for it', () => {
  const html = renderPage('coming_soon', HOST, FIXTURES.coming_soon).html;
  assert.match(html, /name="consent"[^>]*required/);
});

test('the launch date renders formatted and static', () => {
  const html = renderPage('coming_soon', HOST, FIXTURES.coming_soon).html;
  assert.match(html, /January 1, 2048/);
  assert.doesNotMatch(html, /setInterval/);
});

test('profile falls back to initials without an avatar', () => {
  const html = renderPage('profile', HOST, FIXTURES.profile).html;
  assert.match(html, /class="dp-avatar" aria-label="Ada Example">AE</);
  const withAvatar = renderPage('profile', HOST, { ...FIXTURES.profile, avatar_url: '/_assets/profiles/a.png' }).html;
  assert.match(withAvatar, /<img src="\/_assets\/profiles\/a\.png"/);
});

test('redirect resolution preserves path and query only when asked', () => {
  const base = { delivery: { redirect: { target_url: 'https://dest.example/app', status_code: 308 } } };
  assert.deepEqual(
    resolveRedirect('https://example.com/a/b?x=1', base),
    { location: 'https://dest.example/app', status: 308 },
  );
  const preserving = {
    delivery: { redirect: { ...base.delivery.redirect, preserve_path: true, preserve_query: true } },
  };
  assert.equal(
    resolveRedirect('https://example.com/a/b?x=1', preserving).location,
    'https://dest.example/app/a/b?x=1',
  );
});

test('redirect UI shows a declarative countdown and refresh target', () => {
  const page = renderPage('redirect', HOST, {
    delivery: {
      redirect: {
        target_url: 'https://dest.example/app', show_ui: true, countdown_seconds: 12,
      },
    },
  });
  assert.match(page.html, /http-equiv="refresh" content="12;url=https:\/\/dest\.example\/app"/);
  assert.match(page.html, /You will be redirected to/);
  assert.match(page.html, />12 seconds<\/strong>/);
  assert.doesNotMatch(renderPage('redirect', HOST, {
    delivery: { redirect: { target_url: 'https://dest.example/app' } },
  }).html, /http-equiv="refresh"/);
});

test('a redirect to its own host is refused', () => {
  const loop = { delivery: { redirect: { target_url: 'https://example.com/elsewhere' } } };
  assert.equal(resolveRedirect('https://example.com/', loop).location, '');
  assert.equal(resolveRedirect('https://example.com/', { delivery: { redirect: {} } }).location, '');
});

test('robots and sitemap agree with the page', () => {
  assert.match(robotsTxt(HOST, 'landing', FIXTURES.landing), /Allow: \/\nSitemap: https:\/\/example\.com\/sitemap\.xml/);
  assert.match(robotsTxt(HOST, 'parking', FIXTURES.parking), /Disallow: \//);
  assert.equal(sitemapXml(HOST, 'parking', FIXTURES.parking), '');
  assert.match(sitemapXml(HOST, 'landing', FIXTURES.landing), /<loc>https:\/\/example\.com\/<\/loc>/);
  assert.equal(sitemapXml('attacker.invalid', 'landing', FIXTURES.landing, { configured: false }), '');
});

test('the thank-you page is noindex and creditless', () => {
  const page = renderThanks('offer', HOST);
  assert.equal(page.indexable, false);
  assert.match(page.html, /Your offer is with the owner\./);
  assert.doesNotMatch(page.html, /Built with/);
});

test('every mode stays inside the page budget', () => {
  for (const mode of MODES) {
    const html = renderPage(mode, HOST, FIXTURES[mode]).html;
    const raw = Buffer.byteLength(html, 'utf8');
    const gzip = gzipSync(html).byteLength;
    assert.ok(raw <= PAGE_BUDGET_BYTES, `${mode}: ${raw} raw bytes exceeds ${PAGE_BUDGET_BYTES}`);
    assert.ok(gzip <= PAGE_BUDGET_GZIP_BYTES, `${mode}: ${gzip} gzipped bytes exceeds ${PAGE_BUDGET_GZIP_BYTES}`);
  }
});
