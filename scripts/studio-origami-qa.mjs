/* Visual and interaction QA for the live CSS-folded origami scene. */
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.cwd()+'/.studio-qa-tools/node_modules/playwright');
const origin='http://127.0.0.1:8765';
const root='artifacts/studio-origami-qa';
await mkdir(root,{recursive:true});
const source=await readFile('index.html','utf8');
assert.ok(source.includes('id="studio-origami"'),'origami art must appear in real landing HTML');
assert.ok(source.includes('studio-origami-box.css'),'responsive CSS stylesheet linked');
assert.ok(source.includes('studio-origami-box.js'),'working rearrange script linked');
assert.ok(!source.includes('assets/studio-hero-art.webp'),'outdated abstract artwork removed from landing');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const issues=[],results=[];
for(const size of [{name:'desktop',width:1440,height:900},{name:'tablet',width:820,height:1040},{name:'phone',width:390,height:844},{name:'narrow-phone',width:320,height:740}]){
 const page=await browser.newPage({viewport:{width:size.width,height:size.height},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const tag='studio-origami-'+size.name;
 try{
  await page.goto(origin+'/#studio',{waitUntil:'domcontentloaded',timeout:20000});
  await page.locator('.og-scene').waitFor({state:'visible'});
  await page.evaluate(()=>document.fonts.ready);
  await page.locator('#studio').scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  assert.equal(await page.locator('#studio-origami-container img').count(),0,'origami art should not be an image');
  assert.equal(await page.locator('#studio-origami svg.og-artwork').count(),1,'sculpture is inline vector DOM in the page');
  assert.ok(await page.locator('#studio-origami svg path').count()>65,'independent folded paper faces and creases');
  assert.equal(await page.locator('#studio-origami #og-bird-plum').count(),1,'folded plum paper crane');
  assert.equal(await page.locator('#studio-origami #og-bird-ivory').count(),1,'folded ivory paper crane');
  assert.equal(await page.locator('#studio-origami #og-bird-lilac').count(),1,'folded lilac paper crane');
  assert.equal(await page.locator('#studio-origami #og-butterfly').count(),1,'paper butterfly');
  assert.equal(await page.locator('#studio-origami #og-paper-box').count(),1,'layered open paper box');
  assert.equal(await page.locator('#studio-origami #paper-noise').count(),1,'real paper-grain shading available');
  const geometry=await page.locator('.og-scene').evaluate(node=>{
    const r=node.getBoundingClientRect(),parent=node.parentElement.getBoundingClientRect();
    const box=node.querySelector('#og-paper-box').getBoundingClientRect();
    return {scene:{x:r.x,y:r.y,width:r.width,height:r.height},parent:{width:parent.width},box:{x:box.x,y:box.y,width:box.width,height:box.height},viewport:innerWidth,overflow:document.documentElement.scrollWidth};
  });
  assert.ok(geometry.overflow<=size.width+4,'origami must not trigger page-wide horizontal scroll: '+JSON.stringify(geometry));
  assert.ok(geometry.scene.width>245,'art visibly sized for responsive view');
  assert.ok(geometry.box.width>140&&geometry.box.height>70,'dimensional folded box visible');
  assert.ok(geometry.scene.x>=-2&&geometry.scene.x+geometry.scene.width<=size.width+3,'origami scene stays inside viewport');
  assert.ok(geometry.box.x>=geometry.scene.x-12&&geometry.box.x+geometry.box.width<=geometry.scene.x+geometry.scene.width+12,'visible box remains within art');
  const button=page.locator('#og-remix');
  await button.click();
  assert.equal(await page.locator('#studio-origami').getAttribute('data-fold'),'1','rearrange action updates scene');
  await button.click();
  assert.equal(await page.locator('#studio-origami').getAttribute('data-fold'),'2','can rearrange again');
  await button.click();
  assert.equal(await page.locator('#studio-origami').getAttribute('data-fold'),'0','returns to initial composition');
  await page.screenshot({path:root+'/'+tag+'.png',animations:'disabled',timeout:24000});
  errors.forEach(e=>issues.push(tag+' JS error: '+e));
  results.push({tag,geometry});
 }catch(e){issues.push(tag+': '+e.message)}
 finally{await page.close()}
}
await browser.close();
await writeFile(root+'/report.json',JSON.stringify({results,issues},null,2));
console.log(JSON.stringify({screens:results.map(r=>r.tag),issues},null,2));
if(issues.length)process.exitCode=1;
