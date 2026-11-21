import {workshop} from '../../ThreeJS共享/site-craft.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  const w=2.32,h=1.57;
  for(const x of [-w/2,w/2]){
    k.box('bronze',x,.06,0,.37,.12,.56);
    k.box('wood',x,.22,0,.26,.32,.40);
    k.box('red',x,h*.55,0,.153,h*.88,.186);
    k.box('gold',x,h-.027,0,.204,.055,.230);
    k.box('wood',x,h+.047,0,.198,.092,.216);
    for(const z of [-.26,.26])k.bar('wood',[x,.10,z],[x,.39,z*.16],.105,.095);
  }
  for(const y of [.28,.57,.87,1.17,1.45])k.box('wood',0,y,0,w,.073,.104);
  for(let i=0;i<6;i++)k.box('red',(i-2.5)*.32,.86,0,.061,1.20,.082);
  for(const x of [-1,1])k.box('gold',x*.11,1.46,.061,.095,.033,.023);
  return k.finish('E06');
}
