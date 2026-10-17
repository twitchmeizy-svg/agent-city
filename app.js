import * as THREE from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {EffectComposer} from './vendor/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from './vendor/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from './vendor/jsm/postprocessing/UnrealBloomPass.js';
import {OutputPass} from './vendor/jsm/postprocessing/OutputPass.js';
import {CSS2DRenderer,CSS2DObject} from './vendor/CSS2DRenderer.js';
const data=await (await fetch('data.json?'+Date.now())).json();
const MB=data.agents.find(a=>a.id=='memebot');const MBEX=JSON.parse(JSON.stringify(MB||{}));
const LS={running:['working','RUNNING'],halted_daily_limit:['idle','HALTED (DAILY LIMIT)'],killed:['error','KILLED'],complete:['idle','COMPLETE'],stopped:['idle','STOPPED'],error:['error','ERROR']};
function applyLive(live){if(!MB||!live||typeof live!=='object')return;for(const k of Object.keys(MB))delete MB[k];Object.assign(MB,JSON.parse(JSON.stringify(MBEX)));for(const k of ['openTrades','recentTrades','cash','paperValue','task'])delete MB[k];Object.assign(MB,live);MB.botStatus=live.status;MB.openTrades=live.openTrades||[];MB.recentTrades=live.recentTrades||[];MB.live=true;MB.task=null;}
function liveState(a){if(!a.live)return null;const age=(Date.now()-new Date(a.updatedAt).getTime())/1000;const off=!(age<=420);const m=LS[a.botStatus]||['error',String(a.botStatus||'unknown').toUpperCase()];return {age,off,cls:off?'offline':m[0],txt:off?'OFFLINE':m[1]};}
const ago=s=>!isFinite(s)?'unknown':s<60?Math.round(s)+'s ago':s<3600?Math.round(s/60)+'m ago':Math.round(s/3600)+'h ago';
async function loadLive(){try{const r=await fetch('live/meme-bot.json?t='+Date.now(),{cache:'no-store'});if(r.ok){applyLive(await r.json());return true;}}catch(e){}return false;}
await loadLive();
for(const a of data.agents){const ls=liveState(a);if(ls)a.status=ls.cls;}
const SC={idle:0x4488ff,working:0x00ff88,meeting:0xffaa00,error:0xff3355,offline:0x777788};
const scene=new THREE.Scene();scene.background=new THREE.Color(0x05010d);scene.fog=new THREE.FogExp2(0x05010d,.0015);
const cam=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.1,1000);const mob=innerWidth<700;cam.position.set(0,mob?260:150,mob?170:95);
const r=new THREE.WebGLRenderer({antialias:true});r.setSize(innerWidth,innerHeight);r.setPixelRatio(devicePixelRatio);document.body.appendChild(r.domElement);
const lr=new CSS2DRenderer();lr.setSize(innerWidth,innerHeight);Object.assign(lr.domElement.style,{position:'absolute',top:0,pointerEvents:'none'});document.body.appendChild(lr.domElement);
const ctl=new OrbitControls(cam,r.domElement);ctl.target.set(0,0,0);ctl.enableDamping=true;ctl.maxPolarAngle=1.45;
scene.add(new THREE.AmbientLight(0xaa77ff,1.1));const dl=new THREE.DirectionalLight(0xffffff,1.2);dl.position.set(20,50,10);scene.add(dl);
const g=new THREE.GridHelper(300,60,0xff2bd6,0x00f0ff);g.material.opacity=.12;g.material.transparent=true;scene.add(g);
const gr=new THREE.Mesh(new THREE.PlaneGeometry(300,300),new THREE.MeshStandardMaterial({color:0x0a0018}));gr.rotation.x=-Math.PI/2;gr.position.y=-.05;scene.add(gr);
const D={'Ideas':{c:[-50,-45],col:0xff2bd6},'Money & Trading':{c:[50,-45],col:0x00f0ff},'Career':{c:[-50,45],col:0x9d4dff},'Business':{c:[50,45],col:0xff5fa2}};
const LBL=[];const label=(h,cls,y,parent)=>{const d=document.createElement('div');d.className=cls;d.innerHTML=h;const o=new CSS2DObject(d);if(cls=="lbl"||cls=="dl")LBL.push(d);o.position.y=y;parent.add(o);};
for(const[n,d]of Object.entries(D)){const p=new THREE.Mesh(new THREE.PlaneGeometry(56,44),new THREE.MeshBasicMaterial({color:d.col,transparent:true,opacity:.07}));p.rotation.x=-Math.PI/2;p.position.set(d.c[0],.02,d.c[1]);scene.add(p);
 const e=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(56,.1,44)),new THREE.LineBasicMaterial({color:d.col}));e.position.copy(p.position);scene.add(e);label(n.toUpperCase(),'dl',0,e);}
