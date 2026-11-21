import {workshop} from '../../ThreeJS共享/site-craft.mjs';
import {steps} from '../../ThreeJS共享/site-paths.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  steps(k, {width:6.3,count:19,rise:.165,going:.32,landing:.78,curb:.31,cheeks:true});
  return k.finish('C06');
}
