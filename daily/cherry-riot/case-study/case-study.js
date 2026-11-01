(()=>{'use strict';
const shop='../shop/';
const laptopViews=[
{view:'home',title:'HOMEPAGE',description:'Brand story, hero and collection entry'},
{view:'product',title:'PRODUCT / FLAVOUR PAGE',description:'Detailed flavours, quantities and add to bag'},
{view:'cart',preview:true,title:'CART / SHOP PAGE',description:'Real demo bag, quantity controls and summary'}
];
const phoneViews=[
{view:'home',title:'MOBILE · HOMEPAGE',description:'Brand entry, hero and navigation'},
{view:'product',title:'MOBILE · PRODUCT PAGE',description:'Flavour details and demo add to bag'},
{view:'pairings',title:'MOBILE · PAIRINGS PAGE',description:'Inspiration and food pairings'},
{view:'cart',preview:true,title:'MOBILE · SHOPPING BAG',description:'Demo basket and order summary'},
{view:'story',title:'MOBILE · OUR STORY',description:'About the fictional preserves brand'}
];
function urlFor(item){return shop+'?view='+encodeURIComponent(item.view)+(item.preview?'&preview=1':'')}
function deviceHTML(type,item){const url=urlFor(item);const device=type==='laptop'?'<div class="laptop-lid"><div class="screen-viewport" data-screen-width="1200"><iframe class="screen-content" loading="lazy" src="'+url+'" title="'+item.title+' desktop responsive website preview" tabindex="-1"></iframe></div></div><div class="laptop-base"></div>':'<div class="phone-shell"><div class="phone-screen" data-screen-width="390"><iframe class="screen-content" loading="lazy" src="'+url+'" title="'+item.title+' phone responsive website preview" tabindex="-1"></iframe></div></div>';
return '<article class="device-card"><div class="device '+type+'">'+device+'</div><div class="device-caption"><strong>'+item.title+'</strong><span>'+item.description+'</span><a href="'+url+'" target="_blank" rel="noopener" aria-label="Open '+item.title+' in a full-size browser">Open screen ↗</a></div></article>'}
function overviewDevice(type,item){const html=deviceHTML(type,item),doc=document.createElement('div');doc.innerHTML=html;return doc.querySelector('.device').outerHTML}
document.querySelector('#overviewDevices').innerHTML=overviewDevice('laptop',laptopViews[0])+overviewDevice('phone',phoneViews[0]);
document.querySelector('#laptopGallery').innerHTML=laptopViews.map(v=>deviceHTML('laptop',v)).join('');
document.querySelector('#phoneGallery').innerHTML=phoneViews.map(v=>deviceHTML('phone',v)).join('');
const smallDemo=document.querySelector('#smallDemoFrame');smallDemo.innerHTML='<iframe src="'+urlFor(laptopViews[0])+'" loading="lazy" title="Working CHERRY RIOT storefront homepage preview" tabindex="-1"></iframe>';
function sizeScreens(){document.querySelectorAll('[data-screen-width]').forEach(box=>{const real=Number(box.getAttribute('data-screen-width'))||1200;const scale=box.clientWidth/real;box.style.setProperty('--screen-scale',String(scale))});if(smallDemo)smallDemo.style.setProperty('--screen-scale',String(smallDemo.clientWidth/1200))}
if('ResizeObserver'in window){const observer=new ResizeObserver(sizeScreens);document.querySelectorAll('[data-screen-width],#smallDemoFrame').forEach(el=>observer.observe(el))}window.addEventListener('resize',sizeScreens);requestAnimationFrame(sizeScreens);
const modal=document.querySelector('#demoModal'),preview=document.querySelector('#activeDemoFrame'),stage=document.querySelector('#modalStage'),standalone=document.querySelector('#openStandaloneDemo');let selectedView='home',selectedDevice='desktop';
function refreshDemo(){let url=shop+'?view='+selectedView;preview.src=url;standalone.href=url;stage.classList.toggle('is-phone',selectedDevice==='phone');document.querySelectorAll('[data-demo-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.demoView===selectedView)));document.querySelectorAll('[data-device]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.device===selectedDevice)))}
document.querySelectorAll('[data-open-demo]').forEach(b=>b.addEventListener('click',()=>{refreshDemo();modal.showModal()}));document.querySelector('#closeDemo').addEventListener('click',()=>modal.close());
document.querySelectorAll('[data-demo-view]').forEach(b=>b.addEventListener('click',()=>{selectedView=b.dataset.demoView;refreshDemo()}));
document.querySelectorAll('[data-device]').forEach(b=>b.addEventListener('click',()=>{selectedDevice=b.dataset.device;refreshDemo()}));
const navigation=[...document.querySelectorAll('.studio-sidebar nav a')],sections=navigation.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
if('IntersectionObserver'in window){const obs=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){navigation.forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id))}})},{rootMargin:'-15% 0px -70% 0px'});sections.forEach(s=>obs.observe(s))}
})();