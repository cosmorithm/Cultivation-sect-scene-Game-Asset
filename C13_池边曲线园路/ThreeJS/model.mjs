import {workshop} from '../../ThreeJS共享/site-craft.mjs';
import {curvedDeck} from '../../ThreeJS共享/site-paths.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  curvedDeck(k, {path:[[-5,.10,2],[-3.6,.11,1.5],[-1.9,.20,2.2],[.7,.30,.4],[2.6,.38,.4],[4.8,.56,-1.6],[6.7,.6,-2]],width:2.08,depth:.18,n:22,rails:'none'});
  return k.finish('C13');
}
