import {rockStudio, mass} from '../../ThreeJS共享/terrain-rock.mjs';

export function buildAsset(T) {
  const rock = rockStudio(T,293,{tone:'shale',grain:1.8});
  mass(rock,{rx:7.6,rz:6.1,h:23.4,rough:.22,segments:28,moss:.18,
    sections:[[0,1,1],[.08,.88,.9,-.05,.01],[.22,.68,.69,.02,.04],[.45,.51,.52,.10,.07],[.70,.46,.48,.15,.04],[.89,.49,.49,.17,0],[1,.45,.46,.15,-.04]]});
  for(const [x,z,s,dx] of [[-3.7,1,.76,.25],[2.9,-1.6,.65,-.28],[.3,3.0,.61,-.12]])
    mass(rock,{x,z,rx:2.5,rz:2.45,h:18*s,segments:15,rough:.20,sections:[[0,1,1],[.27,.73,.75,dx*.3],[.59,.60,.65,dx*.7],[.91,.36,.41,dx],[1,.19,.22,dx]]});
  for(const [x,z,h,dx] of [[-1.4,2.7,18.4,.48],[2.6,1.9,15.3,-.18],[-3.5,-1.7,10.8,.53]]){
    mass(rock,{x,z,rx:1.30,rz:1.42,h,seed:Math.round(h*5),segments:14,rough:.29,
      sections:[[0,.98,1],[.45,.87,.82,dx*.3],[.82,.65,.53,dx*.7],[1,.19,.18,dx]]});
  }
  return rock.finish('F06');
}

export const presentation = {studioLightScale:.83,background:0xcad3d5,floorColor:0x8d9794};
