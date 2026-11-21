import * as T from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {SSAOPass} from 'three/addons/postprocessing/SSAOPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

export function createRenderer(canvas, {capture=false} = {}) {
  const renderer = new T.WebGLRenderer({canvas, antialias:true, preserveDrawingBuffer:capture});
  renderer.setPixelRatio(capture ? 1 : Math.min(window.devicePixelRatio,2));
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=T.PCFSoftShadowMap;
  renderer.toneMapping=T.ACESFilmicToneMapping;
  renderer.toneMappingExposure=.97;
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
  scene.background=new T.Color(style.background??0xb6c1c2);
  scene.environment=env.texture;
  const studioScale=style.studioLightScale??1;
  scene.environmentIntensity=.35*studioScale;
  scene.add(root);
  if(style.floor!==false)scene.fog=new T.Fog(scene.background,6*radius,17*radius);
  root.traverse(o=>{
    if(!o.isMesh) return;
    const mats=Array.isArray(o.material)?o.material:[o.material];
    o.castShadow=mats.every(m=>!m.transparent || m.alphaTest>.25);
    o.receiveShadow=true;
  });
  if(style.floor!==false) {
    const floor=new T.Mesh(new T.PlaneGeometry(radius*70,radius*70),
      new T.MeshStandardMaterial({color:style.floorColor??0x96a1a1,roughness:1}));
    floor.position.set(center.x,bounds.min.y-radius*.0015,center.z);
    floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; scene.add(floor);
  }
  scene.add(new T.HemisphereLight(0xf0f6ff,0x72675e,.83*studioScale));
  const sun=new T.DirectionalLight(0xffe3be,2.32*studioScale);
  sun.position.copy(center).add(new T.Vector3(-1.6,1.95,1.18).multiplyScalar(radius*2.3));
  sun.target.position.copy(center);
  sun.castShadow=true;
  const sc=sun.shadow.camera;
  Object.assign(sc,{left:-1.3*radius,right:1.3*radius,top:1.3*radius,bottom:-1.3*radius,near:.02*radius,far:10*radius});
  sc.updateProjectionMatrix();sun.shadow.mapSize.set(1536,1536);
  sun.shadow.bias=-.00012;sun.shadow.normalBias=.0009*radius;
  scene.add(sun,sun.target);
  const rim=new T.DirectionalLight(0xd4e8ff,1.22*studioScale);
  rim.position.copy(center).add(new T.Vector3(1,.9,-1.2).multiplyScalar(radius*3));
  rim.target.position.copy(center);scene.add(rim,rim.target);
  const camera=new T.PerspectiveCamera(33,1,radius*.020,radius*48);
  const controls=new OrbitControls(camera,renderer.domElement);
  controls.minDistance=radius*.075;controls.maxDistance=radius*12;
  controls.enableDamping=false;
  const mix=clips.length?new T.AnimationMixer(root):null;
  if(mix) for(const clip of clips) mix.clipAction(clip).play();
  // Actual vertices keep winding roads and thin roof tips centred in a 3/4 view.
  const samples=[];
  const p=new T.Vector3();
  root.traverse(o=>{
    if(!o.isMesh || !o.geometry.attributes.position)return;
    const a=o.geometry.attributes.position,step=Math.max(1,Math.floor(a.count/1100));
    for(let i=0;i<a.count;i+=step)samples.push(p.fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld).sub(center).clone());
  });
  let composer,ao,out;
  const useAO=style.floor!==false && !mix && renderer.extensions.has('EXT_color_buffer_float');
  if(useAO){
    const rt=new T.WebGLRenderTarget(8,8,{type:T.HalfFloatType,samples:Math.min(4,renderer.capabilities.maxSamples)});
    composer=new EffectComposer(renderer,rt);
    composer.addPass(new RenderPass(scene,camera));
    ao=new SSAOPass(scene,camera,8,8,16);
    ao.kernelRadius=radius*.063;
    ao.minDistance=.00004;
    ao.maxDistance=.0022;
    composer.addPass(ao);
    out=new OutputPass();composer.addPass(out);
  }
  let lastView='overall',autoView=true;
  const directions={overall:style.direction??[.9,.59,1.45], reverse:style.reverseDirection??[-.95,.40,-1.32], top:style.topDirection??[.12,1.65,.48]};
  function render(){if(composer)composer.render();else renderer.render(scene,camera);}
  function frame(key) {
    lastView=key;autoView=true;
    if(key==='detail' && style.detailEye && style.detailTarget){
      camera.fov=43;camera.updateProjectionMatrix();
      camera.position.fromArray(style.detailEye);controls.target.fromArray(style.detailTarget);
      controls.update();render();return;
    }
    camera.fov=33;camera.updateProjectionMatrix();
    const forward=new T.Vector3(...directions[key]).normalize();
    const right=new T.Vector3().crossVectors(new T.Vector3(0,1,0),forward);
    if(right.lengthSq()<1e-7) right.set(1,0,0);
    right.normalize();
    const up=new T.Vector3().crossVectors(forward,right).normalize();
    const v=Math.tan(T.MathUtils.degToRad(camera.fov/2));
    const margin=1.16;
    let xmin=Infinity,xmax=-Infinity,ymin=Infinity,ymax=-Infinity;
    for(const p of samples){
      const x=p.dot(right),y=p.dot(up);
      xmin=Math.min(xmin,x);xmax=Math.max(xmax,x);ymin=Math.min(ymin,y);ymax=Math.max(ymax,y);
    }
    const xc=(xmin+xmax)/2,yc=(ymin+ymax)/2;
    const target=center.clone().addScaledVector(right,xc).addScaledVector(up,yc);
    let distance=radius*.4;
    for(const p of samples){
      const depth=p.dot(forward);
      distance=Math.max(distance, depth+margin*Math.abs(p.dot(right)-xc)/(v*camera.aspect),
        depth+margin*Math.abs(p.dot(up)-yc)/v);
    }
    camera.position.copy(target).addScaledVector(forward,distance);
    controls.target.copy(target);
    controls.update();render();
  }
  function resize(w,h) {
    renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
    if(composer)composer.setSize(w,h);
    if(autoView)frame(lastView);else render();
  }
  function pose(t){if(mix)mix.setTime(t);render();}
  controls.addEventListener('change',render);
  controls.addEventListener('start',()=>{autoView=false;});
  function dispose(){
    controls.dispose();
    if(composer){ao.dispose();ao.noiseTexture?.dispose();out.dispose();composer.dispose();}
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
    const detail=document.querySelector('[data-view="detail"]');
    if(detail)detail.hidden=!definition.presentation?.detailEye;
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
