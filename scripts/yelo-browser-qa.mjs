import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require(process.cwd()+'/.studio-qa-tools/node_modules/playwright');
const origin='http://127.0.0.1:8765';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const errors=[],results=[];
await mkdir('artifacts/yelo',{recursive:true});
async function run(width,height){
 const page=await browser.newPage({viewport:{width,height}});
 const tag=width+'px';
 page.on('pageerror',e=>errors.push(tag+': '+e.message));
 try{
  await page.goto(origin+'/projects/yelo/',{waitUntil:'domcontentloaded',timeout:25000});
  await page.locator('#yelo-screen .balance-amount').waitFor({timeout:12000});
  const original=await page.locator('.balance-amount').first().innerText();
  assert.match(original,/24,500/,'initial fictional balance');
  assert.equal(await page.locator('.hero-card-wrap .graffiti-card').count(),1,'hero graffiti card exists');
  await page.locator('#yelo-screen [data-action="add"]').click();
  await page.locator('#demo-form input[name="amount"]').fill('600');
  await page.locator('#modal-submit').click();
  const topped=await page.locator('.balance-amount').first().innerText();
  assert.match(topped,/25,100/,'top-up updates balance');
  await page.locator('.phone-navbar [data-route="goals"]').click();
  await page.locator('#yelo-screen [data-action="save"]').click();
  await page.locator('#demo-form input[name="amount"]').fill('500');
  await page.locator('#modal-submit').click();
  assert.match(await page.locator('#yelo-screen').innerText(),/19,100/,'savings goal was funded');
  await page.locator('.phone-navbar [data-route="cards"]').click();
  await page.locator('#yelo-screen [data-action="freeze"]').click();
  assert.equal(await page.locator('#yelo-screen .card-frozen').count(),1,'card freeze toggles');
  await page.locator('.phone-navbar [data-route="move"]').click();
  await page.locator('#yelo-screen [data-action="send"]').click();
  await page.locator('#demo-form input[name="recipient"]').fill('Fictional Alex');
  await page.locator('#demo-form input[name="amount"]').fill('400');
  await page.locator('#modal-submit').click();
  assert.match(await page.locator('#yelo-screen').innerText(),/Fictional Alex/,'local transfer was recorded');
  await page.screenshot({path:'artifacts/yelo/website-'+tag+'.png',fullPage:true,timeout:20000});
  const metrics=await page.evaluate(()=>({viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth}));
  assert.ok(metrics.scrollWidth<=metrics.viewport+8,'No page overflow: '+JSON.stringify(metrics));
  results.push({tag,metrics});
 }finally{await page.close()}
}
await run(1440,900);
await run(390,840);
await run(320,740);
const casePage=await browser.newPage({viewport:{width:390,height:844}});
casePage.on('pageerror',e=>errors.push('case: '+e.message));
try{
 await casePage.goto(origin+'/work/yelo/',{waitUntil:'domcontentloaded'});
 await casePage.locator('.sd-showcase .sx-journey').first().waitFor({timeout:12000});
 assert.equal(await casePage.locator('.sd-showcase .sx-journey').count(),5);
 await casePage.locator('.sd-showcase .sx-journey').nth(3).click();
 assert.match((await casePage.locator('.sd-showcase iframe').first().getAttribute('src'))||'',/#cards/);
 await casePage.screenshot({path:'artifacts/yelo/case-phone.png',fullPage:true});
}finally{await casePage.close()}
await browser.close();
assert.equal(errors.length,0,'Browser JS exceptions: '+errors.join('; '));
console.log(JSON.stringify({results,errors},null,2));