const meshes=[];
const lblHtml=a=>{const ls=liveState(a);return `<b>${a.name}</b>${a.alwaysOn?(ls?`<span class="on ${ls.cls}">${ls.txt}</span>`:'<span class=on>ON 24/7</span>'):''}<i>${a.tradesMax?`Trades ${a.tradesUsed} / ${a.tradesMax}`:a.role}</i>`;};
function bld(a,x,z,w,h,col){const grp=new THREE.Group();grp.position.set(x,0,z);
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),new THREE.MeshStandardMaterial({color:0x221144,emissive:col,emissiveIntensity:.6,metalness:.6,roughness:.3}));m.position.y=h/2;m.userData.a=a;grp.add(m);meshes.push(m);
 const e=new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry),new THREE.LineBasicMaterial({color:col}));e.position.y=h/2;grp.add(e);
 for(let i=2;i<h;i+=3){const s=new THREE.Mesh(new THREE.BoxGeometry(w+.05,.15,w+.05),new THREE.MeshBasicMaterial({color:col}));s.position.y=i;grp.add(s);}
 const b=new THREE.Mesh(new THREE.SphereGeometry(.6),new THREE.MeshBasicMaterial({color:SC[a.status]}));b.position.y=h+.9;grp.add(b);grp.userData.beacon=b;
 const pl=new THREE.PointLight(col,8,w*4);pl.position.y=2;grp.add(pl);
 label(lblHtml(a),'lbl',h+2.6+(a.lo||0),grp);a._lbl=LBL[LBL.length-1];a._grp=grp;scene.add(grp);return grp;}
