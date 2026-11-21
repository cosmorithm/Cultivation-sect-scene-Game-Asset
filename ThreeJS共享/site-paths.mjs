import {tileStrip,rosette,ring,reliefCloud} from './site-craft.mjs';
import {railing,pillar} from './site-rail.mjs';
import {standingLamp} from './site-lamps.mjs';

export function steps(k,{width,count,rise,going,landing=1,curb=.23,rails=false,lamps=false,cheeks=false}){
  const run=count*going,front=run/2,top=count*rise;
  for(let i=0;i<count;i++){
    const y=(i+1)*rise,z=front-(i+.5)*going;
    k.box(i%5===3?'cool':'stone',0,y/2,z,width,y,going+.004);
    k.box('light',0,y-.026,z+going/2-.021,width+.012,.052,.087);
    for(const end of [-1,1]){
      k.box('relief',end*(width/2+.055),y*.5+.053,z,curb,y+.106,going+.003);
    }
  }
  const back=-run/2-landing/2;
  k.box('stone',0,top/2,back,width+.16,top,landing);
  k.box('light',0,top-.04,back,width+.24,.08,landing+.075);
  for(const sign of [-1,1]){
    const x=sign*(width/2+.055);
    k.bar('light',[x,.12,front],[x,top+.14,-run/2],curb+.076,.12);
    if(cheeks){
      k.bar('cool',[x,.21,front],[x,top+.25,-run/2],curb+.17,.22);
      k.bar('light',[x,.35,front],[x,top+.41,-run/2],curb+.27,.10);
    }
    if(rails){
      const nodes=Array.from({length:Math.max(3,Math.round(run/2.4)+1)},(_,i,a)=>{
        const f=i/(Math.max(3,Math.round(run/2.4)+1)-1);
        return [x,top*f+.14,front-run*f];
      });
      nodes.push([x,top+.14,back-landing/2]);railing(k,nodes,{s:.82,panels:false,base:false});
    }else{
      for(const [p,h] of [[front-.1,rise],[-run/2,top]])k.box('stone',x,h+.14,p,curb+.21,.3,curb+.21);
    }
    if(lamps)standingLamp(k,x,top+.15,back,{height:1.2,shade:.27,body:.35,low:true});
  }
}
export function curvedDeck(k,{path,width,depth=.42,steps:stair=false,rails='none',n=30,pavers=true,lamps=false,platformAt,apron=false}){
  const T=k.T, spline=new T.CatmullRomCurve3(path.map(v=>new T.Vector3(...v)),false,'centripetal');
  const station=t=>{
    t=Math.max(0,Math.min(1,t));
    const p=spline.getPointAt(t),d=spline.getTangentAt(t),l=Math.hypot(d.x,d.z);
    return {p,nx:-d.z/l,nz:d.x/l};
  };
  const cross=(t,u,y=null)=>{
    const {p,nx,nz}=station(t);return [p.x+nx*u,y??p.y,p.z+nz*u];
  };
  for(let i=0;i<n;i++){
    const lo=i/n,hi=(i+1)/n;
    const sy=stair?station(hi).p.y:null;
    const slab=(a,b,t0,t1,h,thick,key)=>{
      const val=t=>h+(sy??station(t).p.y);
      tileStrip(k,[cross(t0,a,val(t0)),cross(t0,b,val(t0)),cross(t1,b,val(t1)),cross(t1,a,val(t1))],thick,key);
    };
    slab(-width/2,width/2,lo,hi,-.032,depth,'cool');
    const cols=pavers?(stair?2:3):1,j=.011;
    for(let c=0;c<cols;c++){
      const a=width*(c/cols-.5)+j,b=width*((c+1)/cols-.5)-j;
      slab(a,b,lo+.07/n,hi-.025/n,0,.08,(i+2*c)%7===1?'cool':'stone');
    }
    for(const side of [-1,1]){
      const edge=side*width*.5;
      slab(edge-.1,edge+.1,lo,hi,.044,.17,'light');
      if(depth>.7)slab(edge-.12,edge+.12,lo,hi,-depth+.14,.11,'relief');
    }
  }
  for(const side of [-1,1]){
    if(rails!=='both'&&!(rails==='outer'&&side===-1))continue;
    const intervals=Math.max(2,Math.floor(spline.getLength()/2.6));
    const nodes=Array.from({length:intervals+1},(_,i)=>cross(i/intervals,side*(width*.5-.10)));
    railing(k,nodes,{s:width>6?1.06:.86,panels:false});
    if(lamps)for(let i=0;i<nodes.length;i+=Math.max(3,Math.floor(intervals/6))){
      const [x,y,z]=nodes[i];standingLamp(k,x,y,z,{height:2.05,shade:.32,body:.45});
    }
  }
  if(typeof platformAt==='number'){
    const {p}=station(platformAt);k.cylinder('stone',p.x,p.y-.24,p.z,width*.81,width*.73,.48,48);
    k.cylinder('light',p.x,p.y-.02,p.z,width*.82,width*.82,.08,48);rosette(k,p.x,p.y+.025,p.z,width*.51,'lotus');
  }
  if(apron){
    const {p}=station(0);k.cylinder('cool',p.x,p.y-.39,p.z,width*.97,width*.8,.74,48);
    k.cylinder('stone',p.x,p.y-.035,p.z,width*.99,width*.99,.10,48);
    rosette(k,p.x,p.y+.03,p.z,width*.66);
  }
}

