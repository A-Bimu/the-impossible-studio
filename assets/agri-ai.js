(()=>{'use strict';
const $=id=>document.getElementById(id),esc=v=>String(v).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;':'&quot;',"'":'&#39;'}[x]));
const fmt=n=>Number(n).toLocaleString('en-KE',{maximumFractionDigits:0});
const nav=$('menu-toggle'),menu=$('main-menu');
nav?.addEventListener('click',()=>{const opened=menu.classList.toggle('is-open');nav.setAttribute('aria-expanded',String(opened));nav.textContent=opened?'CLOSE ✕':'MENU ☰'});
menu?.addEventListener('click',e=>{if(e.target.closest('a')){menu.classList.remove('is-open');nav?.setAttribute('aria-expanded','false');if(nav)nav.textContent='MENU ☰'}});
const preview=$('agri-preview');
document.querySelectorAll('[data-preview]').forEach(b=>b.addEventListener('click',()=>{
 const route=b.dataset.preview||'';
 if(!/^(crop-check|farm-planner|market-guide)$/.test(route))return;
 if(preview)preview.src=route+'.html?embed=1';
 document.querySelectorAll('[data-preview]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
}));
if(new URLSearchParams(location.search).has('embed'))document.body.classList.add('embed-mode');
const form=$('crop-form'),result=$('crop-result'),uploaded=$('crop-photo'),photo=$('crop-preview');
let objectUrl=null;
uploaded?.addEventListener('change',()=>{
 if(objectUrl)URL.revokeObjectURL(objectUrl);
 objectUrl=null;
 const file=uploaded.files?.[0];
 if(!file){photo?.replaceChildren();return}
 if(!file.type.startsWith('image/')){uploaded.value='';photo.innerHTML='<p class="help-note">Please use an image file.</p>';return}
 if(file.size>8*1024*1024){uploaded.value='';photo.innerHTML='<p class="help-note">Use a photo smaller than 8MB.</p>';return}
 objectUrl=URL.createObjectURL(file);
 if(photo){photo.innerHTML='';const im=document.createElement('img');im.src=objectUrl;im.alt='Preview of your locally selected crop image; not analysed by AI';im.style.cssText='width:100%;max-height:250px;object-fit:contain';photo.appendChild(im)}
});
const triage={
 yellow:{label:'Yellow or spotted leaves',check:'Compare affected and healthy leaves. Note whether discoloration begins on older or newer growth. Check drainage, water stress, nutrient history and insect damage before deciding on treatment.',next:'Photograph the upper and lower leaf surfaces, record how many plants are affected, and ask a trained agricultural extension worker for a diagnosis.'},
 holes:{label:'Holes or chewed edges',check:'Inspect the underside of leaves and growing points for insects, eggs or fresh feeding damage. Avoid treating the entire field before identifying the cause.',next:'Check several plants in different parts of the plot, photograph any visible insects, and ask a qualified agronomist about locally appropriate integrated pest management.'},
 wilt:{label:'Wilting or curling',check:'Check soil moisture and drainage at root depth; compare affected plants with nearby unaffected plants. Multiple causes—including heat, root damage and disease—can look similar.',next:'Review recent irrigation and rain history and seek local extension support if wilting persists or spreads.'},
 slow:{label:'Slow growth or uneven plants',check:'Check planting date, spacing, soil moisture, soil condition and history of fertilizer application; look for patterns across the plot.',next:'Record growth stage and any known soil test results, then consult an agronomist before adding nutrients or crop treatments.'}
};
form?.addEventListener('submit',e=>{
 e.preventDefault();
 const crop=String($('crop-name')?.value||'maize');
 const symptom=String($('crop-symptom')?.value||'yellow');
 const county=String($('crop-county')?.value||'Nakuru');
 const t=triage[symptom]||triage.yellow;
 result.innerHTML='<span class="badge">Illustrative triage / Not a diagnosis</span><h3>'+esc(t.label)+'</h3><p>For your example <strong>'+esc(crop)+'</strong> crop in <strong>'+esc(county)+'</strong>:</p><p>'+esc(t.check)+'</p><h3>What to do next</h3><p>'+esc(t.next)+'</p><div class="warn"><strong>Important:</strong> No image recognition or live agricultural model ran. This is general educational guidance, not a pest or disease diagnosis. A local extension officer should confirm any treatment decisions.</div>';
 result.scrollIntoView({behavior:'smooth',block:'nearest'});
});
const planner=$('planner-form'),tasks=$('plan-tasks'),planResult=$('plan-result');
const sets={
 preparation:['Confirm the intended crop, farm size and planting season with local extension guidance.','Review field drainage and identify erosion or compaction problems.','Check seed source and planting material quality.','Review any recent soil-test results before choosing inputs.'],
 planting:['Review local planting-window guidance, not a generic calendar.','Confirm spacing, planting depth and seed suitability for the variety.','Record planting date and the area planted.','Check moisture conditions and review germination after planting.'],
 growing:['Walk the field and check multiple representative plants.','Record observed moisture, insects and unusual symptoms.','Use extension advice to decide if a response is needed.','Update farm records for labour, inputs and observations.'],
 harvest:['Check maturity for the specific crop and variety.','Plan drying, handling, storage and transport safely.','Record actual harvested quantity and quality.','Compare buyer offers, costs and payment terms before selling.']
};
function planKey(){return 'agri-ai-plan-'+[ $('plan-county')?.value,$('plan-crop')?.value,$('plan-stage')?.value ].join('-')}
function readPlan(){try{const x=JSON.parse(localStorage.getItem(planKey())||'[]');return Array.isArray(x)?x:[]}catch{return []}}
function renderPlan(){
 if(!tasks)return;
 const stage=$('plan-stage')?.value||'preparation',crop=$('plan-crop')?.value||'maize',county=$('plan-county')?.value||'Nakuru';
 const items=sets[stage]||sets.preparation,completed=readPlan();
 tasks.innerHTML='<span class="badge">Example season checklist</span><h3>'+esc(crop.toUpperCase())+' / '+esc(county)+'</h3><p>This is a sample workflow for the <strong>'+esc(stage)+'</strong> stage. It does not use real local weather, soil or planting forecasts.</p><div class="meter"><i id="plan-meter" style="width:'+(completed.length/items.length*100)+'%"></i></div><p id="plan-status" class="help-note">'+completed.length+' of '+items.length+' example actions completed.</p><ul class="checklist">'+items.map((x,i)=>'<li><label><input type="checkbox" data-step="'+i+'" '+(completed.includes(i)?'checked':'')+'><span>'+esc(x)+'</span></label></li>').join('')+'</ul><p class="help-note">Saved in this browser only. For planting windows, check your county extension office and current KMD forecasts.</p>';
}
planner?.addEventListener('submit',e=>{e.preventDefault();renderPlan();planResult?.scrollIntoView({behavior:'smooth',block:'nearest'})});
tasks?.addEventListener('change',e=>{
 const i=e.target?.dataset?.step;
 if(i===undefined)return;
 let ids=[...tasks.querySelectorAll('[data-step]:checked')].map(x=>Number(x.dataset.step));
 try{localStorage.setItem(planKey(),JSON.stringify(ids))}catch{}
 renderPlan();
});
const market=$('market-form'),marketResult=$('market-result');
const examples={maize:42,potato:63,tomato:88,beans:120};
market?.addEventListener('submit',e=>{e.preventDefault();calculateMarket()});
$('market-crop')?.addEventListener('change',e=>{const input=$('market-price');if(input)input.value=examples[e.target.value]||50;calculateMarket()});
$('market-qty')?.addEventListener('input',calculateMarket);
$('market-price')?.addEventListener('input',calculateMarket);
function calculateMarket(){
 if(!marketResult)return;
 const qty=Number($('market-qty')?.value),price=Number($('market-price')?.value),crop=$('market-crop')?.value||'maize';
 if(!Number.isFinite(qty)||!Number.isFinite(price)||qty<=0||price<0||qty>1000000||price>1000000){
  marketResult.innerHTML='<h3>Enter a valid quantity and price.</h3><p>Use positive kilogram quantities and a nonnegative sample price.</p>';return;
 }
 const gross=qty*price;
 marketResult.innerHTML='<span class="badge">Calculator / Example only</span><h3>KSh '+fmt(gross)+'</h3><p>Illustrative gross sale value: '+fmt(qty)+' kg × KSh '+fmt(price)+'/kg of '+esc(crop)+'.</p><p>This is <strong>not profit</strong>. It excludes transport, bags, labour, losses, commission and other costs.</p><div class="warn">The starting prices are invented examples, not current Kenyan market prices, farmgate quotations or buyer offers. Enter an independently verified local offer for a useful estimate.</div>';
}
if(marketResult)calculateMarket();
const params=new URLSearchParams(location.search);
if(form&&params.has('symptom')){
 const symptom=params.get('symptom');
 if(Object.hasOwn(triage,symptom)){const field=$('crop-symptom');if(field)field.value=symptom;form.requestSubmit()}
}
if(planner&&params.has('stage')){
 const stage=params.get('stage');
 if(Object.hasOwn(sets,stage)){const field=$('plan-stage');if(field)field.value=stage;renderPlan()}
}
})();