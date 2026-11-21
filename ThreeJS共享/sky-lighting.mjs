// Atmosphere materials use portable glTF textures and mesh attributes.
const TAU = 2*Math.PI;
function wrap(a,n){return ((a%n)+n)%n;}
function hash(x,y){
  let n=Math.imul(x+137,789221)^Math.imul(y+451,124433);
  n=Math.imul(n^(n>>>15),2246822519);
  return ((n^(n>>>13))>>>0)/4294967295;
}
function smooth(t){return t*t*(3-2*t);}
function field(u,v,w,h){
  const x=u*w,y=v*h, ix=Math.floor(x),iy=Math.floor(y),fx=smooth(x-ix),fy=smooth(y-iy);
  const cell=(i,j)=>hash(wrap(ix+i,w),iy+j);
  return (cell(0,0)*(1-fx)+cell(1,0)*fx)*(1-fy)+(cell(0,1)*(1-fx)+cell(1,1)*fx)*fy;
}
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
function mix(a,b,t){return a.map((c,i)=>c+(b[i]-c)*t);}
export function skyTexture(T, emitterU, emitterV, colours){
  const w=640,h=192,buf=new Uint8Array(w*h*4);
  const [bottom,middle,top,sunWarm,sunCore]=colours;
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){
    const u=(i+.5)/w,v=(j+.5)/h;
    let c=v<.46?mix(bottom,middle,smooth(v/.46)):mix(middle,top,smooth((v-.46)/.54));
    const lon=Math.min(Math.abs(u-emitterU),1-Math.abs(u-emitterU));
    const radius=(lon/.17)**2+((v-emitterV)/.26)**2;
    const solar=Math.exp(-radius*1.7), core=Math.exp(-radius*43);
    c=mix(c,sunWarm,.85*solar);c=mix(c,sunCore,.80*core);
    const pattern=.54*field(u+Math.sin(v*9)*.018,v,8,10)+.30*field(u+.17,v,22,23)+.16*field(u+.31,v,65,71);
    const stratus=Math.pow(clamp((pattern-.51)*3.35),1.3)*clamp((.88-v)*3)*clamp((v+.02)*7);
    const stretched=.48*field(u+.07*field(u,v,3,3),v,8,29)+.32*field(u+.016*Math.sin(v*10),v,22,48)+.20*field(u,v,49,85);
    const wisp=Math.pow(clamp((stretched-.49)*3.3),1.75)*clamp((.88-v)*2.8)*clamp(v*6);
    const feather=clamp((.31*stratus+.58*wisp)*(.66+.34*solar));
    c=mix(c,mix([223,232,248],[255,207,164],solar),feather);
    const off=4*(j*w+i);for(let k=0;k<3;k++)buf[off+k]=Math.round(clamp(c[k],0,255));buf[off+3]=255;
  }
  const texture=new T.DataTexture(buf,w,h);
  texture.colorSpace=T.SRGBColorSpace;texture.wrapS=T.RepeatWrapping;
  texture.magFilter=T.LinearFilter;texture.minFilter=T.LinearMipmapLinearFilter;
  texture.generateMipmaps=true;texture.needsUpdate=true;texture.name='Horizon_to_zenith';
  return texture;
}
export function colourLight(T,name,hex,intensity,direction) {
  const light=new T.DirectionalLight(hex,intensity);
  light.name=name;
  const dir=new T.Vector3(...direction).normalize();
  light.position.copy(dir).multiplyScalar(-6);
  light.quaternion.setFromUnitVectors(new T.Vector3(0,0,-1),dir);
  light.target.position.set(0,0,-1);light.add(light.target);
  light.updateMatrixWorld(true);
  return light;
}

