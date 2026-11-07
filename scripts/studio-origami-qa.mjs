import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.cwd()+'/.studio-qa-tools/node_modules/playwright');
const root='artifacts/studio-origami-qa',origin='http://127.0.0.1:8765';
await mkdir(root,{recursive:true});
const homepage=await readFile('index.html','utf8');
assert.ok(homepage.includes('id="studio-origami"')&&homepage.includes('studio-origami-box.js?v=5'),'actual Studio landing section updated');
assert.ok(!homepage.includes('studio-hero-art.webp'),'old abstract artwork removed');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const issues=[],results=[];
for(const vp of [{name:'desktop',width:1440,height:900},{name:'tablet',width:820,height:1024},{name:'phone',width:390,height:844},{name:'narrow-phone',width:320,height:740}]){
 const page=await browser.newPage({viewport:{width:vp.width,height:vp.height},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(origin+'/#studio',{waitUntil:'domcontentloaded'});
  await page.locator('#studio-origami svg.og-artwork').waitFor({state:'visible'});
  await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('#studio-origami-container img').count(),0,'origami is page DOM, not image');
  assert.equal(await page.locator('#studio-origami .paper-crane').count(),2,'two recognizable folded cranes nested inside the tray');
  assert.equal(await page.locator('#studio-origami #og-paper-butterfly').count(),1,'one origami butterfly');
  assert.equal(await page.locator('#studio-origami #og-paper-boat').count(),1,'one origami boat');
  assert.equal(await page.locator('#studio-origami #og-paper-flower').count(),1,'one folded paper flower');
  assert.equal(await page.locator('#studio-origami #og-paper-box').count(),1,'single unbranded open box');
  assert.equal(await page.locator('#studio-origami #og-tray-floor').count(),1,'light solid floor closes hollow bottom');
  assert.equal(await page.locator('#studio-origami #og-tray-front').count(),1,'low front crib wall');
  assert.equal(await page.locator('#studio-origami #og-tray-side').count(),1,'side crib wall');
  assert.equal(await page.locator('#studio-origami #og-tray-floor').getAttribute('fill'),'url(#tray-floor)','pale floor rather than black/dark hollow');
  assert.ok(await page.locator('#studio-origami .paper-object').count()===5,'exactly five origami pieces');
  const layering=await page.evaluate(()=>{let svg=document.querySelector('#studio-origami svg');let a=svg.querySelector('#og-paper-flower'),b=svg.querySelector('#og-paper-box');return !!(a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_FOLLOWING)});
  assert.ok(layering,'front tray walls draw over lower origami folds');
  assert.equal(await page.locator('#studio-origami button,#studio-origami a').count(),0,'no control clutter');
  assert.equal(await page.locator('#studio-origami svg text').count(),0,'no text or logo on paper or box');
  assert.equal(await page.locator('#studio-origami .og-gallery-overline').count(),0,'no decorative labels');
  const geometry=await page.locator('#studio-origami').evaluate(el=>{
    const r=el.getBoundingClientRect(),box=el.querySelector('#og-paper-box').getBoundingClientRect();
    return {viewport:innerWidth,art:{x:r.x,width:r.width,height:r.height},box:{x:box.x,width:box.width,height:box.height}};
  });
  assert.ok(geometry.art.x>=-3&&geometry.art.x+geometry.art.width<=vp.width+3,'art fits phone width');
  assert.ok(geometry.box.width>=100&&geometry.box.height>=40,'unbranded box visible');
  assert.ok(geometry.box.x>=geometry.art.x-10&&geometry.box.x+geometry.box.width<=geometry.art.x+geometry.art.width+10,'box contained by art');
  await page.locator('#studio-origami').scrollIntoViewIfNeeded();
  await page.screenshot({path:root+'/studio-origami-'+vp.name+'.png',animations:'disabled',timeout:28000});
  errors.forEach(e=>issues.push(vp.name+' JS error: '+e));
  results.push({viewport:vp.name,geometry});
 }catch(e){issues.push(vp.name+': '+e.message)}
 finally{await page.close()}
}
await browser.close();
await writeFile(root+'/report.json',JSON.stringify({results,issues},null,2));
console.log(JSON.stringify({screens:results.map(r=>r.viewport),issues},null,2));
if(issues.length)process.exitCode=1;
