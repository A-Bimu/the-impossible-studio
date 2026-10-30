/* Browse the existing archived board without inventing stock or altering its artwork. */
(() => {
 const grid=document.getElementById('pin-grid'), dialog=document.getElementById('pin-detail'), count=document.getElementById('pin-count');
 if(!grid||!dialog||!count)return;
 const cards=[...grid.querySelectorAll('.pin-card')], labels={whimsical:'Whimsical / soft',chilled:'Chilled / everyday',bold:'Bold / cheeky'};
 let trigger=null;
 document.querySelectorAll('.pin-filters [data-filter]').forEach(button=>button.addEventListener('click',()=>{
  const filter=button.dataset.filter;
  document.querySelectorAll('.pin-filters [data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  let visible=0;
  cards.forEach(card=>{card.hidden=filter!=='all'&&card.dataset.category!==filter;if(!card.hidden)visible++;});
  count.textContent=filter==='all'?'Showing all 9 concepts':'Showing '+visible+' '+labels[filter]+' concepts';
 }));
 cards.forEach(card=>card.addEventListener('click',()=>{
  trigger=card;
  const art=document.getElementById('pin-detail-art');
  for(const name of ['--crop-x','--crop-y'])art.style.setProperty(name,card.style.getPropertyValue(name));
  document.getElementById('pin-detail-title').textContent=card.dataset.title;
  document.getElementById('pin-detail-category').textContent=labels[card.dataset.category];
  dialog.showModal();
 }));
 dialog.querySelector('[data-close-dialog]').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
 dialog.addEventListener('close',()=>{if(trigger&&!trigger.hidden)trigger.focus();});
})();
