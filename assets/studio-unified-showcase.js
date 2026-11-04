/* Impossible Studio / Unified interactive project showcase.
   One meaningful product explorer per case study, not eight repetitive screenshots.
   Actual same-origin project interfaces run in the laptop/phone frame and expanded dialog. */
(()=>{'use strict';
 const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n};
 const isPhone=()=>window.matchMedia('(max-width: 680px)').matches;
 const specs={laptop:{width:1120,height:710},phone:{width:390,height:800}};
 function init(root){
  let data;
  try{data=JSON.parse(root.querySelector('.sd-config')?.textContent||'{}')}catch{return}
  if(!data||!Array.isArray(data.journeys)||!data.journeys.length)return;
  root.dataset.experience='unified';
  const mount=root.querySelector('.sd-mount');if(!mount)return;
  mount.replaceChildren();
  const journeys=data.journeys;
  const skin=el('section','sx-experience');
  const header=el('div','sx-header');
  const intro=el('div','sx-intro');
  intro.append(el('span','sx-eyebrow','THE LIVE PRODUCT / NOT A SCREENSHOT GALLERY'));
  const headline=el('h2','sx-title',data.title||'Explore the experience.');
  intro.append(headline,el('p','sx-lead',data.description||'Choose a journey. Switch devices. Explore the real interface and expand it for a closer look.'));
  const info=el('div','sx-explore-info');info.append(el('span','sx-live-dot'),el('span','', 'INTERACTIVE SAMPLE · TRY THE CONTROLS'));
  header.append(intro,info);skin.append(header);
  const body=el('div','sx-body'),rail=el('aside','sx-rail'),stage=el('div','sx-stage');
  rail.append(el('span','sx-overline','CHOOSE A USER JOURNEY'));
  const list=el('div','sx-journey-list');rail.append(list);
  const foot=el('p','sx-rail-note','These are different parts of the same working concept—not separate copies of the homepage.');
  rail.append(foot);
  const stageHead=el('div','sx-stage-top');
  const stageMeta=el('div','sx-stage-meta');
  stageMeta.append(el('span','sx-overline','LIVE DEVICE EXPERIENCE'),el('strong','sx-stage-name',data.project||'PROJECT'));
  const controls=el('div','sx-device-controls'),deviceButtons={};
  for(const device of ['laptop','phone']){
   const button=el('button','sx-mode-btn',device==='laptop'?'▱  Laptop':'▯  Phone');
   button.type='button';button.dataset.device=device;button.setAttribute('aria-label','Show '+device+' experience');
   controls.append(button);deviceButtons[device]=button;
  }
  stageHead.append(stageMeta,controls);
  const deviceArea=el('div','sx-device-area');
  const device=el('div','sx-device sx-laptop');
  const deviceTop=el('div','sx-device-top');
  deviceTop.append(el('span','sx-three-dots','● ● ●'),el('span','sx-device-address',data.project+' / SAMPLE EXPERIENCE'),el('span','sx-device-top-mark','↗'));
  const screen=el('div','sx-screen');
  const waiting=el('div','sx-loading','LOADING THE LIVE PRODUCT…');
  waiting.setAttribute('role','status');
  const frame=el('iframe','sx-live-frame');
  frame.title=(data.project||'Project')+' interactive demonstration';
  frame.setAttribute('allowfullscreen','');
  frame.loading='eager';
  frame.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
  screen.append(waiting,frame);
  device.append(deviceTop,screen,el('div','sx-device-foot'));
  deviceArea.append(device);
  const actionBar=el('div','sx-action-bar');
  const actionText=el('div','sx-action-copy');
  const sceneTitle=el('strong','sx-current-title'),sceneCopy=el('p','sx-current-summary');
  actionText.append(sceneTitle,sceneCopy);
  const actions=el('div','sx-actions');
  const expand=el('button','sx-expand','⤢  EXPAND & EXPLORE');
  expand.type='button';expand.setAttribute('aria-label','Expand the live demonstration');
  const open=el('a','sx-open','OPEN IN NEW TAB ↗');
  open.target='_blank';open.rel='noopener noreferrer';
  actions.append(expand,open);actionBar.append(actionText,actions);
  stage.append(stageHead,deviceArea,actionBar);body.append(rail,stage);
  skin.append(body);
  const scope=el('div','sx-disclaimer');
  scope.append(el('strong','', 'PROTOTYPE, NOT A LIVE SERVICE'),el('p','',data.demoDescription||'This experience uses sample data and does not provide a live service.'));
  skin.append(scope);mount.append(skin);

  let current=0,mode=isPhone()?'phone':'laptop';
  const journeyButtons=journeys.map((item,index)=>{
   const button=el('button','sx-journey');
   button.type='button';
   button.dataset.journey=String(index);
   const number=el('span','sx-step-number',String(index+1).padStart(2,'0'));
   const copy=el('span','sx-step-copy');
   copy.append(el('strong','',item.title),el('small','',item.summary));
   const arrow=el('span','sx-step-arrow','↗');
   button.append(number,copy,arrow);
   button.addEventListener('click',()=>setJourney(index));
   list.append(button);return button;
  });
  const resolve=item=>(item.source||data.source||'')+(item.route||'');
  function scale(){
   const s=specs[mode];
   const width=screen.getBoundingClientRect().width;
   if(width<1)return;
   frame.style.width=s.width+'px';
   frame.style.height=s.height+'px';
   frame.style.transform='scale('+Math.min(1,width/s.width)+')';
  }
  let loadingVersion=0;
  function loadFrame(url){
   const version=++loadingVersion;
   device.classList.remove('sx-ready');waiting.textContent='LOADING THE LIVE PRODUCT…';
   frame.title=data.project+' — '+journeys[current].title+' ('+mode+')';
   frame.onload=()=>{if(version===loadingVersion){device.classList.add('sx-ready');waiting.textContent='READY TO EXPLORE';scale()}};
   frame.onerror=()=>{if(version===loadingVersion)waiting.textContent='Preview unavailable — try Open in new tab.'};
   frame.src=url;
  }
  function setJourney(index){
   current=index;
   journeyButtons.forEach((b,i)=>{b.setAttribute('aria-pressed',String(i===index));b.classList.toggle('is-active',i===index)});
   const item=journeys[current];
   sceneTitle.textContent=item.title;
   sceneCopy.textContent=item.description||item.summary||'Explore this working screen.';
   open.href=resolve(item);
   loadFrame(resolve(item));
  }
  function setMode(next){
   mode=next;
   device.classList.toggle('sx-phone',mode==='phone');
   device.classList.toggle('sx-laptop',mode==='laptop');
   deviceButtons.laptop.setAttribute('aria-pressed',String(mode==='laptop'));
   deviceButtons.phone.setAttribute('aria-pressed',String(mode==='phone'));
   deviceArea.setAttribute('data-device',mode);
   deviceTop.querySelector('.sx-device-address').textContent=data.project+' / '+(mode==='phone'?'PHONE':'LAPTOP');
   scale(); // Keep the iframe and its in-progress form state; only its visible viewport changes.
  }
  for(const [key,button]of Object.entries(deviceButtons))button.addEventListener('click',()=>setMode(key));
  const resizeObserver='ResizeObserver'in window?new ResizeObserver(scale):null;
  if(resizeObserver)resizeObserver.observe(screen);else window.addEventListener('resize',scale);

  // Full-size, directly interactive overlay. No duplicate gallery, no screenshots.
  const dialog=el('dialog','sx-dialog');
  dialog.setAttribute('aria-label',data.project+' expanded working demo');
  dialog.style.setProperty('--sx-accent',getComputedStyle(root).getPropertyValue('--sd-accent')?.trim()||'#ffe500');
  dialog.style.setProperty('--sx-bg',getComputedStyle(root).getPropertyValue('--sd-bg')?.trim()||'#151515');
  const modal=el('div','sx-dialog-inner');
  const modalHead=el('div','sx-dialog-head');
  const modalName=el('div','sx-dialog-name');
  modalName.append(el('span','sx-eyebrow','FULL-SIZE INTERACTIVE EXPERIENCE'),el('strong','',data.project));
  const close=el('button','sx-dialog-close','✕  CLOSE');
  close.type='button';close.setAttribute('aria-label','Close expanded demo');
  modalHead.append(modalName,close);
  const modalScreen=el('div','sx-dialog-screen');
  const modalFrame=el('iframe','sx-dialog-frame');
  modalFrame.title=data.project+' full-size interactive demo';
  modalFrame.setAttribute('allowfullscreen','');
  modalScreen.append(modalFrame);
  const modalFoot=el('div','sx-dialog-foot');
  const modalLabel=el('span','', 'REAL DEMO · SAMPLE DATA');
  const modalOpen=el('a','', 'OPEN WITHOUT FRAME ↗');
  modalOpen.target='_blank';modalOpen.rel='noopener noreferrer';
  modalFoot.append(modalLabel,modalOpen);
  modal.append(modalHead,modalScreen,modalFoot);dialog.append(modal);
  document.body.append(dialog);
  function openDialog(){
   const item=journeys[current];
   let expandedMode=mode;
   // A 1120px desktop viewport cannot be physically displayed legibly on a 360px phone.
   if(window.innerWidth<700)expandedMode='phone';
   dialog.classList.toggle('sx-dialog-phone',expandedMode==='phone');
   dialog.classList.toggle('sx-dialog-laptop',expandedMode==='laptop');
   modalFrame.title=data.project+' — '+item.title+' expanded '+expandedMode+' demo';
   modalFrame.src=resolve(item);
   modalOpen.href=resolve(item);
   close.setAttribute('aria-label','Close expanded '+data.project+' demo');
   if(typeof dialog.showModal==='function')dialog.showModal();
   else dialog.setAttribute('open','');
   document.body.classList.add('sx-modal-open');
   close.focus();
  }
  const closeDialog=()=>{if(typeof dialog.close==='function'&&dialog.open)dialog.close();else dialog.removeAttribute('open')};
  expand.addEventListener('click',openDialog);
  close.addEventListener('click',closeDialog);
  dialog.addEventListener('click',e=>{if(e.target===dialog)closeDialog()});
  dialog.addEventListener('close',()=>{document.body.classList.remove('sx-modal-open');modalFrame.removeAttribute('src');expand.focus()});
  const focusState={lastMode:mode};
  setMode(mode);
  setJourney(0);
  requestAnimationFrame(scale);
 }
 document.querySelectorAll('.sd-showcase').forEach(init);
})();