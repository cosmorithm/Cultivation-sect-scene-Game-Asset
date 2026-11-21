import { Workshop, plinth, stairs, timberHall, roof, pagodaSpire, rail } from '../../ThreeJS共享/architecture.mjs';

export function buildAsset(T) {
  const s = new Workshop(T, 'A03_FourTierPagoda');
  s.section('WhiteStonePlatform');
  plinth(s,10.4,10.4,1.15);
  stairs(s,3.3,5.28,1.15,6);
  rail(s,[-5,-5],[5,-5],1.15);
  for(const sign of [-1,1]){
    rail(s,[sign*5,-5],[sign*5,5],1.15);
    rail(s,[sign*1.86,5],[sign*5,5],1.15);
  }
  // Each enclosed storey is narrower. The square hip roofs culminate in a bronze finial.
  const tiers=[
    {body:7.50,y:1.15,h:3.10,eave:4.95,roof:11.7,rise:2.75},
    {body:6.48,y:6.05,h:2.20,eave:8.85,roof:10.30,rise:2.40},
    {body:5.36,y:9.72,h:2.00,eave:12.37,roof:8.95,rise:2.08},
    {body:4.30,y:13.06,h:1.86,eave:15.58,roof:7.37,rise:2.76}
  ];
  for(const [i,t] of tiers.entries()){
    s.section('Gallery_'+(i+1));
    timberHall(s,{w:t.body,d:t.body*.90,base:t.y,postH:t.h,r:.20,bays:3,bodyDepth:.89,medallion:i===0});
  if(i>0){
    s.section('Balcony_'+(i+1));
    const x=t.body*.5+.28,z=t.body*.45+.28;
    s.box('heartwood',0,t.y+.035,0,2*x+.20,.15,2*z+.20);
    rail(s,[-x,-z],[x,-z],t.y+.10,.51,'heartwood');
    rail(s,[-x,z],[x,z],t.y+.10,.51,'heartwood');
    for(const side of [-1,1])rail(s,[side*x,-z],[side*x,z],t.y+.10,.51,'heartwood');
  }
    s.section('PyramidalRoof_'+(i+1));
    roof(s,{w:t.roof,d:t.roof,eave:t.eave,rise:t.rise,ridge:0,lift:.62,tilePitch:.28});
  }
  s.section('NineRingCrown');
  pagodaSpire(s,0,18.30,0,3.55);
  return s.finish();
}
