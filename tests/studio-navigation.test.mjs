// Guard links from the journal, pitch decks and existing project case studies.
// This suite reads the homepage but never changes its content or approved artwork.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const homepage = await read('index.html');
const targetIds = new Set([...homepage.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]));
const pages = [
  'daily/index.html',
  'pitch-decks/index.html',
  'work/childfree/index.html',
  'work/lemon-sun/index.html',
  'work/vinyl-lounge/index.html',
  'work/one/index.html',
  'work/deep-ink/index.html',
];

for (const page of pages) {
  test(`${page}: links to homepage sections resolve`, async () => {
    const html = await read(page);
    const anchors = [...html.matchAll(/\bhref=["'](?:\.\.\/)+#([^"']+)["']/g)].map(match => match[1]);
    assert.ok(anchors.length > 0, 'Expected at least one homepage section link');
    for (const id of anchors) {
      assert.ok(targetIds.has(id), `${page} links to missing homepage #${id}`);
    }
  });
}

test('journal and pitch deck navigation labels match their destinations', async () => {
  const journal = await read('daily/index.html');
  const decks = await read('pitch-decks/index.html');
  assert.match(journal, /href="\.\.\/#studio">Studio<\/a>/);
  assert.match(journal, /href="\.\.\/#work">Gallery<\/a>/);
  assert.match(decks, /href="\.\.\/#work">Gallery<\/a>/);
});

for (const page of pages.filter(path => path.startsWith('work/'))) {
  test(`${page}: gallery and studio labels match real destinations`, async () => {
    const html = await read(page);
    assert.match(html, /href="\.\.\/\.\.\/#work">Gallery<\/a>/);
    assert.match(html, /href="\.\.\/\.\.\/#studio">Studio<\/a>/);
    assert.match(html, /href="\.\.\/\.\.\/#work">Work gallery<\/a>/);
  });
}
