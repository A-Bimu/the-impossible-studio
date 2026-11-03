import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.cwd()+'/.studio-qa-tools/node_modules/playwright');
const origin='http://127.0.0.1:8765';
const root='artifacts/studio-browser-qa';
await mkdir(root,{recursive:true});
const issues=[],results=[];
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const sizes=[{name:'desktop',width:1440,height:900},{name:'tablet',width:820,height:1080},{name:'phone',width:390,height:844}];
const routes=[
 {slug:'stockwise',url:'/projects/stockwise/',ready:'.sw-campaign',images:['.sw-hero-photo img','.sw-product-photo img']},
 {slug:'vela-health',url:'/projects/vela-health/',ready:'.vela-cover',images:['.vela-photo-large img','.vela-portrait-image img']},
 {slug:'mova',url:'/projects/mova/',ready:'.mova-cinematic-hero',images:['.mova-cinematic-photo img','.mova-journal-photo img']}
];
async function inspect(page,tag){
 const metrics=await page.evaluate(()=>({viewport:innerWidth,body:document.body.scrollWidth,html:document.documentElement.scrollWidth,top:document.documentElement.scrollHeight,images:[...document.images].filter(i=>i.getBoundingClientRect().width>0&&i.getBoundingClientRect().height>0).map(i=>({src:i.currentSrc||i.src,ready:i.complete&&i.naturalWidth>0}))}));
 if(metrics.html>metrics.viewport+4||metrics.body>metrics.viewport+4)issues.push(tag+' horizontal overflow '+JSON.stringify({html:metrics.html,body:metrics.body,viewport:metrics.viewport}));
 const hidden=await page.locator('[data-reveal]').evaluateAll(els=>els.filter(el=>{const css=getComputedStyle(el),r=el.getBoundingClientRect();return r.width>10&&r.height>10&&Number(css.opacity)<.8}).length);
 if(hidden)issues.push(tag+' revealed content is still visually hidden ('+hidden+' sections)');
 return metrics;
}
async function capture(page,tag,ready){
 await page.locator(ready).first().waitFor({state:'visible',timeout:8000});
 const height=await page.evaluate(()=>document.documentElement.scrollHeight);
 const windowHeight=page.viewportSize().height;
 for(let y=0;y<height;y+=Math.max(500,windowHeight*.8)){await page.evaluate(v=>scrollTo(0,v),y);await page.waitForTimeout(85)}
 await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(600);
 await page.screenshot({path:root+'/'+tag+'.png',fullPage:true,animations:'disabled',timeout:30000});
 const m=await inspect(page,tag);
 results.push({tag,metrics:m});
}
for(const item of routes){
 for(const size of sizes){
  const page=await browser.newPage({viewport:{width:size.width,height:size.height},deviceScaleFactor:1,hasTouch:size.name==='phone',isMobile:size.name==='phone'});
  const tag=item.slug+'-'+size.name;
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto(origin+item.url,{waitUntil:'domcontentloaded',timeout:15000});
   await capture(page,tag,item.ready);
   for(const error of errors)issues.push(tag+' JS error '+error);
   const valid=await page.locator(item.images[0]).evaluate(img=>img.complete&&img.naturalWidth>0).catch(()=>false);
   if(!valid)issues.push(tag+' lead photograph did not load');
  }catch(e){issues.push(tag+' browser failure '+e.message)}finally{await page.close()}
 }
}
for(const item of routes){
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const tag=item.slug+'-interactive';
 try{
  await page.goto(origin+item.url,{waitUntil:'domcontentloaded'});
  if(item.slug==='stockwise'){
   // The marketing page must link to a complete, separate working retail demo.
   await page.goto(origin+'/projects/stockwise/workspace.html#dashboard',{waitUntil:'domcontentloaded'});
   await page.locator('.ws-view[data-view="dashboard"]').waitFor({state:'visible'});
   const initial=await page.evaluate(()=>window.STOCKWISE_DEMO.snapshot());
   assert.ok(initial.products.length>=5&&initial.invoices.length>=1,'Plausible store seed');
   page.on('dialog',dialog=>dialog.accept());
   await page.locator('[data-nav="sales"]').click();
   await page.locator('[data-view="sales"]').waitFor({state:'visible'});
   await page.locator('#ws-sale-product').selectOption('p101');
   await page.locator('#ws-sale-qty').fill('2');
   await page.locator('#ws-sale-form button[type="submit"]').click();
   const sold=await page.evaluate(()=>window.STOCKWISE_DEMO.snapshot());
   assert.equal(sold.products.find(p=>p.id==='p101').stock,initial.products.find(p=>p.id==='p101').stock-2,'Real sale deducts stock');
   assert.equal(sold.sales.length,initial.sales.length+1,'Real sale creates a ledger entry');
   assert.equal(sold.movements.length,initial.movements.length+1,'Real sale logs a stock movement');
   await page.locator('#ws-sale-qty').fill('9999');
   await page.locator('#ws-sale-form button[type="submit"]').click();
   const invalid=await page.evaluate(()=>window.STOCKWISE_DEMO.snapshot());
   assert.equal(invalid.sales.length,sold.sales.length,'Overselling blocked');
   assert.equal(invalid.products.find(p=>p.id==='p101').stock,sold.products.find(p=>p.id==='p101').stock,'Overselling does not change stock');
   await page.locator('[data-nav="invoices"]').click();
   await page.locator('[data-view="invoices"]').waitFor({state:'visible'});
   await page.locator('#ws-invoice-customer').selectOption('c101');
   await page.locator('#ws-invoice-product').selectOption('p103');
   await page.locator('#ws-invoice-qty').fill('1');
   await page.locator('#ws-invoice-form button[type="submit"]').click();
   const issued=await page.evaluate(()=>window.STOCKWISE_DEMO.snapshot());
   assert.equal(issued.products.find(p=>p.id==='p103').stock,sold.products.find(p=>p.id==='p103').stock,'Issuing invoice does not prematurely deduct stock');
   assert.ok(issued.invoices.at(-1).paid===false&&issued.invoices.at(-1).fulfilled===false,'New invoice has separate unpaid and not handed over states');
   const invoiceId=issued.invoices.at(-1).id;
   await page.locator('[data-fulfill="'+invoiceId+'"]').click();
   const delivered=await page.evaluate(()=>window.STOCKWISE_DEMO.snapshot());
   assert.equal(delivered.products.find(p=>p.id==='p103').stock,sold.products.find(p=>p.id==='p103').stock-1,'Handing over goods deducts stock once');
   await page.locator('[data-pay="'+invoiceId+'"]').click();
   await page.locator('#ws-dialog-form button[type="submit"]').click();
   const paid=await page.evaluate(()=>window.STOCKWISE_DEMO.snapshot());
   assert.equal(paid.invoices.at(-1).paid,true,'Recording payment marks invoice paid');
   assert.equal(paid.invoices.at(-1).fulfilled,true,'Payment preserves fulfillment state');
   await page.locator('[data-nav="sales"]').click();
   const saleId=sold.sales.at(-1).id;
   await page.locator('[data-refund="'+saleId+'"]').click();
   const returned=await page.evaluate(()=>window.STOCKWISE_DEMO.snapshot());
   assert.equal(returned.products.find(p=>p.id==='p101').stock,initial.products.find(p=>p.id==='p101').stock,'Refund restores units exactly once');
   assert.equal(returned.sales.at(-1).refunded,true,'Refund marks sale');
   await page.locator('[data-nav="inventory"]').click();
   await page.locator('[data-stock="p102"][data-reason="receive"]').first().click();
   await page.locator('#ws-dialog-form input[name="quantity"]').fill('7');
   await page.locator('#ws-dialog-form button[type="submit"]').click();
   const received=await page.evaluate(()=>window.STOCKWISE_DEMO.snapshot());
   assert.equal(received.products.find(p=>p.id==='p102').stock,initial.products.find(p=>p.id==='p102').stock+7,'Receiving stock adds correct quantity');
   assert.ok(received.movements.some(m=>m.productId==='p102'&&m.reason==='Supplier delivery received'),'Receiving logged with reason');
   await page.locator('[data-nav="alerts"]').click();
   assert.ok(!await page.locator('[data-view="alerts"] [data-stock="p102"]').count(),'Receiving sufficient stock clears reorder alert');
   await inspect(page,'stockwise-operations-desktop');
  }else if(item.slug==='vela-health'){
   await page.locator('[data-vela-service="Women\'s health"]').click();
   assert.equal(await page.locator('[data-vela-service="Women\'s health"]').getAttribute('aria-pressed'),'true');
   await page.locator('#vela-care-book').click();
   await page.locator('[data-page="book"]').waitFor({state:'visible'});
   assert.equal(await page.locator('#service').inputValue(),"Women's health");
   await page.locator('#date').evaluate(el=>{const tomorrow=new Date(Date.now()+86400000);const pad=n=>String(n).padStart(2,'0');el.value=tomorrow.getFullYear()+'-'+pad(tomorrow.getMonth()+1)+'-'+pad(tomorrow.getDate());el.dispatchEvent(new Event('change',{bubbles:true}))});
   await page.locator('#slots button:not([disabled])').first().click();
   await page.locator('#guest').fill('Studio QA Tester');
   await page.locator('#booking-form button[type="submit"]').click();
   await page.locator('[data-page="visits"]').waitFor({state:'visible'});
   assert.match(await page.locator('#visit-list').innerText(),/Studio QA Tester/);
  }else{
   await page.locator('#quick-track').fill('MOV-2002');
   await page.locator('#quick-track-form button').click();
   await page.locator('[data-page="track"]').waitFor({state:'visible'});
   assert.match(await page.locator('#tracking-result').innerText(),/MOV-2002/);
   await page.locator('a[href="#dispatch"]').first().click();
   await page.locator('[data-page="dispatch"]').waitFor({state:'visible'});
   assert.ok(await page.locator('[data-next]').count()>0);
  }
  results.push({tag,passed:true});
 }catch(e){issues.push(tag+' interaction failed '+e.message)}finally{await page.close()}
}
for(const size of sizes){
 const page=await browser.newPage({viewport:{width:size.width,height:size.height},isMobile:size.name==='phone',hasTouch:size.name==='phone'});
 const tag='stockwise-workspace-'+size.name;
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{await page.goto(origin+'/projects/stockwise/workspace.html#dashboard',{waitUntil:'domcontentloaded'});await capture(page,tag,'.ws-view[data-view="dashboard"]');for(const error of errors)issues.push(tag+' JS error '+error)}
 catch(e){issues.push(tag+' screenshot failure '+e.message)}finally{await page.close()}
}
for(const item of routes){
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const tag=item.slug+'-case-phone';
 try{await page.goto(origin+'/work/'+item.slug+'/',{waitUntil:'domcontentloaded',timeout:15000});await capture(page,tag,'.sd-showcase');}
 catch(e){issues.push(tag+' case study failure '+e.message)}finally{await page.close()}
}
await browser.close();
await writeFile(root+'/report.json',JSON.stringify({results,issues},null,2));
console.log(JSON.stringify({tested:results.map(x=>x.tag),issues},null,2));
if(issues.length){process.exitCode=1}
