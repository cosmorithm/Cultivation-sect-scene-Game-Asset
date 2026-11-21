import {rockStudio, mass} from '../../ThreeJS共享/terrain-rock.mjs';

export function buildAsset(T) {
  const rock = rockStudio(T,763,{tone:'blue',grain:1.1});
  mass(rock,{rx:3.35,rz:2.26,h:6.8,rough:.25,moss:.41,segments:19,
    sections:[[0,.038,.049,-.16,.17],[.22,.26,.31,-.14,.16],[.46,.43,.51,-.05,.08],[.67,.58,.67,.05,.03],[.90,.97,.96,.04,-.03],[1,1,1]]});
  return rock.finish('F16');
}

export const presentation = {studioLightScale:.83,background:0xcad3d5,floorColor:0x8d9794, direction:[.75,.31,1.6]};
