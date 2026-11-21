import { skyTexture } from '../../ThreeJS共享/sky-lighting.mjs';

export const presentation={floor:false,background:0xcbddeb,direction:[-.45,.38,1.50],topDirection:[.15,1,.42]};
export function buildAsset(T){
  const root=new T.Group();root.name='I04_SkyGradient';
  const map=skyTexture(T,.14,.27,[[231,223,222],[123,171,223],[45,107,183],[255,177,134],[255,236,189]]);
  const material=new T.MeshBasicMaterial({name:'Unlit_directional_sky',map,side:T.DoubleSide,toneMapped:false});
  const dome=new T.Mesh(new T.SphereGeometry(35,96,32,0,Math.PI*2,0,Math.PI*.5),material);
  dome.name='SkyDome_horizon_equator';root.add(dome);
  return root;
}
