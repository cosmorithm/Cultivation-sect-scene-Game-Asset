import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { makeMaterials } from './materials.mjs';
import { buildStone } from './stone.mjs';
import { buildTimber } from './timber.mjs';
import { buildRoofs } from './roof.mjs';

const status = document.querySelector('#status');
const stage = document.querySelector('main');
function start() {
  const renderer = new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=T.PCFSoftShadowMap;
  renderer.toneMapping=T.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.04;
  stage.appendChild(renderer.domElement);
  const scene = new T.Scene();
  scene.background=new T.Color(0xd9e1e1);
  scene.fog=new T.FogExp2(0xd7dfde,.0018);
  const pmrem=new T.PMREMGenerator(renderer);
  const room=new RoomEnvironment();
  const environment=pmrem.fromScene(room,.06);
  scene.environment=environment.texture;
  scene.environmentIntensity=.29;
  room.dispose();
  pmrem.dispose();
  const root=new T.Group(), m=makeMaterials(T);
  root.name='A01_MainHall';
  buildStone(T,root,m);
  buildTimber(T,root,m);
  buildRoofs(T,root,m);
  root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
  scene.add(root);
  const floor=new T.Mesh(new T.PlaneGeometry(1600,1600),new T.MeshStandardMaterial({color:0xb0b7b4,roughness:.98}));
  floor.rotation.x=-Math.PI/2;
  floor.position.y=-.025;
  floor.receiveShadow=true;
  scene.add(floor);
  scene.add(new T.HemisphereLight(0xf2f7ff,0x8e796d,1.07));
  const key=new T.DirectionalLight(0xffedcf,2.55);
  key.position.set(-35,57,45);
  key.target.position.set(0,6,0);
  key.castShadow=true;
  const lightCam=key.shadow.camera;
  Object.assign(lightCam,{left:-45,right:45,top:42,bottom:-40,near:.5,far:160});
  lightCam.updateProjectionMatrix();
  key.shadow.mapSize.set(2048,2048);
  key.shadow.normalBias=.035;
  key.shadow.bias=-.00015;
  scene.add(key,key.target);
  const rim=new T.DirectionalLight(0xe2f2ff,1.0);
  rim.position.set(25,33,-41);
  scene.add(rim);
  const camera=new T.PerspectiveCamera(35,1,.16,1850);
  const orbit=new OrbitControls(camera,renderer.domElement);
  orbit.minDistance=2;
  orbit.maxDistance=300;
  orbit.maxPolarAngle=Math.PI*.492;
  orbit.enableDamping=true;
  const views={
    overall:[[40,29,71],[0,10,3],35],
    stair:[[8,4.6,42],[0,11,-1],55],
    portal:[[7.2,10.0,22.5],[0,10.5,8.5],55]
  };
  const buttons=[...document.querySelectorAll('button[data-view]')];
  function setView(name) {
    const [p,t,fov]=views[name];
    camera.position.fromArray(p);
    orbit.target.fromArray(t);
    const fit = name === 'overall' ? Math.max(1, 1.25 / camera.aspect) : 1;
    camera.fov = T.MathUtils.radToDeg(2 * Math.atan(Math.tan(T.MathUtils.degToRad(fov / 2)) * fit));
    camera.updateProjectionMatrix();
    orbit.update();
    buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===name)));
    renderer.render(scene,camera);
  }
  function resize() {
    const w=stage.clientWidth,h=stage.clientHeight;
    renderer.setSize(w,h);
    camera.aspect=w/h;
    camera.updateProjectionMatrix();
    renderer.render(scene,camera);
  }
  buttons.forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
  orbit.addEventListener('start',()=>buttons.forEach(b=>b.setAttribute('aria-pressed','false')));
  orbit.addEventListener('change',()=>renderer.render(scene,camera));
  window.addEventListener('resize',resize);
  resize();
  setView('overall');
  renderer.setAnimationLoop(()=>orbit.update());
  status.hidden=true;
}
try { start(); } catch(e) {
  console.error(e);
  status.textContent='浏览器无法加载 WebGL 2。可用新版 Chrome、Edge 或 Safari 打开，也可查看同目录的模型预览图。';
}
