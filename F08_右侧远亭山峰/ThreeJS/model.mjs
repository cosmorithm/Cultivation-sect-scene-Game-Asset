import {rockStudio, mass} from '../../ThreeJS共享/terrain-rock.mjs';

export function buildAsset(T) {
  const rock = rockStudio(T,387,{tone:'slate',grain:2.4});
  // Crag has a tall rear spire and two exposed offset ledges for a distant pavilion.
  mass(rock,{rx:9.7,rz:7.4,h:17,segments:29,rough:.19,sections:[[0,1,1],[.24,.86,.81],[.43,.69,.73,.03,-.02],[.57,.69,.7,.04,-.01],[.73,.49,.52,.13,-.04],[1,.13,.19,.29,-.11]]});
  mass(rock,{x:3.5,z:-2,rx:4.3,rz:4.38,h:22,seed:14,segments:21,rough:.18,sections:[[0,1,1],[.36,.88,.81],[.67,.56,.59,.04,-.13],[.86,.36,.37,.18,-.20],[1,.055,.075,.34,-.24]]});
  mass(rock,{x:-4.7,y:1,z:1,rx:4.9,rz:4.9,h:8.2,moss:.20,seed:9,sections:[[0,1,1],[.64,.77,.83],[1,.69,.72]]});
  for(const [x,y,z,h,r,dx] of [[2.8,10.2,-.6,10.6,2,.54],[5.0,7.8,-2.1,8.9,1.9,-.14],[-3.4,3.0,1.2,8.3,1.74,.48]]){
    mass(rock,{x,y,z,rx:r,rz:r*.74,h,seed:Math.round(h*3),segments:15,rough:.26,
      sections:[[0,1,1],[.43,.91,.72,dx*.31],[.70,.62,.56,dx*.54],[.91,.49,.36,dx*.85],[1,.12,.11,dx]]});
  }
  return rock.finish('F08');
}

export const presentation = {studioLightScale:.83,background:0xcad3d5,floorColor:0x8d9794};
