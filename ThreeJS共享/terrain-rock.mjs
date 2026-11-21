// Fractured stone meshes for the sect's islands, crags and distant peaks.
// The authored horizontal sections control the silhouette. Angular faults cut
// the same vertical strata across adjacent sections, so the rock reads as one mass.
const TAU=Math.PI*2;
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
function hash(a,b,seed){
  let x=Math.imul(a+177,374761393)^Math.imul(b+433,668265263)^Math.imul(seed+37,1103515245);
  x=Math.imul(x^(x>>>13),1274126177);
  return ((x^(x>>>16))>>>0)/4294967296;
}
function smoothNoise(x,y,z,seed){
  const ix=Math.floor(x),iy=Math.floor(y),iz=Math.floor(z);
  const fade=v=>v*v*(3-2*v), fx=fade(x-ix),fy=fade(y-iy),fz=fade(z-iz);
  const values=[];
  for(let dz=0;dz<2;dz++)for(let dy=0;dy<2;dy++){
    const a=hash(ix,iy+dy,seed+(iz+dz)*79),b=hash(ix+1,iy+dy,seed+(iz+dz)*79);
    values.push(a+(b-a)*fx);
  }
  const a=values[0]+(values[1]-values[0])*fy,b=values[2]+(values[3]-values[2])*fy;
  return a+(b-a)*fz;
}
function fabric(T) {
  const w=256,bytes=new Uint8Array(w*w*4);
  const mod=(x,m)=>((x%m)+m)%m;
  // A periodic cell-boundary field yields broken mineral veins, instead of evenly spaced stripes.
  function fault(u,v,nx,ny,seed){
    const xx=u*nx,yy=v*ny,ix=Math.floor(xx),iy=Math.floor(yy);
    let near=100,next=100;
    for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){
      const a=ix+i,b=iy+j,cellX=mod(a,nx),cellY=mod(b,ny);
      const dx=a+.14+.72*hash(cellX,cellY,seed)-xx,dy=b+.14+.72*hash(cellX,cellY,seed+13)-yy;
      const d=dx*dx+dy*dy;
      if(d<near){next=near;near=d;}else if(d<next)next=d;
    }
    return Math.sqrt(next)-Math.sqrt(near);
  }
  for(let y=0;y<w;y++)for(let x=0;x<w;x++){
    const u=x/w,v=y/w,noise=hash(x,y,36),wave=Math.sin(TAU*(u+v))+.45*Math.sin(TAU*(3*u-v));
    const uu=u+.036*wave;
    const split=fault(uu-.04*Math.sin(TAU*v),v,8,2,35);
    const secondary=fault(u+.04*Math.sin(TAU*v),v,5,8,26);
    const vein=clamp(1-split/.057,0,1),quartz=clamp(1-Math.abs(secondary-.045)/.035,0,1);
    const streak=.5+.5*Math.cos(TAU*(8*uu-v+.12*wave));
    const bed=.5+.5*Math.sin(TAU*(10*v+u+.34*Math.sin(TAU*(u-2*v))));
    const val=clamp(Math.round(222+19*streak+9*bed+25*(noise-.52)-49*vein**1.6+12*quartz-(noise<.056?21:0)),0,255);
    bytes.set([val,Math.min(255,val+1),Math.min(255,val+3),255],4*(y*w+x));
  }
  const t=new T.DataTexture(bytes,w,w,T.RGBAFormat);t.name='Weathered phyllite, fracture and quartz beds';
  t.wrapS=t.wrapT=T.RepeatWrapping;t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;
  t.generateMipmaps=true;t.colorSpace=T.SRGBColorSpace;t.needsUpdate=true;return t;
}
export function rockStudio(T,seed,{tone='slate',grain=1}={}){
  const palettes={
    slate:[0x697985,0x435565,0xa3a398], shale:[0x807a70,0x58585a,0xa89b87],
    mist:[0x788d9b,0x4c677a,0xa9b1a5], blue:[0x687b8e,0x404e62,0x949b9a]
  };
  const [base,dark,mica]=palettes[tone].map(hex=>new T.Color(hex));
  const lichen=new T.Color(0x979167), grass=new T.Color(0x84944d);
  const faces=[];
  function facet(a,b,c,random,moss=0,wear=0){faces.push({a,b,c,moss,wear});}
  function finish(name){
    const bounds=new T.Box3();
    for(const f of faces)for(const p of [f.a,f.b,f.c])bounds.expandByPoint(new T.Vector3(...p));
    const span=bounds.getSize(new T.Vector3()),scale=Math.max(.05,span.x,span.y,span.z),fscale=scale*.133;
    const divisions=faces.length>4000?3:4,positions=[],colors=[],normals=[],uv=[];
    const warpCache=new Map(), tint=new T.Color(),pa=new T.Vector3(),pb=new T.Vector3(),pc=new T.Vector3(),n=new T.Vector3(),q=new T.Vector3();
    const variation=(x,y,z,k)=>smoothNoise(x,y,z,seed+k);
    function warp(point){
      const key=point.map(v=>Math.round(v*1e5)).join('/');
      if(warpCache.has(key))return warpCache.get(key);
      const [px,py,pz]=point,x=px/fscale,y=py/fscale,z=pz/fscale;
      const broad=variation(x*.75,y*.45,z*.75,3),strata=variation(x*1.58+.12*y,y*.25,z*1.58-.10*y,9);
      const joint=variation(x*4.4+.22*y,y*.79,z*4.4-.26*y,26);
      const bed=variation(x*1.5,y*4.4+.44*x,z*1.5,31);
      const d=clamp((py-bounds.min.y)/Math.max(.05,span.y*.09),0,1);
      const hx=(variation(x*.84,y*.54,z*.84,42)-.5)*.22+(strata-.5)*.20+(joint-.5)*.083;
      const hz=(variation(z*.89,x*.88,y*.52,86)-.5)*.25+(variation(z*1.79-.17*y,y*.32,x*1.79,60)-.5)*.23+(joint-.5)*.078;
      const h=(variation(x*.86,y*.62,z*.86,21)-.5)*.18+(bed-.52)*.092+(joint-.5)*.053;
      const pos=[px+hx*fscale,py+h*fscale*d,pz+hz*fscale];
      const mapped={pos,broad,strata,joint,bed};warpCache.set(key,mapped);return mapped;
    }
    function out(a,b,c,moss,wear){
      pa.fromArray(a.pos);pb.fromArray(b.pos);pc.fromArray(c.pos);
      n.crossVectors(q.subVectors(pb,pa),pc.sub(pa));
      if(n.lengthSq()<1e-15)return;n.normalize();
      for(const v of [a,b,c]){
        const p=v.pos;
        const crevice=clamp(1-Math.abs(v.strata-.53)*7,0,1);
        const value=(v.broad-.46)*.65+(v.joint-.48)*.42+(v.bed-.44)*.28 + (n.y*.027) - .095*crevice + wear*.16;
        tint.copy(base).lerp(value<0?dark:mica,clamp(Math.abs(value)*1.75,0,.8));
        if(moss>0 && n.y>-.18){
          const patch=clamp(moss*(.27+v.broad*.25+v.joint*.75+v.bed*.15)-.12,0,.88);
          tint.lerp(moss>.48?grass:lichen,patch);
        }
        positions.push(...p);normals.push(n.x,n.y,n.z);colors.push(tint.r,tint.g,tint.b);
        if(Math.abs(n.y)>.71)uv.push((p[0]+.15*p[2])/grain,(p[2]-.1*p[0])/grain);
        else uv.push((Math.abs(n.x)>.72?p[2]:p[0])/grain,(p[1]+.21*p[0])/grain);
      }
    }
    for(const f of faces){
      const grid=[];
      for(let i=0;i<=divisions;i++){
        const row=[];
        for(let j=0;j<=divisions-i;j++){
          const t=i/divisions,u=j/divisions;
          row.push(warp(f.a.map((v,k)=>v+(f.b[k]-v)*t+(f.c[k]-v)*u)));
        }
        grid.push(row);
      }
      for(let i=0;i<divisions;i++)for(let j=0;j<divisions-i;j++){
        out(grid[i][j],grid[i+1][j],grid[i][j+1],f.moss,f.wear);
        if(j<divisions-i-1)out(grid[i+1][j],grid[i+1][j+1],grid[i][j+1],f.moss,f.wear);
      }
    }
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));
    g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
    const mat=new T.MeshStandardMaterial({color:0xffffff,map:fabric(T),vertexColors:true,roughness:.91,metalness:.011,name:'Jointed '+tone});
    const mesh=new T.Mesh(g,mat);mesh.name=name+'_stone';const root=new T.Group();root.name=name;root.add(mesh);return root;
  }
  return {facet,finish,seed};
}

