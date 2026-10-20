import * as T from './assets/vendor/three.module.js';
import {createRenderControl} from './render-control.js';
const canvas=document.querySelector('#product-canvas'),story=document.querySelector('.story'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=v=>Math.min(1,Math.max(0,v)),ease=v=>{v=clamp(v);return v*v*(3-2*v);},mix=(a,b,t)=>a+(b-a)*t;
const colours={calm:'#bc8872',dew:'#819d82',restore:'#8b718d'};
let renderer,scene,camera,bottle,pump,pearls,ribbon,body,print,control,progress=0,variant='calm',px=0,py=0;
export function setProductVariant(value){variant=value;control?.invalidate();}
const poses=[{x:1.65,y:0,s:1.35,ry:-.38,rz:-.2},{x:-1.55,y:-.12,s:1.22,ry:.28,rz:.12},{x:2.1,y:-.25,s:2.05,ry:-.46,rz:-.18},{x:-1.6,y:-.02,s:1.33,ry:.08,rz:0}];
function environment(){const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d');x.fillStyle='#8e7865';x.fillRect(0,0,512,256);x.fillStyle='#fff2df';x.fillRect(35,15,45,200);x.fillRect(310,0,90,90);x.fillStyle='#382b26';x.fillRect(180,0,70,256);x.fillStyle='#e9c6a8';x.fillRect(450,80,15,140);const map=new T.CanvasTexture(c);map.mapping=T.EquirectangularReflectionMapping;map.colorSpace=T.SRGBColorSpace;const pm=new T.PMREMGenerator(renderer),target=pm.fromEquirectangular(map);pm.dispose();map.dispose();return target.texture;}
function label(){const c=document.createElement('canvas');c.width=512;c.height=768;const x=c.getContext('2d');x.fillStyle='#e9dcc7';x.fillRect(0,0,512,768);x.fillStyle='#352820';x.textAlign='center';x.font='142px Instrument';x.fillText('VEIL',256,250);x.font='17px DM';x.fillText('THE DAILY VEIL',256,321);x.font='italic 26px Instrument';x.fillText('skin, in its own time.',256,377);x.strokeStyle='#9d8774';x.beginPath();x.moveTo(150,450);x.lineTo(362,450);x.stroke();x.font='13px DM';x.fillText('A QUIETER KIND OF SKINCARE',256,505);x.font='18px DM';x.fillText('50 ml / 1.7 fl oz',256,650);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;return tex;}
function vessel(profile,material){return new T.Mesh(new T.LatheGeometry(profile.map(a=>new T.Vector2(...a)),64),material);}
function cylinder(r,h,y,material,parent=bottle){const m=new T.Mesh(new T.CylinderGeometry(r,r,h,40),material);m.position.y=y;parent.add(m);return m;}
function build(){
  renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});renderer.setClearColor(0,0);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
  scene=new T.Scene();scene.environment=environment();camera=new T.PerspectiveCamera(34,1,.1,30);camera.position.set(0,.1,10);
  scene.add(new T.HemisphereLight(0xfff9ef,0x423127,1.1));const key=new T.DirectionalLight(0xffedda,2.1);key.position.set(-4,6,5);scene.add(key);const rim=new T.DirectionalLight(0xffe7c8,1.5);rim.position.set(5,2,-3);scene.add(rim);
  bottle=new T.Group();scene.add(bottle);
  // Opaque coated resin gives a readable silhouette with zero transmission passes.
  body=new T.MeshPhysicalMaterial({color:colours.calm,roughness:.23,metalness:.11,clearcoat:.85,clearcoatRoughness:.2,envMapIntensity:1.2});
  const bodyMesh=vessel([[0,-1.26],[.38,-1.26],[.49,-1.23],[.55,-1.11],[.56,-.9],[.56,.64],[.55,.85],[.48,1.01],[.24,1.11],[.21,1.22],[0,1.22]],body);bottle.add(bodyMesh);
  // Fine vertical ribs catch the large studio reflection. Geometry, not a blurry photograph.
  const edgeMat=new T.MeshStandardMaterial({color:0xa27860,metalness:.28,roughness:.4});
  for(let i=0;i<22;i++){const angle=i/22*Math.PI*2;if(Math.cos(angle)>.5)continue;const rib=new T.Mesh(new T.CylinderGeometry(.007,.007,1.7,5),edgeMat);rib.position.set(Math.sin(angle)*.56,-.13,Math.cos(angle)*.56);bottle.add(rib);}
  const metal=new T.MeshStandardMaterial({color:0xbaa277,metalness:.8,roughness:.27});cylinder(.22,.21,1.21,metal);cylinder(.235,.036,1.1,metal);cylinder(.225,.025,1.32,metal);
  pump=new T.Group();pump.position.y=1.43;bottle.add(pump);const ceramic=new T.MeshStandardMaterial({color:0xddd4c3,metalness:.05,roughness:.29});cylinder(.24,.19,0,ceramic,pump);
  const shape=new T.Shape();shape.moveTo(-.22,-.07);shape.lineTo(.49,-.07);shape.quadraticCurveTo(.56,-.07,.56,.02);shape.lineTo(.56,.11);shape.quadraticCurveTo(.56,.18,.46,.18);shape.lineTo(-.17,.18);shape.quadraticCurveTo(-.26,.18,-.26,.07);shape.quadraticCurveTo(-.26,-.07,-.22,-.07);
  const head=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.3,bevelEnabled:true,bevelSize:.04,bevelThickness:.04,bevelSegments:3,steps:1}),ceramic);head.position.set(0,.1,-.15);pump.add(head);
  const nozzle=new T.Mesh(new T.CylinderGeometry(.034,.034,.04,14),new T.MeshBasicMaterial({color:0x38271f}));nozzle.rotation.z=Math.PI/2;nozzle.position.set(.57,.11,.02);pump.add(nozzle);
  print=new T.Mesh(new T.CylinderGeometry(.568,.568,1.31,40,1,true,-.64,1.28),new T.MeshBasicMaterial({map:label(),toneMapped:false}));print.position.y=-.04;bottle.add(print);
  const base=new T.Mesh(new T.TorusGeometry(.48,.025,8,64),metal);base.rotation.x=Math.PI/2;base.position.y=-1.23;bottle.add(base);
  pearls=new T.InstancedMesh(new T.SphereGeometry(.095,16,12),new T.MeshStandardMaterial({color:0xe4cbae,metalness:.65,roughness:.15,envMapIntensity:1.7}),30);scene.add(pearls);
  const curve=new T.CatmullRomCurve3(Array.from({length:90},(_,i)=>{const a=i/89*Math.PI*3;return new T.Vector3(Math.cos(a)*.82,(i/89-.5)*2.4,Math.sin(a)*.82);}));ribbon=new T.Mesh(new T.TubeGeometry(curve,100,.014,5,false),metal);bottle.add(ribbon);
  document.body.classList.add('webgl');
  control=createRenderControl({renderer,canvas,story,onResize(w,h){camera.aspect=w/h;camera.updateProjectionMatrix();},paint});
}
const temp=new T.Object3D();
function paint(){
  const mobile=innerWidth<701,i=Math.min(2,Math.floor(progress)),f=ease(progress-i),a=poses[i],b=poses[i+1];const spread=Math.sin(clamp(progress/2)*Math.PI);
  bottle.position.set(mix(a.x,b.x,f),mix(a.y,b.y,f),0);bottle.scale.setScalar(mix(a.s,b.s,f));bottle.rotation.set(.06,mix(a.ry,b.ry,f)+(reduced.matches?0:px*.07),mix(a.rz,b.rz,f));
  if(mobile){bottle.position.set(.32,-1.35,0);bottle.scale.setScalar(.8);bottle.rotation.set(.02,-.24,-.08);}if(reduced.matches){bottle.rotation.set(0,-.16,0);if(!mobile){bottle.position.set(1.65,0,0);bottle.scale.setScalar(1.3);}}
  body.color.set(colours[variant]||colours.calm);pump.position.y=1.43+(reduced.matches?0:spread*.62);ribbon.visible=!reduced.matches&&spread>.01;ribbon.rotation.y=progress*.8;ribbon.scale.setScalar(.7+spread*.55);
  for(let n=0;n<30;n++){const ang=n*.59+progress*1.2,r=.55+spread*(.65+(n%3)*.14);temp.position.set(bottle.position.x+Math.sin(ang)*r*(mobile?.7:1),bottle.position.y+(n/29-.5)*2.8,bottle.position.z+Math.cos(ang)*r);temp.scale.setScalar(reduced.matches?0:spread*(mobile?.55:1));temp.updateMatrix();pearls.setMatrixAt(n,temp.matrix);}pearls.instanceMatrix.needsUpdate=true;
  camera.position.set(reduced.matches?0:px*.04,.1,10);camera.lookAt(0,0,0);renderer.render(scene,camera);
}
function scroll(){progress=clamp(-story.getBoundingClientRect().top/(story.offsetHeight-innerHeight))*3;document.querySelector('#story-progress').style.width=`${progress/3*100}%`;document.querySelector('#chapter-count').textContent=`0${Math.min(4,Math.floor(progress)+1)} / 04`;document.querySelector('.scene').style.setProperty('--reveal',String(Math.sin(progress/3*Math.PI)*.13));control?.invalidate();}
addEventListener('scroll',scroll,{passive:true});addEventListener('pointermove',e=>{if(reduced.matches)return;px=e.clientX/innerWidth-.5;py=e.clientY/innerHeight-.5;control?.invalidate();},{passive:true});reduced.addEventListener('change',()=>control?.invalidate());canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();control?.dispose();canvas.hidden=true;document.body.classList.remove('webgl');});
Promise.all([document.fonts.load('100px Instrument'),document.fonts.load('30px DM')]).catch(()=>{}).then(()=>{try{build();scroll();}catch(e){canvas.hidden=true;document.body.classList.remove('webgl');document.documentElement.dataset.renderMode='fallback';console.warn('Using the static product illustration.',e.message);}});
