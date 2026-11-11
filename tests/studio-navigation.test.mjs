// Guard links from the journal, pitch decks and existing project case studies.
// This suite reads the homepage but never changes its content or approved artwork.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const homepage = await read('index.html');
const targetIds = new Set([...homepage.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]));
// This PR owns journal and pitch-deck navigation only; project-specific
// navigation is reconciled in rebuild PRs #8, #9, #15 and #16.
const pages = [
  'daily/index.html',
  'pitch-decks/index.html',
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

// Keep this focused on pages owned by this PR. Run the full-site route
// regression suite after project rebuild PRs have been reconciled.
const siteOrigin = 'https://studio.invalid';
for (const page of pages) {
  test(`${page}: local links and homepage fragments resolve`, async () => {
    const html = await read(page);
    for (const match of html.matchAll(/\bhref\s*=\s*(["'])(.*?)\1/g)) {
      const value = match[2];
      const target = new URL(value, new URL(page, `${siteOrigin}/`));
      if (target.origin !== siteOrigin) continue;
      const relative = decodeURIComponent(target.pathname).slice(1);
      const targetPage = !relative || relative.endsWith('/') ? `${relative}index.html` : relative;
      await assert.doesNotReject(access(new URL(targetPage, root)), `${page}: missing local link ${value}`);
      if (target.hash && targetPage === 'index.html') {
        assert.ok(targetIds.has(decodeURIComponent(target.hash.slice(1))), `${page}: invalid homepage fragment ${value}`);
      }
    }
  });
}


// Issue #6: art-first case studies previously linked to homepage #archive and
// #about, but the current homepage uses #work and #studio. Keep these links
// aligned without changing any approved artwork or homepage content.
for (const page of [
  'work/deep-ink/index.html',
  'work/lemon-sun/index.html',
  'work/vinyl-lounge/index.html',
]) {
  test(`${page}: navigation targets existing homepage sections`, async () => {
    const html = await read(page);
    const homeLinks = [...html.matchAll(/<a\b[^>]*\bhref=(["'])\.\.\/\.\.\/#([^"']+)\1/gi)];
    assert.ok(homeLinks.length >= 3, `${page}: expected homepage navigation links`);
    for (const link of homeLinks) {
      assert.ok(targetIds.has(link[2]), `${page}: homepage #${link[2]} does not exist`);
    }
    assert.match(html, /href="\.\.\/\.\.\/#work">Experiments<\/a>/);
    assert.match(html, /href="\.\.\/\.\.\/#studio">About<\/a>/);
  });
}
