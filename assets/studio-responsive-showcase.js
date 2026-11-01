/* Studio presentation gallery: actual responsive pages, lazy-loaded inside interactive device frames. */
(()=>{'use strict';
 const h=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el};
 const safeConfig=root=>{try{return JSON.parse(root.querySelector('.sd-config').textContent)}catch{return null}};
 function init(root){const data=safeConfig(root);if(!data||!data.source||!Array.isArray(data.desktop)||!Array.isArray(data.phone))return;const base=data.source;
  const mount=root.querySelector('.sd-mount');if(!mount)return;
  const heading=h('div','sd-heading');heading.append(h('span','sd-eyebrow','RESPONSIVE WEBSITE PRESENTATION'));heading.append(h('h2','',data.title||'One design. Every screen.'));heading.append(h('p','',data.description||'Real responsive screens from the interactive project.'));
  mount.append(heading);
  let allFrames=[],observed=[];
  function card(item,type){
   const article=h('article','sd-item');const device=h('div','sd-frame '+(type==='phone'?'sd-mobile':'sd-laptop'));
   const lid=h('div',type==='phone'?'':'sd-lid');const screen=h('div','sd-screen');
   const width=type==='phone'?390:1200,height=type==='phone'?844:730,route=item.route||'';
   const url=base+route;const frame=h('iframe','sd-iframe');frame.setAttribute('title',(item.title||'Page')+' — '+(type==='phone'?'phone':'laptop')+' viewport');frame.setAttribute('loading','lazy');frame.setAttribute('tabindex','-1');
   frame.dataset.src=url;frame.style.setProperty('--sd-source-width',width+'px');frame.style.setProperty('--sd-source-height',height+'px');screen.append(frame);lid.append(screen);device.append(lid);
   if(type==='laptop')device.append(h('div','sd-laptop-base'));
   article.append(device);
   const caption=h('div','sd-caption');caption.append(h('strong','',item.title||'PAGE'));caption.append(h('p','',item.description||'An actual responsive project screen'));
   const link=h('a','','Open actual screen ↗');link.href=url;link.target='_blank';link.rel='noopener';caption.append(link);article.append(caption);
   allFrames.push({screen,frame,width});observed.push(frame);return article;
  }
  function gallery(type,items){const label=h('div','sd-views-title');label.append(h('h3','',items.length+' '+(type==='phone'?'phone':'laptop')+' view'+(items.length===1?'':'s')));label.append(h('span','',items.length+' '+(type==='phone'?'MOBILE':'DESKTOP')+' ACTUAL PROJECT VIEW'+(items.length===1?'':'S')+' / REAL VIEWPORT'));mount.append(label);const grid=h('div','sd-grid '+(type==='phone'?'sd-grid-phone':'sd-grid-laptop'));items.forEach(i=>grid.append(card(i,type)));mount.append(grid)}
  gallery('laptop',data.desktop);gallery('phone',data.phone);
  function size(){for(const {screen,frame,width} of allFrames){const scale=screen.getBoundingClientRect().width/width;frame.style.setProperty('--sd-scale',String(Math.max(.01,scale)))}}
  if('ResizeObserver'in window){const observer=new ResizeObserver(size);allFrames.forEach(x=>observer.observe(x.screen))}else window.addEventListener('resize',size);
  requestAnimationFrame(size);
  if('IntersectionObserver'in window){const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){const f=e.target;f.src=f.dataset.src;obs.unobserve(f)}}),{rootMargin:'300px 0px'});observed.forEach(f=>obs.observe(f))}else observed.forEach(f=>f.src=f.dataset.src);
  const demo=h('section','sd-demo');const details=h('div','sd-demo-info');details.append(h('span','sd-eyebrow','LIVE INTERACTIVE EXPERIENCE'));details.append(h('h3','','Test the real project.'));details.append(h('p','',data.demoDescription||'Explore the real responsive project using its own working interface. Actions remain demonstration-only.'));
  const controls=h('div','sd-demo-controls');controls.setAttribute('role','group');controls.setAttribute('aria-label','Preview screen');const controlsMobile=h('div','sd-demo-controls');controlsMobile.setAttribute('role','group');controlsMobile.setAttribute('aria-label','Preview device');const frameBox=h('div','sd-interact-frame');const demoFrame=h('iframe');demoFrame.title=(data.project||'Studio project')+' interactive preview';demoFrame.loading='lazy';frameBox.append(demoFrame);
  const area=h('div','sd-interact-box');area.append(frameBox);area.append(h('p','sd-interact-note','Use the controls to switch pages or device width. Open a screen at full size for easier interaction.'));
  let selectedRoute=(data.desktop[0]||{}).route||'',mobile=false;
  const open=h('a','sd-demo-open','Open full-screen demo ↗');open.href=base+selectedRoute;open.target='_blank';open.rel='noopener';
  const status=h('p','sd-demo-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  const choices=[];
  function updatePreviewLabel(){const selected=choices.find(item=>(item.route||'')===selectedRoute);const scene=selected?.title||'Project screen';const device=mobile?'phone':'laptop';demoFrame.title=(data.project||'Studio project')+': '+scene+' ('+device+' preview)';status.textContent='Previewing '+scene+' on '+device+'.';open.setAttribute('aria-label','Open '+scene+' in a new tab')}
  function switchTo(route){selectedRoute=route;demoFrame.src=base+route;open.href=base+route;[...controls.querySelectorAll('button')].forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.route===route)));updatePreviewLabel()}
  [...data.desktop,...data.phone].forEach(item=>{if(!choices.some(x=>x.route===item.route))choices.push(item)});
  choices.forEach((item,i)=>{const btn=h('button','',item.short||item.title);btn.type='button';btn.dataset.route=item.route||'';btn.setAttribute('aria-pressed',String(i===0));btn.onclick=()=>switchTo(item.route||'');controls.append(btn)});
  [['Laptop',false],['Phone',true]].forEach(([name,flag])=>{const btn=h('button','',name);btn.type='button';btn.setAttribute('aria-pressed',String(flag===mobile));btn.onclick=()=>{mobile=flag;frameBox.classList.toggle('is-phone',flag);controlsMobile.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));updatePreviewLabel()};controlsMobile.append(btn)});
  updatePreviewLabel();details.append(controls);details.append(controlsMobile);details.append(status);details.append(open);demo.append(details,area);mount.append(demo);
  if('IntersectionObserver'in window){const obs=new IntersectionObserver(entries=>{if(entries[0].isIntersecting){demoFrame.src=base+selectedRoute;obs.disconnect()}},{rootMargin:'200px'});obs.observe(frameBox)}else demoFrame.src=base+selectedRoute;
 }
 if(!new URLSearchParams(location.search).has('preview'))document.querySelectorAll('.sd-showcase').forEach(init);
})();