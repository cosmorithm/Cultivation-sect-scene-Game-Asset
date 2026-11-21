import { Workshop, openFrame, rail, stairs, roof, pagodaSpire } from '../../ThreeJS共享/architecture.mjs';

export function buildAsset(T) {
  const s = new Workshop(T, 'A06_WatersidePavilion');
  s.section('OverWaterFootings');
  for(const x of [-2.24,2.24])for(const z of [-2.07,2.07]){
   s.box('stone',x,.38,z,.59,.76,.59);s.box('stonePale',x,.73,z,.72,.15,.72);
  }
  s.box('stone',0,.82,0,5.35,.33,5.0);s.box('stonePale',0,1.01,0,5.53,.13,5.18);
  stairs(s,2.14,2.56,1.075,5,.28);
  s.section('WaterfrontBalustrade');
  rail(s,[-2.34,-2.16],[2.34,-2.16],1.075,.71,'heartwood');
  for(const sign of [-1,1])rail(s,[sign*2.34,-2.16],[sign*2.34,2.16],1.075,.71,'heartwood');
  s.section('OpenPavilion');
  openFrame(s,{w:4.1,d:3.8,base:1.075,h:2.91,r:.205});
  s.section('PyramidalGlazedRoof');
  roof(s,{w:6.55,d:6.27,eave:4.47,rise:1.69,ridge:0,lift:.54,tilePitch:.18});
  s.box('bronze',0,6.22,0,.39,.22,.39);pagodaSpire(s,0,6.32,0,.37);
  return s.finish();
}
