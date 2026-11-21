import { Workshop, column, signboard } from '../../ThreeJS共享/architecture.mjs';

export function buildAsset(T) {
  const s = new Workshop(T, 'B12_PlasterWallBay');
  s.section('Limewall');
  s.box('lime',0,1.48,0,3.42,2.5,.25);
  s.box('stone',0,.16,0,3.75,.32,.34);
  s.section('Framing');
  for(const x of [-1.70,1.70])column(s,x,0,0,.158,2.76);
  s.box('heartwood',0,2.81,0,3.76,.25,.34);
  signboard(s,0,2.81,.183,1.06,.15);
  for(const sign of [-1,1])s.profile('walnut',[[sign*1.58,2.58],[sign*1.58,2.24],[sign*1.47,2.23],[sign*1.40,2.39],[sign*1.24,2.43],[sign*1.17,2.58]],.22,0);
  return s.finish();
}
