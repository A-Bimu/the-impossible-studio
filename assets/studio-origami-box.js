/* Studio's origami idea box is a real page element, not an image.
   Clicking "Rearrange" cycles between three hand-art-directed compositions. */
(()=>{
 'use strict';
 const scene=document.getElementById('studio-origami');
 const button=document.getElementById('og-remix');
 if(!scene||!button)return;
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)scene.classList.add('og-reduced');
 let arrangement=0;
 button.addEventListener('click',()=>{
  arrangement=(arrangement+1)%3;
  scene.dataset.fold=String(arrangement);
  button.textContent=arrangement===0?'REARRANGE ↗':'REARRANGE AGAIN ↗';
  button.setAttribute('aria-label','Rearrange folded paper pieces. Arrangement '+(arrangement+1)+' of 3.');
 });
})();