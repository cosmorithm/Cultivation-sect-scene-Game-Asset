import {workshop,reliefCloud} from '../../ThreeJS共享/site-craft.mjs';
import {sockets} from '../../ThreeJS共享/site-rail.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  sockets(k,4.65,.49,.34,4);
  for (const side of [-1,1]){
    for(const x of [-1.52,0,1.52]){
      k.box('cool',x,.201,side*.249,1.32,.184,.012);
      reliefCloud(k,x,.207,side*.263,1.16,.164,0);
    }
  }
  return k.finish('D09');
}

export const presentation = {background:0xc9d2d1, floorColor:0x929b95, studioLightScale:.82};
