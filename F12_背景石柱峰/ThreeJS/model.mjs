import {rockStudio, mass} from '../../ThreeJS共享/terrain-rock.mjs';

export function buildAsset(T) {
  const rock = rockStudio(T,575,{tone:'slate',grain:2.3});
  // Twinned needles rise from a shared weathered foot. The shorter tip forks left.
  for(const [x,z,h,rx,rz,dx] of [[.58,0,23,2.45,2.3,.14],[-1.17,-.5,19.8,1.86,1.85,-.23]]){
    mass(rock,{x,z,rx,rz,h,seed:Math.round(h*5),segments:21,rough:.21,
      sections:[[0,1,1],[.14,.88,.88],[.32,.69,.71,.10,0],[.57,.59,.65,dx*.09,-.06],[.78,.48,.45,dx*.6,-.1],[.93,.22,.24,dx*.83],[1,.044,.032,dx]]});
  }
  mass(rock,{rx:4.6,rz:3.2,h:3.4,seed:16,sections:[[0,1,1],[.42,.81,.84],[1,.53,.61]]});
  for(const [x,z,h] of [[-2.1,.63,13.9],[1.12,1.1,14],[-.91,-1.3,11]]){
    mass(rock,{x,z,rx:.83,rz:.79,h,seed:Math.round(x*9)+81,segments:13,rough:.28,
      sections:[[0,1,1],[.41,.8,.81],[.78,.63,.46,.14,-.15],[1,.15,.15,.29,-.19]]});
  }
  return rock.finish('F12');
}

export const presentation = {studioLightScale:.83,background:0xcad3d5,floorColor:0x8d9794};