export function mountain(T,{name,x=0,z=0,scale=1,seed=1,foot=0x647477,shade=0x626e73,edge=0xa38e71,haze=0xb8d2df,depth=.1,fadeBase=false}){
  const cols=35,rows=24,positions=[],colours=[],indices=[];
  const rock=new T.Color(shade),lit=new T.Color(edge),base=new T.Color(foot),air=new T.Color(haze);
  const shape=[[-.86,.43,.12],[-.60,.72,.18],[-.29,.56,.19],[-.08,1.08,.145],[.16,.79,.17],[.39,.99,.113],[.65,.56,.18],[.81,.40,.15]];
  for(let a=0;a<=rows;a++)for(let b=0;b<=cols;b++){
    const u=b/cols*2-1,v=a/rows*2-1;
    const noise=field((u+1)/2+seed*.078,(v+1)/2+seed*.043,15,12);
    let peak=.09,focus=0;
    for(const [cx,height,spread] of shape){
      const h=height*Math.exp(-(Math.abs(u-cx)**1.55)/(spread**1.55)*.68);
      if(h>peak){peak=h;focus=cx;}
    }
    const ridge=Math.sin(8*u+seed)*.18+.065*Math.sin(23*u);
    const across=Math.abs(v-ridge);
    const skirt=Math.max(0,1-across*(1.05+.12*Math.sin(13*u)));
    const cut=Math.max(0,1-Math.abs(u)**4)*Math.max(0,1-Math.abs(v)**3);
    const cliff=(.68*peak+.28)*skirt**1.6*cut;
    const rough=(noise-.45)*.18*cut+Math.sin((u-v*.15)*55)*.040*cut;
    const y=Math.max(.015,cliff+rough);
    const jitter=b===0||b===cols?0:(hash(b+seed,a)-.5)*.025;
    // Irregular tapered bases let these ridges blend into valley mist.
    const margin=clamp(Math.abs(v)**3+Math.abs(u)**4);
    const endTaper=.64+.36*Math.sqrt(Math.max(0,1-u*u));
    const sideTaper=.85+.15*Math.sqrt(Math.max(0,1-v*v));
    const planNoise=1+.08*margin*(noise-.5)*2;
    positions.push((u+jitter)*sideTaper*4.4*scale*planNoise,y*5.2*scale,v*endTaper*2.1*scale*planNoise);
    const west=clamp((focus-u)*3.3+(.57-noise)*.78);
    const colour=rock.clone().lerp(lit,west*(1-depth*.8)).lerp(base,clamp((.32-y)*2));
    const fog=clamp(depth+(1-depth)*.56*Math.exp(-y*5.2)+.075*noise);
    colour.lerp(air,fog);colours.push(colour.r,colour.g,colour.b);
    if(fadeBase)colours.push(smooth(clamp((y-.016)/.20))*smooth(clamp((1-Math.abs(v))*6))*smooth(clamp((1-Math.abs(u))*8)));
    if(a<rows&&b<cols){
      const i=a*(cols+1)+b,k=i+cols+1;
      if((a+b)%2)indices.push(i,k,i+1,i+1,k,k+1);else indices.push(i,k,k+1,i,k+1,i+1);
    }
  }
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  geometry.setAttribute('color',new T.Float32BufferAttribute(colours,fadeBase?4:3));geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const mat=new T.MeshStandardMaterial({name:'Mist_'+name,color:0xffffff,vertexColors:true,roughness:1,flatShading:true,transparent:fadeBase,side:T.DoubleSide});
  const mesh=new T.Mesh(geometry,mat);mesh.name=name;mesh.position.set(x,0,z);return mesh;
}
export function windowRadiance(T,x,y,z,w,h){
  // Paper is farther from the viewer than the grille. The fine horizontal
  // fibres and soft darker edges live in an embedded self-lit colour map.
  const n=96,bytes=new Uint8Array(n*n*4);
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){
    const u=(i+.5)/n,v=(j+.5)/n;
    const center=clamp(1.15-((u-.46)/.63)**2*.36-((v-.43)/.68)**2*.56);
    const grain=.055*(hash(i,j)-.5)+.025*Math.sin(v*TAU*36);
    const c=mix([183,95,42],[255,212,134],clamp(center+grain));
    const off=(j*n+i)*4;bytes.set([...c.map(Math.round),255],off);
  }
  const tex=new T.DataTexture(bytes,n,n);tex.colorSpace=T.SRGBColorSpace;tex.needsUpdate=true;
  tex.magFilter=T.LinearFilter;tex.minFilter=T.LinearFilter;tex.name='SilkLanternFibre';
  const mat=new T.MeshStandardMaterial({name:'Illuminated_oiled_paper',color:0xc6a16d,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:1.42,roughness:.93});
  const mesh=new T.Mesh(new T.BoxGeometry(w,h,.055),mat);mesh.position.set(x,y,z);mesh.name='RecessedSilkEmitter';return mesh;
}
