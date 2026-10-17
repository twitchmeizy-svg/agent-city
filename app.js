import * as THREE from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {EffectComposer} from './vendor/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from './vendor/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from './vendor/jsm/postprocessing/UnrealBloomPass.js';
import {OutputPass} from './vendor/jsm/postprocessing/OutputPass.js';
import {CSS2DRenderer,CSS2DObject} from './vendor/CSS2DRenderer.js';
const data=await (await fetch('data.json?'+Date.now())).json();
const SC={idle:0x4488ff,working:0x00ff88,meeting:0xffaa00};
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
function bld(a,x,z,w,h,col){const grp=new THREE.Group();grp.position.set(x,0,z);
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),new THREE.MeshStandardMaterial({color:0x221144,emissive:col,emissiveIntensity:.6,metalness:.6,roughness:.3}));m.position.y=h/2;m.userData.a=a;grp.add(m);meshes.push(m);
 const e=new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry),new THREE.LineBasicMaterial({color:col}));e.position.y=h/2;grp.add(e);
 for(let i=2;i<h;i+=3){const s=new THREE.Mesh(new THREE.BoxGeometry(w+.05,.15,w+.05),new THREE.MeshBasicMaterial({color:col}));s.position.y=i;grp.add(s);}
 const b=new THREE.Mesh(new THREE.SphereGeometry(.6),new THREE.MeshBasicMaterial({color:SC[a.status]}));b.position.y=h+.9;grp.add(b);grp.userData.beacon=b;
 const pl=new THREE.PointLight(col,8,w*4);pl.position.y=2;grp.add(pl);
 label(`<b>${a.name}</b><i>${a.role}</i>`,'lbl',h+2.6+(a.lo||0),grp);scene.add(grp);return grp;}
const groups=[];const by={};data.agents.forEach(a=>(by[a.district]??=[]).push(a));
bld(by.Center[0],-9,0,6,30,0xbffcff);
const hall=bld(by.Center[1],13,0,9,6,0xff2bd6);
const ring=new THREE.Mesh(new THREE.TorusGeometry(8,.2,8,48),new THREE.MeshBasicMaterial({color:0xff2bd6}));ring.rotation.x=Math.PI/2;ring.position.y=.3;hall.add(ring);
for(const[n,d]of Object.entries(D)){(by[n]||[]).forEach((a,i)=>{const cols=3,x=d.c[0]-18+(i%cols)*18,z=d.c[1]-10+Math.floor(i/cols)*20;a.lo=(i%2)*3;groups.push(bld(a,x,z,4,8+((i*7)%5)*3,d.col));});}
// UI
document.getElementById('top').innerHTML='<b style="color:#f0f;margin-right:6px">AGENT CITY</b><span class="pill" style="color:#f44;border-color:#f44">EXAMPLE DATA</span>'+data.agents.map(a=>`<span class="pill ${a.status}" data-id="${a.id}">${a.name}: ${a.status}</span>`).join('');
const P=data.portfolio,ch=P.value-P.start;
const pf=document.getElementById('pf');pf.innerHTML=`<div class="hd" style="color:#f44;font-size:10px">EXAMPLE DATA · ${P.name} <span class=x>▾</span></div><div class="v">$${P.value.toLocaleString(undefined,{minimumFractionDigits:2})}</div><div style="color:${ch>=0?'#0f8':'#f44'}">${ch>=0?'+':''}$${ch.toFixed(2)} total · ${P.dayChange}% today</div><div class=bd><hr>`+P.positions.map(p=>`<div>${p.sym}<span style="float:right">$${p.value.toLocaleString()}</span></div>`).join('')+'</div>';pf.querySelector('.hd').onclick=()=>pf.classList.toggle('col');if(innerWidth<700)pf.classList.add('col');
const card=document.getElementById('card');
const show=a=>{card.style.display='block';card.innerHTML=`<span class=x onclick="this.parentElement.style.display='none'">✕</span><div style="color:#f44;font-size:10px">EXAMPLE DATA</div><b style="font-size:15px;color:#fff">${a.name}</b><div style="color:#f6f">${a.role} · ${a.district}</div><div>Status: <span class="pill ${a.status}">${a.status}</span></div><div>Task: ${a.task}</div>`;};
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
window.ready=true;
