// A02's geometry follows its current colour sheet and leaves the original bay grid intact.
export function returnFret(s,x,y,z,w,h) {
  const edge=.072,t=Math.max(.024,Math.min(.045,w*.024));
  s.box('silk',x,y,z-.045,w,h,.064);
  s.box('walnut',x,y-h*.5-.037,z+.032,w+.15,.073,.184);
  for(const sign of [-1,1]){
    s.box('heartwood',x+sign*(w-edge)*.5,y,z,w<1.0?.055:edge,h,.15);
    s.box('heartwood',x,y+sign*(h-edge)*.5,z,w,edge,.15);
    s.box('bronze',x+sign*(w*.5-edge*.94),y,z+.084,.011,h-.15,.018);
    s.box('bronze',x,y+sign*(h*.5-edge*.94),z+.084,w-.15,.011,.018);
  }
  const pw=w-2*edge,ph=h-2*edge;
  function meander(points,sx,sy) {
    for(let i=1;i<points.length;i++){
      const [ax,ay]=points[i-1],[bx,by]=points[i];
      const cx=x+sx*(ax+bx)*pw/2,cy=y+sy*(ay+by)*ph/2;
      s.box('walnut',cx,cy,z+.052,Math.abs(bx-ax)*pw+t,Math.abs(by-ay)*ph+t,t*1.8);
    }
  }
  for(const sx of [-1,1])for(const sy of [-1,1]){
    meander([[.50,.40],[.34,.40],[.34,.26],[.135,.26],[.135,.085],[0,.085]],sx,sy);
    meander([[.40,.50],[.40,.34],[.26,.34],[.26,.135],[.085,.135],[.085,0]],sx,sy);
    meander([[.46,.19],[.46,.46],[.19,.46]],sx,sy);
    meander([[.49,.19],[.195,.19],[.195,.49]],sx,sy);
    meander([[.305,.305],[.305,.20]],sx,sy);
    meander([[0,.415],[.065,.415],[.065,.305],[.183,.305],[.183,.415],[.262,.415]],sx,sy);
    meander([[.415,0],[.415,.065],[.305,.065],[.305,.183],[.415,.183],[.415,.262]],sx,sy);
    meander([[0,.185],[.055,.185],[.055,.055],[.185,.055],[.185,0]],sx,sy);
  }
}
export function mountainGables(s,{width,depth,eave,rise,ridge,breakV,lift}){
  const halfZ=depth*.5, xR=ridge*.5;
  function edge(u) {
    const v=1-u;
    return [halfZ*u,eave+rise*(.46*v+.54*v*v)+lift*u*u];
  }
  const top=1-breakV, baseY=eave+rise*(.46*breakV+.54*breakV*breakV);
  for(const sx of [-1,1]){
    s.local([sx*(xR-.032),0,0],sx*Math.PI/2,()=>{
      const panel=[];
      for(let i=-10;i<=10;i++){
        const sign=Math.sign(i),[z,y]=edge(top*Math.abs(i)/10);
        panel.push([sign*z,y-.018]);
      }
      panel.push([halfZ*top,baseY-.09],[-halfZ*top,baseY-.09]);
      s.profile('heartwood',panel,.20,0);
      // Narrow board seams make the recessed panel read in raking light.
      for(let i=-4;i<=4;i++){
        const xx=i*halfZ*top/5;
        const height=edge(Math.abs(xx)/halfZ)[1]-baseY-.14;
        if(height>0)s.box('walnut',xx,baseY+.04+height/2,.110,.023,height,.024);
      }
      for(const dir of [-1,1]){
        const curve=Array.from({length:15},(_,i)=>{
          const [z,y]=edge(top*i/14);return [dir*z,y-.02,.16];
        });
        s.rod('shadowTile',curve,.096,7);
        s.rod('bronze',curve.map(([x,y,z])=>[x,y+.078,z+.018]),.050,7);
        s.rod('lacquer',curve.map(([x,y,z])=>[x,y-.137,z-.002]),.095,8);
        s.rod('gold',curve.map(([x,y,z])=>[x,y-.195,z+.07]),.022,6);
      }
      s.box('walnut',0,baseY-.002,.11,2*halfZ*top+.16,.135,.25);
      s.box('bronze',0,baseY+.048,.248,2*halfZ*top+.06,.046,.03);
      s.scroll('bronze',0,baseY+.18,.13,halfZ*top*1.22,.69,.027);
      // A short ceremonial pendant sits under the meeting of two bargeboards.
      s.profile('bronze',[[0,baseY+.13],[-.085,baseY+.26],[0,baseY+.4],[.085,baseY+.26]],.042,.18);
    });
  }
}
export function smallChiwen(s,x,y,z,sign){
  // A small paired chiwen at the tile-ridge ends with a pierced scroll and
  // three short gilded feathers picked out against the darker bronze cheek.
  s.local([x,y,z],sign>0?0:Math.PI,()=>{
    const pts=[[-.31,.02],[-.30,.15],[-.18,.20],[-.12,.29],[-.18,.37],[-.22,.47],[-.17,.53],[-.05,.51],[.01,.43],[.12,.48],[.20,.54],[.22,.46],[.18,.37],[.09,.31],[.08,.20],[.18,.12],[.24,.04],[.19,-.02],[-.09,-.07]];
    s.profile('bronze',pts,.28,0);
    for(const sz of [-1,1]){
      s.rod('gold',pts.slice(3,14).map(([a,b])=>[a,b,sz*.151]),.024,6);
      s.scroll('gold',-.01,.13,sz*.155,.31,.20,.015);
      for(let i=0;i<3;i++)s.rod('gold',[[-.105+i*.033,.28,sz*.15],[-.13+i*.038,.36,sz*.15],[-.14+i*.04,.42,sz*.145]],.012,6);
    }
  });
}
export function carvedBrackets(s){
  const xs=[-5.40,-3.60,-1.80,0,1.80,3.60,5.40];
  for(const zz of [-3.6,3.6])s.local([0,0,zz],zz<0?Math.PI:0,()=>{
    s.box('walnut',0,4.51,.04,11.50,.33,.62);
    s.box('bronze',0,4.435,.357,10.93,.026,.029);
    for(const [i,x] of xs.entries()){
      const major=i%2===0,w=major?.88:.65;
      s.local([x,4.50,.14],0,()=>{
        for(let level=0;level<3;level++){
          const spread=w*(.50+.21*level), yy=level*.16;
          const outline=[[-spread*.5,yy+.24],[-spread*.5,yy+.135],[-spread*.39,yy+.055],[-spread*.29,yy+.058],[-spread*.23,yy-.012],[spread*.23,yy-.012],[spread*.29,yy+.058],[spread*.39,yy+.055],[spread*.5,yy+.135],[spread*.5,yy+.24],[spread*.34,yy+.24],[spread*.24,yy+.154],[-spread*.24,yy+.154],[-spread*.34,yy+.24]];
          s.profile(level===1?'teal':'heartwood',outline,.33,.24+level*.15);
          for(const dir of [-1,1]){
            s.box('lacquer',dir*spread*.38,yy+.236,.25+level*.15,.14,.094,.41);
            s.box('bronze',dir*spread*.38,yy+.211,.464+level*.15,.097,.031,.022);
          }
        }
        s.box('teal',0,.574,.56,w*1.12,.115,.40);
        s.scroll('bronze',0,.534,.782,w*.67,.094,.013);
      });
    }
    for(const x of [-3.6,0,3.6]){
      s.box('teal',x,4.47,.375,1.29,.20,.089);
      s.rod('bronze',[[-.65,4.54,.432],[-.57,4.58,.432],[.57,4.58,.432],[.65,4.54,.432]].map(([dx,yy,z])=>[x+dx,yy,z]),.015,6);
      s.scroll('gold',x,4.417,.426,1.00,.169,.014);
    }
  });
}
