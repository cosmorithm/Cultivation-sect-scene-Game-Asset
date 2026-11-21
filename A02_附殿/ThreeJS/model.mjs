import { Workshop, plinth, stairs, timberHall, roof } from '../../ThreeJS共享/architecture.mjs';

// Original measured plate sets the bay grid and east corridor datum.
// The later colour plate guides the glazed roof and recessed central entrance.
export function buildAsset(T) {
  const s = new Workshop(T,'A02_AnnexHall');
  s.section('TwoCourseTerrace');
  plinth(s,15.5,9.65,.55);
  plinth(s,14.9,9.05,.55,0,0,.55);
  stairs(s,3.6,4.63,1.10,5,.36);
  s.section('EastCorridorLanding');
  plinth(s,1.34,2.40,.55,8.15,0);
  s.section('ThreeBayHall');
  timberHall(s,{w:10.80,d:7.20,base:1.10,postH:3.37,r:.30,bays:3,bodyDepth:.76});
  s.section('SingleGlazedRoof');
  roof(s,{w:15.2,d:9.95,eave:5.34,rise:3.12,ridge:7.28,lift:.82,tilePitch:.22});
  return s.finish();
}
