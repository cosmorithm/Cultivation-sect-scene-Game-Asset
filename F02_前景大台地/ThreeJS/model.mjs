import {rockStudio, mass} from '../../ThreeJS共享/terrain-rock.mjs';

export function buildAsset(T) {
  const rock = rockStudio(T,105,{tone:'shale',grain:3.0});
  // The shallow eastern bowl and its front spillway form the pool socket.
  const pool=(x,z)=>-.40*Math.exp(-((x-.52)**2/.11+(z+.08)**2/.21))-.15*Math.exp(-((x-.58)**2/.022+(z-.66)**2/.14));
  mass(rock,{rx:23,rz:16,h:9,segments:42,rough:.16,moss:.16,capRelief:.015,topShape:pool,
    sections:[[0,.89,.84,-.035,0],[.13,.91,.9,-.01,.02],[.31,1,.99,.006,0],[.54,.975,.99,.015,-.01],[.83,1,.98,0,.006],[1,.975,.96,0,0]]});
  for(const [x,z] of [[-15,-6],[-11,9],[-20,1]]){
    mass(rock,{x,y:6.1,z,rx:3.4,rz:4.6,h:2.75,moss:.23,segments:13,capRelief:.025,sections:[[0,.9,1],[.50,1,.91],[1,.77,.81]]});
  }
  // Broken lips around the dry basin, with its front sill cut down for overflow.
  for(const [x,z,r,h] of [[16.2,-4.9,3.0,2.20],[11.7,-8.4,3.6,1.82],[5.5,-5.8,2.7,1.36],[17.6,.92,2.8,1.42]]){
    mass(rock,{x,y:7.19,z,rx:r,rz:r*.52,h,segments:14,seed:Math.round(x*3),rough:.29,capRelief:.04,
      sections:[[0,1,1],[.44,.97,.89],[.83,.77,.64,.17,-.09],[1,.45,.47,.25,-.12]]});
  }
  return rock.finish('F02');
}

export const presentation = {studioLightScale:.83,background:0xcad3d5,floorColor:0x8d9794, direction:[.66,1.02,1.57]};
