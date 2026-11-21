import {rockStudio, mass} from '../../ThreeJS共享/terrain-rock.mjs';

export function buildAsset(T) {
  const rock = rockStudio(T,340,{tone:'blue',grain:1.35});
  // Small moss-covered crown with an open ledge at the front and three suspended points.
  mass(rock,{rx:5.8,rz:4.4,h:5.8,segments:27,moss:1,rough:.16,
    sections:[[.36,.40,.36],[.61,.71,.76],[.8,.97,.92],[.94,1,1],[1,.94,.96]]});
  mass(rock,{x:-1.2,y:5.56,z:-.8,rx:2.65,rz:2.15,h:.85,seed:4,moss:1,segments:18,sections:[[0,1,1],[.49,.97,.89],[1,.84,.79]]});
  for(const [x,z,dy] of [[-2.6,-.3,.24],[.1,1.2,-.82],[2.6,-.8,.45]])
    mass(rock,{x,y:dy,z,rx:1.7,rz:1.6,h:4.7,segments:14,rough:.21,sections:[[0,.04,.045,-.21,.11],[.38,.48,.47],[.73,.75,.78],[1,1,1]]});
  return rock.finish('F07');
}

export const presentation = {studioLightScale:.83,background:0xcad3d5,floorColor:0x8d9794, direction:[.75,.31,1.6]};
