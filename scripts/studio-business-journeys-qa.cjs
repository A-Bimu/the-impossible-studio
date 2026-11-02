/* End-to-end QA for the three published fictional business demos.
   Runs against a local checkout server, never against production.
   Each journey gets an isolated browser context and localStorage. */
'use strict';
const assert = require('node:assert/strict');
const {mkdir, writeFile} = require('node:fs/promises');
const {chromium} = require(process.cwd() + '/.studio-qa-tools/node_modules/playwright');
const origin = 'http://127.0.0.1:8765';
const output = 'artifacts/studio-browser-qa/journeys';
const sizes = [{name:'desktop',width:1440,height:900},{name:'phone',width:390,height:844}];
const results = [], issues = [];

async function go(page, hash, selector) {
  await page.evaluate(value => { location.hash = value; }, hash);
  await page.locator(selector).waitFor({state:'visible'});
}

async function stockwise(page) {
  await page.goto(origin + '/projects/stockwise/#inventory', {waitUntil:'domcontentloaded'});
  await page.locator('[data-view="inventory"]').waitFor({state:'visible'});
  const row = page.locator('#products tr').filter({hasText:'Everyday notebook'});
  assert.match(await row.innerText(), /44/);
  await go(page, '#invoices', '[data-view="invoices"]');
  await page.locator('[data-view="invoices"] [data-open="invoice"]').click();
  await page.locator('#f-customer').selectOption('Alex Morgan');
  await page.locator('#f-product').selectOption('1');
  await page.locator('#f-qty').fill('2');
  await page.locator('#entry-form button[type="submit"]').click();
  assert.equal(await page.locator('#form-modal').evaluate(dialog => dialog.open), false);
  const invoice = page.locator('#invoices tr').first();
  assert.match(await invoice.innerText(), /#SW-1004/);
  assert.match(await invoice.innerText(), /Pending/);
  await invoice.locator('[data-paid]').click();
  assert.match(await invoice.innerText(), /Paid/);
  await go(page, '#inventory', '[data-view="inventory"]');
  assert.match(await row.innerText(), /42/);
  await page.reload({waitUntil:'domcontentloaded'});
  assert.match(await row.innerText(), /42/);
  page.once('dialog', dialog => dialog.accept());
  await page.locator('#reset').click();
  assert.match(await row.innerText(), /44/);
  return 'Create invoice, deduct stock, mark paid, persist after reload, reset demo';
}

async function vela(page) {
  await page.goto(origin + '/projects/vela-health/#book', {waitUntil:'domcontentloaded'});
  await page.locator('#booking-form').waitFor({state:'visible'});
  await page.locator('#guest').fill('Studio Journey Tester');
  await page.locator('#slots button:not([disabled])').first().click();
  await page.locator('#booking-form button[type="submit"]').click();
  await page.locator('[data-page="visits"]').waitFor({state:'visible'});
  assert.match(await page.locator('#visit-list').innerText(), /Studio Journey Tester/);
  await page.reload({waitUntil:'domcontentloaded'});
  assert.match(await page.locator('#visit-list').innerText(), /Studio Journey Tester/);
  await page.locator('#visit-list [data-cancel]').click();
  assert.match(await page.locator('#visit-list').innerText(), /No bookings yet/);
  await go(page, '#book', '[data-page="book"]');
  assert.equal(await page.locator('#slots button:not([disabled])').count(), 6);
  return 'Book fictional visit, persist after reload, cancel, release time slot';
}

async function mova(page) {
  await page.goto(origin + '/projects/mova/#new', {waitUntil:'domcontentloaded'});
  await page.locator('#new-form').waitFor({state:'visible'});
  await page.locator('#sender').fill('Nairobi');
  await page.locator('#destination').fill('Kisumu');
  await page.locator('#recipient').fill('Studio Journey Tester');
  await page.locator('#description').fill('Sample notebooks');
  await page.locator('#new-form button[type="submit"]').click();
  await page.locator('[data-page="track"]').waitFor({state:'visible'});
  const code = await page.locator('#tracking-code').inputValue();
  assert.match(code, /^MOV-\d+$/);
  assert.match(await page.locator('#tracking-result').innerText(), /Booked/);
  await go(page, '#dispatch', '[data-page="dispatch"]');
  const action = page.locator('#manifest [data-next="' + code + '"]');
  await action.click();
  assert.match(await action.innerText(), /Mark delivered/);
  await page.reload({waitUntil:'domcontentloaded'});
  assert.match(await action.innerText(), /Mark delivered/);
  await action.click();
  assert.equal(await action.isDisabled(), true);
  await go(page, '#track', '[data-page="track"]');
  await page.locator('#tracking-code').fill(code);
  await page.locator('#track-button').click();
  assert.match(await page.locator('#tracking-result').innerText(), /Delivered/);
  return 'Create shipment, track, dispatch, persist, deliver';
}

async function main() {
  await mkdir(output, {recursive:true});
  const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
  try {
    for (const size of sizes) {
      for (const [name, journey] of [['stockwise',stockwise],['vela-health',vela],['mova',mova]]) {
        const tag = name + '-' + size.name;
        const context = await browser.newContext({viewport:{width:size.width,height:size.height}});
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        try {
          const detail = await journey(page);
          assert.deepEqual(errors, [], 'Uncaught page errors');
          results.push({tag,passed:true,detail});
        } catch (error) {
          issues.push(tag + ': ' + error.message);
          try { await page.screenshot({path:output + '/' + tag + '-failure.png',fullPage:true,timeout:8000}); } catch {}
          results.push({tag,passed:false});
        } finally {
          await context.close();
        }
      }
    }
  } finally { await browser.close(); }
  await writeFile(output + '/report.json', JSON.stringify({results,issues},null,2));
  console.log(JSON.stringify({results,issues},null,2));
  if (issues.length) process.exitCode = 1;
}
main().catch(error => { console.error(error); process.exitCode = 1; });
