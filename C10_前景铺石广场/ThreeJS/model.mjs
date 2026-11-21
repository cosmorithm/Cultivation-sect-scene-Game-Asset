import {workshop} from '../../ThreeJS共享/site-craft.mjs';
import {rectangularPaving} from '../../ThreeJS共享/site-paths.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  rectangularPaving(k, {width:22,depth:14,rows:23,cols:10,height:.35,plaza:true});
  return k.finish('C10');
}
