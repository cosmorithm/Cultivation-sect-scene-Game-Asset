import {workshop} from '../../ThreeJS共享/site-craft.mjs';
import {archBridge} from '../../ThreeJS共享/site-paths.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  archBridge(k, {length:9.2,width:2.55,clearance:1.24,thickness:.39,approach:.85});
  return k.finish('C14');
}
