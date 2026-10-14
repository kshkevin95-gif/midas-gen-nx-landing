import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {logo,strokes} from './logo-data.js';
export const DURATION=8;
const clamp=THREE.MathUtils.clamp;
const smooth=(a,b,t)=>{const x=clamp((t-a)/(b-a),0,1);return x*x*(3-2*x);};
const mix=THREE.MathUtils.lerp;
const themes={
 red:{line:0xef6671,edge:0xffacaa,solid:0x94212f,light:0xffbcb2,fill:0x631922,bg:'#080507',glow:'rgba(119,22,36,.45)',floor:0x17090f},
 blue:{line:0x519fc3,edge:0xaadfff,solid:0x23658c,light:0xb1e6ff,fill:0x12394e,bg:'#03070d',glow:'rgba(17,61,91,.48)',floor:0x071322}
};
export function createTeaser(canvas,{theme='red',width=1920,height=1080}={}){
 const p=themes[theme],blue=theme==='blue';
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(1);renderer.setSize(width,height,false);renderer.setClearColor(0x000000,0);
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 const scene=new THREE.Scene();
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();
 const environment=pmrem.fromScene(room,.06);scene.environment=environment.texture;scene.environmentIntensity=.55;room.dispose();pmrem.dispose();
 const camera=new THREE.PerspectiveCamera(35,width/height,.1,100);
 scene.add(new THREE.AmbientLight(0xc3cddd,1.25));
 const key=new THREE.DirectionalLight(p.light,4.3);key.position.set(-4,6,7);scene.add(key);
 const rim=new THREE.DirectionalLight(blue?0x1672bb:0x9e122c,3.4);rim.position.set(6,2,-4);scene.add(rim);
 const white=new THREE.DirectionalLight(0xffffff,1.7);white.position.set(-3,-2,5);scene.add(white);
 const drawing=new THREE.Group(),structure=new THREE.Group(),assembly=new THREE.Group(),finished=new THREE.Group();
 scene.add(drawing,structure,assembly,finished);
 const flatY=-2.55;
 const lineMaterials=[];
 function lines(points,{color=p.line,opacity=.4,dashed=false,group=drawing}={}){
  const mat=dashed?new THREE.LineDashedMaterial({color,transparent:true,opacity,dashSize:.13,gapSize:.10}):new THREE.LineBasicMaterial({color,transparent:true,opacity});
  mat.userData.base=opacity;
  const geo=new THREE.BufferGeometry().setFromPoints(points.map(v=>new THREE.Vector3(...v)));
  const obj=new THREE.Line(geo,mat);if(dashed)obj.computeLineDistances();group.add(obj);
  if(group===drawing)lineMaterials.push(mat);return obj;
 }
 const ground=(x,z)=>[x,flatY,z];
 // Actual architectural plan: orthogonal axes, column footprints, paired beams,
 // a stair core, dimension chains, centerlines and structural bay labels.
 for(let x=-6;x<=6;x++)lines([ground(x,-4.4),ground(x,4.4)],{opacity:x%2===0?.19:.075,dashed:x%2===0});
 for(let z=-4;z<=4;z++)lines([ground(-6.5,z),ground(6.5,z)],{opacity:z%2===0?.19:.075,dashed:z%2===0});
 const xs=[-4.2,-2.1,0,2.1,4.2],zs=[-2.4,0,2.4];
 for(const x of xs)for(const z of zs){
  lines([ground(x-.15,z-.15),ground(x+.15,z-.15),ground(x+.15,z+.15),ground(x-.15,z+.15),ground(x-.15,z-.15)],{opacity:.82});
  lines([ground(x-.24,z),ground(x+.24,z)],{opacity:.4});lines([ground(x,z-.24),ground(x,z+.24)],{opacity:.4});
 }
 for(const x of xs)for(const d of [-.065,.065])lines([ground(x+d,-2.4),ground(x+d,2.4)],{opacity:.43});
 for(const z of zs)for(const d of [-.065,.065])lines([ground(-4.2,z+d),ground(4.2,z+d)],{opacity:.43});
 for(let i=0;i<10;i++)lines([ground(-1.8,.25+i*.18),ground(-.35,.25+i*.18)],{opacity:.36});
 lines([ground(-1.8,.25),ground(-1.8,1.87),ground(-.35,1.87),ground(-.35,.25)],{opacity:.58});
 const labels=[];
 function label(text,x,z,size=.20){
  const c=document.createElement('canvas');c.width=256;c.height=64;
  const ctx=c.getContext('2d');ctx.font='24px monospace';ctx.fillStyle=blue?'#8ec5de':'#cd8790';ctx.textAlign='center';ctx.fillText(text,128,41);
  const tx=new THREE.CanvasTexture(c),m=new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false,side:THREE.DoubleSide});m.userData.base=.7;
  const o=new THREE.Mesh(new THREE.PlaneGeometry(size*4,size),m);o.rotation.x=-Math.PI/2;o.position.set(x,flatY+.01,z);drawing.add(o);lineMaterials.push(m);labels.push(o);
 }
 for(let i=0;i<xs.length;i++){
  const x=xs[i];lines([ground(x,-2.7),ground(x,-3.5)],{opacity:.3});
  label(String.fromCharCode(65+i),x,3.05,.22);
  if(i<xs.length-1){lines([ground(x,-3.2),ground(xs[i+1],-3.2)],{opacity:.50});label('6000',x+1.05,-3.5,.30);}
  lines([ground(x-.10,-3.10),ground(x+.10,-3.30)],{opacity:.6});
 }
 lines([ground(-4.65,-2.4),ground(-4.65,2.4)],{opacity:.5});
 for(let i=0;i<zs.length;i++){lines([ground(-4.8,zs[i]-.12),ground(-4.5,zs[i]+.12)],{opacity:.55});label(`0${i+1}`,-5.1,zs[i],.19);}
 label('24000',0,-4.08,.32);
 lines([ground(-4.2,-3.9),ground(4.2,-3.9)],{opacity:.25});
 const scan=lines([ground(-5,-3),ground(-5,3)],{opacity:.8,color:p.edge});
 // Structural members are actual 3D solids with visible edge geometry.
 const bodyMat=new THREE.MeshStandardMaterial({color:p.solid,metalness:blue?.60:.78,roughness:blue?.27:.29,transparent:true,opacity:0});
 const memberObjects=[];
 function member(a,b,w,d,index){
  const delta=new THREE.Vector3(...b).sub(new THREE.Vector3(...a)),length=delta.length();
  const g=new THREE.BoxGeometry(w,length,d),m=bodyMat.clone();
  const mesh=new THREE.Mesh(g,m);const edges=new THREE.LineSegments(new THREE.EdgesGeometry(g),new THREE.LineBasicMaterial({color:p.line,transparent:true,opacity:0}));mesh.add(edges);
  mesh.position.copy(new THREE.Vector3(...a).add(new THREE.Vector3(...b)).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());structure.add(mesh);
  memberObjects.push({mesh,edges,index,a:new THREE.Vector3(...a),b:new THREE.Vector3(...b),q:mesh.quaternion.clone()});
 }
 let ix=0;
 for(const x of xs)for(const z of zs)member([x,flatY,z],[x,1.05,z],.105,.105,ix++);
 for(const y of [-.78,1.05]){
  for(const z of zs)for(let i=0;i<4;i++)member([xs[i],y,z],[xs[i+1],y,z],.10,.09,ix++);
  for(const x of xs)for(let i=0;i<2;i++)member([x,y,zs[i]],[x,y,zs[i+1]],.10,.09,ix++);
 }
 // Each logo stroke inherits a position in the structural frame and travels to
 // the final glyph contour. The finished surfaces merge after assembly.
 const traveling=[];
 strokes.forEach((s,i)=>{
  const dx=s.b[0]-s.a[0],dy=s.b[1]-s.a[1],len=Math.hypot(dx,dy);
  const geo=new THREE.BoxGeometry(s.width,len,logo.depth);
  const mat=bodyMat.clone(),mesh=new THREE.Mesh(geo,mat);
  const edges=new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:p.edge,transparent:true,opacity:0}));mesh.add(edges);assembly.add(mesh);
  const source=memberObjects[i%memberObjects.length];
  traveling.push({mesh,edges,from:source.mesh.position.clone(),fromQ:source.q.clone(),to:new THREE.Vector3((s.a[0]+s.b[0])/2,(s.a[1]+s.b[1])/2+.40,0),toQ:new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),-Math.atan2(dx,dy)),index:i});
 });
 function shape(points){const s=new THREE.Shape();points.forEach((pt,i)=>i?s.lineTo(...pt):s.moveTo(...pt));s.closePath();return s;}
 const finalMaterials=[],finalEdges=[];
 function solid(s,depth,opacity=1){
  const g=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.014,bevelThickness:.014,curveSegments:32});g.translate(0,.40,-depth/2);
  const mat=new THREE.MeshPhysicalMaterial({color:p.solid,metalness:blue?.52:.77,roughness:.25,clearcoat:1,clearcoatRoughness:.2,transparent:true,opacity:0,side:THREE.DoubleSide});mat.userData.max=opacity;
  const mesh=new THREE.Mesh(g,mat);finished.add(mesh);finalMaterials.push(mat);
  const edge=new THREE.LineSegments(new THREE.EdgesGeometry(g,25),new THREE.LineBasicMaterial({color:p.edge,transparent:true,opacity:0}));finished.add(edge);finalEdges.push(edge.material);return mesh;
 }
 for(const part of logo.parts)solid(shape(part.points),logo.depth,blue?.86:1);
 const border=shape(logo.outline),inner=logo.outline.map(([x,y])=>[x*.972,y*.970]).reverse();border.holes.push(new THREE.Path(inner.map(v=>new THREE.Vector2(...v))));solid(border,.30,blue?.7:1);
 // Very faint glass face retains the clipped-corner badge without a heavy tile.
 const face=solid(shape(logo.outline),.045,blue?.065:.10);face.position.z=-.19;
 function setTime(t){
  t=clamp(t,0,8);const reveal=smooth(.05,1.15,t),assemble=smooth(3.1,5.8,t),finish=smooth(4.85,5.95,t),fadePlan=1-smooth(4.7,6.1,t);
  const dolly=smooth(.6,6,t);
  camera.position.set(mix(6.8,2.1,dolly),mix(10.3,1.20,dolly),mix(11.5,15.4,dolly));camera.lookAt(0,mix(-1.75,.13,dolly),0);
  for(const mat of lineMaterials)mat.opacity=mat.userData.base*reveal*fadePlan;
  scan.position.x=10*smooth(.6,2.6,t);scan.material.opacity=.62*reveal*(1-smooth(2.4,2.9,t));
  memberObjects.forEach(({mesh,edges,index,a,b})=>{
   const delay=index<15?index*.026:.48+(index-15)*.015;
   const grow=smooth(1.45+delay,2.3+delay,t),out=1-smooth(3.15+index*.012,4.85+index*.008,t);
   mesh.scale.y=Math.max(.001,grow);mesh.position.copy(a).lerp(b,grow/2);
   mesh.material.opacity=(blue?.10:.18)*grow*out;edges.material.opacity=.57*grow*out;mesh.visible=grow>0&&out>0;
  });
  traveling.forEach(({mesh,edges,from,fromQ,to,toQ,index})=>{
   const phase=smooth(2.95+index*.009,4.85+index*.008,t);
   mesh.position.copy(from).lerp(to,phase);mesh.quaternion.copy(fromQ).slerp(toQ,phase);
   mesh.scale.set(mix(.28,1,phase),mix(.72,1,phase),mix(.38,1,phase));
   const show=smooth(3.02,3.6,t)*(1-finish);
   mesh.material.opacity=show*mix(.20,blue?.68:.95,phase);edges.material.opacity=show*.58;mesh.visible=show>0;
  });
  finalMaterials.forEach(m=>m.opacity=m.userData.max*finish);finalEdges.forEach((m,i)=>m.opacity=(i===finalEdges.length-1?.06:blue?.62:.36)*finish);
  key.intensity=4.3+.6*Math.sin(smooth(4.4,6,t)*Math.PI);
  renderer.render(scene,camera);
  return {dateOpacity:smooth(5.95,6.35,t),theme:p,progress:t/8};
 }
 function resize(w,h){width=w;height=h;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);}
 return {setTime,resize,renderer,scene,camera,theme:p,dispose(){scene.traverse(o=>{o.geometry?.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>{m?.map?.dispose();m?.dispose();});});environment.dispose();renderer.dispose();}};
}
