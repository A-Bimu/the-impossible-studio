/* Inspect archived pin concepts without modifying the approved board. */
(() => {
 const grid=document.getElementById('pin-grid'),dialog=document.getElementById('pin-detail'),count=document.getElementById('pin-count');
 if(!grid||!dialog||!count)return;
 const cards=[...grid.querySelectorAll('.pin-card')],filters=[...document.querySelectorAll('.pin-filters [data-filter]')];
 const labels={whimsical:'Whimsical / soft',chilled:'Chilled / everyday',bold:'Bold / cheeky'};
 const art=document.getElementById('pin-detail-art'),title=document.getElementById('pin-detail-title'),category=document.getElementById('pin-detail-category');
 const position=document.getElementById('pin-detail-position'),previous=dialog.querySelector('[data-previous-concept]'),next=dialog.querySelector('[data-next-concept]');
 let trigger=null,visibleCards=[],index=-1;
 function showConcept(card){
  index=visibleCards.indexOf(card);
  if(index<0)return;
  for(const name of ['--crop-x','--crop-y'])art.style.setProperty(name,card.style.getPropertyValue(name));
  title.textContent=card.dataset.title;
  category.textContent=labels[card.dataset.category];
  position.textContent=(index+1)+' of '+visibleCards.length+': '+card.dataset.title;
  previous.disabled=index===0;
  next.disabled=index===visibleCards.length-1;
 }
 filters.forEach(button=>button.addEventListener('click',()=>{
  const filter=button.dataset.filter;
  filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  let visible=0;
  cards.forEach(card=>{card.hidden=filter!=='all'&&card.dataset.category!==filter;if(!card.hidden)visible++;});
  count.textContent=filter==='all'?'Showing all 9 concepts':'Showing '+visible+' '+labels[filter]+' concepts';
 }));
 cards.forEach(card=>card.addEventListener('click',()=>{
  trigger=card;
  visibleCards=cards.filter(item=>!item.hidden);
  showConcept(card);
  dialog.showModal();
 }));
 previous.addEventListener('click',()=>{if(index>0)showConcept(visibleCards[index-1]);});
 next.addEventListener('click',()=>{if(index>=0&&index<visibleCards.length-1)showConcept(visibleCards[index+1]);});
 dialog.querySelector('[data-close-dialog]').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
 dialog.addEventListener('close',()=>{if(trigger&&!trigger.hidden)trigger.focus();});
})();
