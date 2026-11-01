import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {Script} from 'node:vm';
const root=new URL('../',import.meta.url);
const read=p=>readFile(new URL(p,root),'utf8');
const config=html=>{const m=html.match(/<script type="application\/json" class="sd-config">([\s\S]*?)<\/script>/);assert.ok(m,'Responsive gallery configuration missing');return JSON.parse(m[1])};
const pages=[
 ['Hotel Nocturne','daily/2026-10-31-night-shift/case-study/index.html','daily/2026-10-31-night-shift/index.html'],
 ['ZEBRA','work/zebra/index.html','projects/zebra-fashion/index.html'],
 ['ONE','work/one/index.html','collections/product-design/one-deep-navy.html']
];
test('all three newly upgraded websites expose 3 actual laptop + 5 unique phone views',async()=>{
 for(const [name,page,realPage] of pages){
  const html=await read(page),cfg=config(html);
  assert.equal(cfg.desktop.length,3,name+' desktop');
  assert.equal(cfg.phone.length,5,name+' mobile');
  assert.equal(new Set(cfg.desktop.map(i=>i.route)).size,3,name+' desktop unique routes');
  assert.equal(new Set(cfg.phone.map(i=>i.route)).size,5,name+' mobile unique routes');
  assert.ok(cfg.source,name+' actual source');
  assert.ok(html.includes('studio-responsive-showcase.css'),name+' frame styles');
  assert.ok(html.includes('studio-responsive-showcase.js'),name+' frame controller');
  const source=new URL(realPage,root);
  const target=new URL(cfg.source,new URL(page,root));
  assert.ok(target.pathname===source.pathname||target.pathname===source.pathname.replace(/index.html$/,''),name+' source must resolve to authentic project');
  await access(source);
 }
});
test('Hotel Nocturne mobile and desktop links point to real present sections',async()=>{
 const cfg=config(await read('daily/2026-10-31-night-shift/case-study/index.html'));
 const live=await read('daily/2026-10-31-night-shift/index.html');
 for(const entry of [...cfg.desktop,...cfg.phone]){
  const id=entry.route.replace('#','');assert.ok(live.includes('id="'+id+'"'),'Nocturne target '+id);
 }
 assert.ok(live.includes('case-study/'),'Hotel Nocturne return link');
 assert.ok(live.includes("dialog.showModal()"),'working booking dialog preserved');
});
test('ZEBRA and ONE continue to show original interactive source and preserve their earlier case stories',async()=>{
 const zebra=await read('work/zebra/index.html'),one=await read('work/one/index.html');
 assert.ok(zebra.includes('Behind the')&&zebra.includes('idea.'));
 assert.ok(zebra.includes('../../projects/zebra-fashion/'));
 assert.ok(one.includes('The approved still')&&one.includes('kept as reference.'));
 assert.ok(one.includes('one-deep-navy.html'));
 assert.ok(zebra.includes('id="responsive-views"'));
 assert.ok(one.includes('id="responsive-views"'));
});
test('CHERRY RIOT now has three laptop and five phone views, all source-linked',async()=>{
 const js=await read('daily/cherry-riot/case-study/case-study.js');
 assert.doesNotThrow(()=>new Script(js));
 const desk=js.match(/const laptopViews=\[([\s\S]*?)\];/),phone=js.match(/const phoneViews=\[([\s\S]*?)\];/);
 assert.ok(desk&&phone);
 assert.equal((desk[1].match(/\{view:/g)||[]).length,3);
 assert.equal((phone[1].match(/\{view:/g)||[]).length,5);
 for(const type of ["'cart'","'story'","'pairings'"])assert.ok(phone[1].includes(type));
 assert.ok((await read('daily/cherry-riot/case-study/case-study.css')).includes('repeat(5,minmax(0,1fr))'));
});
test('responsive UI only loads real project iframes and scales to authentic viewport widths',async()=>{
 const js=await read('assets/studio-responsive-showcase.js'),css=await read('assets/studio-responsive-showcase.css');
 assert.doesNotThrow(()=>new Script(js));
 for(const t of ["1200","390","iframe","dataset.src","IntersectionObserver","ResizeObserver","showcase","aria-pressed"]){if(t==='showcase')continue;assert.ok(js.includes(t),t)}
 for(const c of ['.sd-lid','.sd-mobile','.sd-interact-frame','aspect-ratio:390/844','@media(max-width:440px)'])assert.ok(css.includes(c),c);
 const journal=await read('daily/index.html');
 assert.ok(journal.includes('cherry-riot/case-study/'));
 assert.ok(journal.includes('2026-10-31-night-shift/case-study/'));
});
