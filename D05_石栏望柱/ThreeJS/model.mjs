import {workshop} from '../../ThreeJS共享/site-craft.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  // The aperture passes through both faces of the shaft to accept a rail tenon.
  for(const [w,y,h] of [[.44,.052,.104],[.38,.148,.088],[.33,.233,.082]])
    k.box('light',0,y,0,w,h,w);
  k.box('stone',0,.438,0,.27,.332,.27);
  for(const z of [-.104,.104])k.box('stone',0,.684,z,.27,.16,.062);
  k.box('stone',0,.817,0,.27,.106,.27);
  k.box('cool',0,.918,0,.31,.096,.31);
  k.box('light',0,.99,0,.35,.048,.35);
  return k.finish('D05');
}

export const presentation = {background:0xc9d2d1, floorColor:0x929b95, studioLightScale:.82};
