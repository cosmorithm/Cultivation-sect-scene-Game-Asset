import { Workshop, framePanel } from '../../ThreeJS共享/architecture.mjs';

export function buildAsset(T) {
  const s = new Workshop(T, 'B04_SweptEaveFinial');
  s.section('FootSocket');
  s.box('bronze',-.34,.08,0,1.20,.16,.41);
  s.box('heartwood',-.34,.17,0,1.12,.095,.32);
  s.scroll('gold',-.37,.087,.217,.85,.105,.013);
  s.section('RolledWing');
  const outline=[[-.89,.19],[-.54,.19],[-.08,.24],[.26,.37],[.57,.60],[.79,.94],[.95,1.42],[1.04,1.86],[.87,1.43],[.59,1.08],[.28,.85],[-.02,.68],[-.45,.54],[-.86,.46]];
  s.profile('bronze',outline,.26,0);
  const inlay=outline.map(([x,y])=>[(x-.035)*.97,(y-.75)*.84+.75]);
  s.profile('teal',inlay,.276,0);
  for(const z of [-.15,.15]){
   s.rod('gold',outline.slice(0,8).map(([x,y])=>[x,y,z]),.030,7);
   s.rod('gold',outline.slice(7).map(([x,y])=>[x,y,z]),.030,7);
   s.scroll('gold',-.32,.48,z,.66,.29,.028);
  }
  s.lathe('gold',1.04,1.80,0,[[0,0],[.055,.008],[.070,.06],[.045,.116],[0,.13]],16);
  return s.finish();
}
