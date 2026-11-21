import { Workshop, pagodaSpire } from '../../ThreeJS共享/architecture.mjs';

export function buildAsset(T) {
  const s = new Workshop(T, 'B05_BronzeSpire');
  s.section('SquareLotusSeat');
  for(const [y,w,h] of [[.08,1.22,.16],[.24,1.0,.18],[.39,.87,.11]])s.box('bronze',0,y,0,w,h,w);
  s.section('LotusBands');
  for(let i=0;i<12;i++){
   const a=i*Math.PI/6;
   s.local([0,0,0],a,()=>s.rod('gold',[[-.09,.60,.413],[0,.51,.466],[.09,.60,.413]],.023,6));
  }
  s.section('ThreeRingNeedle');
  pagodaSpire(s,0,.44,0,3.65);
  return s.finish();
}
