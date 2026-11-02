// Read-only route regression for the eleven existing Studio work case studies.
// This checks the real linked files and in-page/homepage anchors, without
// changing the homepage or any approved artwork.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const siteRoot = new URL('https://studio.invalid/');
const read = path => readFile(new URL(path, root), 'utf8');

const projects = [
  'childfree', 'deep-ink', 'lemon-sun', 'mova', 'one',
  'poster-studies', 'stockwise', 'vela-health',
  'vinyl-lounge', 'zawadi', 'zebra',
];
// Cache actual destination documents so cross-page fragment links are checked
// against their target, not only the current page or the Studio homepage.
const anchorCache = new Map();
async function anchorsFor(page) {
  if (!anchorCache.has(page)) {
    const html = await read(page);
    const ids = new Set([
      ...[...html.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]),
      ...[...html.matchAll(/<a\b[^>]*\bname=["']([^"']+)["']/gi)].map(match => match[1]),
    ]);
    anchorCache.set(page, ids);
  }
  return anchorCache.get(page);
}

for (const project of projects) {
  const page = `work/${project}/index.html`;

  test(`${page}: local navigation destinations exist`, async () => {
    const html = await read(page);
    const links = [...html.matchAll(/<a\b[^>]*?\bhref\s*=\s*(["'])(.*?)\1/gi)];
    assert.ok(links.length > 0, `${page}: expected navigable links`);

    let localCount = 0;
    for (const [, , href] of links) {
      const destination = new URL(href, new URL(page, siteRoot));
      if (destination.origin !== siteRoot.origin) continue; // external, email, telephone
      localCount += 1;

      // Resolve directory links to their index page, just as static hosting does.
      const relative = decodeURIComponent(destination.pathname).replace(/^\/+/, '');
      const targetPage = !relative || relative.endsWith('/')
        ? `${relative}index.html`
        : relative;
      await assert.doesNotReject(
        access(new URL(targetPage, root)),
        `${page}: missing local destination ${href}`,
      );

      // A gallery or presentation link may jump to another HTML page's
      // section. Verify the destination's actual anchors as well as same-page
      // and homepage anchors; do not silently accept a missing fragment.
      if (destination.hash && /\.html?$/i.test(targetPage)) {
        const id = decodeURIComponent(destination.hash.slice(1));
        const ids = await anchorsFor(targetPage);
        assert.ok(ids.has(id), `${page}: broken section link ${href} (missing #${id} in ${targetPage})`);
      }
    }
    assert.ok(localCount > 0, `${page}: expected internal navigation`);
  });
}
