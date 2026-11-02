import assert from 'node:assert/strict';
import {mkdir, writeFile, stat} from 'node:fs/promises';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {chromium} = require(process.cwd()+'/.studio-qa-tools/node_modules/playwright');
const base = 'http://127.0.0.1:8765';
const route = '/drafts/2026-11-02-what-remains/';
const output = 'artifacts/what-remains-qa';
await mkdir(output,{recursive:true});
const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
const results = [];
const widths = [1440,390,320];

try {
  for (const width of widths) {
    const page = await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1});
    const errors = [];
    page.on('pageerror',error=>errors.push(error.message));
    try {
      const response = await page.goto(base+route,{waitUntil:'load'});
      assert.equal(response.status(),200);
      const words = page.locator('.word');
      const total = await words.count();
      assert.ok(total >= 70,'original passage is interactive');
      assert.equal(await page.locator('#reveal').isDisabled(),true);
      await words.nth(0).click();
      await words.nth(5).click();
      assert.equal(await page.locator('#count').innerText(),'2 words kept');
      assert.equal(await page.locator('#reveal').isEnabled(),true);
      await page.locator('#reveal').click();
      assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('preview')),true);
      assert.equal(await page.locator('#source').evaluate(el=>el.inert),true);
      assert.equal(await page.locator('#poem-result').evaluate(el=>document.activeElement===el),true);
      assert.ok((await page.locator('#poem-result').innerText()).trim().length>2);
      await page.screenshot({path:output+'/preview-'+width+'.png',fullPage:true,animations:'disabled'});
      if(width===1440){
        await page.pdf({path:output+'/what-remains-a4.pdf',format:'A4',printBackground:true});
        assert.ok((await stat(output+'/what-remains-a4.pdf')).size>1000);
      }
      await page.locator('#reveal').click();
      assert.equal(await page.locator('#source').evaluate(el=>el.inert),false);
      assert.equal(await words.nth(5).evaluate(el=>document.activeElement===el),true,'edit restores last selected word focus');
      await words.nth(5).press('Space');
      assert.equal(await page.locator('#count').innerText(),'1 word kept');
      await page.locator('#reset').click();
      assert.equal(await page.locator('#count').innerText(),'0 words kept');
      assert.equal(await page.locator('#reveal').isDisabled(),true);
      const dimensions=await page.evaluate(()=>({viewport:innerWidth,body:document.body.scrollWidth,html:document.documentElement.scrollWidth}));
      assert.ok(dimensions.body<=dimensions.viewport+4 && dimensions.html<=dimensions.viewport+4,'no horizontal overflow '+JSON.stringify(dimensions));
      assert.deepEqual(errors,[],'no browser script errors');
      results.push({width,words:total,passed:true,dimensions});
    } finally {await page.close();}
  }
  const page=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
  try{
    await page.goto(base+route);
    assert.equal(await page.locator('.word').count(),0);
    assert.match(await page.locator('#source').innerText(),/At the edge of the city/);
    assert.match(await page.locator('noscript').innerText(),/Enable JavaScript/);
    results.push({javascript:false,passed:true});
  } finally {await page.close();}
} finally {
  await browser.close();
  await writeFile(output+'/report.json',JSON.stringify(results,null,2));
}
console.log(JSON.stringify(results,null,2));
