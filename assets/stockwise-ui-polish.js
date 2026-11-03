/* STOCKWISE accessibility and layout polish.
   Enhances navigation, gallery previews and readable tabular actions only. */
(()=>{'use strict';
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const motion=()=>reduced.matches?'auto':'smooth';
 function brand(){
  const gallery=document.querySelector('.sw-v3 .sw-photo-collection');
  const controls=document.querySelector('.sw-v3 .sw-gallery-controls');
  if(!gallery||!controls)return;
  const cards=[...gallery.querySelectorAll('.sw-product-card')];
  const label=controls.querySelector('[data-sw-gallery-status]');
  const update=()=>{
   if(!cards.length)return;
   const left=gallery.getBoundingClientRect().left;
   let index=0,best=Infinity;
   cards.forEach((card,i)=>{const diff=Math.abs(card.getBoundingClientRect().left-left);if(diff<best){best=diff;index=i}});
   label.textContent='CARD '+(index+1)+' OF '+cards.length+' · SWIPE TO EXPLORE';
  };
  controls.querySelectorAll('[data-sw-gallery-dir]').forEach(button=>{
   button.addEventListener('click',()=>{
    const dir=Number(button.dataset.swGalleryDir);
    const left=gallery.getBoundingClientRect().left;
    let active=0,best=Infinity;
    cards.forEach((card,i)=>{const diff=Math.abs(card.getBoundingClientRect().left-left);if(diff<best){best=diff;active=i}});
    const next=Math.min(cards.length-1,Math.max(0,active+dir));
    gallery.scrollTo({left:cards[next].offsetLeft-cards[0].offsetLeft,behavior:motion()});
    label.textContent='CARD '+(next+1)+' OF '+cards.length+' · SWIPE TO EXPLORE';
   });
  });
  gallery.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);update();
 }
 function workspace(){
  const nav=document.querySelector('.ws-mobile-nav');
  if(!nav)return;
  const more=document.querySelector('.ws-mobile-nav-more');
  const refresh=()=>{
   if(more){const atEnd=nav.scrollLeft+nav.clientWidth>=nav.scrollWidth-12;more.innerHTML=atEnd?'START <span aria-hidden="true">↶</span>':'MORE <span aria-hidden="true">→</span>';more.setAttribute('aria-label',atEnd?'Scroll navigation back to the first section':'Scroll navigation to more sections')}
  };
  if(more)more.addEventListener('click',()=>{
   const atEnd=nav.scrollLeft+nav.clientWidth>=nav.scrollWidth-12;
   nav.scrollTo({left:atEnd?0:Math.min(nav.scrollWidth,nav.scrollLeft+Math.max(170,nav.clientWidth*.66)),behavior:motion()});
  });
  const centerActive=()=>{
   const current=nav.querySelector('[aria-current="page"]');
   if(current&&nav.clientWidth){const next=current.offsetLeft-nav.offsetLeft-(nav.clientWidth-current.offsetWidth)/2;nav.scrollTo({left:Math.max(0,next),behavior:motion()})}
   refresh();
  };
  nav.addEventListener('scroll',refresh,{passive:true});
  window.addEventListener('resize',refresh);
  window.addEventListener('hashchange',()=>requestAnimationFrame(centerActive));
  window.addEventListener('load',()=>requestAnimationFrame(centerActive));
  setTimeout(centerActive,0);

  // The desktop semantic table remains a table. At narrow widths,
  // matching data-label attributes make each row a labelled mobile card
  // with the action controls visible without side-scrolling.
  document.querySelectorAll('.ws-table-scroll table').forEach(table=>{
   const headers=[...table.querySelectorAll('thead th')].map(th=>th.textContent.trim().replace(/\s+/g,' '));
   const tbody=table.querySelector('tbody');if(!tbody)return;
   const annotate=()=>{
    [...tbody.querySelectorAll('tr')].forEach(tr=>{
     [...tr.children].forEach((cell,i)=>{
      if(cell.tagName!=='TD'||cell.hasAttribute('colspan'))return;
      const label=headers[i]||'Details';
      if(cell.getAttribute('data-label')!==label)cell.setAttribute('data-label',label);
     });
    });
   };
   annotate();
   const observer=new MutationObserver(annotate);
   observer.observe(tbody,{childList:true,subtree:true});
  });
 }
 function caseStudy(){
  const showcase=document.querySelector('body.brand-stockwise .sd-showcase');
  if(!showcase)return;
  const gallery=showcase.querySelector('.sd-grid-phone');
  if(gallery&&!showcase.querySelector('.sw-case-hint')){
   const hint=document.createElement('p');hint.className='sw-case-hint';hint.textContent='↔ SWIPE THROUGH ALL FIVE MOBILE SCREENS';
   gallery.insertAdjacentElement('beforebegin',hint);
  }
  const frames=[...showcase.querySelectorAll('.sd-iframe')];
  frames.forEach((frame,i)=>{
   const screen=frame.closest('.sd-screen');if(!screen)return;
   const done=()=>{if(frame.getAttribute('src'))screen.classList.add('is-loaded')};
   frame.addEventListener('load',done);
   if(frame.getAttribute('src')&&frame.contentDocument?.readyState==='complete')done();
   // Start loading the primary desktop and first phone previews immediately.
   // Remaining cards continue to use intersection-aware loading.
   if((i<3||i===3)&&frame.dataset.src&&!frame.getAttribute('src')){
    frame.loading='eager';
    frame.src=frame.dataset.src;
   }
  });
 }
 brand();workspace();caseStudy();
})();