import {workshop} from '../../ThreeJS共享/site-craft.mjs';
import {decalDisc} from '../../ThreeJS共享/site-paths.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  decalDisc(k, {radius:2.45,style:'lotus',thickness:.085});
  return k.finish('C18');
}
