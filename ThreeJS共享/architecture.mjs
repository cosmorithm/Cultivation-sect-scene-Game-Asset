// Parametric timber joinery, fired roof tiles and cut-stone details.
// Coordinates are in metres. The visitor approaches along +Z.
const tones = {
  lacquer:[0x945747,.53,.04], heartwood:[0x754634,.64,.02], walnut:[0x503225,.66,0],
  teal:[0x315e66,.48,.08], glaze:[0x466e7c,.39,.06], tileRound:[0x5c8490,.34,.07],
  shadowTile:[0x32505c,.52,.04], bronze:[0xb69257,.43,.71], gold:[0xcaa66d,.39,.67],
  stone:[0xc5bcae,.87,0], stonePale:[0xdad0bf,.81,0], carving:[0xab9f8d,.90,0],
  lime:[0xd3c8b4,.9,0], silk:[0xb99a70,.92,0], ember:[0xe9ab48,.54,.02]
};
const TAU=Math.PI*2;
export class Workshop {
  constructor(T,name){
    this.T=T; this.name=name; this.root=new T.Group(); this.root.name=name;
    this.batches=new Map(); this.part='Assembly'; this.frame=new T.Matrix4();
    this.materials=new Map(); this.cube=new T.BoxGeometry(1,1,1); this.identity=new T.Quaternion();
  }
  section(name){this.part=name;}
  local(position,yaw,callback){
    const previous=this.frame;
    const matrix=new this.T.Matrix4().makeRotationY(yaw); matrix.setPosition(...position);
    this.frame=previous.clone().multiply(matrix);
    try{ callback(); }finally{this.frame=previous;}
  }
  emit(geo,tone,x=0,y=0,z=0,sx=1,sy=1,sz=1,q=this.identity){
    const T=this.T,key=this.part+'_'+tone;
    if(!this.batches.has(key))this.batches.set(key,{tone,positions:[],normals:[],colors:[],index:[]});
    const b=this.batches.get(key), off=b.positions.length/3;
    const mat=new T.Matrix4().compose(new T.Vector3(x,y,z),q,new T.Vector3(sx,sy,sz)).premultiply(this.frame);
    const normMat=new T.Matrix3().getNormalMatrix(mat);
    const p=new T.Vector3(),n=new T.Vector3();
    const pos=geo.getAttribute('position');
    if(!geo.getAttribute('normal'))geo.computeVertexNormals();
    const normal=geo.getAttribute('normal');
    for(let i=0;i<pos.count;i++){
      p.fromBufferAttribute(pos,i).applyMatrix4(mat); n.fromBufferAttribute(normal,i).applyNormalMatrix(normMat);
      b.positions.push(p.x,p.y,p.z); b.normals.push(n.x,n.y,n.z);
      const grain=Math.sin(p.x*2.37+p.z*1.71+Math.sin(p.y*1.97))*.5+Math.sin(p.z*5.1+p.y*.9)*.5;
      const k=.967+.027*grain; b.colors.push(k,k,k);
    }
    if(geo.index)for(const i of geo.index.array)b.index.push(off+i);
    else for(let i=0;i<pos.count;i++)b.index.push(off+i);
  }
  box(tone,x,y,z,w,h,d){this.emit(this.cube,tone,x,y,z,w,h,d);}
  lathe(tone,x,y,z,profile,segments=28){
    const T=this.T;this.emit(new T.LatheGeometry(profile.map(([r,h])=>new T.Vector2(r,h)),segments),tone,x,y,z);
  }
  cylinder(tone,x,y,z,r0,r1,h,n=20){
    this.emit(new this.T.CylinderGeometry(r1,r0,h,n,1),tone,x,y+h/2,z);
  }
  beam(tone,a,b,r0,r1=r0,sides=10){
    const T=this.T,dir=new T.Vector3().subVectors(new T.Vector3(...b),new T.Vector3(...a));
    if(dir.lengthSq()<1e-10)return;
    this.emit(new T.CylinderGeometry(r1,r0,dir.length(),sides,1),tone,
      (a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,1,1,1,
      new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),dir.normalize()));
  }
  rod(tone,points,r,sides=7){
    const T=this.T;if(points.length<2)return;
    const path=new T.CatmullRomCurve3(points.map(a=>new T.Vector3(...a)),false,'centripetal');
    this.emit(new T.TubeGeometry(path,Math.max(4,points.length*2),r,sides,false),tone);
  }
  ringXY(tone,x,y,z,outer,tube){
    this.emit(new this.T.TorusGeometry(outer,tube,7,40),tone,x,y,z);
  }
  profile(tone,pts,depth,z){
    const T=this.T,shape=new T.Shape();shape.moveTo(...pts[0]);
    for(let i=1;i<pts.length;i++)shape.lineTo(...pts[i]);shape.closePath();
    this.emit(new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:12}),tone,0,0,z-depth/2);
  }
  scroll(tone,x,y,z,w,h,r){
    // Centre-bud and a pair of cloud tendrils carved along the face.
    for(const s of [-1,1]){
      const path=[[0,0],[.10,.13],[.19,.38],[.32,.47],[.42,.24],[.39,-.02],[.29,-.06],[.28,.12],[.34,.17]];
      this.rod(tone,path.map(([u,v])=>[x+s*u*w,y+v*h,z]),r,6);
      this.rod(tone,[[x+s*.22*w,y+.32*h,z],[x+s*.34*w,y+.48*h,z],[x+s*.46*w,y+.47*h,z],[x+s*.5*w,y+.59*h,z]],r*.72,5);
    }
  }
  finish(){
    const T=this.T;
    for(const [name,b] of this.batches){
      const g=new T.BufferGeometry();
      g.setAttribute('position',new T.Float32BufferAttribute(b.positions,3));
      g.setAttribute('normal',new T.Float32BufferAttribute(b.normals,3));
      g.setAttribute('color',new T.Float32BufferAttribute(b.colors,3));g.setIndex(b.index);
      if(!this.materials.has(b.tone)){
        const [color,roughness,metalness]=tones[b.tone];
        const m=new T.MeshStandardMaterial({name:b.tone,color,roughness,metalness,vertexColors:true,side:T.DoubleSide});
        if(b.tone==='ember'){m.emissive.setHex(0xb66c1c);m.emissiveIntensity=.4;}
        this.materials.set(b.tone,m);
      }
      const mesh=new T.Mesh(g,this.materials.get(b.tone)); mesh.name=name;this.root.add(mesh);
    }
    return this.root;
  }
}

