import {workshop,reliefCloud} from '../../ThreeJS共享/site-craft.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  const width=2.30,height=.19;
  k.box('stone',0,height*.48,0,width,height*.8,.18);
  for(const x of [-1,1])k.box('cool',x*(width/2+.055),.075,0,.11,.082,.084);
  k.bar('light',[-width/2,.17,0],[width/2,.17,0],.222,.12);
  k.rod('light',[[-width/2,.205,0],[width/2,.205,0]],.087,12,false);
  for(const side of [-1,1])reliefCloud(k,0,.09,side*.095,1.85,.14,0);
  return k.finish('D07');
}
