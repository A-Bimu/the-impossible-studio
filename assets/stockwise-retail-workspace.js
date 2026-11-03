/* STOCKWISE / The Everyday Edit — fictional, self-contained retail operations demo.
   V2 intentionally separates: point-of-sale checkout, invoicing, fulfillment,
   payment recording, inventory movements and return/refund actions.
   Nothing here processes a payment, contacts an external API, or records real customers.
*/
(()=>{'use strict';
 const KEY='stockwise-studio-v2';
 const $=id=>document.getElementById(id);
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const money=value=>'KES '+Number(value||0).toLocaleString('en-KE',{maximumFractionDigits:0});
 const dateKey=date=>new Date(date).toLocaleDateString('en-CA',{timeZone:'Africa/Nairobi'});
 const fmtTime=value=>new Date(value).toLocaleString('en-KE',{dateStyle:'medium',timeStyle:'short',timeZone:'Africa/Nairobi'});
 const fmtDate=value=>{if(!value)return '—';const d=new Date(value+'T12:00:00+03:00');return d.toLocaleDateString('en-KE',{month:'short',day:'numeric',year:'numeric',timeZone:'Africa/Nairobi'})};
 const today=dateKey(new Date());
 const inDays=days=>dateKey(new Date(Date.now()+days*86400000));
 const ago=minutes=>new Date(Date.now()-minutes*60000).toISOString();
 const int=value=>Number.isFinite(Number(value))&&Number.isInteger(Number(value))?Number(value):NaN;
 const positive=value=>Number.isFinite(Number(value))&&Number(value)>0?Number(value):NaN;
 function seed(){return {
  version:2,shop:'The Everyday Edit · Nairobi',next:{sale:2003,invoice:1044,product:107,customer:103,movement:14},
  products:[
   {id:'p101',name:'Canvas tote · Black',sku:'EE-BAG-001',category:'Accessories',supplier:'The Canvas Co.',cost:650,price:1500,stock:18,reorder:8},
   {id:'p102',name:'Linen overshirt · Blue',sku:'EE-WEAR-002',category:'Apparel',supplier:'Threadline Studio',cost:1850,price:3800,stock:4,reorder:6},
   {id:'p103',name:'Ceramic travel cup',sku:'EE-HOME-003',category:'Lifestyle',supplier:'Clay & Co.',cost:1100,price:2200,stock:12,reorder:7},
   {id:'p104',name:'Cedarwood candle',sku:'EE-HOME-004',category:'Lifestyle',supplier:'House Notes',cost:720,price:1650,stock:2,reorder:5},
   {id:'p105',name:'Pocket notebook · A5',sku:'EE-DESK-005',category:'Stationery',supplier:'Paper Trail',cost:380,price:950,stock:24,reorder:9},
   {id:'p106',name:'Cotton cap · Navy',sku:'EE-WEAR-006',category:'Apparel',supplier:'Threadline Studio',cost:710,price:1800,stock:10,reorder:5}
  ],
  customers:[
   {id:'c101',name:'Amina Njeri',email:'amina@sample.invalid',phone:'Sample contact'},
   {id:'c102',name:'Brian Otieno',email:'brian@sample.invalid',phone:'Sample contact'}
  ],
  sales:[
   {id:'S-2001',productId:'p101',qty:2,total:3000,method:'M-Pesa',customerId:'',at:ago(85),refunded:false},
   {id:'S-2002',productId:'p105',qty:1,total:950,method:'Cash',customerId:'',at:ago(38),refunded:false}
  ],
  invoices:[
   {id:'INV-1042',customerId:'c101',productId:'p103',qty:2,total:4400,due:inDays(5),paid:false,fulfilled:true,void:false,method:'',at:ago(360),paidAt:null,fulfilledAt:ago(300)},
   {id:'INV-1043',customerId:'c102',productId:'p102',qty:1,total:3800,due:inDays(8),paid:false,fulfilled:false,void:false,method:'',at:ago(115),paidAt:null,fulfilledAt:null}
  ],
  movements:[
   {id:1,productId:'p103',delta:-2,after:12,reason:'Invoice goods handed over',ref:'INV-1042',at:ago(300)},
   {id:2,productId:'p101',delta:-2,after:18,reason:'Walk-in sale',ref:'S-2001',at:ago(85)},
   {id:3,productId:'p105',delta:-1,after:24,reason:'Walk-in sale',ref:'S-2002',at:ago(38)}
  ]
 }}
 function load(){try{const parsed=JSON.parse(localStorage.getItem(KEY));if(parsed?.version===2&&Array.isArray(parsed.products)&&Array.isArray(parsed.sales)&&Array.isArray(parsed.invoices)&&Array.isArray(parsed.movements)&&Array.isArray(parsed.customers)&&parsed.next)return parsed}catch{}return seed()}
 let state=load();
 const getProduct=id=>state.products.find(p=>p.id===id);
 const getCustomer=id=>state.customers.find(c=>c.id===id);
 const lowProducts=()=>state.products.filter(p=>p.stock<=p.reorder);
 const unpaidInvoices=()=>state.invoices.filter(i=>!i.void&&!i.paid);
 const safeSave=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){notice('Browser storage unavailable. Sample changes may not persist.',true)}renderAll();window.dispatchEvent(new CustomEvent('stockwise:v2-update'))};
 let toastTimer;function notice(message,error=false){const el=$('ws-toast');el.textContent=message;el.hidden=false;el.style.borderLeftColor=error?'#f17b9d':'#ffe500';clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,3600)}
 function fail(message){notice(message,true);return false}
 function next(kind,prefix){const n=state.next[kind]++;return prefix+n}
 function move(p,delta,reason,ref){const d=int(delta);if(!p||!Number.isInteger(d)||p.stock+d<0)throw Error('Insufficient stock. Receive goods before completing this action.');p.stock+=d;state.movements.push({id:state.next.movement++,productId:p.id,delta:d,after:p.stock,reason,ref,at:new Date().toISOString()})}
 const options=(values,value,label,selected='')=>values.map(v=>'<option value="'+esc(v[value])+'" '+(v[value]===selected?'selected':'')+'>'+esc(v[label])+'</option>').join('');
 const pill=(text,kind='')=>'<span class="ws-pill '+kind+'">'+esc(text)+'</span>';
 function selectOptions(){const productOpts=state.products.map(p=>'<option value="'+esc(p.id)+'">'+esc(p.name)+' · '+money(p.price)+' · '+p.stock+' left</option>').join('');
 const customerOpts=state.customers.map(c=>'<option value="'+esc(c.id)+'">'+esc(c.name)+'</option>').join('');
 for(const id of ['ws-sale-product','ws-invoice-product']){let el=$(id),prev=el.value;el.innerHTML=productOpts;if(state.products.some(p=>p.id===prev))el.value=prev}
 for(const id of ['ws-sale-customer','ws-invoice-customer']){let el=$(id),prev=el.value;el.innerHTML=(id==='ws-sale-customer'?'<option value="">Walk-in / no customer record</option>':'')+customerOpts;if(state.customers.some(c=>c.id===prev)||(id==='ws-sale-customer'&&prev===''))el.value=prev}
 }
 function renderMetrics(){const income=state.sales.filter(x=>!x.refunded).reduce((s,x)=>s+x.total,0)+state.invoices.filter(x=>!x.void&&x.paid).reduce((s,x)=>s+x.total,0);
 const outstanding=unpaidInvoices().reduce((s,x)=>s+x.total,0);
 const value=state.products.reduce((s,p)=>s+p.stock*p.cost,0);
 $('ws-metrics').innerHTML=[
  ['PAYMENTS RECORDED',money(income),'Paid sales and invoices, excluding refunds'],
  ['AWAITING PAYMENT',money(outstanding),unpaidInvoices().length+' open invoices'],
  ['LOW / OUT OF STOCK',String(lowProducts().length).padStart(2,'0'),'Products at or below threshold'],
  ['INVENTORY AT COST',money(value),'Current units × recorded purchase cost']
 ].map(([label,val,hint])=>'<article class="ws-metric"><span>'+label+'</span><strong>'+esc(val)+'</strong><small>'+esc(hint)+'</small></article>').join('');
 const tasks=[
  lowProducts().length?['Reorder '+lowProducts().length+' product'+(lowProducts().length===1?'':'s'),'A few shelves are getting thin.','alerts']:['Stock levels are in good shape','No items below their reorder points.','inventory'],
  unpaidInvoices().length?[unpaidInvoices().length+' invoices awaiting payment',money(outstanding)+' outstanding across customer bills.','invoices']:['All active invoices are paid','No payment follow-up needed.','invoices'],
  ['Next walk-in customer','Record the payment method and deduct stock in one action.','sales']
 ];
 $('ws-tasks').innerHTML=tasks.map(([heading,detail,route])=>'<div class="ws-task"><div><b>'+esc(heading)+'</b><p>'+esc(detail)+'</p></div><a href="#'+route+'">OPEN ↗</a></div>').join('');
 $('ws-alert-nav').textContent=lowProducts().length;
 $('ws-greeting').textContent='THE EVERYDAY EDIT / '+new Date().toLocaleDateString('en-KE',{weekday:'long',month:'short',day:'numeric',timeZone:'Africa/Nairobi'}).toUpperCase();
 const recent=state.movements.slice().sort((a,b)=>new Date(b.at)-new Date(a.at)).slice(0,5);
 $('ws-dashboard-activity').innerHTML=recent.length?recent.map(m=>{const p=getProduct(m.productId);return '<div class="ws-activity-entry"><time>'+esc(fmtTime(m.at))+'</time><div><strong>'+esc(m.reason)+'</strong><p>'+esc(p?.name||'Archived item')+' · '+esc(m.ref)+'</p></div><b class="'+(m.delta>=0?'ws-change-positive':'ws-change-negative')+'">'+(m.delta>0?'+':'')+m.delta+'</b></div>'}).join(''):'<div class="ws-empty">No stock movement recorded yet.</div>';
 }
 function renderInventory(){const term=$('ws-product-search').value.trim().toLowerCase(),filter=$('ws-stock-filter').value;
 const products=state.products.filter(p=>(p.name+' '+p.sku+' '+p.supplier).toLowerCase().includes(term)&&(filter==='all'||(filter==='low'&&p.stock<=p.reorder)||(filter==='out'&&p.stock===0)));
 $('ws-inventory-rows').innerHTML=products.map(p=>{
 const status=p.stock===0?pill('OUT','danger'):p.stock<=p.reorder?pill('REORDER','warning'):pill('IN STOCK','blue');
 return '<tr><td><strong>'+esc(p.name)+'</strong><small>'+esc(p.sku)+' · '+esc(p.category)+'</small></td><td>'+esc(p.supplier)+'</td><td>'+money(p.cost)+'</td><td>'+money(p.price)+'</td><td><strong>'+p.stock+'</strong>'+status+'</td><td>'+p.reorder+'</td><td><div class="ws-inline-actions"><button class="ws-mini-button primary" data-stock="'+esc(p.id)+'" data-reason="receive">RECEIVE</button><button class="ws-mini-button" data-stock="'+esc(p.id)+'" data-reason="count">ADJUST</button></div></td></tr>'
 }).join('')||'<tr><td colspan="7" class="ws-empty">No matching products. Try a different search or filter.</td></tr>';
 }
 function checkoutSummary(){const product=getProduct($('ws-sale-product').value);const qty=Math.max(0,int($('ws-sale-qty').value)||0);$('ws-sale-available').textContent=product?product.stock+' units':'—';$('ws-sale-total').textContent=money(product?qty*product.price:0)}
 function invoiceSummary(){const p=getProduct($('ws-invoice-product').value),qty=Math.max(0,int($('ws-invoice-qty').value)||0);$('ws-invoice-total').textContent=money(p?p.price*qty:0)}
 function renderSales(){
 const rows=state.sales.slice().reverse().map(s=>{
 const p=getProduct(s.productId),amount=s.refunded?'<s>'+money(s.total)+'</s> '+pill('REFUNDED','danger'):money(s.total);
 return '<tr><td><strong>'+esc(s.id)+'</strong><small>'+esc(fmtTime(s.at))+'</small></td><td>'+esc(p?.name||'Archived item')+'</td><td>'+s.qty+'</td><td class="ws-mini-currency">'+amount+'</td><td>'+esc(s.method)+'</td><td>'+ (s.refunded?'<span class="ws-small-label">Returned to stock</span>':'<button class="ws-mini-button danger" data-refund="'+esc(s.id)+'">RECORD REFUND</button>')+'</td></tr>'
 });$('ws-sales-rows').innerHTML=rows.join('')||'<tr><td colspan="6" class="ws-empty">No sales recorded yet.</td></tr>';checkoutSummary();
 }
 function renderInvoices(){
 const rows=state.invoices.slice().reverse().map(i=>{
 const customer=getCustomer(i.customerId),p=getProduct(i.productId);
 const paid=i.void?pill('VOID','danger'):i.paid?pill('PAID','blue'):pill('UNPAID','warning');
 const goods=i.void?pill('CANCELLED','danger'):i.fulfilled?pill('HANDED OVER','black'):pill('AWAITING PICKUP','warning');
 const actions=i.void?'<span class="ws-small-label">No actions</span>':[
  !i.paid?'<button class="ws-mini-button" data-pay="'+esc(i.id)+'">RECORD PAYMENT</button>':'',
  !i.fulfilled?'<button class="ws-mini-button primary" data-fulfill="'+esc(i.id)+'">HAND OVER</button>':'',
  !i.paid&&!i.fulfilled?'<button class="ws-mini-button danger" data-void="'+esc(i.id)+'">VOID</button>':''
 ].join('');
 return '<tr><td><strong>'+esc(i.id)+'</strong><small>'+esc(customer?.name||'Unknown customer')+' · '+esc(fmtTime(i.at))+'</small></td><td>'+esc(p?.name||'Archived item')+'<small>'+i.qty+' × '+money(i.total/i.qty)+'</small></td><td><strong>'+money(i.total)+'</strong></td><td>'+esc(fmtDate(i.due))+'</td><td>'+paid+'</td><td>'+goods+'</td><td><div class="ws-inline-actions">'+actions+'</div></td></tr>';
 });$('ws-invoice-rows').innerHTML=rows.join('')||'<tr><td colspan="7" class="ws-empty">No invoices yet.</td></tr>';invoiceSummary();
 }
 function renderCustomers(){$('ws-customer-rows').innerHTML=state.customers.map(c=>{
 const bills=state.invoices.filter(i=>i.customerId===c.id&&!i.void),balance=bills.filter(i=>!i.paid).reduce((s,i)=>s+i.total,0);
 return '<tr><td><strong>'+esc(c.name)+'</strong></td><td>'+esc(c.email)+'<small>'+esc(c.phone||'')+'</small></td><td>'+bills.length+'</td><td><strong>'+money(balance)+'</strong></td></tr>'
 }).join('')||'<tr><td colspan="4" class="ws-empty">No customers added.</td></tr>'}
 function renderAlerts(){const low=lowProducts();$('ws-alert-summary').textContent=low.length;
 $('ws-alert-items').innerHTML=low.length?low.map(p=>{const target=Math.max(5,2*p.reorder-p.stock);
 return '<article class="ws-alert-card"><span class="ws-eyebrow">'+(p.stock===0?'OUT OF STOCK':'BELOW REORDER POINT')+'</span><h2>'+esc(p.name)+'</h2><p>'+p.stock+' on hand · minimum '+p.reorder+' · supplier '+esc(p.supplier)+'. Suggested reorder: '+target+' units.</p><button class="ws-button ws-button-yellow" data-stock="'+esc(p.id)+'" data-reason="receive" data-suggest="'+target+'">RECEIVE DELIVERY ↗</button></article>'
 }).join(''):'<div class="ws-panel"><h2>All shelves covered.</h2><p class="ws-hint">No products are at or below their reorder levels. Try making a sale to see the alert logic work.</p><a class="ws-button ws-button-yellow" href="#sales">MAKE A SALE ↗</a></div>'}
 function renderHistory(){const moves=state.movements.slice().sort((a,b)=>new Date(b.at)-new Date(a.at));$('ws-movement-rows').innerHTML=moves.map(m=>{const p=getProduct(m.productId);
 return '<tr><td>'+esc(fmtTime(m.at))+'</td><td><strong>'+esc(p?.name||'Archived item')+'</strong></td><td>'+esc(m.reason)+'</td><td><strong class="'+(m.delta>=0?'ws-change-positive':'ws-change-negative')+'">'+(m.delta>0?'+':'')+m.delta+'</strong></td><td>'+m.after+'</td><td>'+esc(m.ref)+'</td></tr>'
 }).join('')||'<tr><td colspan="6" class="ws-empty">No movement recorded.</td></tr>'}
 function renderAll(){selectOptions();renderMetrics();renderInventory();renderSales();renderInvoices();renderCustomers();renderAlerts();renderHistory()}
 function route(){const valid=['dashboard','sales','inventory','invoices','customers','alerts','activity'];let name=location.hash.slice(1);if(!valid.includes(name))name='dashboard';
 document.querySelectorAll('[data-view]').forEach(el=>el.hidden=el.dataset.view!==name);
 document.querySelectorAll('[data-nav],[data-mobile-nav]').forEach(el=>el.setAttribute('aria-current',(el.dataset.nav||el.dataset.mobileNav)===name?'page':'false'));
 document.title='STOCKWISE / '+name[0].toUpperCase()+name.slice(1)+' · Sample store';
 window.scrollTo({top:0,behavior:'instant'});
 }
 const dialog=$('ws-dialog'),form=$('ws-dialog-form');let mode='',context={};
 const field=(label,name,type,extra='')=>'<label>'+esc(label)+'<input name="'+name+'" type="'+type+'" '+extra+' required></label>';
 const select=(label,name,values)=>'<label>'+esc(label)+'<select name="'+name+'" required>'+values+'</select></label>';
 function openDialog(type,data={}){
  mode=type;context=data;form.reset();
  const p=getProduct(data.productId),i=state.invoices.find(x=>x.id===data.invoiceId);
  let title='',description='',fields='',submit='SAVE CHANGES';
  if(type==='product'){
   title='Add a product';description='Give every item a unique SKU, supplier, purchase cost and selling price.';
   fields=field('Product name','name','text','maxlength="80"')+field('SKU / item code','sku','text','maxlength="40"')+field('Category','category','text','maxlength="35"')+field('Supplier','supplier','text','maxlength="65"')+field('Unit purchase cost (KES)','cost','number','min="1" step="1"')+field('Selling price (KES)','price','number','min="1" step="1"')+field('Starting quantity','stock','number','min="0" step="1"')+field('Reorder alert at','reorder','number','min="0" step="1"');submit='ADD TO INVENTORY';
  }else if(type==='customer'){
   title='Add a customer';description='Use fictional contact details only; data stays in your browser.';
   fields=field('Customer name','name','text','maxlength="80"')+field('Contact email','email','email','maxlength="100"')+'<label>Phone / note (optional)<input name="phone" type="text" maxlength="70"></label>';submit='ADD CUSTOMER';
  }else if(type==='stock'){
   if(!p)return fail('Product not found.');
   title='Update stock';description=esc(p.name)+' · '+p.stock+' currently on hand. Receive a delivery, log damage, or correct a physical stock count.';
   fields=select('Reason','reason','<option value="receive">Received from supplier</option><option value="damage">Damaged / lost stock</option><option value="count">Physical count correction</option>')+
   '<label>Units / final count<input name="quantity" type="number" min="0" step="1" required value="'+esc(String(data.suggest||1))+'"></label><p class="ws-hint">For delivery and damage, enter the number of units affected. For a stock count, enter the actual total on the shelf.</p>';
   submit='RECORD STOCK MOVEMENT';
  }else if(type==='payment'){
   if(!i||i.void||i.paid)return fail('Invoice is already paid or unavailable.');
   title='Record payment';description='Invoice '+esc(i.id)+' · '+money(i.total)+'. This records an offline payment, not a real transfer.';
   fields=select('Payment method','method','<option value="M-Pesa">M-Pesa (manually recorded)</option><option value="Cash">Cash</option><option value="Bank transfer">Bank transfer (recorded)</option><option value="Card">Card (manually recorded)</option>');submit='MARK INVOICE PAID';
  }else return;
  $('ws-dialog-title').textContent=title;$('ws-dialog-description').textContent=description;$('ws-dialog-fields').innerHTML=fields;$('ws-dialog-submit').textContent=submit;
  if(type==='stock'&&data.reason)form.elements.reason.value=data.reason;
  dialog.showModal();form.querySelector('input,select')?.focus();
 }
 function handleDialog(data){
  if(mode==='product'){
   const name=String(data.name||'').trim(),sku=String(data.sku||'').trim().toUpperCase();
   const cost=positive(data.cost),price=positive(data.price),stock=int(data.stock),reorder=int(data.reorder);
   if(!name||!sku||!String(data.supplier||'').trim()||!String(data.category||'').trim()||!Number.isFinite(cost)||!Number.isFinite(price)||!Number.isInteger(stock)||stock<0||!Number.isInteger(reorder)||reorder<0)return fail('Please enter valid product details, prices and stock counts.');
   if(state.products.some(p=>p.sku.toLowerCase()===sku.toLowerCase()))return fail('That SKU already exists. Every product needs a unique SKU.');
   const product={id:next('product','p'),name,sku,category:String(data.category).trim(),supplier:String(data.supplier).trim(),cost,price,stock:0,reorder};
   state.products.push(product);if(stock>0)move(product,stock,'Opening stock',product.sku);
   safeSave();notice('Product created with its opening stock recorded.');
  }else if(mode==='customer'){
   const name=String(data.name||'').trim(),email=String(data.email||'').trim();
   if(!name||!email.includes('@'))return fail('Please provide a customer name and valid sample email.');
   if(state.customers.some(c=>c.email.toLowerCase()===email.toLowerCase()))return fail('A customer with this email already exists.');
   state.customers.push({id:next('customer','c'),name,email,phone:String(data.phone||'').trim()});
   safeSave();notice('Customer added to the sample directory.');
  }else if(mode==='stock'){
   const p=getProduct(context.productId),qty=int(data.quantity),reason=String(data.reason||'');
   if(!p||!Number.isInteger(qty)||qty<0)return fail('Enter a valid whole number of units.');
   if(!['receive','damage','count'].includes(reason))return fail('Choose a valid stock movement reason.');
   if(reason!=='count'&&qty<1)return fail('At least one unit is needed for this movement.');
   const delta=reason==='count'?qty-p.stock:reason==='damage'?-qty:qty;
   if(delta===0)return fail('The recorded quantity is already correct; no change is needed.');
   if(p.stock+delta<0)return fail('You cannot remove more units than are in stock.');
   const label={receive:'Supplier delivery received',damage:'Damaged / lost',count:'Physical stock count'}[reason];
   move(p,delta,label,'ADJ-'+state.next.movement);safeSave();notice('Inventory updated. The movement is visible in Stock history.');
  }else if(mode==='payment'){
   const i=state.invoices.find(x=>x.id===context.invoiceId);
   if(!i||i.void||i.paid)return fail('Invoice can no longer be marked paid.');
   if(!['Cash','M-Pesa','Bank transfer','Card'].includes(data.method))return fail('Choose a valid payment method.');
   i.paid=true;i.method=String(data.method);i.paidAt=new Date().toISOString();safeSave();notice('Payment recorded for '+i.id+'. No actual payment processed.');
  }
  dialog.close();
 }
 function saleSubmit(formEl){const data=Object.fromEntries(new FormData(formEl)),p=getProduct(data.productId),qty=int(data.qty);
  if(!p||!Number.isInteger(qty)||qty<1)return fail('Choose an item and enter a positive whole-number quantity.');
  if(p.stock<qty)return fail('Only '+p.stock+' units available. Reduce the quantity or receive stock first.');
  if(!['M-Pesa','Cash','Card'].includes(data.method))return fail('Choose a supported payment method.');
  if(data.customerId&&!getCustomer(data.customerId))return fail('Choose a valid customer.');
  const sale={id:next('sale','S-'),productId:p.id,qty,total:p.price*qty,method:data.method,customerId:data.customerId||'',at:new Date().toISOString(),refunded:false};
  state.sales.push(sale);move(p,-qty,'Walk-in sale',sale.id);safeSave();formEl.elements.qty.value=1;
  notice('Sale '+sale.id+' recorded. '+qty+' unit(s) deducted; '+money(sale.total)+' collected in the demo.');
 }
 function invoiceSubmit(formEl){const data=Object.fromEntries(new FormData(formEl)),p=getProduct(data.productId),qty=int(data.qty);
  if(!p||!getCustomer(data.customerId)||!Number.isInteger(qty)||qty<1)return fail('Choose a customer, product and positive whole-number quantity.');
  if(!data.due||data.due<today)return fail('Select a payment due date today or later.');
  const invoice={id:next('invoice','INV-'),customerId:data.customerId,productId:p.id,qty,total:p.price*qty,due:data.due,paid:false,fulfilled:false,void:false,method:'',at:new Date().toISOString(),paidAt:null,fulfilledAt:null};
  state.invoices.push(invoice);safeSave();notice('Invoice '+invoice.id+' issued. Stock stays unchanged until handover.');
 }
 function fulfill(id){const i=state.invoices.find(x=>x.id===id),p=i&&getProduct(i.productId);
  if(!i||i.void||i.fulfilled||!p)return fail('Invoice cannot be handed over.');
  if(p.stock<i.qty)return fail('Not enough stock to hand over '+i.id+'. Receive stock first.');
  if(!confirm('Confirm the customer received '+i.qty+' × '+p.name+'? This will deduct stock once.'))return;
  move(p,-i.qty,'Invoice goods handed over',i.id);i.fulfilled=true;i.fulfilledAt=new Date().toISOString();safeSave();notice('Goods handed over. Inventory deducted exactly once.');
 }
 function refund(id){const s=state.sales.find(x=>x.id===id),p=s&&getProduct(s.productId);
  if(!s||s.refunded||!p)return fail('This sale cannot be refunded again.');
  if(!confirm('Record a full return/refund for '+s.id+'? The '+s.qty+' items will return to inventory and the sample payment total will decrease.'))return;
  move(p,s.qty,'Customer return / refunded sale',s.id);s.refunded=true;s.refundedAt=new Date().toISOString();safeSave();notice('Sale '+s.id+' refunded in the demo. Stock restored once; no money transferred.');
 }
 function voidInvoice(id){const i=state.invoices.find(x=>x.id===id);if(!i||i.void||i.fulfilled||i.paid)return fail('Only unpaid, unfulfilled invoices can be voided.');
  if(!confirm('Void invoice '+id+'? It has not moved stock, so no inventory correction is needed.'))return;
  i.void=true;safeSave();notice('Invoice '+id+' voided; stock unchanged.');
 }
 document.addEventListener('click',e=>{
  const button=e.target.closest('button');if(!button)return;
  if(button.dataset.open){openDialog(button.dataset.open);return}
  if(button.dataset.stock){openDialog('stock',{productId:button.dataset.stock,reason:button.dataset.reason,suggest:int(button.dataset.suggest)||1});return}
  if(button.dataset.pay){openDialog('payment',{invoiceId:button.dataset.pay});return}
  if(button.dataset.fulfill){fulfill(button.dataset.fulfill);return}
  if(button.dataset.refund){refund(button.dataset.refund);return}
  if(button.dataset.void){voidInvoice(button.dataset.void);return}
 });
 form.addEventListener('submit',e=>{e.preventDefault();handleDialog(Object.fromEntries(new FormData(form)))});
 $('ws-sale-form').addEventListener('submit',e=>{e.preventDefault();saleSubmit(e.currentTarget)});
 $('ws-invoice-form').addEventListener('submit',e=>{e.preventDefault();invoiceSubmit(e.currentTarget)});
 for(const id of ['ws-sale-product','ws-sale-qty'])$(id).addEventListener('change',checkoutSummary);
 for(const id of ['ws-invoice-product','ws-invoice-qty'])$(id).addEventListener('change',invoiceSummary);
 for(const id of ['ws-sale-qty','ws-invoice-qty'])$(id).addEventListener('input',id.startsWith('ws-sale')?checkoutSummary:invoiceSummary);
 $('ws-product-search').addEventListener('input',renderInventory);
 $('ws-stock-filter').addEventListener('change',renderInventory);
 $('ws-dialog-close').onclick=$('ws-dialog-cancel').onclick=()=>dialog.close();
 $('ws-reset').onclick=()=>{if(confirm('Reset this fictional store to its original sample records? This erases your demo changes in this browser.')){state=seed();safeSave();notice('Sample shop restored.')}};
 window.addEventListener('hashchange',route);
 window.addEventListener('storage',e=>{if(e.key===KEY){state=load();renderAll()}});
 $('ws-invoice-due').min=today;$('ws-invoice-due').value=inDays(7);
 $('ws-header-date').textContent=new Date().toLocaleDateString('en-KE',{month:'short',day:'numeric',year:'numeric',timeZone:'Africa/Nairobi'});
 // Read-only test probe for this fictional sample shop. No real user or financial data.
 window.STOCKWISE_DEMO={snapshot:()=>structuredClone(state)};
 route();renderAll();
})();