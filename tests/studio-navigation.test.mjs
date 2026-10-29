// Guard links from the journal, pitch decks and existing project case studies.
// This suite reads the homepage but never changes its content or approved artwork.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { access, readdir, readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const homepage = await read('index.html');
const targetIds = new Set([...homepage.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]));
const pages = [
  'daily/index.html',
  'pitch-decks/index.html',
  'calendars/index.html',
  'calendars/roots-2027/index.html',
  'calendars/atlas-africa-2027/index.html',
  'calendars/heritage-africa-2027/index.html',
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

for (const page of pages.filter(path => path.startsWith('calendars/'))) {
  test(`${page}: archive navigation reaches the real gallery`, async () => {
    const html = await read(page);
    const relative = page === 'calendars/index.html' ? '../' : '../../';
    const label = page === 'calendars/index.html' ? 'All work' : 'Work gallery';
    assert.ok(html.includes(`href="${relative}#work">${label}</a>`), `${page}: expected gallery link and label`);
    assert.doesNotMatch(html, /href=["'](?:\.\.\/)+#archive["']/);
  });
}


// Cover every checked-in HTML page, including older project demos not listed
// in the targeted homepage-section tests above. This prevents regressions such
// as a correct-looking gallery label pointing to a missing local route.
const htmlPages = (await readdir(root, { recursive: true }))
  .filter(path => path.endsWith('.html'))
  .sort();
const siteOrigin = 'https://studio.invalid';
const htmlCache = new Map();
async function cachedHtml(path) {
  if (!htmlCache.has(path)) htmlCache.set(path, await read(path));
  return htmlCache.get(path);
}

for (const page of htmlPages) {
  test(`${page}: all local routes and fragments resolve`, async () => {
    const html = await cachedHtml(page);
    // Static href/src attributes only. Remote sites and dynamic JS routes are
    // deliberately outside this repository-local integrity check.
    for (const match of html.matchAll(/\b(?:href|src)\s*=\s*(["'])(.*?)\1/g)) {
      const value = match[2];
      const target = new URL(value, new URL(page, `${siteOrigin}/`));
      if (target.origin !== siteOrigin) continue;

      const relative = decodeURIComponent(target.pathname).replace(/^\//, '');
      const targetPage = !relative || relative.endsWith('/')
        ? `${relative}index.html`
        : relative;
      await assert.doesNotReject(
        access(new URL(targetPage, root)),
        `${page}: missing local resource ${value} (resolved to ${targetPage})`,
      );

      if (target.hash && targetPage.endsWith('.html')) {
        const destination = await cachedHtml(targetPage);
        const destinationIds = new Set(
          [...destination.matchAll(/\bid=["']([^"']+)["']/g)].map(found => found[1]),
        );
        const fragment = decodeURIComponent(target.hash.slice(1));
        assert.ok(
          destinationIds.has(fragment),
          `${page}: missing #${fragment} in ${targetPage} (from ${value})`,
        );
      }
    }
  });
}
