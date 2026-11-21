import {workshop} from '../../ThreeJS共享/site-craft.mjs';
import {discLanding} from '../../ThreeJS共享/site-paths.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  discLanding(k, {radius:5.1,height:1.20,arms:[0,Math.PI],armWidth:3.1,lamps:true,pattern:'cloud'});
  return k.finish('C05');
}
