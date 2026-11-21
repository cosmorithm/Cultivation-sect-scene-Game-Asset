import {rockStudio, mass} from '../../ThreeJS共享/terrain-rock.mjs';

export function buildAsset(T) {
  const rock = rockStudio(T,481,{tone:'shale',grain:2.1});
  // Oblique rock blades share one narrow longitudinal spine.
  mass(rock,{rx:17,rz:2.85,h:3.5,rough:.15,segments:34,sections:[[0,1,1],[.30,.98,.9],[.72,.82,.60,.06,0],[1,.63,.34,.11,-.08]]});
  for(const [x,s] of [[-10,.52],[-5,.76],[0,.87],[5,1.05],[9.5,1.2]]){
    mass(rock,{x,z:.43*Math.sin(x),rx:3.6,rz:1.6,h:s*6.2,rotation:-.11,seed:Math.round(x+40),
      sections:[[0,1,1],[.43,.91,.70,.32,0],[.77,.46,.41,.70,-.10],[1,.08,.08,.88,-.13]],rough:.17});
  }
  return rock.finish('F10');
}

export const presentation = {studioLightScale:.83,background:0xcad3d5,floorColor:0x8d9794};
