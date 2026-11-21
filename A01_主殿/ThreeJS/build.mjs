// Node build entry. GLTFExporter accepts RGBA DataTextures through a 2D canvas.
// This small PNG adapter only implements the pixel-buffer operations used here.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {PNG} from 'pngjs';
import * as T from 'three';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {makeMaterials} from './materials.mjs';
import {buildStone} from './stone.mjs';
import {buildTimber} from './timber.mjs';
import {buildRoofs} from './roof.mjs';

class PixelCanvas {
  getContext() {
    return {putImageData: image => { this.rgba = image.data; }};
  }
  async convertToBlob() {
    const data = PNG.sync.write({width:this.width,height:this.height,data:Buffer.from(this.rgba)});
    return new Blob([data],{type:'image/png'});
  }
}
globalThis.OffscreenCanvas = PixelCanvas;
globalThis.ImageData = class { constructor(data,width,height) { Object.assign(this,{data,width,height}); } };
globalThis.FileReader = class {
  async readAsArrayBuffer(blob) {
    this.result = await blob.arrayBuffer();
    this.onloadend?.();
  }
};

const root = new T.Group();
root.name = 'A01_MainHall';
const m = makeMaterials(T);
buildStone(T,root,m);
buildTimber(T,root,m);
buildRoofs(T,root,m);
root.updateMatrixWorld(true);
const box = new T.Box3().setFromObject(root);
const seen = new Set();
let triangles=0, meshes=0;
root.traverse(obj=>{
  if(!obj.isMesh) return;
  meshes++;
  const g=obj.geometry, p=g.getAttribute('position');
  if(!p || !g.getAttribute('normal')) throw Error('Missing position/normal: '+obj.name);
  if(!g.getAttribute('uv')) {
    // Dominant-plane mapping in metres for secondary ornaments.
    const uv=new Float32Array(p.count*2), n=g.getAttribute('normal');
    for(let i=0; i<p.count; i++){
      const top=Math.abs(n.getY(i))>.7, side=Math.abs(n.getX(i))>Math.abs(n.getZ(i));
      uv[i*2]=(top || !side ? p.getX(i):p.getZ(i))/2;
      uv[i*2+1]=(top?p.getZ(i):p.getY(i))/2;
    }
    g.setAttribute('uv',new T.BufferAttribute(uv,2));
  }
  triangles+=(g.index?g.index.count:p.count)/3;
  seen.add(obj.material);
});
const bytes=await new GLTFExporter().parseAsync(root,{binary:true,onlyVisible:true});
const output=process.argv[2]||fileURLToPath(new URL('../A01_MainHall.glb',import.meta.url));
await fs.mkdir(path.dirname(path.resolve(output)),{recursive:true});
await fs.writeFile(output,Buffer.from(bytes));
console.log(JSON.stringify({output,bytes:bytes.byteLength,meshes,triangles,materials:seen.size,min:box.min.toArray(),max:box.max.toArray()},null,2));
