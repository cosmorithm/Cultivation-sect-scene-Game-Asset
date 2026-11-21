import {workshop} from '../../ThreeJS共享/site-craft.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  const w=.73,h=2.25;
  function cloth(u,v,lift=0){
    let z=.038*Math.sin(u*4.6+v*.73)+.018*Math.sin(v*5.8-u*5)*v;
    return [(u-.5)*w,.13+(1-v)*h - .19*v**7*(1-Math.min(1,Math.abs(u-.5)*2)),z+lift];
  }
  k.materials.silk.side=T.DoubleSide;
  k.materials.motif.side=T.DoubleSide;
  function strip(key,u0,u1,v0,v1,lift){
    const nx=8,ny=14,p=[],f=[];
    for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++)p.push(cloth(u0+(u1-u0)*i/nx,v0+(v1-v0)*j/ny,lift));
    for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+1,c=a+nx+1;f.push([a,c,b],[b,c,c+1]);}
    k.mesh(key,p,f,true);
  }
  strip('silk',0,1,0,1,0);
  for(const delta of [-.003,.003]){
    for(const [a,b] of [[.008,.043],[.957,.992],[.09,.102],[.898,.91]])strip('motif',a,b,.008,.995,delta);
    for(const [a,b] of [[.018,.040],[.950,.981]])strip('motif',.04,.96,a,b,delta);
    const relief=.008*Math.sign(delta);
    const ornament=Array.from({length:49},(_,i)=>{const a=i/48*Math.PI*2;return cloth(.5+.295*Math.cos(a),.34+.096*Math.sin(a),relief);});
    k.rod('motif',ornament,.012,7,false);
    for(let j=0;j<4;j++){
      const a=j*Math.PI/2,form=[[.03,0],[.09,.04],[.145,.07],[.16,.02],[.143,-.025],[.1,.002]];
      k.rod('motif',form.map(([x,y])=>cloth(.5+(x*Math.cos(a)-y*Math.sin(a))/w,.34+(x*Math.sin(a)+y*Math.cos(a))/h,relief)),.011,6);
    }
  }
  for(const x of [-.275,.275]){
    k.add(new T.TorusGeometry(.058,.014,8,20),'bronze',x,2.436,0);
    k.box('motif',x,2.366,0,.050,.089,.027);
  }
  return k.finish('E05');
}
