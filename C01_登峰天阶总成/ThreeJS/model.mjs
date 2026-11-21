import {workshop} from '../../ThreeJS共享/site-craft.mjs';
import {curvedDeck} from '../../ThreeJS共享/site-paths.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  curvedDeck(k, {
    // Enter from the low circular landing, pass the middle turn, then climb the long final flight.
    path:[[-9,0,26],[-10,.45,19],[-3,2.8,15],[1.2,5.1,12],[-1,6.3,7],[-5,7.4,2],[-2.5,9.8,-4],[2,12.8,-8],[2.7,18.7,-17],[2.7,26,-27]],
    width:4.9, depth:1.08, steps:true, n:152, rails:'both', platformAt:.403, apron:true, lamps:true
  });
  return k.finish('C01');
}

export const presentation = {background:0xc9d2d1, floorColor:0x929b95, studioLightScale:.82, direction:[1.55,.55,.63], reverseDirection:[-1.4,.47,-.75]};
