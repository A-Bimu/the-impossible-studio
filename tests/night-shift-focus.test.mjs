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
      this.hidden = false;
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
    reset() { this.values = {}; }
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
    'occupancy', 'status', 'add', 'close', 'reset', 'undo', 'print'].map(id => [id, new Element()]));
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

test('New arrival check-in focuses the assigned room even while the New arrival button stays enabled', async () => {
  const app = setup();
  app.ids.add.fire('click');
  app.submit(102);
  await Promise.resolve();
  assert.equal(app.ids.add.disabled, false, 'more rooms are still available');
  assert.equal(app.room(102).dataset.state, 'occupied');
  assert.equal(app.getFocused(), app.room(102), 'focus should follow the completed check-in');
});

test('cancelling New arrival restores focus to its original button', async () => {
  const app = setup();
  app.ids.add.fire('click');
  app.ids.close.fire('click');
  await Promise.resolve();
  assert.equal(app.getFocused(), app.ids.add);
});


test('undo restores the most recently checked-out guest and focuses their room', () => {
  const app = setup();
  app.room(101).fire('click');
  assert.equal(app.room(101).dataset.state, 'available');
  assert.equal(app.ids.undo.hidden, false, 'undo is offered after checkout');
  app.ids.undo.fire('click');
  assert.equal(app.room(101).dataset.state, 'occupied');
  assert.match(app.room(101)['aria-label'], /Avery Reed/);
  assert.equal(app.getFocused(), app.room(101));
  assert.equal(app.ids.undo.hidden, true, 'undo is consumed after restoration');
});

test('checkout live announcement identifies the guest and the available recovery action', () => {
  const app = setup();
  app.room(101).fire('click');
  assert.equal(app.ids.status.textContent, 'Avery Reed checked out of room 101. Undo checkout available.');
  assert.equal(app.ids.undo.hidden, false);
  app.room(203).fire('click');
  assert.equal(app.ids.status.textContent, 'Sol Kim checked out of room 203. Undo checkout available.');
  assert.equal(app.ids.undo['aria-label'], 'Undo checkout for Sol Kim, room 203');
});

test('undo button identifies the guest and room, updating after consecutive checkouts', () => {
  const app = setup();
  assert.equal(app.ids.undo.hidden, true);
  app.room(101).fire('click');
  assert.equal(app.ids.undo.textContent, 'Undo checkout · Room 101');
  assert.equal(app.ids.undo['aria-label'], 'Undo checkout for Avery Reed, room 101');
  app.room(203).fire('click');
  assert.equal(app.ids.undo.textContent, 'Undo checkout · Room 203');
  assert.equal(app.ids.undo['aria-label'], 'Undo checkout for Sol Kim, room 203');
});

test('undo button returns to its neutral label after restoration or reset', () => {
  const app = setup();
  app.room(101).fire('click');
  app.ids.undo.fire('click');
  assert.equal(app.ids.undo.hidden, true);
  assert.equal(app.ids.undo.textContent, 'Undo last checkout');
  assert.equal(app.ids.undo['aria-label'], 'Undo last checkout');
  app.room(203).fire('click');
  app.ids.reset.fire('click');
  assert.equal(app.ids.undo.hidden, true);
  assert.equal(app.ids.undo['aria-label'], 'Undo last checkout');
});

test('a second checkout replaces the previous undo instead of restoring both guests', () => {
  const app = setup();
  app.room(101).fire('click');
  app.room(203).fire('click');
  app.ids.undo.fire('click');
  assert.equal(app.room(101).dataset.state, 'available');
  assert.equal(app.room(203).dataset.state, 'occupied');
  assert.equal(app.ids.undo.hidden, true);
});

test('new check-in invalidates checkout undo so it cannot resurrect stale bookings', async () => {
  const app = setup();
  app.room(101).fire('click');
  app.room(102).fire('click');
  app.submit(102);
  await Promise.resolve();
  assert.equal(app.ids.undo.hidden, true);
  app.ids.undo.fire('click');
  assert.equal(app.room(101).dataset.state, 'available');
  assert.equal(app.room(102).dataset.state, 'occupied');
});

test('reset restores the original ledger and clears the checkout undo', () => {
  const app = setup();
  app.room(101).fire('click');
  app.ids.reset.fire('click');
  assert.equal(app.room(101).dataset.state, 'occupied');
  assert.equal(app.ids.undo.hidden, true);
  app.ids.undo.fire('click');
  assert.equal(app.ids.status.textContent, 'Demo guest ledger restored.');
});
