import {workshop} from '../../ThreeJS共享/site-craft.mjs';
import {railing} from '../../ThreeJS共享/site-rail.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  const points=[[-3.4,0,0],[-1.7,0,0],[0,0,0],[0,0,-1.7],[0,0,-3.4]];
  railing(k,points,{s:1,panels:true});
  return k.finish('D04');
}

export const presentation = {background:0xc9d2d1, floorColor:0x929b95, studioLightScale:.82};
