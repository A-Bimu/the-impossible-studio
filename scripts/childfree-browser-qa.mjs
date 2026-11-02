// Real-browser release checks for Childfree's approved nine-pin catalogue.
// Run from the repository root after starting a local HTTP server on port 8765.
// This is an interactive draft QA check, not proof of physical-device or screen-reader review.
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from '../.studio-qa-tools/node_modules/playwright/index.mjs';

const origin = process.env.STUDIO_QA_ORIGIN || 'http://127.0.0.1:8765';
const url = new URL('/work/childfree/', origin).href;
const screenshotDir = 'artifacts/childfree-browser-qa';
await mkdir(screenshotDir, {recursive: true});

const browser = await chromium.launch({headless: true});
let completed = 0;

async function scenario(name, options, verify) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    const response = await page.goto(url, {waitUntil: 'domcontentloaded'});
    assert.equal(response?.status(), 200, name + ': page must load successfully');
    await verify(page);
    assert.deepEqual(errors, [], name + ': no uncaught page errors');
    completed++;
    console.log('PASS ' + name);
  } catch (error) {
    await page.screenshot({path: screenshotDir + '/' + name.replace(/[^a-z0-9]+/gi, '-') + '-failure.png', fullPage: true}).catch(() => {});
    throw error;
  } finally {
    await context.close();
  }
}

try {
  await scenario('no JavaScript fallback', {
    viewport: {width: 390, height: 844}, javaScriptEnabled: false
  }, async page => {
    assert.equal(await page.locator('.pin-card:visible').count(), 9);
    assert.equal(await page.locator('.pin-filterbar').isVisible(), false, 'inert filters stay hidden');
    assert.equal(await page.locator('.pin-open:visible').count(), 0, 'inert dialog controls stay hidden');
    assert.equal(await page.locator('.pin-noscript').isVisible(), true);
    assert.equal(await page.locator('.sheet-frame img').getAttribute('src'), '../../assets/childfree-original.webp');
    assert.equal(await page.locator('.pin-card .pin-note').count(), 9, 'all notes remain in the document');
  });

  await scenario('mobile filter and dialog keyboard journey', {
    viewport: {width: 390, height: 844}
  }, async page => {
    await page.locator('.pin-moods button[data-mood="chilled"]').click();
    assert.equal(await page.locator('.pin-card:visible').count(), 3);
    assert.equal(await page.locator('#pin-count').textContent(), 'Showing 3 of 9 pins');
    assert.equal(await page.locator('.pin-moods button[data-mood="chilled"]').getAttribute('aria-pressed'), 'true');
    const opener = page.locator('.pin-card[data-mood="chilled"]').nth(1).locator('.pin-open');
    await opener.click();
    assert.equal(await page.locator('#pin-detail').evaluate(dialog => dialog.open), true);
    assert.equal(await page.locator('#pin-detail-position').textContent(), '2 of 3: Motherhood Is Optional');
    await page.locator('#pin-detail-next').click();
    assert.equal(await page.locator('#pin-detail-position').textContent(), '3 of 3: Complete As I Am');
    assert.equal(await page.locator('#pin-detail-next').isDisabled(), true);
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('#pin-detail').open);
    await page.waitForFunction(() => document.activeElement?.classList.contains('pin-open'));
    assert.equal(await opener.evaluate(node => node === document.activeElement), true, 'dialog restores opener focus');
    await page.screenshot({path: screenshotDir + '/mobile-catalogue.png', fullPage: true});
  });

  await scenario('desktop visible skip link and intact approved sheet', {
    viewport: {width: 1440, height: 900}
  }, async page => {
    await page.keyboard.press('Tab');
    const skip = page.locator('a.sr-only[href="#collection"]');
    assert.equal(await skip.evaluate(node => node === document.activeElement), true);
    assert.equal(await skip.isVisible(), true, 'keyboard focus reveals skip link');
    await page.keyboard.press('Enter');
    assert.equal(new URL(page.url()).hash, '#collection');
    assert.equal(await page.locator('#collection').evaluate(node => node === document.activeElement), true);
    const sheet = page.locator('.sheet-frame img');
    await sheet.scrollIntoViewIfNeeded();
    await sheet.evaluate(img => img.decode());
    assert.equal(await sheet.evaluate(img => img.naturalWidth > 0), true, 'approved source artwork loads');
    await page.screenshot({path: screenshotDir + '/desktop-sheet.png', fullPage: true});
  });
} finally {
  await browser.close();
}
console.log('Childfree Chromium QA: ' + completed + ' scenarios passed.');
