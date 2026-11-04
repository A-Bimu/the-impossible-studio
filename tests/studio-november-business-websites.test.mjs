import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Script} from 'node:vm';
const root=new URL('../',import.meta.url);
const read=p=>readFile(new URL(p,root),'utf8');
const projects=[
 {name:'STOCKWISE',slug:'stockwise',routes:['dashboard','sales','inventory','invoices','customers','alerts','activity'],functional:['ws-sale-form','ws-invoice-form','ws-inventory-rows','ws-movement-rows','ws-customer-rows','ws-dialog']},
 {name:'VELA HEALTH',slug:'vela-health',routes:['home','services','doctors','book','visits'],functional:['doctor-search','booking-form','data-time','data-cancel','localStorage']},
 {name:'MOVA',slug:'mova',routes:['overview','shipments','track','new','dispatch'],functional:['new-form','tracking-code','data-next','data-track','localStorage']}
];
function config(text){const m=text.match(/<script type="application\/json" class="sd-config">([\s\S]*?)<\/script>/);assert.ok(m,'source-grounded showcase JSON');return JSON.parse(m[1]);}
function inlineJs(html){return [...html.matchAll(/<script(?![^>]*src=)(?![^>]*application\/json)[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean);}
test('three responsive projects have distinct working source routes, scripts and honest demonstrations',async()=>{
 for(const p of projects){const marketing=await read('projects/'+p.slug+'/index.html');const code=p.slug==='stockwise'?await read('projects/stockwise/workspace.html'):marketing;
  assert.ok(code.includes('name="viewport"'),p.name+' responsive viewport');
  assert.ok((p.slug==='stockwise'?await read('assets/stockwise-retail-workspace.css'):code).includes('@media(max-width:'),p.name+' mobile rules');
  for(const route of p.routes)assert.ok(code.includes('data-'+(p.slug==='stockwise'?'view':'page')+'="'+route+'"'),p.name+' route '+route);
  for(const interaction of p.functional)assert.ok(code.includes(interaction),p.name+' interaction '+interaction);if(p.slug==='stockwise'){const engine=await read('assets/stockwise-retail-workspace.js');assert.doesNotThrow(()=>new Script(engine),'stockwise real-life engine script parses');for(const keyword of ['Walk-in sale','Invoice goods handed over','Customer return / refunded sale','Supplier delivery received','stockwise-studio-v2','i.paid=true','fulfilled:true'])assert.ok(engine.includes(keyword),'stockwise supports '+keyword);assert.ok(marketing.includes('sw-practical')&&marketing.includes('workspace.html#sales'),'homepage explains a real store workflow')}
  for(const js of inlineJs(code))assert.doesNotThrow(()=>new Script(js),p.name+' valid inline JS');
  assert.ok(/fictional|sample|demo/i.test(code),p.name+' honest sample state');
  assert.ok(!/<input[^>]+type="password"/.test(code),'No credentials collected');
 }
});
test('three case studies provide a single interactive, expandable device explorer with distinct working journeys',async()=>{
 const script=await read('assets/studio-unified-showcase.js');
 const style=await read('assets/studio-unified-showcase.css');
 assert.doesNotThrow(()=>new Script(script),'shared unified showcase compiles');
 for(const token of ['showModal','sx-live-frame','sx-dialog-frame','sx-mode-btn','aria-pressed','sx-journey','setMode','setJourney'])
  assert.ok(script.includes(token),'interactive demo component '+token);
 assert.ok(style.includes('.sx-dialog-phone')&&style.includes('.sx-laptop')&&style.includes('.sx-phone')&&style.includes('pointer-events:auto'),'truly interactive device previews');
 for(const p of projects){
  const html=await read('work/'+p.slug+'/index.html'),cfg=config(html);
  assert.equal(cfg.project,p.name);
  assert.equal(cfg.source,p.slug==='stockwise'?'../../projects/stockwise/workspace.html':'../../projects/'+p.slug+'/index.html?preview=1');
  assert.ok(Array.isArray(cfg.journeys)&&cfg.journeys.length>=4&&cfg.journeys.length<=5,p.name+' curated scenarios');
  assert.equal(new Set(cfg.journeys.map(j=>j.route)).size,cfg.journeys.length,p.name+' no duplicate journey');
  assert.ok(!cfg.journeys.some(view=>view.route==='#home'),p.name+' does not re-list marketing homepage');
  for(const j of cfg.journeys){
   assert.ok(p.routes.includes(j.route.slice(1)),p.name+' working source route '+j.route);
   assert.ok(j.title&&j.summary&&j.description,p.name+' meaningful journey copy');
  }
  for(const required of ['studio-unified-showcase.js','studio-unified-showcase.css','business-websites-showcase.css','sd-mount','creative process','not a commissioned','Explore working demo','Explore the interactive experience'])
   assert.ok(html.toLowerCase().includes(required.toLowerCase()),p.name+' includes '+required);
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
  assert.ok(html.includes('journeys')&&html.includes('studio-unified-showcase.js'),slug+' interactive presentation');
 }
 assert.equal((homepage.match(/class="business-photo"/g)||[]).length,3,'home gallery has three new photographic covers');
 assert.ok(!homepage.includes('STOCKWISE original purple inventory product brand cover'),'old gallery artwork not reused');
});


test('STOCKWISE targeted typography and mobile usability polish is wired across the three experiences',async()=>{
 const [home,workspace,casePage,css,js,qa]=await Promise.all([
  read('projects/stockwise/index.html'),read('projects/stockwise/workspace.html'),
  read('work/stockwise/index.html'),read('assets/stockwise-ui-polish.css'),
  read('assets/stockwise-ui-polish.js'),read('scripts/stockwise-layout-qa.mjs')
 ]);
 for(const [name,html]of [['homepage',home],['workspace',workspace],['case study',casePage]]){
  assert.ok(html.includes('stockwise-ui-polish.css'),name+' uses responsive collision fixes');
  assert.ok(html.includes('stockwise-ui-polish.js'),name+' uses behavior enhancements');
 }
 for(const phrase of ['data-sw-gallery-dir="-1"','data-sw-gallery-dir="1"','data-sw-gallery-status'])
  assert.ok(home.includes(phrase),'working gallery control '+phrase);
 for(const phrase of ['ws-mobile-nav-wrap','ws-mobile-nav-more'])
  assert.ok(workspace.includes(phrase),'working mobile navigation '+phrase);
 for(const phrase of ['.ws-shell .ws-heading h1','.sw-v3 .sw-yellow-message h2','.sw-v3 .sw-practical h2','.sw-v3 .sw-receipt-clip','.ws-shell .ws-table-scroll tbody td::before','.brand-stockwise .sd-screen.is-loaded iframe'])
  assert.ok(css.includes(phrase),'targeted collision or affordance rule '+phrase);
 for(const phrase of ['MutationObserver','data-label','scrollTo','sd-iframe','is-loaded'])
  assert.ok(js.includes(phrase),'working mobile table or frame enhancement '+phrase);
 assert.doesNotThrow(()=>new Script(js),'polish JS parses');
 const unified=await read('assets/studio-unified-showcase.js');
 assert.ok(unified.includes('showModal')&&unified.includes('setMode'),'case study has in-page expanded device flow');
 const showcaseConfig=config(casePage);
 assert.equal(showcaseConfig.source,'../../projects/stockwise/workspace.html','stockwise uses the real workspace');
 for(const item of showcaseConfig.journeys)assert.ok(item.route!=='#home','avoid homepage repetition');
 assert.ok(qa.includes('width:320')&&qa.includes('width:390')&&qa.includes('width:1440'),'tests narrow mobile, phone and desktop');
});
