import {workshop} from '../../ThreeJS共享/site-craft.mjs';
import {railing} from '../../ThreeJS共享/site-rail.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  const run=4.60,rise=1.56;
  railing(k,[0,.5,1].map(t=>[run*(t-.5),rise*t,0]),{s:1});
  return k.finish('D03');
}
