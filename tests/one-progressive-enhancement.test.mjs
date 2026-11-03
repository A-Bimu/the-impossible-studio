// Run with: node --test tests/one-progressive-enhancement.test.mjs
// Static regression guard for ONE's no-script fallback. Browser QA is still required.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const page = readFileSync(fileURLToPath(new URL('../work/one/index.html', import.meta.url)), 'utf8');

test('ONE hides unusable interactive controls when scripting is disabled', () => {
  assert.match(page, /html:not\(\.one-js\)\s+\.demo-toolbar\s*,\s*html:not\(\.one-js\)\s+\.demo-stage\s*\{\s*display:\s*none/);
  assert.match(page, /<noscript>[\s\S]*?interactive preview requires JavaScript[\s\S]*?<\/noscript>/i);
  assert.match(page, /<noscript>[\s\S]*?one-deep-navy\.html[\s\S]*?<\/noscript>/);
});

test('ONE preserves a usable script-enabled demo and the approved archive', () => {
  assert.match(page, /document\.documentElement\.classList\.add\(["']one-js["']\)/);
  assert.match(page, /<iframe\b[^>]*id="one-demo"[^>]*one-deep-navy\.html/);
  assert.match(page, /<img\b[^>]*src="\.\.\/\.\.\/assets\/one-original\.webp"/);
  assert.match(page, /data-screen="overview"/);
  assert.match(page, /data-size="phone"/);
});
