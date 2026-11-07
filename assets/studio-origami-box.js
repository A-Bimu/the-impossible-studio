/* Origami box: all SVG elements are inline page DOM, not an image. No branding or extra decorations. */
(function install(){
'use strict';
const mount=document.getElementById('studio-origami');
if(!mount)return;
const cranes=[
 {id:'ivory',x:336,y:180,scale:1.09,rot:-4},
 {id:'plum',x:220,y:240,scale:.90,rot:-14}
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
 <linearGradient id="box-front" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#fbf2f7"/><stop offset=".46" stop-color="#e4cede"/><stop offset="1" stop-color="#c3a6ce"/></linearGradient>
 <linearGradient id="box-side" x1="0" y1="0" x2="1" y2=".95"><stop stop-color="#e8d3ed"/><stop offset=".52" stop-color="#c7a8d1"/><stop offset="1" stop-color="#ae91be"/></linearGradient>
 <linearGradient id="box-back" x1="0" y1="0" x2=".85" y2="1"><stop stop-color="#fff9fc"/><stop offset=".52" stop-color="#efdeee"/><stop offset="1" stop-color="#d2b8d7"/></linearGradient>
 <linearGradient id="inner-shadow" x1="0" y1="0" x2=".78" y2="1"><stop stop-color="#fef9f5"/><stop offset=".52" stop-color="#f5e9ee"/><stop offset="1" stop-color="#dac6db"/></linearGradient>
 <linearGradient id="tray-floor" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#fffaf6"/><stop offset=".58" stop-color="#f5e9eb"/><stop offset="1" stop-color="#ead9e6"/></linearGradient>
 <linearGradient id="tray-back-wall" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f5eafa"/><stop offset=".5" stop-color="#dfc8e9"/><stop offset="1" stop-color="#c1a4ca"/></linearGradient>
 <radialGradient id="table-shadow"><stop stop-color="#57435d" stop-opacity=".27"/><stop offset="1" stop-color="#57435d" stop-opacity="0"/></radialGradient>
 <filter id="soft-object-shadow" x="-42%" y="-42%" width="185%" height="190%"><feDropShadow dx="3.7" dy="7.5" stdDeviation="5.5" flood-color="#3e2f4c" flood-opacity=".22"/></filter>
 <filter id="box-depth-shadow" x="-40%" y="-45%" width="190%" height="195%"><feDropShadow dx="8" dy="15" stdDeviation="13" flood-color="#3c2d48" flood-opacity=".27"/></filter>
 <filter id="paper-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="13" result="grain"/><feColorMatrix in="grain" type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".045"/></feComponentTransfer></filter>
</defs>`;
mount.classList.add('og-minimal');
mount.removeAttribute('data-fold');
mount.innerHTML=`
<p class="og-sr-only" id="og-description">A shallow lilac keepsake tray with a pale, solid interior holding two folded-paper cranes, a lilac flower, a pink butterfly, and a golden paper boat. Their lower folds are tucked behind the tray walls.</p>
<svg class="og-artwork" viewBox="125 170 640 460" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="og-description">
 ${defs}
 <ellipse cx="468" cy="566" rx="269" ry="45" fill="url(#table-shadow)" opacity=".8"/>
 <!-- A low open keepsake tray: upright back and side walls enclose a pale, solid paper-lined floor. -->
 <g id="og-box-back" filter="url(#box-depth-shadow)">
  <path d="M224 370 L472 299 L702 370 L681 412 L471 346 L246 410 Z" fill="url(#tray-back-wall)" stroke="#c4a8cf" stroke-width="1.6"/>
  <path d="M246 410 L471 346 L681 412 L474 467 Z" id="og-tray-floor" fill="url(#tray-floor)" stroke="#ddcbd9" stroke-width="2"/>
  <path d="M223 371 L471 301 L702 371" fill="none" stroke="#fffdfb" stroke-width="5" stroke-linejoin="round"/>
  <path d="M225 380 L471 310 L700 381" fill="none" stroke="#b99ec8" stroke-opacity=".53" stroke-width="1.5"/>
  <path d="M247 407 L471 347 L679 409" fill="none" stroke="#fff" stroke-opacity=".76" stroke-width="3"/>
  <ellipse cx="453" cy="410" rx="146" ry="31" fill="#9e809e" opacity=".08"/>
 </g>
 <g id="og-cranes">${cranes.map(crane).join('')}</g>
 <g id="og-paper-butterfly" class="paper-object" transform="translate(568 310) rotate(12 50 70) scale(.74)" filter="url(#soft-object-shadow)">
  <path d="M49 78L24 5L0 42L16 91L46 94Z" fill="url(#pink-paper)" stroke="#ae7b8a4d" stroke-width="1.1"/>
  <path d="M24 5L46 77L16 91Z" fill="url(#pink-shade)" stroke="#b6809a36"/>
  <path d="M52 78L82 5L105 43L90 92L55 94Z" fill="url(#pink-paper)" stroke="#ae7b8a4d" stroke-width="1.1"/>
  <path d="M82 5L55 78L90 92Z" fill="url(#pink-shade)" stroke="#b6809a36"/>
  <path d="M46 87L13 122L47 117L50 100Z" fill="url(#pink-shade)"/>
  <path d="M56 87L89 122L55 117L52 100Z" fill="url(#pink-paper)"/>
  <path d="M49 76L54 76L55 114L51 126L47 113Z" fill="#a7798d"/>
  <path d="M24 5L49 78M82 5L54 78M18 91L45 93M89 92L57 94" stroke="#fff7ed88" stroke-width="1.2" fill="none"/>
 </g>
 <g id="og-paper-boat" class="paper-object" transform="translate(473 367) rotate(5 66 57) scale(.66)" filter="url(#soft-object-shadow)">
  <path d="M14 63L66 4L66 72Z" fill="url(#gold-paper)" stroke="#a783604a" stroke-width="1"/>
  <path d="M66 4L118 62L66 72Z" fill="url(#gold-shade)" stroke="#a783604a" stroke-width="1"/>
  <path d="M0 70L132 70L107 111L28 111Z" fill="url(#gold-paper)" stroke="#a783604a" stroke-width="1.6"/>
  <path d="M0 70L68 91L132 70" fill="none" stroke="#fff6dc" stroke-width="1.7"/>
  <path d="M27 111L67 91L107 111" fill="none" stroke="#ae896a6b" stroke-width="1.5"/>
 </g>
 <!-- Small folded lilac flower nestled between the two cranes. -->
 <g id="og-paper-flower" class="paper-object" transform="translate(330 341) scale(.78)" filter="url(#soft-object-shadow)">
  <path d="M56 84 L10 18 L74 44 L80 89 Z" fill="url(#lilac-light)" stroke="#80689e4d" stroke-width="1"/>
  <path d="M56 83 L35 2 L89 45 L80 90 Z" fill="url(#lilac-mid)" stroke="#80689e4d" stroke-width="1"/>
  <path d="M78 87 L109 3 L105 81 L85 99 Z" fill="url(#lilac-light)" stroke="#80689e4d" stroke-width="1"/>
  <path d="M83 92 L153 27 L124 99 L87 106 Z" fill="url(#lilac-deep)" stroke="#80689e4d" stroke-width="1"/>
  <path d="M65 87 L10 91 L68 127 L87 105 Z" fill="url(#lilac-mid)" stroke="#80689e4d" stroke-width="1"/>
  <path d="M83 87 L145 109 L89 133 L75 109 Z" fill="url(#lilac-light)" stroke="#80689e4d" stroke-width="1"/>
  <path d="M70 87 L86 71 L105 91 L87 116 Z" fill="url(#ivory-light)" stroke="#fff9" stroke-width="1"/>
  <path d="M35 2L80 91L109 3M10 91L87 116L145 109" fill="none" stroke="#faf2ff9c" stroke-width="1.1"/>
 </g> <!-- Low front and side walls visibly hold the objects, like a crib/tray. -->
 <g id="og-paper-box" filter="url(#box-depth-shadow)">
  <path d="M224 371 L474 462 L702 370 L702 473 L474 557 L224 468 Z" fill="#cfb5d2" opacity=".18"/>
  <path d="M224 371 L474 462 L474 557 L224 468 Z" id="og-tray-front" fill="url(#box-front)" stroke="#b797c2" stroke-width="1.6"/>
  <path d="M474 462 L702 370 L702 473 L474 557 Z" id="og-tray-side" fill="url(#box-side)" stroke="#9e82ad" stroke-width="1.6"/>
  <path d="M224 371 L474 462 L702 370" fill="none" stroke="#fffdfb" stroke-width="7" stroke-linejoin="round"/>
  <path d="M226 379 L474 471 L700 379" fill="none" stroke="#ab92b7" opacity=".48" stroke-width="2.1"/>
  <path d="M474 462 L474 557" fill="none" stroke="#fff6ff" stroke-opacity=".6" stroke-width="2"/>
  <path d="M239 391 L458 471 M490 471 L686 392" fill="none" stroke="#fff" stroke-opacity=".24" stroke-width="1.3"/>
  <path d="M242 452 L454 528 M492 532 L684 460" fill="none" stroke="#ac90b6" opacity=".23" stroke-width="1.1"/>
 </g>
 <rect x="220" y="375" width="484" height="182" filter="url(#paper-grain)" opacity=".12" pointer-events="none"/>
</svg>`;
})();