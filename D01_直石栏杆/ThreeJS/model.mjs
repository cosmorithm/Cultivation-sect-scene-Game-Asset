import {workshop} from '../../ThreeJS共享/site-craft.mjs';
import {railing} from '../../ThreeJS共享/site-rail.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  railing(k,[[-1.32,0,0],[1.32,0,0]],{s:1});
  return k.finish('D01');
}
