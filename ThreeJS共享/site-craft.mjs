// Shared masonry and joinery. All lengths are metres; +Z faces the entrance.
export function workshop(T) {
  const root = new T.Group(), materials = {};
  const palette = {
    stone: [0xd6c9b5,.88], light: [0xe7dcc6,.81], cool: [0xb6ada3,.87],
    joint: [0x8f877d,.94], shadow: [0x6b6665,.91], relief: [0xe1d3b8,.79],
    gold: [0xb89150,.42,.56], bronze:[0x715338,.54,.49], red:[0x884a38,.58],
    wood:[0x593a2d,.73], darkWood:[0x392c27,.68], blue:[0x406571,.4,.1],
    teal:[0x537b7e,.45,.08], silk:[0xe8d7b0,.85], paper:[0xffcb72,.53],
    motif:[0xc29855,.59,.23], charcoal:[0x526370,.77]
  };
  for (const [k,[color,roughness,metalness=0]] of Object.entries(palette)) {
    materials[k]=new T.MeshStandardMaterial({name:k,color,roughness,metalness});
  }
  materials.paper.emissive.setHex(0xffae43);
  materials.paper.emissiveIntensity=.46;
  const stoneKeys = new Set(['stone','light','cool','joint','relief']);
  // Small flecks on broad honed surfaces keep the motif legible at a distance.
  const rockPixels=new Uint8Array(64*64*4);
  let seed=1847;
  for(let y=0;y<64;y++)for(let x=0;x<64;x++){
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    const n=(seed>>>16)/65535;
    const cloud=Math.sin(2*Math.PI*x/64+1.8*Math.sin(2*Math.PI*y/64));
    const v=Math.round(240+7*cloud+12*(n-.5)-(n<.045?16:0)), i=(y*64+x)*4;
    rockPixels.set([v,v,Math.min(255,v+1),255],i);
  }
  const tex=new T.DataTexture(rockPixels,64,64,T.RGBAFormat);
  tex.name='Honed-limestone-grain';tex.wrapS=tex.wrapT=T.RepeatWrapping;
  tex.colorSpace=T.SRGBColorSpace;tex.magFilter=T.LinearFilter;tex.minFilter=T.LinearMipmapLinearFilter;
  tex.generateMipmaps=true;tex.needsUpdate=true;
  for(const k of stoneKeys)materials[k].map=tex;
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
  function box(k,x,y,z,w,h,d,ry=0,rz=0,rx=0){
    const q=new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz,'YXZ'));
    add(cube,k,x,y,z,q,new T.Vector3(w,h,d));
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
  const [a,b,c,d]=corners;
  const ring=[a,b,c,d];
  const p=[...ring,...ring.map(v=>[v[0],v[1]-bottom,v[2]])];
  const orient=(b[2]-a[2])*(d[0]-a[0])-(b[0]-a[0])*(d[2]-a[2]);
  const faces=[[0,1,2],[0,2,3],[6,5,4],[7,6,4],[4,5,1],[4,1,0],[5,6,2],[5,2,1],[6,7,3],[6,3,2],[7,4,0],[7,0,3]];
  if(orient<0)for(const f of faces)f.reverse();
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
  ring(k,cx,y+.004,cz,r*.075,r*.025,'motif');
}
