import {workshop} from '../../ThreeJS共享/site-craft.mjs';
import {discLanding} from '../../ThreeJS共享/site-paths.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  discLanding(k, {radius:4.5,height:1.18,arms:[-.87,.87],armWidth:2.7,lamps:true,pattern:'cloud'});
  return k.finish('C04');
}

export const presentation = {background:0xc9d2d1, floorColor:0x929b95, studioLightScale:.82};
