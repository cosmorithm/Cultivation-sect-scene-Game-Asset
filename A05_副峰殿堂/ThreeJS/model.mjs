import { Workshop, plinth, stairs, timberHall, roof, rail } from '../../ThreeJS共享/architecture.mjs';

export function buildAsset(T) {
  const s = new Workshop(T, 'A05_SecondaryPeakHall');
  s.section('TwinApproachTerrace');
  plinth(s,19.8,12.4,1.05);
  for(const x of [-3.05,3.05])stairs(s,2.62,6.24,1.05,6,.29,x);
  rail(s,[-9.5,-6],[9.5,-6],1.05,.66);
  for(const sign of [-1,1]){
   rail(s,[sign*9.50,-6],[sign*9.50,5.9],1.05,.66);
   rail(s,[sign*4.64,5.90],[sign*9.50,5.90],1.05,.66);
  }
  s.section('DeepPorticoHall');
  timberHall(s,{w:16.5,d:9.60,base:1.05,postH:3.73,r:.31,bays:5,bodyDepth:.70});
  s.section('LowerFlyingEaves');
  roof(s,{w:20.65,d:13.34,eave:5.51,rise:2.12,ridge:11.6,lift:.87});
  s.section('UpperHall');
  timberHall(s,{w:12.34,d:5.10,base:6.54,postH:1.37,r:.15,bays:5,bodyDepth:.95});
  s.section('UpperRoof');
  roof(s,{w:16.63,d:8.12,eave:8.19,rise:2.66,ridge:8.82,lift:.71});
  s.section('EntranceGable');
  // A fully developed entrance pediment faces the steps; its high triangular
  // face, central ridge and sloping front verges interrupt the long lower eave.
  const half=2.68, back=4.10, front=7.35, baseY=5.42, crown=6.93;
  const sectionPoint=t=>[half*t,baseY+(crown-baseY)*(1-t)**1.65+.18*t**6];
  for(const sign of [-1,1]){
    const verts=[], indices=[], segments=20;
    for(const z of [front,back])for(let i=0;i<=segments;i++){
      const [x,y]=sectionPoint(i/segments); verts.push(sign*x,y,z);
    }
    for(let i=0;i<segments;i++){
      const a=i,b=i+1,c=i+segments+1,d=c+1;
      if(sign>0)indices.push(a,b,c,b,d,c);else indices.push(a,c,b,b,c,d);
    }
    const g=new T.BufferGeometry();
    g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.setIndex(indices);g.computeVertexNormals();s.emit(g,'glaze');
    for(let j=0;j<=16;j++){
      const z=back+(front-back)*j/16;
      s.rod('tileRound',Array.from({length:7},(_,i)=>{const [x,y]=sectionPoint(i/6);return [sign*x,y+.025,z];}),.037,6);
    }
    const outline=Array.from({length:10},(_,i)=>{const [x,y]=sectionPoint(i/9);return [sign*x,y];});
    s.profile('heartwood',[[0,baseY-.12],...outline,[sign*half,baseY-.12]],.19,front-.06);
    s.rod('gold',outline.map(([x,y])=>[x,y+.055,front+.055]),.058,7);
  }
  s.rod('bronze',[[0,crown+.07,back],[0,crown+.07,front-.17],[0,crown+.18,front+.08]],.076,8);
  s.box('heartwood',0,baseY-.13,front-.09,2*half,.19,.28);
  s.scroll('gold',0,baseY+.27,front+.065,2.15,.76,.026);

  return s.finish();
}
