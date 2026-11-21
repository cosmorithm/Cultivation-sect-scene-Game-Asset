import {rockStudio, mass} from '../../ThreeJS共享/terrain-rock.mjs';

export function buildAsset(T) {
  const rock = rockStudio(T,528,{tone:'mist',grain:3.1});
  const spires=[[0,0,8.3,7.2,30,.10],[-6,.4,5,4.2,15,-.21],[4.9,2,4.6,4.5,20,.38],[2.1,-5.1,4.8,4.6,20,-.12],[-3.5,4.4,3.9,3.1,12,-.36]];
  for(const [x,z,rx,rz,h,bend] of spires){
    mass(rock,{x,z,rx,rz,h,seed:Math.round(h*4.3),segments:22,rough:.19,moss:.22,
      sections:[[0,1,1],[.10,.84,.82],[.28,.65,.63,bend*.11],[.42,.48,.51,bend*.26],[.65,.41,.37,bend*.47],[.86,.20,.19,bend*.81],[1,.032,.028,bend]]});
  }
  const blades=[[-3.7,9,1,4.9,12,.58],[2.3,15.5,1.6,2.25,11.2,-.36],[-1.7,17,-2.1,2.0,10.8,.65],[6.7,4,-1.1,2.2,11.3,-.36],[-6,2.4,2.4,3.1,10.4,.29]];
  for(const [x,y,z,r,h,dx] of blades){
    mass(rock,{x,y,z,rx:r,rz:r*.76,h,seed:Math.round(x*5)+103,segments:14,rough:.26,
      sections:[[0,1,1],[.40,.79,.68,dx*.36],[.77,.6,.44,dx*.73],[.93,.32,.24,dx],[1,.095,.075,dx+.03]]});
  }
  return rock.finish('F11');
}

export const presentation = {studioLightScale:.83,background:0xcad3d5,floorColor:0x8d9794, direction:[.44,.53,1.5]};