export function plinth(s,w,d,h,x=0,z=0,y=0){
  for(const [bottom,height,over,mat] of [[0,.12,.08,'stonePale'],[.12,.13,.025,'carving'],[.25,.57,0,'stone'],[.82,.08,.04,'carving'],[.90,.10,.10,'stonePale']])
    s.box(mat,x,y+h*(bottom+height/2),z,w+over*2,h*height,d+over*2);
}
export function stairs(s,width,front,height,count,tread=.32,x=0){
  for(let n=1;n<=count;n++){
    const y=height*n/count,z=front+(count-n+.5)*tread;
    s.box('stone',x,y/2,z,width,y,tread+.004);
    s.box('stonePale',x,y-.022,z+.012,width+.03,.045,tread+.04);
  }
  const flank=.14;
  for(const sign of [-1,1]) s.local([x+sign*(width+flank)/2,0,0],Math.PI*.5,()=>{
    s.profile('stonePale',[[0,0],[count*tread,0],[count*tread,.11],[0,height+.09]].map(([u,v])=>[-front-u,v]),flank,0);
  });
}
export function baseDrum(s,x,y,z,r){
  s.box('stone',x,y+r*.14,z,2.55*r,.28*r,2.55*r);
  s.box('stonePale',x,y+r*.34,z,2.32*r,.16*r,2.32*r);
  s.lathe('stonePale',x,y,z,[[0,.42],[1.08,.42],[1.16,.53],[1.17,.70],[1.06,.90],[1,.96],[1,.99],[0,.99]].map(([a,b])=>[a*r,b*r]));
}
export function column(s,x,y,z,r,h){
  baseDrum(s,x,y,z,r*1.14);const shoe=1.14*r;
  s.cylinder('lacquer',x,y+shoe,z,r,r*.89,h-shoe,20);
  for(const [cy,ratio] of [[y+shoe,1.01],[y+h-.09,.93]])s.cylinder('bronze',x,cy,z,r*ratio,r*ratio,.065,24);
}
export function bracket(s,x,y,z,scale=1){
  s.local([x,y,z],0,()=>{
    const k=scale;
    s.box('walnut',0,.08*k,0,.43*k,.16*k,.45*k);
    for(let level=0;level<3;level++){
      const w=(.68+.32*level)*k, cy=(.16+.17*level)*k;
      for(let axis=0;axis<2;axis++)s.local([0,0,0],axis*Math.PI/2,()=>{
        s.profile('heartwood',[[-w*.5,cy+.11*k],[-w*.5,cy+.23*k],[-w*.31,cy+.23*k],[-w*.22,cy+.13*k],[w*.22,cy+.13*k],[w*.31,cy+.23*k],[w*.50,cy+.23*k],[w*.5,cy+.11*k],[w*.27,cy],[w*.14,cy-.025*k],[-w*.14,cy-.025*k],[-w*.27,cy]],.20*k,0);
        for(const sign of [-1,1])s.box('lacquer',sign*w*.40,cy+.26*k,0,.20*k,.09*k,.31*k);
      });
    }
  });
}
export function lattice(s,x,y,z,w,h,window=true){
  const rim=Math.min(w*.042,.10), rb=.5*rim;
  if(window)s.box('silk',x,y,z-.045,w,h,.06);
  for(const side of [-1,1]){
    s.box('heartwood',x+side*(w-rim)/2,y,z,w>0?rim:0,h,.12);
    s.box('heartwood',x,y+side*(h-rim)/2,z,w,rim,.12);
  }
  const panels=w>2?3:2;
  for(let j=0;j<panels;j++){
    const dw=(w-2*rim)/panels,cx=x+(j+.5-panels/2)*dw;
    for(const f of [-.32,-.16,.16,.32])s.box('walnut',cx+f*dw,y,z+.035,rb*.60,h-rim,.055);
    for(const f of [-.35,-.24,.24,.35])s.box('walnut',cx,y+f*h,z+.04,dw-.018,rb*.64,.055);
    if(j<panels-1)s.box('heartwood',cx+dw/2,y,z+.025,rb*1.65,h-rim,.09);
  }
}
export function timberHall(s,{w,d,base,postH,r,bays=3,bodyDepth=.76,court=false,medallion=false}){
  const xs=Array.from({length:bays+1},(_,i)=>-w/2+i*w/bays);
  for(const x of xs)for(const z of [-d/2,d/2]){
    column(s,x,base,z,r,postH);bracket(s,x,base+postH,z,r*2);
  }
  const roofY=base+postH+.65*r*2;
  for(const z of [-d/2,d/2]){
    s.box('heartwood',0,roofY,z,w+2*r,.31,d>2?.32:.20);
    s.box('teal',0,roofY-.14,z,w+.5*r,.13,.34);
  }
  for(const x of [-w/2,w/2])s.box('heartwood',x,roofY,0,.32,.35,d+.2);
  const back=-d/2+.12,front=back+d*bodyDepth, cy=base+postH*.5;
  s.box('lime',0,cy,(back+front)/2,w-.22,postH,front-back);
  for(let face=0;face<2;face++)s.local([0,base,face?back:front],face*Math.PI,()=>{
    for(const x of xs)s.box('heartwood',x,postH*.51,.02,.19,postH*.98,.18);
    const span=w/bays;
    for(let i=0;i<bays;i++){
      const x=(i+.5)*span-w/2, isDoor=face===0&&i===Math.floor(bays/2);
      if(isDoor){
        const dw=span*.81,dh=postH*.84;
        for(const dir of [-1,1]){
          const cx=x+dir*dw*.25;s.box('walnut',cx,dh/2,.09,dw*.5-.018,dh,.17);
          s.box('heartwood',cx,dh*.21,.18,dw*.44,dh*.32,.045);
          if(!medallion)lattice(s,cx,dh*.69,.20,dw*.42,dh*.51,true);
          s.ringXY('bronze',x+dir*dw*.073,dh*.47,.226,dw*.027,.013);
        }
        if(medallion){
          s.ringXY('bronze',x,dh*.53,.207,dw*.27,.035);s.scroll('gold',x,dh*.51,.22,dw*.46,dh*.18,.015);
        }
      }else{
        const ww=span*(court?.73:.77);
        lattice(s,x,postH*.53,.1,ww,postH*.53);
        s.box('heartwood',x,postH*.24,.125,ww+.12,.085,.24);
      }
    }
    s.box('heartwood',0,.17,.06,w,.32,.22);s.box('heartwood',0,postH*.92,.075,w,.22,.20);
  });
  for(const sign of [-1,1])s.local([sign*w/2,base,(front+back)/2],sign*Math.PI/2,()=>{
    const side=(front-back); const positions=court?[-.24,.24]:[0];
    for(const off of positions)lattice(s,off*side,postH*.57,.03,side*(court?.25:.48),postH*(court?.30:.47));
    s.box('heartwood',0,.16,.02,side,.30,.15);
  });
}

