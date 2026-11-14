import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../work/childfree/index.html', import.meta.url), 'utf8');

test('mood filters remain hidden until their listeners are registered', () => {
  assert.match(html, /\.pin-moods\{display:none;/);
  assert.match(html, /\.pin-page\.pin-filters-ready \.pin-moods\{display:flex\}/);
  const listener = html.indexOf("b.addEventListener('click', function(){ applyFilter(b.dataset.mood); });");
  const reveal = html.indexOf("document.body.classList.add('pin-filters-ready')");
  assert.ok(listener >= 0 && reveal > listener, 'filter controls reveal only after handlers are attached');
});

test('fallback descriptions stay readable and detail controls require dialog enhancement', () => {
  assert.match(html, /\.pin-page:not\(\.pin-enhanced\) \.pin-open\{display:none\}/);
  assert.match(html, /\.pin-page\.pin-enhanced \.pin-noscript\{display:none\}/);
  assert.match(html, /document\.body\.classList\.add\('pin-enhanced'\)/);
});

test('nine approved pin concepts remain in the catalogue', () => {
  const cards = html.match(/<article class="pin-card" data-mood="/g) ?? [];
  assert.equal(cards.length, 9);
  assert.match(html, /mood === 'all' \|\| card\.dataset\.mood === mood/);
  assert.match(html, /card\.hidden = !match/);
});

test('filter and dialog accessibility contracts survive progressive enhancement', () => {
  assert.match(html, /setAttribute\('aria-pressed', String\(b\.dataset\.mood === mood\)\)/,
    'filter selection is exposed through aria-pressed');
  assert.match(html, /typeof dialog\.showModal === 'function'/,
    'native dialog capability is checked before enhancement');
  assert.match(html, /dialog\.addEventListener\('close', function\(\)\{\s*if\(opener\)\{ opener\.focus\(\); \}/,
    'closing the dialog returns focus to the originating control');
});
