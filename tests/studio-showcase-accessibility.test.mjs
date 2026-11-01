import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

// A tiny DOM fixture exercises the shared viewer without a browser dependency.
class Element {
  constructor(tag) {
    this.tag = tag;
    this.children = [];
    this.attributes = {};
    this.dataset = {};
    this.className = '';
    this.textContent = '';
    this.style = { setProperty() {} };
    this.classList = { toggle() {} };
  }
  append(...children) { this.children.push(...children); }
  setAttribute(name, value) { this.attributes[name] = value; }
  getBoundingClientRect() { return { width: 390 }; }
  querySelectorAll(tag) {
    return this.children.flatMap(child => [
      ...(child.tag === tag ? [child] : []),
      ...child.querySelectorAll(tag),
    ]);
  }
}

const descendants = element => [element, ...element.children.flatMap(descendants)];

async function setup() {
  const mount = new Element('div');
  const config = {
    project: 'Studio Sample',
    source: '../real-project/?preview=1',
    desktop: [
      { title: 'Overview', route: '#overview' },
      { title: 'Features', route: '#features' },
    ],
    phone: [{ title: 'Checkout', route: '#checkout' }],
  };
  const root = {
    querySelector(selector) {
      if (selector === '.sd-config') return { textContent: JSON.stringify(config) };
      if (selector === '.sd-mount') return mount;
      return null;
    },
  };
  const document = {
    createElement: tag => new Element(tag),
    querySelectorAll: selector => selector === '.sd-showcase' ? [root] : [],
  };
  const source = await readFile(new URL('../assets/studio-responsive-showcase.js', import.meta.url), 'utf8');
  runInNewContext(source, {
    document,
    window: { addEventListener() {} },
    location: { search: '' },
    URLSearchParams,
    requestAnimationFrame: callback => callback(),
  });
  const elements = descendants(mount);
  const group = label => elements.find(element => element.attributes.role === 'group' && element.attributes['aria-label'] === label);
  return {
    screenButtons: group('Preview screen')?.querySelectorAll('button'),
    deviceButtons: group('Preview device')?.querySelectorAll('button'),
    status: elements.find(element => element.className === 'sd-demo-status'),
    frame: elements.find(element => element.tag === 'iframe' && element.title?.startsWith('Studio Sample')),
    open: elements.find(element => element.className === 'sd-demo-open'),
  };
}

test('screen and device choices have separate accessible labels and an initial preview announcement', async () => {
  const { screenButtons, deviceButtons, status, frame, open } = await setup();
  assert.equal(screenButtons.length, 3);
  assert.equal(deviceButtons.length, 2);
  assert.equal(status.attributes.role, 'status');
  assert.equal(status.attributes['aria-live'], 'polite');
  assert.equal(status.textContent, 'Previewing Overview on laptop.');
  assert.equal(frame.title, 'Studio Sample: Overview (laptop preview)');
  assert.equal(open.attributes['aria-label'], 'Open Overview in a new tab');
  assert.equal(screenButtons[0].attributes['aria-pressed'], 'true');
  assert.equal(deviceButtons[0].attributes['aria-pressed'], 'true');
});

test('changing screens and device updates accessible context without losing the source link', async () => {
  const { screenButtons, deviceButtons, status, frame, open } = await setup();
  screenButtons[1].onclick();
  assert.equal(frame.src, '../real-project/?preview=1#features');
  assert.equal(open.href, frame.src);
  assert.equal(screenButtons[1].attributes['aria-pressed'], 'true');
  assert.equal(screenButtons[0].attributes['aria-pressed'], 'false');
  assert.equal(status.textContent, 'Previewing Features on laptop.');

  deviceButtons[1].onclick();
  assert.equal(status.textContent, 'Previewing Features on phone.');
  assert.equal(frame.title, 'Studio Sample: Features (phone preview)');
  assert.equal(open.attributes['aria-label'], 'Open Features in a new tab');
  assert.equal(deviceButtons[1].attributes['aria-pressed'], 'true');
  assert.equal(deviceButtons[0].attributes['aria-pressed'], 'false');
  assert.equal(frame.src, '../real-project/?preview=1#features');

  screenButtons[2].onclick();
  assert.equal(status.textContent, 'Previewing Checkout on phone.');
  assert.equal(frame.title, 'Studio Sample: Checkout (phone preview)');
  assert.equal(open.href, '../real-project/?preview=1#checkout');
});
