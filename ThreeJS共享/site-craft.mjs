// Shared masonry and joinery. All lengths are metres; +Z faces the entrance.
export function workshop(T) {
  const root = new T.Group(), materials = {};
  const palette = {
    stone: [0xb2ada0,.82], light: [0xc8c1ae,.76], cool: [0x939a93,.87],
    joint: [0x747b74,.94], shadow: [0x6b6665,.91], relief: [0xcbbfa6,.76],
    gold: [0x95774c,.48,.65], bronze:[0x544a3b,.61,.55], red:[0x884a38,.58],
    wood:[0x593a2d,.73], darkWood:[0x392c27,.68], blue:[0x406571,.4,.1],
    teal:[0x537b7e,.45,.08], silk:[0xe8d7b0,.85], paper:[0xffcc82,.63],
    motif:[0xa48657,.56,.42], charcoal:[0x526370,.77]
  };
  for (const [k,[color,roughness,metalness=0]] of Object.entries(palette)) {
    materials[k]=new T.MeshStandardMaterial({name:k,color,roughness,metalness});
  }
  materials.paper.emissive.setHex(0xffae43);
  materials.paper.emissiveIntensity=.26;
  const stoneKeys = new Set(['stone','light','cool','joint','relief']);
  // Small flecks on broad honed surfaces keep the motif legible at a distance.
  const size=128, rockPixels=new Uint8Array(size*size*4),paperPixels=rockPixels.slice();
  let seed=1847;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    const noise=(seed>>>16)/65535,u=x/size,v=y/size,tau=Math.PI*2;
    const vein=Math.sin(tau*(2*u+v)+1.8*Math.sin(tau*(u-2*v))+.35*Math.sin(tau*(7*u+v)));
    const mica=(1-Math.abs(vein))**14;
    const fall=Math.sin(tau*(3*u-2*v+.16*Math.sin(tau*5*v)));
    const value=Math.round(230+9*fall+8*vein+15*(noise-.5)+8*mica-(noise<.045?22:0));
    const i=(y*size+x)*4;
    rockPixels.set([value,Math.min(255,value+1),Math.min(255,value+2),255],i);
    const glow=(Math.sin(Math.PI*u)*Math.sin(Math.PI*v))**.52;
    const fibre=(Math.sin(tau*u*23)*.5+noise*.5)*7;
    paperPixels.set([238+14*glow,160+82*glow+fibre,77+135*glow+fibre,255],i);
  }
  function materialMap(data,name,repeat){
    const t=new T.DataTexture(data,size,size,T.RGBAFormat);
    t.name=name;t.wrapS=t.wrapT=repeat?T.RepeatWrapping:T.ClampToEdgeWrapping;
    t.colorSpace=T.SRGBColorSpace;t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;
    t.generateMipmaps=true;t.needsUpdate=true;return t;
  }
  const tex=materialMap(rockPixels,'Honed limestone • bedding and mica',true);
  for(const k of stoneKeys)materials[k].map=tex;
  materials.paper.map=materialMap(paperPixels,'Silk lantern shade',false);
  materials.paper.emissiveMap=materials.paper.map;
  const buckets=new Map(), v=new T.Vector3(), normal=new T.Vector3(), nMatrix=new T.Matrix3();
  const Q=new T.Quaternion(), one=new T.Vector3(1,1,1);
  const vector=p=>new T.Vector3(...p);
  function add(geo, key, x=0,y=0,z=0, q=Q, s=one) {
    if(typeof key!=='string')throw Error('Material key required');
    const b=buckets.get(key)||{pos:[],normal:[],uv:[],index:[]};
    buckets.set(key,b);
    const matrix=new T.Matrix4().compose(new T.Vector3(x,y,z),q,s);
    nMatrix.getNormalMatrix(matrix);
    const p=geo.attributes.position,n=geo.attributes.normal,uv=geo.attributes.uv,base=b.pos.length/3;
    for(let i=0;i<p.count;i++){
      v.fromBufferAttribute(p,i).applyMatrix4(matrix);normal.fromBufferAttribute(n,i).applyMatrix3(nMatrix).normalize();
      b.pos.push(v.x,v.y,v.z);b.normal.push(normal.x,normal.y,normal.z);
      if(stoneKeys.has(key)||!uv) {
        const ax=Math.abs(normal.x),ay=Math.abs(normal.y),az=Math.abs(normal.z);
        b.uv.push((ax>az&&ax>ay?v.z:v.x)*.82,(ay>=ax&&ay>=az?v.z:v.y)*.82);
      }else b.uv.push(uv.getX(i),uv.getY(i));
    }
    if(geo.index){for(const j of geo.index.array)b.index.push(base+j);}
    else for(let i=0;i<p.count;i++)b.index.push(base+i);
  }
  const cube=new T.BoxGeometry();
  const cutCache=new Map();
  function bevelledBox(w,h,d) {
    const key=[w,h,d].map(v=>v.toFixed(4)).join('/');
    if(cutCache.has(key))return cutCache.get(key);
    const half=[w/2,h/2,d/2],chamfer=Math.min(.023,Math.min(w,h,d)*.077);
    const pos=[],index=[];
    function corner(sign,face){
      return sign.map((v,i)=>v*(half[i]-(i===face?0:chamfer)));
    }
    function poly(vertices,out){
      const v0=new T.Vector3(...vertices[0]),v1=new T.Vector3(...vertices[1]).sub(v0),v2=new T.Vector3(...vertices[2]).sub(v0);
      if(v1.cross(v2).dot(new T.Vector3(...out))<0)vertices.reverse();
      const start=pos.length/3;
      for(const v of vertices)pos.push(...v);
      for(let i=1;i<vertices.length-1;i++)index.push(start,start+i,start+i+1);
    }
    for(let axis=0;axis<3;axis++)for(const faceSign of [-1,1]){
      const face=[[1,1],[-1,1],[-1,-1],[1,-1]].map(([a,b])=>{
        const s=[0,0,0];s[axis]=faceSign;s[(axis+1)%3]=a;s[(axis+2)%3]=b;return corner(s,axis);
      });
      const n=[0,0,0];n[axis]=faceSign;poly(face,n);
    }
    for(let axis=0;axis<3;axis++)for(const a of [-1,1])for(const b of [-1,1]){
      const i=(axis+1)%3,j=(axis+2)%3,n=[0,0,0];n[i]=a;n[j]=b;
      const lo=[...n],hi=[...n];lo[axis]=-1;hi[axis]=1;
      poly([corner(lo,i),corner(hi,i),corner(hi,j),corner(lo,j)],n);
    }
    for(const x of [-1,1])for(const y of [-1,1])for(const z of [-1,1]){
      const n=[x,y,z];poly([corner(n,0),corner(n,1),corner(n,2)],n);
    }
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));
    geo.setIndex(index);geo.computeVertexNormals();cutCache.set(key,geo);return geo;
  }
  function box(k,x,y,z,w,h,d,ry=0,rz=0,rx=0){
    const q=new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz,'YXZ'));
    if(stoneKeys.has(k)&&Math.min(w,h,d)>.065)add(bevelledBox(w,h,d),k,x,y,z,q);
    else add(cube,k,x,y,z,q,new T.Vector3(w,h,d));
  }
  function cylinder(k,x,y,z,top,bottom,h,segments=24,ry=0){
    const q=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),ry);
    add(new T.CylinderGeometry(top,bottom,h,segments),k,x,y,z,q);
  }
  function bar(k,a,b,w,h=w){
    const start=vector(a),end=vector(b),direction=end.clone().sub(start),length=direction.length();
    if(length<1e-7)return;
    const center=start.add(end).multiplyScalar(.5),q=new T.Quaternion().setFromUnitVectors(new T.Vector3(1,0,0),direction.normalize());
    add(cube,k,center.x,center.y,center.z,q,new T.Vector3(length,h,w));
  }
  function rod(k,points,r,segments=6,smooth=true){
    if(points.length<2 || r<=0)return;
    const curve=new T.CatmullRomCurve3(points.map(vector),false,'centripetal');
    add(new T.TubeGeometry(curve,smooth?Math.max(6,points.length*2):points.length-1,r,segments,false),k);
  }
  function lathe(k,x,y,z,profile,segments=16,phase=0){
    const q=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),phase);
    add(new T.LatheGeometry(profile.map(p=>new T.Vector2(...p)),segments),k,x,y,z,q);
  }
  function mesh(k,positions,indices,smooth=false){
    let g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions.flat(),3));g.setIndex(indices.flat());
    if(!smooth)g=g.toNonIndexed();g.computeVertexNormals();add(g,k);
  }
  function finish(name){
    root.name=name;
    for (const [key,b] of buckets){
      const g=new T.BufferGeometry();
      g.setAttribute('position',new T.Float32BufferAttribute(b.pos,3));
      g.setAttribute('normal',new T.Float32BufferAttribute(b.normal,3));
      g.setAttribute('uv',new T.Float32BufferAttribute(b.uv,2));g.setIndex(b.index);
      const part=new T.Mesh(g,materials[key]);part.name=name+'_'+key;root.add(part);
    }
    return root;
  }
  return {T,root,materials,add,box,cylinder,bar,rod,lathe,mesh,finish};
}

