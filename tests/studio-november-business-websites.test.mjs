import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Script} from 'node:vm';
const root=new URL('../',import.meta.url);
const read=p=>readFile(new URL(p,root),'utf8');
const projects=[
 {name:'STOCKWISE',slug:'stockwise',routes:['dashboard','inventory','invoices','customers','alerts'],functional:['data-adjust','data-paid','entry-form','localStorage','low-count']},
 {name:'VELA HEALTH',slug:'vela-health',routes:['home','services','doctors','book','visits'],functional:['doctor-search','booking-form','data-time','data-cancel','localStorage']},
 {name:'MOVA',slug:'mova',routes:['overview','shipments','track','new','dispatch'],functional:['new-form','tracking-code','data-next','data-track','localStorage']}
];
function config(text){const m=text.match(/<script type="application\/json" class="sd-config">([\s\S]*?)<\/script>/);assert.ok(m,'source-grounded showcase JSON');return JSON.parse(m[1]);}
function inlineJs(html){return [...html.matchAll(/<script(?![^>]*src=)(?![^>]*application\/json)[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean);}
test('three responsive projects have distinct working source routes, scripts and honest demonstrations',async()=>{
 for(const p of projects){const code=await read('projects/'+p.slug+'/index.html');
  assert.ok(code.includes('name="viewport"'),p.name+' responsive viewport');
  assert.ok(code.includes('@media(max-width:'),p.name+' mobile rules');
  for(const route of p.routes)assert.ok(code.includes('data-'+(p.slug==='stockwise'?'view':'page')+'="'+route+'"'),p.name+' route '+route);
  for(const interaction of p.functional)assert.ok(code.includes(interaction),p.name+' interaction '+interaction);
  for(const js of inlineJs(code))assert.doesNotThrow(()=>new Script(js),p.name+' valid inline JS');
  assert.ok(/fictional|sample|demo/i.test(code),p.name+' honest sample state');
  assert.ok(!/<input[^>]+type="password"/.test(code),'No credentials collected');
 }
});
test('new case studies show three real laptop and five real phone project views',async()=>{
 for(const p of projects){const html=await read('work/'+p.slug+'/index.html'),cfg=config(html);
  assert.equal(cfg.desktop.length,3,p.name);assert.equal(cfg.phone.length,5,p.name);
  assert.equal(cfg.project,p.name);assert.equal(cfg.source,'../../projects/'+p.slug+'/index.html?preview=1');
  assert.equal(new Set(cfg.desktop.map(x=>x.route)).size,3);assert.equal(new Set(cfg.phone.map(x=>x.route)).size,5);
  for(const view of [...cfg.desktop,...cfg.phone])assert.ok(p.routes.includes(view.route.slice(1))||(p.slug==='stockwise'&&view.route==='#home'),p.name+' source section '+view.route);
  for(const required of ['studio-responsive-showcase.js','studio-responsive-showcase.css','business-websites-showcase.css','sd-mount','creative process','not a commissioned','Explore working demo'])assert.ok(html.toLowerCase().includes(required.toLowerCase()),p.name+' includes '+required);
 }
});
test('new cards are reachable from public Studio home, presentations and journal',async()=>{
 const homepage=await read('index.html'),presentations=await read('presentations/index.html'),journal=await read('daily/index.html');
 for(const p of projects){
  assert.ok(homepage.includes('href="work/'+p.slug+'/"'),p.name+' homepage');
  assert.ok(presentations.includes('href="../work/'+p.slug+'/#responsive-views"'),p.name+' hub');
  assert.ok(journal.includes('href="../work/'+p.slug+'/"'),p.name+' journal');
 }
 assert.ok(homepage.includes('work/zebra/')&&homepage.includes('work/deep-ink/'),'Preserve existing approved projects');
 const css=await read('assets/business-websites-showcase.css');assert.ok(css.includes('.brand-vela')&&css.includes('.brand-stockwise')&&css.includes('.brand-mova'));
});

test('art direction refresh uses three non-repeating identities, actual imagery and motion affordances',async()=>{
 const [stock,vela,mova,homepage]=await Promise.all([
  read('projects/stockwise/index.html'),read('projects/vela-health/index.html'),
  read('projects/mova/index.html'),read('index.html')
 ]);
 const signatures=[
  ['STOCKWISE',stock,['#ffe500','Archivo Black','sw-hero-visual','sw-marquee','brand-cover','photo-1441986300917-64674bd600d8']],
  ['VELA HEALTH',vela,['#a20d45','Instrument Serif','vela-editorial','doctor-cards','Illustrative licensed stock photograph','photo-1559839734-2b71ea197ec2']],
  ['MOVA',mova,['#1355e8','Barlow Condensed','mova-editorial','quick-track-form','mova-pulse','photo-1586528116311-ad8dd3c8310d']]
 ];
 for(const [brand,html,required] of signatures){
  for(const value of required)assert.ok(html.includes(value),brand+' missing '+value);
  assert.match(html,/<img [^>]*alt="[^"]+"/,brand+' photo should have alt text');
  assert.ok(html.includes('prefers-reduced-motion'),brand+' respects reduced motion');
  assert.ok(html.indexOf('/* '+(brand==='STOCKWISE'?'STOCKWISE':brand==='VELA HEALTH'?'VELA HEALTH':'MOVA')+' 02')>0,brand+' has a dedicated refreshed design system');
  for(const js of inlineJs(html))assert.doesNotThrow(()=>new Script(js),brand+' scripts compile');
 }
 for(const slug of ['stockwise','vela-health','mova']){
  const html=await read('work/'+slug+'/index.html');
  assert.ok(html.includes('images.unsplash.com'),slug+' case study photography');
  assert.ok(html.includes('unsplash.com/license'),slug+' imagery license note');
  assert.ok(html.includes('3')||html.includes('desktop'),slug+' presentation');
 }
 assert.equal((homepage.match(/class="business-photo"/g)||[]).length,3,'home gallery has three new photographic covers');
 assert.ok(!homepage.includes('STOCKWISE original purple inventory product brand cover'),'old gallery artwork not reused');
});
