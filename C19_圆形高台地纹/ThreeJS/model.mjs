import {workshop} from '../../ThreeJS共享/site-craft.mjs';
import {decalDisc} from '../../ThreeJS共享/site-paths.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  decalDisc(k, {radius:6.2,style:'compass',thickness:.085});
  return k.finish('C19');
}
