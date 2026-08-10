import test from 'node:test';
import assert from 'node:assert/strict';

import worker from '../src/index.js';

test('loopback visitor pages expose the dev template switcher', async () => {
  const response = await worker.fetch(new Request('http://127.0.0.1:8787/'), {}, {});
  const html = await response.text();
  assert.match(html, /data-dev-switcher/);
  for (const label of ['Parking \/ for sale', 'Coming soon', 'Landing', 'Profile', 'Redirect', 'Maintenance']) {
    assert.match(html, new RegExp(`>${label}<`), label);
  }
  assert.match(html, /<form method="get" action="\/">/);
  assert.doesNotMatch(html, /onchange=/i);
});

test('deployed visitor pages do not expose the dev template switcher', async () => {
  const response = await worker.fetch(new Request('https://example.com/'), {}, {});
  const html = await response.text();
  assert.doesNotMatch(html, /data-dev-switcher/);
});
