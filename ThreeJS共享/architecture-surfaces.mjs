// Hand-scaled seamless surface families, shared by the architecture and its loose components.
const families = {
  lacquer:'lacquer',heartwood:'timber',walnut:'timber',teal:'lacquer',
  glaze:'glaze',tileRound:'glaze',shadowTile:'glaze',
  bronze:'metal',gold:'metal',stone:'stone',stonePale:'stone',carving:'stone',lime:'lime',silk:'silk'
};
const collections=new WeakMap();
const tau=2*Math.PI;
function hash(x,y){
  let v=Math.imul(x+193,374761393)+Math.imul(y+97,668265263);
  v=Math.imul(v^(v>>>13),1274126177);return ((v^(v>>>16))>>>0)/4294967295;
}
function smooth(v){return v*v*(3-2*v);}
function lattice(u,v,nx,ny){
  const x=u*nx,y=v*ny,ix=Math.floor(x),iy=Math.floor(y),fx=smooth(x-ix),fy=smooth(y-iy);
  const at=(a,b)=>hash(((ix+a)%nx+nx)%nx,((iy+b)%ny+ny)%ny);
  return (at(0,0)*(1-fx)+at(1,0)*fx)*(1-fy)+(at(0,1)*(1-fx)+at(1,1)*fx)*fy;
}
const byte=v=>Math.max(0,Math.min(255,Math.round(v*255)));
export function surfaceFamily(tone){return families[tone];}
export function makeSurface(T,family){
  if(!family)return {};
  if(!collections.has(T))collections.set(T,new Map());
  const cache=collections.get(T);
  if(cache.has(family))return cache.get(family);
  const size=192,albedo=new Uint8Array(size*size*4),orm=albedo.slice();
  for(let j=0;j<size;j++)for(let i=0;i<size;i++){
    const u=i/size,v=j/size,grain=hash(i,j);
    const broad=lattice(u,v,5,5),fine=lattice(u,v,49,49);
    let tint,red=0,blue=0,rough;
    switch(family){
      case 'timber':case 'lacquer': {
        const twist=.039*Math.sin(tau*v)+.054*(lattice(u,v,3,3)-.5);
        const fibre=lattice(u+twist,v,64,5);
        const ring=.5+.5*Math.sin(tau*(9*u+1.20*broad+.38*Math.sin(tau*v)));
        const latewood=ring**6;
        const raw=family==='timber';
        tint=.88+.105*fibre+.035*broad-.145*latewood+.022*grain;
        if(!raw)tint=.67+.34*tint;
        red=(1-fibre)*(raw?.021:.012);blue=-red*.7;
        rough=.74+.16*fibre+.09*latewood;break;
      }
      case 'glaze':{
        const flow=lattice(u+.02*Math.sin(tau*v),v,19,3);
        tint=.87+.09*flow+.043*broad+.022*grain;
        blue=.018*(1-flow);red=-.012*(1-flow);
        rough=.70+.17*flow+.11*fine;break;
      }
      case 'metal':{
        const m=.60*broad+.40*fine,patina=Math.max(0,(m-.49)*2);
        tint=.91+.055*fine-.10*patina+.030*grain;
        red=-patina*.060;blue=.024*patina;rough=.66+.31*m;break;
      }
      case 'silk':{
        const warp=.5+.5*Math.cos(48*tau*u),weft=.5+.5*Math.cos(54*tau*v);
        tint=.94+.025*broad+.019*warp+.012*weft;rough=.91+.07*fine;break;
      }
      case 'lime':{
        tint=.89+.068*broad+.042*fine+.022*grain;rough=.87+.11*fine;break;
      }
      default:{
        const grainCut=grain>.973?.085:grain<.045?-.115:0;
        const mineral=lattice(u+.04*Math.sin(tau*v),v,28,12);
        tint=.83+.08*broad+.061*fine+.046*mineral+.029*grain+grainCut;
        red=(broad-.4)*.025;blue=-red;rough=.83+.15*fine;
      }
    }
    const off=(j*size+i)*4;
    albedo.set([byte(tint+red),byte(tint),byte(tint+blue),255],off);
    orm.set([255,byte(rough),255,255],off);
  }
  function tex(bytes,colour){
    const map=new T.DataTexture(bytes,size,size);map.name=family+(colour?'_pigment':'_roughness');
    map.colorSpace=colour?T.SRGBColorSpace:T.NoColorSpace;
    map.wrapS=map.wrapT=T.RepeatWrapping;map.magFilter=T.LinearFilter;map.minFilter=T.LinearMipmapLinearFilter;
    map.generateMipmaps=true;map.needsUpdate=true;return map;
  }
  const packed=tex(orm,false),maps={map:tex(albedo,true),roughnessMap:packed,metalnessMap:packed};
  cache.set(family,maps);return maps;
}
