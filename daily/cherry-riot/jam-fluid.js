/* CHERRY RIOT: original photo-textured, scroll-scrubbed viscous reveal. */
(() => {
  const section=document.querySelector('.jam-prelude'),canvas=document.querySelector('#jam-fluid');
  if(!section||!canvas)return;
  const ctx=canvas.getContext('2d',{alpha:true});
  if(!ctx)return;
  const texture=new Image(); texture.src='./jam-texture.webp';
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
  const smooth=n=>{n=clamp(n);return n*n*(3-2*n)};
  const specs=[
    [.075,.038,.30,.3],[.202,.027,.51,1.8],[.334,.042,.22,2.8],
    [.486,.029,.57,3.9],[.616,.037,.36,4.5],[.758,.026,.48,5.5],
    [.901,.040,.28,6.6]
  ];
  let w=1,h=1,dpr=1,top=0,range=1,target=0,current=0,last=0,raf=0;
  function resize(){
    const box=canvas.getBoundingClientRect();
    w=Math.max(1,box.width);h=Math.max(1,box.height);
    dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    top=section.getBoundingClientRect().top+scrollY;
    range=Math.max(1,section.offsetHeight-innerHeight);measure();
  }
  function measure(){
    const progress=clamp((scrollY-top)/range);
    target=smooth(clamp((progress-.025)/.77));
    if(reduced.matches){current=target;render();}else if(!raf)raf=requestAnimationFrame(frame);
  }
  function frame(t){
    raf=0;const dt=last?Math.min((t-last)/1000,.065):.016;last=t;
    current+=(target-current)*Math.min(1,dt*13);
    if(Math.abs(current-target)<.0003)current=target;
    render();
    if(Math.abs(current-target)>.0001)raf=requestAnimationFrame(frame);
  }
  function render(){
    ctx.clearRect(0,0,w,h);
    const p=current,base=h*(1.14-1.72*p),swell=Math.sin(Math.PI*p);
    const surface=x=>base+swell*h*.007*Math.sin(x/w*19+p*4.6)+swell*h*.005*Math.sin(x/w*39-p*3.2);
    const drops=specs.map(([rx,rr,ll,seed])=>{
      const x=rx*w,r=Math.max(10,rr*w),growth=Math.sin(Math.PI*smooth((p-.065)/.94));
      return {x,r,length:Math.max(0,ll*h*growth*(.84+.16*Math.sin(seed*2.4+p*9))),y:surface(x),seed};
    }).sort((a,b)=>b.x-a.x);
    const liquid=new Path2D(),edge=new Path2D();
    liquid.moveTo(0,-h);liquid.lineTo(w,-h);liquid.lineTo(w,surface(w));
    edge.moveTo(w,surface(w));let prev=w;
    for(const d of drops){
      const {x,r,length,y,seed}=d,left=x-r,right=x+r;
      if(right>prev)continue;
      let mid=(prev+right)/2;
      liquid.quadraticCurveTo(mid,surface(mid),right,y);
      edge.quadraticCurveTo(mid,surface(mid),right,y);
      if(length<8){
        liquid.quadraticCurveTo(x,y+r*.11,left,y);
        edge.quadraticCurveTo(x,y+r*.11,left,y);
      }else{
        const neck=Math.max(r*.20,7),bulb=Math.max(neck+2,r*.57);
        const bend=Math.sin(seed*3+p*7)*Math.min(length*.045,12);
        const stalk=y+Math.max(10,length*.56),tip=y+length;
        const endX=x+bend,midX=x+bend*.55;
        const add=path=>{
          path.bezierCurveTo(x+r*.24,y+r*.25,midX+neck,stalk*.78+y*.22,midX+neck,stalk);
          path.bezierCurveTo(midX+neck*.76,stalk+length*.10,endX+bulb,tip-length*.16,endX+bulb*.88,tip-length*.075);
          path.bezierCurveTo(endX+bulb*.74,tip+bulb*.42,endX-bulb*.74,tip+bulb*.42,endX-bulb*.88,tip-length*.075);
          path.bezierCurveTo(endX-bulb,tip-length*.16,midX-neck*.76,stalk+length*.10,midX-neck,stalk);
          path.bezierCurveTo(midX-neck,stalk*.78+y*.22,x-r*.24,y+r*.25,left,y);
        };
        add(liquid);add(edge);
      }
      prev=left;
    }
    liquid.quadraticCurveTo(prev*.5,surface(prev*.5),0,surface(0));liquid.closePath();
    edge.quadraticCurveTo(prev*.5,surface(prev*.5),0,surface(0));
    ctx.save();ctx.clip(liquid);
    if(texture.complete&&texture.naturalWidth){
      const aspect=texture.naturalWidth/texture.naturalHeight;
      const iw=Math.max(w,h*aspect)*1.08,ih=iw/aspect;
      ctx.drawImage(texture,(w-iw)/2-p*w*.03,(h-ih)/2,iw,ih);
    }else{
      const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,'#480018');g.addColorStop(.6,'#b00634');g.addColorStop(1,'#560015');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
    }
    const shade=ctx.createLinearGradient(0,0,w,h);
    shade.addColorStop(0,'#29000c59');shade.addColorStop(.47,'#65001d08');shade.addColorStop(1,'#2400065c');
    ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
    ctx.restore();
    ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
    ctx.shadowColor='#1600078d';ctx.shadowBlur=16;ctx.shadowOffsetY=8;
    ctx.lineWidth=4;ctx.strokeStyle='#39000c6e';ctx.stroke(edge);ctx.restore();
    ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
    ctx.lineWidth=1.5;ctx.strokeStyle='#ffcbcb68';ctx.stroke(edge);ctx.restore();
    if(p>.38&&p<.81){
      [drops[1],drops[3],drops[5]].forEach((d,i)=>{
        const falling=smooth((p-.38-i*.042)/.33);
        if(!falling||falling>=1)return;
        const radius=Math.max(4,Math.min(10,d.r*.20));
        const x=d.x+Math.sin(i*5+p*11)*8,y=d.y+d.length+12+falling*h*.26;
        ctx.save();ctx.translate(x,y);ctx.scale(.78,1.24);
        const shine=ctx.createRadialGradient(-radius*.3,-radius*.46,1,0,0,radius);
        shine.addColorStop(0,'#ffc0bf');shine.addColorStop(.23,'#e42e4b');
        shine.addColorStop(.7,'#85001d');shine.addColorStop(1,'#35000f');
        ctx.fillStyle=shine;ctx.shadowColor='#22000d88';ctx.shadowBlur=8;
        ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.fill();ctx.restore();
      });
    }
    const caption=document.querySelector('.jam-curtain-text');
    if(caption){const alpha=1-smooth((p-.025)/.27);caption.style.opacity=alpha.toFixed(3);caption.style.visibility=alpha>.01?'visible':'hidden'}
  }
  texture.onload=()=>render();texture.onerror=()=>render();
  window.addEventListener('scroll',measure,{passive:true});window.addEventListener('resize',resize);
  if(reduced.addEventListener)reduced.addEventListener('change',measure);
  resize();
})();