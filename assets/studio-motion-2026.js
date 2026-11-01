/* The Impossible Studio: progressive-enhancement motion. No third-party animation dependency. */
(()=>{'use strict';
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
 const nodes=[...document.querySelectorAll('[data-reveal]')];
 const show=node=>{node.classList.remove('motion-pending');node.classList.add('motion-visible')};
 if('IntersectionObserver'in window&&!reduce.matches){
  const observer=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{if(isIntersecting){show(target);observer.unobserve(target)}}),{threshold:.12,rootMargin:'0px 0px -35px 0px'});
  nodes.forEach(node=>{node.classList.add('motion-pending');observer.observe(node)});
  // No content should remain visually hidden if the document's view changes without scroll.
  window.addEventListener('hashchange',()=>nodes.forEach(show));
  window.addEventListener('pagehide',()=>nodes.forEach(show),{once:true});
 }else nodes.forEach(show);
 const progress=document.querySelector('[data-scroll-progress]');
 if(progress){
  let ticking=false;
  const update=()=>{const d=document.documentElement,h=Math.max(1,d.scrollHeight-innerHeight);progress.style.transform='scaleX('+Math.min(1,Math.max(0,scrollY/h))+')';ticking=false};
  const onScroll=()=>{if(!ticking){ticking=true;requestAnimationFrame(update)}};
  window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll);update();
 }
 document.querySelectorAll('[data-magnetic]').forEach(el=>{
  if(reduce.matches)return;
  el.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const r=el.getBoundingClientRect();const x=(e.clientX-r.left-r.width/2)*.075,y=(e.clientY-r.top-r.height/2)*.075;el.style.setProperty('--mag-x',x.toFixed(1)+'px');el.style.setProperty('--mag-y',y.toFixed(1)+'px')});
  el.addEventListener('pointerleave',()=>{el.style.setProperty('--mag-x','0px');el.style.setProperty('--mag-y','0px')});
 });
 document.querySelectorAll('[data-count-to]').forEach(el=>{
  const value=Number(el.dataset.countTo),suffix=el.dataset.suffix||'';
  if(!Number.isFinite(value))return;
  const run=()=>{if(reduce.matches){el.textContent=value+suffix;return}const start=performance.now(),duration=950;const frame=now=>{let t=Math.min(1,(now-start)/duration);t=1-Math.pow(1-t,3);el.textContent=Math.round(value*t).toLocaleString()+suffix;if(t<1)requestAnimationFrame(frame)};requestAnimationFrame(frame)};
  if('IntersectionObserver'in window){const observer=new IntersectionObserver(es=>{if(es.some(x=>x.isIntersecting)){run();observer.disconnect()}},{threshold:.5});observer.observe(el)}else run();
 });
})();