import {rockStudio, mass} from '../../ThreeJS共享/terrain-rock.mjs';

export function buildAsset(T) {
  const rock = rockStudio(T,58,{tone:'slate',grain:3.8});
  // Sixty-metre-wide crown seats the main terrace; the rock roots hang below it.
  mass(rock,{rx:39,rz:24,h:21,seed:9,segments:40,rough:.16,moss:.20,capRelief:.012,
    sections:[[.14,.17,.24,-.07,.04],[.34,.47,.51,.01,.03],[.56,.73,.71,-.02,0],[.71,.88,.90,0,-.02],[.84,1,1,0,0],[.94,.99,.98,0,0],[1,.94,.94,0,0]]});
  for(const [x,z,rx,rz,h,y] of [[-16,5,8,7,18,-4],[10,9,9,6,16,-2],[21,-7,6,5,13,1],[-3,-11,7,6,15,0]]){
    mass(rock,{x,y,z,rx,rz,h,seed:Math.round(x+42),segments:16,rough:.23,capRelief:.004,
      sections:[[0,.035,.033,-.20,.15],[.21,.29,.38,-.10,.11],[.51,.61,.66,0,.1],[.75,.79,.87,0,.03],[1,1,1,0,0]]});
  }
  // Split slab tears beside the main hanging roots.
  for(const [x,z,r,h,lean] of [[-27,-2,4.9,11,-.3],[-9,13,4.1,14,.42],[25,4,4.4,12,-.28],[8,-15,4.7,12,.22]]){
    mass(rock,{x,y:6,z,rx:r,rz:r*.67,h,seed:Math.round(x+70),segments:13,rough:.34,capRelief:.012,
      sections:[[0,.04,.08,lean,.13],[.30,.34,.42,lean*.6],[.58,.69,.73,lean*.3],[.85,1,1],[1,.91,.86]]});
  }
  return rock.finish('F01');
}

export const presentation = {studioLightScale:.83,background:0xcad3d5,floorColor:0x8d9794, direction:[.75,.31,1.6]};
