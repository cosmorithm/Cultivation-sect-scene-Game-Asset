import {createKit} from './nature-mesh.mjs';

function embroidery(T,ratio){
  const w=160,h=448,data=new Uint8Array(w*h*4);
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){
    const u=(i+.5)/w,v=(j+.5)/h,edge=Math.min(u,1-u);
    const warp=2*Math.sin(i*2.32)+1.6*Math.sin(j*1.8)+2.3*Math.sin(i*.27+j*.034);
    const wave=2.7*Math.sin(11.8*u-5*v)+1.2*Math.cos(29*v+2*u);
    let rgb=[235+wave,216+wave,180+wave];
    if(edge<.038||v<.022||v>.978)rgb=[183,143,78];
    else if(edge<.051||v<.032||v>.968)rgb=[228,192,124];
    else if((edge>.078&&edge<.085)||(v>.935&&v<.942))rgb=[198,164,110];
    const x=(u-.5)/.325,y=(.35-v)/(.325/ratio),r=Math.hypot(x,y);
    if(r<1){
      rgb=[219,221,187];
      if(r>.905)rgb=[93,143,133];
      else {
        const far=.36-.84*Math.abs(x+.37)+.04*Math.sin(x*15);
        const mid=.58-1.11*Math.abs(x-.18)+.045*Math.cos(x*16);
        const near=.20-.36*Math.cos(x*5+.5)+.06*Math.sin(x*12);
        if(y<far)rgb=[153,176,149];if(y<mid)rgb=[103,152,135];if(y<near-.29)rgb=[77,128,116];
        if(y<-.37&&y>-.51+.07*Math.sin(x*7))rgb=[192,202,166];
      }
    } else if(v>.74&&edge>.11){
      const arc=Math.cos(u*Math.PI*4)*.04;
      if(Math.abs(v-.87-arc)<.006 || Math.abs(v-.85-arc)<.003)rgb=[215,185,131];
    }
    const idx=(j*w+i)*4;for(let n=0;n<3;n++)data[idx+n]=Math.max(0,Math.min(255,Math.round(rgb[n]+warp)));data[idx+3]=255;
  }
  const tex=new T.DataTexture(data,w,h);tex.name='Loom_silk_and_jade_mountain_roundel';tex.magFilter=T.LinearFilter;tex.minFilter=T.LinearMipmapLinearFilter;tex.generateMipmaps=true;tex.colorSpace=T.SRGBColorSpace;tex.needsUpdate=true;return tex;
}
export function banner(T,d){
  const k=createKit(T),g=new T.Group();g.name=d.name;
  const material=new T.MeshStandardMaterial({name:'Woven_ivory_silk',map:embroidery(T,d.height/d.width),roughness:.77,side:T.DoubleSide});
  const nx=23,ny=47,positions=[],uv=[],indices=[],gust=[],release=[];
  function cloth(u,v,wind,phase){
    const corners=Math.min(1,2*Math.abs(u-.5));
    const z=.023*Math.sin(4.6*u+1.8*v)+v*.024*Math.sin(6.5*v-5*u)
      +wind*v**1.2*(.14*Math.sin(7.2*v+phase-2.1*u)+.12*Math.sin(3.5*v-1.2*u+phase));
    return [(u-.5)*d.width+wind*v*v*(.26+.19*Math.sin(v*3.3+phase)),.13+(1-v)*d.height-.19*v**7*(1-corners)+wind*.16*v*v,z];
  }
  for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){
    const u=i/nx,v=j/ny;positions.push(...cloth(u,v,0,0));gust.push(...cloth(u,v,1.0,.7));release.push(...cloth(u,v,-.52,2.6));uv.push(u,v);
  }
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+1,c=a+nx+1;indices.push(a,c,b,b,c,c+1);}
  const geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();
  geo.morphAttributes.position=[new T.Float32BufferAttribute(gust,3),new T.Float32BufferAttribute(release,3)];
  geo.morphAttributes.normal=[gust,release].map(points=>{
    const temp=new T.BufferGeometry();temp.setAttribute('position',new T.Float32BufferAttribute(points,3));temp.setIndex(indices);temp.computeVertexNormals();return temp.getAttribute('normal');
  });
  const textile=new T.Mesh(geo,material);textile.name='Silk_banner';textile.updateMorphTargets();g.add(textile);
  const mount=k.batch('Bronze_crossbar',{metalness:.57,roughness:.37}),laces=k.batch('Woven_loops');
  k.bough(mount,[[-d.width*.75,2.46,0],[d.width*.75,2.46,0]],[.033,.033],0xa98449,0xd0ac69,14,2);
  for(const s of [-1,1]){
    const tip=s*d.width*.74;
    k.ellipsoid(mount,[tip,2.46,0],[.055,.058,.057],0x9c783c,0xe0b76a,14,8);
    const x=s*d.hangerSpacing*.5,loop=new T.Mesh(new T.TorusGeometry(.056,.014,8,22),new T.MeshStandardMaterial({color:0xb98f4e,metalness:.53,roughness:.40}));loop.rotation.y=Math.PI/2;loop.position.set(x,2.433,0);loop.name='Suspension_loop_'+(s+1);g.add(loop);
    k.bough(laces,[[x,2.39,.030],[x,2.35,.026],[x,2.33,.014]],[.023,.024,.020],0xb99b67,0xe2c28e,7,3);
  }
  mount.finish(g);laces.finish(g);
  const times=[0,.18,.39,.61,.81,1].map(t=>t*d.period);
  g.animations=[new T.AnimationClip('Pinned_silk_gust',d.period,[new T.NumberKeyframeTrack(textile.name+'.morphTargetInfluences',times,[0,.25, .62,0, 1,0, .18,.32, 0,.91, 0,.25])])];
  return g;
}
