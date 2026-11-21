import { Workshop, tileSection } from '../../ThreeJS共享/architecture.mjs';

export function buildAsset(T) {
  const s = new Workshop(T, 'B02_CeramicTileSet');
  s.section('RoundPanTile');
  tileSection(s,{x:-.37,span:.26,length:.53,height:.115});
  s.beam('bronze',[-.37,.112,.253],[-.37,.112,.285],.132,.138,32);
  s.ringXY('gold',-.37,.112,.292,.109,.009);
  s.scroll('gold',-.37,.105,.290,.18,.091,.008);
  s.box('heartwood',-.37,.10,-.275,.12,.07,.08);
  s.section('ConcaveChannel');
  tileSection(s,{x:0,span:.29,length:.53,height:.075,concave:true});
  s.box('heartwood',0,.047,-.28,.13,.049,.08);
  s.section('LapTile');
  tileSection(s,{x:.37,span:.29,length:.495,height:.036});
  s.box('bronze',.37,.031,.249,.286,.030,.030);
  s.box('heartwood',.37,.05,-.253,.14,.042,.09);
  return s.finish();
}
