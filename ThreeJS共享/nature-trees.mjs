import {createKit,seeded} from './nature-mesh.mjs';

function striatedBark(T){
  const size=128,data=new Uint8Array(size*size*4),rng=seeded(947);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const u=x/size,v=y/size,a=2*Math.PI;
    const ridge=u*15+.42*Math.sin(a*(v+u*2))+.32*Math.cos(a*(v*2-u))+.12*Math.cos(a*v*5);
    const fissure=Math.max(0,Math.cos(a*ridge))**5;
    const grain=.80+.15*Math.sin(a*(ridge+.17))-.39*fissure+.095*rng(),i=(y*size+x)*4;
    data.set([Math.min(255,252*grain+4),Math.min(255,247*grain+4),Math.min(255,236*grain+4),255],i);
  }
  const map=new T.DataTexture(data,size,size);map.name='Old_bark_fissures';map.colorSpace=T.SRGBColorSpace;
  map.wrapS=map.wrapT=T.RepeatWrapping;map.generateMipmaps=true;map.minFilter=T.LinearMipmapLinearFilter;map.magFilter=T.LinearFilter;map.needsUpdate=true;return map;
}
// Each branch describes its attachment along the trunk, its elbow, its tip, and crown radius.
export function tree(T,spec) {
  const k=createKit(T),rng=seeded(spec.seed),g=new T.Group();g.name=spec.name;
  const wood=k.batch('Weathered_bark',{map:striatedBark(T)}),barkRidges=k.batch('Sunlit_bark_ridges');
  const green=k.batch('Crown_mass'),sprays=k.batch('Outer_foliage');
  const root=k.from(spec.trunk[0]),height=Math.max(...spec.trunk.map(p=>p[1])),base=spec.radius;
  const bark=spec.bark||0x5d483a,barkHi=spec.barkHi||0xa28c67;
  const trunk=k.bough(wood,spec.trunk,spec.trunk.map((p,i)=>base*Math.pow(1-i/spec.trunk.length,.95)),bark,barkHi,15,32,true);
  for(let i=0;i<7;i++) {
    const a=i*.897+.22*rng(),l=base*(2.1+2.2*rng()),side=k.vec(Math.cos(a),0,Math.sin(a));
    const p=root.clone().addScaledVector(side,l*.52);p.y+=base*.30;
    const end=root.clone().addScaledVector(side,l);end.y+=.014;
    const start=root.clone().addScaledVector(side,base*.41);start.y+=base*.9;
    k.bough(wood,[start,p,end],[base*.46,base*.27,base*.018],bark,barkHi,8,7,true);
  }
  for(let i=0;i<10;i++) {
    const a=2*Math.PI*i/10,knots=[];
    for(let j=0;j<=8;j++){
      const t=.025+j*.074,p=trunk.getPoint(t),r=base*(1-t)*.98;
      p.x+=Math.cos(a+t*1.3)*r;p.z+=Math.sin(a+t*1.3)*r;knots.push(p);
    }
    k.bough(barkRidges,knots,[.012*height,.006*height,.0008*height],bark,k.mix(bark,barkHi,.7),4,13);
  }
  const v=(c,x,y,z)=>c.clone().add(k.vec(x,y,z));
  function pine(p,s,phase) {
    const [dark,mid,light]=spec.foliage;
    // Tiny feather-shaped sprays sit on the outer surface of each flattened cloud pad.
    // The lower mass stays dark, allowing the numerous new shoots above it to read.
    for(let j=0;j<13;j++){
      const a=phase+j*2.39996,rr=Math.sqrt((j+.5)/13)*s*.76;
      const q=v(p,Math.cos(a)*rr,s*(.06+.22*(1-rr/s))+.10*s*rng(),Math.sin(a)*rr*.84);
      const w=s*(.24+.16*rng()),under=k.mix(0x162f2f,dark,.42);
      k.ellipsoid(green,q,[w*.94,w*(.22+.08*rng()),w*.77],under,k.mix(dark,mid,.78),11,5,.24,a);
      if(j%3===0){
        const elbow=p.clone().lerp(q,.53);elbow.y-=w*.23;
        k.bough(wood,[v(p,0,-w*.12,0),elbow,q],[w*.060,w*.026,w*.005],bark,barkHi,5,5);
      }
      for(let tuft=0;tuft<26;tuft++){
        const phi=tuft*2.39996+phase,r=Math.sqrt((tuft+.5)/26),u=v(q,Math.cos(phi)*w*r, w*(.24*Math.sqrt(1-r*r)+.03+.08*rng()),Math.sin(phi)*w*.81*r);
        const axis=phi+.5*(rng()-.5),length=w*(.34+.25*rng()),tip=v(u,Math.cos(axis)*length,length*.26,Math.sin(axis)*length);
        const tone=k.mix(mid,light,.17+.78*rng());
        // A single branchlet carries six tapered needles at alternating stations.
        for(let n=0;n<7;n++){
          const t=n/8,side=n%2===0?1:-1,at=u.clone().lerp(tip,t),th=axis+side*(.57+.42*(1-t));
          const len=length*(.48-.19*t),end=v(at,len*Math.cos(th),len*.28,len*Math.sin(th));
          const width=len*.105,axisW=k.vec(-Math.sin(th)*width,0,Math.cos(th)*width);
          const midp=at.clone().lerp(end,.34),ids=[sprays.vert(at,k.mix(dark,mid,.25)),sprays.vert(midp.clone().add(axisW),tone),sprays.vert(end,k.mix(tone,light,.2)),sprays.vert(midp.clone().sub(axisW),tone)];
          sprays.tri(ids[0],ids[2],ids[1]);sprays.tri(ids[0],ids[3],ids[2]);
        }
      }
    }
  }
  function mapleLeaf(p,yaw,size,red) {
    const grad=k.mix(red,spec.foliage[2],.20),mid=sprays.vert(p,red),edge=[];
    for(let n=0;n<14;n++) {
      const a=Math.PI*2*n/14+yaw;
      let r=(n%2===0?1:.39);r*=.78+.23*Math.cos(a-yaw);
      edge.push(sprays.vert(v(p,size*r*Math.cos(a),size*(.38*r*Math.sin(a+yaw)-.16*r),size*r*Math.sin(a)),grad));
    }
    for(let i=0;i<14;i++)sprays.tri(mid,edge[(i+1)%14],edge[i]);
  }
  function bloom(p,yaw,s,baseColor) {
    for(let i=0;i<5;i++) {
      const a=yaw+i*Math.PI*.4;
      const o=v(p,0,0,0),mid=v(o,Math.cos(a)*s*.52,s*.16,Math.sin(a)*s*.52);
      const perp=k.vec(-Math.sin(a),0,Math.cos(a)),out=k.vec(Math.cos(a),0,Math.sin(a));
      const ids=[sprays.vert(o,baseColor),sprays.vert(mid.clone().addScaledVector(perp,-s*.34),baseColor),sprays.vert(mid.clone().addScaledVector(out,s*.45),k.mix(baseColor,0xfff3df,.36)),sprays.vert(mid.clone().addScaledVector(perp,s*.34),baseColor)];
      sprays.tri(ids[0],ids[2],ids[1]);sprays.tri(ids[0],ids[3],ids[2]);
    }
  }
  function broad(p,s,phase) {
    const [shade,mid,tip]=spec.foliage;
    // Keep the individual leaf silhouettes readable at the crown edge.
    for(let j=0;j<13;j++) {
      const a=j*2.39996+phase,rr=s*Math.sqrt((j+.3)/13)*.76;
      const q=v(p,Math.cos(a)*rr,s*.21*(1-rr/s)+s*.15*rng(),Math.sin(a)*rr*.83);
      const w=s*(.23+.14*rng()),tone=k.mix(mid,tip,rng());
      k.ellipsoid(green,q,[w*.84,w*.29,w*.67],k.mix(shade,mid,.07),k.mix(shade,mid,.75),8,4,.21,a);
      for(let i=0;i<37;i++) {
        const theta=i*2.39996+rng()*.65,r=Math.sqrt((i+.35)/37);
        const pos=v(q,w*Math.cos(theta)*r,w*(.32*Math.sqrt(1-r*r)+.025+.16*rng()-.19*r*r),w*.83*Math.sin(theta)*r);
        if(spec.form==='blossom')bloom(pos,theta,w*(.19+.17*rng()),k.mix(mid,tip,rng()));
        else mapleLeaf(pos,theta,w*(.22+.17*rng()),k.mix(shade,tip,.10+.79*rng()));
      }
    }
  }
  function crown(p,r,yaw) { if(spec.form==='pine')pine(p,r,yaw);else broad(p,r,yaw); }
  for(const [idx,arm] of spec.arms.entries()){
    const [t,elbow,tip,r]=arm,anchor=trunk.getPoint(t),e=k.from(elbow),end=k.from(tip);
    const branch=k.bough(wood,[anchor,e,end],[base*(.30+.28*(1-t)),base*.16,base*.024],bark,barkHi,9,11,true);
    const direction=end.clone().sub(e).normalize(),side=k.vec(-direction.z,0,direction.x);
    for(let j=0;j<3;j++){
      const f=.48+.16*j,at=branch.getPoint(f),sgn=j%2===0?1:-1;
      const distal=at.clone().addScaledVector(side,r*(.35+.33*rng())*sgn).addScaledVector(direction,r*.18);
      distal.y+=r*(.32+.3*rng());
      const middle=at.clone().lerp(distal,.56);middle.y-=r*.11;
      k.bough(wood,[at,middle,distal],[base*.12,base*.063,base*.008],bark,barkHi,6,6,true);
      crown(distal,r*(.51+.13*rng()),idx*.92+j);
    }
    crown(end,r,idx*1.24);
  }
  crown(k.from(spec.trunk.at(-1)),spec.apex,1.7);
  wood.finish(g);barkRidges.finish(g);green.finish(g);sprays.finish(g);
  return g;
}