export function discLanding(k,{radius:r,height:h,arms=[0,Math.PI],armWidth=3,lamps=false,pattern='compass',rails=true,deckTone='stone'}){
  k.lathe('cool',0,0,0,[[0,0],[r*.83,0],[r*.86,h*.16],[r*.88,h*.22],[r*.94,h*.64],[r*.99,h*.77],[r*1.01,h*.79],[r*1.01,h*.91],[r*.99,h],[0,h]],80);
  k.cylinder(deckTone,0,h-.018,0,r,r,.065,96); ring(k,0,h+.025,0,r*.91,.10,'relief');
  for(let i=0;i<40;i++){
    const a=i/40*Math.PI*2,r0=r*.66,r1=r*.92;
    k.bar('cool',[Math.cos(a)*r0,h+.016,Math.sin(a)*r0],[Math.cos(a)*r1,h+.016,Math.sin(a)*r1],.019,.012);
  }
  rosette(k,0,h+.026,0,r*.62,pattern);
  for(const a of arms){
    const d=r*.39,reach=r+d/2-.12;
    k.box('stone',Math.sin(a)*reach,h*.5,Math.cos(a)*reach,armWidth,h,d,a);
    k.box('light',Math.sin(a)*reach,h-.036,Math.cos(a)*reach,armWidth+.08,.09,d+.03,a);
  }
  if(rails){
    const sorted=arms.map(a=>(a+2*Math.PI)%(2*Math.PI)).sort((a,b)=>a-b);
    const off=Math.asin(Math.min(.95,(armWidth*.5+.12)/r));
    for(let j=0;j<sorted.length;j++){
      const a=sorted[j]+off,b=(j===sorted.length-1?sorted[0]+Math.PI*2:sorted[j+1])-off;
      if(b<=a)continue;
      const div=Math.max(1,Math.round((b-a)*r/2.15)),points=[];
      for(let i=0;i<=div;i++){
        const t=a+(b-a)*i/div;points.push([Math.sin(t)*(r-.24),h+.013,Math.cos(t)*(r-.24)]);
      }
      railing(k,points,{s:r>7?1:.83,panels:false});
      if(lamps)for(const p of [points[0],points.at(-1)])standingLamp(k,...p,{height:1.7,shade:.29,body:.4,low:false});
    }
  }
}

export function rectangularPaving(k,{width:w,depth:d,rows=5,cols=4,height=.2,plaza=false}){
  // Width varies along the plaza to form the two rounded bays and three entrances.
  const halfWidth=z=>{
    if(!plaza)return w/2;
    const t=Math.abs(z/(d/2));
    if(t>.88)return w*.21;
    if(t>.65)return w*(.21+.14*(.88-t)/.23);
    if(t>.45)return w*(.35+.08*(.65-t)/.2);
    return w*(.43+.07*Math.cos(t/.45*Math.PI/2));
  };
  for(let row=0;row<rows;row++){
    const za=-d/2+row*d/rows,zb=za+d/rows;
    const face=(l,r,a,b,y)=>[[halfWidth(a)*l,y,a],[halfWidth(a)*r,y,a],[halfWidth(b)*r,y,b],[halfWidth(b)*l,y,b]];
    tileStrip(k,face(-1,1,za,zb,height-.025),height-.025,'joint');
    const breaks=[-1];
    for(let i=1;i<cols;i++)breaks.push(-1+2*(i+(row%2)*.38)/cols);
    breaks.push(1);
    for(let i=0;i<cols;i++){
      tileStrip(k,face(breaks[i]+.0015,breaks[i+1]-.0015,za+.009,zb-.009,height),.055,(row+2*i)%8===3?'cool':'stone');
    }
  }
  if(plaza){
    k.box('stone',w*.51,height/2,0,w*.18,height,d*.17);
    ring(k,0,height+.009,0,d*.259,.1,'joint');rosette(k,0,height+.017,0,d*.23);
  }
}

