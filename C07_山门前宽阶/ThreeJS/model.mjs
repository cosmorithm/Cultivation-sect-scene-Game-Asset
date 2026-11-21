import {workshop} from '../../ThreeJS共享/site-craft.mjs';
import {steps} from '../../ThreeJS共享/site-paths.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  steps(k, {width:9.2,count:12,rise:.16,going:.37,landing:3.25,curb:.40,rails:true,lamps:true});
  return k.finish('C07');
}
