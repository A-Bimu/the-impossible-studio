/* A focused browser layout check on top of the full cross-project test suite. */
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.cwd()+'/.studio-qa-tools/node_modules/playwright');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const origin='http://127.0.0.1:8765';
const root='artifacts/studio-browser-qa';
await mkdir(root,{recursive:true});
const issues=[],details=[];
const viewports=[{name:'narrow-phone',width:320,height:740},{name:'phone',width:390,height:844},{name:'tablet',width:768,height:1024},{name:'desktop',width:1440,height:900}];
const targets=[
 {kind:'brand',path:'/projects/stockwise/',selector:'.sw-campaign',headings:['#sw-campaign-title','.sw-yellow-message h2','#sw-practical-title','#sw-collection-title','.sw-ledger-intro h2','.sw-final-cta h2']},
 {kind:'workspace',path:'/projects/stockwise/workspace.html#dashboard',selector:'.ws-view[data-view="dashboard"]',headings:['.ws-heading h1','.ws-panel-head h2']},
 {kind:'case',path:'/work/stockwise/',selector:'.sd-showcase',headings:['.hero h1','.visual-inner strong','.case-manifesto h2']}
];
async function check(page,kind,name,width){
 const result=await page.evaluate(({kind})=>{
  const q=s=>document.querySelector(s);
  const horizontal={viewport:document.documentElement.clientWidth,body:document.body.scrollWidth,root:document.documentElement.scrollWidth};
  horizontal.offenders=[...document.body.querySelectorAll('*')].map(el=>{const r=el.getBoundingClientRect();return {tag:el.tagName.toLowerCase(),selector:el.className?.toString().slice(0,90)||el.id||'',right:Math.round(r.right),left:Math.round(r.left),width:Math.round(r.width)}}).filter(r=>r.right>innerWidth+4&&r.left>=0).sort((a,b)=>b.right-a.right).slice(0,10);
  const selectors=kind==='brand'?['#sw-campaign-title','.sw-yellow-message h2','#sw-practical-title','#sw-collection-title','.sw-ledger-intro h2','.sw-final-cta h2']:kind==='workspace'?['.ws-heading h1','.ws-panel-head h2']:['.hero h1','.visual-inner strong','.case-manifesto h2'];
  const headings=selectors.map(selector=>{
   const el=q(selector);if(!el)return {selector,missing:true};
   const css=getComputedStyle(el),size=parseFloat(css.fontSize),line=parseFloat(css.lineHeight);
   const box=el.getBoundingClientRect();
   return {selector,fontsize:size,lineHeight:line,ratio:line/size,width:box.width,scrollWidth:el.scrollWidth,height:box.height,cssOverflow:css.overflow};
  });
  let decorations={};
  if(kind==='brand'){
   const intersects=(a,b)=>{const x=q(a)?.getBoundingClientRect(),y=q(b)?.getBoundingClientRect();return Boolean(x&&y&&x.left<y.right&&x.right>y.left&&x.top<y.bottom&&x.bottom>y.top)};
   decorations={yellowArrowCrossesHeader:intersects('.sw-hero-top','.sw-line-doodle'),stickerCrossesCaption:intersects('.sw-photo-sticker','.sw-photo-id'),receiptStarVisibleAtPhone:innerWidth<761&&getComputedStyle(q('.sw-receipt-clip')).display!=='none',carousel:!!q('[data-sw-gallery-status]')};
  }
  return {horizontal,headings,decorations};
 },{kind});
 if(result.horizontal.body>width+4||result.horizontal.root>width+4)issues.push(kind+' '+name+': horizontal document overflow '+JSON.stringify(result.horizontal));
 for(const h of result.headings){
  if(h.missing){issues.push(kind+' '+name+': missing heading '+h.selector);continue}
  if(h.ratio<1.025)issues.push(kind+' '+name+': too-tight heading line height '+h.selector+' '+h.ratio.toFixed(2));
  if(h.scrollWidth>h.width+10)issues.push(kind+' '+name+': clipped heading '+h.selector+' '+h.scrollWidth+' > '+h.width);
 }
 for(const [label,hit] of Object.entries(result.decorations))if(label!=='carousel'&&hit)issues.push(kind+' '+name+': decoration collision '+label);
 if(kind==='brand'&&!result.decorations.carousel)issues.push('Brand carousel controls missing');
 details.push({kind,name,width,result});
}
for(const t of targets){
 for(const vp of viewports){
  const page=await browser.newPage({viewport:{width:vp.width,height:vp.height},deviceScaleFactor:1,hasTouch:vp.width<=390,isMobile:vp.width<=390});
  const tag='stockwise-polish-'+t.kind+'-'+vp.name;
  const jsErrors=[];page.on('pageerror',e=>jsErrors.push(e.message));
  try{
   await page.goto(origin+t.path,{waitUntil:'domcontentloaded',timeout:20000});
   await page.locator(t.selector).first().waitFor({state:'visible',timeout:15000});
   await page.evaluate(()=>document.fonts.ready);
   await page.waitForTimeout(550);
   await check(page,t.kind,vp.name,vp.width);
   if(vp.width===390||vp.width===1440){
    // Promote actual live frames into view before taking the full-page case-study shot.
    if(t.kind==='case')await page.locator('.sd-grid-laptop').scrollIntoViewIfNeeded();
    await page.screenshot({path:root+'/'+tag+'.png',fullPage:true,animations:'disabled',timeout:40000});
   }else await page.screenshot({path:root+'/'+tag+'.png',fullPage:false,animations:'disabled',timeout:25000});
   if(t.kind==='brand'&&vp.width<=390){
    const scroller=page.locator('.sw-photo-collection');
    const before=await scroller.evaluate(n=>n.scrollLeft);
    await page.locator('[data-sw-gallery-dir="1"]').click();
    await page.waitForTimeout(350);
    const after=await scroller.evaluate(n=>n.scrollLeft);
    if(after<=before+12)issues.push(tag+': gallery next button did not scroll');
   }
   if(t.kind==='workspace'&&vp.width<=390){
    await page.locator('.ws-mobile-nav-more').click();
    await page.waitForTimeout(450);
    const nav=await page.locator('.ws-mobile-nav').evaluate(n=>n.scrollLeft);
    if(nav<12)issues.push(tag+': mobile navigation next control did not scroll');
    // Inventory, invoice and sale action columns must be within the phone viewport.
    for(const [name,button]of [['inventory','[data-view="inventory"] [data-stock="p102"]'],['invoices','[data-view="invoices"] [data-fulfill]'],['sales','[data-view="sales"] [data-refund]']]){
     await page.goto(origin+'/projects/stockwise/workspace.html#'+name,{waitUntil:'domcontentloaded'});
     const target=page.locator(button).first();
     await target.waitFor({state:'visible',timeout:10000});
     const info=await target.evaluate(n=>{const r=n.getBoundingClientRect(),t=n.closest('td');return {left:r.left,right:r.right,width:innerWidth,label:t?.dataset.label||'',actionVisible:r.right<=innerWidth+2&&r.left>=-2}});
     if(!info.actionVisible)issues.push(tag+': '+name+' action button is horizontally inaccessible '+JSON.stringify(info));
     if(!info.label)issues.push(tag+': '+name+' row missing mobile label');
    }
   }
   if(t.kind==='case'){
    const frames=page.locator('.sd-grid-laptop .sd-iframe');
    if((await frames.count())!==3)issues.push(tag+': missing laptop previews');
    const first=frames.first();
    await first.waitFor({state:'attached'});
    try{await page.waitForFunction(()=>{const f=document.querySelector('.sd-grid-laptop iframe');return Boolean(f&&f.getAttribute('src')&&f.closest('.sd-screen')?.classList.contains('is-loaded'))},null,{timeout:12500});}
    catch{issues.push(tag+': first laptop preview did not load as live page')}
   }
   jsErrors.forEach(error=>issues.push(tag+': JS error '+error));
  }catch(e){issues.push(tag+': '+e.message)}
  finally{await page.close()}
 }
}
await browser.close();
await writeFile(root+'/stockwise-polish-report.json',JSON.stringify({details,issues},null,2));
console.log(JSON.stringify({views:details.map(x=>x.kind+' / '+x.name),issues},null,2));
if(issues.length)process.exitCode=1;