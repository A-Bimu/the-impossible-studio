import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Script} from 'node:vm';

const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');

test('YELO source has responsive real-photo campaign, original card and a working demo',async()=>{
 const [html,css,js]=await Promise.all([
  read('projects/yelo/index.html'),
  read('assets/yelo.css'),
  read('assets/yelo.js')
 ]);
 assert.match(html,/<meta name="viewport"/,'responsive viewport');
 assert.match(css,/@media\(max-width:600px\)/,'phone rules');
 assert.match(css, /prefers-reduced-motion/,'reduced motion');
 assert.match(html, /class="hero-person" src="https:\/\/images\.unsplash\.com\/photo-/,'real street portrait');
 assert.match(html, /hero-card-wrap/,'real coded graffiti-card composition');
 assert.match(html, /class="phone"/,'physical phone mockup');
 assert.match(html, /id="yelo-live-preview"/,'working in-page interactive preview');
 assert.match(html, /id="action-dialog"/,'native confirmation dialog');
 assert.match(html, /YELO is not an official Co-op Bank product/,'no false affiliation');
 assert.doesNotThrow(()=>new Script(js),'app JS parses');
 for(const route of ['home','move','goals','cards','insights']){
  assert.ok(js.includes("'"+route+"'"),'route '+route+' implemented');
  assert.ok(html.includes('data-preview-route="'+route+'"'),'route '+route+' is explorable');
 }
 for(const action of ['send','bills','save','add','freeze','reset']){
  assert.ok(js.includes(action),'real sample '+action+' interaction exists');
 }
 for(const guard of ['Number.isFinite','amount>state.balance','state.goal+amount>state.target','localStorage.setItem','dialog.showModal','esc(v)']){
  assert.ok(js.includes(guard),'sample financial safety or interaction check '+guard);
 }
 assert.ok(!/type=["']password/.test(html),'does not request credentials');
});

test('case study contains real photos, differentiated research, and five connected product journeys',async()=>{
 const html=await read('work/yelo/index.html');
 const markers=['01 / RESEARCH','02 / CREATIVE','03 / THE PHYSICAL','04 / PHONE','05 / CREATIVE PROCESS','06 / HONEST','class="sd-config"','studio-unified-showcase.js'];
 for(const marker of markers)assert.ok(html.includes(marker),'case-study section '+marker);
 assert.match(html,/yea\.co-opbank\.co\.ke\/how-to-join/,'research source is linked');
 assert.match(html,/not an official or commissioned Co-op Bank project/,'not presented as commissioned work');
 assert.ok((html.match(/images\.unsplash\.com\/photo-/g)||[]).length>=4,'multiple real-life editorial photographs included');
 const config=html.match(/<script type="application\/json" class="sd-config">([\s\S]*?)<\/script>/);
 assert.ok(config,'shared interactive device experience config');
 const cfg=JSON.parse(config[1]);assert.equal(cfg.project,'YELO');
 assert.equal(cfg.source,'../../projects/yelo/index.html?preview=1');
 assert.equal(cfg.journeys.length,5);
 assert.deepEqual(cfg.journeys.map(j=>j.route),['#home','#move','#goals','#cards','#insights']);
});

test('YELO is visible on Studio listings, while MOVA stays on hold',async()=>{
 const [home,presentations,daily]=await Promise.all([read('index.html'),read('presentations/index.html'),read('daily/index.html')]);
 assert.match(home,/href="work\/yelo\/"/);
 assert.match(presentations,/href="\.\.\/work\/yelo\/#responsive-views"/);
 assert.match(daily,/href="\.\.\/work\/yelo\/"/);
 assert.ok(home.includes('data-studio-on-hold="mova" hidden'),'MOVA remains held on homepage');
 assert.ok(presentations.includes('data-studio-on-hold="mova" hidden'),'MOVA remains held in presentations');
 assert.ok(daily.includes('data-studio-on-hold="mova" hidden'),'MOVA remains held in journal');
 assert.equal((home.match(/class="business-photo"/g)||[]).length,3,'existing Studio cover media unchanged');
 assert.match(home,/class="yelo-cover-photo"/,'YELO has its own photographic card cover');
});