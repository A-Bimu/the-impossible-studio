import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');

test('MOVA is on hold across all public Studio listings without being deleted',async()=>{
 const pages=[
  ['index.html',/<a\b[^>]*class="piece"[^>]*href="work\/mova\/"[^>]*>/],
  ['presentations/index.html',/<article\b[^>]*data-studio-on-hold="mova"[^>]*>/],
  ['daily/index.html',/<article\b[^>]*data-studio-on-hold="mova"[^>]*>/]
 ];
 for(const [path,pattern] of pages){
  const html=await read(path);
  const listing=html.match(pattern)?.[0];
  assert.ok(listing,path+' retains a reversible MOVA listing');
  assert.match(listing,/data-studio-on-hold="mova"/,path+' is explicitly held for review');
  assert.match(listing,/\bhidden\b/,path+' is removed from rendering and the accessibility tree');
  assert.match(listing,/display:none!important/,path+' cannot be re-shown by gallery filters');
  assert.ok(html.includes('mova'),path+' preserves the source reference');
 }
 const homepage=await read('index.html');
 assert.match(homepage,/<a class="piece" href="work\/stockwise\/"/);
 assert.match(homepage,/<a class="piece" href="work\/vela-health\/"/);
 const [demo,caseStudy]=await Promise.all([
  read('projects/mova/index.html'),read('work/mova/index.html')
 ]);
 assert.ok(demo.includes('id="new-form"')&&demo.includes('id="tracking-result"'),'working MOVA demo is retained');
 assert.ok(caseStudy.includes('studio-unified-showcase.js'),'MOVA case study is retained for review');
});
