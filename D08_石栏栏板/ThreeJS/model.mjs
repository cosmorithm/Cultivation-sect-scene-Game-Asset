import {workshop} from '../../ThreeJS共享/site-craft.mjs';
import {panel} from '../../ThreeJS共享/site-rail.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  panel(k,0,.27,0,2.14,.50,.145);
  for(const x of [-1,1])k.box('cool',x*1.115,.26,0,.12,.12,.076);
  return k.finish('D08');
}

export const presentation = {background:0xc9d2d1, floorColor:0x929b95, studioLightScale:.82};
