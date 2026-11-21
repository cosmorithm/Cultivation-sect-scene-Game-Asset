export function lampHead(k,x,y,z,r=1,tall=1){
  // Four glazed hips share lifted tips; copper seam caps trace the diagonal hips.
  const roofBase=y+tall, segments=10;
  const vector=(side,t,v)=>{
    const angle=side*Math.PI/2, dx=(t-.5)*2*r, dz=r;
    const lift=.24*Math.pow(Math.abs(2*t-1),3);
    return [x+(dx*Math.cos(angle)+dz*Math.sin(angle))*(1-v),roofBase+r*(lift*(1-v)**2+.68*v**1.8),z+(dz*Math.cos(angle)-dx*Math.sin(angle))*(1-v)];
  };
  for(let side=0;side<4;side++){
    const all=[],tri=[];
    for(let j=0;j<=4;j++)for(let i=0;i<=segments;i++)all.push(vector(side,i/segments,j/4*.985));
    for(let j=0;j<4;j++)for(let i=0;i<segments;i++){
      const a=j*(segments+1)+i,b=a+1,c=a+segments+1,d=c+1;
      tri.push([a,b,c],[b,d,c]);
    }
    k.mesh('blue',all,tri);
    k.rod('gold',Array.from({length:13},(_,i)=>vector(side,i/12,0)),r*.032,6);
    k.rod('gold',Array.from({length:6},(_,i)=>vector(side,0,i/5*.986)),r*.032,6);
    for(let i=1;i<8;i++){
      k.rod('teal',Array.from({length:6},(_,j)=>vector(side,i/8,j/5*.965)),r*.014,5);
    }
  }
  const s=.552*r; k.box('paper',x,y+tall*.49,z,2*s,tall*.89,2*s);
  for(const h of [.03,.93])k.box('bronze',x,y+tall*h,z,1.47*r,tall*.10,1.47*r);
  for(const dx of [-1,1])for(const dz of [-1,1])
    k.box('wood',x+dx*s,y+tall*.5,z+dz*s,.115*r,tall,.115*r);
  const diamond=[[0,.36],[.42,.50],[0,.70],[-.42,.50],[0,.36]];
  for(let side=0;side<4;side++){
    const a=side*Math.PI/2;
    const coords=diamond.map(([dx,dy])=>[x+dx*r*Math.cos(a)+(s+.012)*Math.sin(a),y+dy*tall,z+(s+.012)*Math.cos(a)-dx*r*Math.sin(a)]);
    k.rod('gold',coords,.025*r,5,false);
  }
  k.lathe('gold',x,roofBase+r*.63,z,[[0,0],[r*.13,0],[r*.12,.12*r],[r*.047,.16*r],[r*.074,.24*r],[0,.40*r]],12);
}
export function standingLamp(k,x,y,z,{height=3.5,shade=.34,body=.63,low=false}={}){
  const r=shade;
  for(const [w,h,dy,key] of [[1.3,.12,0,'cool'],[1.15,.12,.12,'light'],[.86,.18,.24,'stone'],[.98,.08,.42,'relief']])
    k.box(key,x,y+(dy+h/2)*r*1.7,z,w*r*1.7,h*r*1.7,w*r*1.7);
  const mount=.5*r*1.7,pole=height-body-r*1.05-mount;
  k.lathe(low?'stone':'red',x,y+mount,z,[[0,0],[r*.46,0],[r*.48,pole*.065],[r*.33,pole*.13],[r*.235,pole*.22],[r*.19,pole*.87],[r*.34,pole*.94],[r*.38,pole],[0,pole]],low?8:16);
  for(const dy of [.16,.82,.95])k.cylinder('gold',x,y+mount+pole*dy,z,r*.275,r*.30,r*.10,12);
  lampHead(k,x,y+mount+pole,z,r,body);
}
