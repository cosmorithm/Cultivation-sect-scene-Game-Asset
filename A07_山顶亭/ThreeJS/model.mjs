import { Workshop, plinth, stairs, openFrame, roof, pagodaSpire } from '../../ThreeJS共享/architecture.mjs';

export function buildAsset(T) {
  const s = new Workshop(T, 'A07_SummitPavilion');
  s.section('SolidSummitPlinth');
  plinth(s,5.05,4.95,.74);stairs(s,2.32,2.53,.74,4,.30);
  s.section('StoneSeats');
  for(const sign of [-1,1])s.box('stone',sign*1.77,.96,-.13,.32,.43,2.65);
  s.box('stonePale',0,1.16,-1.70,3.36,.18,.43);
  s.section('OpenLookout');
  openFrame(s,{w:3.73,d:3.54,base:.74,h:3.08,r:.25});
  s.section('SquareCanopy');
  roof(s,{w:6.55,d:6.34,eave:4.30,rise:1.82,ridge:0,lift:.57,tilePitch:.18});
  pagodaSpire(s,0,6.13,0,.88);
  return s.finish();
}
