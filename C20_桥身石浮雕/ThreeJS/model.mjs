import {workshop} from '../../ThreeJS共享/site-craft.mjs';
import {wallPanel} from '../../ThreeJS共享/site-paths.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  wallPanel(k,3.4,.66,.135);
  return k.finish('C20');
}
