import {rockStudio, mass} from '../../ThreeJS共享/terrain-rock.mjs';

export function buildAsset(T) {
  const rock = rockStudio(T,199,{tone:'shale',grain:1.8});
  const notch=(a)=>1-.19*Math.exp(-((Math.sin(a)-.87)**2/.022+(Math.cos(a)-.48)**2/.14));
  mass(rock,{rx:12.8,rz:12.1,h:19,seed:17,segments:34,rough:.105,moss:.14,edgeBias:notch,capRelief:.014,
    sections:[[.22,.38,.36],[.45,.67,.7],[.67,.86,.86],[.82,.995,.98],[.93,1,1],[1,.96,.95]]});
  for(const [x,z,y,h] of [[-4.7,1,0,13.5],[3.8,4,-3,16],[-.8,-4.0,1.3,12.5]])
    mass(rock,{x,y,z,rx:4.6,rz:4.5,h,segments:17,rough:.23,seed:Math.round((x+8)*3),sections:[[0,.04,.05,-.09,.1],[.39,.42,.51],[.69,.68,.75],[1,1,1]]});
  return rock.finish('F04');
}

export const presentation = {studioLightScale:.83,background:0xcad3d5,floorColor:0x8d9794, direction:[.75,.31,1.6]};
