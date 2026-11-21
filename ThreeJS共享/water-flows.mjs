import {createKit,seeded} from './nature-mesh.mjs';
import {densityTexture} from './sky-vapour.mjs';

function waterPaint(T,mode,seed){
  const w=256,h=256,raw=new Uint8Array(w*h*4),tau=2*Math.PI;
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){
    const u=i/(w-1),v=j/(h-1),p=(j*w+i)*4,a=u*tau,b=v*tau;
    let glint,tone,alpha=1;
    if(mode==='drop'){
      const phase=27*u+.31*Math.sin(b*1.6+a*1.8+seed)+.17*Math.cos(3.9*b+u*15);
      const heavy=.5+.5*Math.sin(a*3.1+1.52*b+.8*Math.sin(a*2));
      const streak=Math.max(0,Math.cos(phase*tau))**10;
      glint=streak*(.32+.61*heavy)+.18*heavy;
      tone=.54+.32*heavy+.12*Math.cos(a*14+b*1.8);
      const breakup=.5+.5*Math.sin(a*19+.67*Math.sin(b*8));
      alpha=(.52+.35*heavy+.13*streak)*(1-.78*Math.max(0,(v-.68)/.32)*breakup);
      raw[p]=Math.min(255,164*tone+98*glint);raw[p+1]=Math.min(255,217*tone+66*glint);raw[p+2]=Math.min(255,231*tone+44*glint);
    }else{
      const c1=Math.sin(a*4.1+1.28*Math.sin(b*5+.4)+1.0*Math.cos(a*3+b));
      const c2=Math.cos(b*4.9+.95*Math.sin(3*a+2*b)+Math.sin(a*5-b*.8));
      glint=Math.exp(-12*Math.abs(c1+c2))*.47+Math.exp(-17*Math.abs(c1-c2))*.23;
      tone=.80+.07*Math.cos(a*1.8+b*1.1)+.05*Math.cos(b*3+a);
      raw[p]=Math.min(255,183*tone+94*glint);raw[p+1]=Math.min(255,224*tone+46*glint);raw[p+2]=Math.min(255,228*tone+39*glint);
    }
    raw[p+3]=Math.round(255*alpha);
  }
  const map=new T.DataTexture(raw,w,h);map.name='Pigmented_'+mode+'_water';map.colorSpace=T.SRGBColorSpace;map.magFilter=T.LinearFilter;map.minFilter=T.LinearMipmapLinearFilter;map.generateMipmaps=true;map.needsUpdate=true;return map;
}
function impactCloud(T,g,k,name,base,w,depth,h,seed){
  const material=new T.MeshBasicMaterial({color:0xcde6ea,map:densityTexture(T,seed,'cloud'),transparent:true,opacity:.65,side:T.DoubleSide,depthWrite:false});
  const rng=seeded(seed),vertices=[],uv=[],idx=[];
  const unit=new T.PlaneGeometry(1,1);
  for(let i=0;i<22;i++){
    const p=k.vec(base.x+(rng()-.5)*w*1.06,base.y+h*(.08+.43*rng()),base.z+(rng()-.5)*depth);
    const q=new T.Quaternion().setFromEuler(new T.Euler(.10-.35*rng(),(i%3)*.88+rng()*.54,rng()*.3-.15,'YXZ'));
    const m=new T.Matrix4().compose(p,q,k.vec(w*(.24+.26*rng()),h*(.71+.60*rng()),1));
    const ix=vertices.length/3;
    for(let n=0;n<4;n++){const v=new T.Vector3().fromBufferAttribute(unit.attributes.position,n).applyMatrix4(m);vertices.push(v.x,v.y,v.z);uv.push(unit.attributes.uv.getX(n),unit.attributes.uv.getY(n));}
    for(const n of unit.index.array)idx.push(ix+n);
  }
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
  const mesh=new T.Mesh(geo,material);mesh.name=name;g.add(mesh);
}


