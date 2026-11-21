import {workshop} from '../../ThreeJS共享/site-craft.mjs';
import {curvedDeck} from '../../ThreeJS共享/site-paths.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  curvedDeck(k, {path:[[0,0,5.8],[0,0,2.3],[0,.1,.9],[0,.78,-.85],[0,.8,-2.6],[0,.8,-5.9]],width:1.73,depth:.28,steps:true,n:26,rails:'both'});
  return k.finish('C22');
}
