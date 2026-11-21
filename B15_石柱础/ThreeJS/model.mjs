import { Workshop, baseDrum } from '../../ThreeJS共享/architecture.mjs';

export function buildAsset(T) {
  const s = new Workshop(T, 'B15_DrumColumnFoot');
  s.section('SquarePlinthAndStoneDrum');
  baseDrum(s,0,0,0,.50);
  s.section('ShallowCarvedBand');
  for(let i=0;i<10;i++)s.local([0,0,0],i*Math.PI/5,()=>s.scroll('carving',0,.330,.580,.29,.107,.010));
  s.cylinder('bronze',0,.495,0,.495,.495,.025,40);
  s.cylinder('heartwood',0,.52,0,.456,.456,.016,40);
  return s.finish();
}
