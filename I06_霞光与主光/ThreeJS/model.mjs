import { Workshop, plinth, stairs, timberHall, roof } from '../../ThreeJS共享/architecture.mjs';
import { colourLight, mountain } from '../../ThreeJS共享/sky-lighting.mjs';

export const presentation={background:0x69758e,floor:false,studioLightScale:.12,direction:[.85,.48,1.62]};
export function buildAsset(T){
  // A small architectural light study lets the warm and cool responses be
  // compared on the same stone stairs, blue ceramic and cinnabar columns.
  const s=new Workshop(T,'I06_DawnKeyAndFill');
  s.section('StoneLightStudy');
  plinth(s,9.40,6.15,.66);stairs(s,2.60,3.12,.66,4,.30);
  s.section('TempleReference');
  timberHall(s,{w:6.82,d:4.48,base:.66,postH:2.29,r:.17,bays:3,bodyDepth:.76});
  roof(s,{w:8.6,d:5.83,eave:3.48,rise:1.77,ridge:4.17,lift:.42,tilePitch:.29});
  const root=s.finish();
  const ridge=mountain(T,{name:'ValleyStone',x:0,z:-.34,scale:1.28,seed:7,depth:.19});
  ridge.scale.y=.27;ridge.position.y=-.9;root.add(ridge);
  const warm=colourLight(T,'Amber_key_35deg',0xffb16d,3.35,[.70,-.70,-.64]);
  const cool=colourLight(T,'Blue_sky_fill',0x8db6ff,1.55,[-.57,-.43,.80]);
  root.add(warm,cool);
  return root;
}
