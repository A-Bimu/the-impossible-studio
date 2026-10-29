// Browser smoke checks for the fictional TERRA Spa draft.
// These checks exercise actual Chromium interactions; they do not publish the site.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const directory = path.dirname(fileURLToPath(import.meta.url));

// Serve only the two draft files needed by the browser, without a third-party server.
function startServer() {
  return createServer(async (request, response) => {
    const name = new URL(request.url, 'http://localhost').pathname.slice(1) || 'index.html';
    if (!['index.html', 'app.mjs'].includes(name)) {
      response.writeHead(404).end();
      return;
    }
    try {
      const data = await readFile(path.join(directory, name));
      response.writeHead(200, {
        'Content-Type': name.endsWith('.mjs') ? 'text/javascript; charset=utf-8' : 'text/html; charset=utf-8',
        'Cache-Control': 'no-store'
      });
      response.end(data);
    } catch {
      response.writeHead(500).end();
    }
  });
}

test('Chromium desktop and mobile: calendar, booking, persistence and focus', { timeout: 90000 }, async () => {
  const server = startServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = 'http://127.0.0.1:' + server.address().port + '/';
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const desktop = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const pageErrors = [];
    desktop.on('pageerror', error => pageErrors.push(error.message));
    await desktop.goto(address);

    // The week selector should keep one keyboard tab stop and preserve focus.
    const selected = desktop.locator('#week-days button[aria-pressed="true"]');
    assert.equal(await selected.count(), 1);
    await selected.focus();
    await desktop.keyboard.press('ArrowRight');
    assert.equal(await selected.count(), 1);
    assert.equal(await selected.evaluate(node => node === document.activeElement), true);
    await desktop.locator('#today').click();

    // The 90-minute ritual cannot start at 16:00, and the sample diary
    // leaves 15:00 as its only free start time on the selected day.
    await desktop.locator('#add-booking').click();
    assert.equal(await desktop.locator('#booking-dialog').evaluate(node => node.open), true);
    await desktop.locator('#booking-service').selectOption('ritual');
    assert.equal(await desktop.locator('#booking-time option[value="16:00"]').isDisabled(), true);
    assert.equal(await desktop.locator('#booking-time').inputValue(), '15:00');
    await desktop.locator('#guest').fill('Browser Demo Guest');
    await desktop.locator('#booking-submit').click();
    const guest = desktop.locator('#appointments button[aria-label*="Browser Demo Guest"]');
    await guest.waitFor();

    // Reload exercises actual localStorage persistence, not just the pure logic.
    await desktop.reload();
    await guest.waitFor();
    await guest.click();
    await desktop.locator('#mark-complete').click();
    await desktop.waitForFunction(() => document.activeElement?.id === 'selected-date');

    // A completed treatment is read-only; it cannot later be cancelled.
    await guest.click();
    assert.equal(await desktop.locator('#mark-complete').isDisabled(), true);
    assert.equal(await desktop.locator('#cancel-selected').isDisabled(), true);
    await desktop.locator('#close-detail').click();

    // Reset clears the test appointment; Escape returns focus to its trigger.
    await desktop.locator('#reset-demo').click();
    assert.equal(await guest.count(), 0);
    await desktop.locator('#add-booking').click();
    await desktop.keyboard.press('Escape');
    await desktop.waitForFunction(() => document.activeElement?.id === 'add-booking');
    assert.deepEqual(pageErrors, []);

    // Corrupt browser state must not silently restore a conflicting diary.
    await desktop.evaluate(() => {
      const key = 'terra-spa-demo-v1';
      const saved = JSON.parse(localStorage.getItem(key));
      saved.records.push({ ...saved.records[0], id: 'duplicate-slot', status: 'booked' });
      localStorage.setItem(key, JSON.stringify(saved));
    });
    await desktop.reload();
    assert.equal(await desktop.locator('#appointments .appointment').count(), 3);
    assert.deepEqual(pageErrors, []);

    // Check small phones, standard phones and tablets, including the modal.
    // The dialog must remain inside the visual viewport without sideways scroll.
    for (const width of [320, 375, 768]) {
      const page = await browser.newPage({
        viewport: { width, height: 812 }, isMobile: width < 600, hasTouch: width < 600
      });
      try {
        await page.goto(address);
        const checkLayout = async context => {
          const bounds = await page.evaluate(() => {
            const doc = document.documentElement;
            const dialog = document.querySelector('#booking-dialog');
            const rect = dialog.open ? dialog.getBoundingClientRect() : null;
            return {
              scroll: doc.scrollWidth, viewport: doc.clientWidth,
              dialog: rect ? { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom } : null,
              height: window.innerHeight
            };
          });
          assert.ok(bounds.scroll <= bounds.viewport + 1,
            context + ' horizontal overflow at ' + width + 'px: ' + JSON.stringify(bounds));
          if (bounds.dialog) {
            assert.ok(bounds.dialog.left >= -1 && bounds.dialog.right <= bounds.viewport + 1,
              context + ' dialog outside viewport at ' + width + 'px: ' + JSON.stringify(bounds));
            assert.ok(bounds.dialog.top >= -1 && bounds.dialog.bottom <= bounds.height + 1,
              context + ' dialog too tall at ' + width + 'px: ' + JSON.stringify(bounds));
          }
        };
        await checkLayout('Dashboard');
        await page.locator('#add-booking').click();
        assert.equal(await page.locator('#booking-dialog').evaluate(node => node.open), true);
        await checkLayout('Booking form');
        await page.locator('#close-booking').click();
        assert.equal(await page.locator('#booking-dialog').evaluate(node => node.open), false);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
  }
});
