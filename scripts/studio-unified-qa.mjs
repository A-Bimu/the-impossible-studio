import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.cwd()+'/.studio-qa-tools/node_modules/playwright');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const origin='http://127.0.0.1:8765',root='artifacts/studio-browser-qa';
await mkdir(root,{recursive:true});
const projects=[
 {slug:'stockwise',entry:'workspace.html',routes:['dashboard','sales','invoices','inventory','activity']},
 {slug:'vela-health',entry:'index.html',routes:['services','doctors','book','visits']},
 {slug:'mova',entry:'index.html',routes:['overview','shipments','track','new','dispatch']}
];
const viewports=[{name:'desktop',width:1440,height:900},{name:'tablet',width:820,height:1024},{name:'phone',width:390,height:844},{name:'small-phone',width:320,height:740}];
const issues=[],results=[];
for(const item of projects){
 for(const vp of viewports){
  const page=await browser.newPage({viewport:{width:vp.width,height:vp.height},hasTouch:vp.width<700,isMobile:vp.width<700});
  const tag=item.slug+'-unified-'+vp.name,errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  try{
   await page.goto(origin+'/work/'+item.slug+'/#responsive-views',{waitUntil:'domcontentloaded',timeout:20000});
   await page.locator('.sx-experience').waitFor({state:'visible',timeout:12000});
   await page.locator('.sx-experience').scrollIntoViewIfNeeded();
   const journeys=page.locator('.sx-journey');
   assert.equal(await journeys.count(),item.routes.length,'one journey per meaningful feature');
   assert.equal(await page.locator('.sd-grid-laptop,.sd-grid-phone').count(),0,'no eight redundant screenshots');
   assert.equal(await page.locator('.sx-live-frame').count(),1,'one real preview iframe');
   await page.waitForFunction(()=>document.querySelector('.sx-device')?.classList.contains('sx-ready'),null,{timeout:16000});
   const initialSrc=await page.locator('.sx-live-frame').getAttribute('src');
   assert.ok(initialSrc.includes(item.entry)&&initialSrc.endsWith('#'+item.routes[0]),'starts in a working route, not repeat homepage: '+initialSrc);
   const initialMode=await page.locator('.sx-device-area').getAttribute('data-device');
   assert.equal(initialMode,vp.width<=390?'phone':'laptop','responsive device defaults');
   const switchMode=vp.width<=390?'laptop':'phone';
   await page.locator('[data-device="'+switchMode+'"]').click();
   assert.equal(await page.locator('.sx-device-area').getAttribute('data-device'),switchMode,'device button changes presentation');
   assert.equal(await page.locator('.sx-live-frame').getAttribute('src'),initialSrc,'switching device does not reload in-progress demo');
   await page.locator('[data-device="'+initialMode+'"]').click();
   const next=item.routes.length-1;
   await page.locator('.sx-journey').nth(next).click();
   const selectedSrc=await page.locator('.sx-live-frame').getAttribute('src');
   assert.ok(selectedSrc.endsWith('#'+item.routes[next]),'feature rail changes the actual demo route: '+selectedSrc);
   assert.equal(await journeys.nth(next).getAttribute('aria-pressed'),'true','active journey accessible');
   await page.waitForFunction(()=>document.querySelector('.sx-device')?.classList.contains('sx-ready'),null,{timeout:16000});
   const openHref=await page.locator('.sx-open').getAttribute('href');
   assert.ok(openHref.endsWith('#'+item.routes[next]),'separate tab opens selected task');
   await page.locator('.sx-expand').click();
   const dialog=page.locator('dialog.sx-dialog');
   await dialog.waitFor({state:'visible',timeout:8000});
   assert.equal(await dialog.getAttribute('open'),'','accessible modal opens');
   const modalSrc=await page.locator('.sx-dialog-frame').getAttribute('src');
   assert.ok(modalSrc.endsWith('#'+item.routes[next]),'expanded demo matches selected task');
   const content=page.frameLocator('.sx-dialog-frame').locator('body');
   await content.waitFor({state:'visible',timeout:15000});
   assert.ok((await content.innerText()).trim().length>100,'expanded iframe contains real product content');
   await page.locator('.sx-dialog-close').click();
   await dialog.waitFor({state:'hidden'});
   assert.equal(await page.locator('.sx-live-frame').getAttribute('src'),selectedSrc,'close returns to same selected working scene');
   if(vp.width<=390){
    const dims=await page.evaluate(()=>({viewport:innerWidth,body:document.body.scrollWidth,html:document.documentElement.scrollWidth}));
    assert.ok(dims.body<=dims.viewport+4&&dims.html<=dims.viewport+4,'mobile case study has no unintended horizontal page scroll: '+JSON.stringify(dims));
   }
   if(vp.width===1440||vp.width===390){
    await page.locator('.sx-experience').scrollIntoViewIfNeeded();
    await page.screenshot({path:root+'/'+tag+'.png',animations:'disabled',timeout:30000});
   }
   for(const error of errors)issues.push(tag+' JS '+error);
   results.push({tag,preview:initialSrc,journey:selectedSrc,expanded:modalSrc});
  }catch(error){issues.push(tag+': '+error.message)}
  finally{await page.close()}
 }
}
await browser.close();
await writeFile(root+'/studio-unified-report.json',JSON.stringify({results,issues},null,2));
console.log(JSON.stringify({tested:results.map(r=>r.tag),issues},null,2));
if(issues.length)process.exitCode=1;
