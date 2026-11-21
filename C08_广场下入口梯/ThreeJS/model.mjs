import {workshop} from '../../ThreeJS共享/site-craft.mjs';
import {steps} from '../../ThreeJS共享/site-paths.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  steps(k, {width:4.8,count:20,rise:.18,going:.31,landing:1.25,curb:.30,rails:true,cheeks:true,lamps:true});
  return k.finish('C08');
}
