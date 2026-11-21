import {createKit,seeded} from './nature-mesh.mjs';

function plant(T,d) {
  const k=createKit(T),g=new T.Group(),rng=seeded(d.seed);g.name=d.name;
  return {k,g,rng,leaves:k.batch('Leaves'),stems:k.batch('Stems'),flowers:k.batch('Petals_and_pollen')};
}
function finish({g,leaves,stems,flowers}) {stems.finish(g);leaves.finish(g);flowers.finish(g);return g;}

export function rosette(T,d) {
  const p=plant(T,d),{k,rng,leaves,stems}=p;
  for(const [x,z,scale,count] of d.clumps){
    for(let i=0;i<count;i++){
      const angle=(i*2.39996+rng()*.36),inside=i/count;
      const len=scale*(.83+.28*rng()),horizontal=len*(.92-.63*inside);
      const base=k.vec(x+.045*scale*Math.cos(angle),.012*scale,z+.045*scale*Math.sin(angle));
      k.blade(leaves,base,angle,horizontal,len*((d.wet?.040:.035)+.020*rng()),len*(.40+.62*inside),len*(inside*.20-.24),d.baseColor,k.mix(d.tipColor,0xe2d787,rng()*.26),.18*(rng()-.5));
      if(d.wet && i%4===0)k.blade(leaves,base,angle+.2,horizontal*.83,len*.115,len*.31,-len*.19,0x326c44,0x95ad62,-.22);
    }
    for(let i=0;i<4;i++){
      const az=i*2.3999+rng()*.6,ss=scale*(.75+.22*rng());
      k.blade(leaves,k.vec(x,.008,z),az,ss*.22,ss*.021,ss*.94,ss*.17,0x315b32,d.tipColor,-.14);
    }
    if(d.wet){
      const a=k.vec(x,0,z),b=k.vec(x+.08*scale,scale*.83,z+.11*scale),c=k.vec(x+.13*scale,scale*1.29,z+.19*scale);
      k.bough(stems,[a,b,c],[.025*scale,.018*scale,.008*scale],0x4f7236,0x928c42,6,7);
      for(let j=0;j<45;j++){
        const t=j/45,cen=b.clone().lerp(c,t),yaw=j*2.4;
        k.ellipsoid(stems,cen.clone().add(k.vec(.029*scale*Math.cos(yaw),0,.029*scale*Math.sin(yaw))),[.026*scale,.037*scale,.023*scale],0x715b32,0xa99556,6,4);
      }
    }
  }
  return finish(p);
}
export function shrub(T,d){
  const p=plant(T,d),{k,rng,leaves,stems}=p;
  for(let i=0;i<d.branches;i++){
    const az=i*2.39996+.14*rng(),r=.32+.95*Math.sqrt((i+.3)/d.branches);
    const end=k.vec(r*Math.cos(az),d.height*(1.03-.32*r+.10*rng()),.8*r*Math.sin(az));
    const root=k.vec(.14*Math.cos(az),.01,.14*Math.sin(az));
    const knee=k.vec(end.x*.45,.3+.14*rng(),end.z*.54);
    k.bough(stems,[root,knee,end],[.075,.041,.012],0x695746,0x9d8964,7);
    for(let j=0;j<4;j++){
      const a=az+j*1.79,dist=.24+.12*rng(),q=end.clone().add(k.vec(dist*Math.cos(a),.08+rng()*.17,dist*Math.sin(a)));
      k.bough(stems,[end.clone().lerp(knee,.28),q],[.021,.006],0x725b42,0x88904a,5,3);
      for(let n=0;n<15;n++){
        const th=rng()*6.283,rr=.27*Math.sqrt(rng()),u=q.clone().add(k.vec(Math.cos(th)*rr,.13*(1-rr/.27),Math.sin(th)*rr));
        k.blade(leaves,u,th,.19+.13*rng(),.046+.028*rng(),.045+rng()*.045,-.035, k.mix(d.palette[0],d.palette[1],rng()),k.mix(d.palette[1],d.palette[2],rng()),.22*rng());
      }
    }
  }
  return finish(p);
}
export function moss(T,d){
  const p=plant(T,d),{k,rng,leaves,flowers}=p;
  for(const [x,z,scale] of d.lobes)for(let j=0;j<24;j++){
    const a=rng()*6.283,rr=scale*Math.sqrt(rng()),w=scale*(.15+.19*rng()),y=.009+.035*scale*(1-rr/scale);
    const q=k.vec(x+Math.cos(a)*rr,y,z+.72*Math.sin(a)*rr);
    k.ellipsoid(leaves,q,[w,w*(.17+.06*rng()),w*.8],d.palette[0],k.mix(d.palette[1],d.palette[2],rng()),9,5,.19,a);
    for(let n=0;n<17;n++){
      const th=rng()*6.283,rr=Math.sqrt(rng()),u=q.clone().add(k.vec(Math.cos(th)*w*.90*rr,w*(.19*Math.sqrt(1-rr*rr)+.015),Math.sin(th)*w*.76*rr));
      for(let ray=0;ray<6;ray++){
        const yaw=th+ray*Math.PI/3,len=w*(.11+.09*rng()),side=k.vec(-.031*w*Math.sin(yaw),0,.031*w*Math.cos(yaw));
        const mid=u.clone().add(k.vec(len*.39*Math.cos(yaw),len*.17,len*.39*Math.sin(yaw)));
        const ids=[flowers.vert(u,d.palette[0]),flowers.vert(mid.clone().add(side),d.palette[1]),flowers.vert(u.clone().add(k.vec(len*Math.cos(yaw),len*.43,len*Math.sin(yaw))),d.palette[2]),flowers.vert(mid.clone().sub(side),d.palette[1])];
        flowers.tri(ids[0],ids[2],ids[1]);flowers.tri(ids[0],ids[3],ids[2]);
      }
      if(n===0 && rng()>.68){
        const end=u.clone().add(k.vec(.014,.07+rng()*.06,-.01));
        k.bough(flowers,[u,end],[.0029,.0018],0x8f713b,0x917443,4,2);
        k.ellipsoid(flowers,end,[.006,.012,.006],0x9b7040,0xc4a45d,6,4);
      }
    }
  }
  return finish(p);
}
export function hanging(T,d){
  const p=plant(T,d),{k,rng,leaves,stems}=p,top=d.length;
  const arch=[[-d.width/2,top-.08,0],[-d.width*.25,top,.08],[0,top+.05,-.03],[d.width*.24,top-.04,.08],[d.width*.5,top,0]];
  k.bough(stems,arch,[.025,.029,.027,.020,.014],0x685638,0x7e7847);
  function leafPair(q,i,scale){
    for(let j=0;j<2;j++)k.blade(leaves,q,(i*1.04+j*3.1)+rng()*.45,.14*scale,.053*scale,.036*scale,-.091*scale,0x36563c,k.mix(0x769646,0xb4b561,rng()),.38*scale);
  }
  for(let i=0;i<70;i++){
    const x=(rng()-.5)*d.width,z=(rng()-.5)*.37,y=top+.06*rng();
    leafPair(k.vec(x,y,z),i,.8+.4*rng());
  }
  for(const [x,drop,swing] of d.tendrils){
    const knots=[];
    for(let j=0;j<=8;j++)knots.push([x+swing*Math.sin(j*.73),top-drop*j/8,.12+.061*Math.sin(j*.81+x)]);
    const cv=k.bough(stems,knots,[.015,.009,.004],0x65603b,0x87934b,5,14);
    for(let j=0;j<Math.ceil(drop*15);j++)leafPair(cv.getPoint(j/Math.ceil(drop*15)),j,.85-.49*j/Math.ceil(drop*15));
  }
  return finish(p);
}
function petals(k,b,center,number,radius,width,rise,shade,light,offset=0){
  for(let i=0;i<number;i++){
    const a=i*2*Math.PI/number+offset,axis=k.vec(Math.cos(a),0,Math.sin(a)),side=k.vec(-Math.sin(a),0,Math.cos(a));
    const rows=[];
    for(let j=0;j<=5;j++){
      const t=j/5,w=width*Math.pow(Math.sin(Math.PI*(.015+.97*t)),.66);
      const q=center.clone().addScaledVector(axis,radius*t);q.y+=rise*(t*t+.22*Math.sin(Math.PI*t)) - (number===5 ? radius*.49*t*Math.sin(a) : 0);
      rows.push([b.vert(q.clone().addScaledVector(side,-w),k.mix(shade,light,t*.86)),b.vert(q.clone().add(k.vec(0,width*.17,0)),k.mix(shade,light,t)),b.vert(q.clone().addScaledVector(side,w),k.mix(shade,light,t*.89))]);
    }
    for(let j=1;j<rows.length;j++)for(let n=0;n<2;n++){b.tri(rows[j-1][n],rows[j-1][n+1],rows[j][n]);b.tri(rows[j][n],rows[j-1][n+1],rows[j][n+1]);}
  }
}
export function flowerClump(T,d){
  const p=plant(T,d),{k,leaves,stems,flowers,rng}=p;
  for(let i=0;i<35;i++){
    const a=i*2.39996,r=.25*Math.sqrt(rng()),q=k.vec(r*Math.cos(a),.007,r*Math.sin(a));
    k.blade(leaves,q,a,.19+.18*rng(),.045+.035*rng(),.10+.10*rng(),-.055,0x3d6537,0x8eab53,.22);
  }
  for(const [x,y,z,size] of d.heads){
    const root=k.vec(x*.45,.015,z*.45),end=k.vec(x,y,z);
    k.bough(stems,[root,[x*.86,y*.58,z*1.08],end],[.009,.006,.004],0x467239,0x779144,6);
    k.blade(leaves,root.clone().lerp(end,.42),rng()*6.28,.14,.035,.044,-.02,0x44763d,0x83a75b);
    petals(k,flowers,end,5,size*1.23,size*.46,size*.19,0xf4e7c5,0xfffefa,rng());
    k.ellipsoid(flowers,end.clone().add(k.vec(0,size*.12,0)),[size*.23,size*.13,size*.23],0xb47f1f,0xf9c44d);
  }
  return finish(p);
}
export function lotus(T,d){
  const p=plant(T,d),{k,leaves,stems,flowers}=p;
  for(const [x,z,r,y,yaw] of d.pads){
    const q=k.vec(x,y,z),base=k.vec(x*.55,.012,z*.55);
    k.bough(stems,[base,[x*.86,y*.45,z*.75],q],[.013,.011,.008],0x447f65,0x679a68,7);
    const hub=leaves.vert(q,0x8cab62),outer=[],middles=[];
    for(let j=0;j<=42;j++){
      const a=yaw+(.13+6.03*j/42),w=(1+.043*Math.sin(a*5+yaw)+.024*Math.sin(a*9));
      const rad=k.vec(Math.cos(a)*r*w,0,Math.sin(a)*r*w*.91);
      const mid=q.clone().addScaledVector(rad,.52);mid.y+=r*.095;
      const tip=q.clone().add(rad);tip.y+=r*(.055+.099*Math.sin(a*3+.5));
      middles.push(leaves.vert(mid,k.mix(0x55996c,0x8abc75,.5+.2*Math.sin(a))));
      outer.push(leaves.vert(tip,k.mix(0x357b65,0x83ad6c,.48+.27*Math.sin(a*3))));
      if(j>0){leaves.tri(hub,middles[j],middles[j-1]);leaves.tri(middles[j-1],middles[j],outer[j-1]);leaves.tri(outer[j-1],middles[j],outer[j]);}
      if(j%4===0)k.bough(stems,[q.clone().add(k.vec(0,.002,0)),mid.clone().add(k.vec(0,.003,0)),tip],[.004,.0024,.0005],0xb1bf76,0x91b677,4,5);
    }
  }
  const q=k.from(d.bloom);
  k.bough(stems,[[q.x-.06,0,q.z+.02],[q.x-.02,q.y*.66,q.z],q],[.017,.011,.009],0x4d8063,0x75a373,8);
  petals(k,flowers,q,10,.19,.061,.069,0xffe1cf,0xe9a6b7);
  petals(k,flowers,q.clone().add(k.vec(0,.025,0)),7,.135,.047,.125,0xfce6d0,0xf6b8c6,.34);
  k.ellipsoid(flowers,q.clone().add(k.vec(0,.055,0)),[.049,.027,.049],0xc99148,0xe5be5c);
  return finish(p);
}