function ripple(T,parent,name,center,radius,color,opacity,ratio=1) {
  const shape=new T.TorusGeometry(radius,radius*.018,5,44);
  const mat=new T.MeshStandardMaterial({color,roughness:.26,metalness:.05,transparent:true,opacity});
  const ring=new T.Mesh(shape,mat);ring.name=name;ring.rotation.x=-Math.PI/2;ring.scale.y=ratio;ring.position.set(...center);parent.add(ring);return ring;
}
function pulse(T,node,t,ratio=1,phase=0) {
  const times=[0,t*.25,t*.5,t*.75,t],scales=[];
  for(let j=0;j<5;j++){const a=1+.12*Math.sin(phase+j*Math.PI*.5);scales.push(a,a*ratio,1);}
  return new T.VectorKeyframeTrack(node.name+'.scale',times,scales);
}
function addClip(T,g,name,duration,tracks){if(tracks.length)g.animations=[new T.AnimationClip(name,duration,tracks)];}
export function pool(T,d){
  const k=createKit(T),g=new T.Group(),rng=seeded(d.seed);g.name=d.name;
  const bed=k.batch('Sunk_shingle_and_shallows'),water=k.batch('Jade_water',{roughness:.20,metalness:.11,transparent:true,opacity:.93,map:waterPaint(T,'pond',d.seed)}),rim=k.batch('Wet_margin'),lines=k.batch('Shallow_caustics',{unlit:true,transparent:true,opacity:.43});
  const count=100;const ring=(a,scale,level)=>{
    const serp=1+.108*Math.sin(3*a+.1)+.065*Math.sin(5*a+.8)+.04*Math.cos(7*a-.8);
    return k.vec(Math.cos(a)*d.width*.5*serp*scale,level,Math.sin(a)*d.depth*.5*serp*scale);
  };
  const hub=water.vert(k.vec(0,d.level,0),0x187a81,[.5,.5]),rings=[];
  for(let j=1;j<=11;j++){
    const f=j/11,row=[];
    for(let i=0;i<count;i++){
      const a=2*Math.PI*i/count,p=ring(a,f,d.level+.043*Math.sin(i*.36+j*1.77)*f*(1-f));
      row.push(water.vert(p,k.mix(0x247e8a,0x9bc6a1,Math.min(1,Math.pow(f,2.9)+.045*Math.sin(4*a+j*.6))),[.5+p.x/d.width*.84,.5+p.z/d.depth*.84]));
    }
    rings.push(row);
  }
  for(let i=0;i<count;i++){
    const n=(i+1)%count;water.tri(hub,rings[0][n],rings[0][i]);
    for(let j=1;j<rings.length;j++){const a=rings[j-1],b=rings[j];water.tri(a[i],a[n],b[i]);water.tri(b[i],a[n],b[n]);}
    const a=i*2*Math.PI/count,h=(i+1)*2*Math.PI/count;
    const ids=[bed.vert(ring(a,.91,0),0x586c68),bed.vert(ring(h,.91,0),0x526c67),bed.vert(ring(h,1.015,d.level+.018),0x89a19a),bed.vert(ring(a,1.015,d.level+.018),0x89a19a)];
    bed.tri(ids[0],ids[3],ids[1]);bed.tri(ids[1],ids[3],ids[2]);
    // Slender intermittent wet margin follows the waterline.
    if(i%7!==0)k.bough(rim,[ring(a,1.01,d.level+.025),ring(h,1.012,d.level+.025)],[.035,.033],0x87b5a6,0xafcdaf,5,2);
  }
  for(let i=0;i<70;i++){
    let a=rng()*Math.PI*2,r=.5+.44*rng(),span=.04+.12*rng();const knots=[];
    for(let j=0;j<5;j++)knots.push(ring(a+span*j/4,r+.008*Math.sin(j+i),d.level+.025));
    k.bough(lines,knots,[.004,.010,.004],0x89d3c1,0xc1e4ce,4,5);
  }
  bed.finish(g);water.finish(g);rim.finish(g);lines.finish(g);
  const tracks=[];
  for(let i=0;i<3;i++){
    const node=ripple(T,g,'Surface_ring_'+i,[(i-1)*d.width*.19,d.level+.033,(i%2-.5)*d.depth*.33],.30+i*.17,0xb6ddcd,.49,.76);
    tracks.push(pulse(T,node,d.period,.76,i*1.5));
  }
  addClip(T,g,'Quiet_ripples',d.period,tracks);return g;
}
// Offset per-face vertices preserve the chamfers and the flat planes of cut stone.
export function bank(T,d){
  const k=createKit(T),g=new T.Group();g.name=d.name;
  const blocks=k.batch('Dressed_stone_courses'),age=k.batch('Damp_stains_and_lichen'),mortar=k.batch('Recessed_mortar');
  const R=d.radius,half=d.arc*Math.PI/360,rng=seeded(d.seed);
  const polar=(a,r,y)=>k.vec(Math.sin(a)*r,y,R-r*Math.cos(a));
  function quad(b,points,cols){
    const ids=points.map((p,i)=>b.vert(p,cols[i]));b.tri(ids[0],ids[1],ids[2]);b.tri(ids[0],ids[2],ids[3]);
  }
  function block(b,a1,a2,r1,r2,bot,h,c,chamfer,n) {
    const cham=Math.min(chamfer,h*.21),levels=[[bot,cham],[bot+cham,0],[bot+h-cham,0],[bot+h,cham]];
    // Both long faces and the bevel use many enough segments to follow the plan curvature.
    for(let step=1;step<=n;step++){
      const fc=(v,shrink)=>a1+shrink/R+(a2-a1-2*shrink/R)*v/n;
      function pt(level,v,radSide){const [y,inset]=levels[level];return polar(fc(v,inset),radSide===0?r1+inset:r2-inset,y);}
      for(let j=1;j<levels.length;j++)for(let side=0;side<2;side++){
        const shade=j===1?.71:j===2?.91:.99,cf=k.mix(0x63756c,c,shade);
        quad(b,[pt(j-1,step-1,side),pt(j-1,step,side),pt(j,step,side),pt(j,step-1,side)],[cf,cf,c,c]);
      }
      quad(b,[pt(3,step-1,0),pt(3,step,0),pt(3,step,1),pt(3,step-1,1)],[c,c,c,c]);
      quad(b,[pt(0,step-1,0),pt(0,step-1,1),pt(0,step,1),pt(0,step,0)],[c,c,c,c]);
      for(const cap of [0,n]){
        if((cap===0&&step!==1)||(cap===n&&step!==n))continue;
        for(let j=1;j<=3;j++)quad(b,[pt(j-1,cap,0),pt(j,cap,0),pt(j,cap,1),pt(j-1,cap,1)],[c,c,c,c]);
      }
    }
  }
  block(mortar,-half+.001,half-.001,R+.015,R+d.width-.14,0,d.height-.13,0x536263,0,48);
  for(let row=0;row<3;row++){
    const ct=row===2?10:12,shift=row===1?.5:0,h=d.height/3;
    for(let i=-1;i<ct;i++){
      const a1=Math.max(-half,-half+(i+shift)*2*half/ct)+.0016,a2=Math.min(half,-half+(i+shift+1)*2*half/ct)-.0016;
      if(a2<=a1)continue;
      const c=row===2?k.mix(0xae9c8b,0xc4b6a7,rng()):k.mix(0x687e76,0x989689,rng());
      const r1=R-(row===2?.19:.12)-.012*rng(),r2=R+d.width+(row===2?.072:0)+.012*rng();
      block(blocks,a1,a2,r1,r2,row*h+.009,h-.016,c,row===2?.033:.022,4);
      // Mineral fissures on the cap and small, uneven lichen patches below the waterline.
      if(row===2){
        const a=a1+(a2-a1)*(.24+.5*rng()),len=.16+.36*rng(),top=d.height-.006;
        const knots=[polar(a,r1+.04,top),polar(a+.011,r1+.15,top+.0005),polar(a+.007,r1+len,top)];
        k.bough(age,knots,[.003,.008,.002],0x7e8178,0x92938b,4,5);
      } else for(let n=0;n<9;n++){
        const a=a1+(a2-a1)*rng(),y=row*h+.035+rng()*.23;
        for(const r of [r1-.003,r2+.003]){
          const q=polar(a,r,y),tang=k.vec(Math.cos(a),0,Math.sin(a)),up=k.vec(0,1,0),w=.025+.055*rng(),hh=.009+.029*rng();
          quad(age,[q.clone().addScaledVector(tang,-w),q.clone().addScaledVector(up,hh),q.clone().addScaledVector(tang,w*.66),q.clone().addScaledVector(up,-hh*.67)],[0x76846c,0x839078,0x718773,0x788572]);
        }
      }
    }
  }
  mortar.finish(g);blocks.finish(g);age.finish(g);return g;
}
function curtain(T,g,k,d,x,y,z,width,drop,run,index,tracks) {
  const b=k.batch('Water_curtain_'+index,{metalness:.07,roughness:.22,map:waterPaint(T,'drop',d.seed+index),transparent:true,opacity:.94,depthWrite:false});
  const foam=k.batch('Foam_filaments_'+index,{roughness:.40}),rows=[],cols=28,segments=32;
  const flow=(u,t)=>{
    // Parabolic release from the lip: steepening fall in front of the edge.
    const spread=1+.14*t*t;
    const x0=x+width*(u-.5)*spread+.024*width*Math.sin(u*17+t*3)*t;
    const zz=z+run*(1-Math.exp(-3.3*t))+.048*width*Math.sin(8.9*u+2.5*t)*t+.035*width*Math.sin(16.8*u-2.1*t)*(.3+.7*t);
    return k.vec(x0,y-drop*Math.pow(t,1.44)*(1+.021*Math.cos(u*32)),zz);
  };
  for(let j=0;j<=segments;j++){
    const t=j/segments,row=[];
    for(let i=0;i<=cols;i++){
      const u=i/cols,edge=Math.pow(Math.abs(2*u-1),3),high=.14+.32*edge+.24*Math.pow(Math.sin(u*56+t*2.1),8)+.23*t;
      row.push(b.vert(flow(u,t),k.mix(0x61abbd,0xe3f2e8,high),[u,t]));
    } rows.push(row);
  }
  for(let j=1;j<=segments;j++)for(let i=0;i<cols;i++){const a=rows[j-1],n=rows[j];b.tri(a[i],n[i],a[i+1]);b.tri(a[i+1],n[i],n[i+1]);}
  b.finish(g);
  const rng=seeded(d.seed+index);
  const strands=Math.min(37,Math.max(5,Math.round(width*5)));
  for(let i=0;i<strands;i++){
    const u=(.3+i+rng()*.45)/strands,t0=.025+rng()*.28,t1=Math.min(1,t0+.23+rng()*.49),knots=[];
    for(let j=0;j<=6;j++){const t=t0+(t1-t0)*j/6;const p=flow(u+.009*Math.sin(j+i),t);p.z+=width*.004+.012;knots.push(p);}
    const r=Math.min(.040,width*.016)*(.4+rng()*.8);
    k.bough(foam,knots,[r*.1,r*.79,r,r*.13],0x98d5d4,0xe4f4e9,5,10);
  }
  // Short detached ribbons peel away from both edges with an aerated, broken outline.
  const edges=k.batch('Separated_sheet_edges_'+index,{roughness:.26,transparent:true,opacity:.76});
  for(const sign of [-1,1])for(let j=0;j<3;j++){
    const knots=[],start=.12+.16*j;
    for(let n=0;n<=8;n++){
      const t=start+(1-start)*n/8,u=sign<0?0:1,p=flow(u,t);
      p.x+=sign*(.010+.026*j)*width*t+.014*width*Math.sin(8*t+2*j);p.z-=.032*width*Math.sin(5*t+j);knots.push(p);
    }
    const rad=Math.min(width*.016,.052);k.bough(edges,knots,[rad*.7,rad*1.15,rad*.52,rad*.04],0x62aebd,0xcbebeb,7,18);
  }
  edges.finish(g);foam.finish(g);
  if(width>.5)impactCloud(T,g,k,'Impact_vapour_'+index,k.vec(x,y-drop+.03,z+run*.94),width*1.1,Math.min(2,width*.4),Math.min(1.3,drop*.15),d.seed+12+index);
  // Short aerated veins advect down the sheet. Scale fades at the wrap hide the reset.
  for(let i=0;i<6;i++){
    const u=.08+.84*(i+.35)/6,node=new T.Group();node.name='Advected_vein_'+index+'_'+i;g.add(node);
    const patch=k.batch(node.name+'_strand',{roughness:.32});
    for(let j=0;j<3;j++){
      const offset=(j-1)*width*.021,r=Math.min(.025,width*.014);
      k.bough(patch,[[offset,.08*drop,.02],[offset+.011,0,.04],[offset-.006,-.048*drop,.055]],[.002,r,.001],0xb6e5df,0xeaf4e9,5,5);
    }
    patch.finish(node);
    const phase=i/6,cycle=(i%2+1),times=[],positions=[],scales=[];
    for(let n=0;n<=96;n++){
      const time=d.period*n/96,t=(phase+time/d.period*cycle)%1;
      const p=flow(u,.09+.83*t),fade=Math.min(1,9*t,9*(1-t));p.z+=.043;
      times.push(time);positions.push(p.x,p.y,p.z);scales.push(fade,fade,fade);
    }
    node.position.set(...positions.slice(0,3));node.scale.set(...scales.slice(0,3));
    tracks.push(new T.VectorKeyframeTrack(node.name+'.position',times,positions),new T.VectorKeyframeTrack(node.name+'.scale',times,scales));
  }
  const drops=k.batch('Moving_spray_'+index,{roughness:.28}),container=new T.Group();container.name='Moving_mist_'+index;g.add(container);
  for(let i=0;i<Math.max(24,Math.min(90,Math.round(width*13)));i++){
    const a=rng()*6.283,w=.27+.65*rng(),rr=(.009+.026*rng())*Math.min(width,3);
    let p=flow(rng(),.995);p.y+=.09+Math.sin(a)*drop*.055;p.z+=.12+w*run*.35;
    k.ellipsoid(drops,p,[rr*.75,rr*(1.2+rng()),rr],0x83c1c7,0xe4f4eb,6,4);
  }
  drops.finish(container);
  const times=[0,d.period/4,d.period/2,3*d.period/4,d.period],amplitude=Math.min(drop*.02,.12);
  tracks.push(new T.VectorKeyframeTrack(container.name+'.position',times,[0,0,0, 0,amplitude,.027, 0,0,.047, 0,-amplitude,.018, 0,0,0]));
}
export function waterfall(T,d){
  const k=createKit(T),g=new T.Group(),tracks=[];g.name=d.name;
  for(const [i,c] of d.curtains.entries())curtain(T,g,k,d,...c,i,tracks);
  addClip(T,g,'Falling_spray',d.period,tracks);return g;
}
export function overflow(T,d){
  const k=createKit(T),g=new T.Group(),tracks=[];g.name=d.name;
  const rock=k.batch('Rock_at_channels'),shore=k.batch('Wet_moss'),upstream=k.batch('Upstream_water',{roughness:.24,metalness:.07,map:waterPaint(T,'pond',d.seed)}),stream=k.batch('Current_lines');
  const rng=seeded(d.seed),rows=[];
  const edge=t=>d.mouth*.5+(1-t)*d.sourceWidth*.39+d.sourceWidth*.105*Math.sin(Math.PI*t)**2;
  for(let j=0;j<=12;j++){
    const t=j/12,row=[];
    for(let i=0;i<=18;i++){
      const u=i/18;row.push(upstream.vert(k.vec((2*u-1)*edge(t),d.drop+.04*(1-t),-d.poolLength*(1-t)),k.mix(0x238a8e,0x96d3b5,.17+.58*Math.pow(Math.abs(2*u-1),2)+.15*Math.sin(t*8+u*10)),[u,t]));
    }rows.push(row);
  }
  for(let j=1;j<rows.length;j++)for(let i=0;i<18;i++){const a=rows[j-1],b=rows[j];upstream.tri(a[i],b[i],a[i+1]);upstream.tri(b[i],b[i+1],a[i+1]);}
  for(const sign of [-1,1]){
    const segments=13,levels=5,spine=[];
    for(let i=0;i<=segments;i++){
      const t=i/segments,top=d.drop+.045+.095*rng(),lip=.43+.45*rng(),facets=[],z=-d.poolLength*(1-t);
      for(let j=0;j<levels;j++){
        const f=j/(levels-1),breaks=[.01,.13,.32,.58,.71][j],width=lip*(1-.76*f)+.17*Math.sin(20*t+j*.5);
        facets.push(k.vec(sign*(edge(t)+width),top-d.drop*(breaks+.07*rng()*f),z+.08*Math.sin(i+j*.62)*f));
      }
      spine.push({facets,inner:k.vec(sign*(edge(t)-.02),d.drop+.015,z)});
      if(i>0){
        const prev=spine[i-1],now=spine[i];
        const a=prev.facets[0],b=now.facets[0],cc=now.inner,dd=prev.inner;
        const cap=[a,b,cc,dd].map((q,j)=>rock.vert(q,k.mix(0x6c7a72,0xadb09a,.22+.51*rng())));rock.tri(cap[0],cap[1],cap[2]);rock.tri(cap[0],cap[2],cap[3]);
        for(let j=1;j<levels;j++){
          const p=[prev.facets[j-1],now.facets[j-1],now.facets[j],prev.facets[j]];
          const tone=k.mix(0x43586b,0x99a4a0,.18+.52*rng()+.18*(1-j/levels));
          const ids=p.map((q,n)=>rock.vert(q,k.mix(0x384d59,tone,n<2?.96:.76)));
          rock.tri(ids[0],ids[1],ids[3]);rock.tri(ids[1],ids[2],ids[3]);
          if(j===2||j===3){
            const l=p[0].clone().lerp(p[3],.34),r=p[1].clone().lerp(p[2],.49);l.x+=sign*.002;r.x+=sign*.002;
            k.bough(rock,[l,l.clone().lerp(r,.6).add(k.vec(0,.032,0)),r],[.009,.019,.006],0x82908e,0x898f85,4,4);
          }
        }
      }
      if(i===segments || i===0){
        for(let j=1;j<levels;j++){
          const p=facets[j],q=facets[j-1],inner=spine[i].inner,ij=inner.clone();ij.y=p.y;
          const ij0=inner.clone();ij0.y=q.y;
          const a=rock.vert(p,0x5b7077),b=rock.vert(q,0x8e988d),c=rock.vert(ij0,0x929c94),e=rock.vert(ij,0x586d74);
          rock.tri(a,b,c);rock.tri(a,c,e);
        }
      }
      if(rng()>.29){
        const center=spine[i].inner.clone().lerp(facets[0],.60),w=.12+.22*rng();
        k.ellipsoid(shore,center,[w,.035,w*.75],0x4b684a,0x839153,9,4,.18,i);
        for(let j=0;j<8;j++){
          const th=j*2.4,at=center.clone().add(k.vec(Math.cos(th)*w*.47,.026,Math.sin(th)*w*.53));
          k.blade(shore,at,th,w*(.42+.37*rng()),w*.043,w*(.32+.22*rng()),-w*.14,0x416f4a,0x9baa66,.11);
        }
      }
    }
  }
  for(let j=0;j<13;j++){
    const u=(j+.5)/13,knots=[];
    for(let i=0;i<=6;i++){const t=.18+i*.80/6;knots.push([(2*u-1)*edge(t),d.drop+.052,-d.poolLength*(1-t)]);}
    k.bough(stream,knots,[.004,.012,.008],0x84d2bc,0xb0dfcd,4,8);
  }
  rock.finish(g);shore.finish(g);upstream.finish(g);stream.finish(g);
  curtain(T,g,k,d,0,d.drop,0,d.mouth,d.drop,d.run,0,tracks);
  if(d.impact){
    for(let i=0;i<3;i++){
      const n=ripple(T,g,'Impact_ring_'+i,[0,.06+i*.003,d.run+.18],d.mouth*(.52+i*.16),0x92d6d9,.52-i*.08,.38);
      tracks.push(pulse(T,n,d.period,.38,i*1.4));
    }
  }
  addClip(T,g,'Outflow_and_impact',d.period,tracks);return g;
}
