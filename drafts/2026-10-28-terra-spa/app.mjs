// TERRA Spa: fictional, browser-only appointment prototype.
// No backend, accounts, payment processing or personal-data transmission.
export const SERVICES = Object.freeze([
  { id: 'massage', name: 'Restorative massage', minutes: 60, price: 4500 },
  { id: 'facial', name: 'Signature facial', minutes: 60, price: 3800 },
  { id: 'ritual', name: 'Body ritual', minutes: 90, price: 6500 },
  { id: 'reflexology', name: 'Reflexology', minutes: 60, price: 2900 }
]);
export const SLOTS = Object.freeze(['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00']);
const KEY = 'terra-spa-demo-v1';
const WEEKDAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const money = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 });
export function toISODate(date) {
  return date.getFullYear() + '-' + String(date.getMonth()+1).padStart(2,'0') + '-' + String(date.getDate()).padStart(2,'0');
}
export function addDays(iso, count) {
  const [year,month,day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year,month-1,day+count)).toISOString().slice(0,10);
}
export function startOfWeek(iso) {
  const day = new Date(iso + 'T12:00:00Z').getUTCDay();
  return addDays(iso, -((day+6)%7));
}
export function validDate(iso) {
  if (typeof iso !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(iso) || iso.startsWith('0000-')) return false;
  const date = new Date(iso + 'T12:00:00Z');
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0,10) === iso;
}
export function minutes(time) {
  const [h,m] = time.split(':').map(Number);
  return h*60+m;
}
export function serviceById(id) { return SERVICES.find(service => service.id === id); }
export function validStoredRecord(item) {
  const service = item && serviceById(item.service);
  return Boolean(item && typeof item.id === 'string' && item.id.length > 0 &&
    typeof item.guest === 'string' && item.guest.trim().length > 0 &&
    validDate(item.date) && SLOTS.includes(item.time) && service &&
    minutes(item.time) + service.minutes <= 17*60 &&
    ['booked','completed','cancelled'].includes(item.status));
}
// Restore only a coherent schedule: individual validity alone cannot detect
// duplicate identifiers or conflicting active bookings in browser storage.
export function validStoredSchedule(records) {
  if (!Array.isArray(records) || !records.every(validStoredRecord)) return false;
  const seen = new Set();
  for (let i = 0; i < records.length; i++) {
    const item = records[i];
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    for (let j = 0; j < i; j++) {
      if (overlaps(records[j], item)) return false;
    }
  }
  return true;
}
export function overlaps(a, b) {
  if (a.date !== b.date || a.status === 'cancelled' || b.status === 'cancelled') return false;
  const aService = serviceById(a.service), bService = serviceById(b.service);
  if (!aService || !bService) return false;
  const aStart = minutes(a.time), bStart = minutes(b.time);
  return aStart < bStart+bService.minutes && bStart < aStart+aService.minutes;
}
export function canBook(records, candidate) {
  const service = serviceById(candidate.service);
  if (!service || !SLOTS.includes(candidate.time) || !validDate(candidate.date)) return false;
  if (minutes(candidate.time)+service.minutes > 17*60) return false;
  return !records.some(item => item.id !== candidate.id && overlaps(item,candidate));
}
export function statsFor(records, date) {
  const day = records.filter(item => item.date === date && item.status !== 'cancelled');
  const completed = day.filter(item => item.status === 'completed').length;
  const value = day.reduce((sum,item) => sum+(serviceById(item.service)?.price ?? 0),0);
  const available = SLOTS.filter(time => canBook(records,{ date, time, service:'massage', status:'booked' })).length;
  return { bookings:day.length, completed, value, available };
}
export function seedRecords(today) {
  return [
    {id:'demo-1',date:today,time:'09:00',guest:'Amina K.',service:'facial',status:'completed'},
    {id:'demo-2',date:today,time:'11:00',guest:'Njeri W.',service:'ritual',status:'booked'},
    {id:'demo-3',date:today,time:'14:00',guest:'Sam M.',service:'massage',status:'booked'},
    {id:'demo-4',date:addDays(today,1),time:'10:00',guest:'Leah A.',service:'reflexology',status:'booked'},
    {id:'demo-5',date:addDays(today,2),time:'13:00',guest:'Maya O.',service:'facial',status:'booked'}
  ];
}
function safeLoad(today) {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY));
    if (parsed?.day === today && validStoredSchedule(parsed.records)) return parsed.records;
  } catch { /* private browsing or corrupt demo state: use sample records */ }
  return seedRecords(today);
}
function boot() {
  const $ = id => document.getElementById(id);
  const today = toISODate(new Date());
  let selectedDay = today;
  let week = startOfWeek(today);
  let records = safeLoad(today);
  let selectedBooking = null;
  let lastFocus = null;
  const bookingDialog = $('booking-dialog'), detailDialog = $('detail-dialog');
  const dayFormatter = new Intl.DateTimeFormat('en-KE',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
  const weekFormatter = new Intl.DateTimeFormat('en-KE',{day:'numeric',month:'short',timeZone:'UTC'});
  const dateObject = iso => new Date(iso+'T12:00:00Z');
  const dateLabel = iso => dayFormatter.format(dateObject(iso));
  function persist() {
    try { localStorage.setItem(KEY,JSON.stringify({day:today,records})); } catch { /* demo remains functional without storage */ }
  }
  function el(tag,className,text) {
    const node=document.createElement(tag);
    if(className) node.className=className;
    if(text!==undefined) node.textContent=text;
    return node;
  }
  function setText(id,value) { $(id).textContent=String(value); }
  function renderWeek() {
    const last = addDays(week,6);
    setText('week-label',weekFormatter.format(dateObject(week))+' – '+weekFormatter.format(dateObject(last)));
    const wrap=$('week-days');wrap.replaceChildren();
    for(let i=0;i<7;i++){
      const iso=addDays(week,i),day=el('button','day');
      day.type='button';day.setAttribute('aria-pressed',String(iso===selectedDay));
      day.setAttribute('aria-label',dateLabel(iso));
      day.append(el('span','weekday',WEEKDAYS[i]),el('span','daynum',String(Number(iso.slice(-2)))));
      day.addEventListener('click',()=>{selectedDay=iso;render();});
      wrap.append(day);
    }
  }
  function renderMetrics() {
    const stats=statsFor(records,selectedDay);
    setText('metric-bookings',stats.bookings);
    setText('metric-value',money.format(stats.value));
    setText('metric-completed',stats.completed);
    setText('metric-open',stats.available);
  }
  function renderAppointments() {
    setText('selected-date',dateLabel(selectedDay));
    const query=$('booking-search').value.trim().toLocaleLowerCase();
    const list=records.filter(item=>item.date===selectedDay && (item.guest+' '+serviceById(item.service).name).toLocaleLowerCase().includes(query)).sort((a,b)=>a.time.localeCompare(b.time));
    const wrap=$('appointments');wrap.replaceChildren();
    $('schedule-status').hidden=list.length>0;
    if(!list.length) setText('schedule-status',query?'No matching appointments for this day.':'No appointments for this day. Add a demo booking to get started.');
    for(const item of list){
      const li=el('li','appointment');
      li.append(el('span','time',item.time));
      const button=el('button');button.type='button';
      button.setAttribute('aria-label','View appointment for '+item.guest+' at '+item.time);
      button.append(el('strong','',item.guest),el('span','service',serviceById(item.service).name));
      button.addEventListener('click',()=>openDetail(item.id,button));
      li.append(button,el('span','badge '+(item.status==='completed'?'completed':item.status==='cancelled'?'cancelled':''),item.status));
      wrap.append(li);
    }
  }
  function renderMix() {
    const day=records.filter(item=>item.date===selectedDay && item.status!=='cancelled');
    const wrap=$('service-breakdown');wrap.replaceChildren();
    for(const service of SERVICES){
      const count=day.filter(item=>item.service===service.id).length;
      const row=el('div','service-row');
      row.append(el('strong','',service.name),el('small','',String(count)+' booked'));
      const track=el('div','track'),fill=el('span');
      fill.style.width=(day.length?count/day.length*100:0)+'%';
      track.append(fill);row.append(track);wrap.append(row);
    }
  }
  function render() {renderWeek();renderMetrics();renderAppointments();renderMix();}
  function close(dialog) { dialog.close(); }
  function openBooking() {
    lastFocus=document.activeElement;
    $('booking-form').reset();
    $('booking-date').value=selectedDay;
    $('booking-error').textContent='';
    bookingDialog.showModal();
    $('guest').focus();
  }
  function openDetail(id,trigger) {
    selectedBooking=id;lastFocus=trigger;
    const item=records.find(entry=>entry.id===id);
    if(!item)return;
    setText('detail-title',item.guest);
    const wrap=$('detail-content');wrap.replaceChildren();
    for(const [label,value] of [['Date',dateLabel(item.date)],['Time',item.time],['Service',serviceById(item.service).name],['Duration',serviceById(item.service).minutes+' minutes'],['Value',money.format(serviceById(item.service).price)],['Status',item.status]]){
      const line=el('div','detail-line');line.append(el('strong','',label),document.createTextNode(value));wrap.append(line);
    }
    $('mark-complete').disabled=item.status!=='booked';
    $('cancel-selected').disabled=item.status==='cancelled';
    detailDialog.showModal();
  }
  function updateBooking(status) {
    const item=records.find(entry=>entry.id===selectedBooking);
    if(!item)return;
    item.status=status;persist();lastFocus=$('selected-date');close(detailDialog);render();
  }
  for(const service of SERVICES){
    const option=el('option','',service.name+' · '+service.minutes+' min · '+money.format(service.price));
    option.value=service.id;$('booking-service').append(option);
  }
  for(const time of SLOTS){const option=el('option','',time);option.value=time;$('booking-time').append(option);}
  $('add-booking').addEventListener('click',openBooking);
  $('close-booking').addEventListener('click',()=>close(bookingDialog));
  $('cancel-booking').addEventListener('click',()=>close(bookingDialog));
  $('close-detail').addEventListener('click',()=>close(detailDialog));
  $('mark-complete').addEventListener('click',()=>updateBooking('completed'));
  $('cancel-selected').addEventListener('click',()=>updateBooking('cancelled'));
  $('booking-form').addEventListener('submit',event=>{
    event.preventDefault();
    const guest=$('guest').value.trim(),date=$('booking-date').value,time=$('booking-time').value,service=$('booking-service').value;
    if(!guest){setText('booking-error','Enter a guest name.');return;}
    const candidate={id:'local-'+Date.now()+'-'+records.length,guest,date,time,service,status:'booked'};
    if(!canBook(records,candidate)){setText('booking-error','This time overlaps an existing booking or extends beyond 17:00. Choose another time.');return;}
    records.push(candidate);persist();selectedDay=date;week=startOfWeek(date);
    $('booking-search').value='';close(bookingDialog);render();
  });
  $('booking-search').addEventListener('input',renderAppointments);
  $('prev-week').addEventListener('click',()=>{week=addDays(week,-7);selectedDay=week;render();});
  $('next-week').addEventListener('click',()=>{week=addDays(week,7);selectedDay=week;render();});
  $('today').addEventListener('click',()=>{selectedDay=today;week=startOfWeek(today);render();});
  $('reset-demo').addEventListener('click',()=>{
    records=seedRecords(today);selectedDay=today;week=startOfWeek(today);
    $('booking-search').value='';persist();render();
    $('schedule-status').hidden=false;setText('schedule-status','Demo restored to its original sample appointments.');
  });
  for(const dialog of [bookingDialog,detailDialog]){
    dialog.addEventListener('close',()=>{if(lastFocus?.isConnected)lastFocus.focus();lastFocus=null;});
  }
  render();
}
if(typeof document!=='undefined') boot();
