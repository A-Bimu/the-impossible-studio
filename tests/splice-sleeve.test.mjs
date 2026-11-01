import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {cleanText,escapeXml,renderSleeve,palettes,layouts} from '../drafts/2026-11-01-splice/app.mjs';
const html=readFileSync(new URL('../drafts/2026-11-01-splice/index.html',import.meta.url),'utf8');

test('three genuinely distinct editable SVG compositions',()=>{
  const outputs=layouts.map(layout=>renderSleeve({layout}));
  for(const svg of outputs){
    assert.match(svg,/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
    assert.match(svg,/viewBox="0 0 900 900"/);
    assert.match(svg,/<text /);
    assert.ok(svg.endsWith('</svg>'));
    assert.doesNotMatch(svg,/<image\b|<foreignObject\b|\b(?:href|src)=["']https?:\/\//);
  }
  assert.equal(new Set(outputs).size,3);
  assert.match(outputs[0],/<circle/);
  assert.match(outputs[1],/<path/);
  assert.match(outputs[2],/<rect/);
});
test('desktop and phone previews have unique SVG accessibility references',()=>{
  const desktop=renderSleeve();
  const phone=renderSleeve({preview:true});
  assert.match(desktop,/aria-labelledby="sleeve-title sleeve-desc"/);
  assert.match(phone,/aria-labelledby="phone-sleeve-title phone-sleeve-desc"/);
  assert.match(phone,/id="phone-sleeve-title"/);
  assert.doesNotMatch(phone,/id="sleeve-title"/);
});
test('user copy is escaped and cannot inject SVG markup',()=>{
  const svg=renderSleeve({title:'<script>alert(1)</script> &',artist:'A "quote" & <tag>'});
  assert.doesNotMatch(svg,/<script>|<tag>/);
  assert.match(svg,/&lt;script&gt;/);
  assert.match(svg,/&amp;/);
  assert.match(svg,/&quot;quote&quot;/);
  assert.equal(escapeXml("A&B"),'A&amp;B');
  assert.equal(cleanText('A\n B  C'),'A B C');
});
test('invalid options fall back safely and all palettes are supported',()=>{
  assert.equal(renderSleeve({layout:'unknown',palette:'unknown'}),renderSleeve({layout:'collision',palette:'plum'}));
  assert.equal(Object.keys(palettes).length,3);
  for(const palette of Object.keys(palettes)) assert.match(renderSleeve({palette}),new RegExp(palettes[palette].accent));
});
test('draft has functional editor, export, mobile mockup and no publication links',()=>{
  for(const id of ['album-title','artist-name','cover','phone-cover','phone-title','phone-artist','export','reset','status']) assert.ok(html.includes('id="'+id+'"'),id);
  assert.match(html,/type="module"/);
  assert.match(html,/URL\.createObjectURL\(blob\)/);
  assert.match(html,/anchor\.download=/);
  assert.match(html,/aria-pressed=/);
  assert.match(html,/@media\(max-width:760px\)/);
  assert.match(html,/Studio draft · not published/);
  assert.doesNotMatch(html,/<img\b|<iframe\b|<script[^>]+src=/);
});

test('long, wide release and artist names receive SVG width constraints',()=>{
  const long=renderSleeve({title:'W'.repeat(36),artist:'W'.repeat(28)});
  assert.match(long,/<text data-role="release-title"[^>]*textLength="788" lengthAdjust="spacingAndGlyphs"/);
  assert.match(long,/<text data-role="artist"[^>]*textLength="710" lengthAdjust="spacingAndGlyphs"/);
  const ordinary=renderSleeve({title:'SOFT COLLISION',artist:'LOW ORBIT'});
  assert.doesNotMatch(ordinary,/<text data-role="release-title"[^>]*textLength=/);
  assert.doesNotMatch(ordinary,/<text data-role="artist"[^>]*textLength=/);
  assert.match(long,/<text data-role="release-title"/);
});
