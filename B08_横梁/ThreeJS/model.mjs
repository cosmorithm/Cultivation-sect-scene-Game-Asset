import { Workshop, framePanel } from '../../ThreeJS共享/architecture.mjs';

export function buildAsset(T) {
  const s = new Workshop(T, 'B08_PaintedCrossbeam');
  s.section('TimberWithTenons');
  s.box('heartwood',0,.31,0,3.76,.62,.39);
  for(const sign of [-1,1]){
   s.box('walnut',sign*1.98,.32,0,.24,.22,.24);
   s.box('bronze',sign*1.83,.31,0,.062,.63,.395);
  }
  s.section('PaintedFace');
  s.box('teal',0,.31,.202,3.36,.403,.033);
  for(const guide of [.105,.513])s.box('gold',0,guide,.226,3.39,.022,.021);
  for(const x of [-1.05,0,1.05])s.scroll('gold',x,.255,.235,.91,.27,.016);
  return s.finish();
}
