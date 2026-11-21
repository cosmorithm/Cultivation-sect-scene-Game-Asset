import { makeSurface, surfaceFamily } from './architecture-surfaces.mjs';
// Parametric timber joinery, fired roof tiles and cut-stone details.
// Coordinates are in metres. The visitor approaches along +Z.
const tones = {
  lacquer:[0x985746,.51,.025], heartwood:[0x754732,.61,.018], walnut:[0x513627,.65,0],
  teal:[0x30585a,.52,.05], glaze:[0x42697b,.43,.06], tileRound:[0x648797,.40,.07],
  shadowTile:[0x304a56,.55,.04], bronze:[0x997b52,.51,.68], gold:[0xbca174,.47,.68],
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
    if(!this.batches.has(key))this.batches.set(key,{tone,positions:[],normals:[],colors:[],uv:[],index:[]});
    const b=this.batches.get(key), off=b.positions.length/3;
    const mat=new T.Matrix4().compose(new T.Vector3(x,y,z),q,new T.Vector3(sx,sy,sz)).premultiply(this.frame);
    const normMat=new T.Matrix3().getNormalMatrix(mat);
    const p=new T.Vector3(),n=new T.Vector3();
    const pos=geo.getAttribute('position');
    if(!geo.getAttribute('normal'))geo.computeVertexNormals();
    const normal=geo.getAttribute('normal');
    if(!geo.boundingBox)geo.computeBoundingBox();
    const extent=geo.boundingBox.clone().applyMatrix4(mat).getSize(new T.Vector3());
    const axis=extent.x>=extent.y&&extent.x>=extent.z?'x':extent.y>=extent.z?'y':'z';
    const family=surfaceFamily(tone);
    for(let i=0;i<pos.count;i++){
      p.fromBufferAttribute(pos,i).applyMatrix4(mat); n.fromBufferAttribute(normal,i).applyNormalMatrix(normMat);
      b.positions.push(p.x,p.y,p.z); b.normals.push(n.x,n.y,n.z);
      const grain=Math.sin(p.x*2.37+p.z*1.71+Math.sin(p.y*1.97))*.5+Math.sin(p.z*5.1+p.y*.9)*.5;
      const k=.955+.039*grain; b.colors.push(k,k,k);
      const vertical=Math.abs(n.y)>.73,side=Math.abs(n.x)>Math.abs(n.z);
      if(family==='timber'||family==='lacquer'){
        // Long grain follows each actual beam, post or individual bracket arm.
        const length=p[axis];
        const cross=axis==='y'?(side?p.z:p.x):axis==='x'?(vertical?p.z:p.y):(vertical?p.x:p.y);
        b.uv.push(cross/.89,length/2.7);
      }else{
        const repeat=family==='stone'?2.35:family==='glaze'?1.1:.85;
        b.uv.push((vertical||!side?p.x:p.z)/repeat,(vertical?p.z:p.y)/repeat);
      }
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
      g.setAttribute('color',new T.Float32BufferAttribute(b.colors,3));
      g.setAttribute('uv',new T.Float32BufferAttribute(b.uv,2));g.setIndex(b.index);
      if(!this.materials.has(b.tone)){
        const [color,roughness,metalness]=tones[b.tone];
        const m=new T.MeshStandardMaterial({name:b.tone,color,roughness,metalness,...makeSurface(T,surfaceFamily(b.tone)),vertexColors:true,side:T.DoubleSide});
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
  if(w>2.8&&d>1.5&&h>.31){
    const bay=1.38, num=Math.max(2,Math.round(w/bay)), side=Math.max(2,Math.round(d/bay));
    for(const sign of [-1,1]){
      for(let i=1;i<num;i++)s.box('carving',x+w*(i/num-.5),y+.53*h,z+sign*(d*.5+.001),.012,.54*h,.011);
      for(let i=1;i<side;i++)s.box('carving',x+sign*(w/2+.001),y+.53*h,z+d*(i/side-.5),.011,.54*h,.012);
    }
  }
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
        for(const sign of [-1,1]){
          s.box('lacquer',sign*w*.40,cy+.26*k,0,.20*k,.09*k,.31*k);
          if(level>0){
            s.box('teal',sign*w*.40,cy+.248*k,.163*k,.158*k,.051*k,.026*k);
            s.box('bronze',sign*w*.40,cy+.248*k,.178*k,.052*k,.019*k,.018*k);
          }
        }
      });
    }
    s.box('walnut',0,.74*k,0,1.27*k,.11*k,.48*k);
    s.box('teal',0,.73*k,.25*k,1.02*k,.085*k,.035*k);
    s.scroll('bronze',0,.699*k,.275*k,.55*k,.075*k,.012*k);
  });
}
export function lattice(s,x,y,z,w,h,window=true){
  const rim=Math.min(w*.042,.10), rb=.5*rim;
  if(window)s.box('silk',x,y,z-.045,w,h,.06);
  for(const side of [-1,1]){
    s.box('heartwood',x+side*(w-rim)/2,y,z,rim,h,.12);
    s.box('heartwood',x,y+side*(h-rim)/2,z,w,rim,.12);
  }
  for(const sign of [-1,1])for(const up of [-1,1]){
    const cx=x+sign*(w*.5-rim),cy=y+up*(h*.5-rim);
    const u=Math.min(w*.09,.15),v=Math.min(h*.07,.13);
    s.rod('heartwood',[[cx-sign*2*u,cy,z+.070],[cx-sign*2*u,cy-up*v,z+.070],[cx-sign*u,cy-up*v,z+.070],[cx-sign*u,cy-up*2*v,z+.070],[cx,cy-up*2*v,z+.070]],Math.max(.010,rb*.38),5);
  }
  const panels=w>2?3:2;
  for(let j=0;j<panels;j++){
    const dw=(w-2*rim)/panels,cx=x+(j+.5-panels/2)*dw;
    for(const f of [-.32,-.16,.16,.32])s.box('walnut',cx+f*dw,y,z+.035,rb*.60,h-rim,.055);
    for(const f of [-.35,-.24,.24,.35])s.box('walnut',cx,y+f*h,z+.04,dw-.018,rb*.64,.055);
    if(j<panels-1)s.box('heartwood',cx+dw/2,y,z+.025,rb*1.65,h-rim,.09);
  }
}
export function timberHall(s,{w,d,base,postH,r,bays=3,bodyDepth=.76,court=false,medallion=false,customWindow=lattice}){
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
          if(!medallion)customWindow(s,cx,dh*.69,.20,dw*.42,dh*.51,true);
          s.ringXY('bronze',x+dir*dw*.073,dh*.47,.226,dw*.027,.013);
        }
        if(medallion){
          s.ringXY('bronze',x,dh*.53,.207,dw*.27,.035);s.scroll('gold',x,dh*.51,.22,dw*.46,dh*.18,.015);
        }
      }else{
        const ww=span*(court?.73:.77);
        customWindow(s,x,postH*.53,.1,ww,postH*.53);
        s.box('heartwood',x,postH*.24,.125,ww+.12,.085,.24);
      }
    }
    s.box('heartwood',0,.17,.06,w,.32,.22);s.box('heartwood',0,postH*.92,.075,w,.22,.20);
  });
  for(const sign of [-1,1])s.local([sign*w/2,base,(front+back)/2],sign*Math.PI/2,()=>{
    const side=(front-back); const positions=court?[-.24,.24]:[0];
    for(const off of positions)customWindow(s,off*side,postH*.57,.03,side*(court?.25:.48),postH*(court?.30:.47));
    s.box('heartwood',0,.16,.02,side,.30,.15);
  });
}

