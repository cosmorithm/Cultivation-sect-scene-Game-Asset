import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

export function createRenderer(canvas, {capture=false} = {}) {
  const renderer = new T.WebGLRenderer({canvas, antialias:true, preserveDrawingBuffer:capture});
  renderer.setPixelRatio(capture ? 1 : Math.min(window.devicePixelRatio,2));
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=T.PCFSoftShadowMap;
  renderer.toneMapping=T.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.04;
  const pmrem=new T.PMREMGenerator(renderer);
  const room=new RoomEnvironment();
  const env=pmrem.fromScene(room,.06);
  room.dispose(); pmrem.dispose();
  return {renderer,env};
}

export function createStage(context, root, style={}, clips=root.animations||[]) {
  const {renderer,env}=context;
  const scene=new T.Scene();
  root.updateMatrixWorld(true);
  const bounds=new T.Box3().setFromObject(root,true);
  const center=bounds.getCenter(new T.Vector3());
  const radius=Math.max(.04,bounds.getSize(new T.Vector3()).length()/2);
  scene.background=new T.Color(style.background??0xd8e0df);
  scene.environment=env.texture;
  scene.environmentIntensity=.35;
  scene.add(root);
  root.traverse(o=>{
    if(!o.isMesh) return;
    const mats=Array.isArray(o.material)?o.material:[o.material];
    o.castShadow=mats.every(m=>!m.transparent || m.alphaTest>.25);
    o.receiveShadow=true;
  });
  if(style.floor!==false) {
    const floor=new T.Mesh(new T.PlaneGeometry(radius*70,radius*70),
      new T.MeshStandardMaterial({color:style.floorColor??0xabb4b2,roughness:1}));
    floor.position.set(center.x,bounds.min.y-radius*.0015,center.z);
    floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; scene.add(floor);
  }
  scene.add(new T.HemisphereLight(0xf0f6ff,0x88796b,1.1));
  const sun=new T.DirectionalLight(0xffebcd,2.55);
  sun.position.copy(center).add(new T.Vector3(-1.2,1.8,1.35).multiplyScalar(radius*2.3));
  sun.target.position.copy(center);
  sun.castShadow=true;
  const sc=sun.shadow.camera;
  Object.assign(sc,{left:-1.3*radius,right:1.3*radius,top:1.3*radius,bottom:-1.3*radius,near:.02*radius,far:10*radius});
  sc.updateProjectionMatrix();sun.shadow.mapSize.set(1536,1536);
  sun.shadow.bias=-.00012;sun.shadow.normalBias=.0009*radius;
  scene.add(sun,sun.target);
  const rim=new T.DirectionalLight(0xdfeeff,1.05);
  rim.position.copy(center).add(new T.Vector3(1,.9,-1.2).multiplyScalar(radius*3));
  rim.target.position.copy(center);scene.add(rim,rim.target);
  const camera=new T.PerspectiveCamera(33,1,radius*.001,radius*150);
  const controls=new OrbitControls(camera,renderer.domElement);
  controls.minDistance=radius*.075;controls.maxDistance=radius*12;
  controls.enableDamping=false;
  const mix=clips.length?new T.AnimationMixer(root):null;
  if(mix) for(const clip of clips) mix.clipAction(clip).play();
  const corners=[];
  for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z])
    corners.push(new T.Vector3(x,y,z).sub(center));
  let lastView='overall',autoView=true;
  const directions={overall:style.direction??[.9,.59,1.45], reverse:style.reverseDirection??[-.95,.40,-1.32], top:style.topDirection??[.12,1.65,.48]};
  function render(){renderer.render(scene,camera);}
  function frame(key) {
    lastView=key;autoView=true;
    const forward=new T.Vector3(...directions[key]).normalize();
    const right=new T.Vector3().crossVectors(new T.Vector3(0,1,0),forward);
    if(right.lengthSq()<1e-7) right.set(1,0,0);
    right.normalize();
    const up=new T.Vector3().crossVectors(forward,right).normalize();
    const v=Math.tan(T.MathUtils.degToRad(camera.fov/2));
    const margin=1.14;
    let distance=radius*.4;
    for(const p of corners){
      const depth=p.dot(forward);
      distance=Math.max(distance, depth+margin*Math.abs(p.dot(right))/(v*camera.aspect),
        depth+margin*Math.abs(p.dot(up))/v);
    }
    camera.position.copy(center).addScaledVector(forward,distance);
    controls.target.copy(center);
    controls.update();render();
  }
  function resize(w,h) {
    renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
    if(autoView)frame(lastView);else render();
  }
  function pose(t){if(mix)mix.setTime(t);render();}
  controls.addEventListener('change',render);
  controls.addEventListener('start',()=>{autoView=false;});
  function dispose(){
    controls.dispose();
    if(mix){mix.stopAllAction();mix.uncacheRoot(root);}
    const geo=new Set(),mats=new Set(),tex=new Set();
    scene.traverse(obj=>{
      if(obj.geometry)geo.add(obj.geometry);
      if(obj.material)for(const m of [].concat(obj.material))mats.add(m);
    });
    for(const m of mats){for(const value of Object.values(m))if(value?.isTexture)tex.add(value);m.dispose();}
    for(const t of tex)t.dispose();
    for(const g of geo)g.dispose();
    sun.shadow.dispose();renderer.renderLists.dispose();
  }
  return {camera,controls,frame,resize,pose,render,dispose,mixer:mix};
}

export function openPreview(definition,title) {
  const status=document.querySelector('#status');
  try {
    const context=createRenderer(document.querySelector('canvas'));
    const root=definition.buildAsset(T);
    const stage=createStage(context,root,definition.presentation||{});
    const views=[...document.querySelectorAll('[data-view]')];
    const mark=key=>views.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===key)));
    views.forEach(b=>b.onclick=()=>{stage.frame(b.dataset.view);mark(b.dataset.view);});
    stage.controls.addEventListener('start',()=>mark(''));
    const play=document.querySelector('#play');
    let running=Boolean(stage.mixer),last=0;
    play.hidden=!stage.mixer;
    function toggle(){play.textContent=running?'暂停动态':'播放动态';play.setAttribute('aria-pressed',String(running));}
    play.onclick=()=>{running=!running;toggle();};toggle();
    if(stage.mixer)context.renderer.setAnimationLoop(ms=>{
      if(running){stage.mixer.update(last?Math.min(.1,(ms-last)/1000):0);stage.render();}last=ms;
    });
    const resize=()=>stage.resize(window.innerWidth,window.innerHeight);
    window.addEventListener('resize',resize);resize();stage.frame('overall');mark('overall');
    document.querySelector('#save').onclick=()=>{
      stage.render();
      context.renderer.domElement.toBlob(blob=>{
        if(!blob)return;
        const url=URL.createObjectURL(blob),a=document.createElement('a');
        a.href=url;a.download=title+'_视角.png';a.click();
        setTimeout(()=>URL.revokeObjectURL(url),1000);
      },'image/png');
    };
    status.hidden=true;
  } catch(e) {
    console.error(e);
    status.textContent='无法打开 '+title+' 的 WebGL 2 预览。可打开同目录的模型渲染图，或换用支持 WebGL 2 的浏览器。';
  }
}
