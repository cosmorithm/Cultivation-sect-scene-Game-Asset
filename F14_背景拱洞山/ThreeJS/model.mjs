import {rockStudio, mass, naturalArch} from '../../ThreeJS共享/terrain-rock.mjs';

export function buildAsset(T) {
  const rock = rockStudio(T,669,{tone:'shale',grain:1.8});
  naturalArch(rock,{width:24,depth:7.5,height:14.8,seed:39});
  // Split buttresses live outside the arch mouth, leaving a clear through route.
  for(const [x,z,rx,rz,h] of [[-9.4,-.7,3.55,3.0,7.8],[8.3,1.0,2.85,2.7,6.7],[-7.3,-1.85,2.2,2.3,9.8]]){
    mass(rock,{x,z,rx,rz,h,seed:Math.round(x+55),rough:.22,sections:[[0,1,1],[.32,.91,.84],[.61,.58,.68],[.90,.30,.40,.18,-.02],[1,.065,.085,.25,-.06]]});
  }
  for(const [x,y,z,r,h,dx] of [[-5.5,7.9,-.25,2.4,6.5,.29],[-3.6,9.35,.55,2.17,5.61,.36],[1.4,9.5,-.6,1.86,3.48,-.21],[7.95,3.4,-1.0,2.15,4.95,-.27],[-10.6,.02,1.51,2.18,3.54,.18]]){
    mass(rock,{x,y,z,rx:r,rz:r*.72,h,seed:Math.round(y*9)+61,segments:13,rough:.34,
      sections:[[0,1,1],[.37,.91,.87,dx*.18],[.69,.65,.61,dx*.6],[.91,.46,.39,dx*.85],[1,.15,.13,dx]]});
  }
  return rock.finish('F14');
}

export const presentation = {studioLightScale:.83,background:0xcad3d5,floorColor:0x8d9794, direction:[.44,.53,1.5]};
