import {workshop} from '../../ThreeJS共享/site-craft.mjs';
import {curvedDeck} from '../../ThreeJS共享/site-paths.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  curvedDeck(k, {path:[[-6,.22,3.6],[-5.5,.4,2.2],[-3.3,.55,1.65],[.1,.78,2.20],[2.5,1.1,1.45],[4.2,1.33,-1.1],[6.3,1.6,-1.8]],width:1.97,depth:.38,n:29,rails:'outer'});
  return k.finish('C21');
}
