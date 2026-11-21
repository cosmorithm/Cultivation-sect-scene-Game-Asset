import {rockStudio, mass} from '../../ThreeJS共享/terrain-rock.mjs';

export function buildAsset(T) {
  const rock = rockStudio(T,857,{tone:'blue',grain:0.32});
  const stones=[[-.83,0,.50,.44,.36],[.52,-.39,.39,.31,.49],[1,.22,.29,.25,.29],[-.12,.49,.24,.19,.15],[-1.27,.24,.17,.13,.12],[.21,-.72,.12,.11,.095],[.81,.72,.145,.095,.11]];
  for(const [i,[x,z,rx,rz,h]] of stones.entries()){
    mass(rock,{x,z,rx,rz,h,rotation:.87*i,seed:19*i+2,segments:8+i%4,rough:.36,capRelief:0,moss:.035,
      sections:[[0,.82,.88],[.20,1,1],[.64,.75,.82,.15,-.12],[1,.27,.35,.34,-.19]]});
  }
  return rock.finish('F18');
}

export const presentation = {studioLightScale:.83,background:0xcad3d5,floorColor:0x8d9794};
