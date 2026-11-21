import { Workshop, plinth, stairs, openFrame, roof, framePanel } from '../../ThreeJS共享/architecture.mjs';

export function buildAsset(T) {
  const s = new Workshop(T, 'A11_RoofedLowStand');
  s.section('LowPodium');
  plinth(s,4.74,2.76,.44);stairs(s,1.65,1.43,.44,3,.22);
  s.section('InsetApron');
  s.box('stone',0,.95,0,3.87,1.01,2.03);
  framePanel(s,0,.94,1.035,3.64,.78,'lacquer');
  s.section('ShortRoofPosts');
  openFrame(s,{w:3.71,d:1.89,base:1.45,h:1.1,r:.16});
  s.section('ShallowCanopy');
  roof(s,{w:5.50,d:3.22,eave:2.92,rise:1.04,ridge:3.15,lift:.36,tilePitch:.15});
  return s.finish();
}
