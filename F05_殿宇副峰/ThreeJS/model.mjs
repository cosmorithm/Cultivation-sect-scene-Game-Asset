import {rockStudio, mass} from '../../ThreeJS共享/terrain-rock.mjs';

export function buildAsset(T) {
  const rock = rockStudio(T,246,{tone:'shale',grain:2.8});
  const spine=[[0,.04,.04,-.16,.20],[.24,.56,.55,-.12,.16],[.49,.81,.91,-.05,.01],[.61,1,1],[.68,.92,.98]];
  mass(rock,{rx:10,rz:15,h:25,segments:28,rough:.18,moss:.23,sections:spine});
  mass(rock,{x:.5,y:13,z:-3,rx:7.6,rz:10.3,h:6.5,segments:23,moss:.30,sections:[[0,.98,1],[.23,1,1],[.78,.96,.89],[1,.89,.90]]});
  mass(rock,{x:2.5,y:16,z:-6.2,rx:5,rz:6.2,h:10.6,segments:19,moss:.16,sections:[[0,1,1],[.43,.91,.87,.10,-.04],[.70,.62,.72,.17,-.08],[1,.26,.37,.30,-.20]]});
  return rock.finish('F05');
}

export const presentation = {studioLightScale:.83,background:0xcad3d5,floorColor:0x8d9794};
