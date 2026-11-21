import { Workshop, moulding } from '../../ThreeJS共享/architecture.mjs';

export function buildAsset(T) {
  const s = new Workshop(T, 'B17_CarvedStoneEdge');
  s.section('RepeatableCornice');
  moulding(s,0,0,0,2.60,.49,.29);
  s.section('CloudFrieze');
  s.scroll('stonePale',0,.158,.098,2.21,.21,.017);
  s.ringXY('stonePale',0,.199,.102,.117,.018);
  for(const sign of [-1,1]){
   s.box('carving',sign*1.19,.218,.098,.012,.280,.021);
   s.rod('stonePale',[[sign*.15,.14,.112],[sign*.43,.166,.112],[sign*.81,.107,.112],[sign*1.07,.167,.112]],.016,6);
  }
  return s.finish();
}
