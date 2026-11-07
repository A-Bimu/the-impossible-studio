/* Vela Health / responsive patient navigation enhancements.
   The underlying care, clinician and booking demo remains local and fictional. */
(()=>{'use strict';
 const menu=document.getElementById('vela-mobile-menu');
 const nav=document.getElementById('vela-nav');
 if(menu&&nav){
  function close(){menu.setAttribute('aria-expanded','false');nav.removeAttribute('data-open')}
  menu.addEventListener('click',()=>{
   const open=menu.getAttribute('aria-expanded')!=='true';
   menu.setAttribute('aria-expanded',String(open));
   if(open)nav.dataset.open='true';else nav.removeAttribute('data-open');
  });
  nav.addEventListener('click',e=>{if(e.target.closest('a'))close()});
  window.addEventListener('hashchange',close);
  window.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.dataset.open==='true'){close();menu.focus()}});
  document.addEventListener('click',e=>{if(nav.dataset.open==='true'&&!e.target.closest('.site-head'))close()});
  window.addEventListener('resize',()=>{if(innerWidth>700)close()});
 }
 // The care-picker's chosen service is already propagated to the existing
 // booking select; this badge simply makes that connection visible.
 const select=document.getElementById('service');
 if(select){
  const response=document.getElementById('vela-care-book');
  const initial=response?.textContent;
  const choices=[...document.querySelectorAll('[data-vela-service]')];
  choices.forEach(button=>button.addEventListener('click',()=>{
   if(!response)return;
   response.setAttribute('aria-label','Continue to a sample '+button.dataset.velaService+' appointment');
  }));
 }
 // A persistent sample-only status helps distinguish the product from a real
 // medical practice, especially when arriving via a deep link to booking.
 const banner=document.createElement('div');
 banner.className='vela-demo-indicator';
 banner.innerHTML='<span aria-hidden="true"></span> PORTFOLIO DEMO · NO REAL MEDICAL BOOKINGS';
 banner.setAttribute('aria-label','Portfolio demo. No real medical bookings.');
 document.querySelector('footer.footer')?.prepend(banner);
})();
