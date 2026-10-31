import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';

const html = readFileSync(new URL('../daily/2026-10-31-night-shift/index.html', import.meta.url), 'utf8');
const script = html.match(/<script>\s*([\s\S]*?)\s*<\/script>/)?.[1];
assert.ok(script, 'Night Shift inline application script exists');

function setup() {
  let focused = null;
  class Element {
    constructor(tag = 'div') {
      this.tag = tag;
      this.children = [];
      this.listeners = {};
      this.dataset = {};
      this.isConnected = true;
      this.disabled = false;
      this.textContent = '';
    }
    addEventListener(name, callback) { (this.listeners[name] ??= []).push(callback); }
    fire(name, event = {}) {
      for (const callback of this.listeners[name] ?? []) callback({currentTarget: this, ...event});
    }
    replaceChildren() {
      for (const child of this.children) child.isConnected = false;
      this.children = [];
    }
    append(...children) {
      for (const child of children) {
        child.isConnected = true;
        this.children.push(child);
      }
    }
    setAttribute(name, value) { this[name] = value; }
    focus() { if (this.isConnected && !this.disabled) focused = this; }
    querySelector(selector) {
      if (selector === 'input') return input;
      const match = selector.match(/^\[data-room="(\d+)"\]$/);
      if (match) return this.children.find(child => child.dataset.room === match[1]) ?? null;
      throw new Error('Unexpected selector: ' + selector);
    }
  }
  const input = new Element('input');
  const ids = Object.fromEntries(['rooms', 'ledger', 'booking', 'form', 'roomChoice',
    'occupancy', 'status', 'add', 'close', 'reset', 'print'].map(id => [id, new Element()]));
  const dialog = ids.booking;
  dialog.open = false;
  dialog.showModal = () => { dialog.open = true; };
  dialog.close = () => {
    dialog.open = false;
    queueMicrotask(() => dialog.fire('close'));
  };
  const document = {
    querySelector(selector) {
      if (!selector.startsWith('#') || !ids[selector.slice(1)])
        throw new Error('Unexpected document selector: ' + selector);
      return ids[selector.slice(1)];
    },
    createElement(tag) { return new Element(tag); }
  };
  class FormDataStub {
    constructor(form) { this.values = form.values; }
    get(name) { return this.values[name]; }
  }
  new Script(script).runInNewContext({document, FormData: FormDataStub, window: {print() {}}});
  const room = number => ids.rooms.querySelector('[data-room="' + number + '"]');
  const submit = (number, name = 'Test Guest') => {
    ids.form.values = {guest: name, room: String(number), nights: '1'};
    ids.form.fire('submit', {preventDefault() {}});
  };
  return {ids, room, submit, getFocused: () => focused};
}

test('checking out replaces the room button but retains keyboard focus on its replacement', () => {
  const app = setup();
  const old = app.room(101);
  old.fire('click');
  assert.notEqual(app.room(101), old);
  assert.equal(old.isConnected, false);
  assert.equal(app.getFocused(), app.room(101));
  assert.equal(app.room(101).dataset.state, 'available');
});

test('cancelling a check-in returns focus to the original available room', async () => {
  const app = setup();
  const opener = app.room(102);
  opener.fire('click');
  assert.equal(app.ids.booking.open, true);
  app.ids.close.fire('click');
  await Promise.resolve();
  assert.equal(app.getFocused(), opener);
});

test('checking in returns focus to the newly rendered room, not a detached button', async () => {
  const app = setup();
  const old = app.room(102);
  old.fire('click');
  app.submit(102);
  await Promise.resolve();
  assert.equal(old.isConnected, false);
  assert.equal(app.room(102).dataset.state, 'occupied');
  assert.equal(app.getFocused(), app.room(102));
});

test('filling the final room from New arrival avoids focusing a disabled button', async () => {
  const app = setup();
  for (const number of [102, 103, 201]) {
    app.room(number).fire('click');
    app.submit(number);
    await Promise.resolve();
  }
  app.ids.add.fire('click');
  app.submit(202);
  await Promise.resolve();
  assert.equal(app.ids.add.disabled, true);
  assert.equal(app.getFocused(), app.room(202));
});
