import {workshop} from '../../ThreeJS共享/site-craft.mjs';
import {railing} from '../../ThreeJS共享/site-rail.mjs';

export function buildAsset(T) {
  const k = workshop(T);
  const radius=4.2, sweep=Math.PI*.55, divisions=4;
  const path=Array.from({length:divisions+1},(_,i)=>{
    const a=sweep*(i/divisions-.5);
    return [radius*Math.sin(a),0,radius*(1-Math.cos(a))];
  });
  railing(k,path,{s:1,panels:true});
  return k.finish('D02');
}
