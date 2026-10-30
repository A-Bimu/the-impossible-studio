// Poster keyboard navigation must not steal the page's normal arrow-key scrolling.
// Run the real shared poster.js with a minimal DOM harness (Node 22, no dependencies).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const script = await readFile(new URL('../work/poster-studies/poster.js', import.meta.url), 'utf8');

function harness(slug = 'sana-sana') {
  const listeners = {};
  let printHandler;
  let printCalls = 0;
  const window = { location: { href: 'unchanged' }, print() { printCalls++; } };
  const document = {
    body: { dataset: { poster: slug } },
    querySelectorAll(selector) {
      assert.equal(selector, '[data-print]');
      return [{ addEventListener(type, fn) {
        assert.equal(type, 'click');
        printHandler = fn;
      } }];
    },
    addEventListener(type, fn) { listeners[type] = fn; }
  };
  runInNewContext(script, { document, window });
  assert.equal(typeof listeners.keydown, 'function');

  function press(key, focus = 'nav', flags = {}) {
    let prevented = false;
    const target = {
      closest(selector) {
        if (selector.startsWith('input')) return focus === 'input' ? {} : null;
        if (selector.startsWith('.poster-nav')) return focus === 'nav' ? {} : null;
        return null;
      }
    };
    listeners.keydown({
      key, target, preventDefault() { prevented = true; }, ...flags
    });
    return { prevented, href: window.location.href };
  }
  return { press, print() { printHandler(); return printCalls; } };
}

test('outside navigation, arrow keys retain normal scrolling and editing', () => {
  for (const focus of ['outside', 'series', 'input']) {
    const result = harness().press('ArrowRight', focus);
    assert.equal(result.prevented, false, focus);
    assert.equal(result.href, 'unchanged', focus);
  }
});

test('modified and already-handled keys do not navigate', () => {
  for (const flag of ['ctrlKey', 'altKey', 'metaKey', 'shiftKey', 'defaultPrevented']) {
    const result = harness().press('ArrowRight', 'nav', { [flag]: true });
    assert.equal(result.prevented, false, flag);
    assert.equal(result.href, 'unchanged', flag);
  }
  assert.equal(harness().press('Enter', 'nav').href, 'unchanged');
});

test('focused Previous/Next study links support adjacent poster navigation', () => {
  const next = harness().press('ArrowRight', 'nav');
  assert.equal(next.prevented, true);
  assert.equal(next.href, '../ritual/');
  const prev = harness().press('ArrowLeft', 'nav');
  assert.equal(prev.prevented, true);
  assert.equal(prev.href, '../midnight-grove/');
});

test('first and last posters do not wrap around the series', () => {
  const first = harness('midnight-grove').press('ArrowLeft', 'nav');
  const last = harness('market-day-social').press('ArrowRight', 'nav');
  for (const result of [first, last]) {
    assert.equal(result.prevented, false);
    assert.equal(result.href, 'unchanged');
  }
});

test('print button continues to open the browser print dialog', () => {
  assert.equal(harness().print(), 1);
});
