import { Workshop, lattice, framePanel } from '../../ThreeJS共享/architecture.mjs';

export function buildAsset(T) {
  const s = new Workshop(T, 'B11_CasementWindow');
  s.section('WindowCasing');
  for(const sign of [-1,1]){
   s.box('heartwood',sign*.905,.825,0,.12,1.65,.22);
   s.box('bronze',sign*.91,1.54,.119,.050,.05,.022);
  }
  s.box('heartwood',0,1.58,0,1.93,.14,.23);s.box('heartwood',0,.11,.04,1.97,.17,.34);
  for(const x of [-.65,0,.65])s.box('walnut',x,.045,.12,.17,.09,.22);
  s.section('CasementPair');
  for(const sign of [-1,1]){
   const x=sign*.435;
   lattice(s,x,.985,.04,.84,.95);
   framePanel(s,x,.35,.03,.84,.27);
   s.ringXY('bronze',sign*.09,.86,.15,.035,.008);
  }
  return s.finish();
}
