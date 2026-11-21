import {workshop} from '../../ThreeJS共享/site-craft.mjs';
import {standingLamp} from '../../ThreeJS共享/site-lamps.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  standingLamp(k,0,0,0,{height:1.56,shade:.49,body:.51,low:true});
  return k.finish('E02');
}
