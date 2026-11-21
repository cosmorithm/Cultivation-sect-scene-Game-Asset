import {workshop} from '../../ThreeJS共享/site-craft.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  const total=3.82,arm=1.02;
  k.box('cool',0,.074,0,.64,.148,.64);
  k.box('light',0,.203,0,.54,.13,.54);
  k.cylinder('stone',0,.365,0,.20,.29,.21,8,Math.PI/8);
  k.cylinder('bronze',0,.487,0,.125,.155,.08,12);
  k.cylinder('red',0,(.50+total)/2,0,.061,.10,total-.50,20);
  for(const y of [.55,.72,3.28,3.52,3.73])k.cylinder('gold',0,y,0,y<1?.109:.079,y<1?.109:.079,.05,16);
  k.lathe('gold',0,total-.04,0,[[0,0],[.091,0],[.082,.065],[.025,.105],[.05,.165],[0,.29]],12);
  k.rod('wood',[[0,3.48,0],[arm,3.48,0]],.046,12,false);
  k.rod('gold',[[0,3.22,0],[.25,3.46,0]],.02,8,false);
  for(const x of [.31,.86])k.add(new T.TorusGeometry(.048,.009,7,20),'bronze',x,3.433,0);
  k.cylinder('gold',arm,3.48,0,.065,.065,.085,8);
  return k.finish('E04');
}