export function roof(s,{w,d,eave,rise,ridge=w*.52,lift=Math.min(.95,d*.10),tilePitch=.23,edge=true}){
  const T=s.T,hw=w/2,hd=d/2,hr=ridge/2;
  const cornerLift=(u,v)=>lift*Math.pow(Math.abs(u),4.5)*(1-v)*(1-v);
  function point(face,u,v){
    const y=eave+rise*(.46*v+.54*v*v)+cornerLift(u,v);
    if(face===0)return [u*(hw+(hr-hw)*v),y,hd*(1-v)];
    if(face===1)return [hw+(hr-hw)*v,y,-u*hd*(1-v)];
    if(face===2)return [-u*(hw+(hr-hw)*v),y,-hd*(1-v)];
    return [-hw-(hr-hw)*v,y,u*hd*(1-v)];
  }
  for(let f=0;f<4;f++){
    const horizontal=f%2===0, detail=Math.min(92,Math.max(14,Math.floor((horizontal?w:d)/tilePitch)));
    const nu=Math.max(18,Math.ceil(detail/2)), nv=9;
    const p=[],index=[];
    for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++)p.push(...point(f,i/nu*2-1,j/nv));
    for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){
      const a=j*(nu+1)+i,b=a+1,c=a+nu+1,e=c+1;
      index.push(a,b,c);if(j!==nv-1||(horizontal&&hr>0))index.push(b,e,c);
    }
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));
    g.setIndex(index);g.computeVertexNormals();s.emit(g,'glaze');
    const eaves=Array.from({length:17},(_,i)=>point(f,i/8-1,0));
    s.rod('heartwood',eaves.map(([x,y,z])=>[x,y-.13,z]),.105,7);
    s.rod('shadowTile',eaves.map(([x,y,z])=>[x,y-.044,z]),.087,7);
    if(edge)s.rod('bronze',eaves.map(([x,y,z])=>[x,y+.005,z]),.027,6);
    for(let i=1;i<detail;i++){
      const u=2*i/detail-1,far=(horizontal&&hr>0)?1:.92;
      const tiles=Array.from({length:7},(_,j)=>{const [x,y,z]=point(f,u,far*j/6);return [x,y+.023,z];});
      s.rod(i%6===0?'glaze':'tileRound',tiles,Math.min(.046,tilePitch*.17),5);
    }
    const corner=Array.from({length:13},(_,i)=>point(f,1,i/12));
    s.rod('shadowTile',corner.map(([x,y,z])=>[x,y+.11,z]),Math.max(.068,Math.min(.14,w*.009)),7);
    s.rod('bronze',corner.map(([x,y,z])=>[x,y+.18,z]),Math.max(.035,Math.min(.075,w*.004)),7);
    const [cx,cy,cz]=point(f,1,0),dx=Math.sign(cx),dz=Math.sign(cz);
    s.rod('gold',[[cx-.35*dx,cy+.07,cz-.25*dz],[cx,cy+.15,cz],[cx+.11*dx,cy+.30,cz+.08*dz],[cx+.095*dx,cy+.43,cz+.08*dz]],.055,8);
    for(let i=0;i<=Math.floor(detail/3);i++){
      const u=i/Math.floor(detail/3)*2-1;
      let a=point(f,u,0),b=point(f,u,.28);
      s.beam('heartwood',[a[0],a[1]-.145,a[2]],[b[0],b[1]-.18,b[2]],.063,.066,7);
    }
  }
  const y=eave+rise;
  if(ridge>.05){
    s.box('shadowTile',0,y+.035,0,ridge+.11,.13,.24);
    s.beam('gold',[-hr,y+.14,0],[hr,y+.14,0],.105,.105,10);
    for(const sign of [-1,1])s.rod('gold',[[sign*(hr-.27),y+.12,0],[sign*hr,y+.17,0],[sign*(hr+.11),y+.37,0],[sign*(hr+.06),y+.52,0]],.082,8);
  }
}
export function pagodaSpire(s,x,y,z,h){
  const shape=[[0,0],[.16,0],[.17,.042],[.125,.075],[.099,.10],[.125,.15],[.132,.19],[.09,.236],[.059,.265],[.052,.32],[.075,.333],[.073,.353],[.047,.37],[.035,.48],[.057,.495],[.057,.514],[.033,.53],[.022,.637],[.044,.655],[.044,.673],[.020,.689],[.007,.94],[0,1]];
  s.lathe('bronze',x,y,z,shape.map(([r,hh])=>[r*h,hh*h]),28);
}
export function rail(s,a,b,y,h=.84,tone='stonePale'){
  const [x0,z0]=a,[x1,z1]=b, width=Math.hypot(x1-x0,z1-z0);
  const n=Math.max(1,Math.round(width/1.65));
  s.local([(x0+x1)/2,y,(z0+z1)/2],-Math.atan2(z1-z0,x1-x0),()=>{
    for(let i=0;i<=n;i++){
      const x=-width/2+i*width/n;
      s.box(tone,x,h*.46,0,.17,h*.92,.17);
      s.box(tone,x,h*.91,0,.21,.09,.21);
      s.lathe(tone,x,h*.95,0,[[0,0],[.10,0],[.115,.075],[.08,.145],[.02,.19],[0,.19]],10);
    }
    for(const q of [.27,.76])s.box(tone,0,h*q,0,width,.105,.10);
  });
}
export function lantern(s,x,y,z,h){
  s.beam('bronze',[x,y+h*.83,z],[x,y+h*1.3,z],h*.025);
  s.lathe('ember',x,y,z,[[0,.08],[.23,.09],[.35,.23],[.34,.63],[.21,.77],[0,.77]].map(([r,a])=>[h*r,h*a]),8);
  for(const k of [.035,.78])s.cylinder('bronze',x,y+h*k,z,h*.25,h*.25,h*.06,8);
  for(let i=0;i<8;i++){
    const a=TAU*i/8,b=TAU*(i+.02)/8;
    s.rod('heartwood',[[x+h*.24*Math.cos(a),y+.10*h,z+h*.24*Math.sin(a)],[x+h*.34*Math.cos(b),y+h*.27,z+h*.34*Math.sin(b)],[x+h*.33*Math.cos(b),y+h*.64,z+h*.33*Math.sin(b)],[x+h*.22*Math.cos(a),y+h*.77,z+h*.22*Math.sin(a)]],.015*h,5);
  }
  s.cylinder('lacquer',x,y-h*.24,z,h*.038,h*.065,.27*h,8);
}
export function signboard(s,x,y,z,w,h){
  s.box('heartwood',x,y,z,w,h,.14);s.box('bronze',x,y,z+.072,w*.94,h*.81,.055);
  s.box('teal',x,y,z+.108,w*.91,h*.68,.045);
  for(const sign of [-1,1])for(const top of [-1,1])s.box('gold',x+sign*w*.455,y+top*h*.31,z+.145,w*.055,h*.11,.03);
}

