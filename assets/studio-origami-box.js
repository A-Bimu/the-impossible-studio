/* Origami box: all SVG elements are inline page DOM, not an image. No branding or extra decorations. */
(function install(){
'use strict';
const mount=document.getElementById('studio-origami');
if(!mount)return;
const cranes=[
 {id:'ivory',x:284,y:95,scale:1.41,rot:-5},
 {id:'plum',x:164,y:203,scale:1.02,rot:-16},
 {id:'lilac',x:487,y:180,scale:1.06,rot:17}
];
const crane=({id,x,y,scale,rot})=>`
 <g class="paper-object paper-crane" id="og-${id}-crane"
 transform="translate(${x} ${y}) rotate(${rot} 106 107) scale(${scale})"
 filter="url(#soft-object-shadow)">
 <path d="M78 125L15 76L49 137L91 151Z" fill="url(#${id}-deep)" stroke="#604e6736" stroke-width="1.5"/>
 <path d="M72 123L43 15L111 115L105 137Z" fill="url(#${id}-light)" stroke="#604e6736" stroke-width="1.4"/>
 <path d="M43 15L80 101L105 135L111 115Z" fill="url(#${id}-mid)" stroke="#604e6736" stroke-width="1.1"/>
 <path d="M43 15L82 98L73 80Z" fill="#fff" opacity=".28"/>
 <path d="M104 125L174 17L156 123L126 142Z" fill="url(#${id}-light)" stroke="#604e6736" stroke-width="1.4"/>
 <path d="M174 17L144 104L118 129L104 125Z" fill="url(#${id}-mid)" stroke="#604e6730" stroke-width="1.15"/>
 <path d="M174 17L155 85L161 66Z" fill="#fff" opacity=".22"/>
 <path d="M70 127L113 109L155 130L125 160L90 153Z" fill="url(#${id}-mid)" stroke="#604e6733" stroke-width="1.5"/>
 <path d="M113 109L155 130L125 160L123 137Z" fill="url(#${id}-deep)" stroke="#604e6730" stroke-width=".9"/>
 <path d="M113 109L124 137L90 153L70 127Z" fill="url(#${id}-light)" stroke="#ffffff6b" stroke-width=".85"/>
 <path d="M144 128L163 66L177 44L174 91L158 140Z" fill="url(#${id}-deep)" stroke="#604e6739" stroke-width="1.2"/>
 <path d="M164 67L177 44L174 91L159 129Z" fill="url(#${id}-light)" stroke="#ffffff46" stroke-width=".85"/>
 <path d="M173 48L188 39L201 49L178 56Z" fill="url(#${id}-mid)"/>
 <path d="M186 40L220 45L202 51L177 53Z" fill="url(#${id}-light)"/>
 <path d="M84 135L47 107L61 147L87 153Z" fill="url(#${id}-deep)"/>
 <path d="M43 15L111 115M174 17L104 125M113 109L123 137L125 160M144 128L164 67"
 fill="none" stroke="#3b2d4752" stroke-width="1.45" stroke-linecap="round"/>
 <path d="M46 22L76 93M171 25L150 89M79 127L112 112"
 fill="none" stroke="#fff" opacity=".65" stroke-width="1.4" stroke-linecap="round"/>
 </g>`;
const defs=`
<defs>
 <linearGradient id="ivory-light" x1="0" y1="0" x2=".92" y2="1"><stop stop-color="#fffef7"/><stop offset=".58" stop-color="#f6ead4"/><stop offset="1" stop-color="#e5d0b0"/></linearGradient>
 <linearGradient id="ivory-mid" x1=".08" y1="0" x2=".92" y2="1"><stop stop-color="#f7eedf"/><stop offset=".5" stop-color="#dcc9a9"/><stop offset="1" stop-color="#bdac91"/></linearGradient>
 <linearGradient id="ivory-deep" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#c8b9a1"/><stop offset=".65" stop-color="#ae9d83"/><stop offset="1" stop-color="#877962"/></linearGradient>
 <linearGradient id="plum-light" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#c9aedf"/><stop offset=".6" stop-color="#b58acb"/><stop offset="1" stop-color="#805aa3"/></linearGradient>
 <linearGradient id="plum-mid" x1=".1" y1="0" x2=".9" y2="1"><stop stop-color="#9974b7"/><stop offset=".62" stop-color="#6a4a8b"/><stop offset="1" stop-color="#573772"/></linearGradient>
 <linearGradient id="plum-deep" x1="0" y1="0" x2=".95" y2="1"><stop stop-color="#74518e"/><stop offset=".5" stop-color="#4b3168"/><stop offset="1" stop-color="#342143"/></linearGradient>
 <linearGradient id="lilac-light" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f2e7ff"/><stop offset=".52" stop-color="#d9c6f1"/><stop offset="1" stop-color="#b9a0d5"/></linearGradient>
 <linearGradient id="lilac-mid" x1="0" y1="0" x2=".94" y2="1"><stop stop-color="#d1bae7"/><stop offset=".52" stop-color="#ad92cd"/><stop offset="1" stop-color="#896eab"/></linearGradient>
 <linearGradient id="lilac-deep" x1=".05" y1="0" x2="1" y2="1"><stop stop-color="#a78ac6"/><stop offset=".56" stop-color="#8466a3"/><stop offset="1" stop-color="#654d80"/></linearGradient>
 <linearGradient id="pink-paper" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffe9dc"/><stop offset=".54" stop-color="#ebb2b8"/><stop offset="1" stop-color="#d18d9d"/></linearGradient>
 <linearGradient id="pink-shade" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#f1bdbe"/><stop offset=".54" stop-color="#c98f9f"/><stop offset="1" stop-color="#9f708a"/></linearGradient>
 <linearGradient id="gold-paper" x1="0" y1="0" x2=".92" y2="1"><stop stop-color="#fff2d6"/><stop offset=".5" stop-color="#eed3a4"/><stop offset="1" stop-color="#cda370"/></linearGradient>
 <linearGradient id="gold-shade" x1=".08" y1="0" x2=".92" y2="1"><stop stop-color="#ead0a4"/><stop offset=".54" stop-color="#cca06e"/><stop offset="1" stop-color="#ac805c"/></linearGradient>
 <linearGradient id="box-front" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#e7d7ee"/><stop offset=".46" stop-color="#c8aece"/><stop offset="1" stop-color="#ad8db7"/></linearGradient>
 <linearGradient id="box-side" x1="0" y1="0" x2="1" y2=".95"><stop stop-color="#ab88b9"/><stop offset=".52" stop-color="#916c9f"/><stop offset="1" stop-color="#755788"/></linearGradient>
 <linearGradient id="box-back" x1="0" y1="0" x2=".85" y2="1"><stop stop-color="#e9d9ec"/><stop offset=".52" stop-color="#bf9cc8"/><stop offset="1" stop-color="#8e719e"/></linearGradient>
 <linearGradient id="inner-shadow" x1="0" y1="0" x2=".78" y2="1"><stop stop-color="#58476a"/><stop offset=".52" stop-color="#3c314b"/><stop offset="1" stop-color="#65526f"/></linearGradient>
 <radialGradient id="table-shadow"><stop stop-color="#57435d" stop-opacity=".27"/><stop offset="1" stop-color="#57435d" stop-opacity="0"/></radialGradient>
 <filter id="soft-object-shadow" x="-42%" y="-42%" width="185%" height="190%"><feDropShadow dx="3.7" dy="7.5" stdDeviation="5.5" flood-color="#3e2f4c" flood-opacity=".22"/></filter>
 <filter id="box-depth-shadow" x="-40%" y="-45%" width="190%" height="195%"><feDropShadow dx="8" dy="15" stdDeviation="13" flood-color="#3c2d48" flood-opacity=".27"/></filter>
 <filter id="paper-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="13" result="grain"/><feColorMatrix in="grain" type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".045"/></feComponentTransfer></filter>
</defs>`;
mount.classList.add('og-minimal');
mount.removeAttribute('data-fold');
mount.innerHTML=`
<p class="og-sr-only" id="og-description">A plain open lavender paper box with three folded-paper cranes, a pink butterfly, and a gold paper boat emerging from inside it.</p>
<svg class="og-artwork" viewBox="0 0 840 620" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="og-description">
 ${defs}
 <ellipse cx="468" cy="566" rx="269" ry="45" fill="url(#table-shadow)" opacity=".8"/>
 <g id="og-box-back" filter="url(#box-depth-shadow)">
  <path d="M220 395L471 318L708 400L474 476Z" fill="url(#box-back)" stroke="#84698e" stroke-width="1.7"/>
  <path d="M241 397L472 334L687 401L475 461Z" fill="url(#inner-shadow)" stroke="#785e83" stroke-width="1.5"/>
  <path d="M240 397L471 333L688 400" fill="none" stroke="#f9eefb" stroke-opacity=".58" stroke-width="2.2"/>
 </g>
 <g id="og-cranes">${cranes.map(crane).join('')}</g>
 <g id="og-paper-butterfly" class="paper-object" transform="translate(617 186) rotate(10 50 70) scale(.9)" filter="url(#soft-object-shadow)">
  <path d="M49 78L24 5L0 42L16 91L46 94Z" fill="url(#pink-paper)" stroke="#ae7b8a4d" stroke-width="1.1"/>
  <path d="M24 5L46 77L16 91Z" fill="url(#pink-shade)" stroke="#b6809a36"/>
  <path d="M52 78L82 5L105 43L90 92L55 94Z" fill="url(#pink-paper)" stroke="#ae7b8a4d" stroke-width="1.1"/>
  <path d="M82 5L55 78L90 92Z" fill="url(#pink-shade)" stroke="#b6809a36"/>
  <path d="M46 87L13 122L47 117L50 100Z" fill="url(#pink-shade)"/>
  <path d="M56 87L89 122L55 117L52 100Z" fill="url(#pink-paper)"/>
  <path d="M49 76L54 76L55 114L51 126L47 113Z" fill="#a7798d"/>
  <path d="M24 5L49 78M82 5L54 78M18 91L45 93M89 92L57 94" stroke="#fff7ed88" stroke-width="1.2" fill="none"/>
 </g>
 <g id="og-paper-boat" class="paper-object" transform="translate(474 346) rotate(6 66 57) scale(.87)" filter="url(#soft-object-shadow)">
  <path d="M14 63L66 4L66 72Z" fill="url(#gold-paper)" stroke="#a783604a" stroke-width="1"/>
  <path d="M66 4L118 62L66 72Z" fill="url(#gold-shade)" stroke="#a783604a" stroke-width="1"/>
  <path d="M0 70L132 70L107 111L28 111Z" fill="url(#gold-paper)" stroke="#a783604a" stroke-width="1.6"/>
  <path d="M0 70L68 91L132 70" fill="none" stroke="#fff6dc" stroke-width="1.7"/>
  <path d="M27 111L67 91L107 111" fill="none" stroke="#ae896a6b" stroke-width="1.5"/>
 </g>
 <g id="og-paper-box" filter="url(#box-depth-shadow)">
  <path d="M219 396L474 476L708 399L708 527L473 611L219 530Z" fill="#725e82" opacity=".12"/>
  <path d="M220 397L474 474L474 603L220 527Z" fill="url(#box-front)" stroke="#8b7695" stroke-width="1.7"/>
  <path d="M474 474L708 399L708 524L474 603Z" fill="url(#box-side)" stroke="#745e83" stroke-width="1.7"/>
  <path d="M220 397L474 474L708 399" fill="none" stroke="#fbf1fa" stroke-width="5" stroke-linejoin="round"/>
  <path d="M222 403L474 480L706 405" fill="none" stroke="#80698b" opacity=".55" stroke-width="2"/>
  <path d="M474 477L474 603" stroke="#f4e9f6" stroke-opacity=".56" stroke-width="1.7"/>
  <path d="M235 422L456 489M490 489L694 422" stroke="#fff8ff" opacity=".12" stroke-width="1.3"/>
  <path d="M240 517L461 583M490 584L690 517" stroke="#634e7350" stroke-width="1.2" fill="none"/>
 </g>
 <rect x="195" y="330" width="522" height="282" filter="url(#paper-grain)" opacity=".2" pointer-events="none"/>
</svg>`;
})();