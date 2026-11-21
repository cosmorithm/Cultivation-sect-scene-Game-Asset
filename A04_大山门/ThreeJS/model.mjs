import { Workshop, column, bracket, plinth, roof, signboard, lantern } from '../../ThreeJS共享/architecture.mjs';

export function buildAsset(T) {
  const s = new Workshop(T, 'A04_ThreeBayMountainGate');
  // The four tall plinths leave all three gates clear across the stone approach.
  const stations=[-7.2,-3.0,3.0,7.2],depth=3.50;
  for(const x of stations){
   const inner=Math.abs(x)<4;
   for(const z of [-depth/2,depth/2]){
    s.section('GranitePostSeats');plinth(s,inner?1.28:1.00,1.12,.66,x,z);
    s.section('GateColumns');const h=inner?5.35:4.06;
    column(s,x,.66,z,inner?.36:.29,h);bracket(s,x,.66+h,z,.90);
   }
  }
  for(const [x,width,height,roofW,roofD] of [[0,6,6.63,9.76,5.80],[-5.1,4.2,5.27,5.92,4.73],[5.1,4.2,5.27,5.92,4.73]]){
   s.section('PaintedGateBeams');
   for(const z of [-depth/2,depth/2]){
     s.box('heartwood',x,height-.17,z,width+.45,.43,.44);
     s.box('teal',x,height-.22,z+.13,width-.38,.22,.24);
   }
   s.section('GateRoofs');s.local([x,0,0],0,()=>roof(s,{w:roofW,d:roofD,eave:height,rise:x===0?2.10:1.40,ridge:roofW*.50,lift:x===0?.73:.54,tilePitch:.20}));
  }
  s.section('CentralTablet');
  signboard(s,0,6.36,2.02,2.60,.73);
  s.ringXY('gold',0,6.36,2.15,.23,.026);
  s.section('FourHangingLanterns');
  for(const x of [-5.1,-1.32,1.32,5.1])lantern(s,x,Math.abs(x)>4?3.66:4.72,1.65,.88);
  return s.finish();
}
