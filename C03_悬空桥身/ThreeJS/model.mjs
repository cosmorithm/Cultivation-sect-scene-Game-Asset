import {workshop} from '../../ThreeJS共享/site-craft.mjs';
import {curvedDeck} from '../../ThreeJS共享/site-paths.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  curvedDeck(k, {
    path:[[-8,0,7],[-5,.2,6.7],[-2,.7,3.4],[.2,1.3,3.3],[3.4,1.9,5.7],[7.7,2.7,4.5],[11.4,3.8,1.1],[12.6,4.6,-3]],
    width:3.55,depth:1.13,n:47,apron:true,pavers:false
  });
  return k.finish('C03');
}
