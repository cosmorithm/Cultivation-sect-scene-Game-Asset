import {rockStudio, mass} from '../../ThreeJS共享/terrain-rock.mjs';

export function buildAsset(T) {
  const rock = rockStudio(T,152,{tone:'slate',grain:2.5});
  // Three natural benches rise towards the rear corner and can each receive a building.
  for(const [x,y,z,rx,rz,h,seed] of [[0,0,0,15,11,2.6,2],[-1.1,2.27,-1.8,12.0,8.5,2.8,5],[-2.15,4.72,-3.52,8.7,5.5,2.9,8]]){
    mass(rock,{x,y,z,rx,rz,h,seed,segments:35,rough:.135,moss:.23,capRelief:.019,
      sections:[[0,.97,.95],[.16,1,1],[.71,.97,.95],[.93,.996,.98],[1,.96,.95]]});
  }
  for(const [x,z,r,h] of [[-10.8,3.7,3.0,2.8],[7.7,2.2,3.7,3.3],[5.4,-2.7,2.5,4.3],[-5.7,6.8,3.2,1.35]]){
    mass(rock,{x,z,rx:r,rz:r*.74,h,seed:Math.round(x*2)+32,rough:.24,segments:15,moss:.31,
      sections:[[0,1,1],[.37,.95,.90],[.77,.73,.71,.06,-.1],[1,.49,.54,.08,-.15]]});
  }
  return rock.finish('F03');
}

export const presentation = {studioLightScale:.83,background:0xcad3d5,floorColor:0x8d9794, direction:[.66,1.02,1.57]};
