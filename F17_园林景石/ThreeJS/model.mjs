import {rockStudio, mass} from '../../ThreeJS共享/terrain-rock.mjs';

export function buildAsset(T) {
  const rock = rockStudio(T,810,{tone:'blue',grain:0.65});
  for(const [x,z,rx,rz,h,seed] of [[-.64,0,2.00,1.53,2.28,6],[1.1,-.26,1.52,1.0,1.37,9],[1.96,.36,.92,.69,.77,15]]){
    mass(rock,{x,z,rx,rz,h,seed,segments:16,rough:.22,moss:.53,capRelief:.06,
      sections:[[0,.90,.93],[.16,1,1],[.48,.88,.92,.04,-.02],[.73,.68,.72,.09,-.06],[.93,.52,.41,.16,-.05],[1,.33,.29,.19,-.10]]});
  }
  return rock.finish('F17');
}

export const presentation = {studioLightScale:.83,background:0xcad3d5,floorColor:0x8d9794};
