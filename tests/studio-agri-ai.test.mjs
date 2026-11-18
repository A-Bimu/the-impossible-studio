import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Script} from 'node:vm';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');

test('AGRI AI: research-grounded site has working route links and image-led art direction',async()=>{
 const [home,css,js,caseHtml]=await Promise.all([
  read('projects/agri-ai/index.html'),
  read('assets/agri-ai.css'),
  read('assets/agri-ai.js'),
  read('work/agri-ai/index.html')
 ]);
 assert.match(home,/<meta name="viewport"/);
 assert.match(home,/class="hero-visual"/);
 assert.match(home,/photo-1746014929708-fcb859fd3185/,'real African farm portrait');
 assert.match(home,/photo-1707378844988-5d8a69e0f7e3/,'real Kenyan drip-irrigation photograph');
 for(const route of ['crop-check','farm-planner','market-guide']){
  assert.ok(home.includes('href="'+route+'.html"'),'user can open '+route);
  assert.ok(home.includes('data-preview="'+route+'"'),'in-page demo shows '+route);
 }
 assert.match(home,/id="agri-preview"/,'working interactive demo frame');
 assert.match(css,/@media\(max-width:580px\)/,'mobile-first adaptation');
 assert.match(css,/prefers-reduced-motion:reduce/,'motion accessibility');
 for(const token of ['#080e22','#315afa','#ffd21d','#ff632e','#8652ee']){
  assert.ok(css.includes(token),'palette contains '+token);
 }
 assert.ok(!/#(?:f1eee6|faf4eb|f9f2ea|e6d9c4)/i.test(css),'no old cream/beige tones');
 assert.ok(!/\b(?:green|beige|nude)\b/i.test(css),'no banned design-colour names');
 assert.doesNotThrow(()=>new Script(js),'interaction JS must parse');
 assert.match(js,/URL\.createObjectURL/,'photo preview stays local');
 assert.match(js,/localStorage\.setItem/,'example farm checklists persist locally');
 assert.match(js,/Number\.isFinite/,'market price input checks');
 assert.match(caseHtml,/farmerchat\.digitalgreen\.org/,'official Farmer.Chat research linked');
 assert.match(caseHtml,/bigdata\.cgiar\.org/,'official Nuru research linked');
 assert.match(caseHtml,/opportunity\.org/,'Kenyan FarmerAI research linked');
});

test('AGRI AI: connected crop, planning and market pages do not falsely claim real AI or market data',async()=>{
 const [crop,plan,market]=await Promise.all([
  read('projects/agri-ai/crop-check.html'),
  read('projects/agri-ai/farm-planner.html'),
  read('projects/agri-ai/market-guide.html')
 ]);
 const htmls=[crop,plan,market];
 for(const html of htmls){
  assert.match(html,/<meta name="viewport"/);
  assert.match(html,/agri-ai\.css/);
  assert.match(html,/agri-ai\.js/);
  assert.match(html,/href="\.\/"/);
  assert.match(html,/href="\.\.\/\.\.\/work\/agri-ai\/"/);
  assert.match(html,/DEMONSTRATION|EXAMPLE|NO LIVE|PROTOTYPE/i);
 }
 for(const id of ['crop-form','crop-photo','crop-name','crop-symptom','crop-result'])assert.ok(crop.includes('id="'+id+'"'),'crop form '+id);
 for(const id of ['planner-form','plan-crop','plan-stage','plan-tasks','plan-result'])assert.ok(plan.includes('id="'+id+'"'),'planner form '+id);
 for(const id of ['market-form','market-crop','market-qty','market-price','market-result'])assert.ok(market.includes('id="'+id+'"'),'market form '+id);
 assert.match(crop,/No trained image classifier is connected/);
 assert.match(plan,/No weather API/);
 assert.match(market,/NO LIVE MARKET PRICES/);
 assert.match(market,/not a live Kenyan market feed/);
});

test('AGRI AI: case study offers five genuine responsive sources and no invented live services',async()=>{
 const html=await read('work/agri-ai/index.html');
 const css=await read('assets/agri-ai-case.css');
 assert.match(html,/studio-unified-showcase\.js/);
 assert.match(html,/sd-config/);
 assert.match(html,/width=device-width/);
 assert.match(html,/does not analyse uploaded photos/);
 assert.match(html,/No crop photo is transmitted/);
 assert.match(html,/unsplash\.com\/license/);
 assert.match(css,/\.unified/);
 const match=html.match(/<script type="application\/json" class="sd-config">([\s\S]*?)<\/script>/);
 assert.ok(match,'device explorer config');
 const cfg=JSON.parse(match[1]);
 assert.equal(cfg.project,'AGRI AI');
 assert.equal(cfg.journeys.length,5);
 assert.equal(new Set(cfg.journeys.map(x=>x.source+x.route)).size,5,'five distinct screen locations');
 for(const x of cfg.journeys)assert.match(x.source,/^\.\.\/\.\.\/projects\/agri-ai\//);
});

test('AGRI AI: Studio portfolio integration preserves MOVA hidden',async()=>{
 const [home,pres,daily]=await Promise.all([
  read('index.html'),read('presentations/index.html'),read('daily/index.html')
 ]);
 assert.match(home,/href="work\/agri-ai\/"/);
 assert.match(home,/class="agri-cover-photo"/);
 assert.match(pres,/href="\.\.\/work\/agri-ai\/#responsive-views"/);
 assert.match(daily,/href="\.\.\/work\/agri-ai\/"/);
 for(const html of [home,pres,daily])assert.ok(html.includes('data-studio-on-hold="mova" hidden'),'MOVA public hold unchanged');
});