/**
 * Adversarial rendering. Every payload goes through every mode in every field
 * that reaches HTML, and nothing may come out as markup, an attribute break, or
 * a script.
 *
 * The renderer is the last line: config can arrive from a hand-edited D1 row or a
 * restored old revision, neither of which passed the editor's strict validation.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MODES, renderPage } from '../../pages/index.js';

const PAYLOADS = [
  '<script>alert(1)</script>',
  '"><script>alert(1)</script>',
  "'><img src=x onerror=alert(1)>",
  '</title><script>alert(1)</script>',
  '</style><script>alert(1)</script>',
  '</textarea><script>alert(1)</script>',
  'javascript:alert(1)',
  'JaVaScRiPt:alert(1)',
  ' onmouseover=alert(1) ',
  '</script><script>alert(1)</script>',
  '{{7*7}}',
  '${alert(1)}',
];

/** Every field that ends up in text, an attribute, a URL, or JSON-LD. */
function hostileConfig(payload) {
  return {
    domain_title: payload,
    eyebrow: payload,
    status_label: payload,
    headline: payload,
    subhead: payload,
    body: payload,
    note: payload,
    price: payload,
    name: payload,
    role: payload,
    bio: payload,
    footer_text: payload,
    links_label: payload,
    launch_date: payload,
    launch_note: payload,
    contact_email: payload,
    checkout_url: payload,
    destination_url: payload,
    avatar_url: payload,
    theme: { accent: payload },
    brand: { favicon_url: payload },
    seo: { title: payload, description: payload, og_image_url: payload, og_image_alt: payload, indexing: payload },
    status_panel: { label: payload, title: payload, text: payload },
    stats: [{ value: payload, label: payload }],
    features: [{ title: payload, description: payload }],
    links: [{ title: payload, url: payload }],
    socials: { github: payload, email: payload },
    capture: { offer: true, waitlist: true, survey_question: payload, consent: payload },
    delivery: {
      redirect: { target_url: payload, status_code: payload },
      maintenance: { help_url: payload, retry_after_seconds: payload },
    },
  };
}

test('no payload escapes any mode', () => {
  for (const payload of PAYLOADS) {
    const config = hostileConfig(payload);
    for (const mode of MODES) {
      const { html } = renderPage(mode, 'example.com', config);
      const body = html.slice(html.indexOf('<body>'));

      // Escaped output legitimately contains the characters "onerror=" and
      // "<img", both as text and inside attribute values, so substring checks
      // over the whole document produce noise. An injection has to become a tag
      // to do anything, and a correctly escaped payload never can — so the check
      // runs over the tags only, with attribute values blanked.
      const tags = (body.match(/<[^>]*>/g) || []).join(' ').replace(/"[^"]*"/g, '""');

      if (/[<>"']/.test(payload)) {
        assert.ok(!body.includes(payload), `${mode} / ${payload}: reached the page unescaped`);
      }
      assert.doesNotMatch(tags, /<script/i, `${mode} / ${payload}: injected a script tag`);
      assert.doesNotMatch(tags, /<img/i, `${mode} / ${payload}: injected an image`);
      assert.doesNotMatch(tags, /\son[a-z]+\s*=/i, `${mode} / ${payload}: injected an event handler`);
      assert.doesNotMatch(body, /(?:href|action|src)="javascript:/i,
        `${mode} / ${payload}: injected a javascript: url`);
    }
  }
});

test('the style block cannot be broken out of', () => {
  for (const payload of PAYLOADS) {
    const { html } = renderPage('parking', 'example.com', { theme: { accent: payload } });
    const style = html.slice(html.indexOf('<style>') + '<style>'.length, html.indexOf('</style>'));
    assert.doesNotMatch(style, /[<>]/, `accent "${payload}" put markup into the stylesheet`);
  }
});

test('the JSON-LD block cannot be closed early', () => {
  for (const payload of PAYLOADS) {
    const { html } = renderPage('parking', 'example.com', { headline: payload, price: payload });
    const start = html.indexOf('<script type="application/ld+json">');
    if (start < 0) continue;
    const json = html.slice(start + 35, html.indexOf('</script>', start));
    assert.doesNotMatch(json, /<\/?script/i, `payload "${payload}" reached JSON-LD as markup`);
    assert.doesNotThrow(() => JSON.parse(json), `payload "${payload}" produced invalid JSON-LD`);
  }
});

test('a hostile Host header cannot become a canonical URL', () => {
  for (const host of ['exa"mple.com', 'example.com/<script>', 'exa mple.com', '../../etc']) {
    const { html } = renderPage('landing', host, { headline: 'ok' });
    assert.doesNotMatch(html, /rel="canonical"/, `host "${host}" should not produce a canonical URL`);
    assert.doesNotMatch(html, /<script(?![^>]*ld\+json)/i);
  }
});
