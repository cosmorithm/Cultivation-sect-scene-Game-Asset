import {workshop} from '../../ThreeJS共享/site-craft.mjs';
import {steps} from '../../ThreeJS共享/site-paths.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  steps(k, {width:2.35,count:5,rise:.155,going:.34,landing:.40,curb:.20});
  return k.finish('C09');
}
