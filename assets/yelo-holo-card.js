/* YELO / original simulated card render.
   Every card number, issue label and transaction is fictional. Not a real card. */
(()=>{'use strict';
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const fine=matchMedia('(hover: hover) and (pointer: fine)');
 let raf=0;
 const inner=()=>'<div class="yelo-card-stage" tabindex="0" aria-label="Original YELO fictional debit card, front and back can be viewed with the flip button"><div class="yelo-card-shell"><div class="yelo-card-core">'+
  '<div class="yelo-card-face yelo-card-front"><span class="yelo-card-mark">YELO.</span><span class="yelo-card-edition">DROP 002<br>NAIROBI / KE</span><span class="yelo-card-chip" aria-hidden="true"></span><span class="yelo-card-contactless" aria-hidden="true">)))</span><span class="yelo-card-number">•••• &nbsp; •••• &nbsp; •••• &nbsp; 4837</span><div class="yelo-card-bottomline"><span>AMANI W. / FICTIONAL<br>DESIGN CONCEPT / NOT ISSUED</span><strong>MOVE!</strong></div></div>'+
  '<div class="yelo-card-face yelo-card-back"><span class="magnetic" aria-hidden="true"></span><span class="signature">YELO / SAMPLE CARD</span><span class="signature-code">XXX</span><span class="back-copy">THIS IS A FICTIONAL DESIGN / IT CANNOT BE USED TO PAY.<br>THE IMPOSSIBLE STUDIO · ISSUE 002 · 2026</span></div>'+
  '</div></div></div>';
 function mount(root=document){
  const nodes=[...(root.matches?.('[data-yelo-card]')?[root]:[]),...(root.querySelectorAll?.('[data-yelo-card]')||[])];
  nodes.forEach(el=>{
   if(el.dataset.cardMounted==='yes')return;
   const decorative=el.dataset.cardMode==='decorative';
   const compact=el.dataset.cardMode==='compact';
   el.classList.add('yelo-card-showcase');
   if(decorative)el.classList.add('is-decorative');
   if(compact)el.classList.add('is-compact');
   el.innerHTML=inner()+(decorative?'':'<div class="yelo-card-controls"><button type="button" class="yelo-card-flip" data-card-flip aria-pressed="false" aria-label="Show back of fictional YELO card">SEE CARD BACK ↗</button><button type="button" class="yelo-card-pause" data-card-pause aria-pressed="false">PAUSE MOTION ‖</button><span class="yelo-card-motion-hint">MOVE CURSOR / FLIP CARD</span></div>');
   el.dataset.cardMounted='yes';
  });
 }
 const queue=(stage,rx,ry,gx,gy)=>{
  if(raf)cancelAnimationFrame(raf);
  raf=requestAnimationFrame(()=>{
   stage.style.setProperty('--tilt-x',rx.toFixed(2)+'deg');
   stage.style.setProperty('--tilt-y',ry.toFixed(2)+'deg');
   stage.style.setProperty('--glare-x',gx.toFixed(1)+'%');
   stage.style.setProperty('--glare-y',gy.toFixed(1)+'%');
   raf=0;
  });
 };
 document.addEventListener('pointermove',e=>{
  if(reduce.matches||!fine.matches||e.pointerType!=='mouse')return;
  const stage=e.target.closest?.('.yelo-card-stage');
  if(!stage||stage.closest('.is-decorative')||stage.closest('.is-paused'))return;
  const host=stage.closest('.yelo-card-showcase'),r=stage.getBoundingClientRect();
  if(!r.width||!r.height)return;
  const x=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));
  const y=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));
  host.classList.add('is-interacting');
  queue(stage,(.5-y)*10,(x-.5)*15,x*100,y*100);
 });
 document.addEventListener('pointerout',e=>{
  const stage=e.target.closest?.('.yelo-card-stage');
  if(!stage||stage.contains(e.relatedTarget))return;
  const host=stage.closest('.yelo-card-showcase');host?.classList.remove('is-interacting');
  queue(stage,0,0,50,50);
 });
 document.addEventListener('click',e=>{
  const pause=e.target.closest?.('[data-card-pause]');
  if(pause){const host=pause.closest('.yelo-card-showcase');if(!host)return;const paused=host.classList.toggle('is-paused');host.classList.remove('is-interacting');pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?'PLAY MOTION ↻':'PAUSE MOTION ‖';return}
  const flip=e.target.closest?.('[data-card-flip]');
  if(!flip)return;
  const host=flip.closest('.yelo-card-showcase');if(!host)return;
  const flipped=host.classList.toggle('is-flipped');
  flip.setAttribute('aria-pressed',String(flipped));
  flip.setAttribute('aria-label',flipped?'Show front of fictional YELO card':'Show back of fictional YELO card');
  flip.textContent=flipped?'SEE CARD FRONT ↗':'SEE CARD BACK ↗';
 });
 window.YeloCard={mount};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>mount());
 else mount();
})();
