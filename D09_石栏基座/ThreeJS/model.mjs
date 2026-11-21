import {workshop} from '../../ThreeJS共享/site-craft.mjs';
import {sockets} from '../../ThreeJS共享/site-rail.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  sockets(k,4.65,.49,.34,4);
  return k.finish('D09');
}
