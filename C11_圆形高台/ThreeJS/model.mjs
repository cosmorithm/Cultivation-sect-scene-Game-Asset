import {workshop} from '../../ThreeJS共享/site-craft.mjs';
import {discLanding} from '../../ThreeJS共享/site-paths.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  discLanding(k, {radius:9.3,height:1.85,arms:[0,Math.PI],armWidth:3.8,pattern:'compass',deckTone:'cool'});
  return k.finish('C11');
}

export const presentation = {background:0xc9d2d1, floorColor:0x929b95, studioLightScale:.82};
