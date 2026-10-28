import assert from 'node:assert/strict';
import { test } from 'node:test';
import path from 'node:path';
import { auditHtml, resolveLocalReference } from './audit-project-links.mjs';

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