// sections = [elevation, fractional X radius, fractional Z radius, x drift, z drift].
// Elevation, drift and radii are fractions of the bounding dimensions.
export function mass(studio,{
  x=0,y=0,z=0,rx,rz,h,sections,seed=1,segments:N=25,rotation=0,
  rough=.14,moss=.10,capRelief=.025,edgeBias,topShape,facetWear=0
}){
  const S=seed+studio.seed, layers=[],ridges=[];
  for(let i=0;i<N;i++){
    const t=TAU*i/N;
    ridges.push(.47*Math.sin(3*t+S)+.25*Math.sin(5*t+.63*S)+.18*Math.sin(11*t+.17*S)+(hash(i,0,S)-.45)*.67);
  }
  function capColor(a,r,f){
    return clamp(moss*(.32+.62*((.5+.5*Math.sin(4*a+.2*S+r*3)))+.28*f),0,1);
  }
  const transform=(px,py,pz)=>[x+px*Math.cos(rotation)-pz*Math.sin(rotation),y+py,z+px*Math.sin(rotation)+pz*Math.cos(rotation)];
  for(let j=0;j<sections.length;j++){
    const [ey,ax,az,dx=0,dz=0]=sections[j],row=[];
    const terminal=j===0||j===sections.length-1;
    for(let i=0;i<N;i++){
      const a=TAU*(i+(hash(i,1,S)-.5)*.42)/N;
      const ripple=rough*(ridges[i]+.28*Math.sin(ey*7+2*a)+.34*(hash(i,j+87,S)-.5));
      const notch=edgeBias?edgeBias(a,ey):1;
      const px=(ax*(1+ripple)*Math.cos(a)*notch+dx)*rx;
      const pz=(az*(1+ripple)*Math.sin(a)*notch+dz)*rz;
      const yRipple=(.45*Math.sin(3*a+.1*S+ey*4)+.4*(hash(i,9,S)-.5))*(terminal?capRelief:Math.min(.048,.20*rough));
      row.push(transform(px,(ey+yRipple)*h,pz));
    }
    layers.push(row);
  }
  for(let j=0;j<layers.length-1;j++)for(let i=0;i<N;i++){
    const q=(i+1)%N,a=layers[j][i],b=layers[j+1][i],c=layers[j+1][q],d=layers[j][q];
    const weather=(hash(i,7,S)-.5)*.4+facetWear+(j===layers.length-2?.045:0);
    const green=(j>=layers.length-3?moss*.36:0)*hash(i,101,S);
    if(hash(i,j,77)>.46){
      studio.facet(a,b,c,hash(i,j,S),green,weather);
      studio.facet(a,c,d,hash(i,j,S)*.63+hash(i+7,j,S)*.37,green*.72,weather-.025);
    }else{
      studio.facet(a,b,d,hash(i,j,S),green,weather);
      studio.facet(b,c,d,hash(i+9,j,S)*.33+hash(i,j,S)*.67,green*.74,weather+.017);
    }
  }
  // Build overlapping tapered plates directly on the authored cliff, following a
  // section-to-section fault. The open back of every plate stays inside the stone.
  if(h>1 && rx>1 && rz>1){
    const plates=Math.max(6,Math.floor(N*.68));
    for(let p=0;p<plates;p++){
      const i=Math.floor(p*N/plates),q=(i+1)%N;
      const low=Math.min(layers.length-2,Math.floor(hash(p,2,S)*Math.max(1,(layers.length-1)*.52)));
      const high=Math.min(layers.length-1,low+1+Math.floor(hash(p,5,S)*Math.max(1,layers.length*.52)));
      const base=layers[low],top=layers[high],r0=base[i],r1=base[q],t0=top[i],t1=top[q];
      const mx=(t0[0]+t1[0])*.5-x,mz=(t0[2]+t1[2])*.5-z,length=Math.max(.0001,Math.hypot(mx,mz));
      const ox=mx/length,oz=mz/length;
      const thick=Math.min(rx,rz)*(.055+.095*hash(p,15,S));
      const mix=(a,b,t)=>a.map((v,j)=>v+(b[j]-v)*t);
      const raised=(v,out,yShift)=>[v[0]+ox*out,v[1]+yShift,v[2]+oz*out];
      const bot=raised(mix(r0,r1,.32+.29*hash(p,17,S)),thick*.52,-.016*h);
      const left=raised(mix(t0,r0,.21+.18*hash(p,29,S)),thick,0);
      const right=raised(mix(t1,r1,.23+.16*hash(p,41,S)),thick*.85,0);
      const crownL=raised(mix(t0,t1,.05),thick*.60,.013*h),crownR=raised(mix(t0,t1,.79),thick*.65,.015*h);
      const topMid=raised(mix(t0,t1,.42),thick*.6,.025*h);
      const pMid=raised(mix(mix(t0,t1,.43),bot,.35),thick*.86,0);
      const tri=(a,b,c,w=0)=>studio.facet(a,b,c,.5,moss*.2,w);
      tri(bot,left,pMid,-.1);tri(bot,pMid,right,-.12);tri(left,crownL,pMid,.03);tri(pMid,crownL,topMid,.02);tri(pMid,topMid,crownR,.05);tri(pMid,crownR,right);
      tri(crownL,t0,topMid,.12);tri(topMid,t0,t1,.12);tri(topMid,t1,crownR,.12);
      tri(r0,left,bot,-.12);tri(t0,crownL,left,-.12);tri(r0,t0,left,-.16);tri(bot,right,r1,-.1);tri(right,crownR,t1,-.14);tri(right,t1,r1,-.14);
    }
  }
  function cap(top){
    const j=top?sections.length-1:0,ring=layers[j];
    const [ey,ax,az,dx=0,dz=0]=sections[j];
    const center=transform(dx*rx,ey*h,dz*rz),rings=[ring];
    function pt(r,i){
      const p=ring[i],a=TAU*i/N;
      const nx=Math.cos(a)*r,nz=Math.sin(a)*r;
      const displacement=(top&&topShape?topShape(nx,nz):0)+(top?capRelief*(1-r)*(.48*Math.sin(3*a+.33*S+r*6)+.32*hash(i,7,S)):0);
      return [center[0]+(p[0]-center[0])*r,center[1]+(p[1]-center[1])*r+displacement*h,center[2]+(p[2]-center[2])*r];
    }
    const ringsCount=top&&topShape?9:3;
    for(let u=1;u<ringsCount;u++)rings.push(Array.from({length:N},(_,i)=>pt(1-u/ringsCount,i)));
    const tri=(a,b,c,i,s,rad)=>{
      const rand=hash(i,s,S),green=top?capColor(TAU*i/N,rad,rand):0;
      if(top)studio.facet(a,b,c,rand,green,facetWear+.02);
      else studio.facet(a,c,b,rand,0,-.08);
    };
    for(let u=0;u<rings.length-1;u++)for(let i=0;i<N;i++){
      const q=(i+1)%N,o=rings[u],inn=rings[u+1],r=1-u/ringsCount;
      tri(o[i],inn[i],o[q],i,u+18,r);tri(o[q],inn[i],inn[q],i,u+24,r);
    }
    const c=[...center];
    if(top&&topShape)c[1]+=topShape(0,0)*h;
    const inner=rings.at(-1);
    for(let i=0;i<N;i++)tri(inner[i],c,inner[(i+1)%N],i,38,0);
  }
  cap(true);cap(false);
}

