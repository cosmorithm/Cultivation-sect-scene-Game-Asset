import {workshop} from '../../ThreeJS共享/site-craft.mjs';
import {standingLamp} from '../../ThreeJS共享/site-lamps.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  standingLamp(k,0,0,0,{height:3.8,shade:.36,body:.81});
  return k.finish('E01');
}
