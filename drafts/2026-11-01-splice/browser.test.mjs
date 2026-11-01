// Real-browser evidence for the unapproved SPLICE design draft.
// Serves only this draft's two files; no production site or API is contacted.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const directory=path.dirname(fileURLToPath(import.meta.url));
function serveDraft(){
  return createServer(async(request,response)=>{
    const name=new URL(request.url,'http://localhost').pathname.slice(1)||'index.html';
    if(!['index.html','app.mjs'].includes(name)){response.writeHead(404).end();return;}
    try{
      const content=await readFile(path.join(directory,name));
      response.writeHead(200,{'Content-Type':name.endsWith('.mjs')?'text/javascript; charset=utf-8':'text/html; charset=utf-8','Cache-Control':'no-store'});
      response.end(content);
    }catch{response.writeHead(500).end();}
  });
}
test('SPLICE edits, exports and fits narrow mobile screens in Chromium',{timeout:90000},async()=>{
  const server=serveDraft();
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  let browser;
  try{
    browser=await chromium.launch({headless:true});
    const base='http://127.0.0.1:'+server.address().port+'/';
    const shots=process.env.SPLICE_QA_SCREENSHOTS;
    if(shots)await mkdir(shots,{recursive:true});
    const capture=async(page,name)=>{if(shots)await page.screenshot({path:path.join(shots,name+'.png'),fullPage:true});};
    const page=await browser.newPage({viewport:{width:1365,height:900},acceptDownloads:true});
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(base);
    await page.locator('#cover svg').waitFor();
    assert.equal(await page.locator('#cover svg').count(),1);
    assert.equal(await page.locator('#phone-cover svg').count(),1);
    await capture(page,'desktop-1365-original');
    await page.locator('#album-title').fill('FALLING INTO PLACE');
    await page.locator('#artist-name').fill('NOVA & THE MOON');
    await page.locator('[data-layout="fold"]').click();
    await page.locator('[data-palette="midnight"]').click();
    assert.equal(await page.locator('[data-layout="fold"]').getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('[data-palette="midnight"]').getAttribute('aria-pressed'),'true');
    assert.match(await page.locator('#cover svg title').textContent(),/FALLING INTO PLACE by NOVA & THE MOON/);
    assert.equal(await page.locator('#phone-title').textContent(),'FALLING INTO PLACE');
    assert.match(await page.locator('#cover svg desc').textContent(),/fold geometric/);
    assert.equal(await page.locator('#cover svg rect').first().getAttribute('fill'),'#142039');
    await capture(page,'desktop-1365-edited');
    const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#export').click()]);
    assert.equal(download.suggestedFilename(),'splice-falling-into-place.svg');
    const exported=await readFile(await download.path(),'utf8');
    assert.match(exported,/<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
    assert.match(exported,/NOVA &amp; THE MOON/);
    assert.match(exported,/fold geometric/);
    await page.locator('#reset').click();
    assert.equal(await page.locator('#album-title').inputValue(),'SOFT COLLISION');
    assert.equal(await page.locator('#album-title').evaluate(node=>node===document.activeElement),true);
    for(const width of [320,375,768]){
      const mobile=await browser.newPage({viewport:{width,height:820}});
      mobile.on('pageerror',error=>errors.push(error.message));
      await mobile.goto(base);
      await mobile.locator('#cover svg').waitFor();
      const dims=await mobile.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:window.innerWidth}));
      assert.ok(dims.scroll<=dims.viewport+1,width+'px document overflows: '+JSON.stringify(dims));
      assert.equal(await mobile.locator('#phone-cover svg').isVisible(),true);
      await capture(mobile,'mobile-'+width+'-original');
      await mobile.close();
    }
    assert.deepEqual(errors,[]);
    await page.close();
  }finally{
    if(browser)await browser.close();
    await new Promise(resolve=>server.close(resolve));
  }
});
