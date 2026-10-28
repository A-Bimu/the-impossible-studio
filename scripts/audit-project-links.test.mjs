import assert from 'node:assert/strict';
import { test } from 'node:test';
import path from 'node:path';
import os from 'node:os';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { auditHtml, auditCss, auditProjectPages, resolveLocalReference } from './audit-project-links.mjs';

const root = path.resolve('/studio');
const page = path.join(root, 'work', 'zebra', 'index.html');

test('resolves relative pages, root links, assets and query strings', () => {
  assert.equal(resolveLocalReference(root, page, '../../'), path.join(root, 'index.html'));
  assert.equal(resolveLocalReference(root, page, '../one/'), path.join(root, 'work', 'one', 'index.html'));
  assert.equal(resolveLocalReference(root, page, '../../assets/cover.webp?size=2#preview'), path.join(root, 'assets', 'cover.webp'));
});

test('ignores external URLs, inline data, mailto and in-page hashes', () => {
  for (const value of ['https://example.org', 'mailto:hi@example.org', 'data:image/png;base64,AAA', '#gallery', '//cdn.example.org/image.png']) {
    assert.equal(resolveLocalReference(root, page, value), null);
  }
});

test('reports missing references without flagging existing files', () => {
  const html = '<a href="../../">Home</a><img src="../../assets/missing.webp"><a href="#details">Details</a>';
  const existing = new Set([path.join(root, 'index.html')]);
  assert.deepEqual(auditHtml(root, page, html, target => existing.has(target)), [
    { reference: '../../assets/missing.webp', target: 'assets/missing.webp' },
  ]);
});

test('supports encoded filenames and HTML-escaped query parameters', () => {
  assert.equal(resolveLocalReference(root, page, '../../assets/My%20Poster.png?x=1&amp;y=2'), path.join(root, 'assets', 'My Poster.png'));
});

test('audits responsive srcset, style blocks and inline background images', () => {
  const html = `<picture><source srcset="../../assets/mobile.webp 1x, ../../assets/retina.webp 2x"></picture>
    <style>.hero {background-image: url('../../assets/hero.webp')}</style>
    <div style="background:url(../../assets/texture.png)"></div>
    <img data-src="../../assets/lazy-placeholder.webp" src="../../assets/loaded.webp">`;
  const found = auditHtml(root, page, html, () => false).map(item => item.reference);
  assert.deepEqual(found, [
    '../../assets/loaded.webp', '../../assets/mobile.webp', '../../assets/retina.webp',
    '../../assets/hero.webp', '../../assets/texture.png',
  ]);
});

test('CSS URLs resolve relative to the stylesheet, not the HTML page', () => {
  const stylesheet = path.join(root, 'work', 'zebra', 'styles', 'page.css');
  const css = `@font-face {src:url('https://cdn.example/font.woff2')} .a{background:url('../images/hero.webp')} .b{mask:url(#shape)} .c{background:url(data:image/png;base64,AAAA)}`;
  assert.deepEqual(auditCss(root, stylesheet, css, () => false), [
    { reference: '../images/hero.webp', target: 'work/zebra/images/hero.webp' },
  ]);
});

test('mixed data-URI srcsets are skipped rather than producing fake missing paths', () => {
  const html = '<img srcset="data:image/png;base64,AAAA 1x, ../../assets/other.webp 2x">';
  assert.deepEqual(auditHtml(root, page, html, () => false), []);
});

test('walker checks both HTML and CSS in scoped directories', async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'studio-audit-'));
  try {
    await mkdir(path.join(temp, 'work', 'one'), { recursive: true });
    await writeFile(path.join(temp, 'work', 'one', 'index.html'), '<a href="../../">Home</a><link href="./page.css" rel="stylesheet">');
    await writeFile(path.join(temp, 'index.html'), '<title>Home</title>');
    await writeFile(path.join(temp, 'work', 'one', 'page.css'), '.a{background:url(../../assets/missing.webp)}');
    const result = await auditProjectPages(temp);
    assert.equal(result.pages, 1);
    assert.equal(result.stylesheets, 1);
    assert.deepEqual(result.broken, [{ page: 'work/one/page.css', reference: '../../assets/missing.webp', target: 'assets/missing.webp' }]);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});


test('checks quoted CSS @import paths without duplicating url() imports', () => {
  const stylesheet = path.join(root, 'work', 'zebra', 'styles', 'page.css');
  const css = `@import "./missing-type.css";
    @import '../shared/layout.css' screen and (min-width: 40rem);
    @import url('./existing-grid.css');
    @import "https://cdn.example.com/theme.css";`;
  const existing = new Set([path.join(root, 'work', 'zebra', 'styles', 'existing-grid.css')]);
  assert.deepEqual(auditCss(root, stylesheet, css, target => existing.has(target)), [
    { reference: './missing-type.css', target: 'work/zebra/styles/missing-type.css' },
    { reference: '../shared/layout.css', target: 'work/zebra/shared/layout.css' },
  ]);
});
