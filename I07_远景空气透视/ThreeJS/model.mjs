import { mountain } from '../../ThreeJS共享/sky-lighting.mjs';

export const presentation={floor:false,background:0xd0e1ed,direction:[.51,.43,1.59],topDirection:[.25,1,.45]};
export function buildAsset(T){
  const root=new T.Group();root.name='I07_AerialPerspective';
  // The four ridges share their characteristic two spires. Moving them
  // through the valley removes warm rock colour and local contrast.
  const bands=[
    {name:'Near_ochre_ridge',x:-2.35,z:5.10,scale:.91,seed:5,depth:.045,haze:0xb8d1df},
    {name:'Mid_neutral_ridge',x:2.58,z:.49,scale:1.02,seed:5,depth:.31,haze:0xacc5d6},
    {name:'Far_blue_ridge',x:-1.28,z:-4.1,scale:1.13,seed:5,depth:.59,haze:0xa9c5dd},
    {name:'Remote_mist_ridge',x:2.0,z:-9.62,scale:1.23,seed:5,depth:.83,haze:0xc6d9e9}
  ];
  for(const band of bands)root.add(mountain(T,{...band,shade:0x445761,edge:0xa58a66,foot:0x52696d,fadeBase:true}));
  return root;
}
