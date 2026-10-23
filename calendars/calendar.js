
const months=["January","February","March","April","May","June","July","August","September","October","November","December"];
const editions={
"roots-2027":{title:"ROOTS",subtitle:"Africa / 2027",edition:"People · Place · Living culture",lead:"A powerful visual journey through twelve countries, pairing cinematic image-making with stories of craft, landscape and living cultural practice.",colors:"#b18a5c",countries:["Kenya","Morocco","Ghana","Ethiopia","Nigeria","South Africa","Tanzania","Rwanda","Senegal","Namibia","Uganda","Egypt"],traditions:["Maasai beadwork","Zellij tilework","Drum traditions","Coffee ceremony","Gele headwrap","Fynbos and land","Swahili coastal sailing","Basket weaving","Painted pirogues","Desert landscapes","Crowned crane","Ancient stone carving"]},
"atlas-africa-2027":{title:"ATLAS OF AFRICA",subtitle:"Traditions / 2027",edition:"Traditions · Materials · Memory",lead:"A contemporary exploration of materials, meaningful making and artistic traditions across twelve distinct African places.",colors:"#a87b50",countries:["Kenya","Morocco","Ethiopia","Ghana","Senegal","Tanzania","Egypt","Namibia","Nigeria","Rwanda","South Africa","Zimbabwe"],traditions:["Adornment and identity","Architecture and craft","Coffee and community","Kente and heritage","Rhythm and movement","Landscapes and life","Stone and memory","People and landscape","Benin bronze art","Basket artistry","Table Mountain and craft","Great Zimbabwe"]},
"heritage-africa-2027":{title:"ATLAS OF AFRICA",subtitle:"The editorial edition / 2027",edition:"Twelve places · Twelve stories",lead:"An immersive editorial celebration of image, place and living heritage, composed like a collectible art magazine that happens to be a calendar.",colors:"#b57a55",countries:["Kenya","Morocco","Ethiopia","Ghana","Senegal","Namibia","Tanzania","Nigeria","Egypt","South Africa","Uganda","Rwanda"],traditions:["Beadwork and identity","Architecture and ornament","Coffee culture","Kente weaving","Music and rhythm","Desert and living heritage","Mountain and community","Edo court arts","The Nile and the felucca","Protea and botanical heritage","Barkcloth making","Architecture and material"]}
};
const el=(id)=>document.getElementById(id);
const edition=document.body.dataset.edition;
if(edition&&editions[edition]){
const config=editions[edition],base="../media/"+edition+"/";
document.title=config.title+" · "+config.subtitle+" | The Impossible Studio";
el("category").textContent=config.edition;
el("name").textContent=config.title;
el("subtitle").textContent=config.subtitle;
el("lead").textContent=config.lead;
el("presentation").src=base+"presentation.webp";
el("full-sheet").src=base+"all-12-months.jpg";
el("presentation").alt=config.title+" complete 2027 calendar presentation";
el("full-sheet").alt="All twelve 2027 monthly pages for "+config.title+" on one sheet";
const sprite=new Image();sprite.src=base+"month-sprite.webp";let current=0;
function crop(ctx,i,w,h){if(!sprite.complete||!sprite.naturalWidth)return;const cw=sprite.naturalWidth/3,ch=sprite.naturalHeight/4;ctx.drawImage(sprite,(i%3)*cw,Math.floor(i/3)*ch,cw,ch,0,0,w,h)}
function show(i){if(i<0||i>11)return;current=i;el("month-title").textContent=months[i]+" 2027";el("month-country").textContent=config.countries[i];el("month-tradition").textContent=config.traditions[i];const canvas=el("month-canvas");canvas.width=760;canvas.height=1075;crop(canvas.getContext("2d"),i,760,1075);el("page-num").textContent=String(i+1).padStart(2,"0")+" / 12";el("prev").disabled=i===0;el("next").disabled=i===11;document.querySelectorAll(".mini").forEach((b,n)=>{b.classList.toggle("active",n===i);b.setAttribute("aria-pressed",n===i?"true":"false")})}
sprite.onload=()=>{let t=el("month-thumbs");for(let i=0;i<12;i++){const b=document.createElement("button");b.className="mini";b.type="button";b.title=months[i]+" · "+config.countries[i];b.setAttribute("aria-label","Show "+months[i]+" 2027, "+config.countries[i]);let c=document.createElement("canvas");c.width=112;c.height=159;crop(c.getContext("2d"),i,112,159);b.appendChild(c);b.onclick=()=>show(i);t.appendChild(b)}show(0)};
sprite.onerror=()=>{el("month-tradition").textContent="The monthly artwork could not be loaded. Please refresh."};
el("prev").onclick=()=>show(current-1);el("next").onclick=()=>show(current+1);
document.addEventListener("keydown",e=>{if(!e.target.closest("input,textarea")){if(e.key==="ArrowLeft")show(current-1);if(e.key==="ArrowRight")show(current+1)}});
el("save-page").onclick=()=>{if(!sprite.complete||!sprite.naturalWidth)return;const a=document.createElement("a");a.href=el("month-canvas").toDataURL("image/png");a.download=edition+"-"+String(current+1).padStart(2,"0")+"-"+months[current].toLowerCase()+"-2027.png";a.click()};
const other=Object.keys(editions).filter(s=>s!==edition);el("other").innerHTML=other.map(s=>'<a href="../'+s+'/"><img src="../media/'+s+'/presentation.webp" alt="'+editions[s].title+' presentation"><span><b>'+editions[s].title+'</b><small>'+editions[s].subtitle+' ↗</small></span></a>').join("");
}
