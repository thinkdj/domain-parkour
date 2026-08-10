import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigError, MODES, normalize, normalizeMode, renderPage, validate } from '../../pages/index.js';
import { derive } from '../../pages/schema.js';

test('both dialects land in the same shape', () => {
  const oss = normalize({
    domainTitle: 'cdn.farm',
    title: 'Premium domain',
    description: 'A memorable name.',
    salePrice: '30,000 USD',
    contactEmail: 'Shout@Think.DJ',
    accentColor: '#0F766E',
    socialLinks: { github: 'https://github.com/thinkdj' },
    showCredit: false,
  }, { mode: 'parking' });

  const cloud = normalize({
    domain_title: 'cdn.farm',
    headline: 'Premium domain',
    body: 'A memorable name.',
    price: '30,000 USD',
    contact_email: 'shout@think.dj',
    theme: { accent: '#0f766e' },
    socials: { github: 'https://github.com/thinkdj' },
    footer_credit: false,
  }, { mode: 'parking' });

  assert.deepEqual(oss.config, cloud.config);
});

test('a canonical key beats its legacy alias', () => {
  const { config } = normalize({ headline: 'canonical', title: 'legacy' }, { mode: 'landing' });
  assert.equal(config.headline, 'canonical');
});

test('hyphenated and underscored mode names are the same mode', () => {
  assert.equal(normalizeMode('coming-soon'), 'coming_soon');
  assert.equal(normalizeMode('COMING_SOON'), 'coming_soon');
  assert.equal(normalizeMode('nonsense'), '');
  for (const mode of MODES) assert.equal(normalizeMode(mode), mode);
});

test('legacy noindex and notify booleans still work', () => {
  assert.equal(normalize({ noindex: true }, { mode: 'landing' }).config.seo.indexing, 'noindex');
  assert.equal(normalize({ notify: true }, { mode: 'coming_soon' }).config.capture.waitlist, true);
});

test('unknown fields never reach a renderer', () => {
  const { config } = normalize({ headline: 'ok', evil: '<script>', __proto__: { polluted: true } }, { mode: 'landing' });
  assert.equal(config.evil, undefined);
  assert.equal(config.polluted, undefined);
  assert.equal(({}).polluted, undefined, 'the prototype is intact');
});

test('text is capped rather than trusted', () => {
  const { config } = normalize({ headline: 'x'.repeat(500) }, { mode: 'landing' });
  assert.equal(config.headline.length, 180);
  assert.throws(() => validate({ headline: 'x'.repeat(500) }, 'landing'), ConfigError);
});

test('unsafe values are dropped when repairing and rejected when strict', () => {
  const hostile = {
    checkout_url: 'javascript:alert(1)',
    contact_email: 'not-an-email',
    theme: { accent: 'red; background:url(x)' },
    socials: { myspace: 'https://example.com' },
  };
  const { config } = normalize(hostile, { mode: 'parking' });
  assert.equal(config.checkout_url, undefined);
  assert.equal(config.contact_email, undefined);
  assert.equal(config.theme, undefined);
  assert.deepEqual(config.socials, undefined);

  for (const [key, value] of Object.entries(hostile)) {
    assert.throws(() => validate({ [key]: value }, 'parking'), ConfigError, `${key} must be rejected`);
  }
});

test('lists are bounded', () => {
  const many = Array.from({ length: 40 }, (_, i) => ({ title: `t${i}`, url: 'https://example.com' }));
  assert.equal(normalize({ links: many }, { mode: 'landing' }).config.links.length, 24);
  assert.throws(() => validate({ links: many }, 'landing'), ConfigError);
  const features = Array.from({ length: 20 }, (_, i) => `feature ${i}`);
  assert.equal(normalize({ features }, { mode: 'coming_soon' }).config.features.length, 12);
});

test('a redirect without a destination is refused on input', () => {
  assert.throws(() => validate({}, 'redirect'), ConfigError);
  assert.doesNotThrow(() => validate({ delivery: { redirect: { target_url: 'https://a.example' } } }, 'redirect'));
  // A stored row that lost its target still renders rather than throwing at a visitor.
  assert.doesNotThrow(() => renderPage('redirect', 'example.com', {}));
});

test('retry-after is clamped to a range a client will honour', () => {
  const at = (seconds) => normalize(
    { delivery: { maintenance: { retry_after_seconds: seconds } } },
    { mode: 'maintenance' },
  ).config.delivery.maintenance.retry_after_seconds;
  assert.equal(at(600), 600);
  assert.equal(at(5), 0, 'under a minute is noise');
  assert.equal(at(999999), 0, 'over a week is ignored anyway');
});

test('redirect UI defaults safely and validates its countdown', () => {
  const hidden = normalize({ delivery: { redirect: { target_url: 'https://dest.example' } } }, { mode: 'redirect' });
  assert.equal(hidden.config.delivery.redirect.show_ui, false);
  assert.equal(hidden.config.delivery.redirect.countdown_seconds, 5);

  const shown = normalize({
    delivery: { redirect: { target_url: 'https://dest.example', show_ui: true, countdown_seconds: 12 } },
  }, { mode: 'redirect' });
  assert.equal(shown.config.delivery.redirect.show_ui, true);
  assert.equal(shown.config.delivery.redirect.countdown_seconds, 12);
  assert.throws(
    () => validate({ delivery: { redirect: { target_url: 'https://dest.example', show_ui: true, countdown_seconds: 61 } } }, 'redirect'),
    ConfigError,
  );
});

test('stats are derived without being stored', () => {
  // Relative to now, so the expectation does not rot with the calendar.
  const tenAndAHalfYearsAgo = new Date(Date.now() - 10.5 * 31557600000).toISOString();
  const { stats } = derive('cdn.farm', 'parking', { registration_date: tenAndAHalfYearsAgo });
  assert.deepEqual(stats, [{ value: '.farm', label: 'Extension' }, { value: '10+', label: 'Domain age' }]);
  assert.deepEqual(derive('1.2.3.4', 'parking', {}).stats, [], 'an IP has no extension');
  const brandNew = derive('cdn.farm', 'parking', { registration_date: new Date().toISOString() });
  assert.deepEqual(brandNew.stats, [{ value: '.farm', label: 'Extension' }], 'under a year is not a selling point');
});

test('normalize never throws on hostile input', () => {
  for (const input of [null, undefined, 42, 'string', [], { config: null }, { links: 'nope' }, { socials: 7 }]) {
    assert.doesNotThrow(() => normalize(input, { mode: 'parking' }), `input ${JSON.stringify(input)}`);
  }
});
