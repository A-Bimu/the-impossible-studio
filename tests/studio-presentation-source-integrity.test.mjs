import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const pages = [
  'calendars/roots-2027/index.html',
  'calendars/atlas-africa-2027/index.html',
  'calendars/heritage-africa-2027/index.html',
  'work/poster-studies/index.html',
  'work/childfree/index.html',
  'work/zawadi/index.html',
  'work/deep-ink/index.html',
  'work/vinyl-lounge/index.html',
  'work/lemon-sun/index.html'
];
const root = new URL('../', import.meta.url);

async function existsAsFile(url) {
  try {
    const path = fileURLToPath(url);
    const info = await stat(path);
    if (info.isFile()) return path;
    if (info.isDirectory()) {
      const index = new URL('index.html', url.href.endsWith('/') ? url : new URL(url.href + '/'));
      if ((await stat(fileURLToPath(index))).isFile()) return fileURLToPath(index);
    }
  } catch (error) {
    if (error.code !== 'ENOENT' && error.code !== 'ENOTDIR') throw error;
  }
  return null;
}

test('all source-grounded Studio device previews resolve to real local files', async () => {
  for (const page of pages) {
    const base = new URL(page, root);
    const html = await readFile(base, 'utf8');
    const match = html.match(/<script\b[^>]*class="sd-config"[^>]*>([\s\S]*?)<\/script>/);
    assert.ok(match, page + ': configuration exists');
    const config = JSON.parse(match[1]);
    for (const item of [...config.desktop, ...config.phone]) {
      assert.equal(typeof item.route, 'string', page + ': preview route is a string');
      assert.ok(item.route.trim(), page + ': preview route is not empty');
      const target = new URL(item.route, base);
      assert.equal(target.protocol, 'file:', page + ': preview is local, not an unreviewed external page');
      const actual = await existsAsFile(target);
      assert.ok(actual, page + ': missing preview destination ' + item.route);
      // Hash-only previews may be rendered by JS (calendar month states).
      // This test deliberately checks their file target, not a static DOM ID.
    }
    const source = new URL(config.source, base);
    assert.equal(source.protocol, 'file:', page + ': demo source stays local');
    assert.ok(await existsAsFile(source), page + ': missing demo source ' + config.source);
  }
});
