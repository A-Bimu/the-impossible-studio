import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {chromium} = require(process.cwd() + '/.studio-qa-tools/node_modules/playwright');
const root = 'artifacts/childfree-browser-qa';
const origin = 'http://127.0.0.1:8765';
const results = [];
const issues = [];
await mkdir(root, {recursive: true});
const browser = await chromium.launch({headless: true, args: ['--no-sandbox']});

async function verifyArtworkAndLayout(page) {
  const sheet = page.locator('.sheet-frame img');
  assert.equal(await sheet.evaluate(img => img.complete && img.naturalWidth > 0), true, 'approved source sheet loads');
  assert.equal(await page.locator('.pin-card').count(), 9, 'nine approved concepts remain in the catalogue');
  // Lazy-loaded artwork may be outside the initial phone viewport. Visit every
  // card before capturing the full-page screenshot, then require decoded pixels.
  const cards = page.locator('.pin-card');
  for (let i = 0; i < await cards.count(); i++) {
    const image = cards.nth(i).locator('img');
    assert.equal(await image.count(), 1, 'pin ' + (i + 1) + ' has an image');
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(img => {
      if (img.loading === 'lazy') img.loading = 'eager';
    });
    await image.evaluate(async img => {
      if (!img.complete) await new Promise((resolve, reject) => {
        img.addEventListener('load', resolve, {once: true});
        img.addEventListener('error', reject, {once: true});
      });
      if (img.decode && img.naturalWidth > 0) await img.decode();
    });
    assert.equal(await image.evaluate(img => img.complete && img.naturalWidth > 0 && img.naturalHeight > 0),
      true, 'pin ' + (i + 1) + ' artwork loaded');
  }
  await page.evaluate(() => scrollTo(0, 0));
  const metrics = await page.evaluate(() => ({
    viewport: innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth
  }));
  assert.ok(metrics.document <= metrics.viewport + 4 && metrics.body <= metrics.viewport + 4,
    'no horizontal overflow: ' + JSON.stringify(metrics));
}

async function runScenario(name, width, height, options, check) {
  const context = await browser.newContext({
    viewport: {width, height},
    javaScriptEnabled: options.noJS !== true,
    deviceScaleFactor: 1
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  try {
    if (options.noDialog) {
      await page.addInitScript(() => {
        if (typeof HTMLDialogElement !== 'undefined') {
          Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {value: undefined, configurable: true});
        }
      });
    }
    await page.goto(origin + '/work/childfree/?preview=1', {waitUntil: 'domcontentloaded', timeout: 20000});
    await verifyArtworkAndLayout(page);
    await check(page);
    assert.deepEqual(pageErrors, [], 'no uncaught page errors');
    results.push({name, passed: true, width});
  } catch (error) {
    issues.push(name + ': ' + error.message);
    results.push({name, passed: false, width});
  } finally {
    try {
      await page.screenshot({path: root + '/' + name + '.png', fullPage: true,
        animations: 'disabled', timeout: 30000});
    } catch (error) {
      issues.push(name + ': screenshot failed: ' + error.message);
    }
    await context.close();
  }
}

async function interactive(page) {
  const all = page.locator('.pin-moods button[data-mood="all"]');
  const chilled = page.locator('.pin-moods button[data-mood="chilled"]');
  assert.equal(await page.locator('.pin-moods').isVisible(), true, 'enhanced filters are visible');
  assert.equal(await page.locator('.pin-card:not([hidden])').count(), 9);
  await chilled.click();
  assert.equal(await chilled.getAttribute('aria-pressed'), 'true');
  assert.equal(await all.getAttribute('aria-pressed'), 'false');
  assert.equal(await page.locator('.pin-card:not([hidden])').count(), 3);
  assert.equal(await page.locator('#pin-count').textContent(), 'Showing 3 of 9 pins');
  // Boundary and focus regressions: the first item cannot navigate backward,
  // and closing through the visible button returns focus to its opener.
  const firstOpener = page.locator('.pin-card:not([hidden]) .pin-open').first();
  await firstOpener.click();
  assert.equal(await page.locator('#pin-detail-position').innerText(), '1 of 3: ' + await page.locator('#pin-detail-title').innerText());
  assert.equal(await page.locator('#pin-detail-prev').isDisabled(), true, 'previous disabled at first item');
  await page.locator('#pin-detail-close').click();
  assert.equal(await page.locator('#pin-detail').evaluate(d => d.open), false, 'close button dismisses dialog');
  assert.equal(await firstOpener.evaluate(el => document.activeElement === el), true, 'close button restores opener focus');
  const opener = page.locator('.pin-card:not([hidden]) .pin-open').nth(1);
  // Exercise the same user journey without a mouse: focus the card and press Enter.
  await opener.focus();
  assert.equal(await opener.evaluate(el => document.activeElement === el), true, 'keyboard opener receives focus');
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('#pin-detail').evaluate(d => d.open), true, 'Enter opens detail modal');
  assert.equal(await page.locator('#pin-detail-position').innerText(), '2 of 3: ' + await page.locator('#pin-detail-title').innerText());
  await page.locator('#pin-detail-next').click();
  assert.match(await page.locator('#pin-detail-position').innerText(), /^3 of 3:/);
  assert.equal(await page.locator('#pin-detail-next').isDisabled(), true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#pin-detail').evaluate(d => d.open), false, 'Escape closes native modal');
  assert.equal(await opener.evaluate(el => document.activeElement === el), true, 'Escape restores opener focus');
  await all.click();
  assert.equal(await page.locator('.pin-card:not([hidden])').count(), 9, 'all filter restores collection');
}

async function staticFallback(page) {
  assert.equal(await page.locator('.pin-moods').isVisible(), false, 'inert filters are not displayed');
  assert.equal(await page.locator('.pin-open').first().isVisible(), false, 'inert dialog buttons are not displayed');
  assert.equal(await page.locator('.pin-card:not([hidden])').count(), 9);
  assert.equal(await page.locator('.pin-note').first().isVisible(), true, 'descriptions remain readable');
}

try {
  await runScenario('desktop-interactive', 1440, 900, {}, interactive);
  await runScenario('phone-interactive', 390, 844, {}, interactive);
  await runScenario('small-phone-interactive', 320, 720, {}, interactive);
  await runScenario('phone-no-javascript', 390, 844, {noJS: true}, staticFallback);
  await runScenario('phone-unsupported-dialog', 390, 844, {noDialog: true}, async page => {
    assert.equal(await page.locator('.pin-open').first().isVisible(), false, 'unsupported dialog controls hidden');
    assert.equal(await page.locator('.pin-moods').isVisible(), true, 'filters work without native dialog');
    await page.locator('.pin-moods button[data-mood="bold"]').click();
    assert.equal(await page.locator('.pin-card:not([hidden])').count(), 3);
    assert.equal(await page.locator('#pin-count').textContent(), 'Showing 3 of 9 pins');
  });
} finally {
  await browser.close();
  await writeFile(root + '/report.json', JSON.stringify({results, issues}, null, 2));
}
console.log(JSON.stringify({results, issues}, null, 2));
if (issues.length) process.exitCode = 1;
