import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';

const html = readFileSync(new URL('../work/childfree/index.html', import.meta.url), 'utf8');
const script = html.match(/<script>\s*([\s\S]*?)\s*<\/script>\s*<\/body>/)?.[1];
assert.ok(script, 'Childfree inline interaction script exists');

function element(dataset = {}) {
  const listeners = {};
  return {
    dataset, hidden: false, disabled: false, textContent: '', innerHTML: '', focusCount: 0,
    addEventListener(name, fn) { listeners[name] = fn; },
    fire(name, event = {}) { listeners[name]?.(event); },
    setAttribute(name, value) { this[name] = value; },
    focus() { this.focusCount++; },
    cloneNode() { return element(); },
    appendChild(child) { this.child = child; }
  };
}

function setup({supportsDialog = true} = {}) {
  const cards = Array.from({length: 9}, (_, i) => {
    const mood = ['whimsical', 'chilled', 'bold'][Math.floor(i / 3)];
    const card = element({mood});
    const open = element();
    const parts = {
      '.pin-open': open,
      '.pin-art img': element(),
      '.card-index span': Object.assign(element(), {textContent: 'Pin ' + (i + 1)}),
      '.card-index span:last-child': Object.assign(element(), {textContent: mood}),
      'h3': Object.assign(element(), {textContent: 'Pin concept ' + (i + 1)}),
      '.pin-statement': Object.assign(element(), {textContent: 'Statement ' + (i + 1)}),
      '.pin-spec': Object.assign(element(), {innerHTML: '<dt>Enamel</dt><dd>Concept</dd>'}),
      '.pin-note': Object.assign(element(), {textContent: 'Note ' + (i + 1)})
    };
    card.querySelector = selector => parts[selector];
    card.open = open;
    return card;
  });
  const buttons = ['all', 'whimsical', 'chilled', 'bold'].map(mood => element({mood}));
  const ids = Object.fromEntries(['pin-count', 'pin-detail-art', 'pin-detail-index', 'pin-detail-title',
    'pin-detail-statement', 'pin-detail-spec', 'pin-detail-note', 'pin-detail-close',
    'pin-detail-prev', 'pin-detail-next', 'pin-detail-position'].map(id => [id, element()]));
  ids['pin-grid'] = {querySelectorAll: () => cards};
  const dialog = element();
  if(supportsDialog) dialog.showModal = () => { dialog.open = true; };
  dialog.close = () => { dialog.open = false; dialog.fire('close'); };
  ids['pin-detail'] = dialog;
  const classes = new Set();
  const document = {
    body: {classList: {add: name => classes.add(name), contains: name => classes.has(name)}},
    getElementById: id => ids[id],
    querySelectorAll(selector) {
      if (selector === '.pin-moods button[data-mood]') return buttons;
      if (selector === '.pin-open') return cards.map(card => card.open);
      throw new Error('Unexpected document selector in Childfree test: ' + selector);
    }
  };
  new Script(script).runInNewContext({document});
  return {cards, buttons, ids, dialog, document};
}

test('detail controls are accessible and announce current concept', () => {
  assert.match(html, /id="pin-detail-prev" aria-label="Previous pin concept"/);
  assert.match(html, /id="pin-detail-next" aria-label="Next pin concept"/);
  assert.match(html, /id="pin-detail-position" role="status" aria-live="polite"/);
});

test('paging respects all nine boundaries and restores opener focus', () => {
  const {cards, ids, dialog} = setup();
  cards[0].open.fire('click');
  assert.equal(dialog.open, true);
  assert.equal(ids['pin-detail-prev'].disabled, true);
  assert.equal(ids['pin-detail-title'].textContent, 'Pin concept 1');
  for(let i = 1; i < 9; i++) ids['pin-detail-next'].fire('click');
  assert.equal(ids['pin-detail-title'].textContent, 'Pin concept 9');
  assert.equal(ids['pin-detail-position'].textContent, '9 of 9: Pin concept 9');
  assert.equal(ids['pin-detail-next'].disabled, true);
  assert.equal(ids['pin-detail-prev'].focusCount, 1, 'focus leaves newly disabled Next button');
  ids['pin-detail-next'].fire('click');
  assert.equal(ids['pin-detail-title'].textContent, 'Pin concept 9');
  ids['pin-detail-close'].fire('click');
  assert.equal(cards[0].open.focusCount, 1);
});

test('filtering limits detail paging to the selected three pins', () => {
  const {cards, buttons, ids} = setup();
  buttons[2].fire('click');
  assert.equal(cards.filter(card => !card.hidden).length, 3);
  assert.equal(ids['pin-count'].textContent, 'Showing 3 of 9 pins');
  cards[4].open.fire('click');
  assert.equal(ids['pin-detail-position'].textContent, '2 of 3: Pin concept 5');
  ids['pin-detail-next'].fire('click');
  assert.equal(ids['pin-detail-title'].textContent, 'Pin concept 6');
  assert.equal(ids['pin-detail-next'].disabled, true);
  ids['pin-detail-prev'].fire('click');
  ids['pin-detail-prev'].fire('click');
  assert.equal(ids['pin-detail-title'].textContent, 'Pin concept 4');
  assert.equal(ids['pin-detail-prev'].disabled, true);
  assert.equal(ids['pin-detail-next'].focusCount, 1, 'focus leaves newly disabled Previous button');
  ids['pin-detail-close'].fire('click');
  assert.equal(cards[4].open.focusCount, 1);
});


test('no-JavaScript and unsupported-dialog fallback never offers inert detail controls', () => {
  assert.match(html, /\.pin-page:not\(\.pin-enhanced\) \.pin-open\{display:none\}/);
  assert.match(html, /document\.body\.classList\.add\('pin-enhanced'\)/);
  assert.match(html, /<p class="pin-note">[^<]+<\/p>/, 'notes remain readable without JavaScript');
  const supported = setup();
  assert.equal(supported.document.body.classList.contains('pin-enhanced'), true);
  const unsupported = setup({supportsDialog: false});
  assert.equal(unsupported.document.body.classList.contains('pin-enhanced'), false);
  assert.equal(unsupported.cards.filter(card => card.open.disabled).length, 9, 'all nine unsupported-dialog controls are disabled');
  assert.equal(unsupported.buttons.some(button => button.disabled), false, 'mood filters remain usable without a dialog');
});

test('keyboard skip link becomes visible and lands on a focusable collection target', () => {
  assert.match(html, /<a class="sr-only" href="#collection">Skip to the pin collection<\/a>/);
  assert.match(html, /<section class="pin-section" id="collection" tabindex="-1">/,
    'the skip target must accept programmatic focus');
  assert.match(html, /\.pin-page \.sr-only:focus-visible\{[^}]*position:fixed!important;[^}]*z-index:1000;[^}]*clip-path:none/s,
    'keyboard focus must reveal the previously clipped link above the page');
  assert.match(html, /\.pin-page \.pin-moods button:focus-visible,[\s\S]*?\.pin-page \.pin-close:focus-visible\{outline:3px solid var\(--accent\)/,
    'collection controls must retain a visible keyboard focus indicator');
});
