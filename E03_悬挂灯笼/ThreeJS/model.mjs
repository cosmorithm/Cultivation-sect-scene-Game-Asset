import {workshop} from '../../ThreeJS共享/site-craft.mjs';
import {lampHead} from '../../ThreeJS共享/site-lamps.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  // Hook at the top of the fitting, soft amber paper below.
  lampHead(k,0,.20,0,.31,.65);
  k.lathe('bronze',0,0,0,[[0,0],[.033,.033],[.044,.108],[.095,.13],[.11,.165],[.14,.2],[0,.21]],16);
  k.rod('gold',[[0,1.17,0],[0,1.22,0]],.025,8,false);
  const loop=new T.TorusGeometry(.070,.014,7,24);
  k.add(loop,'bronze',0,1.26,0);
  k.cylinder('gold',0,1.405,0,.019,.019,.157,12);
  k.cylinder('bronze',0,1.52,0,.12,.068,.08,16);
  k.box('gold',0,1.577,0,.28,.035,.25);
  return k.finish('E03');
}
