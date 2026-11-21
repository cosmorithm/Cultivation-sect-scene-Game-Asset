import { Workshop, plinth, stairs, timberHall, roof } from '../../ThreeJS共享/architecture.mjs';

export function buildAsset(T) {
  const s = new Workshop(T, 'A09_CourtyardHall');
  s.section('CourtyardThreshold');
  plinth(s,11.85,6.51,.42);stairs(s,3.22,3.30,.42,3,.24);
  s.section('PlasterAndRedTimber');
  timberHall(s,{w:9.81,d:5.29,base:.42,postH:3.03,r:.235,bays:3,bodyDepth:.89,court:true,medallion:true});
  s.section('CourtyardRoof');
  roof(s,{w:13.15,d:7.55,eave:4.0,rise:1.75,ridge:8.25,lift:.54,tilePitch:.20});
  return s.finish();
}
