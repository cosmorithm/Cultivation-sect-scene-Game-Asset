import { Workshop, roof, bracket } from '../../ThreeJS共享/architecture.mjs';

export function buildAsset(T) {
  const s = new Workshop(T, 'B01_GlazedRoofModule');
  s.section('OpenRoofShell');
  roof(s,{w:10.8,d:5.45,eave:.97,rise:1.94,ridge:6.24,lift:.81,tilePitch:.195});
  s.section('MountingBattens');
  for(const z of [-1.73,1.73]){
   s.box('heartwood',0,.63,z,8.48,.27,.24);
   for(const x of [-3.78,-1.89,0,1.89,3.78])bracket(s,x,0,z,.73);
  }
  return s.finish();
}
