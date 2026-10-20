import * as THREE from './assets/vendor/three.module.js';

const story = document.querySelector('.story');
const mediaMotion = matchMedia('(prefers-reduced-motion: reduce)');
const variants = {
  calm: {name:'Calm', color:'#d9ad96', liquid:'#e1baa4', description:'Calm / a comforting daily moisturiser.'},
  dew: {name:'Dew', color:'#b4c4af', liquid:'#ced9b4', description:'Dew / a light gel cream for an easy, fresh finish.'},
  restore: {name:'Restore', color:'#aa96ad', liquid:'#d1bdd0', description:'Restore / a richer cream for the end of your day.'}
};
let selectedVariant = 'calm';
const variantButtons = [...document.querySelectorAll('.variant')];
function selectVariant(value, syncForm = true) {
  if (!variants[value]) return;
  selectedVariant = value;
  document.body.dataset.variant = value;
  variantButtons.forEach(button => {const active = button.dataset.variant === value; button.classList.toggle('active',active); button.setAttribute('aria-pressed',String(active));});
  document.querySelector('#variant-description').textContent = variants[value].description;
  document.querySelector('#specimen-name').textContent = `0${Object.keys(variants).indexOf(value)+1} / ${variants[value].name.toLowerCase()}`;
  if(syncForm) {document.querySelector(`input[name="product"][value="${variants[value].name}"]`).checked = true; updateRoutine();}
}
variantButtons.forEach(button => button.addEventListener('click',() => selectVariant(button.dataset.variant)));

const form = document.querySelector('#ritual-form');
let currentRoutine;
function updateRoutine() {
  const data = new FormData(form);
  const moment = data.get('moment');
  const feel = data.get('feel');
  const product = data.get('product');
  const steps = moment === 'Morning' ? ['Gentle cleanse',`${product} moisturiser`,'Broad-spectrum SPF'] : ['Gentle cleanse',`${product} moisturiser`,'A moment to unwind'];
  const note = feel === 'Dry' ? 'Apply your cream while skin is still slightly damp.' : feel === 'Oily' ? 'Start with a small amount. Add a little more if your skin wants it.' : 'Keep it consistent. Your routine can stay beautifully simple.';
  document.querySelector('#routine-label').textContent = `YOUR ${moment.toUpperCase()} RITUAL`;
  document.querySelector('#routine-steps').replaceChildren(...steps.map((step,index) => {const li=document.createElement('li');const number=document.createElement('span');number.textContent=`0${index+1}`;li.append(number,step);return li;}));
  document.querySelector('#routine-note').textContent=note;
  currentRoutine={moment,feel,product,steps,note};
  document.querySelector('#save-status').textContent='Saves a simple text note to your device. No sign-up.';
}
form.addEventListener('change',event => {if(event.target.name==='product') selectVariant(event.target.value.toLowerCase(),false);updateRoutine();});
document.querySelector('#save-ritual').addEventListener('click',() => {
  const r=currentRoutine;
  const text=`VEIL / YOUR DAILY RITUAL\n\n${r.moment}. Skin feels ${r.feel.toLowerCase()}.\n\n${r.steps.map((step,i)=>`${i+1}. ${step}`).join('\n')}\n\n${r.note}\n\nIndependent skincare concept by Polina Koljanikova.\nThis is an illustrative routine, not personalised medical advice.\n`;
  const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download=`veil-${r.moment.toLowerCase()}-ritual.txt`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  document.querySelector('#save-status').textContent='Your ritual note is ready. Keep a little room for yourself.';
});
updateRoutine();

const canvas=document.querySelector('#product-canvas');
let renderer,scene,camera,bottle,cap,inner,bodyMaterial,liquidMaterial,labelMaterial,ingredientGroup,labelTexture,shadow;
let progress=0,visible=true,raf=0,previousTime=0,ready=false;
const motion={pointerX:0,pointerY:0};
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
const mix=(a,b,t)=>a+(b-a)*t;
const poses=[
  {x:1.65,y:-.08,z:0,rx:.07,ry:-.35,rz:-.19,scale:1.32,open:0,spread:0},
  {x:-1.6,y:-.27,z:0,rx:.08,ry:.28,rz:.12,scale:1.16,open:1,spread:1},
  {x:1.68,y:-.13,z:.1,rx:-.04,ry:-.28,rz:-.12,scale:1.4,open:.2,spread:.55},
  {x:-1.7,y:-.10,z:0,rx:0,ry:.1,rz:.02,scale:1.26,open:0,spread:0}
];

function roundedRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
function makeLabel(){
  const c=document.createElement('canvas');c.width=768;c.height=1024;const ctx=c.getContext('2d');
  ctx.clearRect(0,0,c.width,c.height);ctx.fillStyle='#f4e9d5';roundedRect(ctx,18,20,732,984,16);ctx.fillStyle='#4e443b';ctx.textAlign='center';ctx.font='190px Instrument,Georgia';ctx.fillText('VEIL',384,335);ctx.font='25px DM,sans-serif';ctx.letterSpacing='4px';ctx.fillText('THE DAILY VEIL',384,438);ctx.font='italic 34px Instrument,Georgia';ctx.letterSpacing='0px';ctx.fillText('skin, in its own time.',384,505);ctx.strokeStyle='#b4a28d';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(230,600);ctx.lineTo(538,600);ctx.stroke();ctx.font='20px DM,sans-serif';ctx.fillText('A QUIETER KIND OF SKINCARE',384,663);ctx.font='28px DM,sans-serif';ctx.fillText('50 ml / 1.7 fl oz',384,853);
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;return texture;
}
function studioEnvironment(){
  const c=document.createElement('canvas');c.width=1024;c.height=512;const ctx=c.getContext('2d');
  const bg=ctx.createLinearGradient(0,0,0,512);bg.addColorStop(0,'#fff9ee');bg.addColorStop(.5,'#d4baa3');bg.addColorStop(1,'#6d4d39');ctx.fillStyle=bg;ctx.fillRect(0,0,1024,512);
  [[80,55,100,390],[360,0,38,300],[670,80,210,200],[950,20,35,430]].forEach(([x,y,w,h])=>{const g=ctx.createLinearGradient(x,0,x+w,0);g.addColorStop(0,'#ffffff00');g.addColorStop(.2,'#ffffff');g.addColorStop(.7,'#ffffff');g.addColorStop(1,'#ffffff00');ctx.fillStyle=g;ctx.fillRect(x,y,w,h);});
  const tex=new THREE.CanvasTexture(c);tex.mapping=THREE.EquirectangularReflectionMapping;tex.colorSpace=THREE.SRGBColorSpace;const pmrem=new THREE.PMREMGenerator(renderer);const result=pmrem.fromEquirectangular(tex).texture;tex.dispose();pmrem.dispose();return result;
}
function lathe(points,material){const geometry=new THREE.LatheGeometry(points.map(p=>new THREE.Vector2(...p)),96);const mesh=new THREE.Mesh(geometry,material);return mesh;}
function cylinder(radius,height,material,y,parent=bottle){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,64),material);mesh.position.y=y;parent.add(mesh);return mesh;}
function buildScene(){
  renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setClearColor(0x000000,0);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(34,1,.1,50);camera.position.set(0,.2,10);
  scene.environment=studioEnvironment();scene.environmentIntensity=1.1;
  scene.add(new THREE.HemisphereLight(0xffffff,0x9a6c45,2));
  const key=new THREE.DirectionalLight(0xfff7e9,4.5);key.position.set(-4,6,6);scene.add(key);
  const edge=new THREE.DirectionalLight(0xffd3bd,3);edge.position.set(5,3,-3);scene.add(edge);
  bottle=new THREE.Group();scene.add(bottle);
  bodyMaterial=new THREE.MeshPhysicalMaterial({color:0xf4d4bd,metalness:.02,roughness:.16,transmission:.47,thickness:.5,ior:1.45,clearcoat:1,clearcoatRoughness:.13,envMapIntensity:1.35});
  const profile=[[0,-1.25],[.33,-1.25],[.46,-1.23],[.52,-1.15],[.535,-.93],[.535,.72],[.52,.93],[.46,1.04],[.23,1.1],[.2,1.2],[0,1.2]];
  const body=lathe(profile,bodyMaterial);bottle.add(body);
  liquidMaterial=new THREE.MeshPhysicalMaterial({color:0xdbaf98,roughness:.25,metalness:.02,clearcoat:.75,transmission:.04});
  inner=lathe([[0,-1.13],[.4,-1.13],[.455,-1.05],[.46,.72],[.42,.89],[0,.92]],liquidMaterial);bottle.add(inner);
  const neckMaterial=new THREE.MeshStandardMaterial({color:0xc6aa7d,metalness:.75,roughness:.28});
  cylinder(.21,.22,neckMaterial,1.2);cylinder(.221,.035,neckMaterial,1.1);cylinder(.22,.035,neckMaterial,1.3);
  cap=new THREE.Group();cap.position.y=1.41;bottle.add(cap);
  const ceramic=new THREE.MeshPhysicalMaterial({color:0xf1e9dd,roughness:.27,clearcoat:.65,metalness:.04});
  cylinder(.235,.2,ceramic,0,cap);cylinder(.24,.05,ceramic,.1,cap);
  const shape=new THREE.Shape();shape.moveTo(-.2,-.1);shape.lineTo(.45,-.1);shape.quadraticCurveTo(.54,-.1,.54,0);shape.lineTo(.54,.08);shape.quadraticCurveTo(.54,.16,.44,.16);shape.lineTo(-.17,.16);shape.quadraticCurveTo(-.25,.16,-.25,.08);shape.lineTo(-.25,-.02);shape.quadraticCurveTo(-.25,-.1,-.2,-.1);
  const pump=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.29,bevelEnabled:true,bevelSegments:4,steps:1,bevelSize:.045,bevelThickness:.045}),ceramic);pump.position.set(0,.1,-.145);cap.add(pump);
  const nozzle=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.08,24),new THREE.MeshStandardMaterial({color:0x5a493b,roughness:.4}));nozzle.rotation.z=Math.PI/2;nozzle.position.set(.55,.1,.02);cap.add(nozzle);
  const straw=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,2.2,16),new THREE.MeshPhysicalMaterial({color:0xf4e9d6,transparent:true,opacity:.3,roughness:.4}));straw.position.y=.12;bottle.add(straw);
  labelTexture=makeLabel();labelMaterial=new THREE.MeshStandardMaterial({map:labelTexture,roughness:.8,metalness:0});
  const label=new THREE.Mesh(new THREE.CylinderGeometry(.543,.543,1.26,48,1,true,-.67,1.34),labelMaterial);label.position.y=-.07;bottle.add(label);
  const baseRing=new THREE.Mesh(new THREE.TorusGeometry(.455,.025,12,64),new THREE.MeshPhysicalMaterial({color:0xf1d4bc,roughness:.1,transmission:.6,thickness:.1}));baseRing.rotation.x=Math.PI/2;baseRing.position.y=-1.2;bottle.add(baseRing);
  ingredientGroup=new THREE.Group();bottle.add(ingredientGroup);
  const drops=[[-.9,.5,.0,.27],[.8,.38,.18,.24],[-.84,-.6,.22,.19],[.7,-.8,-.05,.32],[-.35,1.05,-.3,.16],[.95,.94,-.3,.12]];
  drops.forEach((d,i)=>{const material=new THREE.MeshPhysicalMaterial({color:i%2?0xf2d5ba:0xe8be9d,roughness:.075,metalness:.03,transmission:.82,thickness:.4,ior:1.38,clearcoat:1});const drop=new THREE.Mesh(new THREE.SphereGeometry(d[3],36,28),material);drop.userData={position:new THREE.Vector3(d[0],d[1],d[2]),phase:i*.9};drop.scale.set(.9,1.18,1);ingredientGroup.add(drop);});
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=256;shadowCanvas.height=256;const sc=shadowCanvas.getContext('2d');const gradient=sc.createRadialGradient(128,128,0,128,128,128);gradient.addColorStop(0,'rgba(72,43,24,.26)');gradient.addColorStop(1,'rgba(72,43,24,0)');sc.fillStyle=gradient;sc.fillRect(0,0,256,256);shadow=new THREE.Mesh(new THREE.PlaneGeometry(3.1,1.1),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));shadow.position.set(1.65,-2,0);scene.add(shadow);
  document.body.classList.add('webgl');ready=true;resize();
}
function resize(){if(!ready)return;const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
function updateProgress(){const rect=story.getBoundingClientRect();progress=clamp(-rect.top/(story.offsetHeight-innerHeight))*3;document.querySelector('#story-progress').style.width=`${progress/3*100}%`;document.querySelector('#chapter-count').textContent=`0${Math.min(4,Math.floor(progress)+1)} / 04`;}
function render(time){
  raf=requestAnimationFrame(render);if(!ready||!visible||document.hidden)return;
  const mobile=innerWidth<=700;const idle=mediaMotion.matches?0:time*.0004;
  const index=Math.min(2,Math.floor(progress));const t=smooth(progress-index);const a=poses[index],b=poses[index+1];
  const x=mix(a.x,b.x,t),y=mix(a.y,b.y,t),scale=mix(a.scale,b.scale,t);
  renderer.toneMappingExposure=mobile?.86:1.2;
  if(mobile){bottle.position.set(mix(.42,.25,smooth(progress)),mix(-1.26,-1.4,smooth(progress)),0);bottle.scale.setScalar(.79);bottle.rotation.set(.035,-.25,-.12+Math.sin(idle)*.018);}else{bottle.position.set(x,y,0);bottle.scale.setScalar(scale);bottle.rotation.set(mix(a.rx,b.rx,t)+motion.pointerY*.025,mix(a.ry,b.ry,t)+motion.pointerX*.065,mix(a.rz,b.rz,t)+Math.sin(idle)*.012);}
  if(mediaMotion.matches){bottle.rotation.set(0,-.12,0);if(!mobile){bottle.position.set(1.65,-.15,0);bottle.scale.setScalar(1.25);}}
  const open=mediaMotion.matches?0:mix(a.open,b.open,t);cap.position.y=1.41+open*.7;
  const spread=mediaMotion.matches?0:mix(a.spread,b.spread,t);
  ingredientGroup.children.forEach((drop,i)=>{const p=drop.userData.position;drop.position.copy(p).multiplyScalar(.35+spread*.9);drop.scale.setScalar(Math.max(.02,spread));drop.scale.y*=1.18;drop.position.y+=Math.sin(idle+drop.userData.phase)*.025*spread;});
  const targetColor=new THREE.Color(variants[selectedVariant].color);bodyMaterial.color.lerp(targetColor,mediaMotion.matches?1:.06);liquidMaterial.color.lerp(new THREE.Color(variants[selectedVariant].liquid),mediaMotion.matches?1:.06);
  bodyMaterial.transmission=.45+Math.sin(progress*Math.PI/3)*.22;
  shadow.position.x=bottle.position.x;shadow.position.y=mobile?-2.65:-1.98;shadow.scale.setScalar(mobile?.65:1);shadow.material.opacity=1-open*.5;
  camera.position.x=mediaMotion.matches?0:motion.pointerX*.08;camera.position.y=.2+(mediaMotion.matches?0:motion.pointerY*.04);camera.lookAt(0,0,0);renderer.render(scene,camera);previousTime=time;
}
addEventListener('scroll',updateProgress,{passive:true});addEventListener('resize',()=>{updateProgress();resize();},{passive:true});
addEventListener('pointermove',event=>{if(mediaMotion.matches)return;motion.pointerX=(event.clientX/innerWidth-.5)*2;motion.pointerY=(event.clientY/innerHeight-.5)*2;},{passive:true});
canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();ready=false;document.body.classList.remove('webgl');cancelAnimationFrame(raf);});
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;},{rootMargin:'100px'}).observe(story);
updateProgress();
Promise.all([document.fonts.load('100px Instrument'),document.fonts.load('100px DM')]).catch(()=>{}).then(()=>{
  try{buildScene();raf=requestAnimationFrame(render);}catch(error){document.body.classList.remove('webgl');canvas.hidden=true;console.warn('The product illustration is using its static fallback.',error.message);}
});
