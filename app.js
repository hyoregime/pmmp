const defaults = [
  {src:"assets/sample-1.jpg", title:"클로드 모네", desc:"빛과 색채의 변화, 물 위에 비치는 풍경"},
  {src:"assets/sample-2.jpg", title:"도스토옙스키", desc:"고뇌와 인간 내면을 파고드는 문학"},
  {src:"assets/sample-3.jpg", title:"알베르 카뮈", desc:"부조리와 삶의 태도에 관한 사유"},
  {src:"assets/sample-4.jpg", title:"밤의 풍경", desc:"조용한 하늘 아래에서 바라본 순간"}
];

const grid=document.querySelector("#grid");
const tpl=document.querySelector("#cardTemplate");
const board=document.querySelector("#artboard");
const state=defaults.map(x=>({...x, x:0, y:0, zoom:1}));

function makeCard(item,i){
  const el=tpl.content.cloneNode(true);
  const card=el.querySelector(".card");
  const photo=el.querySelector(".photo");
  const img=el.querySelector("img");
  const file=el.querySelector(".file");
  const title=el.querySelector(".card-title");
  const desc=el.querySelector(".card-desc");

  img.src=item.src; title.textContent=item.title; desc.textContent=item.desc;

  photo.addEventListener("click",e=>{
    if(e.target===photo) file.click();
  });
  photo.addEventListener("dblclick",()=>file.click());
  file.addEventListener("change",()=>{
    if(!file.files[0]) return;
    const reader=new FileReader();
    reader.onload=()=>{state[i].src=reader.result;img.src=reader.result;};
    reader.readAsDataURL(file.files[0]);
  });

  let dragging=false,startX=0,startY=0,baseX=0,baseY=0;
  photo.addEventListener("pointerdown",e=>{
    if(e.target!==photo) return;
    dragging=true; photo.classList.add("dragging"); photo.setPointerCapture(e.pointerId);
    startX=e.clientX;startY=e.clientY;baseX=state[i].x;baseY=state[i].y;
  });
  photo.addEventListener("pointermove",e=>{
    if(!dragging)return;
    state[i].x=baseX+(e.clientX-startX);
    state[i].y=baseY+(e.clientY-startY);
    apply(i,img);
  });
  photo.addEventListener("pointerup",()=>{dragging=false;photo.classList.remove("dragging")});
  photo.addEventListener("pointercancel",()=>{dragging=false;photo.classList.remove("dragging")});

  photo.addEventListener("wheel",e=>{
    e.preventDefault();
    state[i].zoom=Math.min(3,Math.max(.6,state[i].zoom*(e.deltaY<0?1.06:.94)));
    apply(i,img);
  },{passive:false});

  title.addEventListener("input",()=>state[i].title=title.innerText);
  desc.addEventListener("input",()=>state[i].desc=desc.innerText);
  grid.appendChild(el);
  apply(i,img);
}

function apply(i,img){
  img.style.transform=`translate(${state[i].x}px,${state[i].y}px) scale(${state[i].zoom})`;
}

function reset(){
  state.splice(0,state.length,...defaults.map(x=>({...x,x:0,y:0,zoom:1})));
  grid.innerHTML="";
  state.forEach(makeCard);
  document.querySelector(".overall-title").textContent="주제";
}

function cleanText(s){return s.replace(/\u00a0/g," ").trim()}

async function getImage(src){
  return new Promise(resolve=>{
    const im=new Image();
    im.onload=()=>resolve(im); im.onerror=()=>resolve(null); im.src=src;
  });
}

function drawCover(ctx,im,x,y,w,h,s){
  const scale=Math.max(w/im.width,h/im.height)*s.zoom;
  const dw=im.width*scale,dh=im.height*scale;
  const dx=x+(w-dw)/2+s.x,dy=y+(h-dh)/2+s.y;
  ctx.save();ctx.beginPath();roundRect(ctx,x,y,w,h,18);ctx.clip();
  ctx.drawImage(im,dx,dy,dw,dh);ctx.restore();
}
function roundRect(ctx,x,y,w,h,r){
  ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();
}
function wrap(ctx,text,x,y,max,line){
  const words=[...text];let cur="";
  for(const c of words){
    const t=cur+c;
    if(ctx.measureText(t).width>max&&cur){ctx.fillText(cur,x,y);y+=line;cur=c}else cur=t
  }
  if(cur)ctx.fillText(cur,x,y);
  return y;
}

async function exportImage(type){
  const rect=board.getBoundingClientRect();
  const scale=2, W=Math.round(rect.width*scale), H=Math.round(rect.height*scale);
  const c=document.createElement("canvas");c.width=W;c.height=H;
  const ctx=c.getContext("2d");ctx.fillStyle="#fff";ctx.fillRect(0,0,W,H);
  const br=board.getBoundingClientRect();
  const titleEl=document.querySelector(".overall-title");
  ctx.textAlign="center";ctx.fillStyle="#111";ctx.font=`800 ${28*scale}px sans-serif`;
  ctx.fillText(cleanText(titleEl.innerText),W/2,52*scale);

  const cards=[...document.querySelectorAll(".card")];
  for(let i=0;i<4;i++){
    const cr=cards[i].getBoundingClientRect();
    const x=(cr.left-br.left)*scale,y=(cr.top-br.top)*scale;
    const pw=cr.querySelector(".photo").getBoundingClientRect().width*scale;
    const ph=pw;
    const im=await getImage(state[i].src);
    if(im) drawCover(ctx,im,x,y,pw,ph,{x:state[i].x*scale,y:state[i].y*scale,zoom:state[i].zoom});
    const title=cleanText(cr.querySelector(".card-title").innerText);
    const desc=cleanText(cr.querySelector(".card-desc").innerText);
    ctx.textAlign="left";ctx.fillStyle="#111";ctx.font=`800 ${17*scale}px sans-serif`;
    ctx.fillText(title,x,y+ph+27*scale);
    ctx.fillStyle="#4c4c4c";ctx.font=`${13*scale}px sans-serif`;
    wrap(ctx,desc,x,y+ph+48*scale,pw,20*scale);
  }
  const blob=await new Promise(r=>c.toBlob(r,type==="jpg"?"image/jpeg":"image/png",.94));
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);
  a.download=`4-grid.${type}`;a.click();URL.revokeObjectURL(a.href);
}

document.querySelector("#downloadPng").onclick=()=>exportImage("png");
document.querySelector("#downloadJpg").onclick=()=>exportImage("jpg");
document.querySelector("#resetBtn").onclick=reset;
reset();
