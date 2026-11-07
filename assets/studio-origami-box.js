/* THE IMPOSSIBLE STUDIO
   A dimensional folded-paper installation drawn as real SVG DOM and CSS in the
   website. No photo, external image, generated bitmap, or canvas sprite.
   The folded faces use many independently shaded polygon surfaces, paper grain,
   crease highlights, thickness, contact shadows and layered perspective. */
(()=>{
 'use strict';
 const scene=document.querySelector('#studio-origami');
 if(!scene)return;
 scene.classList.add('og-real');
 scene.innerHTML=`
 <span class="og-gallery-overline">STUDIES IN POSSIBILITY <span aria-hidden="true">✳</span> 001—∞</span>
 <p class="og-sr-only" id="og-description">A sculptural origami scene composed directly in this website: a deep lilac open paper box with carefully folded ivory, indigo and lavender cranes, a coral butterfly, gold paper sculptures and folded pieces rising from the box. Each paper face has shadows, creases and subtle paper grain. Use Rearrange to shift the paper composition.</p>
 <svg class="og-artwork" viewBox="0 0 960 720" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">
 <defs>
  <linearGradient id="p-ivory-a" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fffdf2"/><stop offset=".45" stop-color="#f5ead6"/><stop offset="1" stop-color="#d7c7ad"/></linearGradient>
  <linearGradient id="p-ivory-b" x1=".02" y1="0" x2=".9" y2=".95"><stop stop-color="#fff9e9"/><stop offset=".45" stop-color="#e9d9c0"/><stop offset="1" stop-color="#b8a587"/></linearGradient>
  <linearGradient id="p-ivory-c" x1=".05" y1=".9" x2=".9" y2=".1"><stop stop-color="#ab9a83"/><stop offset=".5" stop-color="#e4d5bc"/><stop offset="1" stop-color="#fff9e6"/></linearGradient>
  <linearGradient id="p-plum-a" x1="0" y1=".1" x2=".9" y2="1"><stop stop-color="#bf98e0"/><stop offset=".47" stop-color="#76519f"/><stop offset="1" stop-color="#2f1c58"/></linearGradient>
  <linearGradient id="p-plum-b" x1=".1" y1=".1" x2=".9" y2=".9"><stop stop-color="#885cbd"/><stop offset=".56" stop-color="#4b2f77"/><stop offset="1" stop-color="#271742"/></linearGradient>
  <linearGradient id="p-plum-c" x1=".05" y1="0" x2=".95" y2="1"><stop stop-color="#e4c6ff"/><stop offset=".52" stop-color="#ad87d5"/><stop offset="1" stop-color="#73549e"/></linearGradient>
  <linearGradient id="p-lilac-a" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#faf4ff"/><stop offset=".44" stop-color="#d9c3f5"/><stop offset="1" stop-color="#9c78cb"/></linearGradient>
  <linearGradient id="p-lilac-b" x1="0" y1=".1" x2="1" y2="1"><stop stop-color="#d0b3f7"/><stop offset=".5" stop-color="#aa83d7"/><stop offset="1" stop-color="#6a488b"/></linearGradient>
  <linearGradient id="p-peach-a" x1=".1" y1=".1" x2=".9" y2=".9"><stop stop-color="#ffe8d2"/><stop offset=".48" stop-color="#f0b7a9"/><stop offset="1" stop-color="#d58489"/></linearGradient>
  <linearGradient id="p-peach-b" x1=".1" y1=".1" x2=".9" y2="1"><stop stop-color="#ffcdb8"/><stop offset=".5" stop-color="#e89b9d"/><stop offset="1" stop-color="#aa617e"/></linearGradient>
  <linearGradient id="p-gold-a" x1="0" y1="0" x2=".95" y2="1"><stop stop-color="#fff4d9"/><stop offset=".45" stop-color="#e9c38c"/><stop offset="1" stop-color="#bc8b5a"/></linearGradient>
  <linearGradient id="p-gold-b" x1=".2" y1="0" x2=".9" y2="1"><stop stop-color="#fce7c1"/><stop offset=".48" stop-color="#cfa16c"/><stop offset="1" stop-color="#986642"/></linearGradient>
  <linearGradient id="box-top" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="#e4d1fb"/><stop offset=".52" stop-color="#9879bb"/><stop offset="1" stop-color="#4d326c"/></linearGradient>
  <linearGradient id="box-left" x1="0" y1="0" x2=".95" y2="1"><stop stop-color="#d8bbec"/><stop offset=".45" stop-color="#b28ccf"/><stop offset="1" stop-color="#8559b0"/></linearGradient>
  <linearGradient id="box-right" x1="0" y1="0" x2=".94" y2=".94"><stop stop-color="#8663ad"/><stop offset=".52" stop-color="#684588"/><stop offset="1" stop-color="#44305e"/></linearGradient>
  <linearGradient id="box-rim" x1=".05" y1=".1" x2=".9" y2=".93"><stop stop-color="#fff4df"/><stop offset=".44" stop-color="#d1a677"/><stop offset="1" stop-color="#a37d67"/></linearGradient>
  <linearGradient id="box-flap-l" x1="0" y1="0" x2=".98" y2="1"><stop stop-color="#f8e4ff"/><stop offset=".4" stop-color="#d7baf0"/><stop offset="1" stop-color="#a37bbd"/></linearGradient>
  <linearGradient id="box-flap-r" x1=".1" y1="0" x2=".94" y2="1"><stop stop-color="#f8ddb9"/><stop offset=".46" stop-color="#d9b68c"/><stop offset="1" stop-color="#a67c62"/></linearGradient>
  <radialGradient id="ground-glow" cx=".52" cy=".48" r=".54"><stop stop-color="#c7aedc" stop-opacity=".44"/><stop offset=".65" stop-color="#e2cdea" stop-opacity=".18"/><stop offset="1" stop-color="#e2cdea" stop-opacity="0"/></radialGradient>
  <radialGradient id="ground-shadow"><stop stop-color="#3c2854" stop-opacity=".35"/><stop offset="1" stop-color="#3c2854" stop-opacity="0"/></radialGradient>
  <filter id="paper-noise" x="-2%" y="-2%" width="104%" height="104%">
   <feTurbulence type="fractalNoise" baseFrequency=".58" numOctaves="3" seed="7" stitchTiles="stitch" result="noise"/>
   <feColorMatrix in="noise" type="saturate" values="0" result="gray"/>
   <feComponentTransfer in="gray" result="film"><feFuncA type="linear" slope=".065"/></feComponentTransfer>
   <feBlend in="SourceGraphic" in2="film" mode="multiply"/>
  </filter>
  <filter id="paper-shadow" x="-40%" y="-40%" width="180%" height="200%">
   <feDropShadow dx="7" dy="12" stdDeviation="9" flood-color="#3a234c" flood-opacity=".25"/>
  </filter>
  <filter id="box-shadow" x="-40%" y="-40%" width="180%" height="200%">
   <feDropShadow dx="10" dy="19" stdDeviation="13" flood-color="#352640" flood-opacity=".3"/>
  </filter>
  <filter id="soft-crease" x="-20%" y="-20%" width="140%" height="140%">
   <feGaussianBlur stdDeviation="1.35"/>
  </filter>
  <style>
    .og-face{stroke:#fff9;stroke-width:1.4;stroke-linejoin:round}
    .og-fold{stroke:#6c486f;stroke-opacity:.24;stroke-width:1.65;fill:none;stroke-linecap:round}
    .og-fold-light{stroke:#fffbed;stroke-opacity:.85;stroke-width:1.5;fill:none;stroke-linecap:round}
    .og-assemblage{transform-box:fill-box;transform-origin:center center;transition:transform 900ms cubic-bezier(.18,.75,.23,1)}
    .og-crease-shadow{stroke:#44345f;stroke-width:8;opacity:.13;fill:none;filter:url(#soft-crease)}
  </style>
 </defs>
 <ellipse cx="510" cy="379" rx="440" ry="288" fill="url(#ground-glow)" opacity=".75"/>
 <ellipse cx="530" cy="632" rx="325" ry="46" fill="url(#ground-shadow)"/>
 <g class="og-finishing-lines" opacity=".52" fill="none" stroke="#947fb0" stroke-width="1.15">
  <path d="M135 336C105 220 197 97 332 83" stroke-dasharray="4 9"/>
  <path d="M777 154C895 178 915 284 875 373" stroke-dasharray="4 10"/>
  <path d="M230 157Q186 174 180 220"/>
 </g>
 <g fill="#ac83cb" opacity=".52"><circle cx="135" cy="244" r="3"/><circle cx="849" cy="180" r="3.6"/><circle cx="875" cy="355" r="2"/><circle cx="185" cy="509" r="2.7"/></g>
 <!-- back flap of the open gift box, visible between the upright paper animals -->
 <g filter="url(#paper-shadow)">
   <path d="M254 410 L511 305 L798 414 L526 487 Z" fill="url(#box-top)" stroke="#6a5181" stroke-opacity=".5" stroke-width="2"/>
   <path d="M256 408 L514 302 L795 410 L528 477 Z" fill="none" stroke="#f6e4ff" stroke-opacity=".64" stroke-width="2"/>
   <path d="M264 409 L514 325 L779 411 L525 463 Z" fill="#211531" opacity=".56"/>
 </g>
 <!-- left plum crane: multiple physically shaded folds and a clear tapered neck -->
 <g id="og-bird-plum" class="og-assemblage" filter="url(#paper-shadow)">
   <path class="og-face" d="M322 413 L267 357 L166 244 L213 359 L294 427 Z" fill="url(#p-plum-b)"/>
   <path class="og-face" d="M315 393 L199 160 L324 303 L383 368 Z" fill="url(#p-plum-a)"/>
   <path class="og-face" d="M199 160 L383 368 L330 324 L276 236 Z" fill="url(#p-plum-c)"/>
   <path class="og-face" d="M356 388 L411 171 L431 327 L415 395 Z" fill="url(#p-plum-a)"/>
   <path class="og-face" d="M411 171 L432 328 L397 304 Z" fill="url(#p-plum-b)"/>
   <path class="og-face" d="M301 368 L361 351 L428 374 L399 435 L336 442 Z" fill="url(#p-plum-b)"/>
   <path class="og-face" d="M361 351 L427 373 L399 435 L380 392 Z" fill="url(#p-plum-a)"/>
   <path class="og-face" d="M393 388 L440 293 L472 238 L464 328 L423 410 Z" fill="url(#p-plum-a)"/>
   <path class="og-face" d="M440 293 L472 238 L458 322 L430 361 Z" fill="url(#p-plum-c)"/>
   <path class="og-face" d="M465 245 L479 226 L498 247 L469 255 Z" fill="url(#p-plum-a)"/>
   <path class="og-face" d="M479 227 L520 235 L493 247 L472 250 Z" fill="url(#p-plum-b)"/>
   <path class="og-fold" d="M200 160 L356 387 L320 303 M411 173 L394 387 M361 351 L399 435 M440 293 L427 376"/>
   <path class="og-fold-light" d="M213 356 L309 403 M472 240 L464 325"/>
 </g>
 <!-- middle ivory paper crane — broad, individually creased wings -->
 <g id="og-bird-ivory" class="og-assemblage" filter="url(#paper-shadow)">
   <path class="og-face" d="M484 416 L390 375 L300 294 L380 422 L478 458 Z" fill="url(#p-ivory-c)"/>
   <path class="og-face" d="M479 371 L316 112 L447 245 L549 351 Z" fill="url(#p-ivory-a)"/>
   <path class="og-face" d="M316 112 L447 245 L499 354 L422 304 Z" fill="url(#p-ivory-b)"/>
   <path class="og-face" d="M316 112 L420 300 L385 254 L359 171 Z" fill="#fffdf1" opacity=".74"/>
   <path class="og-face" d="M512 370 L678 113 L621 292 L574 401 Z" fill="url(#p-ivory-b)"/>
   <path class="og-face" d="M678 113 L601 282 L539 357 L576 275 Z" fill="url(#p-ivory-a)"/>
   <path class="og-face" d="M678 113 L576 275 L602 240 Z" fill="#fff9ea" opacity=".82"/>
   <path class="og-face" d="M417 372 L477 331 L567 364 L588 418 L534 457 L457 442 Z" fill="url(#p-ivory-b)"/>
   <path class="og-face" d="M477 331 L567 364 L534 457 L513 402 Z" fill="url(#p-ivory-a)"/>
   <path class="og-face" d="M561 385 L610 285 L651 201 L646 314 L588 432 Z" fill="url(#p-ivory-c)"/>
   <path class="og-face" d="M610 285 L650 201 L633 294 L595 358 Z" fill="url(#p-ivory-a)"/>
   <path class="og-face" d="M648 209 L665 189 L685 207 L654 219 Z" fill="url(#p-ivory-b)"/>
   <path class="og-face" d="M665 190 L715 199 L686 211 L650 217 Z" fill="url(#p-ivory-a)"/>
   <path class="og-crease-shadow" d="M316 112 L486 371 M678 113 L509 374"/>
   <path class="og-fold" d="M316 112 L447 245 L499 354 M678 113 L601 282 L512 370 M477 331 L513 402 L534 457 M650 201 L635 312"/>
   <path class="og-fold-light" d="M321 122 L447 248 M676 117 L601 278 M425 375 L479 338"/>
 </g>
 <!-- right lavender crane: distinct colour, angled paper-body profile -->
 <g id="og-bird-lilac" class="og-assemblage" filter="url(#paper-shadow)">
   <path class="og-face" d="M645 434 L570 366 L544 271 L631 390 Z" fill="url(#p-lilac-b)"/>
   <path class="og-face" d="M635 379 L610 170 L700 310 L732 394 Z" fill="url(#p-lilac-a)"/>
   <path class="og-face" d="M611 170 L701 311 L646 299 Z" fill="url(#p-lilac-b)"/>
   <path class="og-face" d="M682 396 L809 210 L785 348 L735 423 Z" fill="url(#p-lilac-b)"/>
   <path class="og-face" d="M809 210 L785 348 L738 408 L760 293 Z" fill="url(#p-lilac-a)"/>
   <path class="og-face" d="M635 384 L690 358 L764 380 L750 435 L686 465 Z" fill="url(#p-lilac-a)"/>
   <path class="og-face" d="M691 358 L763 380 L750 435 L716 400 Z" fill="url(#p-lilac-b)"/>
   <path class="og-face" d="M747 390 L789 298 L804 281 L804 385 L768 426 Z" fill="url(#p-lilac-a)"/>
   <path class="og-face" d="M794 286 L809 271 L826 288 L804 299 Z" fill="url(#p-lilac-b)"/>
   <path class="og-face" d="M810 270 L854 271 L828 288 L804 299 Z" fill="url(#p-lilac-a)"/>
   <path class="og-fold" d="M610 170 L701 311 L728 390 M809 210 L748 400 M690 358 L716 400 L686 465"/>
   <path class="og-fold-light" d="M613 181 L697 310 M808 220 L783 346"/>
 </g>
 <!-- stacked small warm paper folds inside the box -->
 <g id="og-small-papers" class="og-assemblage" filter="url(#paper-shadow)">
   <path class="og-face" d="M300 419 L345 316 L378 435 Z" fill="url(#p-gold-a)"/>
   <path class="og-face" d="M345 316 L354 419 L378 435 Z" fill="url(#p-gold-b)"/>
   <path class="og-face" d="M357 441 L387 353 L430 428 Z" fill="url(#p-peach-a)"/>
   <path class="og-face" d="M387 353 L392 431 L430 428 Z" fill="url(#p-peach-b)"/>
   <path class="og-face" d="M612 439 L655 325 L690 436 Z" fill="url(#p-gold-a)"/>
   <path class="og-face" d="M656 325 L666 434 L690 436 Z" fill="url(#p-gold-b)"/>
 </g>
 <!-- coral folded butterfly, wings made from interlocking origami facets -->
 <g id="og-butterfly" class="og-assemblage" filter="url(#paper-shadow)">
   <path class="og-face" d="M770 257 L712 167 L701 275 L753 308 Z" fill="url(#p-peach-a)"/>
   <path class="og-face" d="M712 167 L711 274 L748 258 Z" fill="url(#p-peach-b)"/>
   <path class="og-face" d="M774 257 L835 170 L839 277 L784 308 Z" fill="url(#p-peach-a)"/>
   <path class="og-face" d="M835 170 L838 277 L797 258 Z" fill="url(#p-peach-b)"/>
   <path class="og-face" d="M754 286 L727 346 L771 320 Z" fill="url(#p-peach-b)"/>
   <path class="og-face" d="M789 286 L821 341 L775 320 Z" fill="url(#p-peach-a)"/>
   <path class="og-face" d="M770 249 L777 250 L780 324 L773 338 L767 319 Z" fill="#a76b79"/>
   <path class="og-fold" d="M712 167 L770 257 L752 307 M835 170 L774 257 L785 307"/>
   <path class="og-fold-light" d="M714 170 L731 226 M833 175 L811 224"/>
 </g>
 <!-- miniature gold folded star; sharp crease facets for material realism -->
 <g id="og-folded-star" class="og-assemblage" filter="url(#paper-shadow)">
   <path class="og-face" d="M190 266 L215 216 L242 269 L286 277 L251 312 L265 353 L214 328 L174 349 L181 308 L146 280 Z" fill="url(#p-gold-a)"/>
   <path class="og-face" d="M215 216 L217 291 L190 266 Z" fill="#fff4cf"/>
   <path class="og-face" d="M215 292 L286 277 L251 312 Z" fill="url(#p-gold-b)"/>
   <path class="og-face" d="M215 292 L174 349 L181 308 Z" fill="url(#p-gold-b)"/>
   <path class="og-fold" d="M215 216 L215 292 L265 353 M146 280 L215 292 L174 349"/>
 </g>
 <!-- dimensional purple cardboard box, rendered last to conceal paper stems -->
 <g id="og-paper-box" filter="url(#box-shadow)">
   <path d="M254 409 L525 492 L793 410 L793 562 L525 648 L256 568 Z" fill="#3d285b" opacity=".25" transform="translate(9 13)"/>
   <path d="M256 412 L525 492 L793 410 L784 561 L523 645 L254 565 Z" fill="url(#box-top)" stroke="#684684" stroke-width="2"/>
   <path d="M256 412 L525 492 L524 647 L254 566 Z" fill="url(#box-left)" stroke="#9c71ba" stroke-width="1.1"/>
   <path d="M525 492 L793 411 L789 564 L524 647 Z" fill="url(#box-right)" stroke="#5c3b7c" stroke-width="1.1"/>
   <path d="M256 414 L525 494" stroke="#fff1ff" stroke-opacity=".75" stroke-width="3"/>
   <path d="M526 494 L793 412" stroke="#f4daff" stroke-opacity=".47" stroke-width="2"/>
   <path d="M525 494 L524 647" stroke="#f4e4ff" stroke-opacity=".7" stroke-width="2"/>
   <!-- soft paper contact shadows -->
   <path d="M254 412 L525 492 L525 504 L254 427 Z" fill="#432b60" opacity=".22"/>
   <path d="M525 492 L793 410 L793 429 L525 504 Z" fill="#251a3b" opacity=".27"/>
   <!-- outward-folded left flap with golden underlay edge -->
   <path d="M254 411 L524 493 L470 550 L177 463 Z" fill="url(#box-flap-l)" stroke="#ad91c6" stroke-width="1.7"/>
   <path d="M177 463 L470 550" stroke="#f9edff" stroke-opacity=".65" stroke-width="2"/>
   <path d="M254 411 L523 492 L470 550" fill="none" stroke="#6e518d" stroke-opacity=".48" stroke-width="1.5"/>
   <path d="M250 415 L183 462 L468 545" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="1"/>
   <!-- outward-folded right flap -->
   <path d="M525 493 L792 411 L863 468 L580 552 Z" fill="url(#box-flap-r)" stroke="#bc9876" stroke-width="1.7"/>
   <path d="M580 552 L863 468" stroke="#fff0cf" stroke-width="1.9" stroke-opacity=".8"/>
   <path d="M525 493 L792 411" stroke="#fff6e4" stroke-opacity=".4" stroke-width="2"/>
   <path d="M525 493 L580 552" stroke="#8c674e" stroke-opacity=".6" stroke-width="1.5"/>
   <!-- visible paperboard edge, several pixels thick -->
   <path d="M177 463 L470 550 L470 554 L177 468 Z" fill="#9d7ab8"/>
   <path d="M580 552 L863 468 L862 473 L579 556 Z" fill="#9e785f"/>
   <path d="M257 560 L523 635 L786 556" fill="none" stroke="#4b305f" stroke-width="2" opacity=".24"/>
   <!-- real printed mark on left face -->
   <g transform="translate(300 535) rotate(15)">
    <text x="0" y="0" fill="#493058" font-family="Arial, Helvetica, sans-serif" font-size="29" font-weight="900" letter-spacing="-1.4">IMPOSSIBLE</text>
    <path d="M1 12 H170" stroke="#664d7c" stroke-width="1.15" opacity=".42"/>
    <text x="2" y="32" fill="#523968" font-family="monospace" font-size="10.5" letter-spacing="2.1">STUDIO / IDEAS INSIDE</text>
   </g>
   <!-- understated embossed emblem -->
   <g transform="translate(647 530) rotate(-16)" stroke="#dec5f3" stroke-width="4" stroke-linecap="round" opacity=".85">
    <path d="M0 -25V25 M-25 0H25 M-18 -18L18 18 M18 -18L-18 18"/>
    <circle cx="0" cy="0" r="7" fill="#795596" stroke="none"/>
   </g>
   <path d="M782 443 L780 540" stroke="#b28cc5" stroke-opacity=".35" stroke-width="2"/>
 </g>
 <g class="og-ambient" fill="none" stroke-linecap="round" opacity=".58">
   <path d="M250 185C266 156 282 154 303 157" stroke="#846aaf" stroke-width="1.7"/>
   <path d="M879 330Q909 330 924 308" stroke="#94739f" stroke-width="1.4"/>
   <path d="M132 425l13 -8m-5 -11l7 10" stroke="#b68a5e" stroke-width="1.5"/>
 </g>
 </svg>
 <div class="og-control-row"><span>THE IMPOSSIBLE / FOLDED INTO FORM</span><button type="button" id="og-remix" class="og-remix" aria-label="Rearrange the origami scene">REARRANGE THE FOLDS <span aria-hidden="true">↗</span></button></div>
 `;
 const button=scene.querySelector('#og-remix');
 let position=0;
 const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
 if(motion.matches)scene.classList.add('og-reduced');
 const groups=['og-bird-plum','og-bird-ivory','og-bird-lilac','og-butterfly','og-folded-star','og-small-papers'];
 const transforms=[
  ['translate(-11px,-11px) rotate(-3deg)','translate(8px,-10px) rotate(2deg)','translate(-6px,3px) rotate(-3deg)','translate(8px,-13px) rotate(8deg)','translate(11px,-15px) rotate(-7deg)','translate(0,-7px)'],
  ['translate(5px,-5px) rotate(4deg)','translate(-5px,-20px) rotate(-3deg)','translate(10px,-15px) rotate(5deg)','translate(-9px,6px) rotate(-8deg)','translate(-14px,-9px) rotate(8deg)','translate(0,0)'],
  ['none','none','none','none','none','none']
 ];
 button?.addEventListener('click',()=>{
   position=(position+1)%3;
   scene.dataset.fold=String(position);
   groups.forEach((id,i)=>{
     const group=scene.querySelector('#'+id);
     if(group)group.style.transform=transforms[position-1]?.[i]||'none';
   });
   button.innerHTML=(position?'ANOTHER FOLD':'REARRANGE THE FOLDS')+' <span aria-hidden="true">↗</span>';
   button.setAttribute('aria-label','Rearrange the folded paper composition, arrangement '+(position+1)+' of 3');
 });
})();