import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';

const html = readFileSync(new URL('../daily/2026-10-31-night-shift/index.html', import.meta.url), 'utf8');
const script = html.match(/<script>\s*([\s\S]*?)\s*<\/script>/)?.[1];
assert.ok(script, 'the guest booking page has executable JavaScript');

function setup({ open = true } = {}) {
  let focused = null;
  class Element {
    constructor(tag = 'div') {
      this.tag = tag;
      this.children = [];
      this.listeners = {};
      this.value = '';
      this.hidden = false;
      this.disabled = false;
      this.textContent = '';
    }
    addEventListener(type, handler) { (this.listeners[type] ??= []).push(handler); }
    fire(type) {
      for (const handler of this.listeners[type] ?? []) {
        handler({ currentTarget: this, preventDefault() {} });
      }
    }
    replaceChildren() { this.children = []; }
    append(...nodes) { this.children.push(...nodes); }
    setAttribute(name, value) { this[name] = value; }
    focus() { focused = this; }
    scrollIntoView() {}
  }

  const names = ['roomGrid', 'checkin', 'checkout', 'guests', 'reservation',
    'searchStatus', 'summary', 'reservationForm', 'confirmation',
    'guestName', 'guestEmail', 'searchForm', 'rooms', 'booking', 'closeDialog'];
  const ids = Object.fromEntries(names.map(id => [id, new Element()]));
  ids.guests.value = '2';
  ids.confirmation.hidden = true;
  ids.reservation.open = false;
  ids.reservation.showModal = () => { ids.reservation.open = true; };
  ids.reservation.close = () => {
    ids.reservation.open = false;
    ids.reservation.fire('close');
  };
  const document = {
    querySelector(selector) {
      const element = ids[selector.replace(/^#/, '')];
      if (!element || !selector.startsWith('#')) throw new Error('Unknown selector ' + selector);
      return element;
    },
    createElement(tag) { return new Element(tag); }
  };
  new Script(script).runInNewContext({ document, Date });

  const firstRoom = ids.roomGrid.children[0];
  assert.ok(firstRoom, 'the room collection renders');
  const button = firstRoom.children[1].children[3].children[1];
  assert.equal(button.tag, 'button');
  if (open) button.fire('click');
  return { ids, button, focused: () => focused };
}

test('confirmed demo booking moves keyboard focus to the visible confirmation', () => {
  assert.match(html, /id="confirmation"[^>]*role="status"[^>]*tabindex="-1"/);
  const app = setup();
  assert.equal(app.ids.reservation.open, true);
  assert.equal(app.focused(), app.ids.guestName);
  app.ids.guestName.value = 'Sample Guest';
  app.ids.guestEmail.value = 'sample@example.test';
  app.ids.reservationForm.fire('submit');
  assert.equal(app.ids.reservationForm.hidden, true);
  assert.equal(app.ids.confirmation.hidden, false);
  assert.equal(app.focused(), app.ids.confirmation,
    'focus must not remain inside the hidden booking form');
  assert.match(app.ids.confirmation.textContent, /no payment was taken/);
  app.ids.closeDialog.fire('click');
  assert.equal(app.ids.reservation.open, false);
  assert.equal(app.focused(), app.button, 'closing restores focus to the selected room');
});

test('an incomplete demo booking does not reveal or focus the confirmation', () => {
  const app = setup();
  app.ids.guestName.value = '   ';
  app.ids.guestEmail.value = 'sample@example.test';
  app.ids.reservationForm.fire('submit');
  assert.equal(app.ids.reservationForm.hidden, false);
  assert.equal(app.ids.confirmation.hidden, true);
  assert.equal(app.focused(), app.ids.guestName);
});


test('clearing check-in keeps a valid checkout minimum and blocks booking until dates recover', () => {
  const app = setup({ open: false });
  const validMinimum = app.ids.checkout.min;
  app.ids.checkin.value = '';
  app.ids.checkin.fire('change');
  assert.equal(app.ids.checkout.min, validMinimum);
  assert.doesNotMatch(app.ids.checkout.min, /NaN|undefined/);
  app.button.fire('click');
  assert.equal(app.ids.reservation.open, false);
  assert.match(app.ids.searchStatus.textContent, /valid stay/);

  app.ids.checkin.value = app.ids.checkin.min;
  app.ids.checkin.fire('change');
  app.ids.checkout.value = app.ids.checkout.min;
  app.button.fire('click');
  assert.equal(app.ids.reservation.open, true, 'valid dates must still open the demo');
});

test('a past check-in cannot be booked even if the date range spans valid nights', () => {
  const app = setup({ open: false });
  app.ids.checkin.value = '2000-01-01';
  app.ids.checkout.value = '2000-01-03';
  app.button.fire('click');
  assert.equal(app.ids.reservation.open, false);
  assert.match(app.ids.searchStatus.textContent, /valid stay/);
});
