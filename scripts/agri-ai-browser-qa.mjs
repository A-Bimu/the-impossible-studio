import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require(process.cwd()+'/.studio-qa-tools/node_modules/playwright');
const origin='http://127.0.0.1:8765';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const errors=[],results=[];
await mkdir('artifacts/agri-ai',{recursive:true});
async function openPage(url,width=390,height=840){
 const page=await browser.newPage({viewport:{width,height}});
 page.on('pageerror',e=>errors.push(url+' '+e.message));
 const res=await page.goto(origin+url,{waitUntil:'domcontentloaded',timeout:25000});
 assert.equal(res?.status(),200,'Page responds '+url);
 return page;
}
async function checkOverflow(page,tag){
 const x=await page.evaluate(()=>({viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,bg:getComputedStyle(document.body).backgroundColor}));
 assert.ok(x.scrollWidth<=x.viewport+8,tag+' overflow '+JSON.stringify(x));
 assert.equal(x.bg,'rgb(8, 14, 34)',tag+' keeps true navy (not cream/nude)');
 return x;
}
for(const width of [1440,390,320]){
 const page=await openPage('/projects/agri-ai/',width,width===1440?900:820);
 try{
  assert.ok(await page.locator('.hero h1').isVisible());
  for(const slug of ['crop-check','farm-planner','market-guide'])assert.ok(await page.locator('a[href="'+slug+'.html"]').count()>=1);
  if(width<800){
   await page.locator('#menu-toggle').click();
   assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'true');
   assert.ok(await page.locator('#main-menu').isVisible());
   await page.locator('#menu-toggle').click();
  }
  await page.locator('[data-preview="farm-planner"]').click();
  assert.match((await page.locator('#agri-preview').getAttribute('src'))||'',/farm-planner\.html\?embed=1/);
  await page.locator('[data-preview="market-guide"]').click();
  assert.match((await page.locator('#agri-preview').getAttribute('src'))||'',/market-guide\.html\?embed=1/);
  const metrics=await checkOverflow(page,'landing '+width);
  await page.screenshot({path:'artifacts/agri-ai/landing-'+width+'.png',fullPage:true,timeout:25000});
  results.push({screen:'landing',width,...metrics});
 }finally{await page.close()}
}
{
 const page=await openPage('/projects/agri-ai/crop-check.html');
 try{
  await page.locator('#crop-name').selectOption('tomato');
  await page.locator('#crop-county').selectOption('Kisii');
  await page.locator('#crop-symptom').selectOption('holes');
  await page.locator('#crop-form button[type=submit]').click();
  const output=await page.locator('#crop-result').innerText();
  assert.match(output,/Holes or chewed edges/);
  assert.match(output,/tomato/);
  assert.match(output,/Kisii/);
  assert.match(output,/No image recognition or live agricultural model ran/);
  assert.match(output,/extension worker/);
  const svg=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><rect width="20" height="20" fill="#ffca18"/></svg>');
  await page.locator('#crop-photo').setInputFiles({name:'crop-reference.svg',mimeType:'image/svg+xml',buffer:svg});
  await page.locator('#crop-preview img').waitFor({timeout:7000});
  assert.match((await page.locator('#crop-preview img').getAttribute('alt'))||'',/not analysed by AI/);
  await checkOverflow(page,'crop-check');
  await page.screenshot({path:'artifacts/agri-ai/crop-check-390.png',fullPage:true,timeout:25000});
  results.push({screen:'crop-check'});
 }finally{await page.close()}
}
{
 const page=await openPage('/projects/agri-ai/farm-planner.html?stage=growing');
 try{
  await page.locator('#plan-tasks .checklist input').first().waitFor({timeout:10000});
  assert.equal(await page.locator('#plan-tasks .checklist input').count(),4);
  await page.locator('#plan-tasks .checklist input').first().check();
  assert.match(await page.locator('#plan-status').innerText(),/1 of 4/);
  await page.reload({waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('#plan-tasks .checklist input').first().isChecked(),true,'local farm progress persists after page reload');
  await checkOverflow(page,'farm-planner');
  await page.screenshot({path:'artifacts/agri-ai/farm-planner-390.png',fullPage:true,timeout:25000});
  results.push({screen:'farm-planner'});
 }finally{await page.close()}
}
{
 const page=await openPage('/projects/agri-ai/market-guide.html');
 try{
  assert.match(await page.locator('#market-result').innerText(),/10,500/,'250kg * 42 example calculation');
  await page.locator('#market-qty').fill('100');
  await page.locator('#market-price').fill('50');
  assert.match(await page.locator('#market-result').innerText(),/5,000/);
  assert.match(await page.locator('#market-result').innerText(),/not profit/i);
  assert.match(await page.locator('#market-result').innerText(),/not current Kenyan market prices/i);
  await checkOverflow(page,'market-guide');
  await page.screenshot({path:'artifacts/agri-ai/market-guide-390.png',fullPage:true,timeout:25000});
  results.push({screen:'market-guide'});
 }finally{await page.close()}
}
{
 const page=await openPage('/work/agri-ai/',390,840);
 try{
  await page.locator('.unified .sx-journey').first().waitFor({timeout:15000});
  assert.equal(await page.locator('.unified .sx-journey').count(),5);
  await page.locator('.unified .sx-journey').nth(4).click();
  assert.match((await page.locator('.unified iframe').first().getAttribute('src'))||'',/symptom=holes/);
  await checkOverflow(page,'Studio case study');
  await page.screenshot({path:'artifacts/agri-ai/case-study-390.png',fullPage:true,timeout:25000});
  results.push({screen:'case-study'});
 }finally{await page.close()}
}
await browser.close();
assert.deepEqual(errors,[],'No uncaught browser exceptions');
console.log(JSON.stringify({results,errors},null,2));