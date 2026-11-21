// Indexed vertex-colour surfaces. Coordinates are metres with Y vertical.
export function seeded(seed) {
  let state=seed>>>0;
  return ()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
}
export function createKit(T) {
  const colorCache=new Map();
  const vec=(x,y,z)=>new T.Vector3(x,y,z);
  const from=p=>Array.isArray(p)?new T.Vector3(...p):p.clone();
  function color(hex) {
    if(hex?.isColor)return hex;
    if(!colorCache.has(hex))colorCache.set(hex,new T.Color(hex));
    return colorCache.get(hex);
  }
  const mix=(a,b,t)=>color(a).clone().lerp(color(b),Math.max(0,Math.min(1,t)));
  function batch(name,settings={}) {
    const positions=[],colors=[],indices=[],uvs=[];
    function vert(p,c,uv) {
      const q=color(c),i=positions.length/3;
      positions.push(p.x,p.y,p.z);colors.push(q.r,q.g,q.b);if(settings.map)uvs.push(uv?.[0]??p.x,uv?.[1]??p.y);return i;
    }
    function finish(parent) {
      if(!indices.length)return;
      const g=new T.BufferGeometry();
      g.setAttribute('position',new T.Float32BufferAttribute(positions,3));
      g.setAttribute('color',new T.Float32BufferAttribute(colors,3));
      if(uvs.length)g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));
      g.setIndex(indices);g.computeVertexNormals();
      const {unlit=false,...params}=settings;
      const material=unlit?new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide,...params}):new T.MeshStandardMaterial({vertexColors:true,roughness:.85,metalness:0,side:T.DoubleSide,...params});
      material.name=name;
      const mesh=new T.Mesh(g,material);mesh.name=name;parent.add(mesh);return mesh;
    }
    return {vert,tri:(a,b,c)=>indices.push(a,b,c),finish};
  }
  function bough(b,knots,radii,base,tip=base,facets=9,segments=0,bark=false) {
    const curve=new T.CatmullRomCurve3(knots.map(from),false,'centripetal'),steps=segments||Math.max(5,knots.length*3);
    // Parallel-transport the local cross section to avoid abrupt twists at old-growth elbows.
    let across=null,first=0,previous=0;
    for(let j=0;j<=steps;j++){
      const t=j/steps,p=curve.getPoint(t),axis=curve.getTangent(t).normalize();
      if(!across)across=(Math.abs(axis.y)<.87?vec(0,1,0):vec(0,0,1)).cross(axis).normalize();
      across.addScaledVector(axis,-across.dot(axis)).normalize();
      const up=axis.clone().cross(across).normalize();
      const blend=t*(radii.length-1),lo=Math.min(radii.length-2,Math.floor(blend)),f=blend-lo;
      const r=Math.max(.00006,radii[lo]*(1-f)+radii[lo+1]*f);
      let start;
      for(let i=0;i<facets;i++){
        const a=2*Math.PI*i/facets,wrinkle=bark?1+.12*Math.sin(a*3+4*t)+.055*Math.sin(a*7-3*t):1;
        const v=p.clone().addScaledVector(across,r*wrinkle*Math.cos(a)).addScaledVector(up,r*wrinkle*Math.sin(a));
        const c=mix(base,tip,t*.7+(bark?.16*Math.sin(a*3+4*t):0));
        if(bark)c.multiplyScalar(.88+.16*Math.cos(a*5+t*2));
        const index=b.vert(v,c,[i/facets,t*1.8]);if(i===0)start=index;
      }
      if(j===0)first=start;
      if(j)for(let i=0;i<facets;i++){const n=(i+1)%facets;b.tri(previous+i,previous+n,start+i);b.tri(previous+n,start+n,start+i);}
      previous=start;
    }
    for(let i=1;i<facets-1;i++){b.tri(first,first+i+1,first+i);b.tri(previous,previous+i,previous+i+1);}
    return curve;
  }
  function ellipsoid(b,center,radii,col,upper=col,seg=10,rings=6,rough=0,phase=0) {
    const o=from(center),[rx,ry,rz]=radii,rows=[];
    const bottom=b.vert(o.clone().add(vec(0,-ry,0)),col);
    for(let j=1;j<rings;j++){
      const lat=-Math.PI/2+Math.PI*j/rings,row=[];
      for(let i=0;i<seg;i++){
        const a=i*2*Math.PI/seg,cr=Math.cos(lat),w=1+rough*(.45*Math.sin(3*a+phase+lat)+.35*Math.sin(5*a+phase-2*lat)+.20*Math.sin(3*lat-phase));
        const p=vec(o.x+rx*Math.cos(a)*cr*w,o.y+ry*Math.sin(lat)*w,o.z+rz*Math.sin(a)*cr*w);
        row.push(b.vert(p,mix(col,upper,.5+.48*Math.sin(lat)+.07*Math.sin(3*a+phase))));
      }
      rows.push(row);
    }
    const cap=b.vert(o.clone().add(vec(0,ry,0)),upper);
    for(let i=0;i<seg;i++){
      const n=(i+1)%seg;b.tri(bottom,rows[0][i],rows[0][n]);
      for(let j=1;j<rows.length;j++){b.tri(rows[j-1][i],rows[j][i],rows[j-1][n]);b.tri(rows[j-1][n],rows[j][i],rows[j][n]);}
      b.tri(rows.at(-1)[i],cap,rows.at(-1)[n]);
    }
  }
  // A blade has a lifted midrib and two independently curved margins.
  function blade(b,origin,yaw,length,width,rise,fall,col,tip,twist=0) {
    const o=from(origin),rows=[];
    for(let i=0;i<=5;i++){
      const t=i/5,a=yaw+twist*t,w=width*Math.pow(Math.sin(Math.PI*(.015+.97*t)),.80);
      const c=vec(o.x+Math.cos(a)*length*t,o.y+rise*Math.sin(Math.PI*t*.78)+fall*t*t,o.z+Math.sin(a)*length*t);
      const edge=vec(-Math.sin(a),0,Math.cos(a));
      rows.push([b.vert(c.clone().addScaledVector(edge,-w),mix(col,tip,t*.86)),b.vert(c.clone().add(vec(0,w*.3,0)),mix(col,tip,t*.73+.12)),b.vert(c.clone().addScaledVector(edge,w),mix(col,tip,t*.8))]);
    }
    for(let j=1;j<rows.length;j++)for(let i=0;i<2;i++){b.tri(rows[j-1][i],rows[j-1][i+1],rows[j][i]);b.tri(rows[j][i],rows[j-1][i+1],rows[j][i+1]);}
  }
  function box(group,name,center,scale,col,rough=.78) {
    const material=new T.MeshStandardMaterial({color:col,roughness:rough});
    const mesh=new T.Mesh(new T.BoxGeometry(...scale),material);mesh.name=name;mesh.position.copy(from(center));group.add(mesh);return mesh;
  }
  return {vec,from,color,mix,batch,bough,ellipsoid,blade,box};
}
