/* VELA HEALTH V4 / visual hierarchy + connected sample-booking regression QA. */
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.cwd()+'/.studio-qa-tools/node_modules/playwright');
const origin='http://127.0.0.1:8765',root='artifacts/studio-browser-qa';
await mkdir(root,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const views=[{name:'narrow-phone',width:320,height:740},{name:'phone',width:390,height:844},{name:'tablet',width:820,height:1080},{name:'desktop',width:1440,height:900}],issues=[],passed=[];
for(const size of views){
 const page=await browser.newPage({viewport:{width:size.width,height:size.height},deviceScaleFactor:1,hasTouch:size.width<=390});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const tag='vela-revamp-'+size.name;
 try{
  await page.goto(origin+'/projects/vela-health/index.html#home',{waitUntil:'domcontentloaded'});
  await page.locator('.vela-r4-cover').waitFor({state:'visible'});
  assert.ok((await page.locator('#vela-cover-title').innerText()).includes('Good care.'),'care-first hero');
  assert.equal(await page.locator('.vela-path-steps a').count(),3,'three visible functional care steps');
  assert.ok(await page.locator('.vela-promise').count(),'care promise visual section exists');
  const metrics=await page.evaluate(()=>{const h=document.querySelector('#vela-cover-title'),r=h.getBoundingClientRect(),body=document.body,html=document.documentElement;return {body:body.scrollWidth,html:html.scrollWidth,viewport:innerWidth,headlineWidth:r.width,headlineScroll:h.scrollWidth}});
  assert.ok(metrics.html<=size.width+4&&metrics.body<=size.width+4,'home has no horizontal overflow '+JSON.stringify(metrics));
  assert.ok(metrics.headlineScroll<=metrics.headlineWidth+8,'hero headline not clipped '+JSON.stringify(metrics));
  await page.screenshot({path:root+'/'+tag+'-home.png',fullPage:true,animations:'disabled',timeout:32000});
  if(size.width<=390){
   const nav=page.locator('#vela-nav'),menu=page.locator('#vela-mobile-menu');
   assert.ok(await menu.isVisible(),'mobile menu visible');
   await menu.click();assert.equal(await menu.getAttribute('aria-expanded'),'true','menu opens');
   assert.equal(await nav.getAttribute('data-open'),'true','mobile nav visible');
   await nav.locator('a[href="#doctors"]').click();
   await page.locator('[data-page="doctors"]').waitFor({state:'visible'});
   assert.equal(await menu.getAttribute('aria-expanded'),'false','menu closes when selecting route');
  }else{
   assert.ok(await page.locator('#vela-mobile-menu').isHidden(),'desktop navigation retained');
  }
  await page.goto(origin+'/projects/vela-health/index.html#home',{waitUntil:'domcontentloaded'});
  await page.locator('[data-vela-service="Women\'s health"]').click();
  assert.equal(await page.locator('[data-vela-service="Women\'s health"]').getAttribute('aria-pressed'),'true','care picker changes selection');
  await page.locator('#vela-care-book').click();
  await page.locator('[data-page="book"]').waitFor({state:'visible'});
  assert.equal(await page.locator('#service').inputValue(),"Women's health",'selected service carries into booking');
  assert.equal(await page.locator('#clinician').inputValue(),'micah','matching specialty clinician selected');
  assert.equal(await page.locator('#clinician option').count(),1,'cannot accidentally pick mismatched specialty');
  await page.locator('#visit-format').selectOption('Video call');
  await page.locator('#date').evaluate(el=>{const d=new Date(Date.now()+2*86400000),pad=n=>String(n).padStart(2,'0');el.value=[d.getFullYear(),pad(d.getMonth()+1),pad(d.getDate())].join('-');el.dispatchEvent(new Event('change',{bubbles:true}))});
  const first=page.locator('#slots button:not([disabled])').first();
  const time=await first.innerText();await first.click();
  assert.match(await page.locator('#booking-summary').innerText(),/Video call/,'visit format displayed in summary');
  const summaryAppearance=await page.locator('#booking-summary').evaluate(el=>{
    const background=getComputedStyle(el).backgroundColor,foreground=getComputedStyle(el.querySelector('b')).color;
    return {background,foreground};
  });
  assert.ok(summaryAppearance.background!=='rgb(255, 255, 255)'&&summaryAppearance.foreground==='rgb(255, 250, 252)','review selections use readable light text on a dark surface: '+JSON.stringify(summaryAppearance));
  await page.locator('#guest').fill('Sample Patient');
  await page.locator('#booking-form button[type="submit"]').click();
  await page.locator('[data-page="visits"]').waitFor({state:'visible'});
  assert.match(await page.locator('#visit-list').innerText(),/Video call/,'confirmation reflects chosen visit format');
  assert.match(await page.locator('#visit-list').innerText(),/Dr. Micah Patel/,'confirmation lists matching clinician');
  assert.match(await page.locator('#visit-list').innerText(),/Sample Patient/,'demo name displayed');
  await page.evaluate(()=>{location.hash='#book'});
  await page.locator('[data-page="book"]').waitFor({state:'visible'});
  assert.equal(await page.locator('#booking-message').innerText(),'','new booking flow must not retain last success message');
  await page.goto(origin+'/projects/vela-health/index.html#book',{waitUntil:'domcontentloaded'});
  await page.locator('#service').selectOption("Women's health");
  await page.locator('#date').evaluate(el=>{const d=new Date(Date.now()+2*86400000),pad=n=>String(n).padStart(2,'0');el.value=[d.getFullYear(),pad(d.getMonth()+1),pad(d.getDate())].join('-');el.dispatchEvent(new Event('change',{bubbles:true}))});
  const blocked=page.locator('#slots button[data-time="'+time+'"]');
  assert.ok(await blocked.isDisabled(),'double booking same clinician and sample slot blocked');
  if(size.width===390||size.width===1440){
   await page.screenshot({path:root+'/'+tag+'-booking.png',fullPage:true,animations:'disabled',timeout:30000});
  }
  page.on('dialog',d=>d.accept());
  if(size.width<=390){
   await page.locator('#vela-mobile-menu').click();
   await page.locator('#vela-nav a[href="#visits"]').click();
  }else await page.locator('a[href="#visits"]').first().click();
  await page.locator('[data-page="visits"]').waitFor({state:'visible'});
  await page.locator('#visit-list [data-cancel]').first().click();
  assert.match(await page.locator('#visit-list').innerText(),/No bookings yet/,'cancellation removes local sample booking');
  await page.goto(origin+'/projects/vela-health/index.html#book',{waitUntil:'domcontentloaded'});
  await page.locator('#service').selectOption("Women's health");
  await page.locator('#date').evaluate(el=>{const d=new Date(Date.now()+2*86400000),pad=n=>String(n).padStart(2,'0');el.value=[d.getFullYear(),pad(d.getMonth()+1),pad(d.getDate())].join('-');el.dispatchEvent(new Event('change',{bubbles:true}))});
  assert.ok(await page.locator('#slots button[data-time="'+time+'"]').isEnabled(),'cancelling frees the sample slot');
  await page.goto(origin+'/projects/vela-health/index.html#services',{waitUntil:'domcontentloaded'});
  await page.locator('[data-service-link="Wellbeing"]').click();
  await page.locator('[data-page="book"]').waitFor({state:'visible'});
  assert.equal(await page.locator('#service').inputValue(),'Wellbeing','service-card link carries selection into booking');
  assert.equal(await page.locator('#clinician').inputValue(),'noor','service-card link selects matching wellbeing clinician');
  for(const error of errors)issues.push(tag+' JS '+error);
  passed.push({tag,format:'Video call',dateAndSlot:'verified',pages:'home / book / visits'});
 }catch(error){issues.push(tag+' '+error.message)}
 finally{await page.close()}
}
await browser.close();
await writeFile(root+'/vela-health-revamp-report.json',JSON.stringify({passed,issues},null,2));
console.log(JSON.stringify({passed,issues},null,2));
if(issues.length)process.exitCode=1;
