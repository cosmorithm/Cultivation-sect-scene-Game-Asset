import { Workshop, plinth, stairs, openFrame, roof } from '../../ThreeJS共享/architecture.mjs';

export function buildAsset(T) {
  const s = new Workshop(T, 'A08_SmallGatehouse');
  s.section('GateThreshold');
  plinth(s,6.12,3.25,.42);stairs(s,2.65,1.69,.42,3,.24);
  s.section('ClearGateway');
  openFrame(s,{w:4.17,d:2.24,base:.42,h:3.46,r:.28,tablet:true});
  s.section('SingleRidgeRoof');
  roof(s,{w:7.20,d:4.46,eave:4.54,rise:1.75,ridge:3.63,lift:.62,tilePitch:.17});
  return s.finish();
}
