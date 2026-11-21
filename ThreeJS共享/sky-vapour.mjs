import {createKit,seeded} from './nature-mesh.mjs';

function hash2(x,y,seed){let n=Math.imul(x+71,374761393)+Math.imul(y+127,668265263)+seed*17;n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;}
function noise(x,y,s){const a=Math.floor(x),b=Math.floor(y);let u=x-a,v=y-b;u=u*u*(3-2*u);v=v*v*(3-2*v);const h=(i,j)=>hash2(a+i,b+j,s);return (h(0,0)*(1-u)+h(1,0)*u)*(1-v)+(h(0,1)*(1-u)+h(1,1)*u)*v;}

// A fully embedded alpha sprite with internal light, scalloped rim, and no oriented billboard script.
export function densityTexture(T,seed,kind){
  const size=96,raw=new Uint8Array(size*size*4),rng=seeded(seed);
  const pads=Array.from({length:8},(_,i)=>{const a=i*2.39996;return [Math.cos(a)*(.16+.44*rng()),Math.sin(a)*(.13+.30*rng()),.35+.24*rng()];});
  for(let j=0;j<size;j++)for(let i=0;i<size;i++){
    const x=(i+.5)/size*2-1,y=(j+.5)/size*2-1;
    let fullness=0;for(const [cx,cy,r] of pads)fullness=Math.max(fullness,1-((x-cx)**2+(y-cy)**2)/r**2);
    const grain=.49*noise(x*3+7,y*3+4,seed)+.26*noise(x*7+4,y*7+5,seed+2)+.16*noise(x*16+18,y*16+8,seed+3)+.09*noise(x*33+40,y*33+48,seed+4);
    let a=0;
    if(kind==='wisp'){
      const warp=y+ .20*Math.sin(3.5*x+grain)+.13*Math.sin(2*x+seed);
      const lines=.24+.76*Math.pow(.5+.5*Math.cos(warp*35+grain*3),3);
      a=Math.max(0,1-x*x-warp*warp*2.2)**2*lines*(.28+grain*.9);
    } else {
      a=Math.max(0,Math.min(1,(fullness*.64+(grain-.39)*.75)))*Math.max(0,1-(x*x+y*y)*.78);
    }
    a*=Math.min(1,Math.max(0,(.98-Math.abs(x))*19),Math.max(0,(.98-Math.abs(y))*19));
    const k=(j*size+i)*4,shade=Math.max(0,Math.min(1,.48+.37*y-.15*x+.47*(grain-.5)));
    const lit=kind==='wisp'?.86+.11*grain:.66+.31*shade+.04*grain;
    raw[k]=255*Math.min(1,lit+.045*shade);raw[k+1]=255*Math.min(1,lit+.023);raw[k+2]=255*Math.min(1,lit+.106*(1-shade));raw[k+3]=Math.round(Math.min(1,a)*255);
  }
  const map=new T.DataTexture(raw,size,size);map.name='Handpainted_'+kind;map.colorSpace=T.SRGBColorSpace;map.magFilter=T.LinearFilter;map.minFilter=T.LinearMipmapLinearFilter;map.generateMipmaps=true;map.needsUpdate=true;return map;
}
export function vapour(T,d){
  const k=createKit(T),g=new T.Group(),rng=seeded(d.seed),times=[0,d.period*.25,d.period*.5,d.period*.75,d.period],tracks=[];
  g.name=d.name;
  const maps=[densityTexture(T,d.seed,d.form==='cirrus'?'wisp':'cloud'),densityTexture(T,d.seed+47,d.form==='cirrus'?'wisp':'cloud')];
  for(let layer=0;layer<3;layer++) {
    const group=new T.Group();group.name='Drift_layer_'+layer;g.add(group);
    const materials=[0,1].map((v)=>new T.MeshBasicMaterial({color:k.mix(d.palette[Math.min(layer,d.palette.length-1)],d.palette[Math.min(layer+1,d.palette.length-1)],v*.24),map:maps[v],transparent:true,opacity:d.opacity*(.77+.10*layer),side:T.DoubleSide,depthWrite:false}));
    const coordinates=[[],[]],uv=[[],[]],indices=[[],[]],plane=new T.PlaneGeometry(1,1);
    function puff(center,w,h,angle,tilt,roll,i){
      const transform=new T.Matrix4().compose(center,new T.Quaternion().setFromEuler(new T.Euler(tilt,angle,roll,'YXZ')),k.vec(w,h,1));
      const p=plane.attributes.position,tex=plane.attributes.uv,off=coordinates[i].length/3;
      for(let n=0;n<p.count;n++){
        const v=new T.Vector3().fromBufferAttribute(p,n).applyMatrix4(transform);
        coordinates[i].push(v.x,v.y,v.z);uv[i].push(tex.getX(n),tex.getY(n));
      }
      for(const ix of plane.index.array)indices[i].push(off+ix);
    }
    for(let i=0;i<d.puffs;i++){
      const t=(i+.35*rng())/d.puffs,a=i*2.39996+layer,offset=(rng()-.5);
      let x,y,z,w,h;
      if(d.form==='sea'){
        const rr=Math.sqrt(t),scallop=1+.16*Math.sin(a*3)+.08*Math.cos(a*5);
        x=Math.cos(a)*rr*d.width*.47*scallop;z=Math.sin(a)*rr*d.depth*.47*scallop;
        const channel=Math.abs(z-.17*d.depth*Math.sin(x/d.width*7+.4));
        const roll=.5+.5*Math.sin(.43*x+.34*z);
        y=d.height*(.16+.23*layer+.31*roll+.18*rng());w=d.width*(.13+.10*rng());h=d.height*(.68+.64*roll+.3*rng());
        if(channel<d.depth*.10 && layer>0){y*=.48;h*=.45;w*=.68;}
      }else if(d.form==='band'){
        x=(t-.5)*d.width;z=Math.sin(t*Math.PI*2+.3)*d.depth*.38+offset*d.depth*.25;
        y=d.height*(.32+.29*Math.sin(t*4)+layer*.15+.24*rng());w=d.width*(.11+.10*rng());h=d.height*(.39+.67*rng());
        if(i%7===0){h*=.62;w*=1.4;z+=d.depth*.12;}
      }else if(d.form==='valley'){
        x=(t-.5)*d.width;z=Math.cos(t*5+.9)*d.depth*.22+offset*d.depth*.47;
        y=d.height*(.12+layer*.22+.23*rng());w=d.width*(.22+.16*rng());h=d.height*(.21+.44*rng());
        if(layer===0){w*=1.2;z+=d.depth*.15*Math.sin(8*t);}
      }else if(d.form==='cirrus'){
        x=(t-.5)*d.width;z=(layer-1)*d.depth*.29+Math.sin(t*3+layer)*d.depth*.13;
        y=d.height*(.20+.73*t+layer*.28+.21*rng());w=d.width*(.19+.20*rng());h=d.height*(.44+.59*rng());
      }else{
        const rr=Math.sqrt(t);x=Math.cos(a)*rr*d.width*.42;z=Math.sin(a)*rr*d.depth*.43;
        y=d.height*(.12+layer*.14+rng()*.24+.29*(1-rr));w=d.width*(.19+.13*rng());h=d.height*(.55+.65*rng());
      }
      const center=k.vec(x,y,z);
      puff(center,w,h,d.form==='cirrus'?rng()*.2:rng()*.55,(rng()-.5)*.26,d.form==='cirrus'?.12+rng()*.12:(rng()-.5)*.22,i%2);
      puff(center,w*.73,h*.85,(d.form==='cirrus'?.65:1.38)+rng()*.45,-.12+rng()*.24,.06-i%2*.12,(i+1)%2);
      if(d.form==='sea'||d.form==='valley')puff(center,w*.88,w*.60,rng()*2,-1.32+rng()*.2,rng()*.26,i%2);
    }
    for(let i=0;i<2;i++){
      const geom=new T.BufferGeometry();geom.setAttribute('position',new T.Float32BufferAttribute(coordinates[i],3));geom.setAttribute('uv',new T.Float32BufferAttribute(uv[i],2));geom.setIndex(indices[i]);geom.computeVertexNormals();
      const mesh=new T.Mesh(geom,materials[i]);mesh.renderOrder=layer;mesh.name='Soft_density_'+i;group.add(mesh);
    }
    const dist=d.width*(.011+.005*layer),vals=[];
    for(let j=0;j<times.length;j++) {
      const amp=Math.sin(j*Math.PI/2+layer*1.7);
      vals.push(amp*dist,amp*d.height*.055,amp*d.depth*.016);
    }
    group.position.set(...vals.slice(0,3));tracks.push(new T.VectorKeyframeTrack(group.name+'.position',times,vals));
  }
  if(d.form==='spray'){
    const bubbles=k.batch('Impact_droplets',{roughness:.3}),streaks=k.batch('Airborne_water_marks',{unlit:true,transparent:true,opacity:.67});
    for(let i=0;i<120;i++){
      const a=rng()*2*Math.PI,r=rng(),h=d.height*(.12+Math.sin(Math.PI*r)*(.44+.56*rng())),p=k.vec(Math.cos(a)*r*d.width*.44,h,Math.sin(a)*r*d.depth*.42);
      const rr=(.008+.020*rng())*d.height;
      k.ellipsoid(bubbles,p,[rr,rr*(1.2+1.6*rng()),rr],0x96d4df,0xe5f4f5,6,4);
      if(i%9===0){const q=p.clone();q.y*=.5;k.bough(streaks,[q,[p.x*.93,p.y*.81,p.z*.92],p],[rr*.18,rr*.35,rr*.12],0x75c3d8,0xd7eef1,4,5);}
    }bubbles.finish(g);streaks.finish(g);
  }
  g.animations=[new T.AnimationClip('Slow_air_drift',d.period,tracks)];return g;
}
