import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';

const html = readFileSync(new URL('../daily/2026-10-31-night-shift/index.html', import.meta.url), 'utf8');
const script = html.match(/<script>\s*([\s\S]*?)\s*<\/script>/)?.[1];
assert.ok(script, 'the guest-facing hotel experience has executable JavaScript');

function setup() {
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
        handler({currentTarget: this, preventDefault() {}});
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
  new Script(script).runInNewContext({document, Date});
  function selectRoom(index) {
    const card = ids.roomGrid.children[index];
    assert.ok(card, 'room card exists');
    const button = card.children[1].children[3].children[1];
    assert.equal(button.tag, 'button');
    button.fire('click');
    return button;
  }
  function roomButton(index) {
    return ids.roomGrid.children[index].children[1].children[3].children[1];
  }
  return {ids, selectRoom, roomButton, focused: () => focused};
}

test('published October 31 experience remains the guest-facing Hotel Nocturne', () => {
  for (const id of ['searchForm', 'roomGrid', 'reservationForm', 'guestName', 'guestEmail', 'confirmation']) {
    assert.ok(html.includes('id="' + id + '"'), id + ' is part of the guest booking journey');
  }
  assert.match(html, /Hotel Nocturne/);
  assert.doesNotMatch(html, /STAFF TERMINAL|Undo last checkout/);
});

test('room capacity filters the booking buttons without hiding the suite', () => {
  const app = setup();
  assert.equal(app.ids.roomGrid.children.length, 3);
  app.ids.guests.value = '4';
  app.ids.guests.fire('change');
  assert.equal(app.roomButton(0).disabled, true);
  assert.equal(app.roomButton(1).disabled, true);
  assert.equal(app.roomButton(2).disabled, false);
  assert.match(app.ids.searchStatus.textContent, /Showing 1 room options for 4 guest/);
});

test('valid two-night suite booking shows a fictional total and an explicit no-payment confirmation', () => {
  const app = setup();
  const button = app.selectRoom(2);
  assert.equal(app.ids.reservation.open, true);
  assert.match(app.ids.summary.textContent, /Total \$720/);
  assert.match(app.ids.summary.textContent, /fictional, no payment/);
  assert.equal(app.focused(), app.ids.guestName);
  app.ids.guestName.value = 'Sample Guest';
  app.ids.guestEmail.value = 'sample@example.test';
  app.ids.reservationForm.fire('submit');
  assert.equal(app.ids.reservationForm.hidden, true);
  assert.equal(app.ids.confirmation.hidden, false);
  assert.match(app.ids.confirmation.textContent, /no reservation was submitted, no email was sent and no payment was taken/);
  app.ids.reservation.close();
  assert.equal(app.focused(), button, 'closing the dialog restores keyboard focus');
});

test('invalid stay dates prevent opening the reservation dialog', () => {
  const app = setup();
  app.ids.checkout.value = app.ids.checkin.value;
  app.selectRoom(0);
  assert.equal(app.ids.reservation.open, false);
  assert.match(app.ids.searchStatus.textContent, /valid stay of 1 to 30 nights/);
});
