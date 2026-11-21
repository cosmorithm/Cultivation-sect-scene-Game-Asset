import {reliefCloud} from './site-craft.mjs';

export function pillarCap(k,x,y,z,scale=1,metal=true){
  const s=scale;
  for(const [w,h,dy] of [[.36,.045,0],[.41,.065,.045],[.34,.065,.11]])k.box('light',x,y+s*(dy+h/2),z,w*s,h*s,w*s);
  k.cylinder('stone',x,y+.215*s,z,.125*s,.203*s,.09*s,4,Math.PI/4);
  k.lathe(metal?'motif':'relief',x,y+.244*s,z,[[0,0],[.069*s,0],[.082*s,.042*s],[.067*s,.084*s],[.03*s,.111*s],[0,.129*s]],12);
}
export function pillar(k,x,y,z,s=1,cap=true){
  for(const [w,h,dy,m] of [[.44,.10,0,'cool'],[.4,.055,.1,'light'],[.32,.12,.155,'stone'],[.27,.65,.275,'stone'],[.31,.055,.925,'cool']])
    k.box(m,x,y+s*(dy+h/2),z,w*s,h*s,w*s);
  // Each shaft has a recessed field inside a fine raised four-sided frame.
  for(let face=0;face<4;face++){
    const a=face*Math.PI/2,nx=Math.sin(a),nz=Math.cos(a),surface=.139*s;
    const fx=x+nx*surface,fz=z+nz*surface;
    k.box('cool',fx,y+.584*s,fz,.179*s,.443*s,.014*s,a);
    k.box('stone',fx+nx*.008*s,y+.584*s,fz+nz*.008*s,.148*s,.397*s,.016*s,a);
    k.box('light',fx+nx*.010*s,y+.792*s,fz+nz*.010*s,.160*s,.021*s,.025*s,a);
  }
  if(cap)pillarCap(k,x,y+.975*s,z,s);
}
export function panel(k,cx,y,z,w,h,d,angle=0,depthDetail=true){
  k.box('stone',cx,y,z,w,h,d,angle);
  for(const side of [-1,1]){
    const offset=(d+.012)/2*side;
    const x=cx+Math.sin(angle)*offset, zz=z+Math.cos(angle)*offset;
    k.box('cool',x,y,zz,w*.94,h*.75,.014,angle);
    reliefCloud(k,x+Math.sin(angle)*.013*side,y,zz+Math.cos(angle)*.013*side,w*.87,h*.60,angle);
    if(depthDetail){
      const radius=h*.226;
      const detailZ=.026*side;
      const at=(xx,yy,dd)=>[x+xx*Math.cos(angle)+Math.sin(angle)*dd,y+yy,zz-xx*Math.sin(angle)+Math.cos(angle)*dd];
      const circle=Array.from({length:25},(_,i)=>at(Math.cos(i*Math.PI/12)*radius,Math.sin(i*Math.PI/12)*radius,detailZ));
      k.rod('light',circle,Math.max(.007,h*.032),6,false);
      for(let j=0;j<4;j++){
        const a=j*Math.PI/2;
        const petal=[[0,0],[.43,.22],[.7,.08],[.59,-.18],[.26,-.13]];
        k.rod('relief',petal.map(([u,v])=>at(radius*(u*Math.cos(a)-v*Math.sin(a)),radius*(u*Math.sin(a)+v*Math.cos(a)),detailZ)),h*.017,5);
      }
      for(const sign of [-1,1])k.box('light',x,y+sign*h*.44,zz,w,.043,.03,angle);
    }
  }
}
export function railing(k,points,{s=1,posts=true,panels=true,base=true,ornament=true}={}){
  if(posts)for(const [x,y,z] of points)pillar(k,x,y,z,s);
  for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i],mid=a.map((v,j)=>(v+b[j])/2);
    const delta=b.map((v,j)=>v-a[j]),len=Math.hypot(delta[0],delta[2]);
    const yaw=-Math.atan2(delta[2],delta[0]);
    const at=(t,h)=>a.map((v,j)=>v+delta[j]*t+(j===1?h*s:0));
    if(base)k.bar('cool',at(0,.075),at(1,.075),.36*s,.15*s);
    k.bar('light',at(0,.91),at(1,.91),.205*s,.109*s);
    k.bar('stone',at(0,.838),at(1,.838),.156*s,.045*s);
    if(panels){
      if(Math.abs(delta[1])<.03*s){
        const width=Math.max(.1,len-.26*s);
        if(ornament)panel(k,mid[0],mid[1]+.411*s,mid[2],width,.38*s,.136*s,yaw);
        else k.bar('stone',at(0,.4),at(1,.4),.14*s,.34*s);
      }else k.bar('stone',at(0,.41),at(1,.41),.14*s,.36*s);
    }else k.bar('stone',at(0,.39),at(1,.39),.12*s,.09*s);
    for(const t of [.28,.72]){
      const p=at(t,.72);k.box('relief',p[0],p[1],p[2],.072*s,.23*s,.089*s,yaw);
    }
  }
}

export function sockets(k,width,depth,height,count){
  const hole=.30,rail=(depth-hole)/2, y=height/2;
  for(const sign of [-1,1])k.box('stone',0,y,sign*(hole+rail)/2,width,height,rail);
  const centers=Array.from({length:count},(_,i)=>-width/2+.40+i*(width-.8)/(count-1));
  let x=-width/2;
  for(const c of centers){
    const end=c-hole/2;k.box('stone',(x+end)/2,y,0,end-x,height,hole);
    k.box('shadow',c,height*.48,0,hole*.99,.025,hole*.99);x=c+hole/2;
  }
  k.box('stone',(x+width/2)/2,y,0,width/2-x,height,hole);
  k.box('cool',0,.045,0,width+.08,.09,depth+.08);
}
