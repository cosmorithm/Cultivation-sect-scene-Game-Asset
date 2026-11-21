import { Workshop, signboard, holeTab } from '../../ThreeJS共享/architecture.mjs';

export function buildAsset(T) {
  const s = new Workshop(T, 'B13_HangingPlaque');
  s.section('BlankTealInscriptionField');
  signboard(s,0,.44,0,2.90,.69);
  s.box('heartwood',0,.79,0,2.99,.095,.185);
  s.section('PiercedMountingEars');
  for(const x of [-.93,.93])holeTab(s,x,.81,-.014,.20,.18,.114);
  s.section('GildedCorners');
  for(const sign of [-1,1])s.rod('gold',[[sign*1.39,.65,.156],[sign*1.28,.64,.156],[sign*1.25,.59,.156],[sign*1.26,.54,.156]],.026,7);
  return s.finish();
}
