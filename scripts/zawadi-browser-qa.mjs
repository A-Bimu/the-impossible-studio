// Chromium acceptance checks for Zawadi's responsive case-study navigation.
// Run from the repository root with a local HTTP server on port 8765.
// This is not a substitute for physical-device or assistive-technology review.
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from '../.studio-qa-tools/node_modules/playwright/index.mjs';

const origin = process.env.STUDIO_QA_ORIGIN || 'http://127.0.0.1:8765';
const url = new URL('/work/zawadi/', origin).href;
const screenshotDir = 'artifacts/zawadi-browser-qa';
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
    assert.equal(response?.status(), 200, name + ': Zawadi route must load');
    await verify(page);
    assert.deepEqual(errors, [], name + ': no uncaught script errors');
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
  await scenario('mobile no JavaScript section navigation', {
    viewport: {width: 390, height: 844}, javaScriptEnabled: false
  }, async page => {
    const menu = page.locator('.mobile-sections');
    assert.equal(await menu.isVisible(), true);
    assert.equal(await page.locator('.topin > .nav').isVisible(), false);
    await menu.locator('summary').click();
    assert.equal(await menu.evaluate(node => node.open), true);
    assert.equal(await menu.locator('nav a:visible').count(), 6);
    await menu.locator('a[href="#cards"]').click();
    assert.equal(new URL(page.url()).hash, '#cards');
    assert.equal(await page.locator('#cards').count(), 1);
    await page.screenshot({path: screenshotDir + '/mobile-sections-no-js.png', fullPage: true});
  });

  await scenario('mobile keyboard section navigation', {
    viewport: {width: 390, height: 844}
  }, async page => {
    const summary = page.locator('.mobile-sections summary');
    await summary.focus();
    assert.equal(await summary.evaluate(node => node === document.activeElement), true);
    await page.keyboard.press('Enter');
    const menu = page.locator('.mobile-sections');
    assert.equal(await menu.evaluate(node => node.open), true);
    await page.keyboard.press('Escape');
    assert.equal(await menu.evaluate(node => node.open), false, 'Escape dismisses the open menu');
    assert.equal(await summary.evaluate(node => node === document.activeElement), true, 'Escape returns focus to the summary');
    await page.keyboard.press('Enter');
    assert.equal(await menu.evaluate(node => node.open), true);
    const cards = page.locator('.mobile-sections a[href="#cards"]');
    await cards.focus();
    assert.equal(await cards.evaluate(node => node === document.activeElement), true);
    await page.keyboard.press('Enter');
    assert.equal(new URL(page.url()).hash, '#cards');
    assert.equal(await page.locator('#cards').count(), 1);
    await page.waitForFunction(() => document.activeElement?.id === 'cards');
    assert.equal(await menu.evaluate(node => node.open), false, 'section selection dismisses the menu');
    await page.screenshot({path: screenshotDir + '/mobile-sections-keyboard.png', fullPage: true});
  });

  await scenario('narrow 320px mobile section navigation', {
    viewport: {width: 320, height: 640}
  }, async page => {
    const menu = page.locator('.mobile-sections');
    await menu.locator('summary').click();
    assert.equal(await menu.locator('nav a:visible').count(), 6);
    await menu.locator('a[href="#logo"]').click();
    assert.equal(new URL(page.url()).hash, '#logo');
    await page.waitForFunction(() => document.activeElement?.id === 'logo');
    assert.equal(await menu.evaluate(node => node.open), false);
    await page.screenshot({path: screenshotDir + '/mobile-sections-320px.png', fullPage: true});
  });

  await scenario('desktop navigation remains intact', {
    viewport: {width: 1440, height: 900}
  }, async page => {
    assert.equal(await page.locator('.topin > .nav').isVisible(), true);
    assert.equal(await page.locator('.mobile-sections').isVisible(), false);
    assert.equal(await page.locator('.topin > .nav a:visible').count(), 6);
    await page.locator('.topin > .nav a[href="#logo"]').click();
    assert.equal(new URL(page.url()).hash, '#logo');
    assert.equal(await page.locator('#logo').count(), 1);
    await page.screenshot({path: screenshotDir + '/desktop-navigation.png', fullPage: true});
  });
} finally {
  await browser.close();
}
console.log('Zawadi Chromium navigation QA: ' + completed + ' scenarios passed.');
