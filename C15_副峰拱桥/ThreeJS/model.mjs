import {workshop} from '../../ThreeJS共享/site-craft.mjs';
import {archBridge} from '../../ThreeJS共享/site-paths.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  archBridge(k, {length:15.8,width:3.20,clearance:3.65,thickness:.92,approach:2.2,lamps:true,steps:true});
  return k.finish('C15');
}