const n0=a=>a.district;const groups=[];const by={};data.agents.forEach(a=>(by[a.district]??=[]).push(a));
bld(by.Center[0],-9,0,6,30,0xbffcff);
const hall=bld(by.Center[1],13,0,9,6,0xff2bd6);
const ring=new THREE.Mesh(new THREE.TorusGeometry(8,.2,8,48),new THREE.MeshBasicMaterial({color:0xff2bd6}));ring.rotation.x=Math.PI/2;ring.position.y=.3;hall.add(ring);
for(const[n,d]of Object.entries(D)){(by[n]||[]).forEach((a,i)=>{const cnt=by[n0(a)].length,cols=cnt>6?4:3,sx=cols==4?13:18,x=d.c[0]-sx*(cols-1)/2+(i%cols)*sx,z=d.c[1]-10+Math.floor(i/cols)*20;a.lo=((i%2)+(Math.floor(i/3)%2))%2*3+(by[n0(a)].length>6?(i%4)*1.2:0);groups.push(bld(a,x,z,4,8+((i*7)%5)*3,d.col));});}
// UI
const pillTxt=a=>{const ls=liveState(a);return ls?`${a.name}: ${ls.txt.toLowerCase()} · LIVE`:`${a.name}: ${a.status}`;};
document.getElementById('top').innerHTML='<b style="color:#f0f;margin-right:6px">AGENT CITY</b><span class="pill" style="color:#f44;border-color:#f44">EXAMPLE DATA</span>'+data.agents.map(a=>`<span class="pill ${a.status}" data-id="${a.id}">${pillTxt(a)}</span>`).join('');
const P=data.portfolio,ch=P.value-P.start;
const pf=document.getElementById('pf');pf.innerHTML=`<div class="hd" style="color:#f44;font-size:10px">EXAMPLE DATA · ${P.name} <span class=x>▾</span></div><div class="v">$${P.value.toLocaleString(undefined,{minimumFractionDigits:2})}</div><div style="color:${ch>=0?'#0f8':'#f44'}">${ch>=0?'+':''}$${ch.toFixed(2)} total · ${P.dayChange}% today</div><div class=bd><hr>`+P.positions.map(p=>`<div>${p.sym}<span style="float:right">$${p.value.toLocaleString()}</span></div>`).join('')+'</div>';pf.querySelector('.hd').onclick=()=>pf.classList.toggle('col');if(innerWidth<700)pf.classList.add('col');
const card=document.getElementById('card');
const f$=v=>v==null||v===''||isNaN(v)?'—':(Number(v)<0?'-':'')+'$'+Math.abs(Number(v)).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
const fp=v=>{if(v==null||isNaN(v))return '—';v=Number(v);return v<0.01?v.toPrecision(3):v.toFixed(4)};
const pc=v=>v==null?'<span>':`<span style="color:${v>=0?'#0f8':'#f55'}">${v>=0?'+':''}`;
const tm=t=>!t?'—':new Date(t).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',timeZone:'America/Detroit'});
const trades=a=>`<div class=bal>${f$(a.paperValue)} of ${f$(a.startValue)} paper ${a.cash!=null?'· cash '+f$(a.cash):''} <span class=tag style="color:${a.live?'#0f8':'#f44'}">${a.live?'LIVE PAPER':'EXAMPLE DATA'}</span></div>${a.live?(()=>{const ls=liveState(a);return `<div class=upd>Bot: <span class="pill ${ls.cls}">${ls.txt}</span> · updated ${ago(ls.age)}${ls.off?' <b style="color:#f55">(feed stale &gt;7 min)</b>':''}</div>`})():''}
<div class=tw><div class=th>Open trades (${a.openTrades.length})</div><table><tr><th>Sym</th><th>Side</th><th>Entry</th><th>Now</th><th>Size</th><th>P/L</th><th>Opened</th></tr>${a.openTrades.map(t=>`<tr><td>${t.symbol}</td><td>${t.side}</td><td>${fp(t.entryPrice)}</td><td>${fp(t.currentPrice)}</td><td>${f$(t.sizeUsd)}</td><td>${pc(t.pnlUsd)}${f$(t.pnlUsd)} ${t.pnlPct!=null?`(${t.pnlPct}%)`:''}</span></td><td>${tm(t.openedAt)}</td></tr>`).join('')}</table>
${a.lastTrade?`<div class=th>Last trade</div><div>${a.lastTrade.action||a.lastTrade.side||''} ${a.lastTrade.symbol} @ ${fp(a.lastTrade.price)} · ${f$(a.lastTrade.sizeUsd)} · ${tm(a.lastTrade.time)}</div>`:''}${a.openPositions!=null&&a.openPositions!=a.openTrades.length?`<div>Open positions reported: ${a.openPositions}</div>`:''}<div class=th>Recent closed</div>${(a.recentTrades||[]).length?'':'<div style="opacity:.6">No closed trades yet</div>'}<table><tr><th>Sym</th><th>Side</th><th>Entry</th><th>Exit</th><th>P/L</th><th>Closed</th></tr>${(a.recentTrades||[]).map(t=>`<tr><td>${t.symbol}</td><td>${t.side||''}</td><td>${fp(t.entryPrice)}</td><td>${fp(t.exitPrice)}</td><td>${pc(t.pnlUsd)}${f$(t.pnlUsd)}</span></td><td>${tm(t.closedAt)}</td></tr>`).join('')}</table></div>`;
let cur=null;const show=a=>{cur=a;card.style.display='block';card.classList.toggle('wide',!!a.openTrades);const st=card.querySelector('.tw')?.scrollTop||0;card.innerHTML=`<span class=x onclick="this.parentElement.style.display='none'">✕</span><div style="color:${a.live?'#0f8':'#f44'};font-size:10px">${a.live?'LIVE PAPER':'EXAMPLE DATA'}</div><b style="font-size:15px;color:#fff">${a.name}</b><div style="color:#f6f">${a.role} · ${a.district}</div><div>Status: <span class="pill ${a.status}">${liveState(a)?.txt||a.status}</span></div>${a.task?`<div>Task: ${a.task}</div>`:''}${a.tradesMax?`<div style="color:#0ff">Trades ${a.tradesUsed} / ${a.tradesMax}</div>`:''}${a.alwaysOn?'<span class=on>ON 24/7</span>':''}${a.openTrades?trades(a):''}`;const tw=card.querySelector('.tw');if(tw)tw.scrollTop=st;};
document.querySelectorAll('#top .pill[data-id]').forEach(el=>el.onclick=()=>show(data.agents.find(a=>a.id==el.dataset.id)));
const rc=new THREE.Raycaster(),mp=new THREE.Vector2();let hov=null,pinned=null;
const pick=e=>{mp.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);rc.setFromCamera(mp,cam);return rc.intersectObjects(meshes)[0]?.object;};
r.domElement.addEventListener('pointermove',e=>{const o=pick(e);if(hov&&hov!==o)hov.material.emissiveIntensity=.6;hov=o;if(o){o.material.emissiveIntensity=1.2;show(o.userData.a);document.body.style.cursor='pointer';}else{document.body.style.cursor='';if(pinned)show(pinned);else card.style.display='none';}});
r.domElement.addEventListener('click',e=>{const o=pick(e);pinned=o?o.userData.a:null;if(pinned)show(pinned);});
const comp=new EffectComposer(r);comp.addPass(new RenderPass(scene,cam));const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.55,0.4,0.55);comp.addPass(bloom);comp.addPass(new OutputPass());
const UI=['top','pf','card','ex'].map(i=>document.getElementById(i));
function declutter(){const pr=UI.filter(e=>e.offsetParent!==null||getComputedStyle(e).position=='fixed').map(e=>e.getBoundingClientRect()).filter(b=>b.width);const placed=[];
 const items=LBL.map(d=>({d,b:d.getBoundingClientRect(),z:+(d.parentElement?.style.zIndex||0)})).sort((a,b)=>b.z-a.z);
 for(const it of items){const b=it.b,hit=r=>!(b.right<r.left||b.left>r.right||b.bottom<r.top||b.top>r.bottom);const vis=b.width>0&&!pr.some(hit)&&!placed.some(hit);it.d.style.visibility=vis?'visible':'hidden';if(vis)placed.push({left:b.left-2,right:b.right+2,top:b.top-1,bottom:b.bottom+1});}}
