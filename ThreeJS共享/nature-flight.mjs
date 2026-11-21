import {createKit,seeded} from './nature-mesh.mjs';

// Curved airfoil feather with a pale shaft and darker distal vane.
function feather(k,b,p,q,width,bend,base,tip,shaft=false,flightTip=false){
  const axis=q.clone().sub(p),side=k.vec(-axis.z,0,axis.x).normalize(),rows=[];
  for(let i=0;i<=8;i++){
    const t=i/8,w=width*Math.pow(Math.sin(Math.PI*(.012+.976*t)),.77)*(1-.31*t);
    const o=p.clone().addScaledVector(axis,t).addScaledVector(side,bend*Math.sin(Math.PI*t));
    const tint=k.mix(base,tip,flightTip?Math.min(1,Math.max(0,(t-.22)*2.7)):Math.min(1,.88*t+.10*t*t));
    if(flightTip)tint.multiplyScalar(1-.18*Math.sin(t*Math.PI));
    rows.push([b.vert(o.clone().addScaledVector(side,-.84*w),tint),b.vert(o.clone().add(k.vec(0,.11*w,0)),shaft?k.mix(tint,0xe1dfcc,flightTip?.058:.17):tint),b.vert(o.clone().addScaledVector(side,w),tint)]);
  }
  for(let i=1;i<rows.length;i++)for(let j=0;j<2;j++){const a=rows[i-1],n=rows[i];b.tri(a[j],n[j],a[j+1]);b.tri(a[j+1],n[j],n[j+1]);}
}
function quatTrack(T,name,axis,angles,times){
  const out=[],q=new T.Quaternion();for(const a of angles){q.setFromAxisAngle(axis,a);out.push(q.x,q.y,q.z,q.w);}
  return new T.QuaternionKeyframeTrack(name+'.quaternion',times,out);
}
export function crane(T,d){
  const k=createKit(T),g=new T.Group(),body=new T.Group(),bone=k.batch('Silvery_body_plumage'),details=k.batch('Bill_and_feet'),eyes=k.batch('Eyes');
  g.name=d.name;body.name='Flying_crane';g.add(body);
  k.ellipsoid(bone,[0,.018,0],[.111,.126,.34],0xaebdbf,0xe9e9de,20,14);
  // The dorsal scapulars overlap across the back and trail into the tail.
  for(let row=0;row<4;row++)for(let j=-3;j<=3;j++){
    const x=j*.022,z=.15-row*.075,y=.129+.015*Math.cos(j*.40)-.016*Math.abs(row-1);
    feather(k,bone,k.vec(x,y,z),k.vec(x*1.09,y-.025,z-.133),.026,.005*Math.sign(x),0xe8e7dc,0xb4c1c0,true);
  }
  k.bough(bone,[[0,.04,.13],[0,.083,.32],[0,.103,.54],[0,.155,.68],[0,.15,.75]],[.099,.067,.037,.042,.041],0xccd4d0,0xf6f0de,12,19);
  k.ellipsoid(bone,[0,.15,.725],[.043,.050,.083],0xd5dcda,0xfcf6e5,14,8);
  k.bough(details,[[0,.15,.766],[0,.146,.849],[0,.135,.962]],[.033,.017,.001],0xb18c43,0xe5c784,8,7);
  for(const s of [-1,1]){
    k.ellipsoid(eyes,[s*.037,.162,.75],[.011,.009,.013],0x26343a,0x473e39,8,5);
    k.bough(details,[[s*.046,-.071,-.15],[s*.048,-.097,-.31],[s*.034,-.070,-.52],[s*.031,-.087,-.64]],[.015,.012,.008,.004],0x595d59,0x353b3c,7,8);
    for(let i=0;i<3;i++)k.bough(details,[[s*.032,-.085,-.618],[s*.03+(i-1)*.013,-.085,-.67],[s*.024+(i-1)*.022,-.082,-.707]],[.005,.004,.001],0x4e504b,0x4d514c,4,4);
  }
  for(let j=-3;j<=3;j++)feather(k,bone,k.vec(j*.017,.035,-.15),k.vec(j*.029,-.004,-.39+.012*Math.abs(j)),.049,.012,0xdfddd2,0xb4c1c4,true);
  bone.finish(body);details.finish(body);eyes.finish(body);
  const times=[0,.22,.5,.76,1].map(t=>t*d.period),tracks=[];
  for(const s of [-1,1]){
    const shoulder=new T.Group(),wingtip=new T.Group();shoulder.name=s<0?'Left_wing':'Right_wing';wingtip.name=shoulder.name+'_hand';body.add(shoulder);shoulder.add(wingtip);
    shoulder.position.set(s*.074,.055,.05);wingtip.position.set(s*.52,.085,.01);
    const cover=k.batch('Coverts_'+shoulder.name),primary=k.batch('Primaries_'+shoulder.name);
    const leading=k.batch('Wing_leading_edge_'+shoulder.name);
    k.bough(leading,[[0,0,.04],[s*.22,.044,.09],[s*.46,.087,.10],[s*.55,.088,.07]],[.041,.034,.024,.013],0xaab9b8,0xd8dfd9,9,9);
    // Contiguous airfoil behind the leading edge fills the shoulder-to-wrist web.
    const web=[];
    for(let j=0;j<=15;j++){
      const f=j/15,span=s*.55*f,h=.01+.085*f;
      const leadingZ=.10+.025*Math.sin(Math.PI*f),trailingZ=-.185+.095*f;
      web.push([cover.vert(k.vec(span,h+.009,leadingZ),0xd4dcd7),cover.vert(k.vec(span,h+.025,leadingZ*.42+trailingZ*.58),0xe8e7dc),cover.vert(k.vec(span,h-.012,trailingZ),0xc0cdcb)]);
    }
    for(let j=1;j<web.length;j++)for(let n=0;n<2;n++){cover.tri(web[j-1][n],web[j][n],web[j-1][n+1]);cover.tri(web[j-1][n+1],web[j][n],web[j][n+1]);}
    for(let j=0;j<14;j++){
      const u=j/13,at=k.vec(s*(.028+.47*u),.015+.076*u,.085+.026*Math.sin(u*Math.PI)),tip=k.vec(s*(.125+.49*u),-.043+.10*u,-.246+.059*u+.011*Math.sin(6*u));
      feather(k,cover,at,tip,.061-.011*u,s*.011,0xf4f2e7,k.mix(0xb5c2c4,0x899a9e,u*.62),true);
      feather(k,cover,at.clone().add(k.vec(0,.018,.007)),at.clone().lerp(tip,.61).add(k.vec(0,.008,0)),.050,s*.01,0xfaf5e8,0xd8dfda,true);
    }
    for(let j=0;j<10;j++){
      const u=j/9,at=k.vec(s*(.005+.159*u),.009+.025*u,.061-.048*u);
      const tip=k.vec(s*(.19+.37*Math.sin(1.38*u)),.045+.084*u,-.219+.129*u+.047*u*u);
      feather(k,primary,at,tip,.062-.023*u,s*.022,0xd0d7d4,k.mix(0x657378,0x1c2635,.38+.62*u),true,true);
    }
    k.bough(primary,[[0,.01,.075],[s*.14,.042,.085],[s*.27,.066,.069]],[.021,.013,.003],0xb9c5c2,0xcbd1c9,8,6);
    leading.finish(shoulder);cover.finish(shoulder);primary.finish(wingtip);
    tracks.push(quatTrack(T,shoulder.name,k.vec(0,0,1),[.045,.40,.035,-.49,.045].map(a=>a*s),times));
    tracks.push(quatTrack(T,wingtip.name,k.vec(0,0,1),[.05,.20,.20,-.25,.05].map(a=>a*s),times));
  }
  tracks.push(new T.VectorKeyframeTrack(body.name+'.position',times,[0,0,0,0,.022,0,0,.010,.010,0,-.020,.004,0,0,0]));
  g.animations=[new T.AnimationClip('Crane_wingbeat',d.period,tracks)];return g;
}
function maple(k,leaves,veins,scale,palette,phase){
  // Japanese maple blade with seven pointed lobes, doubly-toothed margins and raised veins.
  const base=k.vec(0,.006,-.22*scale),center=leaves.vert(base,palette[0]),perimeter=[];
  const lobes=[[-2.18,.44],[-1.48,.74],[-.76,.93],[0,1.13],[.76,.89],[1.48,.70],[2.18,.42]];
  function polar(a,r){return k.vec(Math.sin(a)*r*scale,.060*scale*Math.sin(a*1.8+phase)*r+.037*scale*r*r,base.z+Math.cos(a)*r*scale);}
  for(let i=0;i<lobes.length;i++){
    const [a,r]=lobes[i];
    for(const [delta,ratio] of [[-.34,.25],[-.28,.45],[-.24,.40],[-.19,.64],[-.15,.55],[-.1,.77],[0,1],[.10,.71],[.15,.58],[.19,.65],[.23,.48],[.27,.52],[.33,.28]]){
      const q=polar(a+delta,r*ratio),c=k.mix(palette[1],palette[2],.31+.54*ratio+.10*Math.sin(a*4+phase));perimeter.push(leaves.vert(q,c));
    }
    k.bough(veins,[base,polar(a,r*.55),polar(a,r*.92)],[scale*.014,scale*.008,scale*.0015],palette[0],palette[2],5,5);
  }
  for(let j=1;j<perimeter.length;j++)leaves.tri(center,perimeter[j],perimeter[j-1]);
  k.bough(veins,[[.038*scale,.018*scale,-.63*scale],[0,.029*scale,-.43*scale],base],[.021*scale,.019*scale,.012*scale],0x713f2a,0xaf6e3b,6,6);
}
export function driftingLeaves(T,d){
  const k=createKit(T),g=new T.Group(),rng=seeded(d.seed),tracks=[];g.name=d.name;
  for(let i=0;i<d.leaves;i++){
    const obj=new T.Group();obj.name='Turning_maple_'+i;g.add(obj);
    const leaf=k.batch('Lobed_lamina_'+i),vein=k.batch('Petiole_and_veins_'+i);
    maple(k,leaf,vein,d.leafSize*(.86+.25*rng()),i%2===0?d.palette:[0x8b4127,0xbd4a25,0xf18b3e],i*.89);leaf.finish(obj);vein.finish(obj);
    const times=[],pos=[],rot=[],size=[],a=rng()*6.28,phase=(i+.37)/d.leaves,ox=(rng()-.5)*d.width*.55,oz=(rng()-.5)*d.width*.37;
    for(let j=0;j<=120;j++){
      const t=(j/120+phase)%1,fade=Math.min(1,t*10,(1-t)*10),angle=a+t*6.283;
      const p=k.vec(ox+d.width*(.67*t-.34)+.17*Math.sin(angle*2),d.fall*(1-t)+.04*Math.sin(3*angle),oz+.19*Math.cos(2*angle));
      const q=new T.Quaternion().setFromEuler(new T.Euler(.55+.89*Math.sin(angle*2),angle,.63*Math.cos(angle*3),'YXZ'));
      times.push(d.period*j/120);pos.push(p.x,p.y,p.z);
      if(j&&rot.slice(-4).reduce((v,prev,n)=>v+prev*[q.x,q.y,q.z,q.w][n],0)<0)q.set(-q.x,-q.y,-q.z,-q.w);
      rot.push(q.x,q.y,q.z,q.w);size.push(fade,fade,fade);
    }
    obj.position.set(...pos.slice(0,3));obj.quaternion.set(...rot.slice(0,4));obj.scale.set(...size.slice(0,3));
    tracks.push(new T.VectorKeyframeTrack(obj.name+'.position',times,pos),new T.QuaternionKeyframeTrack(obj.name+'.quaternion',times,rot),new T.VectorKeyframeTrack(obj.name+'.scale',times,size));
  }g.animations=[new T.AnimationClip('Autumn_descent',d.period,tracks)];return g;
}
