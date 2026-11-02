// Read-only route regression for the eleven existing Studio work case studies.
// This checks the real linked files and in-page/homepage anchors, without
// changing the homepage or any approved artwork.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const origin = 'https://studio.invalid/';
const read = path => readFile(new URL(path, root), 'utf8');

const projects = [
  'childfree', 'deep-ink', 'lemon-sun', 'mova', 'one',
  'poster-studies', 'stockwise', 'vela-health',
  'vinyl-lounge', 'zawadi', 'zebra',
];
const homepage = await read('index.html');
const homepageIds = new Set(
  [...homepage.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]),
);

for (const project of projects) {
  const page = `work/${project}/index.html`;

  test(`${page}: local navigation destinations exist`, async () => {
    const html = await read(page);
    const pageIds = new Set(
      [...html.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]),
    );
    const links = [...html.matchAll(/<a\b[^>]*?\bhref\s*=\s*(["'])(.*?)\1/gi)];
    assert.ok(links.length > 0, `${page}: expected navigable links`);

    let localCount = 0;
    for (const [, , href] of links) {
      const destination = new URL(href, new URL(page, origin));
      if (destination.origin !== origin) continue; // external, email, telephone
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

      // Guard the two most important anchor journeys: within the case study
      // and back to a real section of the existing Studio homepage.
      if (destination.hash && (targetPage === page || targetPage === 'index.html')) {
        const id = decodeURIComponent(destination.hash.slice(1));
        const ids = targetPage === page ? pageIds : homepageIds;
        assert.ok(ids.has(id), `${page}: broken section link ${href}`);
      }
    }
    assert.ok(localCount > 0, `${page}: expected internal navigation`);
  });
}
