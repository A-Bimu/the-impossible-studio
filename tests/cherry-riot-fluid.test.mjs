import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Script} from 'node:vm';
const base=new URL('../daily/cherry-riot/',import.meta.url);
test('real CHERRY RIOT hero is beneath the scroll-scrubbed jam canvas',async()=>{
 const html=await readFile(new URL('index.html',base),'utf8');
 assert.equal((html.match(/id="hero"/g)||[]).length,1);
 assert.equal((html.match(/id="jam-fluid"/g)||[]).length,1);
 assert.ok(html.includes('class="jam-prelude"'));
 assert.ok(html.indexOf('id="jam-fluid"')>html.indexOf('id="hero"'));
 assert.ok(!html.includes('id="jamCurtain"'));
 assert.ok(!html.includes('class="real-fruit'));
 assert.ok(html.includes('jam-fluid.css')&&html.includes('jam-fluid.js'));
 assert.ok(html.includes('id="cartDialog"'));
});
test('motion script parses and scrubs genuine liquid silhouette against scrolling',async()=>{
 const js=await readFile(new URL('jam-fluid.js',base),'utf8');
 assert.doesNotThrow(()=>new Script(js,{filename:'jam-fluid.js'}));
 for(const needle of ['requestAnimationFrame','Path2D','ctx.clip(liquid)','texture.naturalWidth','scrollY','prefers-reduced-motion','path.bezierCurveTo'])assert.ok(js.includes(needle),needle);
});
test('original macro jam texture is checked into the repository',async()=>{
 const bytes=await readFile(new URL('jam-texture.webp',base));
 assert.equal(bytes.subarray(0,4).toString(),'RIFF');
 assert.equal(bytes.subarray(8,12).toString(),'WEBP');
 assert.ok(bytes.length>3000);
});
