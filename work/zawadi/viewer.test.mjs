// Real-browser QA for the fictional Zawadi 28-screen presentation.
// Only reads the concept files; does not deploy, alter originals or process payments.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const directory = path.dirname(fileURLToPath(import.meta.url));
const allowed = new Set(['index.html', 'viewer.js', 'viewer.css']);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

function startServer() {
  return createServer(async (request, response) => {
    const name = new URL(request.url, 'http://localhost').pathname.slice(1) || 'index.html';
    if (!allowed.has(name)) {
      response.writeHead(404).end();
      return;
    }
    try {
      const data = await readFile(path.join(directory, name));
      response.writeHead(200, { 'Content-Type': types[path.extname(name)] + '; charset=utf-8' });
      response.end(data);
    } catch {
      response.writeHead(500).end();
    }
  });
}

test('Zawadi screen explorer: original cards, arrows, boundaries, Escape, and mobile', { timeout: 90000 }, async () => {
  const server = startServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const base = 'http://127.0.0.1:' + server.address().port + '/';
    const screenshotDir = process.env.ZAWADI_QA_SCREENSHOTS;
    if (screenshotDir) await mkdir(screenshotDir, { recursive: true });

    for (const width of [320, 375, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 800 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      try {
        await page.goto(base, { waitUntil: 'domcontentloaded' });
        const triggers = page.locator('.gallery > .screencard > .zawadi-inspect');
        assert.equal(await triggers.count(), 28, 'Every original screen must have an inspect control');
        assert.equal(await page.locator('.gallery > .screencard').count(), 28);

        const first = triggers.first();
        await first.click();
        const dialog = page.locator('dialog.zawadi-viewer');
        assert.equal(await dialog.evaluate(node => node.open), true);
        assert.equal(await page.locator('.zawadi-viewer__count').textContent(), 'Screen 1 of 28');
        assert.equal(await page.locator('.zawadi-viewer__previous').isDisabled(), true);
        assert.equal(await page.locator('.zawadi-viewer__screen .device').count(), 1);
        assert.equal(await page.locator('.zawadi-viewer__close').evaluate(node => node === document.activeElement), true);

        const picker = page.locator('.zawadi-viewer__jump-select');
        assert.equal(await picker.locator('option').count(), 28, 'Picker lists every original screen');
        assert.equal(await picker.inputValue(), '0');
        assert.equal(await picker.evaluate(node => {
          const arrow = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
          node.dispatchEvent(arrow);
          return arrow.defaultPrevented;
        }), false, 'Picker arrow keys retain native keyboard behavior');
        await picker.selectOption('14');
        assert.equal(await page.locator('.zawadi-viewer__count').textContent(), 'Screen 15 of 28');
        assert.equal(await page.locator('#zawadi-viewer-title').textContent(),
          await page.locator('.gallery > .screencard .screen-caption h3').nth(14).textContent());
        await picker.selectOption('0');
        assert.equal(await page.locator('.zawadi-viewer__count').textContent(), 'Screen 1 of 28');
        await page.locator('.zawadi-viewer__close').focus();

        const rect = await dialog.boundingBox();
        assert.ok(rect && rect.x >= -1 && rect.x + rect.width <= width + 1,
          'Dialog should fit ' + width + 'px viewport: ' + JSON.stringify(rect));
        assert.ok(rect.y >= -1 && rect.y + rect.height <= 801,
          'Dialog should fit viewport height: ' + JSON.stringify(rect));
        if (screenshotDir) await page.screenshot({
          path: path.join(screenshotDir, 'zawadi-' + width + '-screen-viewer.png')
        });

        await page.keyboard.press('ArrowRight');
        assert.equal(await page.locator('.zawadi-viewer__count').textContent(), 'Screen 2 of 28');
        assert.equal(await picker.inputValue(), '1', 'Picker follows arrow navigation');
        assert.equal(await page.locator('.zawadi-viewer__previous').isEnabled(), true);
        await page.keyboard.press('ArrowLeft');
        assert.equal(await page.locator('.zawadi-viewer__count').textContent(), 'Screen 1 of 28');
        await page.keyboard.press('Escape');
        assert.equal(await dialog.evaluate(node => node.open), false);
        assert.equal(await first.evaluate(node => node === document.activeElement), true,
          'Closing should restore focus to the opening screen');

        const last = triggers.last();
        await last.click();
        assert.equal(await page.locator('.zawadi-viewer__count').textContent(), 'Screen 28 of 28');
        assert.equal(await picker.inputValue(), '27', 'Picker follows direct card selection');
        assert.equal(await page.locator('.zawadi-viewer__next').isDisabled(), true);
        await page.keyboard.press('ArrowRight');
        assert.equal(await page.locator('.zawadi-viewer__count').textContent(), 'Screen 28 of 28');
        await page.locator('.zawadi-viewer__previous').click();
        assert.equal(await page.locator('.zawadi-viewer__count').textContent(), 'Screen 27 of 28');
        await page.locator('.zawadi-viewer__close').click();
        assert.equal(await last.evaluate(node => node === document.activeElement), true);
        assert.deepEqual(errors, [], 'No uncaught browser errors at ' + width + 'px');
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
  }
});
