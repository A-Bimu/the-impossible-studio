// Zawadi mobile navigation regression: the desktop header used to hide
// Cards and Logo at phone widths, with no equivalent mobile navigation.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile, access} from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const pagePath = 'work/zawadi/index.html';
const html = await readFile(new URL(pagePath, root), 'utf8');
const desktop = html.match(/<nav class="nav" aria-label="Page navigation">([\s\S]*?)<\/nav>/)?.[1];
const mobile = html.match(/<details class="mobile-sections">([\s\S]*?)<\/details>/)?.[1];
const links = markup => [...markup.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/g)].map(match => match[1]);
const expected = ['#screens', '#cards', '#logo', '#story', '../../#work', 'https://v0-personal-portfolio-design-sand.vercel.app/'];

test('native mobile section menu exposes every desktop destination', () => {
  assert.ok(desktop, 'desktop navigation exists');
  assert.ok(mobile, 'mobile details navigation exists');
  assert.match(mobile, /<summary>Explore sections<\/summary>/);
  assert.match(mobile, /<nav aria-label="Mobile page navigation">/);
  assert.deepEqual(links(desktop), expected);
  assert.deepEqual(links(mobile), expected);
  assert.equal((html.match(/<details class="mobile-sections">/g) || []).length, 1);
});

test('mobile menu works without script and has visible keyboard focus', () => {
  assert.match(html, /\.mobile-sections\{display:none\}/);
  assert.match(html, /@media\(max-width:580px\)\{\s*\.topin>\.nav\{display:none\}/);
  assert.match(html, /\.mobile-sections\{display:block;/);
  assert.match(html, /\.mobile-sections summary:focus-visible,\.mobile-sections a:focus-visible/);
  assert.doesNotMatch(mobile, /onclick=|onkeydown=|javascript:/i);
});

test('every local mobile navigation destination exists', async () => {
  for (const href of links(mobile)) {
    const target = new URL(href, new URL(pagePath, 'https://studio.invalid/'));
    if (target.origin !== 'https://studio.invalid') continue;
    const path = decodeURIComponent(target.pathname.slice(1));
    const filename = !path || path.endsWith('/') ? path + 'index.html' : path;
    await access(new URL(filename, root));
    if (target.hash && filename === pagePath) {
      const id = decodeURIComponent(target.hash.slice(1));
      assert.ok(html.includes('id="' + id + '"'), 'Missing Zawadi section #' + id);
    }
    if (target.hash && filename === 'index.html') {
      const homepage = await readFile(new URL('index.html', root), 'utf8');
      assert.ok(homepage.includes('id="' + decodeURIComponent(target.hash.slice(1)) + '"'), 'Missing homepage anchor ' + href);
    }
  }
});