export function tileStrip(k,corners,bottom,key='stone'){
  // Vertices run from the approach towards the exit, then across the deck.
  const ring=corners,center=ring.reduce((sum,p)=>sum.map((v,i)=>v+p[i]/4),[0,0,0]);
  const shortest=Math.min(...ring.map((p,i)=>Math.hypot(p[0]-ring[(i+1)%4][0],p[2]-ring[(i+1)%4][2])));
  const bevel=Math.min(.016,shortest*.075,bottom*.18);
  const top=ring.map(p=>{
    const vx=center[0]-p[0],vz=center[2]-p[2],len=Math.max(.001,Math.hypot(vx,vz));
    return [p[0]+bevel*vx/len,p[1],p[2]+bevel*vz/len];
  });
  const p=[...top,...ring.map(v=>[v[0],v[1]-bevel,v[2]]),...ring.map(v=>[v[0],v[1]-bottom,v[2]])];
  const [a,b,,d]=ring;
  const orientation=(b[2]-a[2])*(d[0]-a[0])-(b[0]-a[0])*(d[2]-a[2]);
  const faces=[[0,1,2],[0,2,3],[10,9,8],[11,10,8]];
  for(let row=0;row<2;row++)for(let i=0;i<4;i++){
    const j=(i+1)%4,up=row*4,low=up+4;
    faces.push([low+i,low+j,up+j],[low+i,up+j,up+i]);
  }
  if(orientation<0)for(const f of faces)f.reverse();
  k.mesh(key,p,faces);
}

