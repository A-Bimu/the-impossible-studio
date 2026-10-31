import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Script} from 'node:vm';
const root=new URL('../',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');
test('CHERRY RIOT project includes both approved case study formats',async()=>{
 const html=await read('daily/cherry-riot/case-study/index.html');
 for(const text of ['BRAND EXPERIENCE / PRODUCT WEBSITE','01 / PROJECT OVERVIEW','02 / RESPONSIVE EXPERIENCE','03 / CREATIVE DIRECTION','04 / BRAND & PACKAGING','05 / THE EXPERIENCE','06 / RESPONSIVE WEBSITE DESIGN','Desktop views','Mobile views','07 / DESIGN DEVELOPMENT','08 / TRY IT YOURSELF'])assert.ok(html.includes(text),text);
 for(const id of ['overviewDevices','laptopGallery','phoneGallery','demoModal','activeDemoFrame','openStandaloneDemo'])assert.ok(html.includes('id="'+id+'"'),id);
 assert.ok(html.includes('../shop/'));
});
test('six genuine responsive screens and an embedded full-size demo',async()=>{
 const js=await read('daily/cherry-riot/case-study/case-study.js');
 assert.doesNotThrow(()=>new Script(js));
 for(const s of ['laptopViews','phoneViews','deviceHTML','1200','390','iframe','ResizeObserver','showModal','aria-pressed','activeDemoFrame'])assert.ok(js.includes(s),s);
 assert.ok(js.includes("title:'HOMEPAGE'"));
 assert.ok(js.includes("title:'CART / SHOP PAGE'"));
 assert.ok(js.includes("title:'MOBILE · PAIRINGS PAGE'"));
 const css=await read('daily/cherry-riot/case-study/case-study.css');
 for(const s of ['.laptop-lid','.laptop-base','.phone-shell','.screen-viewport','.modal-stage.is-phone','max-width:480px','prefers-reduced-motion'])assert.ok(css.includes(s),s);
});
test('working ecommerce demo has meaningful distinct pages and an honest no-payment cart',async()=>{
 const html=await read('daily/cherry-riot/shop/index.html');
 const js=await read('daily/cherry-riot/shop/shop.js');
 assert.doesNotThrow(()=>new Script(js));
 for(const view of ['function home()','function product()','function cart()','function pairings()','function story()'])assert.ok(js.includes(view),view);
 for(const action of ['addToCart','localStorage.setItem','quantity','data-action','checkout','showModal','demo bag'])assert.ok(js.includes(action),action);
 assert.ok(html.includes('No payments are processed.'));
 assert.ok(js.includes('No real purchases.')||js.includes('No payment'));
});
test('journal and live site link to case study without replacing other projects',async()=>{
 const journal=await read('daily/index.html');
 const live=await read('daily/cherry-riot/index.html');
 assert.ok(journal.includes('./cherry-riot/case-study/'));
 assert.ok(journal.includes('HOTEL NOCTURNE'));
 assert.ok(live.includes('case-study/'));
 assert.ok(live.includes('jam-fluid.js'));
});