export function openFrame(s,{w,d,base,h,r,bays=1,tablet=false}){
  const xs=Array.from({length:bays+1},(_,i)=>w*(i/bays-.5));
  for(const x of xs)for(const z of [-d/2,d/2]){
    column(s,x,base,z,r,h); bracket(s,x,base+h,z,r*2.3);
  }
  const y=base+h+.55*r*2.3;
  for(const z of [-d/2,d/2]){
    s.box('heartwood',0,y,z,w+2*r,.34,.34);s.box('teal',0,y-.06,z+.05*Math.sign(z),w+.5*r,.13,.32);
    for(let i=0;i<bays;i++){
      const x=(i+.5)*w/bays-w/2;
      if(tablet)signboard(s,x,y-.12,z+.17*Math.sign(z),w/bays*.47,.40);
    }
  }
  for(const x of [-w/2,w/2])s.box('heartwood',x,y,0,.33,.36,d+.35);
}
export function framePanel(s,x,y,z,w,h,wood='heartwood'){
  s.box(wood,x,y,z,w,h,.11);s.box('walnut',x,y,z+.057,w*.86,h*.76,.024);
  for(const sgn of [-1,1]){
    s.box('bronze',x+sgn*w*.44,y,z+.087,.025,h*.81,.028);
    s.box('bronze',x,y+sgn*h*.39,z+.087,w*.90,.025,.028);
  }
}

