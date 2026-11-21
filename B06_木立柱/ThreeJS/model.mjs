import { Workshop, framePanel } from '../../ThreeJS共享/architecture.mjs';

export function buildAsset(T) {
  const s = new Workshop(T, 'B06_VermilionPost');
  s.section('PostShaft');
  s.cylinder('lacquer',0,.16,0,.308,.264,3.45,48);
  for(const [y,r] of [[.16,.311],[3.43,.274]]){
   s.cylinder('heartwood',0,y,0,r,r,.17,40);
   for(const yy of [y+.006,y+.14])s.cylinder('bronze',0,yy,0,r+.009,r+.009,.023,40);
   for(let i=0;i<8;i++)s.local([0,0,0],i*Math.PI/4,()=>s.scroll('gold',0,y+.066,r+.002,.20,.075,.008));
  }
  s.section('EndTenons');
  s.box('walnut',0,.081,0,.27,.162,.27);
  s.box('heartwood',0,3.71,0,.24,.20,.24);
  return s.finish();
}
