import {rockStudio, mass} from '../../ThreeJS共享/terrain-rock.mjs';

export function buildAsset(T) {
  const rock = rockStudio(T,434,{tone:'slate',grain:1.5});
  mass(rock,{rx:9,rz:6,h:3.5,seed:4,moss:.92,rough:.19,
    sections:[[0,1,1],[.14,.97,.98],[.35,.87,.85],[.62,.72,.72],[.88,.45,.51,.08,-.07],[1,.25,.29,.12,-.09]]});
  for(const [x,z,r,h] of [[.8,-.9,3.75,4.7],[3.1,-.1,2.2,3.5],[-2.6,1.0,2,2.65]]){
    mass(rock,{x,y:.7,z,rx:r,rz:r*.83,h,seed:Math.round(x*3)+32,moss:.45,rough:.23,
      sections:[[0,1,1],[.27,.94,.85],[.55,.82,.72,.02,-.1],[.84,.55,.56,.19,-.14],[1,.33,.40,.16,-.17]]});
  }
  return rock.finish('F09');
}

export const presentation = {studioLightScale:.83,background:0xcad3d5,floorColor:0x8d9794, direction:[.66,1.02,1.57]};
