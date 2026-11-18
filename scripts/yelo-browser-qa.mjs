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
  await page.locator('#yelo-screen .app-welcome').waitFor({timeout:12000});
  await page.locator('#yelo-screen [data-action="add"]').waitFor({timeout:12000});
  const original=await page.locator('.balance-amount').first().innerText();
  assert.match(original,/24,500/,'initial fictional balance');
  assert.equal(await page.locator('.hero-card-wrap .yelo-card-core').count(),1,'motion-enabled hero card exists');
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
  await page.locator('#yelo-screen [data-action="send"]').first().click();
  await page.locator('#demo-form input[name="recipient"]').fill('Fictional Alex');
  await page.locator('#demo-form input[name="amount"]').fill('400');
  await page.locator('#modal-submit').click();
  assert.match(await page.locator('#yelo-screen').innerText(),/Fictional Alex/,'local transfer was recorded');
  const bodyBackground=await page.evaluate(()=>getComputedStyle(document.body).backgroundColor);
  assert.equal(bodyBackground,'rgb(8, 7, 16)','ink-black YELO website background at '+tag);
  const photo=await page.locator('.hero-person').evaluate(img=>({src:img.currentSrc,loaded:img.complete && img.naturalWidth>0}));
  assert.match(photo.src,/1770283553879/,'real Nairobi street fashion photography');
  assert.equal(await page.locator('.edition-topline, .subhead, .section-no, .micro, .photo-credit, figcaption').count(),0,'No visible editorial overlines, photo captions or section numbers at '+tag);
  const divider=await page.locator('.feature-row').first().evaluate(el=>({top:getComputedStyle(el).borderTopWidth,bottom:getComputedStyle(el).borderBottomWidth}));
  assert.deepEqual(divider,{top:'0px',bottom:'0px'},'No feature row divider lines at '+tag);
  if(width===1440){
   const card=page.locator('.card-feature .yelo-card-stage');
   await card.scrollIntoViewIfNeeded();
   const b=await card.boundingBox();
   assert.ok(b?.width>120,'interactive card is sized realistically');
   await page.mouse.move(b.x+b.width*.72,b.y+b.height*.48);
   await page.waitForTimeout(140);
   const tilt=await card.evaluate(el=>el.style.getPropertyValue('--tilt-y'));
   assert.ok(Math.abs(parseFloat(tilt))>1,'card moves in 3D on pointer motion: '+tilt);
   const flip=page.locator('.card-feature [data-card-flip]');
   await flip.click();
   assert.ok(await page.locator('.card-feature .yelo-card-showcase.is-flipped').count(),'card rotates to show back');
   assert.equal(await flip.getAttribute('aria-pressed'),'true','flip state is accessible');
   assert.match(await page.locator('.card-feature .yelo-card-back-graffiti').innerText(),/STAY LOUD!/,'Streetwise graffiti lettering appears on card back');
   assert.match(await page.locator('.card-feature .yelo-card-back .signature').innerText(),/AMANI W/,'Physical signature panel included');
   await page.waitForTimeout(1050);
   const backTurn=await card.evaluate(el=>new DOMMatrixReadOnly(getComputedStyle(el.querySelector('.yelo-card-core')).transform).m11);
   assert.ok(backTurn < -.9,'Card back faces viewer after completing 3D flip');
   const backShot=await page.locator('.card-feature .yelo-card-stage').screenshot({path:'artifacts/yelo/realistic-card-back.png',timeout:20000});
   await flip.click();
   assert.equal(await flip.getAttribute('aria-pressed'),'false','card can return to front');
   assert.match(await page.locator('.card-feature .yelo-front-graffiti').innerText(),/MAKE[\s\S]*MOVES/,'Front of physical card contains actual graffiti words');
   await page.waitForTimeout(1050);
   const frontTurn=await card.evaluate(el=>new DOMMatrixReadOnly(getComputedStyle(el.querySelector('.yelo-card-core')).transform).m11);
   assert.ok(frontTurn > .9,'Card front faces viewer after returning');
   const frontShot=await page.locator('.card-feature .yelo-card-stage').screenshot({path:'artifacts/yelo/realistic-card-front.png',timeout:20000});
   assert.notDeepEqual(frontShot,backShot,'Card back must look visibly different from the front');
   const pause=page.locator('.card-feature [data-card-pause]');
   await pause.click();
   assert.equal(await pause.getAttribute('aria-pressed'),'true','autoplay can be paused');
   await pause.click();
  }
  await page.screenshot({path:'artifacts/yelo/website-'+tag+'.png',fullPage:true,timeout:20000});
  const metrics=await page.evaluate(()=>({viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth}));
  assert.ok(metrics.scrollWidth<=metrics.viewport+8,'No page overflow: '+JSON.stringify(metrics));
  results.push({tag,metrics});
 }finally{await page.close()}
}
await run(1440,900);
await run(390,840);
await run(320,740);
for(const slug of ['money','card','culture']){
 const page=await browser.newPage({viewport:{width:390,height:844}});
 page.on('pageerror',e=>errors.push(slug+': '+e.message));
 try{
  const resp=await page.goto(origin+'/projects/yelo/'+slug+'.html',{waitUntil:'domcontentloaded',timeout:25000});
  assert.equal(resp?.status(),200,'working '+slug+' page');
  assert.ok(await page.locator('main h1').isVisible(),slug+' has main headline');
  await page.locator('#menu-toggle').click();
  assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'true','mobile navigation opens on '+slug);
  assert.ok(await page.locator('#site-nav').isVisible(),slug+' has visible mobile navigation');
  await page.locator('#menu-toggle').click();
  const metrics=await page.evaluate(()=>({viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
  assert.ok(metrics.scrollWidth<=metrics.viewport+8,slug+' has no mobile overflow: '+JSON.stringify(metrics));
  const bodyBg=await page.evaluate(()=>getComputedStyle(document.body).backgroundColor);
  assert.equal(bodyBg,'rgb(8, 7, 16)','no cream, nude or beige page background on '+slug);
  assert.equal(await page.locator('figcaption, .subhead, .section-no').count(),0,'No image captions or editorial numbering on '+slug);
  if(slug==='card'){
   await page.locator('.big-product .yelo-card-stage').waitFor({timeout:8000});
   const flip=page.locator('.big-product [data-card-flip]');
   await flip.click();
   assert.equal(await flip.getAttribute('aria-pressed'),'true','tap flips physical card');
   await flip.click();
   assert.equal(await flip.getAttribute('aria-pressed'),'false','tap returns to front');
  }
  await page.screenshot({path:'artifacts/yelo/'+slug+'-phone.png',fullPage:true,timeout:20000});
  results.push({page:slug,metrics});
 }finally{await page.close()}
}
const casePage=await browser.newPage({viewport:{width:390,height:844}});
casePage.on('pageerror',e=>errors.push('case: '+e.message));
try{
 await casePage.goto(origin+'/work/yelo/',{waitUntil:'domcontentloaded'});
 await casePage.locator('.sd-showcase .sx-journey').first().waitFor({timeout:12000});
 await casePage.locator('.card-display-grid [data-card-flip]').waitFor({timeout:10000});
 assert.equal(await casePage.locator('.folio,.chapter-num,figcaption,.fact-strip').count(),0,'Case study removes captions and numbered metadata dividers');
 assert.equal(await casePage.evaluate(()=>getComputedStyle(document.body).backgroundColor),'rgb(8, 6, 17)','case study is ink black');
 assert.equal(await casePage.locator('.sd-showcase .sx-journey').count(),5);
 await casePage.locator('.sd-showcase .sx-journey').nth(3).click();
 assert.match((await casePage.locator('.sd-showcase iframe').first().getAttribute('src'))||'',/#cards/);
 await casePage.screenshot({path:'artifacts/yelo/case-phone.png',fullPage:true});
}finally{await casePage.close()}
const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
try{
 await reduced.goto(origin+'/projects/yelo/card.html',{waitUntil:'domcontentloaded'});
 await reduced.locator('.big-product .yelo-card-shell').waitFor({timeout:8000});
 const animation=await reduced.locator('.big-product .yelo-card-shell').evaluate(el=>getComputedStyle(el).animationName);
 assert.equal(animation,'none','card motion respects reduced-motion preference');
 const flip=reduced.locator('.big-product [data-card-flip]');
 await flip.click();
 assert.equal(await flip.getAttribute('aria-pressed'),'true','reduced-motion user can still flip the card');
}finally{await reduced.close()}
await browser.close();
assert.equal(errors.length,0,'Browser JS exceptions: '+errors.join('; '));
console.log(JSON.stringify({results,errors},null,2));
