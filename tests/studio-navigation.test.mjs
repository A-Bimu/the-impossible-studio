// Regression guard for navigation from the journal and pitch-deck gallery.
// The homepage is intentionally not modified by this work.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const homepage = await read('index.html');
const targetIds = new Set([...homepage.matchAll(/\\bid=["']([^"']+)["']/g)].map(match => match[1]));

for (const page of ['daily/index.html', 'pitch-decks/index.html']) {
  test(`${page}: links to homepage sections resolve`, async () => {
    const html = await read(page);
    const anchors = [...html.matchAll(/\\bhref=["']\\.\\.\\/#([^"']+)["']/g)].map(match => match[1]);
    assert.ok(anchors.length > 0, 'Expected at least one homepage section link');
    for (const id of anchors) {
      assert.ok(targetIds.has(id), `${page} links to missing homepage #${id}`);
    }
  });
}

test('navigation destinations remain meaningful without editing the homepage', async () => {
  const journal = await read('daily/index.html');
  const decks = await read('pitch-decks/index.html');
  assert.match(journal, /href="\\.\\.\\/#studio">Studio<\\/a>/);
  assert.match(journal, /href="\\.\\.\\/#work">Gallery<\\/a>/);
  assert.match(decks, /href="\\.\\.\\/#work">Gallery<\\/a>/);
});
