import test, {before, after} from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const pageUrl = new URL('../work/childfree/index.html', import.meta.url).href;
let browser;

before(async () => {
  browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_EXECUTABLE_PATH
      ? {executablePath: process.env.CHROMIUM_EXECUTABLE_PATH} : {})
  });
});
after(async () => { await browser?.close(); });

test('no-script visitors can still read all nine approved pins', async () => {
  const context = await browser.newContext({
    javaScriptEnabled: false, viewport: {width: 375, height: 800}
  });
  try {
    const page = await context.newPage();
    await page.goto(pageUrl);
    assert.equal(await page.locator('.pin-card:visible').count(), 9);
    assert.equal(await page.locator('.pin-moods:visible').count(), 0,
      'filter controls must not appear before handlers are available');
    assert.equal(await page.locator('.pin-open:visible').count(), 0,
      'detail controls must not appear without a working dialog');
    assert.equal(await page.locator('.pin-note:visible').count(), 9,
      'each design note must remain available without JavaScript');
    assert.equal(await page.locator('.sheet-frame img').evaluate(
      image => image.complete && image.naturalWidth > 0), true,
      'the approved concept sheet must load');
  } finally {
    await context.close();
  }
});

test('filtered keyboard browsing preserves boundaries and returns focus on Escape', async () => {
  const context = await browser.newContext({viewport: {width: 1024, height: 768}});
  try {
    const page = await context.newPage();
    await page.goto(pageUrl);
    await page.locator('.pin-moods button[data-mood="chilled"]').click();
    assert.equal(await page.locator('.pin-card:visible').count(), 3);
    assert.equal(await page.locator('#pin-count').textContent(), 'Showing 3 of 9 pins');

    const opener = page.locator('.pin-card:visible .pin-open').nth(1);
    await opener.click();
    assert.equal(await page.locator('#pin-detail').evaluate(dialog => dialog.open), true);
    assert.equal(await page.locator('#pin-detail-title').textContent(), 'Motherhood Is Optional');
    assert.equal(await page.locator('#pin-detail-close').evaluate(
      button => document.activeElement === button), true);

    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#pin-detail-title').textContent(), 'Complete As I Am');
    assert.equal(await page.locator('#pin-detail-position').textContent(),
      '3 of 3: Complete As I Am');
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#pin-detail-title').textContent(), 'Complete As I Am',
      'arrow navigation must not wrap past the last visible pin');
    await page.keyboard.press('ArrowLeft');
    assert.equal(await page.locator('#pin-detail-title').textContent(), 'Motherhood Is Optional');

    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('#pin-detail').open);
    assert.equal(await opener.evaluate(button => document.activeElement === button), true,
      'focus must return to the card that opened the dialog');
  } finally {
    await context.close();
  }
});

test('pin collection and dialog fit narrow mobile viewports', async () => {
  for (const width of [320, 375]) {
    const context = await browser.newContext({viewport: {width, height: 740}, isMobile: true});
    try {
      const page = await context.newPage();
      await page.goto(pageUrl);
      const grid = await page.locator('#pin-grid').boundingBox();
      assert.ok(grid && grid.x >= -1 && grid.x + grid.width <= width + 1,
        `pin grid overflows a ${width}px viewport`);
      await page.locator('.pin-card .pin-open').first().click();
      const dialog = await page.locator('#pin-detail').boundingBox();
      assert.ok(dialog && dialog.x >= -1 && dialog.x + dialog.width <= width + 1,
        `detail dialog overflows a ${width}px viewport`);
      assert.equal(await page.locator('#pin-detail-title').textContent(),
        'Childfree, By Choice');
    } finally {
      await context.close();
    }
  }
});
