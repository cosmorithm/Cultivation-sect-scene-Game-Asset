import {workshop} from '../../ThreeJS共享/site-craft.mjs';
import {pillar} from '../../ThreeJS共享/site-rail.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  const length=3.9;
  k.box('stone',0,.48,0,length,.94,.43);
  k.box('light',0,.094,0,length+.13,.16,.55);
  k.box('cool',0,.93,0,length+.12,.10,.50);
  k.box('light',0,1.018,0,length+.22,.087,.60);
  for(const x of [-length/2,length/2])pillar(k,x,0,0,1.13,false);
  for(const side of [-1,1]){
    for(let j=0;j<3;j++)for(let i=0;i<(j%2?3:4);i++){
      const x=(i-(j%2?1:1.5))*.89;
      k.box('relief',x,.292+j*.235,side*.217,.87,.218,.015);
    }
  }
  return k.finish('D10');
}