export function tileSection(s,{x=0,z=0,span,length,height,concave=false}){
  // An extruded arch section has two ceramic skins and both shoulder edges.
  const pts=[], thickness=.037, steps=20;
  for(let j=0;j<=steps;j++){
    const a=Math.PI*j/steps;
    pts.push([x-Math.cos(a)*span*.5,.045+(concave?height*(1-Math.sin(a)):height*Math.sin(a))]);
  }
  for(let j=steps;j>=0;j--)pts.push([pts[j][0],pts[j][1]-thickness]);
  s.profile('glaze',pts,length,z);
}
export function moulding(s,x,y,z,length,height,depth){
  // Profile sections run along the model's X axis, with the moulded face toward +Z.
  s.local([x,y,z],Math.PI/2,()=>{
    const f=depth;
    const pts=[[-f*.50,0],[f*.50,0],[f*.50,height],[0,height],[-f*.36,height],
      [-f*.49,height*.95],[-f*.50,height*.86],[-f*.39,height*.82],[-f*.47,height*.78],
      [-f*.46,height*.71],[-f*.28,height*.67],[-f*.28,height*.14],[-f*.45,height*.12],[-f*.45,height*.04]];
    s.profile('stonePale',pts,length,0);
  });
}
export function holeTab(s,x,y,z,w,h,depth){
  const T=s.T,shape=new T.Shape();
  shape.moveTo(-w*.5,0);shape.lineTo(w*.5,0);shape.lineTo(w*.5,h*.76);
  shape.lineTo(w*.30,h);shape.lineTo(-w*.30,h);shape.lineTo(-w*.5,h*.76);shape.closePath();
  const hole=new T.Path();hole.absarc(0,h*.63,w*.195,0,TAU,true);shape.holes.push(hole);
  s.emit(new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:14}),'heartwood',x,y,z-depth/2);
}
