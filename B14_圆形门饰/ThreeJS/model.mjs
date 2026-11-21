import { Workshop, framePanel } from '../../ThreeJS共享/architecture.mjs';

export function buildAsset(T) {
  const s = new Workshop(T, 'B14_SplitDoorMedallion');
  // Each casting stops at the door seam. Raised cloud scrolls are separate solids.
  const R=.685,split=.013,CY=.69;
  for(const sign of [-1,1]){
   s.section(sign<0?'LeftCasting':'RightCasting');
   const outline=[];
   for(let i=0;i<=48;i++){
     const a=-Math.PI/2+i*Math.PI/48;
     outline.push([sign*(split+R*Math.cos(a)),CY+R*Math.sin(a)]);
   }
   s.profile('bronze',outline,.077,0);
   s.rod('gold',outline.map(([x,y])=>[x,y,.052]),.018,7);
   s.rod('gold',[[sign*split,CY-R,.051],[sign*split,CY+R,.051]],.010,7);
   const cloud=[[.035,.20],[.14,.13],[.24,.12],[.32,.18],[.32,.24],[.26,.26],[.23,.22],[.17,.23],[.15,.30],[.23,.37],[.34,.38],[.43,.34],[.54,.36]];
   for(const [y,flip,k] of [[.18,1,1.08],[.88,-1,.81],[.95,1,.65]]){
     s.rod('gold',cloud.map(([u,v])=>[sign*(.022+u*k),y+flip*v*k,.056]),.015,7);
   }
  }
  return s.finish();
}
