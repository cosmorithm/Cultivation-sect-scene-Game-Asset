import {workshop} from '../../ThreeJS共享/site-craft.mjs';
import {steps} from '../../ThreeJS共享/site-paths.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  steps(k, {width:3.1,count:14,rise:.172,going:.31,landing:.48,curb:.18});
  return k.finish('C02');
}

export const presentation = {background:0xc9d2d1, floorColor:0x929b95, studioLightScale:.82};
