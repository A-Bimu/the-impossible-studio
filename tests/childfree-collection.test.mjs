import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
const html=readFileSync(new URL('../work/childfree/index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../work/childfree/childfree.css',import.meta.url),'utf8');
const js=readFileSync(new URL('../work/childfree/childfree.js',import.meta.url),'utf8');
test('archived artwork and honest concept provenance remain visible',()=>{
 assert.match(html,/src="\.\.\/\.\.\/assets\/childfree-original\.webp"/);
 assert.match(html,/final approved concept-sheet PNG remains unconfirmed/);
 assert.match(html,/not manufactured or for sale/);
 assert.doesNotMatch(html,/add to cart|buy now|checkout/i);
});
test('nine inspectable concepts in three filter groups',()=>{
 assert.equal((html.match(/class="pin-card"/g)||[]).length,9);
 for(const category of ['whimsical','chilled','bold']){
  assert.equal((html.match(new RegExp('data-category="'+category+'"','g'))||[]).length,3);
  assert.match(html,new RegExp('data-filter="'+category+'"'));
 }
 assert.match(html,/aria-pressed="true"/);
 assert.match(html,/aria-live="polite"/);
 assert.match(html,/aria-haspopup="dialog"/);
 assert.match(html,/<dialog[^>]*aria-labelledby=/);
});
test('detail interaction preserves focus and has no HTML injection',()=>{
 assert.doesNotThrow(()=>new Script(js));
 assert.match(js,/dialog\.showModal\(\)/);
 assert.match(js,/trigger\.focus\(\)/);
 assert.doesNotMatch(js,/innerHTML/);
 assert.match(css,/background-image:url\('\.\.\/\.\.\/assets\/childfree-original\.webp'\)/);
 assert.match(css,/\.pin-card\[hidden\]\{display:none\}/);
 assert.match(css,/prefers-reduced-motion:reduce/);
});
