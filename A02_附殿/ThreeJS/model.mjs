import { Workshop, plinth, stairs, timberHall, roof } from '../../ThreeJS共享/architecture.mjs';

import { returnFret, mountainGables, smallChiwen, carvedBrackets } from '../../ThreeJS共享/annex-craft.mjs';

export const presentation={detailEye:[4.9,3.6,11.2],detailTarget:[0,3.45,2.9]};

// Original measured plate sets the bay grid and east corridor datum.
// The later colour plate guides the glazed roof and recessed central entrance.
export function buildAsset(T) {
  const s = new Workshop(T,'A02_AnnexHall');
  s.section('TwoCourseTerrace');
  plinth(s,15.5,9.65,.55);
  plinth(s,14.9,9.05,.55,0,0,.55);
  stairs(s,3.6,4.63,1.10,5,.36);
  s.section('EastCorridorLanding');
  plinth(s,1.34,2.40,.55,8.15,0);
  s.section('ThreeBayHall');
  timberHall(s,{w:10.80,d:7.20,base:1.10,postH:3.37,r:.30,bays:3,bodyDepth:.76,customWindow:returnFret});
  s.section('SingleGlazedRoof');
  const roofSize={w:15.2,d:9.95,eave:5.34,rise:3.12,ridge:7.80,lift:.82,tilePitch:.205,gable:.38};
  roof(s,roofSize);
  s.section('TimberMountainGables');
  mountainGables(s,{width:roofSize.w,depth:roofSize.d,eave:roofSize.eave,rise:roofSize.rise,ridge:roofSize.ridge,breakV:1-roofSize.gable,lift:roofSize.lift});
  for(const sign of [-1,1])smallChiwen(s,sign*roofSize.ridge*.50,roofSize.eave+roofSize.rise+.04,0,sign);
  s.section('PolychromeBracketArms');
  carvedBrackets(s);
  s.section('CarvedDoorPillowsAndPulls');
  const doorZ=1.992;
  for(const sign of [-1,1]){
    const x=sign*1.46;
    s.box('stonePale',x,1.222,doorZ+.17,.235,.244,.46);
    s.local([x,1.16,doorZ+.411],0,()=>s.scroll('carving',0,.064,0,.175,.11,.010));
    s.local([sign*.210,2.43,doorZ+.29],0,()=>{
      s.profile('bronze',[[-.105,0],[-.121,.083],[-.059,.122],[0,.118],[.059,.122],[.121,.083],[.105,0],[.043,-.057],[-.043,-.057]],.030,.0);
      s.ringXY('gold',0,-.022,.043,.084,.016);
    });
    for(const yy of [1.44,2.02]){
      s.box('heartwood',sign*.71,yy,doorZ+.199,1.23,.033,.048);
      s.box('bronze',sign*.71,yy+.026,doorZ+.208,1.08,.010,.018);
    }
  }
  return s.finish();
}
