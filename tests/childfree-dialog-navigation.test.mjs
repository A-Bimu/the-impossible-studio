import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
const html=readFileSync(new URL('../work/childfree/index.html',import.meta.url),'utf8');
const js=readFileSync(new URL('../work/childfree/childfree.js',import.meta.url),'utf8');
function el(dataset={}){
 const events={};
 return {dataset,hidden:false,disabled:false,textContent:'',focusCount:0,
  style:{getPropertyValue:()=> '50%',setProperty(){}},
  addEventListener:(name,fn)=>{events[name]=fn;},
  fire:(name,event={})=>events[name]?.(event),
  setAttribute(name,value){this[name]=value;},
  focus(){this.focusCount++;}};
}
function setup(){
 const cards=Array.from({length:9},(_,i)=>el({title:'Concept '+(i+1),category:['whimsical','chilled','bold'][Math.floor(i/3)]}));
 const filters=['all','whimsical','chilled','bold'].map(filter=>el({filter}));
 const previous=el(),next=el(),close=el(),art=el(),title=el(),category=el(),position=el(),count=el(),dialog=el();
 dialog.querySelector=selector=>({'[data-previous-concept]':previous,'[data-next-concept]':next,'[data-close-dialog]':close})[selector];
 dialog.showModal=()=>{dialog.open=true;};
 dialog.close=()=>{dialog.open=false;dialog.fire('close');};
 const ids={'pin-grid':{querySelectorAll:()=>cards},'pin-detail':dialog,'pin-count':count,'pin-detail-art':art,'pin-detail-title':title,'pin-detail-category':category,'pin-detail-position':position};
 new Script(js).runInNewContext({document:{getElementById:id=>ids[id],querySelectorAll:()=>filters}});
 return {cards,filters,previous,next,close,dialog,title,category,position,count};
}
test('dialog controls are labelled and announce selected concept',()=>{
 assert.match(html,/data-previous-concept aria-label="Previous concept"/);
 assert.match(html,/data-next-concept aria-label="Next concept"/);
 assert.match(html,/id="pin-detail-position" role="status" aria-live="polite"/);
});
test('all-concept paging stops at boundaries and restores focus',()=>{
 const v=setup();v.cards[0].fire('click');
 assert.equal(v.previous.disabled,true);
 v.previous.fire('click');assert.equal(v.title.textContent,'Concept 1');
 for(let i=1;i<9;i++)v.next.fire('click');
 assert.equal(v.title.textContent,'Concept 9');
 assert.equal(v.next.disabled,true);
 assert.equal(v.previous.focusCount,1,'focus moves to Previous when Next becomes disabled');
 v.next.fire('click');assert.equal(v.title.textContent,'Concept 9');
 assert.equal(v.position.textContent,'9 of 9: Concept 9');
 v.close.fire('click');assert.equal(v.cards[0].focusCount,1);
});
test('paging stays within selected category and restores the originating card',()=>{
 const v=setup();v.filters[2].fire('click');
 assert.equal(v.count.textContent,'Showing 3 Chilled / everyday concepts');
 assert.equal(v.cards.filter(c=>!c.hidden).length,3);
 v.cards[4].fire('click');
 assert.equal(v.position.textContent,'2 of 3: Concept 5');
 v.next.fire('click');assert.equal(v.title.textContent,'Concept 6');
 assert.equal(v.next.disabled,true);
 v.previous.fire('click');v.previous.fire('click');
 assert.equal(v.title.textContent,'Concept 4');
 assert.equal(v.previous.disabled,true);
 assert.equal(v.next.focusCount,1,'focus moves to Next when Previous becomes disabled');
 v.close.fire('click');assert.equal(v.cards[4].focusCount,1);
});