export function archBridge(k,{length:L,width:w,clearance:arch,thickness,approach=.8,lamps=false,steps=false}){
  const n=36, rise=arch+.21;
  const top=z=>thickness+rise*Math.pow(Math.cos(Math.PI*z/L),1.35);
  const soffit=z=>arch*Math.sqrt(Math.max(0,1-(z/(L*.39))**2));
  for(let j=0;j<n;j++){
    const a=(j/n-.5)*L,b=((j+1)/n-.5)*L;
    const h0=top(a),h1=top(b),u0=soffit(a),u1=soffit(b);
    const p=[[-w/2,h0,a],[w/2,h0,a],[w/2,h1,b],[-w/2,h1,b],[-w/2,u0,a],[w/2,u0,a],[w/2,u1,b],[-w/2,u1,b]];
    const faces=[[0,2,1],[0,3,2],[4,5,6],[4,6,7],[0,1,5],[0,5,4],[3,7,6],[3,6,2],[1,2,6],[1,6,5],[0,4,7],[0,7,3]];
    k.mesh(j%7===3?'cool':'stone',p,faces);
    for(const sign of [-1,1]){
      const x=sign*(w/2+.02);
      if(u0>.1||u1>.1){
        k.bar(j%3?'relief':'cool',[x,u0+.10,a],[x,u1+.10,b],.12,.22);
      }
      k.bar('light',[x,h0,a],[x,h1,b],.19,.13);
    }
    for(let c=0;c<2;c++){
      const x=-w/2+c*w/2+.02,r=x+w/2-.04;
      tileStrip(k,[[x,h0+.035,a+.012],[r,h0+.035,a+.012],[r,h1+.035,b-.012],[x,h1+.035,b-.012]],.06,j%6===2?'cool':'light');
    }
  }
  for(const sign of [-1,1]){
    const m=Math.max(6,Math.round(L/2));const nodes=Array.from({length:m+1},(_,i)=>{
      const z=(i/m-.5)*L;return [sign*(w/2-.08),top(z)+.06,z];
    });
    railing(k,nodes,{s:.88,panels:false,base:false});
  }
  for(const side of [-1,1]){
    const m=steps?4:1;
    for(let i=0;i<m;i++){
      const h=thickness*(m-i)/m;
      k.box('stone',0,h/2,side*(L/2+approach*(i+.5)/m),w+.12,h,approach/m);
    }
    if(lamps)for(const x of [-1,1])standingLamp(k,x*(w/2-.08),thickness,side*L/2,{height:1.47,shade:.27,body:.36,low:true});
  }
}

export function decalDisc(k,{radius:r,style,thickness:h=.07}){
  k.cylinder('cool',0,h/2,0,r,r,h,96);
  k.cylinder('stone',0,h+.004,0,r*.976,r*.976,.022,96);
  const y=h+.02;
  for(let i=0;i<(style==='compass'?36:20);i++){
    const a=i/(style==='compass'?36:20)*Math.PI*2;
    const inner=style==='compass'?.43:.79;
    k.bar('joint',[r*inner*Math.cos(a),y,r*inner*Math.sin(a)],[r*.975*Math.cos(a),y,r*.975*Math.sin(a)],.012*r,.006);
  }
  for(const f of style==='compass'?[.97,.82,.65,.42,.18]:[.97,.79,.72])ring(k,0,y+.004,0,r*f,.017*r,'relief');
  rosette(k,0,y+.012,0,r*(style==='compass'?.27:.76),style);
}
export function wallPanel(k,w,h,d){
  k.box('stone',0,h*.5,0,w,h,d);
  for(const sign of [-1,1]){
    const z=sign*(d/2+.012);
    k.box('cool',0,h*.5,z,w*.94,h*.79,.024);
    for(const xx of [-1,1])k.box('relief',xx*w*.477,h*.5,z,.065,h*.9,.04);
    for(const yy of [-1,1])k.box('relief',0,h*(.5+yy*.447),z,w*.96,.065,.04);
    reliefCloud(k,0,h*.5,z+sign*.045,w*.86,h*.75);
    const pts=Array.from({length:33},(_,i)=>[Math.cos(Math.PI*2*i/32)*h*.27,h*(.5+.27*Math.sin(Math.PI*2*i/32)),z+sign*.058]);
    k.rod('relief',pts,h*.035,7,false);
  }
}
