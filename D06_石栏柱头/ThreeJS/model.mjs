import {workshop} from '../../ThreeJS共享/site-craft.mjs';
import {pillarCap} from '../../ThreeJS共享/site-rail.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  k.box('cool',0,.04,0,.16,.08,.16);
  pillarCap(k,0,.08,0,1,false);
  return k.finish('D06');
}
