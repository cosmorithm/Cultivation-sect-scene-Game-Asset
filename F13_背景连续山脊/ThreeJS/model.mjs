import {rockStudio, mass} from '../../ThreeJS共享/terrain-rock.mjs';

export function buildAsset(T) {
  const rock = rockStudio(T,622,{tone:'shale',grain:2.9});
  const groups=[[-19,5.4,8],[-10.1,7.4,13],[.8,6.4,8.8],[10.0,7.3,11.6],[19.5,5.4,7.5]];
  for(const [x,r,h] of groups){
    const lean=.18*Math.cos(x);
    mass(rock,{x,z:1.1*Math.sin(x*.4),rx:r*1.37,rz:r*.72,h,seed:Math.round(x+38),segments:24,rough:.15,
      sections:[[0,1,1],[.14,.88,.91],[.31,.71,.75,lean*.16],[.63,.48,.51,lean*.59,-.06],[.89,.25,.24,lean*.86,-.11],[1,.052,.070,lean,-.16]]});
  }
  return rock.finish('F13');
}

export const presentation = {studioLightScale:.83,background:0xcad3d5,floorColor:0x8d9794, direction:[.44,.53,1.5]};