export function reliefCloud(k,cx,cy,cz,w,h,angle=0,tone='relief'){
  const map=(x,y)=>[cx+x*Math.cos(angle),cy+y,cz-x*Math.sin(angle)];
  for(const side of [-1,1]){
    const pts=[[.005,.0],[.15,.02],[.25,.38],[.35,.38],[.42,.13],[.38,-.06],[.335,.03],[.357,.12]];
    k.rod(tone,pts.map(([x,y])=>map(side*x*w,y*h)),Math.min(h*.07,w*.025),5);
    k.rod(tone,[[.05,-.18],[.16,-.34],[.265,-.28],[.39,-.30],[.49,-.04]].map(([x,y])=>map(side*x*w,y*h)),h*.041,5);
  }
}

export function ring(k,cx,y,cz,r,width,key='relief',innerRadius) {
  const inner=innerRadius??Math.max(.001,r-width*.5),outer=r+width*.5,n=64;
  const pts=[],f=[];
  for(let i=0;i<n;i++){
    const a=i/n*Math.PI*2;
    pts.push([cx+inner*Math.cos(a),y,cz+inner*Math.sin(a)],[cx+outer*Math.cos(a),y,cz+outer*Math.sin(a)]);
  }
  for(let i=0;i<n;i++){const j=(i+1)%n;f.push([2*i,2*j,2*i+1],[2*j,2*j+1,2*i+1]);}
  k.mesh(key,pts,f);
}
export function rosette(k,cx,y,cz,r,design='cloud'){
  ring(k,cx,y,cz,r,.055*r,'joint');ring(k,cx,y+.004,cz,r*.88,r*.025,'relief');
  ring(k,cx,y+.001,cz,r*.75,r*.018,'joint');
  const lobes=design==='lotus'?6:design==='compass'?8:4;
  for(let s=0;s<lobes;s++){
    const a=(s/lobes)*Math.PI*2;
    const form=design==='lotus'?[[.08,0],[.30,.16],[.55,.10],[.64,0],[.43,-.13],[.21,-.12],[.08,0]]:[[.09,0],[.3,.19],[.48,.22],[.58,.10],[.55,-.005],[.46,-.06],[.43,0],[.46,.065]];
    const pts=form.map(([x,z])=>[cx+r*(x*Math.cos(a)-z*Math.sin(a)),y+.015*r,cz+r*(x*Math.sin(a)+z*Math.cos(a))]);
    k.rod('motif',pts,r*.014,6);
  }
  // Engraved petal border, split into individual lozenges at the paving joints.
  for(let i=0;i<lobes*4;i++){
    const a=i*(Math.PI*2)/(lobes*4),half=(Math.PI*2)/(lobes*4)*.36;
    const point=(t,rr)=>[cx+r*rr*Math.cos(t),y+.009*r,cz+r*rr*Math.sin(t)];
    const diamond=[point(a-half,.822),point(a,.848),point(a+half,.822),point(a,.796)];
    if(i%2===0)k.mesh('cool',diamond,[[0,2,1],[0,3,2]]);
    else k.rod('relief',[...diamond,diamond[0]],r*.0046,5,false);
  }
  ring(k,cx,y+.004,cz,r*.075,r*.025,'motif');
}
