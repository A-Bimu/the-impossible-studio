/* YELO — Independent youth-finance concept. Local demo only; no actual money or bank services. */
(()=>{'use strict';
 const $=id=>document.getElementById(id);
 const ROUTES=['home','move','goals','cards','insights'];
 const KEY='impossible-studio-yelo-v1';
 const seed=()=>({
  balance:24500,goal:18600,target:65000,invested:0,frozen:false,showBalance:true,
  entries:[
   {kind:'out',name:'Lunch · sample',amount:480,at:'Earlier'},
   {kind:'in',name:'Creative gig · sample',amount:9500,at:'Earlier'},
   {kind:'out',name:'Transport · sample',amount:220,at:'Earlier'}
  ]
 });
 let state;
 try{const stored=JSON.parse(localStorage.getItem(KEY));state=stored&&Number.isFinite(stored.balance)&&Number.isFinite(stored.goal)&&Array.isArray(stored.entries)?stored:seed()}catch{state=seed()}
 let activeRoute='home',toastTimer=0,mode='';
 const money=v=>'KSh '+Number(v||0).toLocaleString('en-KE',{minimumFractionDigits:2,maximumFractionDigits:2});
 const val=v=>state.showBalance?money(v):'KSh ••••••';
 const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const safe=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch{toast('Demo storage is unavailable; changes may not persist.')}};
 const addEntry=(kind,name,amount)=>{state.entries.unshift({kind,name,amount,at:'Just now'});state.entries=state.entries.slice(0,18)};
 const action=(label,kind,icon)=>'<button type="button" class="phone-action" data-action="'+kind+'"><span class="act-icon" aria-hidden="true">'+icon+'</span>'+label+'</button>';
 const card=()=>'<div class="graffiti-card"><div class="card-head"><strong class="card-logo">YELO</strong><span class="card-crown" aria-hidden="true">01 / KE</span></div><div class="chip" aria-hidden="true"></div><div class="card-bottom"><span>•••• 4837<br><small>DEMO DEBIT</small></span><span class="card-tag" aria-hidden="true">Y!</span></div>'+(state.frozen?'<div class="card-frozen">CARD FROZEN</div>':'')+'</div>';
 const balance=()=>'<div class="phone-panel"><div class="balance-row"><span>Your balance (KES)</span><button type="button" class="eye" data-action="visibility" aria-label="'+(state.showBalance?'Hide':'Show')+' sample balance">'+(state.showBalance?'◉':'◌')+'</button></div><div class="balance-amount">'+val(state.balance)+'</div><button type="button" class="orange-button" data-action="add">+ Add sample money</button></div>';
 const goalPct=()=>Math.min(100,Math.round(state.goal/state.target*100));
 const goal=()=>'<button type="button" class="goal-widget" data-route="goals" aria-label="Open laptop savings goal"><div class="mini-row"><strong>◎ Laptop fund</strong><span>'+goalPct()+'%</span></div><p>'+val(state.goal)+' saved of '+money(state.target)+'</p><div class="progress"><i style="width:'+goalPct()+'%"></i></div></button>';
 const activities=()=>state.entries.length?state.entries.slice(0,7).map(t=>'<div class="flow-item"><div><strong>'+esc(t.name)+'</strong><small>'+esc(t.at)+'</small></div><b>'+(t.kind==='in'?'+':'−')+money(t.amount)+'</b></div>').join(''):'<p class="hint">No sample activity.</p>';
 function home(){
  return '<div class="app-welcome"><p class="app-label">TUESDAY / SAMPLE ACCOUNT</p><h2>Sasa, Amani.</h2><p class="small">Your shillings. Your decisions.</p></div>'+
   balance()+
   '<div class="app-utility-title"><span>QUICK MOVES</span><span>01—04</span></div>'+
   '<div class="phone-action-grid">'+action('Send','send','↗')+action('Bills','bills','▤')+action('Save','save','◎')+action('Card','cards','▣')+'</div>'+
   '<div class="phone-card-preview"><div><span class="app-label">YOUR CARD / 4837</span><strong>YELO.</strong></div><button type="button" data-route="cards">VIEW CARD ↗</button></div>'+
   '<div class="app-utility-title"><span>IN PROGRESS</span><span>ONE GOAL</span></div>'+goal()+
   '<div class="app-utility-title"><span>RECENT MOVES</span><button type="button" data-route="move">ALL ACTIVITY ↗</button></div>'+
   '<div class="app-mini-transactions">'+state.entries.slice(0,2).map(t=>'<div class="app-mini-transaction"><div><strong>'+esc(t.name)+'</strong><small>'+esc(t.at)+'</small></div><b>'+(t.kind==='in'?'+':'−')+money(t.amount)+'</b></div>').join('')+'</div>'+
   '<p class="hint">LOCAL DEMO / NO REAL BANKING</p>';
}
 function move(){
 return '<div class="phone-title"><h2>Make a move.</h2><button type="button" class="back-home" data-route="home">← BACK</button></div>'+
 '<p class="small">Your account / fictional KES transactions.</p>'+balance()+
 '<div class="app-utility-title"><span>CHOOSE AN ACTION</span><span>01—04</span></div>'+
 '<div class="phone-action-grid">'+action('Send','send','↗')+action('M-Pesa','send','⇄')+action('Bills','bills','▤')+action('Top up','add','＋')+'</div>'+
 '<div class="app-utility-title"><span>TRANSACTION LOG</span><span>SAMPLE</span></div>'+
 '<div class="app-transactions">'+activities()+'</div>'+
 '<button type="button" class="back-home" data-action="reset" style="margin-top:15px">RESET SAMPLE DATA ↺</button>';
}
 function goals(){
 return '<div class="phone-title"><h2>Get there.</h2><button type="button" class="back-home" data-route="home">← BACK</button></div>'+
 '<p class="small">One small step. Then the next.</p>'+
 '<div class="goal-hero"><span class="app-label">GOAL 01 / PERSONAL</span><h3>Laptop fund.</h3><p>For the edits, the classes and the ideas.</p><div class="goal-numbers"><strong>'+val(state.goal)+'</strong><span>'+goalPct()+'% FUNDED</span></div><div class="progress"><i style="width:'+goalPct()+'%"></i></div><p class="hint">TARGET '+money(state.target)+'</p><button type="button" class="orange-button" data-action="save">ADD MONEY TO GOAL ↗</button></div>'+
 '<div class="info-bubble"><b>Money set aside / fictional</b>Funding this goal moves the amount from the demo balance. There is no real savings account behind this design.</div>';
}
 function cards(){
 return '<div class="phone-title"><h2>Not a basic card.</h2><button type="button" class="back-home" data-route="home">← BACK</button></div>'+
 '<p class="small">Look loud. Stay in control.</p>'+
 '<div class="card-in-phone">'+card()+'</div>'+
 '<div class="app-utility-title"><span>YOUR CONTROLS</span><span>CARD 4837</span></div>'+
 '<div class="mini-panel"><h3>Fictional virtual debit</h3><p>'+ (state.frozen?'CARD STATUS: FROZEN':'CARD STATUS: ACTIVE') +' · No payments possible.</p><button type="button" class="orange-button" data-action="freeze">'+(state.frozen?'UNFREEZE SAMPLE CARD ↗':'FREEZE SAMPLE CARD ↗')+'</button></div>'+
 '<div class="info-bubble"><b>Design note</b>The paint is visual. The controls are practical. No card number or PIN is ever shown or collected.</div>';
}
 function insights(){
 const sum=state.entries.filter(e=>e.kind==='out').reduce((n,e)=>n+e.amount,0);
 const widths=[75,48,29];
 return '<div class="phone-title"><h2>The breakdown.</h2><button type="button" class="back-home" data-route="home">← BACK</button></div>'+
 '<p class="small">Example categories / browser-local activity.</p>'+
 '<div class="mini-panel"><h3>SAMPLE MONTH / KES</h3><div class="metric-bars">'+
 [['Food + coffee','2,800'],['Transport','1,850'],['Subscriptions','750']].map((r,i)=>'<div class="metric-row"><span>'+r[0]+'</span><div class="metric-track"><i style="width:'+widths[i]+'%"></i></div><b>'+r[1]+'</b></div>').join('')+'</div><p class="hint">Illustrative numbers, not derived from an account.</p></div>'+
 '<div class="app-utility-title"><span>YOUR DEMO ACTIVITY</span><span>OUTGOING '+money(sum)+'</span></div>'+
 '<div class="app-transactions">'+activities()+'</div>'+
 '<div class="info-bubble"><b>Proposed feature</b>Spending insights should make money clearer before you spend it, not give you more charts to decode.</div>';
}
 const screenRender={home,move,goals,cards,insights};
 function render(){
  const main=$('yelo-screen');if(!main)return;
  main.innerHTML=screenRender[activeRoute]();
  document.querySelectorAll('.nav-btn[data-route]').forEach(b=>b.setAttribute('aria-current',b.dataset.route===activeRoute?'page':'false'));
  document.querySelectorAll('[data-preview-route]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.previewRoute===activeRoute)));
  main.scrollTop=0;
 }
 function navigate(route){
  if(!ROUTES.includes(route))route='home';
  activeRoute=route;
  if(location.hash!=='#'+route)history.replaceState(null,'','#'+route);
  render();
  const preview=$('yelo-live-preview');
  if(preview&&document.activeElement?.dataset?.previewRoute){
   preview.src='index.html?preview=1#'+route;
  }
 }
 function toast(text){
  const n=$('yelo-toast');if(!n)return;
  n.textContent=text;n.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{n.hidden=true},4000);
 }
 const dialog=$('action-dialog'),fields=$('modal-fields'),form=$('demo-form');
 const numberField=(label,value='1000')=>'<label>'+label+'<input name="amount" type="number" inputmode="decimal" step="1" min="1" max="1000000" value="'+value+'" required></label>';
 function openAction(kind){
  mode=kind;
  const meta={
   send:['Send sample money','Try a fictional M-Pesa or bank transfer.','Sample transfer ↗','<label>Fictional recipient or reference<input name="recipient" required maxlength="35" autocomplete="off" placeholder="e.g. Alex"></label>'+numberField('Amount in KES')],
   bills:['Pay a sample bill','Choose a bill provider, then test the local transaction flow.','Record sample bill ↗','<label>Bill provider<select name="provider" required><option>Electricity</option><option>Water</option><option>Internet</option><option>School fee</option></select></label>'+numberField('Amount in KES','800')],
   add:['Add demo money','No bank or payment provider is contacted.','Add sample balance ↗',numberField('Amount in KES','1000')],
   save:['Fund your laptop goal','This only moves fictional money from the demo balance.','Move into sample goal ↗',numberField('Amount to save in KES','500')],
   invest:['Explore investing','This concept shows a sample investment allocation. Returns are not calculated or promised.','Allocate sample amount ↗',numberField('Illustrative amount in KES','100')],
   business:['Your side hustle','A conceptual area for creators and small businesses.','Record sample business interest ↗','<label>Your idea (fictional)<select name="type"><option>Creator business</option><option>Online shop</option><option>Freelance services</option><option>Other hustle</option></select></label>'],
   perks:['Perks & community','Sample offers only, with no actual coupon or redemption.','Okay, got it!','<div class="info-bubble"><b>Creators meet-up · Sample</b>Free fictional community workshop, youth finance tips and merchant ideas. No event is scheduled.</div>']
  }[kind];
  if(!meta)return;
  $('modal-title').textContent=meta[0];$('modal-description').textContent=meta[1];$('modal-submit').textContent=meta[2];fields.innerHTML=meta[3];
  dialog.showModal();fields.querySelector('input,select')?.focus();
 }
 function transact(kind,data){
  const amount=Number(data.get('amount'));
  if(kind==='business'){toast('Business tools are a design concept, not an open application.');return true}
  if(kind==='perks'){toast('These perks are examples, not real offers.');return true}
  if(!Number.isFinite(amount)||!Number.isInteger(amount)||amount<1||amount>1000000){toast('Enter a whole-number sample amount between KSh 1 and KSh 1,000,000.');return false}
  if(kind!=='add'&&amount>state.balance){toast('Insufficient sample balance. Add demo money first.');return false}
  if(kind==='save'&&state.goal+amount>state.target){toast('That amount would exceed this sample goal.');return false}
  if(kind==='add'){state.balance+=amount;addEntry('in','Demo top-up',amount)}
  if(kind==='send'){const name=String(data.get('recipient')||'').trim();if(!name){toast('Enter a fictional recipient.');return false}state.balance-=amount;addEntry('out','Transfer · '+name,amount)}
  if(kind==='bills'){state.balance-=amount;addEntry('out',String(data.get('provider'))+' · sample bill',amount)}
  if(kind==='save'){state.balance-=amount;state.goal+=amount;addEntry('out','Laptop savings goal',amount)}
  if(kind==='invest'){state.balance-=amount;state.invested+=amount;addEntry('out','Fictional investment allocation',amount)}
  safe();
  toast(kind==='save'?'Goal updated: '+money(amount)+' put aside.':kind==='invest'?'Sample allocation recorded. No investment made.':'Demo updated: '+money(amount)+'. No real money moved.');
  return true;
 }
 form?.addEventListener('submit',e=>{
  e.preventDefault();
  if(transact(mode,new FormData(form))){dialog.close();render()}
 });
 $('modal-close')?.addEventListener('click',()=>dialog.close());
 document.addEventListener('click',e=>{
  const routeBtn=e.target.closest('[data-route],[data-preview-route]');
  if(routeBtn){
   const target=routeBtn.dataset.previewRoute||routeBtn.dataset.route;
   if(routeBtn.dataset.previewRoute){document.querySelectorAll('[data-preview-route]').forEach(x=>x.setAttribute('aria-pressed',String(x===routeBtn)));if($('yelo-live-preview'))$('yelo-live-preview').src='index.html?preview=1#'+target;if(routeBtn.classList.contains('feature-row'))$('experience')?.scrollIntoView({behavior:'smooth',block:'start'})}
   else navigate(target);
   return;
  }
  const b=e.target.closest('[data-action]');
  if(!b)return;
  const a=b.dataset.action;
  if(ROUTES.includes(a)){navigate(a);return}
  if(a==='visibility'){state.showBalance=!state.showBalance;safe();render();return}
  if(a==='freeze'){state.frozen=!state.frozen;safe();render();toast(state.frozen?'Sample card frozen.':'Sample card unfrozen.');return}
  if(a==='notifications'){toast('You are all caught up. Sample notifications only.');return}
  if(a==='reset'){
   if(confirm('Reset this fictional YELO banking demo? Your sample activity will be lost.')){state=seed();safe();render();toast('YELO sample account reset.')}
   return;
  }
  openAction(a);
 });
 const toggle=$('menu-toggle');
 toggle?.addEventListener('click',()=>{
  const open=$('site-nav').classList.toggle('is-open');toggle.setAttribute('aria-expanded',String(open));
 });
 $('site-nav')?.addEventListener('click',e=>{if(e.target.closest('a')){$('site-nav').classList.remove('is-open');toggle?.setAttribute('aria-expanded','false')}});
 window.addEventListener('hashchange',()=>{const next=location.hash.slice(1);if(ROUTES.includes(next)){activeRoute=next;render()}});
 if(new URLSearchParams(location.search).has('preview'))document.body.classList.add('preview-mode');
 activeRoute=ROUTES.includes(location.hash.slice(1))?location.hash.slice(1):'home';
 render();
})();
