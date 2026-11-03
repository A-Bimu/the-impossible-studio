import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../work/childfree/index.html', import.meta.url), 'utf8');

test('Childfree filters are hidden until their handlers are attached', () => {
  assert.match(page, /\.pin-moods\s*\{[^}]*display:\s*none/s);
  assert.match(page, /\.pin-filter-ready\s+\.pin-moods\s*\{[^}]*display:\s*flex/s);
  const handler = page.indexOf("b.addEventListener('click', function(){ applyFilter");
  const ready = page.indexOf("classList.add('pin-filter-ready')");
  assert.ok(handler >= 0 && ready > handler, 'filters must appear after handler registration');
});

test('Without enhancement, all pin cards remain readable', () => {
  assert.match(page, /\.pin-card\[hidden\]\s*\{display:none\}/);
  assert.match(page, /\.pin-page:not\(\.pin-enhanced\)\s+\.pin-open\s*\{display:none\}/);
  assert.match(page, /\.pin-noscript/);
  const cards = page.match(/class="pin-card\b/g) || [];
  assert.equal(cards.length, 9, 'the approved nine-pin collection must remain intact');
});

test('Filter controls and native dialog preserve accessible states', () => {
  assert.match(page, /setAttribute\('aria-pressed', String\(b\.dataset\.mood === mood\)\)/);
  assert.match(page, /typeof dialog\.showModal === 'function'/);
  assert.match(page, /dialog\.addEventListener\('close', function\(\)\{\s*if\(opener\)\{ opener\.focus\(\); \}/);
  assert.match(page, /classList\.add\('pin-enhanced'\)/);
});
