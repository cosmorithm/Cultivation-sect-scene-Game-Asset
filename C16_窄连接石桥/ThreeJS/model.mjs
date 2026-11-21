import {workshop} from '../../ThreeJS共享/site-craft.mjs';
import {curvedDeck} from '../../ThreeJS共享/site-paths.mjs';
import {standingLamp} from '../../ThreeJS共享/site-lamps.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  curvedDeck(k,{path:[[0,.74,7.8],[0,.76,2],[0,.77,-3],[0,.74,-7.8]],width:2.1,depth:.59,n:22,rails:'both'});
  for(const x of [-.99,.99])for(const z of [-7.8,7.8])
    standingLamp(k,x,.74,z,{height:1.65,shade:.24,body:.36});
  return k.finish('C16');
}
