import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Script} from 'node:vm';
const root = new URL('../daily/cherry-riot/',import.meta.url);
const file=path=>readFile(new URL(path,root),'utf8');
test('approved CHERRY RIOT case study includes complete presentation sections',async()=>{
  const s=await file('presentation/index.html');
  for(const id of ['overview','creative','experience','branding','process','credits'])assert.ok(s.includes('id="'+id+'"'),id);
  for(const label of ['Desktop views','Mobile views','The idea','The goal','Colour palette','Typography','BRAND & PACKAGING','FROM IDEA TO LIVE EXPERIENCE'])assert.ok(s.includes(label),label);
  assert.equal((s.match(/data-device="desktop"/g)||[]).length,4);
  assert.equal((s.match(/data-device="phone"/g)||[]).length,4);
  for(const screen of ['home','product','cart','pairings'])assert.ok(s.includes('../showcase/?view='+screen),screen);
  assert.ok(s.includes('href="../"'));
});
test('all mockup screens are working demo pages, not unrelated placeholders',async()=>{
  const s=await file('showcase/index.html');
  for(const page of ['home','product','cart','pairings'])assert.ok(s.includes('data-view="'+page+'"'));
  for(const marker of ['addToBag','bagLines','incQty','decQty','localStorage','demoCheckout','role="status"'])assert.ok(s.includes(marker));
  const script=s.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(script);assert.doesNotThrow(()=>new Script(script[1],{filename:'showcase.js'}));
});
test('presentation resizes actual embedded website screens',async()=>{
  const js=await file('presentation/presentation.js');
  assert.doesNotThrow(()=>new Script(js,{filename:'presentation.js'}));
  assert.ok(js.includes('sourceWidth = mobile ? 390 : 1360'));
  assert.ok(js.includes("scale("));
});
test('studio journal links directly to full presentation without removing live design',async()=>{
  const index=await readFile(new URL('../daily/index.html',import.meta.url),'utf8');
  const home=await file('index.html');
  assert.ok(index.includes('./cherry-riot/presentation/'));
  assert.ok(index.includes('./cherry-riot/'));
  assert.ok(home.includes('href="./presentation/"'));
});
