import { Workshop, bracket } from '../../ThreeJS共享/architecture.mjs';

export function buildAsset(T) {
  const s = new Workshop(T, 'B09_DougongAssembly');
  s.section('ColumnCap');
  s.cylinder('stone',0,0,0,.30,.32,.13,24);
  s.cylinder('bronze',0,.12,0,.28,.28,.09,24);
  s.section('StackedArms');
  bracket(s,0,.20,0,1.42);
  s.section('CantileverAndSeat');
  s.profile('heartwood',[[-.99,1.02],[-.78,.88],[-.36,.87],[-.28,1.01],[.28,1.01],[.36,.87],[.78,.88],[.99,1.02],[1.085,1.16],[.78,1.14],[.62,1.05],[-.62,1.05],[-.78,1.14],[-1.085,1.16]],.25,.02);
  s.box('lacquer',0,1.40,0,1.52,.24,.49);
  s.box('teal',0,1.40,.253,1.16,.17,.035);
  s.scroll('gold',0,1.35,.282,.73,.15,.011);
  return s.finish();
}
