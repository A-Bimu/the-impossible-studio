// SPLICE is an original, offline record-sleeve composition study.
// Exported SVG retains live text and editable vector shapes.
export const palettes = Object.freeze({
  plum: {ink:'#25162e', paper:'#f7eadd', accent:'#ff7358', highlight:'#c8b2fa'},
  midnight: {ink:'#142039', paper:'#eaf0f2', accent:'#f09a65', highlight:'#9dbbd9'},
  umber: {ink:'#29211f', paper:'#f4ead9', accent:'#b45f42', highlight:'#e7c47b'}
});
export const layouts = Object.freeze(['collision','fold','frequency']);
export function cleanText(value, limit=36) {
  return String(value ?? '').replace(/[\u0000-\u001f\u007f-\u009f]/g,' ')
    .replace(/\s+/g,' ').trim().slice(0,limit);
}
export function escapeXml(value) {
  return String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
}
function titleLines(value) {
  if(value.length <= 20) return [value];
  let cut=value.lastIndexOf(' ',20);
  if(cut < 10) cut=20;
  return [value.slice(0,cut).trim(),value.slice(cut).trim()];
}
// Keep unusually wide editable copy inside the physical sleeve's type area.
// SVG textLength is only applied when a conservative glyph-width estimate
// exceeds the available space; the same rule applies to preview and export.
function fitTextAttributes(value, fontSize, maxWidth, tracking=0) {
  let units=0;
  for(const glyph of value) {
    if(/[MWmw@%&]/u.test(glyph)) units+=1.05;
    else if(/[ilI1!.,:;'\x60|]/u.test(glyph)) units+=0.42;
    else if(/\\s/u.test(glyph)) units+=0.38;
    else if(/[fjrt]/u.test(glyph)) units+=0.55;
    else if(/[A-Z0-9]/u.test(glyph)) units+=0.85;
    else if(/[a-z]/u.test(glyph)) units+=0.70;
    else units+=1.10;
  }
  const estimate=units*fontSize+Math.max(0,Array.from(value).length-1)*tracking;
  return estimate>maxWidth?' textLength="'+maxWidth+'" lengthAdjust="spacingAndGlyphs"':'';
}
function artwork(layout, p) {
  if(layout === 'fold') return [
    '<path d="M-80 160L480 -60L930 140L350 380Z" fill="'+p.highlight+'"/>',
    '<path d="M-100 380L520 140L980 380L360 625Z" fill="'+p.accent+'"/>',
    '<path d="M0 580L620 340L1000 540L670 670L300 670Z" fill="'+p.paper+'"/>',
    '<path d="M130 0L710 650" stroke="'+p.ink+'" stroke-width="9" opacity=".7"/>',
    '<circle cx="675" cy="115" r="48" fill="'+p.accent+'"/>'
  ].join('');
  if(layout === 'frequency') {
    const heights=[140,270,420,210,355,490,310,160,440,240,370,180];
    const bars=heights.map((height,i)=>'<rect x="'+(56+i*67)+'" y="'+(600-height)+'" width="38" height="'+height+'" fill="'+(i%3===0?p.accent:p.highlight)+'"/>').join('');
    return '<circle cx="450" cy="310" r="250" fill="none" stroke="'+p.accent+'" stroke-width="2"/>'+bars+
      '<path d="M40 600H860" stroke="'+p.paper+'" stroke-width="8"/>';
  }
  return [
    '<circle cx="370" cy="312" r="214" fill="none" stroke="'+p.highlight+'" stroke-width="84"/>',
    '<circle cx="545" cy="325" r="208" fill="none" stroke="'+p.accent+'" stroke-width="76"/>',
    '<circle cx="445" cy="312" r="78" fill="'+p.paper+'"/>',
    '<path d="M80 585L790 70" stroke="'+p.paper+'" stroke-width="6"/>',
    '<circle cx="768" cy="116" r="26" fill="'+p.paper+'"/>'
  ].join('');
}
export function renderSleeve(options={}) {
  const layout=layouts.includes(options.layout)?options.layout:'collision';
  const p=palettes[options.palette]||palettes.plum;
  const title=cleanText(options.title,36)||'SOFT COLLISION';
  const artist=cleanText(options.artist,28)||'LOW ORBIT';
  const titleId=options.preview===true?'phone-sleeve-title':'sleeve-title';
  const descId=options.preview===true?'phone-sleeve-desc':'sleeve-desc';
  const lines=titleLines(title);
  const fontSize=Math.max(...lines.map(line=>line.length))>20?49:62;
  const titles=lines.map((line,i)=>'<text data-role="release-title" x="56" y="'+(748+i*64)+'" font-family="Georgia,serif" font-size="'+fontSize+'" font-weight="700" letter-spacing="-2"'+fitTextAttributes(line,fontSize,788,-2)+' fill="'+p.ink+'">'+escapeXml(line)+'</text>').join('');
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 900" width="900" height="900" role="img" aria-labelledby="'+titleId+' '+descId+'">',
    '<title id="'+titleId+'">'+escapeXml(title)+' by '+escapeXml(artist)+'</title>',
    '<desc id="'+descId+'">Original '+escapeXml(layout)+' geometric record sleeve. Editable vector artwork and text.</desc>',
    '<rect width="900" height="900" fill="'+p.ink+'"/>',
    '<text x="58" y="70" font-family="Arial,sans-serif" font-size="18" font-weight="700" letter-spacing="6" fill="'+p.paper+'">SPLICE / EDITION 001</text>',
    artwork(layout,p),
    '<rect x="0" y="648" width="900" height="252" fill="'+p.paper+'"/>',
    '<path d="M0 648H900" stroke="'+p.accent+'" stroke-width="9"/>',
    titles,
    '<text data-role="artist" x="58" y="861" font-family="Arial,sans-serif" font-size="24" font-weight="700" letter-spacing="4"'+fitTextAttributes(artist.toUpperCase(),24,710,4)+' fill="'+p.ink+'">'+escapeXml(artist.toUpperCase())+'</text>',
    '<circle cx="835" cy="833" r="21" fill="'+p.accent+'"/>',
    '</svg>'
  ].join('');
}
