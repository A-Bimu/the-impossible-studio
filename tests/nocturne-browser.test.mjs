import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';

const hotelUrl = pathToFileURL(fileURLToPath(
  new URL('../daily/2026-10-31-night-shift/index.html', import.meta.url)
)).href;

async function openHotel(browser, width) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  // The hotel is fictional. External illustrative photos are not required
  // to verify its local interactions and must not make CI network-dependent.
  await page.route(/^https?:\/\//, route => route.abort());
  await page.goto(hotelUrl, { waitUntil: 'domcontentloaded' });
  assert.equal(await page.locator('#roomGrid .room').count(), 3,
    'all three hotel rooms should render in a real browser');
  return page;
}

test('guest booking remains usable at narrow mobile widths without horizontal overflow', async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [320, 375]) {
      const page = await openHotel(browser, width);
      try {
        const sizes = await page.evaluate(() => ({
          viewport: window.innerWidth,
          document: document.documentElement.scrollWidth,
        }));
        assert.ok(sizes.document <= sizes.viewport + 1,
          `horizontal overflow at ${width}px: ${JSON.stringify(sizes)}`);
        assert.equal(await page.locator('#roomGrid .room button:not([disabled])').count(), 3);
        await page.locator('#guests').selectOption('4');
        assert.equal(await page.locator('#roomGrid .room button:not([disabled])').count(), 1,
          'four guests should only be able to select the suite');
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
});

test('keyboard booking focuses confirmation and restores focus when the dialog closes', async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await openHotel(browser, 375);
    try {
      const select = page.getByRole('button', { name: 'Select The Classic' });
      await select.focus();
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('#reservation').evaluate(el => el.open), true);
      assert.equal(await page.evaluate(() => document.activeElement.id), 'guestName');

      await page.locator('#guestName').fill('Studio Test Guest');
      await page.locator('#guestEmail').fill('guest@example.test');
      await page.getByRole('button', { name: 'Confirm demo reservation' }).click();
      assert.equal(await page.locator('#confirmation').isVisible(), true);
      assert.equal(await page.evaluate(() => document.activeElement.id), 'confirmation',
        'the confirmation must receive focus after its form is hidden');
      assert.match(await page.locator('#confirmation').innerText(), /no payment was taken/);

      await page.getByRole('button', { name: 'Close reservation' }).click();
      assert.equal(await page.locator('#reservation').evaluate(el => el.open), false);
      assert.equal(await select.evaluate(el => document.activeElement === el), true,
        'closing the modal should return focus to the original room button');
    } finally {
      await page.close();
    }
  } finally {
    await browser.close();
  }
});

test('invalid and cleared check-in dates cannot open a reservation dialog', async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await openHotel(browser, 375);
    try {
      const select = page.getByRole('button', { name: 'Select The Classic' });
      await page.locator('#checkin').fill('');
      const min = await page.locator('#checkout').getAttribute('min');
      assert.match(min ?? '', /^\d{4}-\d{2}-\d{2}$/);
      await select.click();
      assert.equal(await page.locator('#reservation').evaluate(el => el.open), false);
      assert.match(await page.locator('#searchStatus').innerText(), /valid stay/);

      await page.locator('#checkin').fill('2000-01-01');
      await page.locator('#checkout').fill('2000-01-03');
      await select.click();
      assert.equal(await page.locator('#reservation').evaluate(el => el.open), false,
        'a past stay must not be accepted through direct room selection');
    } finally {
      await page.close();
    }
  } finally {
    await browser.close();
  }
});
