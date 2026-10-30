// Regression: month arrow keys must not hijack scrolling or text editing
// outside the calendar controls. Exercise the real browser script in a
// minimal DOM harness without adding a paid or browser-only dependency.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const script = await readFile(new URL('../calendars/calendar.js', import.meta.url), 'utf8');

function calendarHarness() {
  const elements = new Map();
  const listeners = {};
  const getElementById = (id) => {
    if (id === 'date-grid' || id === 'grid-title') return null;
    if (!elements.has(id)) {
      elements.set(id, {
        textContent: '',
        setAttribute() {},
        getContext() { return { drawImage() {} }; },
      });
    }
    return elements.get(id);
  };
  const document = {
    body: { dataset: { edition: 'roots-2027', view: 'detail' } },
    getElementById,
    querySelectorAll: () => [],
    addEventListener(name, listener) { listeners[name] = listener; },
  };
  const window = {
    location: { hash: '' },
    history: {
      replaceState(_state, _title, hash) { window.location.hash = hash; },
    },
    addEventListener() {},
  };
  class Image {
    constructor() {
      this.complete = true;
      this.naturalWidth = 3000;
      this.naturalHeight = 4000;
    }
  }
  runInNewContext(script, { document, window, Image });
  assert.equal(typeof listeners.keydown, 'function');

  function press(key, kind, options = {}) {
    let prevented = false;
    const target = {
      closest(selector) {
        if (selector.includes('.navmonths')) {
          return kind === 'nav' || kind === 'input' ? {} : null;
        }
        if (selector.includes('input')) return kind === 'input' ? {} : null;
        return null;
      },
    };
    listeners.keydown({
      key,
      target,
      preventDefault() { prevented = true; },
      ...options,
    });
    return {
      prevented,
      month: getElementById('month-title').textContent,
      hash: window.location.hash,
    };
  }
  return { press };
}

test('arrow keys outside calendar navigation preserve normal page behavior', () => {
  const { press } = calendarHarness();
  for (const kind of ['outside', 'input']) {
    const result = press('ArrowRight', kind);
    assert.equal(result.prevented, false, kind + ': must not prevent scrolling or editing');
    assert.equal(result.month, '', kind + ': must not change the month');
  }
  for (const modifier of ['ctrlKey', 'altKey', 'metaKey', 'shiftKey']) {
    const result = press('ArrowRight', 'nav', { [modifier]: true });
    assert.equal(result.prevented, false, modifier + ': shortcut must be preserved');
    assert.equal(result.month, '', modifier + ': must not change the month');
  }
});

test('arrow keys on month controls change month without wrapping past 2027', () => {
  const { press } = calendarHarness();
  const next = press('ArrowRight', 'nav');
  assert.equal(next.prevented, true);
  assert.equal(next.month, 'February 2027');
  assert.equal(next.hash, '#february-2027');

  const previous = press('ArrowLeft', 'nav');
  assert.equal(previous.prevented, true);
  assert.equal(previous.month, 'January 2027');
  assert.equal(previous.hash, '#january-2027');

  const boundary = press('ArrowLeft', 'nav');
  assert.equal(boundary.prevented, false, 'no navigation before January');
  assert.equal(boundary.month, 'January 2027');
});
