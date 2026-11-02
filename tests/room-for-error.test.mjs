import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import vm from 'node:vm';

const html = await readFile(new URL('../drafts/2026-11-02-room-for-error/index.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];

test('draft contains a genuine accessible interactive print and no remote dependencies', () => {
  assert.ok(script, 'Inline controls script exists');
  assert.match(html, /<h1[^>]+aria-label="A little room for error"/);
  for (const id of ['registration', 'pressure', 'reset', 'print', 'press', 'status']) {
    assert.match(html, new RegExp('id="' + id + '"'));
  }
  assert.match(html, /<label for="registration">/);
  assert.match(html, /<label for="pressure">/);
  assert.match(html, /@media print/);
  assert.match(html, /@page\s*\{\s*size:\s*A4 portrait/);
  assert.doesNotMatch(html, /<script[^>]+src=|<link[^>]+href=["']https?:|<img[^>]+src=["']https?:/i);
});

test('sliders change ink offsets and opacity; reset restores defaults; print is user-triggered', () => {
  const handlers = {};
  const elements = {};
  for (const id of ['registration', 'pressure', 'registration-value', 'pressure-value', 'reset', 'print', 'status']) {
    elements[id] = {
      value: id === 'registration' ? '6' : id === 'pressure' ? '75' : '',
      textContent: '',
      addEventListener(type, callback) { handlers[id + ':' + type] = callback; },
    };
  }
  const styles = new Map();
  let printCalls = 0;
  const context = {
    document: {
      getElementById(id) { assert.ok(elements[id], 'Unknown DOM element: ' + id); return elements[id]; },
      documentElement: { style: { setProperty(name, value) { styles.set(name, value); } } },
    },
    window: { print() { printCalls += 1; } },
  };
  vm.runInNewContext(script, context, { timeout: 1000 });
  assert.equal(styles.get('--shift-x'), '6px');
  assert.equal(styles.get('--shift-y'), '-4px');
  assert.equal(styles.get('--pressure'), '0.75');
  assert.equal(printCalls, 0, 'Do not invoke print on page load');

  elements.registration.value = '18';
  elements.pressure.value = '40';
  handlers['registration:input']();
  handlers['pressure:input']();
  assert.equal(styles.get('--shift-x'), '18px');
  assert.equal(styles.get('--shift-y'), '-12px');
  assert.equal(styles.get('--pressure'), '0.4');
  assert.equal(elements['registration-value'].value, '18 px');
  assert.equal(elements['pressure-value'].value, '40%');

  handlers['reset:click']();
  assert.equal(elements.registration.value, '6');
  assert.equal(elements.pressure.value, '75');
  assert.equal(styles.get('--pressure'), '0.75');
  assert.equal(elements.status.textContent, 'Ink settings restored.');
  handlers['print:click']();
  assert.equal(printCalls, 1);
});