// Irregular stratified rock arch, open in +Z / -Z and closed around the tube.
// Progress runs from left foot up the arch to the right foot.
export function naturalArch(studio,{width,depth,height,seed=1}){
  const n=33,m=20,S=studio.seed+seed,rings=[];
  for(let j=0;j<=n;j++){
    const t=j/n,theta=Math.PI*(1-t),rise=Math.sin(theta);
    const cx=width*(.345*Math.cos(theta)+.027*Math.sin(2*theta)),cy=height*(.74*rise**.90+.055*Math.sin(2*theta));
    const rx=width*(.110+.026*Math.sin(t*13)+.05*(1-rise)**2+.040*Math.exp(-((t-.36)**2)/.008));
    const rz=depth*(.34+.11*Math.cos(t*8)+.15*(1-rise)),row=[];
    for(let i=0;i<m;i++){
      const a=i*TAU/m,chip=1+.15*Math.cos(5*a+t*9)+.069*Math.sin(3*a-t*8)+.12*(hash(i,j,S)-.5);
      const radial=rx*chip*Math.cos(a);
      row.push([cx+radial*Math.cos(theta),cy+radial*Math.sin(theta),rz*chip*Math.sin(a)+depth*.025*Math.sin(t*9)]);
    }
    rings.push(row);
  }
  for(let j=0;j<n;j++)for(let i=0;i<m;i++){
    const ni=(i+1)%m,a=rings[j][i],b=rings[j+1][i],c=rings[j+1][ni],d=rings[j][ni],color=hash(i,j,S);
    studio.facet(a,c,b,color,0,(hash(i,1,S)-.5)*.28);
    studio.facet(a,d,c,color*.67+hash(i,j+1,S)*.33,0,(hash(i,1,S)-.5)*.28);
  }
  for(const j of [0,n]){
    const row=rings[j],c=[0,0,0];
    for(const p of row)for(let k=0;k<3;k++)c[k]+=p[k]/m;
    for(let i=0;i<m;i++){
      const q=(i+1)%m;if(j===0)studio.facet(c,row[q],row[i],.4);else studio.facet(c,row[i],row[q],.4);
    }
  }
}
