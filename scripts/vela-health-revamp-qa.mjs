import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.cwd()+'/.studio-qa-tools/node_modules/playwright');
const root='artifacts/studio-browser-qa',origin='http://127.0.0.1:8765';
await mkdir(root,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const widths=[{name:'small-phone',width:320,height:740},{name:'phone',width:390,height:844},{name:'tablet',width:820,height:1024},{name:'desktop',width:1440,height:900}];
const errors=[],passed=[];
function checkLayout(m,tag){assert.ok(m.body<=m.width+4&&m.html<=m.width+4,tag+' horizontal overflow '+JSON.stringify(m));}
async function measure(page){return page.evaluate(()=>({width:innerWidth,body:document.body.scrollWidth,html:document.documentElement.scrollWidth}))}
for(const viewport of widths){
 const tag='vela-v5-'+viewport.name;
 const page=await browser.newPage({viewport:{width:viewport.width,height:viewport.height},deviceScaleFactor:1,hasTouch:viewport.width<=390});
 const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
 try{
  await page.goto(origin+'/projects/vela-health/#home',{waitUntil:'domcontentloaded',timeout:20000});
  await page.locator('.v5-hero').waitFor({state:'visible',timeout:15000});
  assert.match(await page.locator('#v5-home-title').innerText(),/Feel better/,'new VELA primary headline');
  assert.equal(await page.locator('.v5-why-grid article').count(),3,'three distinct reasons for care');
  assert.equal(await page.locator('.v5-care-choice').count(),3,'functional care selector has three choices');
  assert.equal(await page.locator('.vela-reel-top,.vela-kicker,.eyebrow,.micro,.v5-subtitle').count(),0,'no decorative subtitles or numbered overlines');
  checkLayout(await measure(page),tag+' home');
  const h=await page.locator('#v5-home-title').evaluate(el=>({width:el.clientWidth,scroll:el.scrollWidth}));
  assert.ok(h.scroll<=h.width+6,tag+' hero headline must not collide or clip '+JSON.stringify(h));
  await page.screenshot({path:root+'/'+tag+'-home.png',fullPage:true,animations:'disabled',timeout:30000});
  if(viewport.width<=720){
   const menu=page.locator('#vela-mobile-menu');
   assert.ok(await menu.isVisible(),'mobile menu visible');
   await menu.click();
   assert.equal(await menu.getAttribute('aria-expanded'),'true');
   assert.equal(await page.locator('#vela-nav').getAttribute('data-open'),'true');
   await page.locator('#vela-nav a[href="#doctors"]').click();
   await page.locator('[data-page="doctors"]').waitFor({state:'visible'});
   assert.equal(await menu.getAttribute('aria-expanded'),'false');
  }else assert.ok(await page.locator('#vela-mobile-menu').isHidden(),'desktop does not show mobile menu');
  await page.goto(origin+'/projects/vela-health/#home',{waitUntil:'domcontentloaded'});
  await page.locator('[data-vela-service="Women\'s health"]').click();
  assert.equal(await page.locator('[data-vela-service="Women\'s health"]').getAttribute('aria-pressed'),'true');
  await page.locator('#vela-care-book').click();
  await page.locator('[data-page="book"]').waitFor({state:'visible'});
  assert.equal(await page.locator('#service').inputValue(),"Women's health",'service selection persists into booking');
  assert.equal(await page.locator('#clinician').inputValue(),'micah','matched sample clinician by specialty');
  assert.equal(await page.locator('#clinician option').count(),1,'prevent mismatched clinician selection');
  await page.locator('#visit-format').selectOption('Video call');
  await page.locator('#date').evaluate(el=>{const d=new Date(Date.now()+2*86400000),pad=n=>String(n).padStart(2,'0');el.value=[d.getFullYear(),pad(d.getMonth()+1),pad(d.getDate())].join('-');el.dispatchEvent(new Event('change',{bubbles:true}))});
  const slot=page.locator('#slots button:not([disabled])').first();
  const time=await slot.innerText();await slot.click();
  assert.match(await page.locator('#booking-summary').innerText(),/Video call/,'live summary includes format');
  const summary=await page.locator('#booking-summary').evaluate(el=>({bg:getComputedStyle(el).backgroundColor,foreground:getComputedStyle(el.querySelector('b')).color}));
  assert.notEqual(summary.bg,'rgb(255, 255, 255)','summary contrast: dark panel for light text');
  assert.equal(summary.foreground,'rgb(255, 255, 255)','summary values remain legible');
  await page.locator('#guest').fill('Vela Sample Tester');
  await page.locator('#booking-form button[type="submit"]').click();
  await page.locator('[data-page="visits"]').waitFor({state:'visible'});
  assert.match(await page.locator('#visit-list').innerText(),/Video call/);
  assert.match(await page.locator('#visit-list').innerText(),/Vela Sample Tester/);
  assert.match(await page.locator('#visit-list').innerText(),/Dr. Micah Patel/);
  await page.goto(origin+'/projects/vela-health/#book',{waitUntil:'domcontentloaded'});
  await page.locator('#service').selectOption("Women's health");
  await page.locator('#date').evaluate(el=>{const d=new Date(Date.now()+2*86400000),pad=n=>String(n).padStart(2,'0');el.value=[d.getFullYear(),pad(d.getMonth()+1),pad(d.getDate())].join('-');el.dispatchEvent(new Event('change',{bubbles:true}))});
  assert.ok(await page.locator('#slots button[data-time="'+time+'"]').isDisabled(),'a booked time cannot be double-booked');
  checkLayout(await measure(page),tag+' book');
  if(viewport.width===390||viewport.width===1440)await page.screenshot({path:root+'/'+tag+'-booking.png',fullPage:true,animations:'disabled'});
  page.on('dialog',dlg=>dlg.accept());
  if(viewport.width<=720){
   await page.locator('#vela-mobile-menu').click();
   await page.locator('#vela-nav a[href="#visits"]').click();
  }else await page.locator('#vela-nav a[href="#visits"]').click();
  await page.locator('[data-page="visits"]').waitFor({state:'visible'});
  await page.locator('#visit-list [data-cancel]').first().click();
  assert.match(await page.locator('#visit-list').innerText(),/No bookings yet/,'cancel clears demo booking');
  await page.goto(origin+'/projects/vela-health/#book',{waitUntil:'domcontentloaded'});
  await page.locator('#service').selectOption("Women's health");
  await page.locator('#date').evaluate(el=>{const d=new Date(Date.now()+2*86400000),pad=n=>String(n).padStart(2,'0');el.value=[d.getFullYear(),pad(d.getMonth()+1),pad(d.getDate())].join('-');el.dispatchEvent(new Event('change',{bubbles:true}))});
  assert.ok(await page.locator('#slots button[data-time="'+time+'"]').isEnabled(),'cancellation frees chosen time');
  await page.goto(origin+'/projects/vela-health/#services',{waitUntil:'domcontentloaded'});
  await page.locator('[data-service-link="Wellbeing"]').click();
  await page.locator('[data-page="book"]').waitFor({state:'visible'});
  assert.equal(await page.locator('#service').inputValue(),'Wellbeing','service card preserves chosen service');
  assert.equal(await page.locator('#clinician').inputValue(),'noor','service card chooses matching clinician');
  for(const err of pageErrors)errors.push(tag+' JS '+err);
  passed.push({viewport:viewport.name,hero:true,subtitleFree:true,booking:true,serviceHandoff:true});
 }catch(e){errors.push(tag+' '+e.message)}
 finally{await page.close()}
}
for(const viewport of [widths[1],widths[3]]){
 const page=await browser.newPage({viewport:{width:viewport.width,height:viewport.height}});
 const tag='vela-case-v5-'+viewport.name;
 try{
  await page.goto(origin+'/work/vela-health/',{waitUntil:'domcontentloaded'});
  await page.locator('.v5c-hero').waitFor({state:'visible'});
  assert.equal(await page.locator('.micro,.eyebrow,.case-eyebrow,.v5-subtitle').count(),0,'case study has no decorative subtitles');
  assert.equal(await page.locator('.sx-journey').count(),4,'interactive case-study explorer offers four journeys');
  checkLayout(await measure(page),tag);
  await page.screenshot({path:root+'/'+tag+'.png',fullPage:true,animations:'disabled',timeout:30000});
  passed.push({viewport:viewport.name,caseStudy:true});
 }catch(e){errors.push(tag+' '+e.message)}
 finally{await page.close()}
}
await browser.close();
await writeFile(root+'/vela-v5-report.json',JSON.stringify({passed,errors},null,2));
console.log(JSON.stringify({passed,errors},null,2));
if(errors.length)process.exitCode=1;
