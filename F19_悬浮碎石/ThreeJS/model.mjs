import {rockStudio, mass} from '../../ThreeJS共享/terrain-rock.mjs';

export function buildAsset(T) {
  const rock = rockStudio(T,904,{tone:'slate',grain:0.88});
  mass(rock,{rx:2.61,rz:2.35,h:4.8,seed:4,segments:21,rough:.21,moss:.07,capRelief:.035,
    sections:[[0,.025,.04,-.23,.13],[.21,.24,.33,-.13,.12],[.49,.53,.63,.06,.03],[.67,.81,.82,.04,-.02],[.79,.93,.94],[.96,1,1],[1,.89,.91]]});
  return rock.finish('F19');
}

export const presentation = {studioLightScale:.83,background:0xcad3d5,floorColor:0x8d9794, direction:[.75,.31,1.6]};
