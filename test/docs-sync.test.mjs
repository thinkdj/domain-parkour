import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('README and AGENTS keep the self-hosted boundary accurate', async () => {
  const [readme, agents] = await Promise.all([
    readFile(new URL('../README.md', import.meta.url), 'utf8'),
    readFile(new URL('../AGENTS.md', import.meta.url), 'utf8'),
  ]);
  assert.match(readme, /defaults\.json/);
  assert.match(readme, /application-level hostname limit/i);
  assert.match(agents, /application-level hostname limit/i);
  assert.match(agents, /no Cloud entitlement tiers/i);
  assert.doesNotMatch(readme, /free_v1|plus_v1|pro_v1/i);
});
