import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Script} from 'node:vm';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');

test('YELO landing has original edited streetwear composition and functioning demo',async()=>{
 const [html,css,js,art]=await Promise.all([
  read('projects/yelo/index.html'),read('assets/yelo-rebuild.css'),
  read('assets/yelo.js'),read('assets/yelo-graffiti.svg')
 ]);
 assert.match(html,/<meta name="viewport"/);
 assert.match(css,/@media\(max-width:600px\)/);
 assert.match(css,/prefers-reduced-motion/);
 assert.match(html,/class="hero-person" src="https:\/\/images\.unsplash\.com\/photo-/);
 assert.match(html,/hero-card-wrap/);
 assert.match(html,/class="phone"/);
 assert.match(html,/id="yelo-live-preview"/);
 assert.match(html,/id="action-dialog"/);
 assert.match(html,/photographs|streetwear|NAIROBI/i);
 assert.ok(!html.includes('class="feature-grid"'),'no repetitive feature tiles');
 assert.match(html,/class="feature-list"/,'editorial function index replaces repetitive cards');
 assert.match(css,/editorial-split/);
 assert.match(css,/background:var\(--paper\)/);
 assert.match(art,/<svg/);
 assert.match(art,/stroke="#ef6828"/);
 assert.doesNotThrow(()=>new Script(js),'banking flow engine parses');
 for(const route of ['home','move','goals','cards','insights']){
  assert.ok(js.includes("'"+route+"'"),'implemented '+route+' route');
  assert.ok(html.includes('data-preview-route="'+route+'"'),'link to '+route+' exists');
 }
 for(const action of ['send','bills','save','add','freeze','reset'])assert.ok(js.includes(action),'real sample action '+action);
 for(const guard of ['Number.isFinite','amount>state.balance','state.goal+amount>state.target','localStorage.setItem','dialog.showModal','esc(t.name)']){
  assert.ok(js.includes(guard),'financial demo guard '+guard);
 }
 assert.ok(!/type=["']password/.test(html),'no credentials');
});

test('new YELO Money, Card and Culture pages are distinct and linked',async()=>{
 const [home,money,card,culture,pagesCSS]=await Promise.all([
  read('projects/yelo/index.html'),read('projects/yelo/money.html'),
  read('projects/yelo/card.html'),read('projects/yelo/culture.html'),
  read('assets/yelo-pages.css')
 ]);
 for(const slug of ['money','card','culture'])assert.ok(home.includes('href="'+slug+'.html"'),'home links to '+slug);
 for(const [slug,html] of [['money',money],['card',card],['culture',culture]]){
  assert.match(html,/<meta name="viewport"/,slug+' mobile viewport');
  assert.ok(html.includes('<h1'),slug+' has main heading');
  assert.ok(html.includes('href="./"'),slug+' navigation to landing');
  assert.ok(html.includes('yelo-pages.css'),slug+' editorial styles');
  assert.ok(html.includes('The Impossible Studio')||html.includes('THE IMPOSSIBLE'),slug+' studio attribution');
 }
 assert.match(money,/index\.html\?preview=1#move/);
 assert.match(card,/index\.html\?preview=1#cards/);
 assert.match(card,/class="graffiti-card"/);
 assert.ok((culture.match(/images\.unsplash\.com\/photo-/g)||[]).length>=3);
 assert.match(culture,/Dwayne joe/);
 assert.match(pagesCSS,/@media\(max-width:620px\)/);
});

test('research-based case study has real photography, anti-template decisions and five working journeys',async()=>{
 const html=await read('work/yelo/index.html');
 const css=await read('assets/yelo-case-rebuild.css');
 assert.match(html,/01 \/ COVER STORY/);
 assert.match(html,/02 \/ THE REAL-WORLD CONTEXT/);
 assert.match(html,/03 \/ CREATIVE DIRECTION/);
 assert.match(html,/04 \/ THE BRAND SYSTEM/);
 assert.match(html,/THE CARD/);
 assert.match(html,/studio-unified-showcase.js/);
 assert.match(html,/not a Co-op Bank redesign or official app/);
 assert.match(html,/co-opbank\.co\.ke\/personal-banking/);
 assert.match(html,/yelo-graffiti.svg/); 
 assert.ok((html.match(/images\.unsplash\.com\/photo-/g)||[]).length>=3,'real location-grounded editorial portraits');
 assert.match(html,/href="\.\.\/\.\.\/projects\/yelo\/money\.html"/);
 assert.match(html,/href="\.\.\/\.\.\/projects\/yelo\/culture\.html"/);
 assert.match(html,/href="\.\.\/\.\.\/projects\/yelo\/card\.html"/);
 assert.match(css,/\.process-line/);
 assert.match(css,/\.identity-grid/);
 assert.ok(!css.includes('border-radius:100px'),'no universal pill aesthetic');
 const m=html.match(/<script type="application\/json" class="sd-config">([\s\S]*?)<\/script>/);
 assert.ok(m,'unified product explorer configuration');
 const cfg=JSON.parse(m[1]);
 assert.equal(cfg.project,'YELO');
 assert.equal(cfg.source,'../../projects/yelo/index.html?preview=1');
 assert.deepEqual(cfg.journeys.map(j=>j.route),['#home','#move','#goals','#cards','#insights']);
});

test('Studio shows YELO but maintains temporary MOVA display hold',async()=>{
 const [home,presentations,daily]=await Promise.all([
 read('index.html'),read('presentations/index.html'),read('daily/index.html')
 ]);
 assert.match(home,/href="work\/yelo\/"/);
 assert.match(presentations,/href="\.\.\/work\/yelo\/#responsive-views"/);
 assert.match(daily,/href="\.\.\/work\/yelo\/"/);
 for(const html of [home,presentations,daily])assert.ok(html.includes('data-studio-on-hold="mova" hidden'),'MOVA stays unpublished');
 assert.match(home,/class="yelo-cover-photo"/);
});