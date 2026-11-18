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
 assert.match(art,/stroke="url\(#hot\)"/);
 assert.doesNotThrow(()=>new Script(js),'banking flow engine parses');
 assert.ok(js.includes('const screenRender={home,move,goals,cards,insights};'),'all five routes are wired to the renderer');
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
 assert.match(card,/data-yelo-card/);
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
 assert.match(css,/yelo-graffiti.svg/); 
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

test('DROP 002 researched streetwear palette and practical motion card implementation',async()=>{
 const paths=['projects/yelo/index.html','projects/yelo/money.html','projects/yelo/card.html','projects/yelo/culture.html'];
 const [css,caseCss,cardCss,cardJs,art,study,...pages]=await Promise.all([
  read('assets/yelo-neon-v3.css'),read('assets/yelo-case-neon-v3.css'),
  read('assets/yelo-holo-card.css'),read('assets/yelo-holo-card.js'),
  read('assets/yelo-graffiti.svg'),read('work/yelo/index.html'),
  ...paths.map(read)
 ]);
 for(const [name,style] of [['project',css],['case study',caseCss]]){
  assert.match(style,/#080710|#080611/i,name+' uses ink-black foundation');
  assert.ok(!/#[Ff]1[Ee][Ee][Ee]6|#[Ee][8-9][Dd][Dd][Cc][Cc]|#[Ff][Aa][Ff]4[Ee][Bb]/.test(style),name+' does not use old cream/beige palette');
  assert.ok(!/(?:background|color):(?:\\s*)green\\b/i.test(style),name+' has no green surface');
 }
 for(const [index,page] of pages.entries()){
  assert.match(page,/yelo-neon-v3\.css/,'dark style loaded '+paths[index]);
  assert.match(page,/yelo-holo-card\.css/,'physical card style loaded '+paths[index]);
  assert.match(page,/yelo-holo-card\.js/,'card interaction loaded '+paths[index]);
  assert.match(page,/content="#080710"/,'dark mobile browser chrome '+paths[index]);
 }
 assert.match(study,/yelo-case-neon-v3\.css/,'case study dark mode');
 assert.match(study,/yelo-holo-card\.js/,'case study can flip physical card');
 assert.match(study,/data-yelo-card/,'case study has physical card preview');
 assert.match(pages[0],/data-card-mode="decorative"/,'hero uses visual floating card');
 assert.match(pages[0],/data-card-mode="full"/,'home showcases interactive physical card');
 assert.match(pages[2],/data-card-mode="full"/,'card page interactive physical card');
 assert.match(art,/fill="#FF54AB"/,'vivid original spray art');
 assert.match(art,/stop-color="#FF286F"/,'fuchsia gradient in actual artwork');
 for(const token of ['#FF279E','#156AFF','#7737FF','#FFE019']){
  assert.ok(css.includes(token),'saturated palette includes '+token);
 }
 assert.match(cardCss,/backface-visibility:hidden/,'3D card has physical front and back');
 assert.match(cardCss,/perspective:1200px/,'real perspective');
 assert.match(cardCss,/box-shadow:/,'realistic physical depth');
 assert.match(cardCss,/yelo-card-chip/,'EMV-style fake chip');
 assert.match(cardCss,/prefers-reduced-motion:reduce/,'accessible motion reduction');
 assert.match(cardJs,/data-card-flip/,'card flip button');
 assert.match(cardJs,/data-card-pause/,'explicit pause animation control');
 assert.match(cardJs,/pointermove/,'interactive pointer tilt');
 assert.doesNotThrow(()=>new Script(cardJs),'motion engine parses');
 assert.doesNotThrow(()=>new Script(await read('assets/yelo.js')),'banking engine still parses');
 const research=await read('creative-direction/YELO-DROP-002-RESEARCH.md');
 for(const domain of ['sprayground.com','palaceskateboards.com','unsplash.com','w3.org'])assert.ok(research.includes(domain),'source-grounded research '+domain);
});
