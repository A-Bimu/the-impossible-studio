// The calendar remains navigable when the artwork sprite cannot be loaded.
// Exercise the actual calendar.js in a dependency-free DOM harness.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const source = await readFile(new URL('../calendars/calendar.js', import.meta.url), 'utf8');

function makeNode(tag = 'div') {
  const classes = new Set();
  const attrs = new Map();
  const children = [];
  let value = '';
  return {
    tag, children, attributes: attrs,
    classList: {
      add(name) { classes.add(name); },
      contains(name) { return classes.has(name); },
      toggle(name, enabled) { if (enabled) classes.add(name); else classes.delete(name); }
    },
    get textContent() { return value; },
    set textContent(text) {
      value = String(text);
      if (value === '') children.length = 0;
    },
    appendChild(child) { children.push(child); child.parentNode = this; return child; },
    setAttribute(name, val) { attrs.set(name, String(val)); },
    getContext() { return { drawImage() {}, imageSmoothingEnabled: false }; },
    addEventListener() {}
  };
}

function harness({ edition = 'roots-2027', hash = '#october-2027' } = {}) {
  const elements = new Map();
  const canvas = makeNode('canvas');
  const canvasHolder = makeNode('div');
  canvasHolder.appendChild(canvas);
  elements.set('month-canvas', canvas);
  const printButton = makeNode('button');
  const get = (id) => {
    if (!elements.has(id)) elements.set(id, makeNode());
    return elements.get(id);
  };
  const document = {
    body: { dataset: { edition, view: 'detail' } },
    createElement: makeNode,
    getElementById: get,
    querySelectorAll(selector) {
      if (selector === '.mini') return get('month-thumbs').children;
      if (selector === '[data-print]') return [printButton];
      return [];
    },
    addEventListener() {}
  };
  const window = {
    location: { hash },
    history: { replaceState(_state, _title, next) { window.location.hash = next; } },
    addEventListener() {},
    print() {}
  };
  const sprites = [];
  class Image {
    constructor() {
      this.complete = false;
      this.naturalWidth = 0;
      this.naturalHeight = 0;
      sprites.push(this);
    }
  }
  runInNewContext(source, { document, window, Image });
  return { get, canvas, canvasHolder, printButton, sprite: sprites[0], window };
}

test('all three editions keep usable month browsing and dates when artwork fails', () => {
  for (const edition of ['roots-2027', 'atlas-africa-2027', 'heritage-africa-2027']) {
    const { get, canvas, canvasHolder, printButton, sprite, window } = harness({ edition });
    sprite.onerror();
    const thumbs = get('month-thumbs').children;
    assert.equal(thumbs.length, 12, edition + ': twelve fallback month buttons');
    assert.equal(thumbs[9].children[0].textContent, 'Oct');
    assert.equal(get('month-title').textContent, 'October 2027');
    assert.equal(get('month-title').attributes.get('aria-live'), 'polite');
    assert.equal(get('date-grid').children[0].children[0].textContent.includes('October 2027'), true);
    assert.equal(canvas.classList.contains('hidden'), true);
    assert.equal(canvasHolder.children[1].attributes.get('role'), 'status');
    assert.equal(get('save-page').disabled, true);
    assert.equal(printButton.disabled, true);
    thumbs[10].onclick();
    assert.equal(get('month-title').textContent, 'November 2027');
    assert.equal(window.location.hash, '#november-2027');
    get('prev').onclick();
    assert.equal(get('month-title').textContent, 'October 2027');
    assert.equal(get('date-grid').children[0].children[0].textContent.includes('October 2027'), true);
  }
});

test('successful sprite loading retains the original artwork thumbnails and export', () => {
  const { get, canvas, canvasHolder, printButton, sprite } = harness();
  sprite.complete = true;
  sprite.naturalWidth = 3000;
  sprite.naturalHeight = 4000;
  sprite.onload();
  assert.equal(get('month-thumbs').children.length, 12);
  assert.equal(get('month-thumbs').children[0].children[0].tag, 'canvas');
  assert.equal(canvas.width, 1000);
  assert.equal(canvas.height, 1000);
  assert.equal(canvasHolder.children.length, 1);
  assert.notEqual(get('save-page').disabled, true);
  assert.notEqual(printButton.disabled, true);
  assert.equal(get('month-title').textContent, 'October 2027');
});
