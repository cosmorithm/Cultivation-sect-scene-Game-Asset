import {workshop} from '../../ThreeJS共享/site-craft.mjs';
import {decalDisc} from '../../ThreeJS共享/site-paths.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  decalDisc(k, {radius:6.2,style:'compass',thickness:.085});
  return k.finish('C19');
}

export const presentation = {background:0xc9d2d1, floorColor:0x929b95, studioLightScale:.82, direction:[.44,1.61,.68]};