export function roof(s,{w,d,eave,rise,ridge=w*.52,lift=Math.min(.95,d*.10),tilePitch=.23,edge=true,gable=0}){
  const T=s.T,hw=w/2,hd=d/2,hr=ridge/2;
  const cornerLift=(u,v)=>lift*Math.pow(Math.abs(u),4.5)*(1-v)*(1-v);
  const hipBreak=1-gable;
  function point(face,u,v){
    // In a hip-and-gable roof only the lower end skirt is tiled. Above the
    // break the front and rear slopes reach the vertical timber gable.
    if(face%2===1)v*=hipBreak;
    const endX=gable?hr+(hw-hr)*Math.max(0,1-v/hipBreak)**1.16:hw+(hr-hw)*v;
    const y=eave+rise*(.46*v+.54*v*v)+cornerLift(u,v);
    if(face===0)return [u*endX,y,hd*(1-v)];
    if(face===1)return [endX,y,-u*hd*(1-v)];
    if(face===2)return [-u*endX,y,-hd*(1-v)];
    return [-endX,y,u*hd*(1-v)];
  }
  for(let f=0;f<4;f++){
    const horizontal=f%2===0, detail=Math.min(92,Math.max(14,Math.floor((horizontal?w:d)/tilePitch)));
    const nu=Math.max(18,Math.ceil(detail/2)), nv=9;
    const p=[],index=[];
    for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++)p.push(...point(f,i/nu*2-1,j/nv));
    for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){
      const a=j*(nu+1)+i,b=a+1,c=a+nu+1,e=c+1;
      index.push(a,b,c);if(j!==nv-1||(horizontal&&hr>0)||(!horizontal&&gable>0))index.push(b,e,c);
    }
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));
    g.setIndex(index);g.computeVertexNormals();s.emit(g,'glaze');
    const inner=g.clone();inner.translate(0,-.115,0);s.emit(inner,'walnut');
    const bedding=Array.from({length:12},(_,j)=>point(f,j/5.5-1,.25));
    s.rod('heartwood',bedding.map(([x,y,z])=>[x,y-.168,z]),.118,8);
    const eaves=Array.from({length:17},(_,i)=>point(f,i/8-1,0));
    s.rod('heartwood',eaves.map(([x,y,z])=>[x,y-.13,z]),.105,7);
    s.rod('shadowTile',eaves.map(([x,y,z])=>[x,y-.044,z]),.087,7);
    const reachX=f===1?1:f===3?-1:0,reachZ=f===0?1:f===2?-1:0;
    if(edge)s.rod('bronze',eaves.map(([x,y,z])=>[x+(gable?.10:0)*reachX,y+(gable?-.027:.005),z+(gable?.10:0)*reachZ]),gable?.033:.027,6);
    for(let i=1;i<detail;i++){
      const u=2*i/detail-1,fixed=u*(horizontal?hw:hd);
      let far=((horizontal&&hr>0)||(!horizontal&&gable>0))?1:.91;
      const rad=Math.min(.066,tilePitch*.238);
      const extent=t=>Math.abs(point(f,1,t)[horizontal?0:2]);
      if(gable&&Math.abs(fixed)+rad>extent(far)){
        let lo=0,hi=far;
        for(let step=0;step<16;step++){
          const mid=(lo+hi)/2;
          if(extent(mid)>Math.abs(fixed)+rad)lo=mid;else hi=mid;
        }
        far=lo;
      }
      const trace=t=>point(f,gable?fixed/Math.max(.001,extent(t)):u,t);
      const courses=Math.max(gable?2:5,Math.min(12,Math.round((horizontal?hd:hw-hr)*(gable?far:1)/.50)));
      const p=[],idx=[];
      const axis=new T.Vector3(...point(f,u+.003,0)).sub(new T.Vector3(...point(f,u-.003,0))).normalize();
      // Each semicircular cap tile has a broad flared toe, a narrow shoulder
      // tucked under the next piece, and a quarter-round change in highlight.
      for(let j=0;j<courses;j++)for(const [fp,rm] of [[0,1.18],[.13,1.02],[.995,.89]]){
        const t=(j+fp)/courses*far, xyz=trace(t), r=rad*rm;
        const center=new T.Vector3(...xyz);center.y+=.014;
        for(let side=0;side<=5;side++){
          const a=Math.PI*side/5;
          const v=center.clone().addScaledVector(axis,r*Math.cos(a));v.y+=r*Math.sin(a);
          p.push(v.x,v.y,v.z);
        }
        const n=p.length/3-6;
        if(n)for(let k=0;k<5;k++)idx.push(n-6+k,n+k,n-6+k+1,n+k,n+k+1,n-6+k+1);
      }
      const cap=new T.BufferGeometry();cap.setAttribute('position',new T.Float32BufferAttribute(p,3));
      cap.setIndex(idx);cap.computeVertexNormals();s.emit(cap,i%7===1?'glaze':'tileRound');
      const toe=trace(0), inward=trace(Math.min(far*.9,.025));
      const dir=new T.Vector3(...toe).sub(new T.Vector3(...inward));dir.y*=.35;dir.normalize();
      const center=new T.Vector3(...toe);center.y-=rad*(gable?1.2:.38);
      const front=center.clone().addScaledVector(dir,rad*(gable?2.95:.58));
      s.beam('shadowTile',center.toArray(),front.toArray(),rad*1.36,rad*1.37,10);
      if(gable||i%2===0){
        const tip=front.clone().addScaledVector(dir,rad*.16);
        s.beam('tileRound',front.toArray(),tip.toArray(),rad*(gable?1.16:.76),rad*(gable?1.06:.62),9);
        if(gable&&i%2===0){
          const seal=tip.clone().addScaledVector(dir,rad*.130);
          s.beam('bronze',tip.toArray(),seal.toArray(),rad*.36,rad*.30,7);
        }
      }
    }
    const corner=Array.from({length:13},(_,i)=>point(f,1,i/12*(horizontal?hipBreak:1)));
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
  // An enclosed timber soffit and two layers of purlins bridge the bracket
  // heads to the inner body of the roof even when viewed from below.
  const beam=Math.min(.26,Math.max(.12,d*.027));
  s.box('walnut',0,eave-.255,0,w*.735,beam,d*.71);
  for(const z of [-d*.326,d*.326])
    s.box('heartwood',0,eave-.15,z,w*.765,beam*1.3,beam*1.25);
  for(const x of [-w*.339,w*.339])
    s.box('heartwood',x,eave-.11,0,beam*1.25,beam*1.25,d*.68);
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
