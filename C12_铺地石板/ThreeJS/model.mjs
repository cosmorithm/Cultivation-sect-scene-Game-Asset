import {workshop} from '../../ThreeJS共享/site-craft.mjs';
import {rectangularPaving} from '../../ThreeJS共享/site-paths.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  rectangularPaving(k, {width:3.8,depth:2.2,rows:4,cols:4,height:.16});
  return k.finish('C12');
}

export const presentation = {background:0xc9d2d1, floorColor:0x929b95, studioLightScale:.82};
