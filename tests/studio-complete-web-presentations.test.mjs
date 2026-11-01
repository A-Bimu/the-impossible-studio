import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Script} from 'node:vm';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
function config(html){const m=html.match(/<script\b[^>]*class="sd-config"[^>]*>([\s\S]*?)<\/script>/);assert.ok(m,'Responsive case-study config is present');return JSON.parse(m[1]);}
const pages=[
 'calendars/roots-2027/index.html','calendars/atlas-africa-2027/index.html','calendars/heritage-africa-2027/index.html',
 'work/poster-studies/index.html','work/childfree/index.html','work/zawadi/index.html'
];
test('expanded Studio audit includes every published interactive category',async()=>{
 const audit=await read('coordination/STUDIO-WEBSITE-PRESENTATION-AUDIT.md');
 for(const name of ['CHERRY RIOT','Hotel Nocturne','ZEBRA','ONE','ROOTS 2027','Atlas of Africa','The Editorial Edition','Poster Studies','Childfree','Zawadi'])assert.ok(audit.includes(name),name);
});
test('six overlooked experiences now have honest 3 laptop and 5 phone real sources',async()=>{
 for(const path of pages){const html=await read(path),cfg=config(html);
   assert.equal(cfg.desktop.length,3,path+' desktops');
   assert.equal(cfg.phone.length,5,path+' phones');
   assert.equal(new Set(cfg.desktop.map(x=>x.route)).size,3,path+' distinct desktop scenes');
   assert.equal(new Set(cfg.phone.map(x=>x.route)).size,5,path+' distinct mobile scenes');
   assert.ok(cfg.source,path+' genuine demo source');
   assert.ok(html.includes('sd-story'),path+' case-story');
   assert.ok(html.includes('studio-responsive-showcase.css'),path+' device styles');
   assert.ok(html.includes('studio-responsive-showcase.js'),path+' interactive viewer');
 }
});
test('calendar phone and desktop views use genuine 2027 month keys; artwork and date-grid script intact',async()=>{
 const script=await read('calendars/calendar.js');
 for(const p of pages.slice(0,3)){
  const cfg=config(await read(p));
  for(const item of [...cfg.desktop,...cfg.phone])assert.match(item.route,/^#(january|february|march|april|june|august|september|november)-2027$/);
  assert.ok(cfg.source.includes('?preview=1'));
 }
 assert.ok(script.includes('function monthFromHash()'));
 assert.ok(script.includes('requestAnimationFrame(()=>document.querySelector(".month-section")?.scrollIntoView())'));
 assert.ok(script.includes('buildDateGrid'));
});
test('poster study gallery previews point to eight actual independent original poster study pages',async()=>{
 const cfg=config(await read('work/poster-studies/index.html'));
 for(const scene of [...cfg.desktop,...cfg.phone]){
  assert.match(scene.route,/^[a-z-]+\/$/);
  const leaf=await read('work/poster-studies/'+scene.route+'index.html');
  assert.match(leaf,/<title>/);
 }
});
test('Childfree uses 9 approved real pin cards with stable anchors, plus working dialog',async()=>{
 const html=await read('work/childfree/index.html');
 const cfg=config(html);
 assert.equal((html.match(/class="sd-pin-anchor" id="pin-/g)||[]).length,9);
 for(const s of cfg.phone)assert.ok(html.includes('id="'+s.route.slice(1)+'"'));
 assert.ok(html.includes('dialog.showModal()'));
});
test('Zawadi previews point to genuine coded sections with no pretend payment service',async()=>{
 const html=await read('work/zawadi/index.html'),cfg=config(html);
 for(const s of [...cfg.desktop,...cfg.phone])assert.ok(html.includes('id="'+s.route.slice(1)+'"'),s.route);
 assert.ok(cfg.demoDescription.toLowerCase().includes('not')||cfg.demoDescription.toLowerCase().includes('concept'));
});
test('nested preview mode prevents recursive iframes and shared script parses',async()=>{
 const js=await read('assets/studio-responsive-showcase.js');
 assert.doesNotThrow(()=>new Script(js));
 assert.ok(js.includes("new URLSearchParams(location.search).has('preview')"));
});
