import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const partsDir = join(root, 'projects', 'zebra-fashion', 'parts');
const wrapper = readFileSync(join(root, 'projects', 'zebra-fashion', 'index.html'), 'utf8');

test('ZEBRA loader has exactly 16 numbered parts with no missing files', () => {
  assert.match(wrapper, /PARTS\s*=\s*16\s*;/);
  const names = readdirSync(partsDir).filter((name) => /^\d{2}\.txt$/.test(name)).sort();
  assert.deepEqual(names, Array.from({length: 16}, (_, i) => String(i).padStart(2, '0') + '.txt'));
});

test('ZEBRA parts reconstruct one complete, interactive HTML document in loader order', () => {
  const content = Array.from({length: 16}, (_, i) =>
    readFileSync(join(partsDir, String(i).padStart(2, '0') + '.txt'), 'utf8')
  ).join('');
  assert.match(content, /^\s*<!doctype html>/i);
  assert.match(content, /<html\b/i);
  assert.match(content, /<\/html>/i);
  assert.match(content, /<body\b/i);
  assert.match(content, /<\/body>/i);
  assert.match(content, /<script\b/i);
  assert.match(content, /routePage\s*\(/);
  assert.match(content, /addEventListener\s*\(/);
  assert.ok(content.length > 100_000, 'Unexpectedly short storefront may indicate missing content');
});

test('ZEBRA loader reports inaccessible parts rather than silently showing a blank page', () => {
  assert.match(wrapper, /if\s*\(!r\.ok\)/);
  assert.match(wrapper, /catch\s*\(e\)/);
  assert.match(wrapper, /Preview unavailable/);
});
