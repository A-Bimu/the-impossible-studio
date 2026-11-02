// Real Chromium acceptance checks for the unapproved Room for Error draft.
// Does not publish or change any Studio artwork. Screenshots/PDF are QA artifacts.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '../.studio-qa-tools/node_modules/playwright/index.mjs';

const origin = process.env.STUDIO_QA_ORIGIN || 'http://127.0.0.1:8765';
const route = '/drafts/2026-11-02-room-for-error/';
const folder = 'artifacts/room-for-error-browser-qa';
await mkdir(folder, { recursive: true });
const issues = [];
const checked = [];
const browser = await chromium.launch({ headless: true });

for (const width of [1440, 820, 390, 320]) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(origin + route, { waitUntil: 'load', timeout: 15000 });
    await page.locator('.sheet').waitFor({ state: 'visible' });
    const measurements = await page.evaluate(() => {
      const sheet = document.querySelector('.sheet').getBoundingClientRect();
      const lines = [...document.querySelectorAll('.poster-title .front')].map(el => {
        const box = el.getBoundingClientRect();
        return { left: box.left, right: box.right, width: box.width };
      });
      return {
        viewport: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        sheet: { left: sheet.left, right: sheet.right },
        lines,
      };
    });
    assert.ok(measurements.documentWidth <= width + 2,
      'Unexpected horizontal page overflow: ' + JSON.stringify(measurements));
    for (const line of measurements.lines) {
      assert.ok(line.left >= measurements.sheet.left + 4 && line.right <= measurements.sheet.right - 4,
        'Poster lettering clipped at ' + width + 'px: ' + JSON.stringify(measurements));
    }
    assert.equal(await page.locator('#registration').inputValue(), '6');
    assert.equal(await page.locator('#pressure').inputValue(), '75');
    await page.locator('#registration').focus();
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#registration').inputValue(), '7', 'Keyboard changes ink registration');
    await page.locator('#pressure').evaluate(el => {
      el.value = '40';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    assert.equal(await page.locator('#pressure-value').evaluate(el => el.value), '40%');
    assert.equal(await page.evaluate(() => document.documentElement.style.getPropertyValue('--pressure')), '0.4');
    await page.locator('#reset').click();
    assert.equal(await page.locator('#registration').inputValue(), '6');
    assert.equal(await page.locator('#pressure').inputValue(), '75');
    assert.match(await page.locator('#status').innerText(), /restored/);
    await page.evaluate(() => {
      window.__studioPrintCalls = 0;
      window.print = () => { window.__studioPrintCalls += 1; };
    });
    await page.locator('#print').click();
    assert.equal(await page.evaluate(() => window.__studioPrintCalls), 1,
      'Print dialog should only be requested by explicit action');
    await page.screenshot({ path: folder + '/poster-' + width + '.png', fullPage: true });
    if (width === 1440) {
      await page.emulateMedia({ media: 'print' });
      assert.equal(await page.locator('.controls').evaluate(el => getComputedStyle(el).display), 'none');
      const pdf = await page.pdf({
        path: folder + '/poster-A4-proof.pdf',
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
      });
      assert.ok(pdf.length > 1000 && pdf.subarray(0, 4).toString() === '%PDF',
        'Generate a genuine A4 PDF proof for human print review');
    }
    assert.deepEqual(errors, [], 'No uncaught browser errors');
    checked.push({ width, result: 'passed' });
  } catch (error) {
    issues.push(width + 'px: ' + error.message);
  } finally {
    await page.close();
  }
}

const noScript = await browser.newContext({
  viewport: { width: 390, height: 844 },
  javaScriptEnabled: false,
});
const staticPage = await noScript.newPage();
try {
  await staticPage.goto(origin + route, { waitUntil: 'load' });
  assert.equal(await staticPage.locator('.sheet').isVisible(), true,
    'Original poster remains visible without JavaScript');
  assert.equal(await staticPage.locator('#press').isVisible(), false,
    'Inert controls must not appear when JavaScript is disabled');
  assert.equal(await staticPage.locator('.no-script-note').isVisible(), true,
    'Explain how to print the original impression without JavaScript');
  await staticPage.screenshot({ path: folder + '/no-javascript-390.png', fullPage: true });
  checked.push({ width: 390, mode: 'no JavaScript', result: 'passed' });
} catch (error) {
  issues.push('No JavaScript: ' + error.message);
} finally {
  await noScript.close();
}
await browser.close();
await writeFile(folder + '/report.json', JSON.stringify({ checked, issues }, null, 2));
console.log(JSON.stringify({ checked, issues }, null, 2));
if (issues.length) process.exitCode = 1;
