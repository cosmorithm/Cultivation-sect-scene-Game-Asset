import { Workshop, lattice, framePanel } from '../../ThreeJS共享/architecture.mjs';

export function buildAsset(T) {
  const s = new Workshop(T, 'B10_PairedLatticeDoors');
  s.section('DoorFrame');
  for(const sign of [-1,1])s.box('lacquer',sign*.97,1.43,0,.15,2.86,.23);
  s.box('heartwood',0,2.76,0,2.12,.20,.25);s.box('teal',0,2.78,.13,1.65,.10,.025);
  s.scroll('gold',0,2.75,.16,.91,.10,.014);
  s.section('TwoOpenworkLeaves');
  for(const sign of [-1,1]){
   const x=sign*.451;
   framePanel(s,x,.45,.015,.868,.87);
   lattice(s,x,1.75,.055,.864,1.68,false);
   for(const yy of [.29,2.01])s.box('bronze',sign*.873,yy,.12,.11,.072,.035);
   s.box('bronze',sign*.087,1.00,.135,.11,.20,.033);
   s.ringXY('bronze',sign*.085,.985,.165,.046,.009);
  }
  return s.finish();
}