addEventListener('resize',()=>{comp.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();r.setSize(innerWidth,innerHeight);lr.setSize(innerWidth,innerHeight);});
window.clickAt=(x,y)=>{const e={clientX:x,clientY:y};const o=pick(e);pinned=o?o.userData.a:null;if(pinned){show(pinned);o.material.emissiveIntensity=1.2;}return pinned?.name;};
window.setView=(p,t)=>{cam.position.set(...p);ctl.target.set(...t);ctl.update();};
const clk=new THREE.Clock();(function loop(){const t=clk.getElapsedTime();scene.traverse(o=>{if(o.userData.beacon)o.userData.beacon.scale.setScalar(1+.3*Math.sin(t*4));});ring.scale.setScalar(1+.05*Math.sin(t*2));ctl.update();comp.render();lr.render(scene,cam);declutter();requestAnimationFrame(loop);})();
function refreshMB(){if(!MB||!MB._grp)return;const ls=liveState(MB);if(ls)MB.status=ls.cls;MB._grp.userData.beacon.material.color.setHex(SC[MB.status]||SC.idle);MB._lbl.innerHTML=lblHtml(MB).replace(/^<div[^>]*>|<\/div>$/g,'');const p=document.querySelector('#top .pill[data-id=memebot]');if(p){p.className='pill '+MB.status;p.textContent=pillTxt(MB);}if(cur===MB&&card.style.display!=='none')show(MB);}
refreshMB();setInterval(async()=>{await loadLive();refreshMB();},60000);setInterval(refreshMB,10000);
window.reloadLive=async()=>{const ok=await loadLive();refreshMB();return ok;};
window.ready=true;
