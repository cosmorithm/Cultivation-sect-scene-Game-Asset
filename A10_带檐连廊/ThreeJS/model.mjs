import { Workshop, plinth, openFrame, roof } from '../../ThreeJS共享/architecture.mjs';

export function buildAsset(T) {
  const s = new Workshop(T, 'A10_ThreeBayCoveredGallery');
  // The walkway traverses the X axis and meets the annex landing at +0.55 m.
  s.section('ThroughWalkway');
  plinth(s,10.8,3.20,.55);
  s.section('ThreeOpenBays');
  openFrame(s,{w:10.8,d:2.90,base:.55,h:2.87,r:.20,bays:3,tablet:true});
  s.section('ContinuousCorridorRoof');
  roof(s,{w:12.3,d:4.72,eave:3.90,rise:1.18,ridge:8.60,lift:.42,tilePitch:.18});
  return s.finish();
}
