import { Workshop, bracket } from '../../ThreeJS共享/architecture.mjs';

export function buildAsset(T) {
  const s = new Workshop(T, 'B07_ColumnHead');
  s.section('DrumCollar');
  s.cylinder('lacquer',0,0,0,.325,.335,.29,32);
  for(const y of [.025,.263])s.cylinder('bronze',0,y,0,.344,.344,.023,32);
  for(let i=0;i<6;i++)s.local([0,0,0],i*Math.PI/3,()=>s.scroll('gold',0,.10,.335,.29,.17,.010));
  s.section('UShapedBeamCradle');
  bracket(s,0,.25,0,1.15);
  s.box('heartwood',0,1.13,0,1.56,.14,.67);
  for(const sign of [-1,1])s.box('lacquer',sign*.73,1.27,0,.10,.18,.67);
  return s.finish();
}
