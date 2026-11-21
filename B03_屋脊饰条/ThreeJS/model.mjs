import { Workshop, framePanel } from '../../ThreeJS共享/architecture.mjs';

export function buildAsset(T) {
  const s = new Workshop(T, 'B03_RidgeTrims');
  // Two joinable ridge lengths, one straight and one rising into a hip terminal.
  for(const [row,z] of [[0,-.34],[1,.35]]){
   s.section(row?'RisingHip':'StraightRidge');
   const pts=[];
   for(let i=0;i<=16;i++){
     const t=i/16;pts.push([-1.65+3.30*t,.19+(row?.61*t**3.8:0),z]);
   }
   s.rod('bronze',pts,.133,8);
   s.rod('gold',pts.map(([x,y,zz])=>[x,y+.107,zz]),.061,8);
   s.rod('heartwood',pts.map(([x,y,zz])=>[x,y-.066,zz]),.107,8);
   for(const x of [-1.44,-.59,.38,1.36]){
    const t=(x+1.65)/3.30,y=.19+(row?.61*t**3.8:0);
    s.box('gold',x,y,z,.094,.31,.30);
   }
   for(const x of [-.97,-.03,.90]){
    const t=(x+1.65)/3.30,y=.19+(row?.61*t**3.8:0);
    s.scroll('gold',x,y-.06,z+.128,.53,.13,.012);
   }
  }
  return s.finish();
}
