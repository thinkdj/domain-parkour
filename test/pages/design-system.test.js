/**
 * The design system's rules, checked against rendered pages.
 *
 * Relocated from the OSS repo's `design-system.test.mjs` when the renderer moved
 * into this package. The half of that file that checks the admin UI stayed with
 * the admin; these are the page-level rules, and they now cover both apps at
 * once because both serve this renderer.
 *
 * Section references are to design-system/parkour_design_system.html.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MODES, renderPage } from '../../pages/index.js';
import { pageTokens } from '../../pages/tokens.generated.js';

const CONFIG = {
  domain_title: 'cdn.farm',
  headline: 'A memorable name',
  price: '30,000 USD',
  contact_email: 'hello@example.com',
  launch_date: '2048-01-01T00:00',
  links: [{ title: 'Portfolio', url: 'https://example.com' }],
  socials: { github: 'https://github.com/thinkdj' },
  features: [{ title: 'One', description: 'Two' }],
  delivery: { redirect: { target_url: 'https://dest.example' } },
};

const documents = () => MODES.map((mode) => [mode, renderPage(mode, 'cdn.farm', CONFIG).html]);
const styleOf = (html) => (html.match(/<style>([\s\S]*?)<\/style>/g) || []).join('\n');

test('pages ship self-contained: no third-party request of any kind (principle 5)', () => {
  for (const [mode, html] of documents()) {
    assert.doesNotMatch(html, /@import/i, mode);
    assert.doesNotMatch(html, /<link[^>]+rel="stylesheet"/i, mode);
    assert.doesNotMatch(html, /<script[^>]+src=/i, mode);
    assert.doesNotMatch(html, /fonts\.(googleapis|gstatic)\.com/i, mode);
    assert.doesNotMatch(html, /cdn\.jsdelivr\.net|unpkg\.com/i, mode);
    assert.doesNotMatch(styleOf(html), /url\(\s*["']?https?:/i, mode);
  }
});

test('restraint over garnish: no gradients, glass, or filter tricks (principle 5)', () => {
  for (const [mode, html] of documents()) {
    const css = styleOf(html);
    assert.doesNotMatch(css, /linear-gradient|radial-gradient/i, mode);
    assert.doesNotMatch(css, /backdrop-filter/i, mode);
    assert.doesNotMatch(css, /filter:\s*blur/i, mode);
  }
});

test('one variable rethemes a page: the accent arrives only as --color-primary (§02)', () => {
  const html = renderPage('landing', 'cdn.farm', { ...CONFIG, theme: { accent: '#0f766e' } }).html;
  const css = styleOf(html);
  assert.doesNotMatch(css, /--color-primary-hover:\s*#/i, 'hovers must derive, not be authored');
  assert.match(css, /--color-primary-hover:color-mix/i);
  assert.doesNotMatch(css, /--accent-color|--text-dim|--surface-raised/i, 'pre-token names are gone');

  // Presence proves nothing — the token block declares its own --color-primary,
  // so an accent emitted above it loses the cascade and the page silently
  // renders brand orange while this file looks green.
  const accentAt = css.lastIndexOf('--color-primary:#0f766e');
  const brandAt = css.lastIndexOf('--color-primary:#E8590C');
  assert.ok(accentAt > -1, 'accent not emitted');
  assert.ok(accentAt > brandAt, 'the configured accent is overridden by the base token that follows it');
});

test('mono for machine truth: the hostname headline is monospace (principle 3)', () => {
  for (const mode of ['parking', 'coming_soon', 'landing']) {
    const html = renderPage(mode, 'cdn.farm', CONFIG).html;
    assert.match(html, /class="dp-title[^"]*"[^>]*>cdn\.farm</, mode);
  }
  assert.match(styleOf(renderPage('landing', 'cdn.farm', CONFIG).html),
    /\.dp-title\{[^}]*font-family:var\(--font-mono\)/);
});

test('motion uses the sanctioned durations only (§08)', () => {
  for (const [mode, html] of documents()) {
    for (const [, duration] of styleOf(html).matchAll(/transition:[^;}]*?(\d+m?s)/g)) {
      assert.fail(`${mode}: literal duration ${duration} — use var(--t-fast) or var(--t-base)`);
    }
  }
});

test('radius and colour come from the scale, never a loose value (§04)', () => {
  for (const [mode, html] of documents()) {
    const css = styleOf(html).replace(pageTokens, '');
    for (const [rule] of css.matchAll(/border-radius:\s*(?!var\(|50%|999px)[^;}]+/g)) {
      assert.fail(`${mode}: ${rule} — use var(--radius-*)`);
    }
  }
});

test('appearance is one declaration per token, not a second palette (§07)', () => {
  for (const [mode, html] of documents()) {
    assert.doesNotMatch(styleOf(html), /prefers-color-scheme/i,
      `${mode}: light-dark() covers both schemes, so no media query is needed`);
    assert.match(styleOf(html), /color-scheme:light dark/, mode);
  }
});
